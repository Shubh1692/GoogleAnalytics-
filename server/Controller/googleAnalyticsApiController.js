var google = require('googleapis'), // require googleapis code
    CONFIG = require('../../app.config'),
    CryptoJS = require("crypto-js"),
    countryCodes = require('country-data').countries,
    _ = require('lodash'),
    AnalyticsController = require('./AnalyticsController'); // require Controller code
    Q = require("q");
let jwtClient = new google.auth.JWT(CONFIG.GOOGLE_CLINET_CONFIG.client_email, null, CONFIG.GOOGLE_CLINET_CONFIG.private_key, ['https://www.googleapis.com/auth/analytics.readonly'], null);
jwtClient.authorize(function (err, tokens) {
    if (err) {
        console.log('error ', err);
        return;
    }
    let analytics = google.analytics('v3');
});

function _getGoogleAnalyticsRealTimeData(req, res) {
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
}

function _getGoogleAnalyticsAllData(req, res) {
    google.analytics('v3').data.ga.get({
        'auth': jwtClient,
        'ids': CONFIG.GOOGLE_APP_VIEW_ID,
        'start-date': req.body.startDate,
        'end-date': req.body.endDate,
        'metrics': CONFIG.GOOGLE_DEFAULT_ALL_TIME_DATA_METRICS,
        'dimensions': req.body.dimensionsId,
        'sort': '-ga:users',
        'filters': 'ga:hostname==' + req.body.host
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
                            currentOnlineUsers.push(['onload', onlineUser.socket_id, onlineUser.country_code, onlineUser.browser, onlineUser.device, 'NEW', onlineUser.country_name, 'No Set', onlineUser.os, new Date().getHours(), new Date().getMinutes(), onlineUser.host])
                        }
                        currentOnlineUsers.push([onlineUser.current_event_name, onlineUser.user_info, onlineUser.country_code, onlineUser.browser, onlineUser.device, 'NEW', onlineUser.country_name, 'No Set', onlineUser.os, new Date().getHours(), new Date().getMinutes(), onlineUser.host])
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
}

function _getGoogleAnalyticsUserData(req, res) {
    var responseVar = {};
    google.analytics('v3').data.ga.get({
        'auth': jwtClient,
        'ids': CONFIG.GOOGLE_APP_VIEW_ID,
        'start-date': CONFIG.GOOGLE_MENU_DATA_START_DATE,
        'end-date': new Date().toISOString().slice(0, 10),
        'metrics': 'ga:users',
        'dimensions': CONFIG.GOOGLE_DEFAULT_USER_DATA_DIMENSIONS_PRAT_ONE,
        'sort': '-ga:date',
        'filters': 'ga:hostname==' + req.body.host
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
module.exports = {
    getGoogleAnalyticsRealTimeData: _getGoogleAnalyticsRealTimeData,
    getGoogleAnalyticsAllData: _getGoogleAnalyticsAllData,
    getGoogleAnalyticsUserData: _getGoogleAnalyticsUserData
}