/* 
1. 'Requested 8 dimensions; only 7 are allowed.' 
*/
var express = require('express'), // require express code
    bodyParser = require('body-parser'), // require body-parser code
    google = require('googleapis'),// require googleapis code
    app = express(),
    CONFIG = require('./app.config'),
    _ = require('lodash'),
    CryptoJS = require("crypto-js"),
    countryCodes = require('country-data').countries;
app.use(bodyParser.urlencoded({
    extended: false
}));
// parse application/json
app.use(bodyParser.json());
app.use(bodyParser.json());
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', CONFIG.REQUEST_HEADER['Access-Control-Allow-Origin']);
    res.setHeader('Access-Control-Allow-Methods', CONFIG.REQUEST_HEADER['Access-Control-Allow-Methods']);
    res.setHeader('Access-Control-Allow-Headers', CONFIG.REQUEST_HEADER['Access-Control-Allow-Headers']);
    res.setHeader('Access-Control-Allow-Credentials', CONFIG.REQUEST_HEADER['Access-Control-Allow-Credentials']);
    next();
});
// here public is name of a folder of static file
app.use(express.static('public'));
// Google Analytics Authentication
let jwtClient = new google.auth.JWT(CONFIG.GOOGLE_CLINET_CONFIG.client_email, null, CONFIG.GOOGLE_CLINET_CONFIG.private_key,
    ['https://www.googleapis.com/auth/analytics.readonly'], null);
jwtClient.authorize(function (err, tokens) {
    if (err) {
        console.log('error ', err);
        return;
    }
    let analytics = google.analytics('v3');
});
// Get Real Time Data API
app.get('/getGoogleAnalyticsRealTimeData', function (req, res) {
    var dimensions = _.reject(CONFIG.GOOGLE_DEFAULT_REAL_TIME_DIMENSIONS, function (o) { return o === req.query.dimensionsId })
    var apiQuery = google.analytics('v3').data.realtime.get({
        'auth': jwtClient,
        'ids': CONFIG.GOOGLE_APP_VIEW_ID,
        'metrics': 'rt:activeUsers',
        'dimensions': req.query.dimensionsId + ',rt:eventCategory, rt:eventAction,' + CONFIG.GOOGLE_DEFAULT_REAL_TIME_DIMENSIONS
    }, function (err, response) {
        if (err) {
            res.send({
                errorMessage: CONFIG.REAL_TIME_API_ERROR_MESSAGE,
                data: err
            });
            return;
        }
        response = {
            rows: response.rows,
            totalsForAllResults: {
                'rt:activeUsers': 0
            }
        }
        _.each(response.rows, function (value, key) {
            if (value && (value[1] === '(not set)' || value[2] === '(not set)'))
                response.rows.splice(key, 1);
            else if (value && (value[1] !== '(not set)' && value[2] !== '(not set)')) {
                var countryCode = _.find(countryCodes, function (countryValue) {
                    if (countryValue.name === value[3]) {
                        return countryValue;
                    }
                });
                response.rows[key][3] = countryCode.alpha2;
            }
            if (value && (value[1] !== 'onload'))
                response.totalsForAllResults['rt:activeUsers']++;
        });
        res.send({
            successMessage: CONFIG.REAL_TIME_API_SUCCESS_MESSAGE,
            data: response
        });
    }, function (err) {
        res.send({
            errorMessage: CONFIG.REAL_TIME_API_ERROR_MESSAGE,
            data: err
        });
    });
});
// Get All Data API
app.get('/getGoogleAnalyticsAllData', function (req, res) {
    var apiQuery = google.analytics('v3').data.ga.get({
        'auth': jwtClient,
        'ids': CONFIG.GOOGLE_APP_VIEW_ID,
        'start-date': req.query.startDate,
        'end-date': req.query.endDate,
        'metrics': 'ga:users, ga:bounceRate, ga:avgSessionDuration, ga:newUsers, ga:percentNewSessions, ga:pageviewsPerSession, ga:goalCompletionsAll, ga:goalConversionRateAll, ga:goalValueAll, ga:sessions', // , ga:avgSessionDuration
        'dimensions': req.query.dimensionsId,
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
        res.send({
            successMessage: CONFIG.ALL_TIME_API_SUCCESS_MESSAGE,
            data: response
        });
    }, function (err) {
        res.send({
            errorMessage: CONFIG.ALL_TIME_API_ERROR_MESSAGE,
            data: err
        });
    });
});

app.get('/getGoogleAnalyticsUserData', function (req, res) {
    var apiQuery = google.analytics('v3').data.ga.get({
        'auth': jwtClient,
        'ids': CONFIG.GOOGLE_APP_VIEW_ID,
        'start-date': CONFIG.GOOGLE_MENU_DATA_START_DATE,
        'end-date': new Date().toISOString().slice(0, 10),
        'metrics': 'ga:users',
        'dimensions': 'ga:date, ga:eventCategory, ga:eventAction, ga:countryIsoCode, ga:browser, ga:deviceCategory, ga:userType',
        'sort': '-ga:date',
        // 'filters' : 'ga:userType==New Visitor,ga:userType==Returning Visitor'
    }, function (err, response) {
        if (err) {
            res.send({
                errorMessage: CONFIG.ALL_TIME_GET_USER_API_ERROR_MESSAGE,
                data: err
            });
            return;
        }
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
                total: response.rows.length,
                res: response
            }
        });
    }, function (err) {
        res.send({
            errorMessage: CONFIG.ALL_TIME_GET_USER_API_ERROR_MESSAGE,
            data: err
        });
    });
})

app.get('/getRealTimeDataDemoAPI', function (req, res) {
    response = _createDynmicDemoData(req.query.dimensionsId, req.query.changeFlag);

    res.send({
        successMessage: CONFIG.REAL_TIME_API_SUCCESS_MESSAGE,
        data: response
    });
})
// For Check Start Server function
app.listen(CONFIG.NODE_SERVER_PORT, function () {
    console.log('Server Started In Rest Api on port ' + CONFIG.NODE_SERVER_PORT);
});
var userId = 0, response = {
    rows: [],
    totalsForAllResults: {}
}, onload = [];
function _createDynmicDemoData(dimensionsId, changeFlag) {
    var countries, randomValue, userInfoData, encodeString,
        MaxCount = parseInt(Math.random() * CONFIG.DUMMY_DATA_LIST.MAX_COUNT);
    response.totalsForAllResults['rt:activeUsers'] = MaxCount;
    if(changeFlag === 'true' || changeFlag === true) {
        response.rows = [];
    }
    if (dimensionsId === 'rt:country') {
        countries = _getCountryCode();
        for (var i = 0; i < MaxCount; i++) {
            userId++;
            randomValue = Math.random();
            var name = countries[parseInt(randomValue * 20)].name || 'India';
            var countryCodeVar = countries[parseInt(randomValue * 20)].alpha2 || 'IN';
            response.rows.push([name.split(' ')[0], 'onload', userId, countryCodeVar, 'Chrome', 'DESKTOP', 'NEW', 1]);
            if (randomValue > 0.5) {
                response.rows.splice(parseInt(randomValue * response.rows.length - 1), 1);
                // userInfoData = {
                //     "userInfo": {
                //         "NAME": CONFIG.DUMMY_DATA_LIST.DUMMY_USERS.NAME[parseInt(CONFIG.DUMMY_DATA_LIST.DUMMY_USERS.NAME.length * randomValue)],
                //         "EMAIL": CONFIG.DUMMY_DATA_LIST.DUMMY_USERS.EMAIL[parseInt(CONFIG.DUMMY_DATA_LIST.DUMMY_USERS.EMAIL.length * randomValue)]
                //     },
                //     "id": userId
                // }
                // encodeString = CryptoJS.enc.Utf8.parse(JSON.stringify(userInfoData));
                // encodeString = CryptoJS.enc.Base64.stringify(encodeString);
                // response.rows.push([name.split(' ')[0], CONFIG.DUMMY_DATA_LIST.GOAL_EVENT_NAME, encodeString, countryCodeVar, 'Chrome', 'DESKTOP', 'NEW', 1]);   
            }

        }
    } else if (dimensionsId === 'rt:browser') {
        for (var i = 0; i < MaxCount; i++) {
            userId++;
            randomValue = Math.random();
            response.rows.push([CONFIG.DUMMY_DATA_LIST.DUMMY_BROWSER_LIST[parseInt(randomValue * CONFIG.DUMMY_DATA_LIST.DUMMY_BROWSER_LIST.length)], 'onload', userId, 'IN', CONFIG.DUMMY_DATA_LIST.DUMMY_BROWSER_LIST[parseInt(randomValue * CONFIG.DUMMY_DATA_LIST.DUMMY_BROWSER_LIST.length)], 'DESKTOP', 'NEW', 1]);
            if (randomValue > 0.5) {
                // userInfoData = {
                //      "userInfo": {
                //         "NAME": CONFIG.DUMMY_DATA_LIST.DUMMY_USERS.NAME[parseInt(CONFIG.DUMMY_DATA_LIST.DUMMY_USERS.NAME.length * randomValue)],
                //         "EMAIL": CONFIG.DUMMY_DATA_LIST.DUMMY_USERS.EMAIL[parseInt(CONFIG.DUMMY_DATA_LIST.DUMMY_USERS.EMAIL.length * randomValue)]
                //     },
                //     "id": userId
                // }
                // encodeString = CryptoJS.enc.Utf8.parse(JSON.stringify(userInfoData));
                // encodeString = CryptoJS.enc.Base64.stringify(encodeString);
                // response.rows.push([CONFIG.DUMMY_DATA_LIST.DUMMY_BROWSER_LIST[parseInt(randomValue * CONFIG.DUMMY_DATA_LIST.DUMMY_BROWSER_LIST.length)], 'onload', encodeString, 'IN', CONFIG.DUMMY_DATA_LIST.DUMMY_BROWSER_LIST[parseInt(randomValue * CONFIG.DUMMY_DATA_LIST.DUMMY_BROWSER_LIST.length)], 'DESKTOP', 'NEW', 1]);
                response.rows.splice(parseInt(randomValue * response.rows.length - 1), 1)
            }
        }
    } else if (dimensionsId === 'rt:operatingSystem') {
        for (var i = 0; i < MaxCount; i++) {
            userId++;
            randomValue = Math.random();
            response.rows.push([CONFIG.DUMMY_DATA_LIST.DUMMY_OS_LIST[parseInt(randomValue * CONFIG.DUMMY_DATA_LIST.DUMMY_OS_LIST.length)], 'onload', userId, 'IN', 'Chrome', 'DESKTOP', 'NEW', 1]);
            if (randomValue > 0.5) {
                // userInfoData = {
                //      "userInfo": {
                //         "NAME": CONFIG.DUMMY_DATA_LIST.DUMMY_USERS.NAME[parseInt(CONFIG.DUMMY_DATA_LIST.DUMMY_USERS.NAME.length * randomValue)],
                //         "EMAIL": CONFIG.DUMMY_DATA_LIST.DUMMY_USERS.EMAIL[parseInt(CONFIG.DUMMY_DATA_LIST.DUMMY_USERS.EMAIL.length * randomValue)]
                //     },
                //     "id": userId
                // }
                // encodeString = CryptoJS.enc.Utf8.parse(JSON.stringify(userInfoData));
                // encodeString = CryptoJS.enc.Base64.stringify(encodeString);
                // response.rows.push([CONFIG.DUMMY_DATA_LIST.DUMMY_OS_LIST[parseInt(randomValue * CONFIG.DUMMY_DATA_LIST.DUMMY_OS_LIST.length)], 'onload', encodeString, 'IN', 'Chrome', 'DESKTOP', 'NEW', 1])
                response.rows.splice(parseInt(randomValue * response.rows.length - 1), 1)
            }
        }
    }
    return response;
}

function _getCountryCode() {
    var countries = [];
    _.each(countryCodes, function (country) {
        countries.push(country);
    });
    return countries;
}