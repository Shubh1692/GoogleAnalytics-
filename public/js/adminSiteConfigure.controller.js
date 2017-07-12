angular.module('googleAnalyticsModule')
    .controller('adminSiteConfigureController', _adminSiteConfigureController);
_adminSiteConfigureController.$inject = ['$timeout', 'googleAnalyticsService', '$window', '$sce', 'socketAalytics'];
function _adminSiteConfigureController($timeout, googleAnalyticsService, $window, $sce, socketAalytics) {
    var adminSiteConfigureCtrl = this;
    adminSiteConfigureCtrl.showModal = false;
    adminSiteConfigureCtrl.formConfiguration = [];
    adminSiteConfigureCtrl.currentInputConfiguration = {
        inputIds: [],
        submitId: {}
    };
    adminSiteConfigureCtrl.formInputFlag = true;
    adminSiteConfigureCtrl.clientAdminSiteUrl = 'http://salty-hollows-92779.herokuapp.com';
    // Controller Function
    adminSiteConfigureCtrl.setClientUrl = _setClientUrl;
    adminSiteConfigureCtrl.submitFormInputConfiguration = _submitFormInputConfiguration;
    adminSiteConfigureCtrl.repickInputConfiguration = _repickInputConfiguration;
    adminSiteConfigureCtrl.submitFormSubmitConfiguration = _submitFormSubmitConfiguration;
    // Set Client Site Url in Iframe
    function _setClientUrl(url) {
        adminSiteConfigureCtrl.clientTrustAdminSiteUrl = $sce.trustAsResourceUrl(url);
    }

    function _submitFormInputConfiguration() {
        if (adminSiteConfigureCtrl.formInputFlag)
            adminSiteConfigureCtrl.currentInputConfiguration.inputIds.push(angular.copy(adminSiteConfigureCtrl.currentConfiguration));
        _repickInputConfiguration();
    }

    function _repickInputConfiguration() {
        adminSiteConfigureCtrl.currentConfiguration = null;
        adminSiteConfigureCtrl.startTracking = true;
        adminSiteConfigureCtrl.showModal = false;
    }

    function _submitFormSubmitConfiguration() {
        adminSiteConfigureCtrl.currentInputConfiguration.submitId = angular.copy(adminSiteConfigureCtrl.currentConfiguration);
        adminSiteConfigureCtrl.formConfiguration.push(adminSiteConfigureCtrl.currentInputConfiguration);
        var parser = document.createElement('a');
        parser.href = adminSiteConfigureCtrl.clientAdminSiteUrl;
        googleAnalyticsService.serverRequest('adminFormInputConfiguration', 'POST', {
            host: parser.hostname,
            site_configuration: adminSiteConfigureCtrl.formConfiguration
        })
            .then(function (data) {
                adminSiteConfigureCtrl.formConfiguration = [];
                _repickInputConfiguration();
            });
    }

    socketAalytics.on('get-configuration', function (configurationData) {
        console.log(configurationData);
        if (adminSiteConfigureCtrl.startTracking) {
            adminSiteConfigureCtrl.currentConfiguration = configurationData;
            adminSiteConfigureCtrl.startTracking = false;
            adminSiteConfigureCtrl.showModal = true;
        }
    });
}