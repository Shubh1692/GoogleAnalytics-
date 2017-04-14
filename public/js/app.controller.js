angular.module('googleAnalyticsModule')
    .controller('googleAnalyticsController', _googleAnalyticsController);
_googleAnalyticsController.$inject = ['$timeout', 'googleAnalyticsService', '$window', '$document', 'NODE_WEB_API', '$interval', 'VIEWING_BY_SOURCE', 'dataPassingService', 'VIEWING_BY_TIME', 'REAL_TIME_API_TIME_INTERVAL', 'SCALING_INDEX', 'MAX_MENU_COUNT'];
function _googleAnalyticsController($timeout, googleAnalyticsService, $window, $document, NODE_WEB_API, $interval, VIEWING_BY_SOURCE, dataPassingService, VIEWING_BY_TIME, REAL_TIME_API_TIME_INTERVAL, SCALING_INDEX, MAX_MENU_COUNT) {
    var googleAnalyticsCtrl = this,
        intervalInstance,
        removeSubIndex = 0,
        subCircleCount = 0,
        menuObjectInstanceName,
        fill = d3.scale.category10(),
        dim = 50,
        color = 1,
        nodes = [],
        subNodes = [],
        padding = 1,
        cluster_padding = 10,
        mainWindowHeight = $window.innerHeight * .78,
        mainWIndowWidth = $window.innerWidth,
        svg = d3.select("#main_svg").append("svg")
            .attr("width", mainWIndowWidth)
            .attr("height", mainWindowHeight)
            .attr("class", 'svg-main-window')
            .attr("border", 1),
        force = d3.layout.force()
            .nodes(nodes)
            .links([])
            .gravity(0.05)
            .distance(50)
            .charge(-60)
            .size([mainWIndowWidth, mainWindowHeight])
            .friction(.9)
            .on("tick", tick),
        node = svg.selectAll("circle"),
        subSvg = d3.select("#sub_svg").append("svg")
            .attr("width", ($window.innerWidth * 0.15))
            .attr("height", ($window.innerWidth * 0.15) / 2)
            .attr("class", 'svg-sub-window')
            .attr("border", 1),
        forceSub = d3.layout.force()
            .nodes(subNodes)
            .links([])
            .size([100, 50])
            .on("tick", subTick),
        subNode = subSvg.selectAll("circle");
    // Controller Functions 
    googleAnalyticsCtrl.startTime = _startTime;
    googleAnalyticsCtrl.setColor = _setColor;
    googleAnalyticsCtrl.subDivHeight = ($window.innerWidth * 0.15) + 'px';
    googleAnalyticsCtrl.maxMenuCount = MAX_MENU_COUNT;
    // Controller Variables
    googleAnalyticsCtrl.displayTime = {};
    googleAnalyticsCtrl.menuList = [];
    googleAnalyticsCtrl.sourceArray = VIEWING_BY_SOURCE;
    googleAnalyticsCtrl.selectedSource = VIEWING_BY_SOURCE[0];
    googleAnalyticsCtrl.timeArray = VIEWING_BY_TIME;
    googleAnalyticsCtrl.selectedTime = VIEWING_BY_TIME[0];
    googleAnalyticsCtrl.sourceSelection = _sourceSelection;
    googleAnalyticsCtrl.getAnalyticsDataByTime = _getAnalyticsDataByTime;
    googleAnalyticsCtrl.onsiteUser = 0;
    //other
    menuObjectInstanceName = VIEWING_BY_SOURCE[0].name;
    _callRealtimeDataAPI();
    _getAnalyticsDataByTime(googleAnalyticsCtrl.selectedTime);
    intervalInstance = $interval(_callRealtimeDataAPI, REAL_TIME_API_TIME_INTERVAL);
    // For Time
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
    function _callRealtimeDataAPI() {
        googleAnalyticsService.serverRequest(NODE_WEB_API.REAL_TIME_DATA_API + '?dimensionsId=' + googleAnalyticsCtrl.selectedSource.value, 'GET')
            .then(_displayApiData);
    }
    // For Source Selection Change 
    function _sourceSelection(selectData) {
        dim = 50;
        color = 1;
        dataPassingService.menuObj[menuObjectInstanceName] = {};
        googleAnalyticsCtrl.getAnalyticsDataByTime(googleAnalyticsCtrl.selectedTime);
        svg.selectAll("circle")
            .attr("remove", "yes")
            .style("pointer-events", "none")
            .transition()
            .duration(1400)
            .attr("transform", "translate(" + (mainWIndowWidth * 0.15 - 50) + "," + (document.getElementById("sub_svg").getBoundingClientRect().top - document.getElementById('main_svg').offsetTop) + ")scale(0)")
            .style("fill-opacity", 0)
            .remove();
        menuObjectInstanceName = selectData.name;
        $interval.cancel(intervalInstance);
        _callRealtimeDataAPI();
        intervalInstance = $interval(_callRealtimeDataAPI, 10000);
    }

    // For Display Real Time API Data
    function _displayApiData(res) {
        var exitArray = [];
        googleAnalyticsCtrl.onsiteUser = res.totalsForAllResults['rt:activeUsers'];
        if (res.rows && res.rows.length !== 0) {
            if (!dataPassingService.menuObj[menuObjectInstanceName]) {
                dataPassingService.menuObj[menuObjectInstanceName] = {};
            }
            angular.forEach(dataPassingService.menuObj[menuObjectInstanceName], function (value, key) {
                if (res.rows.map(function (o) { return o[0] }).indexOf(key) === -1) {
                    res.rows.push([key, 0]);
                }
            });
            angular.forEach(res.rows, function (value, key) {
                if (!dataPassingService.menuObj[menuObjectInstanceName][value[0]])
                    dataPassingService.menuObj[menuObjectInstanceName][value[0]] = {}
                if (!dataPassingService.menuObj[menuObjectInstanceName][value[0]]['data'])
                    dataPassingService.menuObj[menuObjectInstanceName][value[0]]['data'] = [];
                if (!dataPassingService.menuObj[menuObjectInstanceName][value[0]]['color'])
                    dataPassingService.menuObj[menuObjectInstanceName][value[0]]['color'] = color; color++;
                if (!dataPassingService.menuObj[menuObjectInstanceName][value[0]]['x']) {
                    dataPassingService.menuObj[menuObjectInstanceName][value[0]]['x'] = dim;
                    dataPassingService.menuObj[menuObjectInstanceName][value[0]]['y'] = 50;
                    dim = dim + 200;
                }
                if (parseInt(value[1], 10) - dataPassingService.menuObj[menuObjectInstanceName][value[0]]['data'].length > 0) {
                    var length = dataPassingService.menuObj[menuObjectInstanceName][value[0]]['data'].length;
                    for (var j = 0; j < (parseInt(value[1], 10) - length); j++) {
                        dataPassingService.menuObj[menuObjectInstanceName][value[0]]['data'].push({ name: value[0], color: dataPassingService.menuObj[menuObjectInstanceName][value[0]]['color'] });
                        enterUser(dataPassingService.menuObj[menuObjectInstanceName], value);
                    }
                } else if (parseInt(value[1], 10) - dataPassingService.menuObj[menuObjectInstanceName][value[0]]['data'].length < 0) {
                    var length = dataPassingService.menuObj[menuObjectInstanceName][value[0]]['data'].length;
                    var rotation = length - parseInt(value[1], 10);
                    angular.forEach(node[0], function (nodeValue) {
                        if (nodeValue.getAttribute("show-menu") === value[0] && !nodeValue.getAttribute("remove") && rotation) {
                            dataPassingService.menuObj[menuObjectInstanceName][value[0]]['data'].pop();
                            exitUser(nodeValue.getAttribute("id"));
                            rotation--;
                        }
                    });
                }
            });

        } else {
            svg.selectAll("circle")
                .attr("remove", "yes")
                .style("pointer-events", "none")
                .transition()
                .duration(1400)
                .attr("transform", "translate(" + (mainWIndowWidth * 0.15 - 50) + "," + (document.getElementById("sub_svg").getBoundingClientRect().top - document.getElementById('main_svg').offsetTop) + ")scale(0)")
                .style("fill-opacity", 0)
                .remove();
        }
        googleAnalyticsCtrl.menuList = dataPassingService.menuObj[menuObjectInstanceName];
    };

    // For MainEnter 
    function tick(e) {
        var k = .1 * e.alpha;
        // Push nodes toward their designated focus.
        if (dataPassingService.menuObj[menuObjectInstanceName]) {
            nodes.forEach(function (o, i) {
                if (dataPassingService.menuObj[menuObjectInstanceName][o.name]) {
                    o.y += (dataPassingService.menuObj[menuObjectInstanceName][o.name].y - o.y) * k;
                    o.x += (dataPassingService.menuObj[menuObjectInstanceName][o.name].x - o.x) * k;
                }
            });
            node
                .attr("cx", function (d) { return d.x; })
                .attr("cy", function (d) { return d.y; });
        }
    }
    // For Sub Enter 
    function subTick(e) {
        var k = .1 * e.alpha;
        // Push nodes toward their designated focus.
        subNodes.forEach(function (o, i) {
            o.x += (0 - o.x) * k;
            o.y += (0 - o.y) * k;
        });
        subNode
            .attr("cx", function (d) { return d.x + ($window.innerWidth * 0.15) / 2 - 15; })
            .attr("cy", function (d) { return d.y + ($window.innerWidth * 0.15) / 4; });
    }
    // For Enter
    function collide(alpha) {
        var quadtree = d3.geom.quadtree(nodes);
        return function (d) {
            var r = d.radius + 10 + Math.max(padding, cluster_padding),
                nx1 = d.x - r,
                nx2 = d.x + r,
                ny1 = d.y - r,
                ny2 = d.y + r;
            quadtree.visit(function (quad, x1, y1, x2, y2) {
                if (quad.point && (quad.point !== d)) {
                    var x = d.x - quad.point.x,
                        y = d.y - quad.point.y,
                        l = Math.sqrt(x * x + y * y),
                        r = d.radius + quad.point.radius + (d.choice === quad.point.choice ? padding : cluster_padding);
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
    // Enter User with Animation
    function enterUser(menuObj, row) {
        var indx = uniqIndex(row[0]);
        nodes.push({ name: row[0], color: menuObj[row[0]]['color'], x: 150, y: (indx + 1) * 20 + 10 });
        force.start();
        node = node.data(nodes);
        node.enter().append("circle")
            .attr("class", "node")
            .attr("main", "main")
            .attr("cx", function (d) { return d.x || 0; })
            .attr("cy", function (d) { return d.y || 0; })
            .each(collide(.5))
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
            .call(force.drag);
    }
    // Exit User with Animation
    function exitUser(elementId) {
        d3.select("#" + elementId)
            .style("pointer-events", "none")
            .attr("remove", "yes")
            .transition()
            .duration(1400)
            .attr("transform", "translate(" + (mainWIndowWidth * 0.15 - 50) + "," + (document.getElementById("sub_svg").getBoundingClientRect().top - document.getElementById('main_svg').offsetTop) + ")scale(0)")
            .style("fill-opacity", 0)
            .remove();
    }

    function uniqIndex(name) {
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
    // For Real Time
    function _getAnalyticsDataByTime(selectedTime) {
        googleAnalyticsService.serverRequest(NODE_WEB_API.ALL_TIME_DATA_API + '?startDate=' + selectedTime.time.startDate + '&endDate=' + selectedTime.time.endDate + '&dimensionsId=' + googleAnalyticsCtrl.selectedSource.gaValue, 'GET')
            .then(_setAllTimeAPIData);
    }
    // For Display All Time API Data
    function _setAllTimeAPIData(resultWeb) {
        var scaleIndex = SCALING_INDEX;
        googleAnalyticsCtrl.totalUserWithinTime = resultWeb.totalsForAllResults['ga:users'];
        googleAnalyticsCtrl.bounceRate = parseFloat(resultWeb.totalsForAllResults['ga:bounceRate']).toFixed(2) + '%';
        googleAnalyticsCtrl.exitRate = parseFloat(resultWeb.totalsForAllResults['ga:exitRate']).toFixed(2) + '%';
        googleAnalyticsCtrl.avgTimeOnSite = (parseFloat(resultWeb.totalsForAllResults['ga:avgTimeOnPage']) / 60).toFixed(1) + 'min';
        scaleIndex = _scaleIndexUpdate(googleAnalyticsCtrl.totalUserWithinTime, scaleIndex);
        var totalCircle = parseInt(((googleAnalyticsCtrl.totalUserWithinTime / scaleIndex) * 10));
        if (totalCircle > subCircleCount) {
            subCircleCount = totalCircle - subCircleCount;
            for (var i = 0; i < subCircleCount; i++) {
                _enterSubUser();
            }
        } else if (totalCircle < subCircleCount) {
            subCircleCount = subCircleCount - totalCircle;
            for (var i = 0; i < subCircleCount; i++) {
                _exitSubUser(removeSubIndex)
                removeSubIndex++;
            }
        }
        subCircleCount = totalCircle;
        if (!dataPassingService.menuObj[menuObjectInstanceName]) {
            dataPassingService.menuObj[menuObjectInstanceName] = {};
        }
        angular.forEach(resultWeb.rows, function (value, key) {
            if (!dataPassingService.menuObj[menuObjectInstanceName][value[0]])
                dataPassingService.menuObj[menuObjectInstanceName][value[0]] = {}
            if (!dataPassingService.menuObj[menuObjectInstanceName][value[0]]['data'])
                dataPassingService.menuObj[menuObjectInstanceName][value[0]]['data'] = [];
            if (!dataPassingService.menuObj[menuObjectInstanceName][value[0]]['color'])
                dataPassingService.menuObj[menuObjectInstanceName][value[0]]['color'] = color; color++;
            if (!dataPassingService.menuObj[menuObjectInstanceName][value[0]]['x']) {
                dataPassingService.menuObj[menuObjectInstanceName][value[0]]['x'] = dim;
                dataPassingService.menuObj[menuObjectInstanceName][value[0]]['y'] = 50;
                dim = dim + 200;
            }
        });
        googleAnalyticsCtrl.menuList = dataPassingService.menuObj[menuObjectInstanceName];
        console.log(googleAnalyticsCtrl.menuList)
    }

    //For Display Sub Circle 
    function _enterSubUser() {
        subNodes.push({ color: 1, x: 0, y: 0 });
        forceSub.start();
        subNode = subNode.data(subNodes);
        subNode.enter().append("circle")
            .attr("class", "node")
            .each(collide(.5))
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
            .style("stroke", function (d) { return d3.rgb(fill(d.color)).darker(2); })
            .call(forceSub.drag);
    }

    // For Remove Sub Circle 
    function _exitSubUser(index) {
        d3.select(subNode[0][index])
            .style("pointer-events", "none")
            .transition()
            .style("fill-opacity", 0)
            .remove();
    }
    // For Update Scaling Index
    function _scaleIndexUpdate(users, scaleIndex) {
        if (users / scaleIndex > 1) {
            scaleIndex = _scaleIndexUpdate(users, scaleIndex * 10)
        }
        return scaleIndex;
    }
}