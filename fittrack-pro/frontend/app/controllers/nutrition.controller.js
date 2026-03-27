/**
 * NutritionController
 * Syllabus: Working with Arrays, ng-repeat, ng-model, ng-options, ng-change
 */
app.controller('NutritionController', ['$scope', 'NutritionService',
function ($scope, NutritionService) {

  var vm = this;

  vm.logs         = [];
  vm.dailySummary = null;
  vm.loading      = true;
  vm.showForm     = false;
  vm.saving       = false;
  vm.editingId    = null;
  vm.error        = '';
  vm.successMsg   = '';
  vm.selectedDate = new Date().toISOString().split('T')[0];

  vm.mealTypes = ['breakfast','lunch','dinner','snack','pre_workout','post_workout'];

  vm.units = ['g','ml','serving','piece','cup','tbsp','tsp','oz'];

  vm.resetForm = function () {
    vm.form = {
      mealType: 'breakfast',
      date:     vm.selectedDate,
      water:    null, notes: '',
      foods: [{ name:'', quantity:null, unit:'g', calories:null, protein:null, carbs:null, fat:null }]
    };
    vm.editingId = null;
  };
  vm.resetForm();

  vm.loadData = function () {
    vm.loading = true;
    NutritionService.getLogs({ date: vm.selectedDate })
      .then(function (res) { vm.logs = res.data.data || []; vm.loading = false; })
      .catch(function () { vm.loading = false; });

    NutritionService.getDailySummary(vm.selectedDate)
      .then(function (res) { vm.dailySummary = res.data.data; });
  };

  vm.loadData();

  vm.changeDate = function () { vm.loadData(); };

  vm.logsByMealType = function (type) {
    return vm.logs.filter(function (l) { return l.mealType === type; });
  };

  vm.mealTypeCalories = function (type) {
    return vm.logsByMealType(type).reduce(function (s, l) { return s + (l.totalCalories || 0); }, 0);
  };

  vm.mealTypeIcon = function (t) {
    var m = { breakfast:'fa-sun', lunch:'fa-cloud-sun', dinner:'fa-moon', snack:'fa-apple-whole', pre_workout:'fa-bolt', post_workout:'fa-dna' };
    return m[t] || 'fa-utensils';
  };

  vm.openForm = function () {
    vm.resetForm();
    vm.showForm = true;
  };

  vm.editLog = function (log) {
    vm.editingId = log._id;
    vm.form = {
      mealType: log.mealType,
      date:     new Date(log.date).toISOString().split('T')[0],
      water:    log.water || 0,
      notes:    log.notes || '',
      foods:    angular.copy(log.foods || [])
    };
    vm.showForm = true;
  };

  vm.closeForm = function () { vm.showForm = false; vm.editingId = null; vm.error = ''; };

  vm.addFood = function () {
    vm.form.foods.push({ name:'', quantity:null, unit:'g', calories:null, protein:null, carbs:null, fat:null });
  };

  vm.removeFood = function (i) { vm.form.foods.splice(i, 1); };

  vm.saveLog = function () {
    if (!vm.form.mealType || !vm.form.foods.length) {
      vm.error = 'Meal type and at least one food item required.';
      return;
    }
    vm.saving = true;
    vm.error  = '';

    var promise = vm.editingId
      ? NutritionService.updateLog(vm.editingId, vm.form)
      : NutritionService.createLog(vm.form);

    promise
      .then(function () {
        vm.saving = false; vm.successMsg = 'Meal logged!';
        vm.closeForm(); vm.loadData();
        setTimeout(function () { $scope.$apply(function () { vm.successMsg = ''; }); }, 3000);
      })
      .catch(function (err) {
        vm.error = (err.data && err.data.message) || 'Failed to save.';
        vm.saving = false;
      });
  };

  vm.deleteLog = function (id) {
    if (!confirm('Delete this meal?')) return;
    NutritionService.deleteLog(id).then(function () { vm.loadData(); });
  };

  vm.pct = function (val, goal) {
    if (!val || !goal) return 0;
    return Math.min(Math.round((val / goal) * 100), 100);
  };
}]);
