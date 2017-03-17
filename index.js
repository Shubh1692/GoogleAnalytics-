/* 
1. 'Requested 8 dimensions; only 7 are allowed.' 

*/
var express = require('express'), // require express code
    bodyParser = require('body-parser'), // require body-parser code
    google = require('googleapis'),// require googleapis code
    app = express(),
    key = {
        "type": "service_account",
        "project_id": "project-management-148702",
        "private_key_id": "f6cf4f5fa9dc65dffe11cc1e64756478b1f4d514",
        "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDEZnI3osQ4TBKi\n492KO7RzIKXkL4rl9EC/TwUL9ncb3w1H0hQB2b+qqxG8tGY+ApvXc94jGp6QSLyz\nEFd61TpT+PEWnPqoANL/ZcKuf6aceWwma5Q4iKXvikCjM0L0zyj+0BlN7ReYMf97\nGcQ1z5h9eBqStIUk2Bosh7iLltlgA9tR1mGNLRhrilAyeWtk4NUIgUL7tV+UE15v\nzv+5YIvYq/3ZafU8yepwqD1r7aH8eClbBBdUMpKv90CwAk31RFTibNgU+oFo08US\nuRDxb1YITrLBwK1sYf9gBRpqYJDFvKDqKFg0comqJgrp4TMes9aO5ICWsSW6bpuV\nPw2GTXE5AgMBAAECggEAODtMwHktzSCaxWCQcZ+ejsfuN2MVVbmVQDETtNUgTS6T\n0thnOhBqPCc2sNzF2UNN82YNV+erNoxc2rf3FAgw5xIDlQHlEm0J/G3aS7PotCxf\ntrBeg8E8IVVoJFHs/cLCbhKO7CzR8JWAHHLIJtAFTQcyNIbTCDWHaPCC+hR6sG5p\npSWT8cHGVPTctm1hL8paV0VUva2fpAmamG9ChhRgohoGhaVzoCieNJYJpgXOx/WW\nqkTzHXpciQBohuV/1jWZb+7lvybwfV0jwvAuTZxg4M9+e2y1OzpuzL7gZozFf2Kg\new2Ko61slFNB2GBbCkGRM0a4RY3e4ZrcTtbKJyFuwQKBgQDtYIV/kACcXFrO5CbV\nXR2dpJpZhXl7AhbKf4x3Yk+BbZjz2zalCAC0yFNGVgrt/ZJVVfg5ZhEQSrhfNrnt\nvycRh9XvmFhk/yyjzC+HboYFbJotzokscYCESqdsMTr5JnFeiultXPDCfRseyC9m\nmEl44jGD90/bGaTvVAEHTGc/FQKBgQDTzvIhP2bEVKre9lKzUeDf8VvOaEki0J51\ndY4vNG2PDOZ/0dVSa/Sd++ETvDrvnpJ1xlkDf2IKkBJ+DU98z7dve3AHkLTjiz9R\nTGCXPT18hd78iInYTAjouyJ0I3ctefbySokA+05CDK7wHtOkUvH8eCWYbG9Bk4C8\n4FVsJD1SlQKBgHW2Xp0iWNsxBSsBgqxdr5kEDjKEePhh0dF7LLnq+4gwRB/xPgja\njhcYHAuOEX9xNkaxChXUonOUyhcVOWBHYWVVGeblgjgbPhS/5XXgff9kmpRKjkWG\nx3dS2fFR/G+e+6spcZX098NKbM937+GNdSnH6UwKsQPylJLF8nifD7f9AoGAbwqR\nWejZQZh5tEZC+Qu17vGkBcQag4wHZuDoV8sOnO5QcTZatckvBxwj1ara4wCpG+GO\njQzdI1iAuWDVCUQEkQePpgexLZG08jQud1t9vqiYTKBwU9sY2Joy59woAMluM3vr\n833Me0gW9n/SyNVLU+bRHuXKNgDUfzDE19rv4zkCgYAKn92QVkZfVL9VzCFBNtQR\nNkCpUUHYARc9H3n5COD0mn9px+Z/dUVUjHN8zfyEnKfcixOt1XzLY4w0W6bI3HPL\nVbf1BdW5zDRk7edc9VaHAL9+hl3084joal8UHiegzgkDd5hL8UnndBKskzL9HHvN\nQpTaFRKUXjdfiQ7CctNG3A==\n-----END PRIVATE KEY-----\n",
        "client_email": "new-service-account@project-management-148702.iam.gserviceaccount.com",
        "client_id": "118028953493255647005",
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://accounts.google.com/o/oauth2/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/new-service-account%40project-management-148702.iam.gserviceaccount.com"
    };
app.use(bodyParser.urlencoded({
    extended: false
}));
// parse application/json
app.use(bodyParser.json());
// here public is name of a folder of static file
app.use(express.static('public'));
const VIEW_ID = 'ga:142900171';
let jwtClient = new google.auth.JWT(
    key.client_email, null, key.private_key,
    ['https://www.googleapis.com/auth/analytics.readonly'], null);
jwtClient.authorize(function (err, tokens) {
    if (err) {
        console.log('error ', err);
        return;
    }
    let analytics = google.analytics('v3');
    //queryData(analytics);
});
// function queryData(analytics) {
//     var apiQuery = analytics.data.realtime.get({
//         'auth': jwtClient,
//         'ids': VIEW_ID,
//         'metrics': 'rt:activeUsers', // rt:activeUsers rt:screenViews rt:totalEvents
//         'dimensions': 'rt:userType, rt:operatingSystem, rt:country, rt:region, rt:city, rt:latitude, rt:longitude', // rt:minutesAgo, rt:referralPath
//         // 'start-date': '2008-10-01',
//         // 'end-date': '2017-03-15',
//         // 'sort': '-ga:sessions',
//         // 'start-index' : 10,
//         // 'max-results': 10,
//         // 'prettyprint' : true,
//         //   'filters': 'ga:pagePath=~/ch_[-a-z0-9]+[.]html$',
//     }, function (err, response) {
//         if (err) {
//             console.log(err);
//             return;
//         }
//         console.log(response);
//     });
// }

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