AdminSiteConfiguration = require("../Model/AdminSiteConfiguration"); // Require User Molel file
var Q = require("q");

function _submitInputConfiguration(req, res) {
    AdminSiteConfiguration.findOneAndUpdate({ host: req.body.host }, { $set: { site_configuration: req.body.site_configuration } }, { new: true }, function (err, doc) {
        console.log(err, doc);
        if (!doc) {
            saveAdminSiteConfig = new AdminSiteConfiguration({
                host: req.body.host,
                site_configuration: req.body.site_configuration
            });
            saveAdminSiteConfig.save(function (err, docs) {
                res.send({
                    successMessage: 'Save Successfully',
                    data: null
                });
            });
        } else {
            res.send({
                successMessage: 'Update Successfully',
                data: null
            });
        }
    });
}

function _getInputConfiguration(req, res) {
    AdminSiteConfiguration.find(req.body, function (err, doc) {
        console.log(err, doc);
        if (doc) {
            res.send({
                successMessage: 'Get Successfully',
                data: doc
            });
        } else {
            res.send({
                errorMessage: 'Not Found',
                data: null
            });
        }
    });
}
// Export Methodz
module.exports = {
    submitInputConfiguration: _submitInputConfiguration,
    getInputConfiguration : _getInputConfiguration
};