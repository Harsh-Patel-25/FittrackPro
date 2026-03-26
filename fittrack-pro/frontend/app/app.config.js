/**
 * FitTrack Pro – Route Configuration
 * Syllabus Topic: Introduction to SPA, use of routing to make SPA, AngularJS Animation
 */
// Register the JWT interceptor
app.config(['$httpProvider', function ($httpProvider) {
  $httpProvider.interceptors.push('AuthInterceptor');
}]);

app.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
  // Use "!" prefix so URLs look like #!/login — fixes AngularJS 1.6+ default hashPrefix issue
  $locationProvider.hashPrefix('!');

  $routeProvider

    // ── Auth Routes ─────────────────────────────────────────────────────────
    .when('/login', {
      templateUrl: 'views/auth/login.html',
      controller: 'AuthController',
      controllerAs: 'auth',
      resolve: {
        redirectIfAuth: ['$location', 'AuthService', function ($location, AuthService) {
          if (AuthService.isAuthenticated()) $location.path('/dashboard');
        }]
      }
    })
    .when('/register', {
      templateUrl: 'views/auth/register.html',
      controller: 'AuthController',
      controllerAs: 'auth',
      resolve: {
        redirectIfAuth: ['$location', 'AuthService', function ($location, AuthService) {
          if (AuthService.isAuthenticated()) $location.path('/dashboard');
        }]
      }
    })

    // ── App Routes (protected) ───────────────────────────────────────────────
    .when('/dashboard', {
      templateUrl: 'views/dashboard/dashboard.html',
      controller: 'DashboardController',
      controllerAs: 'dash',
      resolve: {
        auth: authRequired
      }
    })
    .when('/workouts', {
      templateUrl: 'views/workouts/workouts.html',
      controller: 'WorkoutController',
      controllerAs: 'wk',
      resolve: {
        auth: authRequired
      }
    })
    .when('/nutrition', {
      templateUrl: 'views/nutrition/nutrition.html',
      controller: 'NutritionController',
      controllerAs: 'nt',
      resolve: {
        auth: authRequired
      }
    })
    .when('/progress', {
      templateUrl: 'views/progress/progress.html',
      controller: 'ProgressController',
      controllerAs: 'pg',
      resolve: {
        auth: authRequired
      }
    })
    .when('/settings', {
      templateUrl: 'views/settings/settings.html',
      controller: 'SettingsController',
      controllerAs: 'st',
      resolve: {
        auth: authRequired
      }
    })

    .otherwise({ redirectTo: '/dashboard' });

  // Auth guard resolve function (syllabus: Passing parameters to method)
  function authRequired($location, AuthService) {
    if (!AuthService.isAuthenticated()) {
      $location.path('/login');
    }
  }
  authRequired.$inject = ['$location', 'AuthService'];
}]);

/**
 * Run block – redirect on app start based on auth state
 * Syllabus: $scope object, Adding behavior to $scope
 */
app.run(['$rootScope', '$location', 'AuthService', function ($rootScope, $location, AuthService) {
  $rootScope.$on('$routeChangeStart', function (event, next, current) {
    var isAuthRoute = next.templateUrl &&
      (next.templateUrl.indexOf('login') > -1 || next.templateUrl.indexOf('register') > -1);

    if (!AuthService.isAuthenticated() && !isAuthRoute) {
      $location.path('/login');
    }
  });
}]);
