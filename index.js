/* 
1. 'Requested 8 dimensions; only 7 are allowed.' 
*/
var express = require('express'), // require express code
    bodyParser = require('body-parser'), // require body-parser code
    google = require('googleapis'),// require googleapis code
    app = express(),
    CONFIG = require('./app.config'),
    _ = require('lodash'),
    completedGoalData = [];
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
    console.log(completedGoalData)
    var apiQuery = google.analytics('v3').data.realtime.get({
        'auth': jwtClient,
        'ids': CONFIG.GOOGLE_APP_VIEW_ID,
        'metrics': 'rt:activeUsers',
        'dimensions': req.query.dimensionsId + ',rt:eventAction'
    }, function (err, response) {
        if (err) {
            res.send({
                errorMessage: CONFIG.REAL_TIME_API_ERROR_MESSAGE,
                data: err
            });
            return;
        }
        var rowArray = [];
        _.each(response.rows, function (value) {
            if (value[1] !== '(not set)') {
                var index = rowArray.map(function (obj) {
                    return obj[0];
                }).indexOf(value[0]);
                var userData;
                if (completedGoalData.map(function (obj) {
                    retun.id;
                }).indexOf(value[1]) > - 1) {
                    userData = completedGoalData[completedGoalData.map(function (obj) {
                        retun.id;
                    }).indexOf(value[1])]
                } else {
                    userData = {
                        id : value[1]
                    }
                }
                if (index === -1) {
                    rowArray.push([value[0], 1, [userData]])
                } else {
                    rowArray[index][1]++;
                    rowArray[index][2].push(userData)
                }
            }
        });
        response.rows = rowArray;
        console.log(rowArray, response.rows);
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
        'metrics': 'ga:users, ga:bounceRate,ga:exitRate, ga:avgSessionDuration, ga:newUsers, ga:percentNewSessions, ga:pageviewsPerSession', // , ga:avgSessionDuration
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

app.post('/getUserInfo', function (req, res) {
    console.log(req.body)
    completedGoalData.push(req.body)
    res.send({
        successMessage: 'Get User Data',
        data: req.body
    });
})
// For Check Start Server function
app.listen(CONFIG.NODE_SERVER_PORT, function () {
    console.log('Server Started In Rest Api on port ' + CONFIG.NODE_SERVER_PORT);
});