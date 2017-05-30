angular.module('googleAnalyticsModule')
    .controller('googleAnalyticsController', _googleAnalyticsController)
    .filter('liveUserSort', _liveUserSort)
    .filter('dateMenuSort', _dateMenuSort);

_googleAnalyticsController.$inject = ['$timeout', 'googleAnalyticsService', '$window', '$document', 'NODE_WEB_API', '$interval', 'VIEWING_BY_SOURCE', 'dataPassingService', 'VIEWING_BY_TIME', 'REAL_TIME_API_TIME_INTERVAL', 'SCALING_INDEX', 'MAX_MENU_COUNT', 'GOAL_COMPLETE_ICON_PATH', '$filter', 'GOAL_EVENT_NAME', 'NODE_WEB_API_DEMO'];
_liveUserSort.$inject = ['_'];
function _googleAnalyticsController($timeout, googleAnalyticsService, $window, $document, NODE_WEB_API, $interval, VIEWING_BY_SOURCE, dataPassingService, VIEWING_BY_TIME, REAL_TIME_API_TIME_INTERVAL, SCALING_INDEX, MAX_MENU_COUNT, GOAL_COMPLETE_ICON_PATH, $filter, GOAL_EVENT_NAME, NODE_WEB_API_DEMO) {
    var googleAnalyticsCtrl = this, slider, clusterPadding = 6, // separation between different-color circles
        intervalInstance,
        subForceGlobal, subForceNodes = [],
        menuObjectInstanceName,
        fill = d3.scale.category20(),
        color = 1,
        nodes = [],
        padding = 1,
        cluster_padding = 1000,
        mainSvgHeight = $window.innerHeight * 0.78,
        mainSvgWidth = $window.innerWidth,
        bowlSvgWidth = $window.innerWidth * 0.15,
        bowlSvgHeight = ($window.innerWidth * 0.15) / 2,
        svg = d3.select("#main_svg").append("svg")
            .attr("width", mainSvgWidth)
            .attr("height", mainSvgHeight)
            .attr("class", 'svg-main-window')
            .attr("border", 1),
        force = d3.layout.force()
            .nodes(nodes)
            .size([mainSvgWidth, mainSvgHeight])
            .gravity(.1)
            .charge(1)
            .friction(0.00002)
            .on("tick", tick),
        node = svg.selectAll(".main_circle"),
        rectangleMenu = svg.append("rect")
            .attr("width", 200)
            .attr("height", mainSvgHeight)
            .style("fill", d3.rgb(255, 255, 255))
            .style("stroke", d3.rgb(255, 255, 255)),
        defs = svg.append("defs").append("pattern").attr("id", 'image').attr("width", 2).attr("height", 2)
            .append('image')
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 11)
            .attr("height", 11)
            .attr("xlink:href", GOAL_COMPLETE_ICON_PATH),
        rectangleBowl = svg.append("rect")
            .attr("width", mainSvgWidth)
            .attr("height", mainSvgHeight * 0.5)
            .attr("y", mainSvgHeight * 0.5)
            .style("fill", d3.rgb(255, 255, 255))
            .style("stroke", d3.rgb(255, 255, 255)),
        div = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0),
        devideLine = svg.append("line")
            .style("stroke", "white")
            .style("stroke-width", 2)
            .attr("x1", mainSvgWidth * 0.7)
            .attr("y1", 0)
            .attr("x2", mainSvgWidth * 0.7)
            .attr("y2", mainSvgHeight * 0.5),
        clusters = new Array(1),
        firstFlag, previousCompletedUser;
    // Controller Functions 
    googleAnalyticsCtrl.startTime = _startTime;
    googleAnalyticsCtrl.setColor = _setColor;
    googleAnalyticsCtrl.bowlWidth = bowlSvgWidth;
    googleAnalyticsCtrl.bowlHeight = (mainSvgHeight * 0.15);
    googleAnalyticsCtrl.maxMenuCount = MAX_MENU_COUNT;
    googleAnalyticsCtrl.userInfoTopPostion = mainSvgHeight * 0.5;
    googleAnalyticsCtrl.bowlTopBottomPostion = bowlSvgHeight - ((bowlSvgHeight * 0.35) / 2) + (mainSvgHeight * 0.15);
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
    googleAnalyticsCtrl.onsiteUser = 0;
    googleAnalyticsCtrl.goalOneDivWidth = mainSvgWidth - (mainSvgWidth * 0.7);
    googleAnalyticsCtrl.userDataForRightMenu = {};
    googleAnalyticsCtrl.demoApiFlag = NODE_WEB_API_DEMO.DUMMY_API_DEFAULT_FLAG;
    //Init Functions or Variables
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

    // Move d to be adjacent to the cluster node.
    function _mainCluster(alpha) {
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

    // Resolves collisions between d and all other circles.
    function _mainCollides(alpha) {
        var quadtree = d3.geom.quadtree(nodes);
        return function (d) {
            var r = d.radius + 6 + Math.max(padding, 6),
                nx1 = d.x - r,
                nx2 = d.x + r,
                ny1 = d.y - r,
                ny2 = d.y + r;
            quadtree.visit(function (quad, x1, y1, x2, y2) {
                if (quad.point && (quad.point !== d)) {
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
                }
                return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
            });
        };
    }
    // For Get API Data
    function _callRealtimeDataAPI(changeFlag) {
        console.log('changeFlag', changeFlag);
        changeFlag = angular.isUndefined(changeFlag) ? true : false;
        console.log(changeFlag)
        if (!googleAnalyticsCtrl.demoApiFlag)
            googleAnalyticsService.serverRequest(NODE_WEB_API.REAL_TIME_DATA_API + '?dimensionsId=' + googleAnalyticsCtrl.selectedSource.value, 'GET')
                .then(_displayApiData);
        else
            googleAnalyticsService.serverRequest(NODE_WEB_API_DEMO.REAL_TIME_DATA_API + '?dimensionsId=' + googleAnalyticsCtrl.selectedSource.value + '&changeFlag=' + changeFlag, 'GET')
                .then(_displayApiData);
    }

    // For Source Selection Change 
    function _sourceSelection(selectData) {
        color = 1;
        dataPassingService.menuObj[menuObjectInstanceName] = {};
        googleAnalyticsCtrl.getAnalyticsDataByTime(googleAnalyticsCtrl.selectedTime);
        svg.selectAll(".main_circle")
            .attr("remove", "yes")
            .style("pointer-events", "none")
            .transition()
            .duration(120)
            .style("fill-opacity", 0)
            .remove();
        menuObjectInstanceName = selectData.name;
        $interval.cancel(intervalInstance);
    }

    // For Display Real Time API Data
    function _displayApiData(res) {
        console.log(res)
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
                var newCricleIndex = subForceNodes.findIndex(function (obj) {
                    return obj.name === dataValue[0];
                });
                if (newCricleIndex === -1) {
                    if (subForceGlobal && angular.isFunction(subForceGlobal.stop))
                        subForceGlobal.stop();
                    var obj = {};
                    obj.color = dataPassingService.menuObj[menuObjectInstanceName][dataValue[0]]['color'];
                    obj.name = dataValue[0];
                    obj.user = 0;
                    obj.radius = 4;
                    obj.cluster = 0;
                    subForceNodes.push(obj);
                    svg.selectAll(".sub_circle")
                        .data(subForceNodes)
                        .enter().append("circle")
                        .attr("r", function (d) { return d.radius; })
                        .attr("class", "node sub_circle")
                        .attr("user", function (d) {
                            return d.user
                        })
                        .attr("name", function (d) {
                            return d.name
                        })
                        .style("fill", function (d) {
                            return d3.rgb(fill(d.color));
                        })
                        .attr("show-menu", function (d, i) {
                            return d.name
                        })
                        .attr("index_id", function (d) {
                            return d.index
                        })
                        .call(subForceGlobal.drag);
                    if (subForceGlobal && angular.isFunction(subForceGlobal.start))
                        subForceGlobal.start();
                }
                _enterUser(dataPassingService.menuObj[menuObjectInstanceName], dataValue);
            });
            _.each(node[0], function (existDataValue, existDataKey) {
                if (existDataValue.getAttribute('remove') === 'no') {
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

    // For MainEnter Tick Function
    function tick(e) {
        var k = .1 * e.alpha;
        n = nodes.length, i = 0
        q = d3.geom.quadtree(nodes);
        // Push nodes toward their designated focus.
        if (dataPassingService.menuObj[menuObjectInstanceName]) {
            nodes.forEach(function (o, i) {
                if (dataPassingService.menuObj[menuObjectInstanceName][o.name]) {
                    o.y += (mainSvgHeight / 8 - o.y) * k;
                    o.x += (mainSvgWidth / 2 - o.x) * k;
                }
            });
        }
        svg.selectAll(".main_circle")
            .each(_mainCluster(0.5 * e.alpha * e.alpha))
            .each(_mainCollides(.5))
            .attr("cx", function (d) { return d.x; })
            .attr("cy", function (d) { return d.y; });
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
            force.stop();
            var indx = _uniqIndex(row[0]);
            nodes.push({ name: row[0], color: menuObj[row[0]]['color'], x: 150, y: (indx + 1) * 20 + 10, radius: 4, cluster: 0, userId: row[2], userData: { id: row[2] } });
            clusters[0] = { name: row[0], color: menuObj[row[0]]['color'], x: 150, y: (indx + 1) * 20 + 10, radius: 4, cluster: 0, userId: row[2] };
            force.nodes(nodes);
            node = node.data(nodes);
            node.enter().append("circle")
                .attr("class", "node main_circle")
                .attr("main", "main")
                .attr("cx", function (d) { return d.x || 0; })
                .attr("cy", function (d) { return d.y || 0; })
                .attr("remove", "no")
                .attr("userId", row[2])
                .attr("userInformation", row)
                .attr("r", 4)
                .style("fill", function (d) {
                    return d3.rgb(fill(d.color));
                })
                .attr("show-menu", function (d, i) {
                    return d.name
                })
                .attr("index_id", function (d) {
                    return d.index
                })
                .attr("id", function (d) {
                    return 'main_svg_circle_' + d.index;
                })
                .style("stroke", function (d) { return d3.rgb(fill(d.color)).darker(2); })
                .on("mouseover", function (d) {
                    if (node[0][d.index].getAttribute('userData')) {
                        var data = JSON.parse(node[0][d.index].getAttribute('userData'));
                        div.transition()
                            .duration(200)
                            .style("opacity", .9);
                        div.html(_setTooltipView(data.userInfo))
                            .style("left", (d3.event.pageX) + "px")
                            .style("top", (d3.event.pageY - 28) + "px");
                    }
                })
                .on("mouseout", function (d) {
                    div.transition()
                        .duration(500)
                        .style("opacity", 0);
                })
                .call(force.drag);
            if (!googleAnalyticsCtrl.userDataForRightMenu[googleAnalyticsService.getFormattedCurrentDate()])
                googleAnalyticsCtrl.userDataForRightMenu[googleAnalyticsService.getFormattedCurrentDate()] = {
                    onload: [],
                    date: new Date()
                };
            googleAnalyticsCtrl.userDataForRightMenu[googleAnalyticsService.getFormattedCurrentDate()].onload.unshift(row);
            force.start();
        } else if (svg.selectAll('circle[userId="' + usrInfo.id + '"]')[0].length && row[1] === GOAL_EVENT_NAME && !svg.selectAll('circle[userId="' + usrInfo.id + '"]')[0][0].getAttribute(GOAL_EVENT_NAME)) {
            var index = nodes.map(function (obj) {
                return obj.userId;
            }).indexOf(usrInfo.id);
            googleAnalyticsCtrl.userInfoArray.push(usrInfo);
            if (index !== -1) {
                nodes[index].cluster = 1;
                clusters[1] = { name: nodes[index].name, color: nodes[index].color, x: nodes[index].x + 100 || 0, y: nodes[index].y || 0, radius: 4, cluster: 1, userId: usrInfo.id };
                svg.selectAll('circle[userId="' + usrInfo.id + '"]')
                    .attr('r', 6)
                    .style("fill", "url(#image)")
                    .transition()
                    .each("end", function (e) {
                        if (!googleAnalyticsCtrl.userDataForRightMenu[googleAnalyticsService.getFormattedCurrentDate()]) {
                            googleAnalyticsCtrl.userDataForRightMenu[googleAnalyticsService.getFormattedCurrentDate()] = {
                                date: googleAnalyticsService.getFormattedCurrentDate()
                            };
                            googleAnalyticsCtrl.userDataForRightMenu[googleAnalyticsService.getFormattedCurrentDate()][GOAL_EVENT_NAME] = [];
                        }
                        if (!googleAnalyticsCtrl.userDataForRightMenu[googleAnalyticsService.getFormattedCurrentDate()][GOAL_EVENT_NAME])
                            googleAnalyticsCtrl.userDataForRightMenu[googleAnalyticsService.getFormattedCurrentDate()][GOAL_EVENT_NAME] = [];

                        googleAnalyticsCtrl.userDataForRightMenu[googleAnalyticsService.getFormattedCurrentDate()][GOAL_EVENT_NAME].unshift(row);
                        force.resume();
                    })
                    .attr('userData', JSON.stringify(usrInfo))
                    .attr(GOAL_EVENT_NAME, 'done')
                    .attr("transform", "translate(" + 500 + "," + 0 + ")")
                    .duration(1400);
            }
        }
    }


    // Add Tooltip Display to D3 circle
    function _setTooltipView(userInfo) {
        var html = '<div>'
        _.each(userInfo, function (value, key) {
            html = html + key.toUpperCase() + ' : ' + value + '</br>';
        })
        return html = html + '</div>';
    }

    // Exit User with Animation
    function _exitUser(dataValueForExit, dataKeyForExit) {
        var index = _.findIndex(nodes, function (obj) {
            return parseInt(obj.userId) === parseInt(dataValueForExit.getAttribute('userId'));
        });
        var mergeNode = svg.selectAll("circle[name='" + dataValueForExit.getAttribute('show-menu') + "']");
        var dataIndex = _.findIndex(dataPassingService.menuObj[menuObjectInstanceName][dataValueForExit.getAttribute('show-menu')]['data'], function (menuData) {
            return parseInt(dataValueForExit.getAttribute('userId')) === parseInt(menuData.userId);
        });
        dataPassingService.menuObj[menuObjectInstanceName][dataValueForExit.getAttribute('show-menu')]['data'].splice(dataIndex, 1);
        d3.select('circle[userId="' + dataValueForExit.getAttribute('userId') + '"]')
            .style("pointer-events", "none")
            .attr("remove", "yes")
            .transition()
            .each("end", function (e) {
                subForceGlobal.stop();
                var user = (parseInt(mergeNode[0][0].getAttribute("user")) + 1);
                mergeNode.attr("r", function (d) {
                    subForceNodes[d.index].radius = Math.log(user) * 4 + 4;
                    return Math.log(user) * 4 + 4;
                });
                mergeNode.attr("user", user);
                subForceGlobal.start();
            })
            .attr("transform", "translate(" + -(nodes[index].x - parseFloat(mergeNode[0][0].getAttribute("cx"))) + "," + -(nodes[index].y - parseFloat(mergeNode[0][0].getAttribute("cy"))) + ")") //scale(0)
            .duration(1400)
            .remove();
    }

    // For Unique Index of Circle
    function _uniqIndex(name) {
        var countries = nodes.map(function (n) { return n.name });
        var u = countries.filter(function (v, i) { return countries.indexOf(v) == i; });
        var indx = u.indexOf(name);
        indx = indx > 0 ? indx : 0;
        return indx;
    }

    // For RGB Color
    function _setColor(colorKey) {
        return d3.rgb(fill(colorKey));
    }

    // For All Time Data API Calling
    function _getAnalyticsDataByTime(selectedTime) {
        //firstFlag = true;
        if (!googleAnalyticsCtrl.demoApiFlag)
            googleAnalyticsService.serverRequest(NODE_WEB_API.ALL_TIME_DATA_API + '?startDate=' + selectedTime.time.startDate + '&endDate=' + selectedTime.time.endDate + '&dimensionsId=' + googleAnalyticsCtrl.selectedSource.gaValue, 'GET')
                .then(_setAllTimeAPIData);
        else
            googleAnalyticsService.serverRequest(NODE_WEB_API.ALL_TIME_DATA_API + '?startDate=' + selectedTime.time.startDate + '&endDate=' + selectedTime.time.endDate + '&dimensionsId=' + googleAnalyticsCtrl.selectedSource.gaValue, 'GET')
                .then(_setAllTimeAPIData);
    }

    // For Display All Time API Data
    function _setAllTimeAPIData(resultWeb) {
        var scaleIndex = SCALING_INDEX;
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
        scaleIndex = _scaleIndexUpdate(googleAnalyticsCtrl.totalUserWithinTime, scaleIndex);
        svg.selectAll(".sub_circle")
            .remove();
        if (!dataPassingService.menuObj[menuObjectInstanceName]) {
            dataPassingService.menuObj[menuObjectInstanceName] = {};
        }
        angular.forEach(dataPassingService.menuObj[menuObjectInstanceName], function (value, key) {
            dataPassingService.menuObj[menuObjectInstanceName][key]['display'] = false;
        })
        //if (resultWeb.rows && resultWeb.rows.length) {
        _enterSubUser(resultWeb.rows, googleAnalyticsCtrl.totalUserWithinTime);
        //}
        googleAnalyticsCtrl.menuList = dataPassingService.menuObj[menuObjectInstanceName];
        _callRealtimeDataAPI();
        intervalInstance = $interval(_callRealtimeDataAPI, REAL_TIME_API_TIME_INTERVAL);
    }

    // For Update Scaling Index
    function _scaleIndexUpdate(users, scaleIndex) {
        if (users / scaleIndex > 1) {
            scaleIndex = _scaleIndexUpdate(users, scaleIndex * 10)
        }
        return scaleIndex;
    }

    function _enterSubUser(nodeData, totalUser) {
        if (!nodeData)
            nodeData = [];
        if (subForceGlobal && angular.isFunction(subForceGlobal.stop))
            subForceGlobal.stop();
        var padding = 1.5, // separation between same-color circles
            clusterPadding = 6, // separation between different-color circles
            maxRadius = 60;
        var m = 1; // number of distinct clusters
        // The largest node for each cluster.
        var clusters = new Array(1);
        var subNodes = d3.range(nodeData.length).map(function () {
            var i = Math.floor(Math.random()),
                r = Math.sqrt((i + 1) / 1 * -Math.log(Math.random())) * maxRadius,
                d = { cluster: i, radius: r };
            if (!clusters[i] || (r > clusters[i].radius)) clusters[i] = d;
            return d;
        });
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
            subNodes[key].color = dataPassingService.menuObj[menuObjectInstanceName][value[0]]['color'];
            subNodes[key].name = value[0];
            subNodes[key].user = value[1]
            subNodes[key].radius = Math.log(value[1]) * 4 || 4;
            if (maxRadius < subNodes[key].radius) {
                subNodes[key].radius = maxRadius;
            }
        });
        subForceNodes = subNodes;
        var subForce = d3.layout.force()
            .nodes(subNodes)
            .size([mainSvgWidth, mainSvgHeight])
            .gravity(.02)
            .charge(0)
            .on("tick", function (e) {
                svg.selectAll(".sub_circle")
                    .each(cluster(10 * e.alpha * e.alpha))
                    .each(collide(.5))
                    .attr("cx", function (d) { return d.x - (mainSvgWidth / 4) + maxRadius; })
                    .attr("cy", function (d) { return d.y + (mainSvgHeight / 6); });
            })
            .start();
        subForceGlobal = subForce
        var subNode = svg.selectAll(".sub_circle")
            .data(subNodes)
            .enter().append("circle")
            .attr("r", function (d) { return d.radius; })
            .attr("class", "node sub_circle")
            .attr("user", function (d) {
                return d.user
            })
            .attr("name", function (d) {
                return d.name
            })
            .style("fill", function (d) {
                return d3.rgb(fill(d.color));
            })
            .attr("show-menu", function (d, i) {
                return d.name
            })
            .attr("index_id", function (d) {
                return d.index
            })
            .call(subForce.drag);
        subNode.transition()
            .duration(750)
            .delay(function (d, i) { return i * 5; })
            .attrTween("r", function (d) {
                var i = d3.interpolate(0, d.radius);
                return function (t) { return d.radius = i(t); };
            });
        // Move d to be adjacent to the cluster node.
        function cluster(alpha) {
            return function (d) {
                var cluster = clusters[d.cluster];
                if (cluster) {
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
                }
            };
        }

        // Resolves collisions between d and all other circles.
        function collide(alpha) {
            var quadtree = d3.geom.quadtree(subNodes);
            return function (d) {
                var r = subForceNodes[d.index].radius + maxRadius + Math.max(padding, clusterPadding),
                    nx1 = d.x - r,
                    nx2 = d.x + r,
                    ny1 = d.y - r,
                    ny2 = d.y + r;
                quadtree.visit(function (quad, x1, y1, x2, y2) {
                    if (quad.point && (quad.point !== d)) {
                        var x = d.x - quad.point.x,
                            y = d.y - quad.point.y,
                            l = Math.sqrt(x * x + y * y),
                            r = subForceNodes[d.index].radius + quad.point.radius + (d.cluster === quad.point.cluster ? padding : clusterPadding);
                        if (l < r) {
                            l = (l - r) / l * alpha;
                            d.x -= x *= l;
                            d.y -= y *= l;
                            quad.point.x += x;
                            quad.point.y += y;
                        }
                    }
                    return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
                });
            };
        }
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