angular.module('googleAnalyticsModule')
    .controller('rightMenuController', _rightMenuController);
_rightMenuController.$inject = ['$timeout', 'googleAnalyticsService', '$window', 'NODE_WEB_API', 'GOAL_EVENT_NAME', 'BROWSER_LOGOS_PATH', 'VISITOR_ICONS_PATH', '_', 'SPEED_ARRAY', 'DEFAULT_D3CIRCLE_CONSTRAINT'];
function _rightMenuController($timeout, googleAnalyticsService, $window, NODE_WEB_API, GOAL_EVENT_NAME, BROWSER_LOGOS_PATH, VISITOR_ICONS_PATH, _, SPEED_ARRAY, DEFAULT_D3CIRCLE_CONSTRAINT) {
    var rightMenuCtrl = this;
    // Controller Variables
    rightMenuCtrl.GOAL_EVENT_NAME = GOAL_EVENT_NAME[0];
    rightMenuCtrl.SPEED_ARRAY = SPEED_ARRAY;
    rightMenuCtrl.showVisitiors = true;
    rightMenuCtrl.showConversions = false;
    rightMenuCtrl.showSettings = false;
    rightMenuCtrl.getConvertedUserData = googleAnalyticsService.getConvertedUserData;
    rightMenuCtrl.browserLogoUrl = BROWSER_LOGOS_PATH;
    rightMenuCtrl.VISITOR_ICONS_PATH = VISITOR_ICONS_PATH;
    rightMenuCtrl.DEFAULT_D3CIRCLE_CONSTRAINT = angular.copy(DEFAULT_D3CIRCLE_CONSTRAINT);
    rightMenuCtrl.speed = rightMenuCtrl.DEFAULT_D3CIRCLE_CONSTRAINT.speed;
    rightMenuCtrl.renderRightMenu = _renderRightMenu;
    googleAnalyticsService.renderRightMenu = _renderRightMenu;
    console.log('rightMenuCtrl', rightMenuCtrl)
    // Controller Function
    function _renderRightMenu() {
        rightMenuCtrl.setBackGroundColorFlag = true;
        console.log('_renderRightMenu Ctrl', rightMenuCtrl)
        googleAnalyticsService.serverRequest(NODE_WEB_API.ALL_TIME_USER_DATA_API, 'POST', {
            host: (googleAnalyticsService.selectHost && googleAnalyticsService.selectHost.host) ? googleAnalyticsService.selectHost.host : 'example.com'
        })
            .then(_getHistoricalUserData);
    }

    function _getHistoricalUserData(result) {
        if (angular.isObject(rightMenuCtrl.userData) && Object.keys(rightMenuCtrl.userData).length) {
            _.each(rightMenuCtrl.userData[googleAnalyticsService.getFormattedCurrentDate()].onload, function (value) {
                if (!result.data[googleAnalyticsService.getFormattedCurrentDate()]) {
                    result.data[googleAnalyticsService.getFormattedCurrentDate()] = {
                        onload: [],
                        date: new Date()
                    };
                    result.data[googleAnalyticsService.getFormattedCurrentDate()][GOAL_EVENT_NAME[0]] = [];
                }
                if (value[1] === 'onload')
                    result.data[googleAnalyticsService.getFormattedCurrentDate()].onload.push(value);
                else if (value[1] === GOAL_EVENT_NAME[0])
                    result.data[googleAnalyticsService.getFormattedCurrentDate()][GOAL_EVENT_NAME[0]].push(value);
            })
        }
        rightMenuCtrl.userData = result.data;
    }

}