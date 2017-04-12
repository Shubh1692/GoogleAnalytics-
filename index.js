/* 
1. 'Requested 8 dimensions; only 7 are allowed.' 

*/
var express = require('express'), // require express code
    bodyParser = require('body-parser'), // require body-parser code
    google = require('googleapis'),// require googleapis code
    app = express(),
    key = {
        "type": "service_account",
        "project_id": "d3test-160705",
        "private_key_id": "8ac392b926c69504ff9e5801b9796f3bf6f75ab9",
        "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDWZUjoeHjH54F/\n5KfEmZLaQE7zpsAVSFstWVde/o2A6/TGU9A6BsJH5IcFUQtwAdbcZxL63w1Zn0lV\nQ8v9bGgZFbIrkBlxbBSyBPEaPY58aHZtXsgwgF7Aeo9FaoL4u9sLxphDTW1ykQs6\nA4i8MM5a2BIk2kcu4pAj53ZaLLlpG47/TNOiZ427HMPryGCWEVeiqz+JcFAKViNZ\n7ZHN3q2VQTRO3KPLLQKzZ8dOfkQMi++tMyOBSx5q6PsFPryGYjJHBNVt8xu/9jhY\nQ8idZRMaalSeG5j5L/8Tnk2kbpVhZY20I90cHLaxHhu9NQuUGXroKhGo2LMgG0Bc\nQt8IyYNNAgMBAAECggEBALcmm1wM3pFXkedhvHhVAYD1Av1ebCVCRLG+6sa6CsQh\nzl9G5lFLyNiFv1qpW236BEUQwMQTnGH9kzYFztPVsjALusNAPJwKSruxQQ67m2do\nDhNsrvPQFiG0EYSpcu1t/bhXlWeZU3BVvBN5RWwO/ZnZj9ZvqfPBlIU3jIGIR3Qj\nh4uGOme3hjg0im8rp4c5zKmVrMLSqb+f93p/wxXB47L56AkmnXXJ402ey8iOzxRG\nqw7im65O6gLiPRcCGabO6uMBPYHKWgk5L3WERRLSrreGlRl4BSQkyB5FBr/G1dIq\nxjS5ajU/RmD0vqUBBV4LDBwxzbMmvVvEJYxD6O3J8PkCgYEA+zWCubgA5PG9QkzH\neAkIuF5rDRtWhKmbNym1r0AY8HvFC+Y8d3rCsBE70+0vHhhwAiBiuCQbG/eegK6O\nzhCcSwk0x1uP4ElJixchywgC7+p1PpxwDSWZqG7RANnF9cp+0vhGFhrYECnaI1Mv\nHuwoBSY2wCJd8P0JtNGFXP13zQMCgYEA2nwJ2jOgYj4BuqbLeFqxV2XSMEBSo1bP\nGdRi4NGD4xD0UgX+CTtD/ZFOvdaXyi+sLWTztTmjPKamHxnZKfady0j8zMCjzDuu\nyUNGI3wy4KDGaloZOJrekyJSrV6suz1iym3g1jN+43PH/dHw4ThAbXdoprCN5+wi\ny8QzoV4iNW8CgYBSNkj6DsX8J0ERGZ+OISbBb+UI/RFriTZK71OObyO6UEdEhaz0\nTTC5/mneCZmJ9+VwTLkCGo7ksD0nT/lcZwM/a1vigoyrklCHPKLKl2yep9SHERt6\nsft/rASqiprGveaTlL0bLt3XLFs/hFG/hPnz9XWlm5my7JzomElVDX7PkQKBgH3r\nXRZICNh2GjMD7GKqCmlvgotSlw4SevvM/0vJFLTqUZVwZK/XW2EpvPMGWacqgJYN\nB7Rbyquq9DUahaF8xAakQyaSpBSSFTNjtWnAK+ZwYspqsPyBrWOpNXM8DFtBjs1S\nNHHfbfMTCKFNvQFglSlB16uyN6cB3jAIHSWUhiy7AoGBAJveTKAAottC+TWSPjs5\nn19PM1+w8svi5u/SHxA/d8n0qQ3qq2jm2nOoZRL9bipk8+4lVmMmKaW+u9HkylQH\nLp1oeKsYGnY+z0welmpzrhGnf9zX7VHIS6FaVlpGJQEwPT7bzDPWF6YJBOyE0lL+\n47oOUwo0m6lxRWGhGJYYC5G8\n-----END PRIVATE KEY-----\n",
        "client_email": "136642508525-compute@developer.gserviceaccount.com",
        "client_id": "111755491521631439835",
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://accounts.google.com/o/oauth2/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/136642508525-compute%40developer.gserviceaccount.com"
    }

app.use(bodyParser.urlencoded({
    extended: false
}));
// parse application/json
app.use(bodyParser.json());
// here public is name of a folder of static file
app.use(express.static('public'));
const VIEW_ID = 'ga:142108037';
let jwtClient = new google.auth.JWT(
    key.client_email, null, key.private_key,
    ['https://www.googleapis.com/auth/analytics.readonly'], null);
jwtClient.authorize(function (err, tokens) {
    if (err) {
        console.log('error ', err);
        return;
    }
    let analytics = google.analytics('v3');
});
app.get('/getGoogleAnalyticsRealTimeData', function (req, res) {
    var apiQuery = google.analytics('v3').data.realtime.get({
        'auth': jwtClient,
        'ids': VIEW_ID,
        'metrics': 'rt:activeUsers', // rt:activeUsers rt:screenViews rt:totalEvents
        'dimensions': req.query.dimensionsId // rt:country, rt:browser', // rt:minutesAgo, rt:referralPath
    }, function (err, response) {
        if (err) {
            res.send(err);
            return;
        }
        res.send(response);
    });
});

app.get('/getGoogleAnalyticsAllData', function (req, res) {
    var apiQuery = google.analytics('v3').data.ga.get({
        'auth': jwtClient,
        'ids': VIEW_ID,
        'start-date': req.query.startDate,
        'end-date': req.query.endDate,
        'metrics': 'ga:bounceRate, ga:avgSessionDuration, ga:avgTimeOnPage, ga:users, ga:exitRate',
       // 'dimensions': 'ga:hostname'
    }, function (err, response) {
        if (err) {
            res.send(err);
            return;
        }
        res.send(response);
    });

});




// For Check Start Server function
app.listen(8080, function () {
    console.log('Server Started In Rest Api on port ' + 8080);
});