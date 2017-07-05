Analytics = require("../Model/Analytics"); // Require User Molel file
var Q = require("q");
// Insert New User Function 
function _saveAnalyticsInfo(analyticsData) {
    var saveAnalytics = new Analytics(analyticsData);
    saveAnalytics.save(function (err, doc) {
        console.log(err, doc);
    });
}

function _updateConnectionAnalyticsInfo(socket_id, analyticsData) {
    Analytics.findOneAndUpdate({ socket_id: socket_id }, { $set: analyticsData, $push: { "performed_event": analyticsData.current_event_name } }, { new: true }, function (err, doc) {
        console.log(err, doc);
    });
}

function _findAnalyticsData(filterObject) {
    var defer = Q.defer();
    Analytics.find(filterObject, function (err, docs) {
        defer.resolve(docs)
    });
    return defer.promise;
}
// Export Methodz
module.exports = {
    saveAnalyticsInfo: _saveAnalyticsInfo,
    updateConnectionAnalyticsInfo: _updateConnectionAnalyticsInfo,
    findAnalyticsData : _findAnalyticsData
};