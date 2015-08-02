"use strict";

angular.module('helix', ['ionic', 'helix.controllers', 'helix.services', 'helix.directives'])

  .run(function ($ionicPlatform, $rootScope) {
    $ionicPlatform.ready(function () {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);
      }

      StatusBar.overlaysWebView(true);

      $rootScope.$on('blueStatusBar', function () {
        if (window.StatusBar) {
          StatusBar.styleLightContent();
          StatusBar.backgroundColorByHexString("#27316D");
        }
      });

      $rootScope.$on('defaultStatusBar', function () {
        if (window.StatusBar) {
          StatusBar.styleDefault();
        }
      });
    });
  })

  .config(function ($stateProvider, $urlRouterProvider) {

    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider

      // setup an abstract state for the tabs directive
      .state('tab', {
        url: '/tab',
        abstract: true,
        templateUrl: 'templates/tabs.html'
      })

      // Each tab has its own nav history stack:
      .state('tab.new', {
        url: '/new',
        views: {
          'tab-new': {
            templateUrl: 'templates/tab-new.html',
            controller: 'NewCtrl'
          }
        }
      })

      .state('tab.new-places', {
        url: '/new/places',
        views: {
          'tab-new': {
            templateUrl: 'templates/tab-new-places.html',
            controller: 'NewPlacesCtrl'
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
      });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/tab/new');

  });
