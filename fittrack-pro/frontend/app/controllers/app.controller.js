/**
 * AppController – Root controller attached to ng-app
 * Syllabus: Multiple Controllers and their scope, Nested controllers and scope inherited,
 *           $scope object, Adding behavior to $scope object
 */
app.controller('AppController', ['$scope', '$location', '$window', 'AuthService',
function ($scope, $location, $window, AuthService) {

  var vm = $scope.app = this;

  // ── Nav Items (ngFor equivalent: ng-repeat) ────────────────────────────────
  vm.navItems = [
    { path: 'dashboard', label: 'Dashboard', icon: '📊' },
    { path: 'workouts',  label: 'Workouts',  icon: '🏋️'  },
    { path: 'nutrition', label: 'Nutrition', icon: '🥗'  },
    { path: 'progress',  label: 'Progress',  icon: '📈'  },
    { path: 'settings',  label: 'Settings',  icon: '⚙️'  }
  ];

  vm.sidebarCollapsed = false;
  vm.userMenuOpen     = false;

  // ── Current User (from localStorage) ──────────────────────────────────────
  vm.currentUser = AuthService.getUser() || {};

  // ── Toast Notification ────────────────────────────────────────────────────
  vm.toast = { visible: false, message: '', type: 'success' };

  vm.showToast = function (message, type) {
    vm.toast = { visible: true, message: message, type: type || 'success' };
    setTimeout(function () {
      $scope.$apply(function () { vm.toast.visible = false; });
    }, 3000);
  };

  // ── Auth helpers ──────────────────────────────────────────────────────────
  vm.isAuthenticated = function () {
    return AuthService.isAuthenticated();
  };

  vm.logout = function () {
    AuthService.logout();
    vm.userMenuOpen = false;
    vm.currentUser  = {};
    $location.path('/login');
  };

  // ── Initials from name ─────────────────────────────────────────────────────
  vm.userInitials = function () {
    var name = vm.currentUser.name || '';
    return name.split(' ').map(function (n) { return n[0]; }).join('').toUpperCase().slice(0, 2) || 'U';
  };

  // ── Active route check ────────────────────────────────────────────────────
  vm.isActiveRoute = function (path) {
    return $location.path().indexOf(path) === 1;
  };

  // ── Page title from route ──────────────────────────────────────────────────
  vm.currentPageTitle = function () {
    var path  = $location.path().replace('/', '');
    var found = vm.navItems.filter(function (n) { return n.path === path; })[0];
    return found ? found.label : 'Dashboard';
  };

  // ── Refresh user on route change ─────────────────────────────────────────
  $scope.$on('$routeChangeSuccess', function () {
    vm.userMenuOpen = false;
    vm.currentUser  = AuthService.getUser() || {};
  });

  // ── Broadcast toast from child controllers ────────────────────────────────
  $scope.$on('showToast', function (event, msg, type) {
    vm.showToast(msg, type);
  });
}]);
