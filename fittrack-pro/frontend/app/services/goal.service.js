app.service('GoalService', ['$http', function ($http) {
  var API = '/api/goals';
  this.getGoals = function () { return $http.get(API); };
  this.createGoal = function (d) { return $http.post(API, d); };
  this.updateGoal = function (id, d) { return $http.put(API + '/' + id, d); };
  this.updateProgress = function (id, v) { return $http.patch(API + '/' + id + '/progress', { currentValue: v }); };
  this.deleteGoal = function (id) { return $http.delete(API + '/' + id); };
}]);
