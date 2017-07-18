require('./server/common'); // require common file code
var express = require('express'), // require express cod
    bodyParser = require('body-parser'), // require body-parser code
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
    extended: true
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
var AnalyticsController = require('./server/Controller/AnalyticsController'); // require Controller code
var AdminSiteConfigurationController = require('./server/Controller/AdminSiteConfigurationController'); // require Controller code
var googleAnalyticsApiController = require('./server/Controller/googleAnalyticsApiController'); // require Controller code
var demoApiController = require('./server/Controller/demoApiController'); // require Controller code
// Google Analytics Apis
app.get('/getGoogleAnalyticsRealTimeData', googleAnalyticsApiController.getGoogleAnalyticsRealTimeData);
app.post('/getGoogleAnalyticsAllData', googleAnalyticsApiController.getGoogleAnalyticsAllData);
app.post('/getGoogleAnalyticsUserData', googleAnalyticsApiController.getGoogleAnalyticsUserData);
// Demo Apis
app.get('/getRealTimeDataDemoAPI', demoApiController.getRealTimeDemoApiData);
// Modals Apis
app.post('/adminFormInputConfiguration', AdminSiteConfigurationController.submitInputConfiguration);
app.post('/getInputConfiguration', AdminSiteConfigurationController.getInputConfiguration);
http.listen(app.get('port'), function () {
    console.log('listening on *:' + app.get('port'));
});

io.sockets.on('connection', function (socket) {
    socket.on('connect-state', function (connectStateData) {
       // console.log('connect-state', connectStateData)
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
        io.emit('new-user', [connectStateData.eventName, connectStateData.userData, connectStateData.country, connectStateData.browser, connectStateData.device, 'NEW', connectStateData.country_name, 'No Set', connectStateData.os, new Date().getHours(), new Date().getMinutes(), connectStateData.host])
    });

    socket.on('goal-done', function (goalData) {
        console.log('goal-done', goalData)
        AnalyticsController.updateConnectionAnalyticsInfo(socket.id, {
            user_info: goalData.userData,
            current_event_name: goalData.eventName,
        });
        io.emit('goal-complete', [goalData.eventName, goalData.userData, goalData.country, goalData.browser, goalData.device, 'NEW', goalData.country_name, 'No Set', goalData.os, new Date().getHours(), new Date().getMinutes(), goalData.host])
    });

    socket.on('send-configuration', function(configurationData) {
        console.log(configurationData)
        io.emit('get-configuration', configurationData);
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