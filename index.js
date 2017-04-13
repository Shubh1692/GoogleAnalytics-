/* 
1. 'Requested 8 dimensions; only 7 are allowed.' 
*/
var express = require('express'), // require express code
    bodyParser = require('body-parser'), // require body-parser code
    google = require('googleapis'),// require googleapis code
    app = express(),
    CONFIG = require('./app.config');
app.use(bodyParser.urlencoded({
    extended: false
}));
// parse application/json
app.use(bodyParser.json());
// here public is name of a folder of static file
app.use(express.static('public'));

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
    var apiQuery = google.analytics('v3').data.realtime.get({
        'auth': jwtClient,
        'ids': CONFIG.GOOGLE_APP_VIEW_ID,
        'metrics': 'rt:activeUsers',
        'dimensions': req.query.dimensionsId //+ ',rt:hostname'
    }, function (err, response) {
        if (err) {
            res.send({
                errorMessage: CONFIG.REAL_TIME_API_ERROR_MESSAGE,
                data: err
            });
            return;
        }
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
        'metrics': 'ga:users, ga:bounceRate,ga:exitRate, ga:avgTimeOnPage', // , ga:avgSessionDuration
        // 'dimensions': 'ga:hostname'
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
// For Check Start Server function
app.listen(CONFIG.NODE_SERVER_PORT, function () {
    console.log('Server Started In Rest Api on port ' + CONFIG.NODE_SERVER_PORT);
});