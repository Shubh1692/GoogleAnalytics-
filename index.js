require('./server/common'); // require common file code
var express = require('express'), // require express cod
    bodyParser = require('body-parser'), // require body-parser code
    google = require('googleapis'), // require googleapis code
    app = express(),
    CONFIG = require('./app.config'),
    _ = require('lodash'),
    CryptoJS = require("crypto-js"),
    cors = require('cors'),
    countryCodes = require('country-data').countries,
    http = require('http').Server(app),
    io = require('socket.io')(http),
    dashboardSocketInstance = {},
    Q = require("q");
app.use(bodyParser.urlencoded({
    extended: false
}));
// parse application/json
app.use(bodyParser.json());
app.use(cors())
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', CONFIG.REQUEST_HEADER['Access-Control-Allow-Origin']);
    res.setHeader('Access-Control-Allow-Methods', CONFIG.REQUEST_HEADER['Access-Control-Allow-Methods']);
    res.setHeader('Access-Control-Allow-Headers', CONFIG.REQUEST_HEADER['Access-Control-Allow-Headers']);
    res.setHeader('Access-Control-Allow-Credentials', CONFIG.REQUEST_HEADER['Access-Control-Allow-Credentials']);
    next();
});
// here public is name of a folder of static file
app.use(express.static('public'));
app.set('port', (process.env.PORT || CONFIG.NODE_SERVER_PORT));
AnalyticsController = require('./server/Controller/AnalyticsController'); // require Controller code
// Google Analytics Authentication
let jwtClient = new google.auth.JWT(CONFIG.GOOGLE_CLINET_CONFIG.client_email, null, CONFIG.GOOGLE_CLINET_CONFIG.private_key, ['https://www.googleapis.com/auth/analytics.readonly'], null);
jwtClient.authorize(function (err, tokens) {
    if (err) {
        console.log('error ', err);
        return;
    }
    let analytics = google.analytics('v3');
});
// Get Real Time Data API
app.get('/getGoogleAnalyticsRealTimeData', function (req, res) {
    var responseVar = {};
    var dimensions = _.reject(CONFIG.GOOGLE_DEFAULT_REAL_TIME_DIMENSIONS_PART_ONE, function (o) { return o === req.query.dimensionsId })
    google.analytics('v3').data.realtime.get({
        'auth': jwtClient,
        'ids': CONFIG.GOOGLE_APP_VIEW_ID,
        'metrics': 'rt:activeUsers',
        'dimensions': req.query.dimensionsId + ',rt:eventCategory, rt:eventAction,' + CONFIG.GOOGLE_DEFAULT_REAL_TIME_DIMENSIONS_PART_ONE
    }, function (err, response) {
        responseVar.first = response.rows || [];
        _realTimeSuccessCalling(err, responseVar, res, true)
    }, function (err) {
        res.send({
            errorMessage: CONFIG.REAL_TIME_API_ERROR_MESSAGE,
            data: err
        });
    });
    google.analytics('v3').data.realtime.get({
        'auth': jwtClient,
        'ids': CONFIG.GOOGLE_APP_VIEW_ID,
        'metrics': 'rt:activeUsers',
        'dimensions': req.query.dimensionsId + ',rt:eventCategory, rt:eventAction,' + CONFIG.GOOGLE_DEFAULT_REAL_TIME_DIMENSIONS_PART_TWO
    }, function (err, response) {
        if (response) {
            responseVar.second = response.rows || [];
        } else {
            responseVar.second = [];
        }
        _realTimeSuccessCalling(err, responseVar, res)
    }, function (err) {
        res.send({
            errorMessage: CONFIG.REAL_TIME_API_ERROR_MESSAGE,
            data: err
        });
    });
});
// Get All Data API
app.post('/getGoogleAnalyticsAllData', function (req, res) {
    google.analytics('v3').data.ga.get({
        'auth': jwtClient,
        'ids': CONFIG.GOOGLE_APP_VIEW_ID,
        'start-date': req.body.startDate,
        'end-date': req.body.endDate,
        'metrics': CONFIG.GOOGLE_DEFAULT_ALL_TIME_DATA_METRICS,
        'dimensions': req.body.dimensionsId,
        'sort': '-ga:users'
    }, function (err, response) {
        if (err) {
            res.send({
                errorMessage: CONFIG.ALL_TIME_API_ERROR_MESSAGE,
                data: err
            });
            return;
        }
        response = {
            rows: response.rows,
            totalsForAllResults: response.totalsForAllResults
        }
        AnalyticsController.findAnalyticsData({ current_event_name: { $ne: 'disconnect' } })
            .then(function (onlineUserData) {
                var currentOnlineUsers = [];
                onlineUserData.forEach(function (onlineUser) {
                    if (io.sockets.sockets[onlineUser.socket_id] && io.sockets.sockets[onlineUser.socket_id].connected) {
                        if (onlineUser.current_event_name === 'onload')
                            onlineUser.user_info = onlineUser.socket_id;
                        else {
                            currentOnlineUsers.push(['onload', onlineUser.socket_id, onlineUser.country_code, onlineUser.browser, onlineUser.device, 'NEW', onlineUser.country_name, 'No Set', onlineUser.os, new Date().getHours(), new Date().getMinutes()])
                        }
                        currentOnlineUsers.push([onlineUser.current_event_name, onlineUser.user_info, onlineUser.country_code, onlineUser.browser, onlineUser.device, 'NEW', onlineUser.country_name, 'No Set', onlineUser.os, new Date().getHours(), new Date().getMinutes()])
                    }
                })
                response.onlineUserData = currentOnlineUsers;
                res.send({
                    successMessage: CONFIG.ALL_TIME_API_SUCCESS_MESSAGE,
                    data: response
                });
            });
    }, function (err) {
        res.send({
            errorMessage: CONFIG.ALL_TIME_API_ERROR_MESSAGE,
            data: err
        });
    });
});

app.get('/getGoogleAnalyticsUserData', function (req, res) {
    var responseVar = {};
    google.analytics('v3').data.ga.get({
        'auth': jwtClient,
        'ids': CONFIG.GOOGLE_APP_VIEW_ID,
        'start-date': CONFIG.GOOGLE_MENU_DATA_START_DATE,
        'end-date': new Date().toISOString().slice(0, 10),
        'metrics': 'ga:users',
        'dimensions': CONFIG.GOOGLE_DEFAULT_USER_DATA_DIMENSIONS_PRAT_ONE,
        'sort': '-ga:date'
    }, function (err, response) {
        if (err) {
            res.send({
                errorMessage: CONFIG.ALL_TIME_GET_USER_API_ERROR_MESSAGE,
                data: err
            });
            return;
        }
        responseVar.first = response.rows;
        _getUserDataSuccessCalling(err, responseVar, res, response)
    }, function (err) {
        res.send({
            errorMessage: CONFIG.ALL_TIME_GET_USER_API_ERROR_MESSAGE,
            data: err
        });
    });
    google.analytics('v3').data.ga.get({
        'auth': jwtClient,
        'ids': CONFIG.GOOGLE_APP_VIEW_ID,
        'start-date': CONFIG.GOOGLE_MENU_DATA_START_DATE,
        'end-date': new Date().toISOString().slice(0, 10),
        'metrics': 'ga:users',
        'dimensions': CONFIG.GOOGLE_DEFAULT_USER_DATA_DIMENSIONS_PRAT_TWO,
        'sort': '-ga:date'
    }, function (err, response) {
        if (err) {
            res.send({
                errorMessage: CONFIG.ALL_TIME_GET_USER_API_ERROR_MESSAGE,
                data: err
            });
            return;
        }
        responseVar.second = response.rows;
        _getUserDataSuccessCalling(err, responseVar, res, response)
    }, function (err) {
        res.send({
            errorMessage: CONFIG.ALL_TIME_GET_USER_API_ERROR_MESSAGE,
            data: err
        });
    });
})

app.get('/getRealTimeDataDemoAPI', function (req, res) {
    var temp = _createDynmicDemoData(req.query.dimensionsId, req.query.changeFlag);

    res.send({
        successMessage: CONFIG.REAL_TIME_API_SUCCESS_MESSAGE,
        data: temp
    });
})
var userId = 0,
    dummyData = {
        rows: [],
        totalsForAllResults: {}
    },
    onload = [];

function _createDynmicDemoData(dimensionsId, changeFlag) {
    var countries, randomValue, userInfoData, encodeString,
        MaxCount = CONFIG.DUMMY_DATA_LIST.MAX_COUNT //parseInt(Math.random() * CONFIG.DUMMY_DATA_LIST.MAX_COUNT);
    dummyData.totalsForAllResults['rt:activeUsers'] = MaxCount;
    if (changeFlag === 'true' || changeFlag === true) {
        dummyData.rows = [];
    }
    if (dimensionsId === 'rt:country') {
        countries = _getCountryCode();
        for (var i = 0; i < MaxCount; i++) {
            userId++;
            randomValue = Math.random();
            var name = countries[parseInt(randomValue * 20)].name || 'India';
            var countryCodeVar = countries[parseInt(randomValue * 20)].alpha2 || 'IN';
            dummyData.rows.push([name.split(' ')[0], 'onload', userId, countryCodeVar, 'Chrome', 'DESKTOP', 'NEW', 1]);
            if (randomValue > 0.5) {
                dummyData.rows.splice(parseInt(randomValue * dummyData.rows.length - 1), 1);
                if (dummyData.rows[parseInt(randomValue * (dummyData.rows.length - 1))] && dummyData.rows[parseInt(randomValue * (dummyData.rows.length - 1))][1] === 'onload') {
                    var goalData = JSON.parse(JSON.stringify(dummyData.rows[parseInt(randomValue * (dummyData.rows.length - 1))]));
                    userInfoData = {
                        "userInfo": {
                            "NAME": CONFIG.DUMMY_DATA_LIST.DUMMY_USERS.NAME[parseInt(CONFIG.DUMMY_DATA_LIST.DUMMY_USERS.NAME.length * randomValue)],
                            "EMAIL": CONFIG.DUMMY_DATA_LIST.DUMMY_USERS.EMAIL[parseInt(CONFIG.DUMMY_DATA_LIST.DUMMY_USERS.EMAIL.length * randomValue)]
                        },
                        "id": goalData[2]
                    }
                    encodeString = CryptoJS.enc.Utf8.parse(JSON.stringify(userInfoData));
                    encodeString = CryptoJS.enc.Base64.stringify(encodeString);
                    goalData[1] = CONFIG.DUMMY_DATA_LIST.GOAL_EVENT_NAME;
                    goalData[2] = encodeString;
                    dummyData.rows.push(goalData);
                }
            }

        }
    } else if (dimensionsId === 'rt:browser') {
        for (var i = 0; i < MaxCount; i++) {
            userId++;
            randomValue = Math.random();
            dummyData.rows.push([CONFIG.DUMMY_DATA_LIST.DUMMY_BROWSER_LIST[parseInt(randomValue * CONFIG.DUMMY_DATA_LIST.DUMMY_BROWSER_LIST.length)], 'onload', userId, 'IN', CONFIG.DUMMY_DATA_LIST.DUMMY_BROWSER_LIST[parseInt(randomValue * CONFIG.DUMMY_DATA_LIST.DUMMY_BROWSER_LIST.length)], 'DESKTOP', 'NEW', 1]);
            if (randomValue > 0.5) {
                dummyData.rows.splice(parseInt(randomValue * dummyData.rows.length - 1), 1)
                if (dummyData.rows[parseInt(randomValue * (dummyData.rows.length - 1))] && dummyData.rows[parseInt(randomValue * (dummyData.rows.length - 1))][1] === 'onload') {
                    var goalData = JSON.parse(JSON.stringify(dummyData.rows[parseInt(randomValue * (dummyData.rows.length - 1))]));
                    userInfoData = {
                        "userInfo": {
                            "NAME": CONFIG.DUMMY_DATA_LIST.DUMMY_USERS.NAME[parseInt(CONFIG.DUMMY_DATA_LIST.DUMMY_USERS.NAME.length * randomValue)],
                            "EMAIL": CONFIG.DUMMY_DATA_LIST.DUMMY_USERS.EMAIL[parseInt(CONFIG.DUMMY_DATA_LIST.DUMMY_USERS.EMAIL.length * randomValue)]
                        },
                        "id": goalData[2]
                    }
                    encodeString = CryptoJS.enc.Utf8.parse(JSON.stringify(userInfoData));
                    encodeString = CryptoJS.enc.Base64.stringify(encodeString);
                    goalData[1] = CONFIG.DUMMY_DATA_LIST.GOAL_EVENT_NAME;
                    goalData[2] = encodeString;
                    dummyData.rows.push(goalData);
                }
            }
        }
    } else if (dimensionsId === 'rt:operatingSystem') {
        for (var i = 0; i < MaxCount; i++) {
            userId++;
            randomValue = Math.random();
            dummyData.rows.push([CONFIG.DUMMY_DATA_LIST.DUMMY_OS_LIST[parseInt(randomValue * CONFIG.DUMMY_DATA_LIST.DUMMY_OS_LIST.length)], 'onload', userId, 'IN', 'Chrome', 'DESKTOP', 'NEW', 1]);
            if (randomValue > 0.5) {
                dummyData.rows.splice(parseInt(randomValue * dummyData.rows.length - 1), 1);
                if (dummyData.rows[parseInt(randomValue * (dummyData.rows.length - 1))] && dummyData.rows[parseInt(randomValue * (dummyData.rows.length - 1))][1] === 'onload') {
                    var goalData = JSON.parse(JSON.stringify(dummyData.rows[parseInt(randomValue * (dummyData.rows.length - 1))]));
                    userInfoData = {
                        "userInfo": {
                            "NAME": CONFIG.DUMMY_DATA_LIST.DUMMY_USERS.NAME[parseInt(CONFIG.DUMMY_DATA_LIST.DUMMY_USERS.NAME.length * randomValue)],
                            "EMAIL": CONFIG.DUMMY_DATA_LIST.DUMMY_USERS.EMAIL[parseInt(CONFIG.DUMMY_DATA_LIST.DUMMY_USERS.EMAIL.length * randomValue)]
                        },
                        "id": goalData[2]
                    }
                    encodeString = CryptoJS.enc.Utf8.parse(JSON.stringify(userInfoData));
                    encodeString = CryptoJS.enc.Base64.stringify(encodeString);
                    goalData[1] = CONFIG.DUMMY_DATA_LIST.GOAL_EVENT_NAME;
                    goalData[2] = encodeString;
                    dummyData.rows.push(goalData);
                }
            }
        }
    }
    return dummyData;
}

function _getCountryCode() {
    var countries = [];
    _.each(countryCodes, function (country) {
        countries.push(country);
    });
    return countries;
}

function _realTimeSuccessCalling(err, responseVar, res, count) {
    if (responseVar.first && responseVar.second) {
        var response = {
            rows: [],
            totalsForAllResults: {
                'rt:activeUsers': 0
            }
        }
        _.each(responseVar.first, function (responseValueFirst, responseKeyFirst) {
            if (responseValueFirst && (responseValueFirst[1] !== '(not set)' && responseValueFirst[2] !== '(not set)')) {
                _.each(responseVar.second, function (responseValueSecond, responseKeySecond) {
                    if (responseValueSecond && (responseValueSecond[1] !== '(not set)' && responseValueSecond[2] !== '(not set)')) {
                        if (responseValueSecond[1] === responseValueFirst[1] && responseValueSecond[2] === responseValueFirst[2]) {
                            var countryCode = _.find(countryCodes, function (countryValue) {
                                if (countryValue.name === responseVar.first[responseKeyFirst][3]) {
                                    return countryValue;
                                }
                            });
                            responseVar.first[responseKeyFirst][3] = countryCode.alpha2;
                            responseVar.first[responseKeyFirst].push(responseValueSecond[3]);
                            responseVar.first[responseKeyFirst].push(responseValueSecond[4]);
                            response.rows.push(responseVar.first[responseKeyFirst])
                        }
                    }
                })
            }
            if (responseValueFirst && (responseValueFirst[1] !== 'onload'))
                response.totalsForAllResults['rt:activeUsers']++;
        })
        res.send({
            successMessage: CONFIG.REAL_TIME_API_SUCCESS_MESSAGE,
            data: response
        });
    }
}

function _getUserDataSuccessCalling(err, responseVar, res, repo) {
    var response = {
        rows: []
    }
    if (responseVar.first && responseVar.second) {
        _.each(responseVar.first, function (responseValueFirst, responseKeyFirst) {
            if (responseValueFirst && (responseValueFirst[1] !== '(not set)' && responseValueFirst[2] !== '(not set)')) {
                _.each(responseVar.second, function (responseValueSecond, responseKeySecond) {
                    if (responseValueSecond && (responseValueSecond[1] !== '(not set)' && responseValueSecond[2] !== '(not set)')) {
                        if (responseValueSecond[1] === responseValueFirst[1] && responseValueSecond[2] === responseValueFirst[2] && responseVar.first[responseKeyFirst].length < 12) {
                            responseVar.first[responseKeyFirst].push(responseValueSecond[3]);
                            responseVar.first[responseKeyFirst].push(responseValueSecond[4]);
                            responseVar.first[responseKeyFirst].push(responseValueSecond[5]);
                            responseVar.first[responseKeyFirst].push(responseValueSecond[6]);
                        }
                    }
                })
            }
        });
        response.rows = responseVar.first;
        var groupByDate = _.groupBy(response.rows, function (o) { return o[0] });
        var groupByEventCategory = {}
        _.each(groupByDate, function (value, key) {
            groupByEventCategory[key.substring(6, 8) + '-' + key.substring(4, 6) + '-' + key.substring(0, 4)] = _.groupBy(value, function (o) { return o[1] });
            groupByEventCategory[key.substring(6, 8) + '-' + key.substring(4, 6) + '-' + key.substring(0, 4)].date = new Date(key.substring(0, 4) + '/' + key.substring(4, 6) + '/' + key.substring(6, 8));
        })
        res.send({
            successMessage: CONFIG.ALL_TIME_API_SUCCESS_MESSAGE,
            data: {
                data: groupByEventCategory,
                total: response.rows.length
            }
        });
    }
}
http.listen(app.get('port'), function () {
    console.log('listening on *:' + app.get('port'));
});
io.sockets.on('connection', function (socket) {
    socket.on('connect-state', function (connectStateData) {
        console.log('connect-state', connectStateData)
        AnalyticsController.saveAnalyticsInfo({
            host: connectStateData.host,
            socket_id: socket.id,
            country_name: connectStateData.country_name,
            country_code: connectStateData.country,
            performed_event: [connectStateData.eventName],
            browser: connectStateData.browser,
            device: connectStateData.device,
            os: connectStateData.os,
            current_event_name: connectStateData.eventName,
        });
        io.emit('new-user', [connectStateData.eventName, connectStateData.userData, connectStateData.country, connectStateData.browser, connectStateData.device, 'NEW', connectStateData.country_name, 'No Set', connectStateData.os, new Date().getHours(), new Date().getMinutes()])
    });

    socket.on('goal-done', function (goalData) {
        console.log('goal-done', goalData)
        AnalyticsController.updateConnectionAnalyticsInfo(socket.id, {
            user_info: goalData.userData,
            current_event_name: goalData.eventName,
        });
        io.emit('goal-complete', [goalData.eventName, goalData.userData, goalData.country, goalData.browser, goalData.device, 'NEW', goalData.country_name, 'No Set', goalData.os, new Date().getHours(), new Date().getMinutes()])
    });

    socket.on('disconnect', function (data) {
        AnalyticsController.updateConnectionAnalyticsInfo(socket.id, {
            current_event_name: 'disconnect',
        })
        io.emit('disconnect-user', {
            userId: socket.id
        });
    });
});