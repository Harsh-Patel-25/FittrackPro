/**
 * DashboardController
 * Syllabus: Working with Arrays, Object binding and expression,
 *           ng-repeat (Arrays as member in controller scope),
 *           $scope, Adding behavior to $scope
 */
app.controller('DashboardController', ['$scope', '$rootScope', 'ProgressService', 'GoalService', 'AuthService',
function ($scope, $rootScope, ProgressService, GoalService, AuthService) {

  var vm = this;

  vm.summary  = null;
  vm.goals    = [];
  vm.insights = [];
  vm.loading  = true;
  vm.error    = '';

  // ── Greeting ──────────────────────────────────────────────────────────────
  vm.greeting = function () {
    var h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  vm.firstName = function () {
    var user = AuthService.getUser();
    return user ? user.name.split(' ')[0] : 'Athlete';
  };

  // ── Progress percent helper (for stat bars) ────────────────────────────────
  vm.pct = function (val, goal) {
    if (!val || !goal) return 0;
    return Math.min(Math.round((val / goal) * 100), 100);
  };

  // ── Ring dash for SVG goal rings ───────────────────────────────────────────
  vm.ringDash = function (pct) {
    return ((pct / 100) * 100).toFixed(1);
  };

  // ── Load Dashboard ─────────────────────────────────────────────────────────
  vm.loadDashboard = function () {
    vm.loading = true;

    ProgressService.getDashboardSummary()
      .then(function (res) {
        vm.summary = res.data.data;
        vm.loading = false;
      })
      .catch(function () {
        vm.error   = 'Failed to load dashboard.';
        vm.loading = false;
      });

    GoalService.getGoals()
      .then(function (res) {
        // Working with Arrays: filter active goals (syllabus: Working with Arrays)
        vm.goals = (res.data.data || []).filter(function (g) {
          return g.isActive && !g.isCompleted;
        }).slice(0, 4);
      });

    ProgressService.getWeeklyInsights()
      .then(function (res) {
        vm.insights = res.data.data.insights || [];
      });
  };

  vm.loadDashboard();

  // ── Quick stat calculations ────────────────────────────────────────────────
  vm.calorieInPct  = function () { return vm.summary ? vm.pct(vm.summary.today.caloriesIn, 2000)       : 0; };
  vm.calorieOutPct = function () { return vm.summary ? vm.pct(vm.summary.today.caloriesBurned, 600)    : 0; };
  vm.proteinPct    = function () { return vm.summary ? vm.pct(vm.summary.today.protein, 150)           : 0; };
  vm.waterPct      = function () { return vm.summary ? vm.pct(vm.summary.today.water, 2500)            : 0; };
  vm.workoutPct    = function () { return vm.summary ? vm.pct(vm.summary.today.workouts, 2)            : 0; };
  vm.durationPct   = function () { return vm.summary ? vm.pct(vm.summary.today.workoutDuration, 60)    : 0; };

  // ── Mood emoji map ────────────────────────────────────────────────────────
  vm.moodEmoji = function (m) {
    var map = { terrible:'fa-face-angry', bad:'fa-face-frown', okay:'fa-face-meh', good:'fa-face-smile', great:'fa-fire' };
    return map[m] || 'fa-face-smile';
  };
}]);
