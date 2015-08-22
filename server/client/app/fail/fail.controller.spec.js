'use strict';

describe('Controller: FailCtrl', function () {

  // load the controller's module
  beforeEach(module('helixApp'));

  var FailCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    FailCtrl = $controller('FailCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
