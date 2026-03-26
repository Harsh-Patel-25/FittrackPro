/**
 * ProgressController
 * Syllabus: Working with Arrays, ng-repeat, custom directives (bar-chart, line-chart, progress-ring)
 */
app.controller('ProgressController', ['$scope', 'ProgressService', 'GoalService',
function ($scope, ProgressService, GoalService) {

  var vm = this;

  vm.monthlyData  = null;
  vm.goals        = [];
  vm.insights     = [];
  vm.loading      = true;
  vm.goalFilter   = 'active';
  vm.showGoalForm = false;
  vm.savingGoal   = false;
  vm.editingGoalId= null;
  vm.showProgressModal = false;
  vm.updatingGoal      = null;
  vm.progressValue     = 0;

  vm.currentYear  = new Date().getFullYear();
  vm.currentMonth = new Date().getMonth() + 1;

  // Build month options for ng-options dropdown
  vm.monthOptions = [{ value: 'current', label: 'This Month' }];
  for (var mi = 1; mi <= 5; mi++) {
    var d = new Date();
    d.setMonth(d.getMonth() - mi);
    vm.monthOptions.push({
      value: d.getFullYear() + '-' + (d.getMonth() + 1),
      label: d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    });
  }
  vm.selectedMonth = 'current';

  // ng-options data
  vm.goalTypes = ['calories_in','calories_burned','protein','carbs','fat','water','workout_days','weight','custom'];
  vm.periods   = ['daily','weekly','monthly','one_time'];

  vm.goalForm = {
    title:'', type:'calories_in', targetValue:null, unit:'kcal', period:'daily', endDate:'', description:''
  };

  // ── Load all ───────────────────────────────────────────────────────────────
  vm.loadAll = function () {
    // Parse selected month
    if (vm.selectedMonth && vm.selectedMonth !== 'current') {
      var parts = vm.selectedMonth.split('-');
      vm.currentYear  = parseInt(parts[0]);
      vm.currentMonth = parseInt(parts[1]);
    } else {
      vm.currentYear  = new Date().getFullYear();
      vm.currentMonth = new Date().getMonth() + 1;
    }
    vm.loading = true;
    ProgressService.getMonthlyProgress(vm.currentYear, vm.currentMonth)
      .then(function (res) { vm.monthlyData = res.data.data; vm.loading = false; vm.buildCharts(); })
      .catch(function () { vm.loading = false; });

    GoalService.getGoals()
      .then(function (res) { vm.goals = res.data.data || []; });

    ProgressService.getWeeklyInsights()
      .then(function (res) { vm.insights = res.data.data.insights || []; });
  };

  vm.loadAll();

  // ── Build chart data (Working with Arrays) ─────────────────────────────────
  vm.workoutChartData  = [];
  vm.nutritionChartData= [];

  vm.buildCharts = function () {
    if (!vm.monthlyData) return;
    var daysInMonth = new Date(vm.currentYear, vm.currentMonth, 0).getDate();

    // Bar chart: workouts per day
    vm.workoutChartData = [];
    for (var i = 1; i <= daysInMonth; i++) {
      var d = (vm.monthlyData.workouts || []).filter(function (x) { return x._id === i; })[0];
      vm.workoutChartData.push({ label: String(i), value: d ? d.calories : 0 });
    }

    // Line chart: nutrition calories per day
    // Note: backend returns _id as integer (day of month) from $dayOfMonth aggregation
    vm.nutritionChartData = (vm.monthlyData.nutrition || []).map(function (d) {
      return { label: String(d._id), value: d.calories || 0 };
    });
  };

  // ── Filtered goals ─────────────────────────────────────────────────────────
  vm.filteredGoals = function () {
    return vm.goals.filter(function (g) {
      if (vm.goalFilter === 'active')    return g.isActive && !g.isCompleted;
      if (vm.goalFilter === 'completed') return g.isCompleted;
      return true;
    });
  };

  // ── Goal ring helper ───────────────────────────────────────────────────────
  vm.goalRingDash = function (pct) {
    var circ = 2 * Math.PI * 32;
    return (pct / 100) * circ + ' ' + circ;
  };

  // ── Summary helpers ────────────────────────────────────────────────────────
  vm.totalWorkoutsMonth = function () {
    if (!vm.monthlyData) return 0;
    return (vm.monthlyData.workouts || []).reduce(function (s, d) { return s + (d.count || 0); }, 0);
  };
  vm.totalCalBurnedMonth = function () {
    if (!vm.monthlyData) return 0;
    return (vm.monthlyData.workouts || []).reduce(function (s, d) { return s + (d.calories || 0); }, 0);
  };
  vm.totalDurationMonth = function () {
    if (!vm.monthlyData) return 0;
    return (vm.monthlyData.workouts || []).reduce(function (s, d) { return s + (d.duration || 0); }, 0);
  };
  vm.avgCaloriesMonth = function () {
    if (!vm.monthlyData) return 0;
    var data = vm.monthlyData.nutrition || [];
    if (!data.length) return 0;
    return data.reduce(function (s, d) { return s + (d.calories || 0); }, 0) / data.length;
  };

  // ── Goal CRUD ──────────────────────────────────────────────────────────────
  vm.openGoalForm = function () {
    vm.editingGoalId = null;
    vm.goalForm = { title:'', type:'calories_in', targetValue:null, unit:'kcal', period:'daily', endDate:'', description:'' };
    vm.showGoalForm = true;
  };

  vm.editGoal = function (goal) {
    vm.editingGoalId = goal._id;
    vm.goalForm = { title: goal.title, type: goal.type, targetValue: goal.targetValue,
                    unit: goal.unit, period: goal.period,
                    endDate: goal.endDate ? goal.endDate.split('T')[0] : '',
                    description: goal.description || '' };
    vm.showGoalForm = true;
  };

  vm.closeGoalForm = function () { vm.showGoalForm = false; vm.editingGoalId = null; };

  vm.saveGoal = function () {
    if (!vm.goalForm.title || !vm.goalForm.targetValue) return;
    vm.savingGoal = true;
    var promise = vm.editingGoalId
      ? GoalService.updateGoal(vm.editingGoalId, vm.goalForm)
      : GoalService.createGoal(vm.goalForm);
    promise.then(function () { vm.savingGoal = false; vm.closeGoalForm(); vm.loadAll(); })
           .catch(function () { vm.savingGoal = false; });
  };

  vm.deleteGoal = function (id) {
    if (!confirm('Delete this goal?')) return;
    GoalService.deleteGoal(id).then(function () { vm.loadAll(); });
  };

  vm.openUpdateProgress = function (goal) {
    vm.updatingGoal   = goal;
    vm.progressValue  = goal.currentValue || 0;
    vm.showProgressModal = true;
  };

  vm.submitProgress = function () {
    GoalService.updateProgress(vm.updatingGoal._id, vm.progressValue)
      .then(function () { vm.showProgressModal = false; vm.loadAll(); });
  };
}]);
