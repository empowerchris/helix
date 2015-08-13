'use strict';

var _ = require('lodash');
var Trip = require('./trip.model');
var config = require('../../config/environment');
var easypost = require('node-easypost')(config.easypost.apiKey);
var async = require('async');
var moment = require('moment');

/*
 // Get list of trips
 exports.index = function(req, res) {
 Trip.find(function (err, trips) {
 if(err) { return handleError(res, err); }
 return res.status(200).json(trips);
 });
 };

 // Get a single trip
 exports.show = function(req, res) {
 Trip.findById(req.params.id, function (err, trip) {
 if(err) { return handleError(res, err); }
 if(!trip) { return res.status(404).send('Not Found'); }
 return res.json(trip);
 });
 };
 */

/*


 */
// Creates a new trip in the DB.
exports.create = function (req, res) {
  var tripData = req.body;

  async.waterfall([
    function (callback) {
      // Validation
      tripData.pickup.date = moment(tripData.pickup.date);

      if (!tripData.pickup.date.isValid()) {
        return callback(new Error('Invalid pickup date.'));
      }

      if (!tripData.pickup || !tripData.pickup.location || !tripData.pickup.location.easypost
        || !tripData.pickup.location.easypost.address || !tripData.pickup.location.easypost.address.id) {
        return callback(new Error('Invalid pickup address.'));
      }

      if (!tripData.dropoff || !tripData.dropoff.location || !tripData.dropoff.location.easypost
        || !tripData.dropoff.location.easypost.address || !tripData.dropoff.location.easypost.address.id) {
        return callback(new Error('Invalid drop-off address.'));
      }

      var bags = [];

      for (var i = 0; i < tripData.bags.length; i++) {
        for (var j = 0; j < tripData.bags[i].amount; j++) {
          bags.push({
            name: tripData.bags[i].name,
            dimensions: tripData.bags[i].dimensions
          });
        }
      }

      if (bags.length < 1) {
        return callback(new Error('No bags selected.'));
      }

      callback(null, tripData, bags);
    }, function (tripData, bags, callback) {
      // Parcels

      async.forEachOf(bags, function iterator(bag, index, callback) {
        var parcelData = bag.dimensions;

        parcelData.weight = parcelData.weight * 16; // pounds to ounzes

        easypost.Parcel.create(parcelData, function (err, response) {
          if (err) return callback(err);

          bags[index].parcel = response;

          callback(null)
        });
      }, function done(err) {
        if (err) return handleError(res, err);

        callback(null, tripData, bags);
      });
    }, function (tripData, bagsWithParcels, callback) {
      // Create Batch

      easypost.Batch.create({}, function (err, response) {
        if (err) return callback(err);

        callback(null, tripData, bagsWithParcels, response);
      });
    }, function (tripData, bagsWithParcels, batch, callback) {
      // Create Shipments

      async.forEachOf(bagsWithParcels, function iterator(bag, index, callback) {
        easypost.Shipment.create({
          to_address: tripData.dropoff.location.easypost.address,
          from_address: tripData.pickup.location.easypost.address,
          parcel: bag.parcel
        }, function(err, shipment) {
          if (err) return callback(err);

          console.log(shipment);
          bagsWithParcels[index].shipment = shipment;

          callback(null);
        });
      }, function done(err) {
        if (err) return handleError(res, err);

        //callback();
      });

    }
  ], function (err) {
    if (err) return handleError(res, err);

    console.log('all good');

    return res.status(200).send();
  });

  /*Trip.create(req.body, function(err, trip) {
   if(err) { return handleError(res, err); }
   return res.status(201).json(trip);
   });*/
};
/*
 // Updates an existing trip in the DB.
 exports.update = function(req, res) {
 if(req.body._id) { delete req.body._id; }
 Trip.findById(req.params.id, function (err, trip) {
 if (err) { return handleError(res, err); }
 if(!trip) { return res.status(404).send('Not Found'); }
 var updated = _.merge(trip, req.body);
 updated.save(function (err) {
 if (err) { return handleError(res, err); }
 return res.status(200).json(trip);
 });
 });
 };

 // Deletes a trip from the DB.
 exports.destroy = function(req, res) {
 Trip.findById(req.params.id, function (err, trip) {
 if(err) { return handleError(res, err); }
 if(!trip) { return res.status(404).send('Not Found'); }
 trip.remove(function(err) {
 if(err) { return handleError(res, err); }
 return res.status(204).send('No Content');
 });
 });
 };
 */

function handleError(res, err) {
  console.log(err);
  return res.status(500).json(err.message);
}
