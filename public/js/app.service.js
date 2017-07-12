angular.module('googleAnalyticsModule')
    .service('googleAnalyticsService', _googleAnalyticsService)
    .service('dataPassingService', _dataPassingService);
_googleAnalyticsService.$inject = ['$http', '$q', 'Notification', 'NOTIFICATION_CONSTANT'];
_dataPassingService.$inject = [];

function _googleAnalyticsService($http, $q, Notification, NOTIFICATION_CONSTANT) {
    var googleAnalyticsService = this;
    googleAnalyticsService.serverRequest = _serverRequest;
    googleAnalyticsService.serverError = _serverError;
    googleAnalyticsService.getFormattedCurrentDate = _getFormattedCurrentDate;
    googleAnalyticsService.getConvertedUserData = _getConvertedUserData;
    googleAnalyticsService.setTooltipView = _setTooltipView;
    googleAnalyticsService.showUserNotification = _showUserNotification;
    // Method for Do Server Request
    function _serverRequest(url, method, postData) {
        var defer = $q.defer();
        var data = postData || '';
        $http({
            method: method,
            url: url,
            data: data,
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(function (res) {
            if (res.data.successMessage) {
                defer.resolve(res.data.data);
            } else {
                defer.reject(res);
                googleAnalyticsService.serverError(res);
            }
        }, function (res, status, headers, config) {
            googleAnalyticsService.serverError(res);
            defer.reject(res);
        });
        return defer.promise;
    };

    function _serverError(res) {
        console.log('error', res.errorMessage)
    };

    function _getFormattedCurrentDate() {
        var month = (new Date().getMonth() + 1).toString().length === 1 ? ('0' + (new Date().getMonth() + 1).toString()) : (new Date().getMonth() + 1).toString();
        var day = new Date().getDate().toString().length === 1 ? ('0' + new Date().getDate().toString()) : new Date().getDate().toString();
        return day + '-' + month + '-' + new Date().getFullYear();
    }

    function _getConvertedUserData(userData) {
        try {
            if (angular.isString(userData))
                userData = JSON.parse(CryptoJS.enc.Base64.parse(userData).toString(CryptoJS.enc.Utf8));
            return userData;
        } catch (e) {
            return true;
        }
    }
    // Add Tooltip Display to D3 circle
    function _setTooltipView(userInfo) {
        var html = '<div>'
        _.each(userInfo, function (value, key) {
            html = html + key.toUpperCase() + ' : ' + value + '</br>';
        })
        return html = html + '</div>';
    }

    function _showUserNotification(usrInfo) {
        Notification.primary({
            message: _setTooltipView(usrInfo.userInfo),
        });
    }
}

function _dataPassingService() {
    var dataPassingService = this;
    dataPassingService.menuObj = {};
}