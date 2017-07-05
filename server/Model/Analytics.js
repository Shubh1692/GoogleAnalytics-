var mongoose = require("mongoose"), // Require mongoose files
    AnalyticsSchema = require("../Schema/AnalyticsSchema"), // Require Analytics Schema file
    Analytics = mongoose.model('Analytics', AnalyticsSchema);
module.exports = Analytics; // Export Analytics Model