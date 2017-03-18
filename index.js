/* 
1. 'Requested 8 dimensions; only 7 are allowed.' 

*/
var express = require('express'), // require express code
    bodyParser = require('body-parser'), // require body-parser code
    google = require('googleapis'),// require googleapis code
    app = express();

app.use(bodyParser.urlencoded({
    extended: false
}));
// parse application/json
app.use(bodyParser.json());
// here public is name of a folder of static file
app.use(express.static('public'));
const VIEW_ID = 'ga:142108037';
// let jwtClient = new google.auth.JWT(
//     key.client_email, null, key.private_key,
//     ['https://www.googleapis.com/auth/analytics.readonly'], null);
// jwtClient.authorize(function (err, tokens) {
//     if (err) {
//         console.log('error ', err);
//         return;
//     }
//     let analytics = google.analytics('v3');
// });
app.get('/getGoogleAnalyticsData', function (req, res) {
    var apiQuery = google.analytics('v3').data.realtime.get({
        'auth': jwtClient,
        'ids': VIEW_ID,
        'metrics': 'rt:activeUsers', // rt:activeUsers rt:screenViews rt:totalEvents
        'dimensions': 'rt:country', // rt:minutesAgo, rt:referralPath
    }, function (err, response) {
        if (err) {
            res.send(err);
            return;
        }
        res.send(response);
    });
    
});

// For Check Start Server function
app.listen(8080, function() {
    console.log('Server Started In Rest Api on port ' + 8080);
});