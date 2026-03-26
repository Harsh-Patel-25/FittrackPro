app.service('ProgressService', ['$http', function ($http) {
  var API = '/api/progress';
  this.getDashboardSummary = function () { return $http.get(API + '/dashboard'); };
  this.getMonthlyProgress = function (y, m) { return $http.get(API + '/monthly', { params: { year: y, month: m } }); };
  this.getWeeklyInsights = function () { return $http.get(API + '/insights'); };
}]);
