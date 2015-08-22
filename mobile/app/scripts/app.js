'use strict';

angular.module('helix', [
  'ionic',
  'helix.controllers',
  'helix.services',
  'helix.directives',
  'ngCordova',
  'ngStorage',
  'ngResource',
  'uiGmapgoogle-maps',
  'mp.datePicker',
  'angular-momentjs',
  'angular.filter',
  'credit-cards',
  'angular-stripe'
])
  .constant('Api', {
    endpoint: 'http://localhost:9000' //'https://gethelix.herokuapp.com'
  })

  .constant('STRIPE_KEY', 'pk_test_tBLnCyjvGT1AcTBr7seToAAi')

  .config(function ($stateProvider, $urlRouterProvider, $httpProvider, STRIPE_KEY, stripeProvider) {
    $stateProvider

      .state('login', {
        url: '/login',
        controller: 'LoginCtrl',
        templateUrl: 'templates/login.html'
      })

      .state('signup', {
        url: '/signup',
        controller: 'SignupCtrl',
        templateUrl: 'templates/signup.html'
      })

      .state('tab', {
        url: '/tab',
        abstract: true,
        controller: 'TabsCtrl',
        templateUrl: 'templates/tabs.html'
      })

      .state('tab.new', {
        url: '/new',
        views: {
          'tab-new': {
            templateUrl: 'templates/tab-new.html',
            controller: 'NewCtrl'
          }
        }
      })

      .state('tab.new-shipping', {
        url: '/new/shipping',
        views: {
          'tab-new': {
            templateUrl: 'templates/tab-new-shipping.html',
            controller: 'NewShippingCtrl'
          }
        }
      })

      .state('tab.new-estimate', {
        url: '/new/estimate',
        views: {
          'tab-new': {
            templateUrl: 'templates/tab-new-estimate.html',
            controller: 'NewEstimateCtrl'
          }
        }
      })

      .state('tab.new-done', {
        url: '/new/done',
        views: {
          'tab-new': {
            templateUrl: 'templates/tab-new-done.html',
            controller: 'NewDoneCtrl'
          }
        }
      })

      .state('tab.trips', {
        url: '/trips',
        views: {
          'tab-trips': {
            templateUrl: 'templates/tab-trips.html',
            controller: 'TripsCtrl'
          }
        }
      })

      .state('tab.trip-detail', {
        url: '/trips/:id',
        views: {
          'tab-trips': {
            templateUrl: 'templates/tab-trips-detail.html',
            controller: 'TripsDetailCtrl'
          }
        }
      })

      .state('tab.account', {
        url: '/account',
        views: {
          'tab-account': {
            templateUrl: 'templates/tab-account.html',
            controller: 'AccountCtrl'
          }
        }
      })

      .state('tab.account-settings', {
        url: '/account/settings',
        views: {
          'tab-account': {
            templateUrl: 'templates/tab-account-settings.html',
            controller: 'AccountSettingsCtrl'
          }
        }
      })

      .state('tab.account-payment', {
        url: '/account/payment',
        views: {
          'tab-account': {
            templateUrl: 'templates/tab-account-payment.html',
            controller: 'AccountPaymentCtrl'
          }
        }
      })

      .state('tab.account-connected', {
        url: '/account/connected',
        views: {
          'tab-account': {
            templateUrl: 'templates/tab-account-connected.html',
            controller: 'AccountConnectedCtrl'
          }
        }
      })

      .state('tab.account-faq', {
        url: '/account/faq',
        views: {
          'tab-account': {
            templateUrl: 'templates/tab-account-faq.html'
          }
        }
      })

      .state('tab.account-terms', {
        url: '/account/terms',
        views: {
          'tab-account': {
            templateUrl: 'templates/tab-account-terms.html'
          }
        }
      })

      .state('tab.account-privacy', {
        url: '/account/privacy',
        views: {
          'tab-account': {
            templateUrl: 'templates/tab-account-privacy.html'
          }
        }
      });

    //$urlRouterProvider.otherwise('/tab/new');
    $urlRouterProvider.otherwise( function($injector, $location) {
      var $state = $injector.get('$state');
      var Auth = $injector.get('Auth');

      Auth.isLoggedInAsync(function (isLoggedIn) {
        if (!isLoggedIn) {
          $state.go('login');
        } else {
          $state.go('tab.new');
        }
      });
    });

    stripeProvider.setPublishableKey(STRIPE_KEY);
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

      // Intercept 401s and redirect you to login
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

  .run(function ($ionicPlatform, $rootScope, $location, Auth, $cordovaSplashscreen) {
    $ionicPlatform.ready(function () {
      /*setTimeout(function() {
        $cordovaSplashscreen.hide()
      }, 2000);*/

      if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);
      }

      if (window.StatusBar) {
        StatusBar.overlaysWebView(true);
      }
    });

    $rootScope.$on('$stateChangeStart', function (event, next) {
      Auth.isLoggedInAsync(function (loggedIn) {
        if (next.authenticate && !loggedIn) {
          $location.path('/login');
        }
      });
    });
  });

(function () {
  var moment;
  moment = (typeof require !== "undefined" && require !== null) &&
  !require.amd ? require("moment") : this.moment;

  moment.fn.isBusinessDay = function() {
    return !(this.day() === 0 || this.day() === 6);
  };

  moment.fn.businessDiff = function(param) {
    param = moment(param);
    var signal = param.unix() < this.unix()?1:-1;
    var start = moment.min(param, this).clone();
    var end = moment.max(param, this).clone();
    var start_offset = start.day() - 7;
    var end_offset = end.day();

    var end_sunday = end.clone().subtract('d', end_offset);
    var start_sunday = start.clone().subtract('d', start_offset);
    var weeks = end_sunday.diff(start_sunday, 'days') / 7;

    start_offset = Math.abs(start_offset);
    if (start_offset == 7) {
      start_offset = 5;
    } else if (start_offset == 1) {
      start_offset = 0;
    } else {
      start_offset -= 2;
    };

    if (end_offset == 6) {
      end_offset--;
    };

    return signal * (weeks * 5 + start_offset + end_offset);
  };

  moment.fn.businessAdd = function(days) {
    var signal = days < 0 ? -1 : 1;
    days = Math.abs(days);
    var d = this.clone().add(Math.floor(days / 5) * 7 * signal, 'd');
    var remaining = days % 5;
    while (remaining) {
      d.add(signal, 'd');
      if (d.isBusinessDay()) {
        remaining--;
      };
    };
    return d;
  };

  moment.fn.businessSubtract = function(days) {
    return this.businessAdd(-days);
  };


  moment.fn.nextBusinessDay = function() {
    var loop = 1;
    var limit = 7;
    while (loop < limit) {
      if (this.add(1, 'd').isBusinessDay()) {
        break;
      };
      loop++;
    };
    return this;
  };

  moment.fn.monthBusinessDays = function() {
    var me = this.clone();
    var day = me.clone().startOf('month');
    var end = me.clone().endOf('month');
    var daysArr = [];
    var done = false;
    while (!done) {
      if (day.isBusinessDay()) {
        daysArr.push(day.clone());
      };
      if(end.diff(day.add(1,'d')) < 0) {
        done = true;
      };
    };
    return daysArr;
  };

  moment.fn.monthNaturalDays = function(fromToday) {
    var me = this.clone();
    var day = fromToday ? me.clone() : me.clone().startOf('month');
    var end = me.clone().endOf('month');
    var daysArr = [];
    var done = false;
    while (!done) {
      daysArr.push(day.clone());
      if(end.diff(day.add(1,'d')) < 0) {
        done = true;
      };
    };
    return daysArr;
  };

  moment.fn.monthBusinessWeeks = function(fromToday) {
    var me = this.clone();
    var day = fromToday ? me.clone() : me.clone().startOf('month');
    var end = me.clone().endOf('month');
    var weeksArr = [];
    var daysArr = [];
    var done = false;

    while(!done) {
      if(day.day() >= 1 && day.day() < 6) {
        daysArr.push(day.clone());
      };
      if(day.day() === 5) {
        weeksArr.push(daysArr);
        daysArr = [];
      };
      if(end.diff(day.add(1,'d')) < 0) {
        if(daysArr.length < 5) {
          weeksArr.push(daysArr);
        };
        done = true;
      };
    };
    return weeksArr;
  };

  moment.fn.monthNaturalWeeks = function(fromToday) {
    var me = this.clone();
    var day = fromToday ? me.clone() : me.clone().startOf('month');
    var end = me.clone().endOf('month');
    var weeksArr = [];
    var daysArr = [];
    var done = false;

    while(!done) {
      daysArr.push(day.clone());
      if(day.day() === 6) {
        weeksArr.push(daysArr);
        daysArr = [];
      };
      if(end.diff(day.add(1,'d')) < 0) {
        if(daysArr.length < 7) {
          weeksArr.push(daysArr);
        };
        done = true;
      };
    };
    return weeksArr;
  };
}).call(this);
