/**
 * WorkoutController
 * Syllabus: Working with Arrays, ng-repeat, ng-model, ng-options,
 *           ng-click, ng-change, ng-show, ng-hide, ng-disabled,
 *           Multiple Controllers, Passing parameters to method
 */
app.controller('WorkoutController', ['$scope', 'WorkoutService',
function ($scope, WorkoutService) {

  var vm = this;

  // ── State ─────────────────────────────────────────────────────────────────
  vm.workouts     = [];
  vm.weeklyStats  = null;
  vm.loading      = true;
  vm.showForm     = false;
  vm.saving       = false;
  vm.editingId    = null;
  vm.currentPage  = 1;
  vm.totalPages   = 1;
  vm.activeFilter = 'all';
  vm.error        = '';
  vm.successMsg   = '';

  // ── Filter types (ng-repeat example) ──────────────────────────────────────
  vm.filterTypes = [
    { value: 'all',         label: 'All',           icon: 'fa-layer-group' },
    { value: 'strength',    label: 'Strength',      icon: 'fa-dumbbell' },
    { value: 'cardio',      label: 'Cardio',        icon: 'fa-person-running' },
    { value: 'hiit',        label: 'HIIT',          icon: 'fa-bolt' },
    { value: 'flexibility', label: 'Flexibility',    icon: 'fa-person-walking' },
    { value: 'mixed',       label: 'Mixed',         icon: 'fa-shuffle' },
    { value: 'sports',      label: 'Sports',        icon: 'fa-volleyball' }
  ];

  // ── ng-options data arrays ─────────────────────────────────────────────────
  vm.workoutTypes  = ['strength','cardio','hiit','flexibility','mixed','sports'];
  vm.intensities   = ['low','moderate','high','extreme'];
  vm.moods         = ['terrible','bad','okay','good','great'];
  vm.exCategories  = ['strength','cardio','flexibility','hiit','balance'];

  // ── Blank workout model ────────────────────────────────────────────────────
  vm.resetForm = function () {
    vm.form = {
      title: '', type: 'strength',
      date:  new Date().toISOString().split('T')[0],
      duration: null, intensity: 'moderate', mood: 'good',
      notes: '', exercises: []
    };
    vm.editingId = null;
  };
  vm.resetForm();

  // ── Load workouts with params (Passing parameters to method) ───────────────
  vm.loadWorkouts = function () {
    vm.loading = true;
    var params = { page: vm.currentPage, limit: 12 };
    if (vm.activeFilter !== 'all') params.type = vm.activeFilter;

    WorkoutService.getWorkouts(params)
      .then(function (res) {
        vm.workouts   = res.data.data || [];
        vm.totalPages = res.data.pagination ? res.data.pagination.pages : 1;
        vm.loading    = false;
      })
      .catch(function () { vm.loading = false; });
  };

  vm.loadWeeklyStats = function () {
    WorkoutService.getWeeklyStats()
      .then(function (res) { vm.weeklyStats = res.data.data; });
  };

  vm.loadWorkouts();
  vm.loadWeeklyStats();

  // ── Filter ────────────────────────────────────────────────────────────────
  vm.setFilter = function (type) {
    vm.activeFilter = type;
    vm.currentPage  = 1;
    vm.loadWorkouts();
  };

  // ── Pagination ────────────────────────────────────────────────────────────
  vm.changePage = function (p) {
    if (p < 1 || p > vm.totalPages) return;
    vm.currentPage = p;
    vm.loadWorkouts();
  };

  // ── Open create form ──────────────────────────────────────────────────────
  vm.openForm = function () {
    vm.resetForm();
    vm.showForm = true;
  };

  // ── Edit ─────────────────────────────────────────────────────────────────
  vm.editWorkout = function (w) {
    vm.editingId = w._id;
    vm.form = {
      title:     w.title,
      type:      w.type,
      date:      new Date(w.date).toISOString().split('T')[0],
      duration:  w.duration,
      intensity: w.intensity,
      mood:      w.mood,
      notes:     w.notes || '',
      exercises: angular.copy(w.exercises || [])
    };
    vm.showForm = true;
  };

  vm.closeForm = function () {
    vm.showForm  = false;
    vm.editingId = null;
    vm.error     = '';
  };

  // ── Exercises Array management (Working with Arrays) ──────────────────────
  vm.addExercise = function () {
    vm.form.exercises.push({
      name: '', category: 'strength',
      sets: null, reps: null, weight: null, caloriesBurned: null
    });
  };

  vm.removeExercise = function (index) {
    vm.form.exercises.splice(index, 1);
  };

  // ── Save ──────────────────────────────────────────────────────────────────
  vm.saveWorkout = function () {
    if (!vm.form.title || !vm.form.duration) {
      vm.error = 'Title and duration are required.';
      return;
    }
    vm.saving = true;
    vm.error  = '';

    var promise = vm.editingId
      ? WorkoutService.updateWorkout(vm.editingId, vm.form)
      : WorkoutService.createWorkout(vm.form);

    promise
      .then(function () {
        vm.saving      = false;
        vm.successMsg  = vm.editingId ? 'Workout updated!' : 'Workout logged!';
        vm.closeForm();
        vm.loadWorkouts();
        vm.loadWeeklyStats();
        setTimeout(function () { $scope.$apply(function () { vm.successMsg = ''; }); }, 3000);
      })
      .catch(function (err) {
        vm.error  = (err.data && err.data.message) || 'Failed to save workout.';
        vm.saving = false;
      });
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  vm.deleteWorkout = function (id) {
    if (!confirm('Delete this workout?')) return;
    WorkoutService.deleteWorkout(id)
      .then(function () { vm.loadWorkouts(); vm.loadWeeklyStats(); });
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  vm.typeLabel = function (t) {
    var map = { strength:'Strength', cardio:'Cardio', hiit:'HIIT',
                flexibility:'Flexibility', mixed:'Mixed', sports:'Sports' };
    return map[t] || t;
  };

  vm.typeIcon = function (t) {
    var map = { strength:'fa-dumbbell', cardio:'fa-person-running', hiit:'fa-bolt',
                flexibility:'fa-person-walking', mixed:'fa-shuffle', sports:'fa-volleyball' };
    return map[t] || 'fa-dumbbell';
  };

  vm.intensityWidth = function (i) {
    var m = { low:'25%', moderate:'50%', high:'75%', extreme:'100%' };
    return m[i] || '50%';
  };

  vm.moodIcon = function (m) {
    var map = { terrible:'fa-face-angry', bad:'fa-face-frown', okay:'fa-face-meh', good:'fa-face-smile', great:'fa-fire' };
    return map[m] || 'fa-face-smile';
  };
}]);
