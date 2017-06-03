angular.module('googleAnalyticsModule')
    .controller('d3Controller', _d3Controller)

_d3Controller.$inject = ['$timeout', '$window', '$document', '$interval'];
function _d3Controller($timeout, $window, $document, $interval) {
    var d3Ctrl = this;
    // Controller Function
    d3Ctrl.makeCircle = _makeCircle;
    d3Ctrl.moveCircle = _moveCircle;
    var x = d3.scale.ordinal()
        .domain(d3.range(1))
        .rangePoints([0, 1000], 1);
    // Controller Variable // 36 to 50
    d3Ctrl.focusId = '0';
    d3Ctrl.speed = '0.1';
    var mainWidth = 1000, mainHeight = 1000, nodes = [], padding = 1, clusterPadding = 2, clusters = new Array(3),
        center = [{ x: 250, y: 250 }, { x: 500, y: 250, exteraX : 600, exteraY : 250 }, { x: 750, y: 250, exteraX : 948 , exteraY : 250}, { x: 250, y: 500 , exteraX : 250, exteraY : 600}],
        fill = d3.scale.category20(),
        svg = d3.select("#d3_layout_window").append("svg")
            .attr("width", mainWidth)
            .attr("height", mainHeight)
            .attr("class", 'svg-main-window')
            .attr("border", 1),
        force = d3.layout.force()
            .nodes(nodes)
            .size([500, 500])
            .gravity(.2)
            .charge(-30)
            .friction(0.00002)
            .on("tick", _tick)
            .on("end", function(e){
                console.log('e', e)
            })
            .start(),
        node = svg.selectAll("circle");
    $interval(force.start, 1);
    _createFocusPostion()
    function gravity(alpha) {
        return function (d) {
             if (d.id !== 0) {
                d.y += (center[d.id].exteraY - d.y) * alpha;
                d.x += (center[d.id].exteraX - d.x) * alpha;
           }
        };
    }
    function _tick(e) {
        if (nodes.length) {
            node
                .each(_handelCluster(0.5 * e.alpha * e.alpha))
                .each(_handelCollides(.5))
                .each(gravity(.5 * e.alpha))
                .attr("cx", function (d) {
                    return d.x;
                })
                .attr("cy", function (d) {
                    return d.y;
                });
        }
    }
    var drag = force.drag()
        .on("dragstart", function () {
            console.log('dragstart')
        })
        .on("dragend", function () {
            console.log('end')
        })

    function _makeCircle() {
        nodes.push({
            x: 0,
            y: 0,
            cx: center[0].x,
            cy: center[0].y,
            radius: 4,
            color: 1,
            cluster: 0,
            id: 0
        });
        clusters[0] = {
            x: 0,
            y: 0,
            radius: 4,
            color: 1,
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
            .call(drag);
        force.start();
    }

    // Resolves collisions between d and all other circles.
    function _handelCollides(alpha) {
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

    function _moveCircle(focusId) {
        var randomIndex = ~~(Math.random() * node[0].length);
        console.log(JSON.stringify(nodes[randomIndex]))
        if (nodes[randomIndex].cluster !== focusId) {
            clusters[focusId] = {
                x: 450,
                y: 450,
                radius: 4,
                color: 1,
                cluster: focusId
            };
            nodes[randomIndex].cluster = focusId;
            nodes[randomIndex].id = focusId;
        }
        force.start();
        if(focusId === 3) {
            d3.select('circle[id="' + randomIndex + '"]')
                .transition()
                .duration(1400)
                .remove();
        }
    }

    function _createFocusPostion() {
        angular.forEach(center, function (value) {
            d3.select('svg').append('circle')
                .attr("cx", value.x)
                .attr("cy", value.y)
                .attr("r", 4)
                .style("fill", d3.rgb(fill(9)))
        })

    }

}