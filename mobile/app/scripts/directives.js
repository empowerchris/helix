angular.module('helix.directives', [])

  .directive('focusMe', function($timeout) {
    return {
      link: function(scope, element, attrs) {
        $timeout(function() {
          element[0].focus();
        }, 500);
      }
    };
  })

  .directive('headerShrink', function($document) {
    return {
      restrict: 'A',
      link: function($scope, $element, $attr) {
        var resizeFactor, scrollFactor, blurFactor;
        var header = $document[0].body.querySelector('.map');

        $scope.$on('contentScroll.scroll', function(event,scrollView) {
          if (scrollView.__scrollTop >= 0) {
            scrollFactor = scrollView.__scrollTop/2;
            header.style[ionic.CSS.TRANSFORM] = 'translate3d(0, +' + scrollFactor + 'px, 0)';
          } else {
            // shrink(header, $element[0], 0, headerHeight);
            resizeFactor = -scrollView.__scrollTop/100 + 0.99;
            blurFactor = -scrollView.__scrollTop/10;
            header.style[ionic.CSS.TRANSFORM] = 'scale('+resizeFactor+','+resizeFactor+')';
            header.style.webkitFilter = 'blur('+blurFactor+'px)';
          }
        });
      }
    }
  });
