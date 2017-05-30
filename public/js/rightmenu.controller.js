angular.module('googleAnalyticsModule')
    .controller('rightMenuController', _rightMenuController);
_rightMenuController.$inject = ['$timeout', 'googleAnalyticsService', '$window', 'NODE_WEB_API', 'GOAL_EVENT_NAME', 'BROWSER_LOGOS_PATH', 'VISITOR_ICONS_PATH', '_', 'SPEED_ARRAY'];
function _rightMenuController($timeout, googleAnalyticsService, $window, NODE_WEB_API, GOAL_EVENT_NAME, BROWSER_LOGOS_PATH, VISITOR_ICONS_PATH, _, SPEED_ARRAY) {
    var rightMenuCtrl = this;
    
    // 
    rightMenuCtrl.GOAL_EVENT_NAME = GOAL_EVENT_NAME;
    rightMenuCtrl.SPEED_ARRAY = SPEED_ARRAY;
    rightMenuCtrl.showVisitiors = true;
    rightMenuCtrl.showConversions = false;
    rightMenuCtrl.showSettings = false;
    // Controller Function
    rightMenuCtrl.getConvertedUserData = googleAnalyticsService.getConvertedUserData;
    rightMenuCtrl.browserLogoUrl = BROWSER_LOGOS_PATH;
    rightMenuCtrl.VISITOR_ICONS_PATH = VISITOR_ICONS_PATH;
    $timeout(function () {
        rightMenuCtrl.setBackGroundColorFlag = true;
        googleAnalyticsService.serverRequest(NODE_WEB_API.ALL_TIME_USER_DATA_API, 'GET')
            .then(_getHistoricalUserData);
    }, 100);

    function _getHistoricalUserData(result) {
        if(angular.isObject(rightMenuCtrl.userData) && Object.keys(rightMenuCtrl.userData).length) {
            _.each(rightMenuCtrl.userData[googleAnalyticsService.getFormattedCurrentDate()].onload, function(value){
                if(!result.data[googleAnalyticsService.getFormattedCurrentDate()]) {
                    result.data[googleAnalyticsService.getFormattedCurrentDate()] = {
                        onload : [],
                        date : new Date()
                    };
                    result.data[googleAnalyticsService.getFormattedCurrentDate()][GOAL_EVENT_NAME] = [];
                }
                if(value[1] === 'onload')
                    result.data[googleAnalyticsService.getFormattedCurrentDate()].onload.push(value);
                else if(value[1] === GOAL_EVENT_NAME)
                    result.data[googleAnalyticsService.getFormattedCurrentDate()][GOAL_EVENT_NAME].push(value);
            })
        }
        rightMenuCtrl.userData = result.data;
    }
}