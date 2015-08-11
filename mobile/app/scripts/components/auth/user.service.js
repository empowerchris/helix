'use strict';

angular.module('helix')
  .factory('User', function ($resource, Api) {
    return $resource(Api.endpoint + '/api/users/:id/:controller', {
      id: '@_id'
    }, {
      changePassword: {
        method: 'PUT',
        params: {
          controller:'password'
        }
      },
      get: {
        method: 'GET',
        params: {
          id:'me'
        }
      }
	  });
  });
