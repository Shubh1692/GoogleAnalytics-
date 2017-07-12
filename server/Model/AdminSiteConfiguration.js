var mongoose = require("mongoose"), // Require mongoose files
    AdminSiteConfigurationSchema = require("../Schema/AdminSiteConfigurationSchema"), // Require Analytics Schema file
    AdminSiteConfiguration = mongoose.model('AdminSiteConfiguration', AdminSiteConfigurationSchema);
module.exports = AdminSiteConfiguration; // Export AdminSiteConfiguration Model