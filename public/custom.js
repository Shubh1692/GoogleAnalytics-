
var w = window,
    d = document,
    prevTotal =-1,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    devW = w.innerWidth || e.clientWidth || g.clientWidth,
    devH = w.innerHeight|| e.clientHeight|| g.clientHeight;
console.log(devW + ' × ' + devH);
var width = 0.9*devW,
    height = 0.7*devH;
var fill = d3.scale.category10();
var dim = 100, color = 1;
var nodes = [];
var countryObj = {};
var svg = d3.select("#chart").append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class", 'dashboard')
    .attr("border", 1);

var force = d3.layout.force()
    .nodes(nodes)
    .links([])
    .gravity(0.05)
    .distance(50)
    .charge(-60)
    .size([width, height])
    .friction(.9)
    .on("tick", tick);
var node = svg.selectAll("circle");
var xhttp = new XMLHttpRequest();
xhttp.onreadystatechange = _onStateChange;

function _onStateChange() {
    if (this.readyState === 4 && this.status === 200) {
        var res = JSON.parse(this.response); //this.response
        if (res.rows && res.rows.length !== 0) {
            for (country in countryObj) {
                if (res.rows.map(function (o) { return o[0] }).indexOf(country) === -1) {
                    res.rows.push([country, 0])
                }
            }
            for (var i = 0; i < res.rows.length; i++) {
                if (!countryObj[res.rows[i][0]])
                    countryObj[res.rows[i][0]] = {}
                if (!countryObj[res.rows[i][0]]['data'])
                    countryObj[res.rows[i][0]]['data'] = [];
                if (!countryObj[res.rows[i][0]]['color'])
                    countryObj[res.rows[i][0]]['color'] = color; color++;
                if (!countryObj[res.rows[i][0]]['x']) {
                    countryObj[res.rows[i][0]]['x'] = dim;
                    countryObj[res.rows[i][0]]['y'] = dim;
                    dim = dim + 100;
                }
                if (parseInt(res.rows[i][1], 10) - countryObj[res.rows[i][0]]['data'].length > 0) {
                    var length = countryObj[res.rows[i][0]]['data'].length;
                    console.log(length)
                    for (var j = 0; j < (parseInt(res.rows[i][1], 10) - length); j++) {
                        countryObj[res.rows[i][0]]['data'].push({ country: res.rows[i][0], color: countryObj[res.rows[i][0]]['color'] });
                        enterUser(countryObj,res.rows[i]);


                    }
                } else if (parseInt(res.rows[i][1], 10) - countryObj[res.rows[i][0]]['data'].length < 0) {
                    var length = countryObj[res.rows[i][0]]['data'].length;
                    for (var j = 0; j < length - parseInt(res.rows[i][1], 10); j++) {
                        countryObj[res.rows[i][0]]['data'].pop();
                        exitUser(res.rows[i]);
                    }
                }
            }
        } else {
            console.log(countryObj)
            force.start();
            for (country in countryObj) {
                countryObj[country]['data'] = [];
            }
            dim = 100;
            for (var j = 0; j < nodes.length; j++) {

                if (node[0][j] && node[0][j].remove) {
                    node[0][j].remove();
                }
            }
            node = node.data(nodes);
            //   node[0] = []
        }
        document.getElementById("countries").innerHTML = ''
        var flag = false;

        svg.selectAll(".circle").remove();
        svg.selectAll(".circle")
            .data(nodes).enter()
            .append("circle")
            .attr("class", "node")
            .attr("cx", function (d, i) {
                return 160
            })
            .attr("cy", function (d, i) {
                return (i + 1) * 20 + 10
            })
            .attr("r", 8)
            .style("fill", function (d) {
                return d3.rgb(fill(d.color));
            })
            .style("stroke", function (d) {
                return d3.rgb(fill(d.color)).darker(2);
            });

        svg.selectAll(".labels").remove();

        svg.append("g")
            .attr("class", "labels")
            .selectAll("text")
            .data(nodes)
            .enter().append("text")
            .attr("x", function (d, i) {
                return 130
            })
            .attr("y", function (d, i) {
                return (i + 1) * 20 + 10
            })
            .attr("dx", 12)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .text(function (d) {
                return d.country
            });


    }
};
function tick(e) {
    var k = .1 * e.alpha;
    // Push nodes toward their designated focus.
    nodes.forEach(function (o, i) {
        o.y += (countryObj[o.country].y - o.y) * k;
        o.x += (countryObj[o.country].x - o.x) * k;
    });
    node
        .attr("cx", function (d) { return d.x; })
        .attr("cy", function (d) { return d.y; });
}
var responseVar = [["Russia", "4"], ["India", "1"], ["sfsfs", "4"]], flag;
_callApi();
setInterval(_callApi, 10000);
function _callApi() {

    xhttp.open("GET", "getGoogleAnalyticsData", true);
    xhttp.send();
}

var node_radius = 5,
    padding = 1,
    cluster_padding = 10,
    num_nodes = 200;


function collide(alpha) {
    var quadtree = d3.geom.quadtree(nodes);
    return function(d) {
        var r = d.radius + 10 + Math.max(padding, cluster_padding),
            nx1 = d.x - r,
            nx2 = d.x + r,
            ny1 = d.y - r,
            ny2 = d.y + r;
        quadtree.visit(function(quad, x1, y1, x2, y2) {
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



function enterUser(countryObj,row){
    console.log(row,countryObj);

    var indx = uniqIndex(row[0])
    nodes.push({ country: row[0], color: countryObj[row[0]]['color'],x: 160,y:(indx+1)*20 + 10 });
    force.start();
    node = node.data(nodes);
    node.enter().append("circle")
        .attr("class", "node")
        .attr("cx", function (d) { return d.x || 0; })
        .attr("cy", function (d) { return d.y || 0; })
        .each(collide(.5))
        .attr("r", 8)
        .style("fill", function (d) {
            return d3.rgb(fill(d.color));
        })
        .style("stroke", function (d) { return d3.rgb(fill(d.color)).darker(2); })
        .call(force.drag);



    node.exit().remove();


}

function exitUser(row){
    var Index = nodes.map(function (x) { return x.country }).indexOf(row[0]);
    if (node[0][Index] && node[0][Index].remove) {
        node[0][Index].remove();
        node[0].splice(Index, 1);
    }
}

// For Time
function startTime() {
    var today = new Date();
    // var day = today.getDay();

    today = new Date(today).toUTCString();
    var day = today.split(' ').slice(0, 4).join(' ');
    var time = today.split(' ').slice(4,5).join(' ');
    document.getElementById('day').innerHTML = day;
    document.getElementById('currentTime').innerHTML = time;

    setTimeout(startTime, 1000);
}

function uniqIndex(country){
    var countries = nodes.map(function(n) { return n.country});
    var u =  countries.filter(function(v,i) { return countries.indexOf(v) == i; });

    var indx = u.indexOf(country);
    indx = indx>0 ?indx:0;

    return indx;
}

function uniqCountriesTotal(country){
    var countries = nodes.map(function(n) { return n.country});
    var u =  countries.filter(function(v,i) { return countries.indexOf(v) == i; });
    return u.length;
}