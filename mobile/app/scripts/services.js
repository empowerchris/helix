'use strict';

angular.module('helix.services', [])
  .factory('utils', function () {
    return {
      formattedAddressFromEasypostObject: function (easypost) {
        var res = '';

        if (easypost.street1)
          res = res + easypost.street1 + ', ';

        if (easypost.street2)
          res = res + easypost.street2 + ', ';

        if (easypost.city)
          res = res + easypost.city + ', ';

        if (easypost.state)
          res = res + easypost.state + ' ';

        if (easypost.zip)
          res = res + easypost.zip;

        return capitalize(res);
      }
    }
  });

function capitalize(s){
  return s.toLowerCase().replace( /\b./g, function(a){ return a.toUpperCase(); } );
};
