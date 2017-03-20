
var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    devW = w.innerWidth || e.clientWidth || g.clientWidth,
    devH = w.innerHeight|| e.clientHeight|| g.clientHeight;
console.log(devW + ' × ' + devH);
var width = 0.6*devW,
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
var borderPath = svg.append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("height", height)
    .attr("width", width)
    .style("stroke", 'black')
    .style("fill", "none")
    .style("stroke-width", 1);
var force = d3.layout.force()
    .nodes(nodes)
    .links([])
    .gravity(0)
    .size([width, height])
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
            force.start();
            for (country in countryObj) {
                country['data'] = [];
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
        for (country in countryObj) {
            if (countryObj[country].data.length) {
                flag = true;
                var countryName = document.createElement("LI");
                countryName.innerHTML = '<div style="display:inline-block;width:20px;height:20px;border-radius: 10px; color : ' + d3.rgb(fill(countryObj[country].color)) + ';'+'width: 20px;height:20px;'+ 'background-color : ' + d3.rgb(fill(countryObj[country].color)) + '"></div> <span style="color: gray;">' + country + ' </span>';
                document.getElementById("countries").appendChild(countryName);
            }
        }
        if (!flag) {
            var countryName = document.createElement("LI");
            countryName.innerHTML = '<span>No Active User</span>'
            document.getElementById("countries").appendChild(countryName)
        }
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


function enterUser(countryObj,row){
    console.log(row,countryObj);
    nodes.push({ country: row[0], color: countryObj[row[0]]['color'] });
    force.start();
    node = node.data(nodes);
    node.enter().append("circle")
        .attr("class", "node")
        .attr("cx", function (d) { return d.x || 0; })
        .attr("cy", function (d) { return d.y || 0; })
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