/**
 * WorkoutService – Custom AngularJS Service
 * Syllabus: Creating Custom Services, $http module, NodeJS REST API
 */
app.service('WorkoutService', ['$http', function ($http) {

  var API = '/api/workouts';

  this.getWorkouts = function (params) {
    return $http.get(API, { params: params });
  };

  this.getWorkout = function (id) {
    return $http.get(API + '/' + id);
  };

  this.createWorkout = function (data) {
    return $http.post(API, data);
  };

  this.updateWorkout = function (id, data) {
    return $http.put(API + '/' + id, data);
  };

  this.deleteWorkout = function (id) {
    return $http.delete(API + '/' + id);
  };

  this.getWeeklyStats = function () {
    return $http.get(API + '/weekly-stats');
  };
}]);
