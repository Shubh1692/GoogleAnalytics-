Analytics = require("../Model/Analytics"); // Require User Molel file
// Insert New User Function 
function _saveAnalyticsInfo(analyticsData) {
    var saveAnalytics = new Analytics(analyticsData);
    saveAnalytics.save(function(err, doc) {
        console.log(err, doc);
    });
}

function _updateConnectionAnalyticsInfo(socket_id, analyticsData) {
    Analytics.findOneAndUpdate({ socket_id: socket_id }, { $set: analyticsData, $push: {"performed_event": analyticsData.current_event_name}}, { new: true }, function(err, doc) {
        console.log(err, doc);
    });
}
// Export Methodz
module.exports = {
    saveAnalyticsInfo: _saveAnalyticsInfo,
    updateConnectionAnalyticsInfo : _updateConnectionAnalyticsInfo
};