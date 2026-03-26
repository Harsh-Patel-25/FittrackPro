/**
 * AuthService – AngularJS Service
 * Syllabus Topics:
 *   - What is service, Built-in services ($http)
 *   - Creating Custom Services
 *   - Injecting Dependencies in Services
 */
app.service('AuthService', ['$http', '$window', '$q', function ($http, $window, $q) {

  var API = '/api/auth';
  var self = this;

  // ── Token Helpers ──────────────────────────────────────────────────────────
  self.getToken = function () {
    return $window.localStorage.getItem('fittrack_token');
  };

  self.setToken = function (token) {
    $window.localStorage.setItem('fittrack_token', token);
  };

  self.removeToken = function () {
    $window.localStorage.removeItem('fittrack_token');
    $window.localStorage.removeItem('fittrack_user');
  };

  self.isAuthenticated = function () {
    return !!self.getToken();
  };

  // ── User Storage ───────────────────────────────────────────────────────────
  self.getUser = function () {
    try {
      var stored = $window.localStorage.getItem('fittrack_user');
      return stored ? JSON.parse(stored) : null;
    } catch (e) { return null; }
  };

  self.setUser = function (user) {
    $window.localStorage.setItem('fittrack_user', JSON.stringify(user));
  };

  // ── Register ───────────────────────────────────────────────────────────────
  self.register = function (data) {
    return $http.post(API + '/register', data).then(function (res) {
      self.setToken(res.data.token);
      self.setUser(res.data.user);
      return res.data;
    });
  };

  // ── Login ──────────────────────────────────────────────────────────────────
  self.login = function (credentials) {
    return $http.post(API + '/login', credentials).then(function (res) {
      self.setToken(res.data.token);
      self.setUser(res.data.user);
      return res.data;
    });
  };

  // ── Logout ─────────────────────────────────────────────────────────────────
  self.logout = function () {
    self.removeToken();
  };

  // ── Update Profile ─────────────────────────────────────────────────────────
  self.updateProfile = function (data) {
    return $http.put(API + '/profile', data).then(function (res) {
      self.setUser(res.data.user);
      return res.data;
    });
  };

  // ── Change Password ────────────────────────────────────────────────────────
  self.changePassword = function (data) {
    return $http.put(API + '/change-password', data);
  };

  // ── Refresh current user ───────────────────────────────────────────────────
  self.refreshUser = function () {
    return $http.get(API + '/me').then(function (res) {
      self.setUser(res.data.user);
      return res.data.user;
    });
  };
}]);
