angular.module('googleAnalyticsModule')
    .controller('googleAnalyticsController', _googleAnalyticsController);
_googleAnalyticsController.$inject = ['$timeout', 'googleAnalyticsService', '$window', '$document', 'NODE_WEB_API', '$interval', 'VIEWING_BY_SOURCE', 'dataPassingService', 'VIEWING_BY_TIME'];
function _googleAnalyticsController($timeout, googleAnalyticsService, $window, $document, NODE_WEB_API, $interval, VIEWING_BY_SOURCE, dataPassingService, VIEWING_BY_TIME) {
    console.log(VIEWING_BY_TIME)
    var googleAnalyticsCtrl = this,
        intervalInstance,
        menuObjectInstanceName,
        devW = $window.innerWidth,
        devH = $window.innerHeight,
        mainSvgWidth = 0.9 * devW,
        mainSvgHeight = 0.7 * devH,
        fill = d3.scale.category10(),
        dim = 100,
        color = 1,
        nodes = [],
        padding = 1,
        cluster_padding = 10,
        svg = d3.select("#main_svg").append("svg")
            .attr("width", mainSvgWidth)
            .attr("height", mainSvgHeight)
            .attr("class", 'svg-main-window')
            .attr("border", 1),
        force = d3.layout.force()
            .nodes(nodes)
            .links([])
            .gravity(0.05)
            .distance(50)
            .charge(-60)
            .size([mainSvgWidth, mainSvgHeight])
            .friction(.9)
            .on("tick", tick),
        node = svg.selectAll("circle");
    // Functions 
    googleAnalyticsCtrl.startTime = _startTime;
    googleAnalyticsCtrl.setColor = _setColor;
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
    intervalInstance = $interval(_callRealtimeDataAPI, 10000);
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
            .then(function (resultWeb) {
                _displayApiData(resultWeb)
            });
    }
    // For Source Selection Change 
    function _sourceSelection(selectData) {
        dim = 100;
        color = 1;
        dataPassingService.menuObj[menuObjectInstanceName] = {};
        d3.selectAll("circle")
            .style("pointer-events", "none")
            .transition()
            .duration(1400)
            .attr("transform", "translate(35,411)scale(23)rotate(180)")
            .transition()
            .delay(15000)
            .attr("transform", "translate(35,411)scale(23)")
            .style("fill-opacity", 0)
            .remove();
        menuObjectInstanceName = selectData.name;
        $interval.cancel(intervalInstance);
        _callRealtimeDataAPI();
        intervalInstance = $interval(_callRealtimeDataAPI, 10000);
    }

    // For Display API Data
    function _displayApiData(result) {
        var exitArray = [];
        if (result.status === 200) {
            console.log(result)
            var res = result.data;
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
                        dataPassingService.menuObj[menuObjectInstanceName][value[0]]['y'] = dim;
                        dim = dim + 100;
                    }
                    if (parseInt(value[1], 10) - dataPassingService.menuObj[menuObjectInstanceName][value[0]]['data'].length > 0) {
                        var length = dataPassingService.menuObj[menuObjectInstanceName][value[0]]['data'].length;
                        for (var j = 0; j < (parseInt(value[1], 10) - length); j++) {
                            dataPassingService.menuObj[menuObjectInstanceName][value[0]]['data'].push({ name: value[0], color: dataPassingService.menuObj[menuObjectInstanceName][value[0]]['color'] });
                            enterUser(dataPassingService.menuObj[menuObjectInstanceName], value);
                        }
                    } else if (parseInt(value[1], 10) - dataPassingService.menuObj[menuObjectInstanceName][value[0]]['data'].length < 0) {
                        var length = dataPassingService.menuObj[menuObjectInstanceName][value[0]]['data'].length;
                        for (var j = 0; j < length - parseInt(value[1], 10); j++) {
                            dataPassingService.menuObj[menuObjectInstanceName][value[0]]['data'].pop();
                            var Index = nodes.map(function (x) { return x.name }).indexOf(value[0]);
                            exitArray.push(nodes[Index]);
                            nodes.splice(Index, 1);
                        }
                    }
                });
                exitUser(exitArray);
            } else {
                node.remove();
            }
            googleAnalyticsCtrl.menuList = dataPassingService.menuObj[menuObjectInstanceName];
        }
    };

    // For Enter 
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

    function enterUser(menuObj, row) {
        var indx = uniqIndex(row[0]);
        nodes.push({ name: row[0], color: menuObj[row[0]]['color'], x: 0, y: (indx + 1) * 20 + 10 });
        force.start();
        node = node.data(nodes);
        node.enter().append("circle")
            .attr("class", "node")
            .attr("main", "main")
            .attr("cx", function (d) { return d.x || 0; })
            .attr("cy", function (d) { return d.y || 0; })
            .each(collide(.5))
            .attr("r", 8)
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
            .call(force.drag);
    }

    function exitUser(exitArray) {
        var Index;
        if (exitArray.length) {
            angular.forEach(exitArray, function (value) {
                Index = node[0].map(function (o) {
                    return parseInt(o.getAttribute("index_id"));
                }).indexOf(value.index);
                d3.select(node[0][Index])
                    .style("pointer-events", "none")
                    .transition()
                    .duration(750)
                    .attr("transform", "translate(35,411)scale(23)rotate(180)")
                    .transition()
                    .delay(1500)
                    .attr("transform", "translate(35,411)scale(23)")
                    .style("fill-opacity", 0)
                    .remove();
            })
        }
    }

    function uniqIndex(name) {
        var countries = nodes.map(function (n) { return n.name });
        var u = countries.filter(function (v, i) { return countries.indexOf(v) == i; });
        var indx = u.indexOf(name);
        indx = indx > 0 ? indx : 0;
        return indx;
    }

    function _setColor(colorKey) {
        return d3.rgb(fill(colorKey));
    }

    function _getAnalyticsDataByTime(selectedTime) {
        googleAnalyticsService.serverRequest(NODE_WEB_API.ALL_TIME_DATA_API + '?startDate=' +  selectedTime.time.startDate + '&endDate='  +  selectedTime.time.endDate , 'GET')
            .then(function (resultWeb) {
                console.log('resultWeb', resultWeb)
            });
    }

}