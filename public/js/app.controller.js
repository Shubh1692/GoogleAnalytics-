angular.module('googleAnalyticsModule')
    .controller('googleAnalyticsController', _googleAnalyticsController)
    .filter('liveUserSort', _liveUserSort)
    .filter('dateMenuSort', _dateMenuSort);

_googleAnalyticsController.$inject = ['$timeout', 'googleAnalyticsService', '$window', '$document', 'NODE_WEB_API', '$interval', 'VIEWING_BY_SOURCE', 'dataPassingService', 'VIEWING_BY_TIME', 'REAL_TIME_API_TIME_INTERVAL', 'SCALING_INDEX', 'MAX_MENU_COUNT', 'GOAL_COMPLETE_ICON_PATH', '$filter', 'GOAL_EVENT_NAME', 'NODE_WEB_API_DEMO'];
_liveUserSort.$inject = ['_'];
function _googleAnalyticsController($timeout, googleAnalyticsService, $window, $document, NODE_WEB_API, $interval, VIEWING_BY_SOURCE, dataPassingService, VIEWING_BY_TIME, REAL_TIME_API_TIME_INTERVAL, SCALING_INDEX, MAX_MENU_COUNT, GOAL_COMPLETE_ICON_PATH, $filter, GOAL_EVENT_NAME, NODE_WEB_API_DEMO) {
    var googleAnalyticsCtrl = this,
        padding = 0, clusterPadding = 2, clusters = new Array(3),
        intervalInstance,
        menuObjectInstanceName,
        fill = d3.scale.category20(),
        color = 1,
        nodes = [],
        maxRadius = 32,
        mainSvgHeight = $window.innerHeight * 0.78,
        mainSvgWidth = $window.innerWidth,
        center = [{ x: 250, y: 250, exteraX: 250, exteraY: 250 }, { x: ((mainSvgWidth * 0.7)/2), y: (mainSvgHeight * 0.30), exteraX: ((((mainSvgWidth * 0.7)/2) - 250)* (50/36)) + 250 , exteraY:  ((((mainSvgHeight * 0.30)) - 250)* (50/36)) + 250 }, { x: (mainSvgWidth * 0.85), y: (mainSvgHeight * 0.30), exteraX: ((((mainSvgWidth * 0.85)) - 250)* (50/36)) + 250, exteraY: ((((mainSvgHeight * 0.30)) - 250)* (50/36)) + 250 }, { x: 250, y: 500, exteraX: (mainSvgHeight * 0.70), exteraY: ((((mainSvgHeight * 0.70)) - 250)* (50/36)) + 250 }],
        svg = d3.select("#main_svg").append("svg")
            .attr("width", mainSvgWidth)
            .attr("height", mainSvgHeight)
            .attr("class", 'svg-main-window')
            .attr("border", 1),
        force = d3.layout.force()
            .nodes(nodes)
            .size([500, 500])
            .gravity(.2)
            .charge(-30)
            .friction(0.0002)
            .on("tick", _tick)
            .on("end", function (e) {
                console.log('e', e)
            })
            .start(),
        drag = force.drag()
            .on("dragstart", function () {
                console.log('dragstart')
            })
            .on("dragend", function () {
                console.log('end')
            }),
        node = svg.selectAll("circle"),
        div = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0),
        defs = svg.append("defs").append("pattern").attr("id", 'image').attr("width", 2).attr("height", 2)
            .append('image')
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 15)
            .attr("height", 15)
            .attr("xlink:href", GOAL_COMPLETE_ICON_PATH);
    // Controller Functions 
    googleAnalyticsCtrl.startTime = _startTime;
    googleAnalyticsCtrl.setColor = _setColor;
    // Default Values or Controller Variables
    googleAnalyticsCtrl.onsiteUser = 0;
    googleAnalyticsCtrl.totalUserWithinTime = 0;
    googleAnalyticsCtrl.bounceRate = 0 + '%';
    googleAnalyticsCtrl.exitRate = 0 + '%';
    googleAnalyticsCtrl.avgSessionDuration = 0 + 'min';
    googleAnalyticsCtrl.userInfoArray = [];
    googleAnalyticsCtrl.showUserInfo = true;
    googleAnalyticsCtrl.displayTime = {};
    googleAnalyticsCtrl.menuList = [];
    googleAnalyticsCtrl.sourceArray = VIEWING_BY_SOURCE;
    googleAnalyticsCtrl.selectedSource = VIEWING_BY_SOURCE[0];
    googleAnalyticsCtrl.timeArray = VIEWING_BY_TIME;
    googleAnalyticsCtrl.selectedTime = VIEWING_BY_TIME[0];
    googleAnalyticsCtrl.sourceSelection = _sourceSelection;
    googleAnalyticsCtrl.getAnalyticsDataByTime = _getAnalyticsDataByTime;
    googleAnalyticsCtrl.goalOneDivWidth = mainSvgWidth - (mainSvgWidth * 0.7);
    googleAnalyticsCtrl.footerHeight = (mainSvgHeight * 0.15);
    googleAnalyticsCtrl.maxMenuCount = MAX_MENU_COUNT;
    googleAnalyticsCtrl.userInfoTopPostion = mainSvgHeight * 0.65;
    googleAnalyticsCtrl.userDataForRightMenu = {};
    googleAnalyticsCtrl.demoApiFlag = NODE_WEB_API_DEMO.DUMMY_API_DEFAULT_FLAG;

    //Init Functions or Variables
    var forceInterVal = $interval(force.start, 1);
    menuObjectInstanceName = VIEWING_BY_SOURCE[0].name;
    _getAnalyticsDataByTime(googleAnalyticsCtrl.selectedTime);
    // For Time Display
    function _startTime() {
        var today = new Date();
        today = new Date(today).toUTCString();
        var day = today.split(' ').slice(0, 4).join(' ');
        var time = today.split(' ').slice(4, 5).join(' ');
        googleAnalyticsCtrl.displayTime.day = day;
        googleAnalyticsCtrl.displayTime.time = time;
        $timeout(_startTime, 1000);
    }
    // For Get API Data
    function _callRealtimeDataAPI(changeFlag) {
        changeFlag = angular.isUndefined(changeFlag) ? true : false;
        if (!googleAnalyticsCtrl.demoApiFlag)
            googleAnalyticsService.serverRequest(NODE_WEB_API.REAL_TIME_DATA_API + '?dimensionsId=' + googleAnalyticsCtrl.selectedSource.value, 'GET')
                .then(_displayApiData);
        else
            googleAnalyticsService.serverRequest(NODE_WEB_API_DEMO.REAL_TIME_DATA_API + '?dimensionsId=' + googleAnalyticsCtrl.selectedSource.value + '&changeFlag=' + changeFlag, 'GET')
                .then(_displayApiData);
    }

    // For Source Selection Change 
    function _sourceSelection(selectData) {
        d3.selectAll('circle')
            .remove();
        color = 1;
        dataPassingService.menuObj[menuObjectInstanceName] = {};
        googleAnalyticsCtrl.getAnalyticsDataByTime(googleAnalyticsCtrl.selectedTime);
        menuObjectInstanceName = selectData.name;
        $interval.cancel(intervalInstance);
    }
    // For Display Real Time API Data
    function _displayApiData(res) {
        var exitArray = [];
        googleAnalyticsCtrl.onsiteUser = res.totalsForAllResults['rt:activeUsers'];
        if (res.rows && res.rows.length !== 0) {
            if (!dataPassingService.menuObj[menuObjectInstanceName]) {
                dataPassingService.menuObj[menuObjectInstanceName] = {};
            }
            _.each(res.rows, function (dataValue, dataKey) {
                if (!dataPassingService.menuObj[menuObjectInstanceName][dataValue[0]]) {
                    dataPassingService.menuObj[menuObjectInstanceName][dataValue[0]] = {}
                    dataPassingService.menuObj[menuObjectInstanceName][dataValue[0]].name = dataValue[0];
                    dataPassingService.menuObj[menuObjectInstanceName][dataValue[0]].data = [];
                    dataPassingService.menuObj[menuObjectInstanceName][dataValue[0]].color = color; color++;
                    dataPassingService.menuObj[menuObjectInstanceName][dataValue[0]]['x'] = 100;
                    dataPassingService.menuObj[menuObjectInstanceName][dataValue[0]]['y'] = 50;
                }
                var newCricleIndex = nodes.findIndex(function (obj) {
                    return (obj.menuName === dataValue[0]);
                });
                if (newCricleIndex === -1) {
                    _createSubNodes(dataValue, 0, 4)
                }
                _enterUser(dataPassingService.menuObj[menuObjectInstanceName], dataValue);
            });
            _.each(node[0], function (existDataValue, existDataKey) {
                if (existDataValue.getAttribute('remove') === 'no' && !existDataValue.getAttribute('sub-menu-flag')) {
                    var exitExits = _.findIndex(res.rows, function (dataValue) {
                        return (parseInt(existDataValue.getAttribute('userId')) === parseInt(dataValue[2]));
                    })
                    if (exitExits === -1)
                        _exitUser(existDataValue, existDataKey);
                }
            })
        } else {
            _.each(node[0], function (existDataValue, existDataKey) {
                if (existDataValue.getAttribute('remove') === 'no')
                    _exitUser(existDataValue, existDataKey);
            })
        }
        googleAnalyticsCtrl.menuList = dataPassingService.menuObj[menuObjectInstanceName];
    };

    function _createSubNodes(nodeValue, userValue, radiusValue) {
        nodes.push({
            x: center[3].x,
            y: center[3].y,
            radius: radiusValue,
            color: dataPassingService.menuObj[menuObjectInstanceName][nodeValue[0]].color,
            cluster: 2,
            id: 3,
            menuName: nodeValue[0],
            user: userValue
        });
        clusters[2] = {
            x: center[3].x,
            y: center[3].y,
            radius: radiusValue,
            cluster: radiusValue
        };
        node = node.data(nodes);
        node.enter().append("circle")
            .attr("cx", function (d) { return d.x; })
            .attr("cy", function (d) { return d.y; })
            .attr("r", 4)
            .attr("id", nodes.length - 1)
            .style("fill", function (d) {
                return d3.rgb(fill(d.color));
            })
            .attr("class", "node sub_circle")
            .style("stroke", function (d) { return d3.rgb(fill(d.color)).darker(2); })
            .attr("user", function (d) {
                return d.user;
            })
            .attr("show-menu", function (d, i) {
                return d.name
            })
            .attr("sub-menu-flag", true)
            .attr("remove", "no")
            .attr("name", function (d) {
                return d.menuName
            })
            .call(drag);
        force.start();
    }
    // For Main Gravity Function
    function gravity(alpha) {
        return function (d) {
            var mergeNode = svg.selectAll("circle[name='" + d.name + "']");
            if (d.cluster === 2 && !d.menuName && mergeNode) {
                d.reachedX = (mergeNode[0][0].getAttribute("cx") - 250) / 0.72 + 250;
                d.reachedY = (mergeNode[0][0].getAttribute("cy") - 250) / 0.72 + 250;
                d.y += (d.reachedY - d.y) * alpha;
                d.x += (d.reachedX - d.x) * alpha;
            } else {
                d.y += (center[d.id].exteraY - d.y) * alpha;
                d.x += (center[d.id].exteraX - d.x) * alpha;
            }
        };
    }
    // For Main Tick Function
    function _tick(e) {
        if (nodes.length) {
            node.each(_handelCluster(0.1 * e.alpha * e.alpha))
                .each(_handelCollides(.5))
                .each(gravity(.5 * e.alpha))
                .transition()
                .ease('linear')
                .duration(1) // JSON.parse(d3Ctrl.speed)
                .attr('cx', function (d) { return d.x; })
                .attr('cy', function (d) { return d.y; })
        }
    }
    // Resolves collisions between d and all other circles.
    function _handelCollides(alpha) {
        var quadtree = d3.geom.quadtree(nodes);
        return function (d) {
            var r = d.radius + maxRadius + Math.max(padding, maxRadius),
                nx1 = d.x - r,
                nx2 = d.x + r,
                ny1 = d.y - r,
                ny2 = d.y + r;
            quadtree.visit(function (quad, x1, y1, x2, y2) {
                if (quad.point && (quad.point !== d) && quad.point.menuName !== d.name && quad.point.name !== d.menuName) {
                    var x = d.x - quad.point.x,
                        y = d.y - quad.point.y,
                        l = Math.sqrt(x * x + y * y),
                        r = d.radius + quad.point.radius + (d.cluster === quad.point.cluster ? padding : clusterPadding);
                    if (l < r) {
                        l = (l - r) / l * alpha;
                        d.x -= x *= l;
                        d.y -= y *= l;
                        quad.point.x += x;
                        quad.point.y += y;
                    }
                    if (d.cluster === 2 && d.name && d.x <= d.reachedX + 5 && d.reachedY >= d.y - 5 && !d.remove) {
                        var mergeNode = svg.selectAll("circle[name='" + d.name + "']");
                        var user = (parseInt(mergeNode[0][0].getAttribute("user")) + 1);
                        var mergeNodeIndex = _.findIndex(nodes, function (obj) {
                            return obj.menuName === d.name;
                        });
                        var removeIndex = _.findIndex(nodes, function (obj) {
                            return parseInt(obj.userId) === parseInt(d.userId);
                        });
                        mergeNode.attr("r", function (d) {
                            nodes[mergeNodeIndex].radius = Math.log(user) * 4 + 4;
                            return Math.log(user) * 4 + 4;
                        });
                        mergeNode.attr("user", user);
                        d3.select('circle[userId="' + d.userId + '"]')
                            .remove();
                        nodes[removeIndex].remove = true;
                    }
                }
                return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
            });
        };
    }
    function _handelCluster(alpha) {
        return function (d) {
            var cluster = clusters[d.cluster];
            if (cluster === d) return;
            var x = d.x - cluster.x,
                y = d.y - cluster.y,
                l = Math.sqrt(x * x + y * y),
                r = d.radius + cluster.radius;
            if (l != r) {
                l = (l - r) / l * alpha;
                d.x -= x *= l;
                d.y -= y *= l;
                cluster.x += x;
                cluster.y += y;
            }
        };
    }
    // Enter Main User with Animation
    function _enterUser(menuObj, row) {
        var usrInfo = {};
        if (row[1] !== 'onload')
            usrInfo = googleAnalyticsService.getConvertedUserData(row[2]);
        else
            usrInfo.id = row[2];
        if (svg.selectAll('circle[userId="' + usrInfo.id + '"]')[0].length === 0 && row[1] === 'onload') {
            dataPassingService.menuObj[menuObjectInstanceName][row[0]]['data'].push({ name: row[0], color: dataPassingService.menuObj[menuObjectInstanceName][row[0]]['color'], userId: row[2] });
            dataPassingService.menuObj[menuObjectInstanceName][row[0]]['display'] = true;
            var menuIndex = _.findIndex($filter('liveUserSort')(googleAnalyticsCtrl.menuList), ['name', row[0]]);
            nodes.push({
                x: 170,
                y: (menuIndex + 1) * 20 + 10,
                cx: center[0].x,
                cy: center[0].y,
                radius: 4,
                color: dataPassingService.menuObj[menuObjectInstanceName][row[0]]['color'],
                cluster: 0,
                id: 1,
                userId: row[2],
                name: row[0]
            });
            clusters[0] = {
                x: 0,
                y: 0,
                radius: 4,
                cluster: 0
            };
            node = node.data(nodes);
            node.enter().append("circle")
                .attr("cx", function (d) { return d.x; })
                .attr("cy", function (d) { return d.y; })
                .attr("r", 4)
                .attr("id", nodes.length - 1)
                .style("fill", function (d) {
                    return d3.rgb(fill(d.color));
                })
                .style("stroke", function (d) { return d3.rgb(fill(d.color)).darker(2); })
                .attr("userId", row[2])
                .attr("show-menu", function (d, i) {
                    return d.name
                })
                .attr("remove", "no")
                .call(drag);
            force.start();
            if (!googleAnalyticsCtrl.userDataForRightMenu[googleAnalyticsService.getFormattedCurrentDate()])
                googleAnalyticsCtrl.userDataForRightMenu[googleAnalyticsService.getFormattedCurrentDate()] = {
                    onload: [],
                    date: new Date()
                };
            googleAnalyticsCtrl.userDataForRightMenu[googleAnalyticsService.getFormattedCurrentDate()].onload.unshift(row);
        } else if (svg.selectAll('circle[userId="' + usrInfo.id + '"]')[0].length && row[1] === GOAL_EVENT_NAME[0] && !svg.selectAll('circle[userId="' + usrInfo.id + '"]')[0][0].getAttribute(GOAL_EVENT_NAME[0])) {
            googleAnalyticsCtrl.userInfoArray.push(usrInfo);
            let moveIndex = _.findIndex(nodes, ['userId', usrInfo.id]);
            svg.select('#image')
                .style("fill", d3.rgb(fill(nodes[moveIndex].color)));
            d3.select('circle[userId="' + usrInfo.id + '"]')
                .style("fill", "url(#image)")
                .attr("r", 8)
                .attr('userData', JSON.stringify(usrInfo))
                .attr(GOAL_EVENT_NAME[0], 'done')
                .attr('stroke-width', '2')
                .style("stroke", function (d) { return d3.rgb(fill(d.color)); })
                .on("mouseover", function (d) {
                    if (node[0][d.index].getAttribute('userData')) {
                        var data = JSON.parse(node[0][d.index].getAttribute('userData'));
                        div.transition()
                            .duration(200)
                            .style("opacity", .9);
                        div.html(googleAnalyticsService.setTooltipView(data.userInfo))
                            .style("left", (d3.event.pageX) + "px")
                            .style("top", (d3.event.pageY - 28) + "px");
                    }
                })
                .on("mouseout", function (d) {
                    div.transition()
                        .duration(500)
                        .style("opacity", 0);
                });
            clusters[1] = {
                x: center[2].x,
                y: center[2].y,
                radius: 4,
                cluster: 1
            };
            nodes[moveIndex].cluster = 1;
            nodes[moveIndex].id = 2;
            nodes[moveIndex].radius = 8;
            if (!googleAnalyticsCtrl.userDataForRightMenu[googleAnalyticsService.getFormattedCurrentDate()]) {
                googleAnalyticsCtrl.userDataForRightMenu[googleAnalyticsService.getFormattedCurrentDate()] = {
                    date: googleAnalyticsService.getFormattedCurrentDate()
                };
                googleAnalyticsCtrl.userDataForRightMenu[googleAnalyticsService.getFormattedCurrentDate()][GOAL_EVENT_NAME[0]] = [];
            }
            if (!googleAnalyticsCtrl.userDataForRightMenu[googleAnalyticsService.getFormattedCurrentDate()][GOAL_EVENT_NAME[0]])
                googleAnalyticsCtrl.userDataForRightMenu[googleAnalyticsService.getFormattedCurrentDate()][GOAL_EVENT_NAME[0]] = [];
            googleAnalyticsCtrl.userDataForRightMenu[googleAnalyticsService.getFormattedCurrentDate()][GOAL_EVENT_NAME[0]].unshift(row);
        }
    }
    // Exit User with Animation
    function _exitUser(dataValueForExit, dataKeyForExit) {
        var removeIndex = _.findIndex(nodes, function (obj) {
            return parseInt(obj.userId) === parseInt(dataValueForExit.getAttribute('userId'));
        });
        var mergeNode = svg.selectAll("circle[name='" + dataValueForExit.getAttribute('show-menu') + "']");
        if (mergeNode[0][0]) {
            var dataIndex = _.findIndex(dataPassingService.menuObj[menuObjectInstanceName][dataValueForExit.getAttribute('show-menu')]['data'], function (menuData) {
                return parseInt(dataValueForExit.getAttribute('userId')) === parseInt(menuData.userId);
            });
            dataPassingService.menuObj[menuObjectInstanceName][dataValueForExit.getAttribute('show-menu')]['data'].splice(dataIndex, 1);

            d3.select('circle[userId="' + dataValueForExit.getAttribute('userId') + '"]')
                .attr("remove", "yes")
            clusters[2] = {
                x: center[3].x,
                y: center[3].y,
                radius: 4,
                cluster: 2
            };
            nodes[removeIndex].cluster = 2;
            nodes[removeIndex].id = 3;
            nodes[removeIndex].reachedX = (mergeNode[0][0].getAttribute("cx") - 250) / 0.72 + 250;
            nodes[removeIndex].reachedY = (mergeNode[0][0].getAttribute("cy") - 250) / 0.72 + 250;
        }
    }

    // For All Time Data API Calling
    function _getAnalyticsDataByTime(selectedTime) {
        if (!googleAnalyticsCtrl.demoApiFlag)
            googleAnalyticsService.serverRequest(NODE_WEB_API.ALL_TIME_DATA_API + '?startDate=' + selectedTime.time.startDate + '&endDate=' + selectedTime.time.endDate + '&dimensionsId=' + googleAnalyticsCtrl.selectedSource.gaValue, 'GET')
                .then(_setAllTimeAPIData);
        else
            googleAnalyticsService.serverRequest(NODE_WEB_API.ALL_TIME_DATA_API + '?startDate=' + selectedTime.time.startDate + '&endDate=' + selectedTime.time.endDate + '&dimensionsId=' + googleAnalyticsCtrl.selectedSource.gaValue, 'GET')
                .then(_setAllTimeAPIData);
    }

    // For Display All Time API Data
    function _setAllTimeAPIData(resultWeb) {
        googleAnalyticsCtrl.totalSession = resultWeb.totalsForAllResults['ga:sessions'];
        googleAnalyticsCtrl.bounceRate = parseFloat(resultWeb.totalsForAllResults['ga:bounceRate']).toFixed(2) + '%';
        googleAnalyticsCtrl.exitRate = parseFloat(resultWeb.totalsForAllResults['ga:exitRate']).toFixed(2) + '%';
        var seconds = parseFloat(resultWeb.totalsForAllResults['ga:avgSessionDuration']) % 60;
        var minutes = (parseFloat(resultWeb.totalsForAllResults['ga:avgSessionDuration']) / 60) % 60;
        var hours = (parseFloat(resultWeb.totalsForAllResults['ga:avgSessionDuration'] / (60 * 60))) % 24;
        googleAnalyticsCtrl.avgSessionDuration = hours.toFixed(0) + ':' + minutes.toFixed(0) + ':' + seconds.toFixed(0)
        googleAnalyticsCtrl.newUsers = resultWeb.totalsForAllResults['ga:newUsers'];
        googleAnalyticsCtrl.percentNewSessions = parseFloat(resultWeb.totalsForAllResults['ga:percentNewSessions']).toFixed(2) + '%';
        googleAnalyticsCtrl.pageviewsPerSession = parseFloat(resultWeb.totalsForAllResults['ga:pageviewsPerSession']).toFixed(2) + '%';
        googleAnalyticsCtrl.goalCompletionsAll = parseInt(resultWeb.totalsForAllResults['ga:goalCompletionsAll']);
        googleAnalyticsCtrl.goalValueAll = parseInt(resultWeb.totalsForAllResults['ga:goalValueAll']).toFixed(2);
        googleAnalyticsCtrl.goalConversionRateAll = parseFloat(resultWeb.totalsForAllResults['ga:goalConversionRateAll']).toFixed(2) + '%';
        svg.selectAll(".sub_circle")
            .remove();
        if (!dataPassingService.menuObj[menuObjectInstanceName]) {
            dataPassingService.menuObj[menuObjectInstanceName] = {};
        }
        angular.forEach(dataPassingService.menuObj[menuObjectInstanceName], function (value, key) {
            dataPassingService.menuObj[menuObjectInstanceName][key]['display'] = false;
        })
        _enterSubUser(resultWeb.rows, googleAnalyticsCtrl.totalUserWithinTime);
        googleAnalyticsCtrl.menuList = dataPassingService.menuObj[menuObjectInstanceName];
        _callRealtimeDataAPI();
        intervalInstance = $interval(_callRealtimeDataAPI, REAL_TIME_API_TIME_INTERVAL);
    }
    // For Enter Sub user
    function _enterSubUser(nodeData) {
        if (!nodeData)
            nodeData = [];
        angular.forEach(nodeData, function (value, key) {
            if (!dataPassingService.menuObj[menuObjectInstanceName][value[0]])
                dataPassingService.menuObj[menuObjectInstanceName][value[0]] = {};
            dataPassingService.menuObj[menuObjectInstanceName][value[0]].name = value[0];
            if (!dataPassingService.menuObj[menuObjectInstanceName][value[0]]['data'])
                dataPassingService.menuObj[menuObjectInstanceName][value[0]]['data'] = [];
            if (!dataPassingService.menuObj[menuObjectInstanceName][value[0]]['color'])
                dataPassingService.menuObj[menuObjectInstanceName][value[0]]['color'] = color; color++;
            if (!dataPassingService.menuObj[menuObjectInstanceName][value[0]]['x']) {
                dataPassingService.menuObj[menuObjectInstanceName][value[0]]['x'] = 100;
                dataPassingService.menuObj[menuObjectInstanceName][value[0]]['y'] = 50;
            }
            dataPassingService.menuObj[menuObjectInstanceName][value[0]]['display'] = true;
            _createSubNodes(value, value[1], Math.log(value[1]) * 4 || 4);
        });
    }
    // For RGB Color
    function _setColor(colorKey) {
        return d3.rgb(fill(colorKey));
    }
    $timeout(_rightSideBarConfig, 100);
    // Set Right Side Menu Config
    function _rightSideBarConfig() {
        googleAnalyticsCtrl.sideBarInstance = angular.element('#slider').slideReveal({
            position: "right",
            push: false,
            speed: 700,
            zIndex: 1,
            width: 300,
            hide: function (slider, trigger) {
                googleAnalyticsCtrl.sideBarFlag = false;
            },
            show: function (slider, trigger) {
                googleAnalyticsCtrl.sideBarFlag = true;
            },
        });
    }
}

function _liveUserSort(_) {
    function liveUserSortFilter(input) {
        return _.sortBy(input, ['data']).reverse();
    }
    return liveUserSortFilter;
}

function _dateMenuSort(_) {
    function _dateMenuSortFilter(input) {
        return _.sortBy(input, ['data']).reverse();
    }
    return _dateMenuSortFilter;
}