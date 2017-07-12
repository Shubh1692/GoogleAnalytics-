angular.module('googleAnalyticsModule')
    .controller('googleAnalyticsController', _googleAnalyticsController)
    .filter('liveUserSort', _liveUserSort)
    .filter('dateMenuSort', _dateMenuSort);

_googleAnalyticsController.$inject = ['$timeout', 'googleAnalyticsService', '$window', '$document', 'NODE_WEB_API', '$interval', 'VIEWING_BY_SOURCE', 'dataPassingService', 'VIEWING_BY_TIME', 'REAL_TIME_API_TIME_INTERVAL', 'SCALING_INDEX', 'MAX_MENU_COUNT', 'GOAL_COMPLETE_ICON_PATH', '$filter', 'GOAL_EVENT_NAME', 'NODE_WEB_API_DEMO', 'DEFAULT_D3CIRCLE_CONSTRAINT', 'socketAalytics', '$sce'];
_liveUserSort.$inject = ['_'];

function _googleAnalyticsController($timeout, googleAnalyticsService, $window, $document, NODE_WEB_API, $interval, VIEWING_BY_SOURCE, dataPassingService, VIEWING_BY_TIME, REAL_TIME_API_TIME_INTERVAL, SCALING_INDEX, MAX_MENU_COUNT, GOAL_COMPLETE_ICON_PATH, $filter, GOAL_EVENT_NAME, NODE_WEB_API_DEMO, DEFAULT_D3CIRCLE_CONSTRAINT, socketAalytics, $sce) {
    var googleAnalyticsCtrl = this,
        padding = 1,
        clusterPadding = 0,
        clusters = new Array(3),
        firstCallByApiFlag,
        intervalInstance,
        menuObjectInstanceName,
        fill = d3.scale.category20(),
        color = 1,
        nodes = [],
        maxRadius = 32,
        mainSvgHeight = $window.innerHeight * 0.78,
        mainSvgWidth = $window.innerWidth,
        center = [{ x: 250, y: 250, exteraX: 250, exteraY: 250 }, { x: ((mainSvgWidth * 0.7) / 2), y: (mainSvgHeight * 0.30), exteraX: ((((mainSvgWidth * 0.7) / 2) - 250) * (50 / 36)) + 250, exteraY: ((((mainSvgHeight * 0.30)) - 250) * (50 / 36)) + 250 }, { x: (mainSvgWidth * 0.85), y: (mainSvgHeight * 0.30), exteraX: ((((mainSvgWidth * 0.85)) - 250) * (50 / 36)) + 250, exteraY: ((((mainSvgHeight * 0.30)) - 250) * (50 / 36)) + 250 }, { x: 250, y: 500, exteraX: (mainSvgHeight * 0.70), exteraY: ((((mainSvgHeight * 0.70)) - 250) * (50 / 36)) + 250 }],
        svg = d3.select("#main_svg").append("svg")
            .attr("width", mainSvgWidth)
            .attr("height", mainSvgHeight)
            .attr("class", 'svg-main-window')
            .attr("border", 1),
        force = d3.layout.force()
            .nodes(nodes)
            .size([500, 500])
            .gravity(DEFAULT_D3CIRCLE_CONSTRAINT.gravity)
            .charge(DEFAULT_D3CIRCLE_CONSTRAINT.charge)
            .friction(DEFAULT_D3CIRCLE_CONSTRAINT.friction)
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
            .style("opacity", 0);
    // Controller Functions 
    googleAnalyticsCtrl.startTime = _startTime;
    googleAnalyticsCtrl.setColor = _setColor;
    googleAnalyticsCtrl.chargeRangeChange = _chargeRangeChange;
    googleAnalyticsCtrl.frictionRangeChange = _frictionRangeChange;
    // Default Values or Controller Variables
    googleAnalyticsCtrl.onsiteUser = 0;
    googleAnalyticsCtrl.totalUserWithinTime = 0;
    googleAnalyticsCtrl.bounceRate = 0 + '%';
    googleAnalyticsCtrl.exitRate = 0 + '%';
    googleAnalyticsCtrl.avgSessionDuration = 0 + 'min';
    googleAnalyticsCtrl.userInfoArray = [];
    googleAnalyticsCtrl.showUserNotification = true;
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
    googleAnalyticsCtrl.speed = DEFAULT_D3CIRCLE_CONSTRAINT.speed;
    googleAnalyticsCtrl.hostList = [];
    //Init Functions or Variables
    var forceInterVal = $interval(force.start, 1);
    menuObjectInstanceName = VIEWING_BY_SOURCE[0].name;
    _createStaticD3Component();
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
    // For Source Selection Change 
    function _sourceSelection(selectData) {
        color = 1;
        dataPassingService.menuObj[menuObjectInstanceName] = {};
        menuObjectInstanceName = selectData.name;
        _exitAllUser();
    }

    // Create Main Node for User
    function _createMainNodes(dataValue) {
        if (!dataPassingService.menuObj[menuObjectInstanceName][dataValue[0]]) {
            dataPassingService.menuObj[menuObjectInstanceName][dataValue[0]] = {}
            dataPassingService.menuObj[menuObjectInstanceName][dataValue[0]].name = dataValue[0];
            dataPassingService.menuObj[menuObjectInstanceName][dataValue[0]].data = [];
            dataPassingService.menuObj[menuObjectInstanceName][dataValue[0]].color = color;
            color++;
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
    }

    // Create Menu Nodes
    function _createSubNodes(nodeValue, userValue, radiusValue) {
        _.findIndex()
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
            .attr("r", radiusValue)
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
            d.y += (center[d.id].exteraY - d.y) * alpha;
            d.x += (center[d.id].exteraX - d.x) * alpha;
        };
    }
    // For Main Tick Function
    function _tick(e) {
        if (nodes.length) {
            node
                .each(_handelCollides(.5))
                .each(gravity(.5 * e.alpha))
                .transition()
                .ease('linear')
                .duration(JSON.parse(googleAnalyticsCtrl.speed))
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
                if (quad.point && (quad.point !== d)) { //  && quad.point.menuName !== d.name && quad.point.name !== d.menuName
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

    // Enter Main User with Animation
    function _enterUser(menuObj, row) {
        var usrInfo = {},
            positionObj = {};
        if (row[1] !== 'onload')
            usrInfo = googleAnalyticsService.getConvertedUserData(row[2]);
        else
            usrInfo.id = row[2];
        if (svg.selectAll('circle[userId="' + usrInfo.id + '"]')[0].length === 0 && row[1] === 'onload') {
            googleAnalyticsCtrl.onsiteUser ++;
            dataPassingService.menuObj[menuObjectInstanceName][row[0]]['data'].push({ name: row[0], color: dataPassingService.menuObj[menuObjectInstanceName][row[0]]['color'], userId: row[2] });
            dataPassingService.menuObj[menuObjectInstanceName][row[0]]['display'] = true;
            var menuIndex = _.findIndex($filter('liveUserSort')(googleAnalyticsCtrl.menuList), ['name', row[0]]);
            nodes.push({
                x: positionObj.x || 170,
                y: positionObj.y || (menuIndex + 1) * 20 + 10,
                cx: center[1].x,
                cy: center[1].y,
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
                .style("stroke", function (d) { return d3.rgb(fill(d.color)) }) //.darker(2);
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
        }
        if (svg.selectAll('circle[userId="' + usrInfo.id + '"]')[0].length && row[1] === GOAL_EVENT_NAME[0] && !svg.selectAll('circle[userId="' + usrInfo.id + '"]')[0][0].getAttribute(GOAL_EVENT_NAME[0])) {
            googleAnalyticsCtrl.userInfoArray.push(usrInfo);
            if (googleAnalyticsCtrl.showUserNotification)
                googleAnalyticsService.showUserNotification(usrInfo);
            let moveIndex = _.findIndex(nodes, ['userId', usrInfo.id]);
            d3.select('circle[userId="' + usrInfo.id + '"]')
                .style("fill", "url(#star-image)")
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
            force.start();
        }
    }
    // Exit User with Animation
    function _exitUser(exitUserId) {
        var removeIndex = _.findIndex(nodes, function (obj) {
            return obj.userId === exitUserId;
        });
        if (removeIndex > -1) {
            var removeNodeObj = angular.copy(nodes[removeIndex]);
            mergeNode = svg.selectAll("circle[name='" + removeNodeObj.name + "']");
            var dataIndex = _.findIndex(dataPassingService.menuObj[menuObjectInstanceName][removeNodeObj.name]['data'], function (menuData) {
                return exitUserId === menuData.userId;
            });
            dataPassingService.menuObj[menuObjectInstanceName][removeNodeObj.name]['data'].splice(dataIndex, 1);
            force.stop();
            nodes.splice(removeIndex, 1);
            node = node.data(nodes);
            node.exit()
                .transition()
                .each("end", function (e) {
                    var user = (parseInt(mergeNode[0][0].getAttribute("user")) + 1);
                    _updateMenuNodeRadious(e.name, user);
                })
                .attr("transform", "translate(" + -(removeNodeObj.x - parseFloat(mergeNode[0][0].getAttribute("cx"))) + "," + -(removeNodeObj.y - parseFloat(mergeNode[0][0].getAttribute("cy"))) + ")") //scale(0)
                .duration(1600)
                .remove();
        }
    }

    // Update Radious of Menu Nodes on DD or Exit user change
    function _updateMenuNodeRadious(name, user) {
        var mergeNode = svg.selectAll("circle[name='" + name + "']");
        var mergeNodeIndex = _.findIndex(nodes, function (obj) {
            return obj.menuName === name;
        });
        mergeNode.attr("r", function (d) {
            nodes[mergeNodeIndex].radius = Math.log(user) * 4 + 4;
            return Math.log(user) * 4 + 4;
        });
        mergeNode.attr("user", user);
        googleAnalyticsCtrl.onsiteUser --;
    }
    // Exit All users on Menu Selection
    function _exitAllUser() {
        console.log('exit')
        if (nodes.length !== 0) {
            force.stop();
            nodes.splice(0, 1);
            node = node.data(nodes);
            node.exit().remove();
            _exitAllUser();
            googleAnalyticsCtrl.onsiteUser = 0;
        } else {
            googleAnalyticsCtrl.getAnalyticsDataByTime(googleAnalyticsCtrl.selectedTime);
        }
    }

    // For All Time Data API Calling
    function _getAnalyticsDataByTime(selectedTime) {
        console.log(googleAnalyticsCtrl.renderRightMenu)
        console.log(googleAnalyticsCtrl.selectHost)
        googleAnalyticsService.serverRequest(NODE_WEB_API.ALL_TIME_DATA_API, 'POST', {
            startDate: selectedTime.time.startDate,
            endDate: selectedTime.time.endDate,
            dimensionsId: googleAnalyticsCtrl.selectedSource.gaValue,
            socketId: dataPassingService.socketId,
            host: googleAnalyticsCtrl.selectHost.host
        })
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
        if (!dataPassingService.menuObj[menuObjectInstanceName]) {
            dataPassingService.menuObj[menuObjectInstanceName] = {};
        }
        angular.forEach(dataPassingService.menuObj[menuObjectInstanceName], function (value, key) {
            dataPassingService.menuObj[menuObjectInstanceName][key]['display'] = false;
        })
        _enterSubUser(resultWeb.rows, googleAnalyticsCtrl.totalUserWithinTime);
        googleAnalyticsCtrl.menuList = dataPassingService.menuObj[menuObjectInstanceName];
        angular.forEach(resultWeb.onlineUserData, function (onlineUser) {
            console.log(onlineUser)
            if (googleAnalyticsCtrl.selectHost && onlineUser[11] === googleAnalyticsCtrl.selectHost.host)
                _createOrUpdateOnlineUser(onlineUser);
        });
    }
    // For Create Menu Nodes of DD selection
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
                dataPassingService.menuObj[menuObjectInstanceName][value[0]]['color'] = color;
            color++;
            if (!dataPassingService.menuObj[menuObjectInstanceName][value[0]]['x']) {
                dataPassingService.menuObj[menuObjectInstanceName][value[0]]['x'] = 100;
                dataPassingService.menuObj[menuObjectInstanceName][value[0]]['y'] = 50;
            }
            dataPassingService.menuObj[menuObjectInstanceName][value[0]]['display'] = true;
            var newCricleIndex = nodes.findIndex(function (obj) {
                return (obj.menuName === value[0]);
            });
            if (newCricleIndex === -1)
                _createSubNodes(value, value[1], Math.log(value[1]) * 4 || 4);
            else
                _updateMenuNodeRadious(value[0], value[1])
        });
    }
    // For RGB Color
    function _setColor(colorKey) {
        return d3.rgb(fill(colorKey));
    }
    // Create Static UI D3 Component
    function _createStaticD3Component() {
        svg.append("defs")
            .append("pattern")
            .attr("id", 'star-image')
            .attr("width", 2)
            .attr("height", 2)
            .append('image')
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 15)
            .attr("height", 15)
            .attr("class", "graph-svg-component")
            .attr("xlink:href", GOAL_COMPLETE_ICON_PATH);
        svg.append("rect")
            .attr("width", 200)
            .attr("height", mainSvgHeight)
            .style("fill", d3.rgb(255, 255, 255))
            .style("stroke", d3.rgb(255, 255, 255))
        svg.append("rect")
            .attr("width", mainSvgWidth)
            .attr("height", mainSvgHeight * 0.5)
            .attr("y", mainSvgHeight * 0.5)
            .style("fill", d3.rgb(255, 255, 255))
            .style("stroke", d3.rgb(255, 255, 255));
        svg.append("line")
            .style("stroke", "white")
            .style("stroke-width", 2)
            .attr("x1", mainSvgWidth * 0.7)
            .attr("y1", 0)
            .attr("x2", mainSvgWidth * 0.7)
            .attr("y2", mainSvgHeight * 0.5)
    }

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
    // Force charge change Function
    function _chargeRangeChange(change) {
        force.charge(change);
    }
    // Force friction change Function
    function _frictionRangeChange(change) {
        force.friction(change);
    }
    // Socket Ready Event For Controller
    function _socketReadyEvent() {
        googleAnalyticsService.serverRequest('getInputConfiguration', 'POST', {})
            .then(function (hostData) {
                googleAnalyticsCtrl.hostList = hostData;
                googleAnalyticsCtrl.selectHost = hostData[0];
                _getAnalyticsDataByTime(googleAnalyticsCtrl.selectedTime);
            });
    }

    // Create online user 
    function _createOrUpdateOnlineUser(newUser) {
        if (googleAnalyticsCtrl.selectedSource.gaValue === 'ga:country') {
            newUser.unshift(newUser[6]);
        } else if (googleAnalyticsCtrl.selectedSource.gaValue === 'ga:browser') {
            newUser.unshift(newUser[3]);
        } else if (googleAnalyticsCtrl.selectedSource.gaValue === 'ga:operatingSystem') {
            newUser.unshift(newUser[8]);
        }
        _createMainNodes(newUser);
    }

    // Socket Events
    // User Come Event
    socketAalytics.on('new-user', function (newUser) {
        console.log(newUser, googleAnalyticsCtrl.selectHost)
        if (googleAnalyticsCtrl.selectHost && newUser[11] === googleAnalyticsCtrl.selectHost.host)
            _createOrUpdateOnlineUser(newUser)
    });
    // User Disconnect Event
    socketAalytics.on('disconnect-user', function (exitUser) {
        _exitUser(exitUser.userId)
    });
    // User Goal Completation Event
    socketAalytics.on('goal-complete', function (goalComplete) {
        if (googleAnalyticsCtrl.selectHost && newUser[11] === googleAnalyticsCtrl.selectHost.host)
            _createOrUpdateOnlineUser(goalComplete)
    });
    dataPassingService.socketReadyEvent = _socketReadyEvent;
    $timeout(_rightSideBarConfig, 100);


}

function _liveUserSort(_) {
    // Filter for Sort Menu List on Change Menu Data
    function liveUserSortFilter(input) {
        return _.sortBy(input, ['data']).reverse();
    }
    return liveUserSortFilter;
}

function _dateMenuSort(_) {
    // Filter for Sort User List on Date Change
    function _dateMenuSortFilter(input) {
        return _.sortBy(input, ['data']).reverse();
    }
    return _dateMenuSortFilter;
}