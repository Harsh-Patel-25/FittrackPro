/**
 * AuthController
 * Syllabus: AngularJS Forms – Simple form, working with input elements,
 *           Validation of inputs, Form Events CSS Classes, Custom Validation,
 *           $scope object, ng-model (Object binding and expression)
 */
app.controller('AuthController', ['$scope', '$location', 'AuthService',
function ($scope, $location, AuthService) {

  var vm = this;

  // ── Login Model ────────────────────────────────────────────────────────────
  vm.loginData = { email: '', password: '' };
  vm.loginError   = '';
  vm.loginLoading = false;
  vm.showPassword = false;

  vm.login = function () {
    if (!vm.loginData.email || !vm.loginData.password) {
      vm.loginError = 'Please fill in all fields.';
      return;
    }
    vm.loginLoading = true;
    vm.loginError   = '';

    AuthService.login(vm.loginData)
      .then(function () {
        $location.path('/dashboard');
      })
      .catch(function (err) {
        vm.loginError   = (err.data && err.data.message) || 'Invalid email or password.';
        vm.loginLoading = false;
      });
  };

  // ── Register Model ─────────────────────────────────────────────────────────
  vm.registerData = {
    name: '', email: '', password: '', confirmPassword: '',
    fitnessGoal: 'maintain', activityLevel: 'moderate'
  };
  vm.registerError   = '';
  vm.registerLoading = false;

  vm.fitnessGoals = [
    { value: 'lose_weight',       label: '🏃 Lose Weight' },
    { value: 'maintain',          label: '⚖️ Maintain Weight' },
    { value: 'gain_muscle',       label: '💪 Gain Muscle' },
    { value: 'improve_endurance', label: '🏅 Improve Endurance' }
  ];

  vm.activityLevels = [
    { value: 'sedentary',  label: '😴 Sedentary' },
    { value: 'light',      label: '🚶 Lightly Active' },
    { value: 'moderate',   label: '🏋️ Moderately Active' },
    { value: 'active',     label: '🏃 Active' },
    { value: 'very_active',label: '⚡ Very Active' }
  ];

  vm.register = function (registerForm) {
    vm.registerError = '';

    // Custom Validation (syllabus: Custom Validation)
    if (registerForm.$invalid) {
      vm.registerError = 'Please fix the errors above.';
      return;
    }
    if (vm.registerData.password !== vm.registerData.confirmPassword) {
      vm.registerError = 'Passwords do not match.';
      return;
    }

    vm.registerLoading = true;

    AuthService.register({
      name:     vm.registerData.name,
      email:    vm.registerData.email,
      password: vm.registerData.password,
      profile: {
        fitnessGoal:   vm.registerData.fitnessGoal,
        activityLevel: vm.registerData.activityLevel
      }
    })
    .then(function () {
      $location.path('/dashboard');
    })
    .catch(function (err) {
      vm.registerError   = (err.data && err.data.message) || 'Registration failed.';
      vm.registerLoading = false;
    });
  };
}]);
