/**
 * HTTP Interceptor – Attaches JWT token to every request
 * Syllabus: Built-in services ($http), Injecting Dependencies in Services
 */
app.factory('AuthInterceptor', ['$window', '$q', '$injector', function ($window, $q, $injector) {
  return {
    // ── Request: attach Bearer token ────────────────────────────────────────
    request: function (config) {
      var token = $window.localStorage.getItem('fittrack_token');
      if (token) {
        config.headers = config.headers || {};
        config.headers['Authorization'] = 'Bearer ' + token;
      }
      return config;
    },

    // ── Response Error: handle 401 ───────────────────────────────────────────
    responseError: function (rejection) {
      if (rejection.status === 401) {
        $window.localStorage.removeItem('fittrack_token');
        $window.localStorage.removeItem('fittrack_user');
        var $location = $injector.get('$location');
        $location.path('/login');
      }
      return $q.reject(rejection);
    }
  };
}]);

// NOTE: AuthInterceptor is registered via $httpProvider in app.config.js
