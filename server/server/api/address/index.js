'use strict';

var express = require('express');
var controller = require('./address.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

/*
router.get('/:id', controller.show);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);*/

router.get('/', auth.isAuthenticated(), controller.index);

router.post('/verify', auth.isAuthenticated(), controller.verify);

module.exports = router;
