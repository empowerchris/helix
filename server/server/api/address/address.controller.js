'use strict';

var _ = require('lodash');
var config = require('../../config/environment');
var easypost = require('node-easypost')(config.easypost.apiKey);

var Address = require('./address.model');

exports.verify = function (req, res) {
  var address = {
    name: req.user.name,
    company: req.body.name,
    street1: req.body.address_1,
    street2: req.body.address_2,
    city: req.body.city,
    state: req.body.state,
    zip: req.body.postcode,
    phone: req.body.phone,
    email: req.user.email,
    residential: true
  };

  easypost.Address.create(address, function (err, easypostAddress) {
    console.log(easypostAddress);

    easypostAddress.verify(function (err, response) {
      if (err) {
        console.log('Address is invalid.', err);
        return res.status(400).json(err.message);
      } else if (response.message !== undefined && response.message !== null) {
        console.log('Address is valid but has an issue: ', response.message);
        var verifiedAddress = response.address;
      } else {
        var verifiedAddress = response;
      }

      // Save to user's history
      Address.create({
        owner: req.user,
        easypost: verifiedAddress
      }, function (err, address) {
        if (err) {
          return handleError(res, err);
        }
        return res.status(201).json(address);
      });
    });
  });
};

exports.index = function (req, res) {
  Address
    .find({owner: req.user})
    .sort('-updatedAt')
    .limit(10)
    .exec(function (err, addresses) {
      if (err) return handleError(res, err);

      return res.status(200).json(addresses);
    });
};

/*


 // Get list of addresss


 // Get a single address
 exports.show = function(req, res) {
 Address.findById(req.params.id, function (err, address) {
 if(err) { return handleError(res, err); }
 if(!address) { return res.status(404).send('Not Found'); }
 return res.json(address);
 });
 };

 // Creates a new address in the DB.
 exports.create = function(req, res) {
 Address.create(req.body, function(err, address) {
 if(err) { return handleError(res, err); }
 return res.status(201).json(address);
 });
 };

 // Updates an existing address in the DB.
 exports.update = function(req, res) {
 if(req.body._id) { delete req.body._id; }
 Address.findById(req.params.id, function (err, address) {
 if (err) { return handleError(res, err); }
 if(!address) { return res.status(404).send('Not Found'); }
 var updated = _.merge(address, req.body);
 updated.save(function (err) {
 if (err) { return handleError(res, err); }
 return res.status(200).json(address);
 });
 });
 };

 // Deletes a address from the DB.
 exports.destroy = function(req, res) {
 Address.findById(req.params.id, function (err, address) {
 if(err) { return handleError(res, err); }
 if(!address) { return res.status(404).send('Not Found'); }
 address.remove(function(err) {
 if(err) { return handleError(res, err); }
 return res.status(204).send('No Content');
 });
 });
 };*/

function handleError(res, err) {
  console.error(err);
  return res.status(500).send(err);
}
