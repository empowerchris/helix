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
  });
