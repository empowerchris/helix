angular.module('helix', [
  'ionic',
  'ngCordova',
  'ngStorage',
  'helix.components',
  'helix.controllers',
  'helix.directives',
  'uiGmapgoogle-maps'
])

  .constant('Velocity', $.Velocity)

  .run(function ($ionicPlatform) {
    $ionicPlatform.ready(function () {
      if (window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);
      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }
    });
  })

  .config(function ($stateProvider, $urlRouterProvider, $httpProvider) {
    $stateProvider

      .state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'templates/menu.html',
        controller: 'AppCtrl'
      })

      .state('login', {
        url: '/login',
        abstract: true,
        templateUrl: 'templates/login.html',
        controller: 'LoginCtrl'
      })

      .state('app.newPickup', {
        url: '/pickup/new',
        views: {
          'menuContent': {
            templateUrl: 'templates/newPickup.html',
            controller: 'NewPickupCtrl'
          }
        }
      })

      .state('app.whereNext', {
        url: '/step1',
        views: {
          'menuContent': {
            templateUrl: 'templates/whereNext.html',
            controller: 'WhereNextCtrl'
          }
        }
      });

    $urlRouterProvider.otherwise('/app/step1');

    $httpProvider.interceptors.push('authInterceptor');
  })

  .factory('authInterceptor', function ($rootScope, $q, $localStorage, $location) {
    return {
      // Add authorization token to headers
      request: function (config) {
        config.headers = config.headers || {};
        if ($localStorage.token) {
          config.headers.Authorization = 'Bearer ' + $localStorage.token;
        }
        return config;
      },

      // Intercept 401s and redirect to login
      responseError: function (response) {
        if (response.status === 401) {
          $location.path('/login');
          // remove any stale tokens
          delete $localStorage.token;
          return $q.reject(response);
        }
        else {
          return $q.reject(response);
        }
      }
    };
  })

  .run(function ($rootScope, $location, Auth) {
    // Redirect to login if route requires auth and user is not logged in
    $rootScope.$on('$stateChangeStart', function (event, next) {
      Auth.isLoggedInAsync(function (loggedIn) {
        if (next.authenticate && !loggedIn) {
          event.preventDefault();
          $location.path('/login');
        }
      });
    });
  });
