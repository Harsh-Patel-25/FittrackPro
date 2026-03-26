/**
 * SettingsController
 * Syllabus: $scope, ng-model, ng-change, Forms, Validation
 */
app.controller('SettingsController', ['$scope', 'AuthService',
function ($scope, AuthService) {

  var vm = this;

  vm.user          = AuthService.getUser() || {};
  vm.savingProfile = false;
  vm.profileSaved  = false;
  vm.savingPw      = false;
  vm.pwSaved       = false;
  vm.pwError       = '';

  // Profile form model (ng-model binding)
  vm.profileForm = {
    name:          vm.user.name          || '',
    age:           (vm.user.profile && vm.user.profile.age)           || '',
    gender:        (vm.user.profile && vm.user.profile.gender)        || '',
    weight:        (vm.user.profile && vm.user.profile.weight)        || '',
    height:        (vm.user.profile && vm.user.profile.height)        || '',
    fitnessGoal:   (vm.user.profile && vm.user.profile.fitnessGoal)   || 'maintain',
    activityLevel: (vm.user.profile && vm.user.profile.activityLevel) || 'moderate'
  };

  vm.passwordForm = { currentPassword:'', newPassword:'', confirmPassword:'' };

  vm.genders         = ['male','female','other'];
  vm.fitnessGoals    = ['lose_weight','maintain','gain_muscle','improve_endurance'];
  vm.activityLevels  = ['sedentary','light','moderate','active','very_active'];

  vm.initials = function () {
    var name = vm.user.name || '';
    return name.split(' ').map(function (n) { return n[0]; }).join('').toUpperCase().slice(0, 2) || 'U';
  };

  vm.bmiCategory = function (bmi) {
    if (!bmi) return '';
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25)   return 'Normal weight';
    if (bmi < 30)   return 'Overweight';
    return 'Obese';
  };

  vm.saveProfile = function () {
    vm.savingProfile = true;
    AuthService.updateProfile({
      name: vm.profileForm.name,
      profile: {
        age:           vm.profileForm.age,
        gender:        vm.profileForm.gender,
        weight:        vm.profileForm.weight,
        height:        vm.profileForm.height,
        fitnessGoal:   vm.profileForm.fitnessGoal,
        activityLevel: vm.profileForm.activityLevel
      }
    })
    .then(function () {
      vm.savingProfile = false;
      vm.profileSaved  = true;
      vm.user = AuthService.getUser() || {};
      setTimeout(function () { $scope.$apply(function () { vm.profileSaved = false; }); }, 3000);
    })
    .catch(function () { vm.savingProfile = false; });
  };

  vm.changePassword = function () {
    vm.pwError = '';
    if (vm.passwordForm.newPassword !== vm.passwordForm.confirmPassword) {
      vm.pwError = 'Passwords do not match.'; return;
    }
    vm.savingPw = true;
    AuthService.changePassword({
      currentPassword: vm.passwordForm.currentPassword,
      newPassword:     vm.passwordForm.newPassword
    })
    .then(function () {
      vm.savingPw = false; vm.pwSaved = true;
      vm.passwordForm = { currentPassword:'', newPassword:'', confirmPassword:'' };
      setTimeout(function () { $scope.$apply(function () { vm.pwSaved = false; }); }, 3000);
    })
    .catch(function (err) {
      vm.pwError  = (err.data && err.data.message) || 'Failed to update password.';
      vm.savingPw = false;
    });
  };

  vm.logout = function () {
    AuthService.logout();
    window.location.href = '#!/login';
  };
}]);
