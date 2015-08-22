"use strict";

angular.module('helix.directives', [])

  .directive('focusMe', function ($timeout, $parse) {
    return {
      link: function (scope, element, attrs) {
        var model = $parse(attrs.focusMe);
        scope.$watch(model, function (value) {
          if (value === true) {
            $timeout(function () {
              element[0].focus();
            });
          }
        });
        element.bind('blur', function () {
          scope.$apply(model.assign(scope, false));
        });
      }
    };
  })

  .filter('utc', function(){
    return function(val){
      var date = new Date(val);
      return new Date(date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        date.getUTCHours(),
        date.getUTCMinutes(),
        date.getUTCSeconds());
    };
  })

  .filter('capitalize', function() {
    return function(input, all) {
      return (!!input) ? input.replace(/([^\W_]+[^\s-]*) */g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();}) : '';
    }
  })

  .filter('trustAsResourceUrl', function($sce) {
    return function(val) {
      return $sce.trustAsResourceUrl(val);
    };
  });
