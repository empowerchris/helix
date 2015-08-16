'use strict';

var _ = require('lodash');
var Trip = require('./trip.model');
var config = require('../../config/environment');
var easypost = require('node-easypost')(config.easypost.apiKey);
var stripe = require('stripe')(config.stripe.apiKey);
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

exports.deliveryDates = function (req, res) {
  Trip.findById(req.params.id, function (err, trip) {
    if (err) return handleError(res, err);
    if (!trip) return res.status(404).send('Not Found');
    if (!trip.owner.equals(req.user._id)) return res.send(401);

    console.log('Obtaining dates for trip ' + trip._id + ' for user ' + req.user.email);

    var shipments = [];

    async.forEachOf(trip.batch.shipments, function iterator(shipment, index, callback) {
      var shipmentId = shipment.id;

      easypost.Shipment.retrieve(shipmentId, function (err, shipment) {
        if (err) return handleError(res, err);

        shipments[index] = shipment;

        callback(null);
      });
    }, function done(err) {
      if (err) return handleError(res, err);

      var dates = {};

      for (var i = 0; i < shipments.length; i++) {
        for (var j = 0; j < shipments[i].rates.length; j++) {
          var rate = shipments[i].rates[j];

          var foo = {
            shipmentId: shipments[i].id,
            rate: rate
          };

          if (dates[rate.delivery_date] && dates[rate.delivery_date].length > 0) {
            dates[rate.delivery_date].push(foo);
          } else {
            dates[rate.delivery_date] = [foo];
          }
        }
      }

      var possibleDates = [];

      for (var date in dates) {
        if (dates.hasOwnProperty(date)) {
          if (dates[date].length === shipments.length) {
            possibleDates.push({
              date: date,
              shipments: dates[date]
            })
          }
        }
      }

      return res.json(possibleDates);
    });
  });
};

exports.selectDate = function (req, res) {
  Trip.findById(req.params.id, function (err, trip) {
    if (err) return handleError(res, err);
    if (!trip) return res.status(404).send('Not Found');
    if (!trip.owner.equals(req.user._id)) return res.send(401);

    console.log('Calculating estimate for trip ' + trip._id + ' for user ' + req.user.email);

    var shipmentCosts = 0;

    for (var i = 0; i < req.body.shipments.length; i++) {
      shipmentCosts = shipmentCosts + parseInt(req.body.shipments[i].rate.rate);
    }

    var estimatedPickupCost = 5;

    var helixFee = ((shipmentCosts * 0.8) + estimatedPickupCost) * 0.03;

    var callTag = 7.5;

    var subtotal = shipmentCosts + estimatedPickupCost + helixFee + callTag;

    var stripeFee = (subtotal * 0.029) + 0.29;

    var estimate = subtotal + stripeFee;

    trip.rates = req.body.shipments;
    trip.tripStatus = 'date-selected';

    trip.save(function (err) {
      if (err) return handleError(res, err);

      return res.json({
        estimate: estimate,
        variability: 5
      });
    });
  });
};

// Creates a new trip in the DB.
exports.pay = function (req, res) {
  var cardId = req.body.cardId;

  async.waterfall([
    function (callback) {
      // Verify ownership and calculate shipment costs
      Trip.findById(req.params.id, function (err, trip) {
        if (err) return callback(err);
        if (!trip) return res.status(404).send('Not Found');
        if (!trip.owner.equals(req.user._id)) return res.send(401);

        console.log('Processing payment for trip ' + trip._id + ' for user ' + req.user.email);

        var rates = [];
        for (var i = 0; i < trip.rates.length; i++) {
          rates.push(trip.rates[i].rate);
        }

        callback(null, trip, rates);
      });
    }, function (trip, rates, callback) {
      var spent = 0;
      async.forEachOf(rates, function iterator(rate, index, callback) {
        var rateId = rate.id;
        var shipmentId = rate.shipment_id;

        console.log('Buying Rate ' + rateId + ' for shipment ' + shipmentId + ' for trip ' + trip._id);

        easypost.Shipment.retrieve(shipmentId, function (err, shipment) {
          if (err) return callback(err);

          var rateToBuy = null;

          for (var i = 0; i < shipment.rates.length; i++) {
            if (shipment.rates[i].id === rateId) {
              rateToBuy = shipment.rates[i];
            }
          }

          if (!rateToBuy) return callback(new Error('Shipment rate not found.'));

          shipment.buy({rate: rateToBuy}, function (err, shipment) {
            if (err) return callback(err);

            console.log(shipment);
            spent = spent + parseFloat(rate.rate);
            console.log('Spent so far ', spent);

            callback(null);
          });
        });
      }, function done(err) {
        if (err) return callback(err);

        trip.tripStatus = 'shipments-bought';
        trip.save(function (err) {
          if (err) return callback(err);
          callback(null, trip, spent);
        });
      });
    }, function (trip, spent, callback) {
      console.log('Updating batch for trip ' + trip._id);

      easypost.Batch.retrieve(trip.batch.id, function (err, batch) {
        if (err) return callback(err);

        console.log(batch);

        trip.spent = spent;
        trip.batch = batch;
        trip.tripStatus = 'batch-updated';

        trip.save(function (err) {
          if (err) return callback(err);
          callback(null, trip, batch, spent);
        });
      });
    }, function (trip, batch, spent, callback) {
      console.log('Requesting scan form for batch ' + batch.id + ' for trip ' + trip._id);

      batch.createScanForm(function (err, upatedBatch) {
        if (err) return callback(err);

        trip.batch = upatedBatch;
        trip.tripStatus = 'scanform-requested';

        trip.save(function (err) {
          if (err) return callback(err);
          callback(null, trip, batch, spent);
        });
      });
    }, function (trip, batch, spent, callback) {
      console.log('Creating pickup for batch ' + batch.id + ' for trip ' + trip._id);

      var address = trip.tripData.pickup.location.easypost.address;
      if (!address) return callback('No pickup address specified');

      var options = {
        address: address,
        batch: {
          id: batch.id
        },
        reference: 'Trip id ' + trip._id,
        instructions: 'Pickup scheduled through Helix. Expected ' + batch.num_shipments + ' pieces of luggage.',
        min_datetime: moment(trip.tripData.pickup.date).hours(trip.tripData.pickup.time.earliest).format('YYYY-MM-DD HH:mm:ss'),
        max_datetime: moment(trip.tripData.pickup.date).hours(trip.tripData.pickup.time.latest).format('YYYY-MM-DD HH:mm:ss')
      };

      easypost.Pickup.create(options, function (err, pickup) {
        if (err) return callback(err);

        console.log(pickup);

        trip.pickup = pickup;
        trip.tripStatus = 'pickup-created';

        trip.save(function (err) {
          if (err) return callback(err);
          callback(null, trip, batch, pickup, spent);
        });
      });
    }, function (trip, batch, pickup, spent, callback) {
      console.log('Buying cheapest rate for pickup ' + pickup.id + ' for trip ' + trip._id);

      var lowestRate = 99999.99;
      var lowestIndex = -1;

      for (var i = 0; i < pickup.pickup_rates.length; i++) {
        var rate = parseFloat(pickup.pickup_rates[i].rate);
        if (rate < lowestRate) {
          lowestRate = rate;
          lowestIndex = i;
        }
      }

      if (lowestIndex === -1) callback(new Error('No available pickups.'));

      console.log(pickup.pickup_rates[lowestIndex]);

      pickup.buy({rate: pickup.pickup_rates[lowestIndex]}, function (err, pickup) {
        if (err) return callback(err);

        console.log(pickup);

        spent += pickup.pickup_rates[lowestIndex].rate

        trip.spent = spent;
        trip.pickup = pickup;
        trip.tripStatus = 'pickup-bought';

        trip.save(function (err) {
          if (err) return callback(err);
          callback(null, trip, batch, pickup, spent);
        });
      });
    }
  ], function (err, trip) {
    if (err) return handleError(res, err);

    return res.status(201).json(trip);
  });
};

exports.create = function (req, res) {
  var tripData = req.body;

  async.waterfall([
    function (callback) {
      console.log('Validating trip data for user ' + req.user.email);

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

      /*if (bags.length > 1) {
       return callback(new Error('We currently only support one piece of luggage at a time.'));
       }*/

      callback(null, tripData, bags);
    }, function (tripData, bags, callback) {
      console.log('Creating parcels for trip for user ' + req.user.email);

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
      console.log('Creating batch for trip for user ' + req.user.email);

      easypost.Batch.create({}, function (err, response) {
        if (err) return callback(err);

        callback(null, tripData, bagsWithParcels, response);
      });
    }, function (tripData, bagsWithParcels, batch, callback) {
      console.log('Creating shipments for batch ' + batch.id + ' for trip for user ' + req.user.email);

      var shipments = [];

      async.forEachOf(bagsWithParcels, function iterator(bag, index, callback) {
        var options = {
          to_address: tripData.dropoff.location.easypost.address,
          from_address: tripData.pickup.location.easypost.address,
          parcel: bag.parcel,
          options: {
            delivery_confirmation: 'SIGNATURE',
            print_custom_1: 'Helix. Effortless Travel',
            date_advance: moment(tripData.pickup.date).diff(moment(), 'days') + 1
          }
        };

        easypost.Shipment.create(options, function (err, shipment) {
          if (err) return callback(err);

          bagsWithParcels[index].shipment = shipment;

          shipments.push(shipment);
          console.log(shipment);

          callback(null);
        });
      }, function done(err) {
        if (err) return handleError(res, err);

        callback(null, tripData, shipments, batch);
      });
    }, function (tripData, shipments, batch, callback) {
      console.log('Adding shipments to batch ' + batch.id + ' for trip for user ' + req.user.email);

      batch.addShipments({
        shipments: shipments
      }, function (err, newBatch) {
        if (err) return callback(err);

        callback(null, tripData, shipments, newBatch);
      });
    }, function (tripData, shipments, batch, callback) {
      console.log('Saving Trip object to DB for trip for user ' + req.user.email);

      Trip.create({
        owner: req.user,
        batch: batch,
        tripData: tripData
      }, function (err, trip) {
        if (err) return callback(err);

        callback(null, trip);
      });
    }
  ], function (err, trip) {
    if (err) return handleError(res, err);

    return res.status(201).json(trip);
  });
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
