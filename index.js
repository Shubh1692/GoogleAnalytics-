/* 
1. 'Requested 8 dimensions; only 7 are allowed.' 
*/
var express = require('express'), // require express code
    bodyParser = require('body-parser'), // require body-parser code
    google = require('googleapis'),// require googleapis code
    app = express(),
    CONFIG = require('./app.config'),
    _ = require('lodash');
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
    var dimensions = _.reject(CONFIG.GOOGLE_DEFAULT_REAL_TIME_DIMENSIONS, function(o) { return o === req.query.dimensionsId})
    var apiQuery = google.analytics('v3').data.realtime.get({
        'auth': jwtClient,
        'ids': CONFIG.GOOGLE_APP_VIEW_ID,
        'metrics': 'rt:activeUsers',
        'dimensions': req.query.dimensionsId + ',rt:eventAction, rt:eventCategory,' + CONFIG.GOOGLE_DEFAULT_REAL_TIME_DIMENSIONS
    }, function (err, response) {
        if (err) {
            res.send({
                errorMessage: CONFIG.REAL_TIME_API_ERROR_MESSAGE,
                data: err
            });
            return;
        }
        var rowArray = [];
        var userInfo = [];
        response.totalsForAllResults['rt:activeUsers'] = 0;
        _.each(response.rows, function (value) {
            if (value[1] !== '(not set)' && value[2] === 'onload') {
                response.totalsForAllResults['rt:activeUsers']++;
                var index = rowArray.map(function (obj) {
                    return obj[0];
                }).indexOf(value[0]);
                console.log(value)
                if (index === -1) {
                    rowArray.push([value[0], 1, [value]])
                } else {
                    rowArray[index][1]++;
                    rowArray[index][2].push(value)
                }
            } else if (value[1] !== '(not set)') {
                userInfo.push([value[0], 1, value[1], value[2]])
            }
        });
        response.rows = rowArray;
        response.userInfo = userInfo;
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
        'sort': '-ga:date'
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
            groupByEventCategory[key.substring(6, 8) + '-' + key.substring(4, 6) + '-' + key.substring(0, 4)].date = new Date(key.substring(0, 4) + '/' +   key.substring(4, 6) + '/' + key.substring(6, 8)); 
        })
        res.send({
            successMessage: CONFIG.ALL_TIME_API_SUCCESS_MESSAGE,
            data: {
                data: groupByEventCategory,
                total: response.rows.length
            }
        });
    }, function (err) {
        res.send({
            errorMessage: CONFIG.ALL_TIME_GET_USER_API_ERROR_MESSAGE,
            data: err
        });
    });
})
// For Check Start Server function
app.listen(CONFIG.NODE_SERVER_PORT, function () {
    console.log('Server Started In Rest Api on port ' + CONFIG.NODE_SERVER_PORT);
});