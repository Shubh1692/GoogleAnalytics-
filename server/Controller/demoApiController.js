var CONFIG = require('../../app.config'),
    CryptoJS = require("crypto-js"),
    countryCodes = require('country-data').countries,
    _ = require('lodash'),
    userId = 0,
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


function _getRealTimeDemoApiData(req, res) {
    var temp = _createDynmicDemoData(req.query.dimensionsId, req.query.changeFlag);

    res.send({
        successMessage: CONFIG.REAL_TIME_API_SUCCESS_MESSAGE,
        data: temp
    });
}

function _getCountryCode() {
    var countries = [];
    _.each(countryCodes, function (country) {
        countries.push(country);
    });
    return countries;
}

module.exports = {
    getRealTimeDemoApiData: _getRealTimeDemoApiData
}