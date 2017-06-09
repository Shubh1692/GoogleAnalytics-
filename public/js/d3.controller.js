angular.module('googleAnalyticsModule')
    .controller('d3Controller', _d3Controller)

_d3Controller.$inject = ['$timeout', '$window', '$document', '$interval'];
function _d3Controller($timeout, $window, $document, $interval) {
    var d3Ctrl = this;
    // Controller Function
    d3Ctrl.makeCircle = _makeCircle;
    d3Ctrl.moveCircle = _moveCircle;
    d3Ctrl.gravityRangeChange = _gravityRangeChange;
    d3Ctrl.chargeRangeChange = _chargeRangeChange;
    d3Ctrl.frictionRangeChange = _frictionRangeChange;
    // Controller Variable // 36 to 50
    d3Ctrl.focusId = '0';
    d3Ctrl.speed = '0';
    d3Ctrl.gravityRange = 0.2;
    d3Ctrl.chargeRange = -30;
    d3Ctrl.frictionRange = 0.00002;
    d3Ctrl.totalValue = {};
    var mainWidth = 1000, mainHeight = 1000, nodes = [], padding = 0, clusterPadding = 2, clusters = new Array(3),
        center = [{ x: 250, y: 250, exteraX: 250, exteraY: 250, color: "green" }, { x: 500, y: 250, exteraX: 600, exteraY: 250, color: "yellow" }, { x: 750, y: 250, exteraX: 948, exteraY: 250, color: "cyan" }, { x: 250, y: 500, exteraX: 250, exteraY: 600, color: "red" }],
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
            .on("end", function (e) {
                console.log('e', e)
            })
            .start(),
        node = svg.selectAll("circle");
    $interval(force.start, 1);
    _createFocusPostion()
    function gravity(alpha) {
        return function (d) {
            d.y += (center[d.id].exteraY - d.y) * alpha;
            d.x += (center[d.id].exteraX - d.x) * alpha;
        };
    }
    function _tick(e) {
        if (nodes.length) {
            node.each(_handelCluster(0.1 * e.alpha * e.alpha))
                .each(_handelCollides(.5))
                .each(gravity(.5 * e.alpha))
                .transition()
                .ease('linear')
                .duration(JSON.parse(d3Ctrl.speed))
                .attr('cx', function (d) { return d.x; })
                .attr('cy', function (d) { return d.y; })
                .each('end', function (d) {
                    if (d.cluster === 3 && d.x <= center[d.id].x + 2 && d.y >= center[d.id].y- 2)
                        d3.select('circle[id="' + d.index + '"]')
                            .remove();
                })
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
        var randomCircle = ~~(Math.random() * center.length - 1);
        nodes.push({
            x: 100,
            y: 100 + randomCircle * 100,
            cx: center[0].x,
            cy: center[0].y,
            radius: 4,
            color: center[randomCircle].color,
            cluster: 0,
            id: randomCircle
        });
        d3Ctrl.totalValue[center[randomCircle].color].push(nodes.length - 1);
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
                return d.color;
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

    function _moveCircle(focusId, randomIndex) {
        if (angular.isDefined(randomIndex) && nodes[randomIndex].cluster !== focusId) {
            d3.select('circle[id="' + randomIndex + '"]')
                .style('fill', center[focusId].color);
            clusters[focusId] = {
                x: 450,
                y: 450,
                radius: 4,
                color: 1,
                cluster: focusId
            };
            nodes[randomIndex].cluster = focusId;
            nodes[randomIndex].id = focusId;
            d3Ctrl.totalValue[nodes[randomIndex].color].pop();
            nodes[randomIndex].color = center[focusId].color;
            d3Ctrl.totalValue[center[focusId].color].push(randomIndex);

        }
        force.start();
        if (focusId === 3) {
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
                .attr("r", 2)
                .style("fill", value.color)
        });
        angular.forEach(center, function (value, key) {
            d3Ctrl.totalValue[value.color] = [];
            if (key !== center.length - 1) {
                d3.select('svg').append('circle')
                    .attr("cx", 100)
                    .attr("cy", 100 + key * 100)
                    .attr("r", 4)
                    .style("fill", value.color);
            }
        })

    }


    function _gravityRangeChange() {
        force.gravity(d3Ctrl.gravityRange);
    }

    function _chargeRangeChange() {
        force.charge(d3Ctrl.chargeRange);
    }

    function _frictionRangeChange() {
        force.friction(d3Ctrl.frictionRange);
    }

}