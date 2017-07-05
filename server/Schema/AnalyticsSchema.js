var mongoose = require("mongoose"),
    // Make dummy schema by mogoose for a Analytics colleaction in data base
    AnalyticsSchema = mongoose.Schema({
        host: {
            type: String,
        },
        socket_id: {
            type: String
        },
        user_info: {
            type: String,
            default : null
        },
        country_name: {
            type: String
        },
        country_code: {
            type: String
        },
        performed_event: [{
            type: String,
            default: ['onload']
        }],
        browser: {
            type: String
        },
        device: {
            type: String
        },
        os: {
            type: String
        },
        current_event_name: {
            type: String,
            default: 'onload'
        }
    }, {
            timestamps: true
        });
// Export Analytics Schema
module.exports = AnalyticsSchema;