'use strict';

var express = require('express');
var controller = require('./trip.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

//router.get('/', auth.isAuthenticated(), controller.index);
//router.get('/:id', auth.isAuthenticated(), controller.show);
router.get('/:id/deliveryDates', auth.isAuthenticated(), controller.deliveryDates);
router.post('/', auth.isAuthenticated(), controller.create);
router.post('/:id/selectDate', auth.isAuthenticated(), controller.selectDate);
router.post('/:id/pay', auth.isAuthenticated(), controller.pay);
//router.put('/:id', auth.isAuthenticated(), controller.update);
//router.patch('/:id', auth.isAuthenticated(), controller.update);
//router.delete('/:id', auth.isAuthenticated(), controller.destroy);

module.exports = router;
