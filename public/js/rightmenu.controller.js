angular.module('googleAnalyticsModule')
    .controller('rightMenuController', _rightMenuController);
_rightMenuController.$inject = ['$timeout', 'googleAnalyticsService', '$window', 'NODE_WEB_API', 'GOAL_EVENT_NAME', 'BROWSER_LOGOS_PATH', 'VISITOR_ICONS_PATH'];
function _rightMenuController($timeout, googleAnalyticsService, $window, NODE_WEB_API, GOAL_EVENT_NAME, BROWSER_LOGOS_PATH, VISITOR_ICONS_PATH) {
    var rightMenuCtrl = this;
    
    // 
    rightMenuCtrl.GOAL_EVENT_NAME = GOAL_EVENT_NAME;
    rightMenuCtrl.showVisitiors = true;
    rightMenuCtrl.showConversions = false;
    rightMenuCtrl.showSettings = false;
    // Controller Function
    rightMenuCtrl.getConvertedUserData = googleAnalyticsService.getConvertedUserData;
    rightMenuCtrl.browserLogoUrl = BROWSER_LOGOS_PATH;
    rightMenuCtrl.VISITOR_ICONS_PATH = VISITOR_ICONS_PATH;
    console.log(rightMenuCtrl.browserLogoUrl)
    $timeout(function () {
        rightMenuCtrl.setBackGroundColorFlag = true;
        googleAnalyticsService.serverRequest(NODE_WEB_API.ALL_TIME_USER_DATA_API, 'GET')
            .then(_getHistoricalUserData);
    }, 100);

    function _getHistoricalUserData(result) {
        if(angular.isObject(rightMenuCtrl.userData) && Object.keys(rightMenuCtrl.userData).length) {
            console.log(rightMenuCtrl.userData)
        } else {
            rightMenuCtrl.userData = result.data;
        }
        console.log(rightMenuCtrl.userData)
    }
}