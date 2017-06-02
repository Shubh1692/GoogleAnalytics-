angular.module('googleAnalyticsModule')
    .controller('d3Controller', _d3Controller)

_d3Controller.$inject = ['$timeout', '$window', '$document', '$interval'];
function _d3Controller($timeout, $window, $document, $interval) {
    var d3Ctrl = this;
    // Controller Function
    d3Ctrl.makeCircle = _makeCircle;
    d3Ctrl.moveCircle = _moveCircle;
    d3Ctrl.removeCircle = _removeCircle;
    var x = d3.scale.ordinal()
        .domain(d3.range(1))
        .rangePoints([0, 1000], 1);
    // Controller Variable
    d3Ctrl.focusId = '0';
    d3Ctrl.speed = '0.1';
    var mainWidth = 1000, mainHeight = 900, nodes = [], padding = 1, clusterPadding = 200, clusters = new Array(3),
        center = [{ x: 150, y: 400 }, { x: 450, y: 400 }, { x: 750, y: 400 }, { x: 100, y: 800 }],
        fill = d3.scale.category20(),
        svg = d3.select("#d3_layout_window").append("svg")
            .attr("width", mainWidth)
            .attr("height", mainHeight)
            .attr("class", 'svg-main-window')
            .attr("border", 1),
        force = d3.layout.force()
            .nodes(nodes)
            .size([mainWidth, mainHeight])
            .gravity(.2)
            .charge(1)
            .friction(0.00002)
            .on("tick", _tick)
            .start(),
        node = svg.selectAll("circle");
    $interval(force.start, 1);
    _createFocusPostion()
    function gravity(alpha) {
        return function (d) {
            d.y += (d.cy - d.y) * alpha;
            d.x += (d.cx - d.x) * alpha;
        };
    }
    function _tick(e) {
        if (nodes.length) {
            var k = .1 * e.alpha;
            nodes.forEach(function (o, i) {
                o.y += (center[o.id].y - o.y) * k;
                o.x += (center[o.id].x - o.x) * k;
            });
            node
                .each(_handelCluster(0.5 * e.alpha * e.alpha))
                .each(_handelCollides(.5))
                .each(gravity(.2 * e.alpha))
                .attr("cx", function (d) { return d.x; })
                .attr("cy", function (d) { return d.y; });
        }
    }

    function _makeCircle() {
        nodes.push({
            x: 0,
            y: 0,
            cx: 0,
            cy: 0,
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
            .call(force.drag);
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
        console.log(focusId)
        if (nodes[randomIndex].cluster !== focusId) {
            clusters[focusId] = {
                x: nodes[randomIndex].x,
                y: nodes[randomIndex].y,
                radius: 4,
                color: 1,
                cluster: focusId
            };
            nodes[randomIndex].cluster = focusId;
            nodes[randomIndex].id = focusId;
        }
    }

    function _removeCircle() {
        var randomIndex = ~~(Math.random() * nodes.length);
        clusters[2] = {
            x: nodes[randomIndex].x,
            y: nodes[randomIndex].y,
            radius: 4,
            color: 1,
            cluster: 2
        };
        nodes[randomIndex].cluster = 2;
        nodes[randomIndex].id = 3;
        console.log(randomIndex)
        console.log(d3.select('circle[id="' + randomIndex + '"]'))
        d3.select('circle[id="' + randomIndex + '"]')
            .transition()
            .each("end", function (e) {
                console.log(e)
                //  nodes.splice(randomIndex, 1);
            })
            //   .attr("transform", "translate(" + -100 + "," + -100 + ")") //scale(0)
            .duration(1400)
            .remove()
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