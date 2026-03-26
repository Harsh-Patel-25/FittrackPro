app.service('NutritionService', ['$http', function ($http) {
  var API = '/api/nutrition';
  this.getLogs = function (p) { return $http.get(API, { params: p }); };
  this.getDailySummary = function (d) { return $http.get(API + '/daily-summary', { params: { date: d } }); };
  this.getWeeklyStats = function () { return $http.get(API + '/weekly-stats'); };
  this.createLog = function (d) { return $http.post(API, d); };
  this.updateLog = function (id, d) { return $http.put(API + '/' + id, d); };
  this.deleteLog = function (id) { return $http.delete(API + '/' + id); };
}]);
