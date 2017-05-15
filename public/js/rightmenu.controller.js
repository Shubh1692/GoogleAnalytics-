angular.module('googleAnalyticsModule')
    .controller('rightMenuController', _rightMenuController);
_rightMenuController.$inject = ['$timeout', 'googleAnalyticsService', '$window', 'NODE_WEB_API', 'GOAL_EVENT_NAME'];
function _rightMenuController($timeout, googleAnalyticsService, $window, NODE_WEB_API, GOAL_EVENT_NAME) {
    var rightMenuCtrl = this;
    
    // 
    rightMenuCtrl.GOAL_EVENT_NAME = GOAL_EVENT_NAME;
    rightMenuCtrl.showVisitiors = true;
    rightMenuCtrl.showConversions = false;
    rightMenuCtrl.showSettings = false;
    // Controller Function
    rightMenuCtrl.getConvertedUserData = _getConvertedUserData;
    $timeout(function () {
        rightMenuCtrl.setBackGroundColorFlag = true;
        googleAnalyticsService.serverRequest(NODE_WEB_API.ALL_TIME_USER_DATA_API, 'GET')
            .then(_getHistoricalUserData);
    }, 100);

    function _getHistoricalUserData(result) {
        console.log(result);
        if(angular.isObject(rightMenuCtrl.userData) && Object.keys(rightMenuCtrl.userData).length) {
            
        } else {
            rightMenuCtrl.userData = result.data;
        }
        
    }

    function _getConvertedUserData (userData) {
        var parsedWordArray = CryptoJS.enc.Base64.parse(userData).toString(CryptoJS.enc.Utf8);
        return JSON.parse(parsedWordArray).userInfo;
    }
}