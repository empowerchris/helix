'use strict';

function capitalize(s) {
  return s.toLowerCase().replace(/\b./g, function (a) {
    return a.toUpperCase();
  });
}

angular.module('helix.services', [])
  .factory('utils', function ($moment) {
    return {
      formattedAddressFromEasypostObject: function (easypost) {
        var res = '';

        if (easypost.street1) {
          res = res + easypost.street1 + ', ';
        }

        if (easypost.street2) {
          res = res + easypost.street2 + ', ';
        }

        if (easypost.city) {
          res = res + easypost.city + ', ';
        }

        if (easypost.state) {
          res = res + easypost.state + ' ';
        }

        if (easypost.zip) {
          res = res + easypost.zip;
        }

        return capitalize(res);
      },
      formatHour: function (n) {
        if (n < 12) {
          return n + ' AM';
        }
        if (n == 12) {
          return '12 PM';
        }
        if (n == 24) {
          return '12 AM';
        } else {
          return n - 12 + ' PM';
        }
      },
      addWeekdays: function (date, days) {
        date = $moment(date);
        while (days > 0) {
          date = date.add(1, 'days');
          if (date.isoWeekday() !== 7) {
            days -= 1;
          }
        }
        return date;
      },
      subtractDeliveryDays: function (date, days) {
        date = $moment(date);
        while (days > 0) {
          date = date.subtract(1, 'days');
          if (date.isoWeekday() !== 7) {
            days -= 1;
          }
        }
        return date;
      }
    }
  });
