angular.module('googleAnalyticsModule')
    .controller('rightMenuController', _rightMenuController);
_rightMenuController.$inject = ['$timeout', 'googleAnalyticsService', '$window'];
function _rightMenuController($timeout, googleAnalyticsService, $window) {
    var rightMenuCtrl = this;
    $timeout(function(){
        rightMenuCtrl.setBackGroundColorFlag = true;
    }, 100)
}