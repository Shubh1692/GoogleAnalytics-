angular.module('googleAnalyticsModule')
    .controller('googleAnalyticsController', _googleAnalyticsController);
_googleAnalyticsController.$inject = ['$timeout', 'googleAnalyticsService', '$window', '$document', 'NODE_WEB_API', '$interval', 'VIEWING_BY_SOURCE', 'dataPassingService', 'VIEWING_BY_TIME', 'REAL_TIME_API_TIME_INTERVAL', 'SCALING_INDEX', 'MAX_MENU_COUNT'];
function _googleAnalyticsController($timeout, googleAnalyticsService, $window, $document, NODE_WEB_API, $interval, VIEWING_BY_SOURCE, dataPassingService, VIEWING_BY_TIME, REAL_TIME_API_TIME_INTERVAL, SCALING_INDEX, MAX_MENU_COUNT) {
    var googleAnalyticsCtrl = this,
        intervalInstance,
        subForceGlobal, subForceNodes,
        menuObjectInstanceName,
        fill = d3.scale.category20(),
        color = 1,
        nodes = [],
        padding = 1,
        cluster_padding = 10,
        mainSvgHeight = $window.innerHeight,
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
            .gravity(.02)
            .charge(0)
            .on("tick", tick),
        node = svg.selectAll(".main_circle"),
        rectangleMenu = svg.append("rect")
            .attr("width", 200)
            .attr("height", mainSvgHeight)
            .style("fill", d3.rgb(255, 255, 255))
            .style("stroke", d3.rgb(255, 255, 255)),
        rectangleBowl = svg.append("rect")
            .attr("width", mainSvgWidth)
            .attr("height", mainSvgHeight * 0.5)
            .attr("y", mainSvgHeight * 0.5)
            .style("fill", d3.rgb(255, 255, 255))
            .style("stroke", d3.rgb(255, 255, 255));
    // Controller Functions 
    googleAnalyticsCtrl.startTime = _startTime;
    googleAnalyticsCtrl.setColor = _setColor;
    googleAnalyticsCtrl.bowlWidth = bowlSvgWidth;
    googleAnalyticsCtrl.bowlHeight = (mainSvgHeight * 0.15);
    googleAnalyticsCtrl.maxMenuCount = MAX_MENU_COUNT;
    googleAnalyticsCtrl.bowlTopHeight = bowlSvgHeight * 0.35;
    googleAnalyticsCtrl.bowlTopBottomPostion = bowlSvgHeight - ((bowlSvgHeight * 0.35) / 2) + (mainSvgHeight * 0.15);
    // Default Values
    googleAnalyticsCtrl.onsiteUser = 0;
    googleAnalyticsCtrl.totalUserWithinTime = 0;
    googleAnalyticsCtrl.bounceRate = 0 + '%';
    googleAnalyticsCtrl.exitRate = 0 + '%';
    googleAnalyticsCtrl.avgTimeOnSite = 0 + 'min';
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
    var clusters = new Array(1);
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
    // Move d to be adjacent to the cluster node.
    function mainCluster(alpha) {
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
    function mainCollides(alpha) {
        var quadtree = d3.geom.quadtree(nodes);
        return function (d) {
            var r = d.radius + 4 + Math.max(padding, 6),
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
    var flag = true;
    // For Get API Data
    function _callRealtimeDataAPI() {
        // var res = {
        //     totalsForAllResults: {
        //         'rt:activeUsers': 10
        //     }
        // }
        googleAnalyticsService.serverRequest(NODE_WEB_API.REAL_TIME_DATA_API + '?dimensionsId=' + googleAnalyticsCtrl.selectedSource.value, 'GET')
            .then(_displayApiData);
        // if (flag) {
        //     res.rows = [["India", 2]]
        // } else {
        //     res.rows = [["India", 3]]
        // }
        // flag = !flag
        // _displayApiData(res)
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
                    dataPassingService.menuObj[menuObjectInstanceName][value[0]]['x'] = 100;
                    dataPassingService.menuObj[menuObjectInstanceName][value[0]]['y'] = 50;
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
                        if (nodeValue.getAttribute("show-menu") === value[0] && nodeValue.getAttribute("remove") === "no" && rotation) {
                            dataPassingService.menuObj[menuObjectInstanceName][value[0]]['data'].pop();
                            exitUser(nodeValue.getAttribute("id"), nodeValue.getAttribute("show-menu"));
                            rotation--;
                        }
                    });
                }
            });

        } else {
            angular.forEach(node[0], function (nodeValue) {
                if (nodeValue.getAttribute("remove") === "no") {
                    exitUser(nodeValue.getAttribute("id"), nodeValue.getAttribute("show-menu"));
                }
            });
            angular.forEach(dataPassingService.menuObj[menuObjectInstanceName], function (value, key) {
                dataPassingService.menuObj[menuObjectInstanceName][key].data = [];
            });
        }
        googleAnalyticsCtrl.menuList = dataPassingService.menuObj[menuObjectInstanceName];
    };

    // For MainEnter 
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
            .each(mainCluster(10 * e.alpha * e.alpha))
            .each(mainCollides(.5))
            .attr("cx", function (d) { return d.x; })
            .attr("cy", function (d) { return d.y; });
    }
    // Enter User with Animation
    function enterUser(menuObj, row) {
        force.stop();
        var indx = uniqIndex(row[0]);
        nodes.push({ name: row[0], color: menuObj[row[0]]['color'], x: 150, y: (indx + 1) * 20 + 10, radius: 4, cluster: 0 });
        clusters[0] = { name: row[0], color: menuObj[row[0]]['color'], x: 150, y: (indx + 1) * 20 + 10, radius: 4, cluster: 0 };
        force.nodes(nodes);
        force.start();
        node = node.data(nodes);
        node.enter().append("circle")
            .attr("class", "node main_circle")
            .attr("main", "main")
            .attr("cx", function (d) { return d.x || 0; })
            .attr("cy", function (d) { return d.y || 0; })
            .attr("remove", "no")
            .attr("r", 4)
            .style("fill", function (d) {
                return d3.rgb(fill(d.color));
            })
            .attr("transform", "translate(0)")
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
    function exitUser(elementId, name) {
        var index = elementId.split('_')[elementId.split('_').length - 1];
        var mergeNode = svg.selectAll("circle[name='" + name + "']");
        d3.select("#" + elementId)
            .style("pointer-events", "none")
            .attr("remove", "yes")
            .transition()
            .each("end", function (e) {
                subForceGlobal.stop()
                var user = (parseInt(mergeNode[0][0].getAttribute("user")) + 1);
                mergeNode.attr("r", function (d) {
                    subForceNodes[d.index].radius = Math.log(user) * 4;
                    return Math.log(user) * 4;
                });
                mergeNode.attr("user", user);
                subForceGlobal.start();
            })
            .attr("transform", "translate(" + -(nodes[index].x -  parseFloat(mergeNode[0][0].getAttribute("cx"))) + "," + -(nodes[index].y - parseFloat(mergeNode[0][0].getAttribute("cy"))) + ")") //scale(0)
            .duration(1400)
            .remove();
    }

    // For Unique Index of Circle
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

    // For All Time
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
        svg.selectAll(".sub_circle")
            .remove();
        if (!dataPassingService.menuObj[menuObjectInstanceName]) {
            dataPassingService.menuObj[menuObjectInstanceName] = {};
        }
        angular.forEach(dataPassingService.menuObj[menuObjectInstanceName], function(value, key){
            dataPassingService.menuObj[menuObjectInstanceName][key]['display'] = false;
        })
        if (resultWeb.rows && resultWeb.rows.length) {
            _enterSubUser(resultWeb.rows, googleAnalyticsCtrl.totalUserWithinTime);
        }
        googleAnalyticsCtrl.menuList = dataPassingService.menuObj[menuObjectInstanceName];
        console.log(dataPassingService.menuObj[menuObjectInstanceName])
    }

    // For Update Scaling Index
    function _scaleIndexUpdate(users, scaleIndex) {
        if (users / scaleIndex > 1) {
            scaleIndex = _scaleIndexUpdate(users, scaleIndex * 10)
        }
        return scaleIndex;
    }

    function _enterSubUser(nodeData, totalUser) {
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
                dataPassingService.menuObj[menuObjectInstanceName][value[0]] = {}
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
            subNodes[key].radius = Math.log(value[1]) * 4;
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
                subNode
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
}