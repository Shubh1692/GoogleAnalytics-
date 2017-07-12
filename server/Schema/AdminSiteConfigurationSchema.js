var mongoose = require("mongoose"),
    // Make dummy schema by mogoose for a Analytics colleaction in data base
    AnalyticsSchema = mongoose.Schema({
        host: {
            type: String,
        },
        site_configuration : {
            type : Object,
            default : null
        } 
    }, {
            timestamps: true
        });
// Export Analytics Schema
module.exports = AnalyticsSchema;