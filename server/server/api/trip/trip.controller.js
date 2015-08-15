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
        variability: 2
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
            spent = spent + rate.rate;
            console.log('Spent', spent);
            console.log(shipment.tracking_code);
            console.log(shipment.postage_label.label_url);

            callback(null);
          });
        });
      }, function done(err) {
        if (err) return callback(err);

        //callback(null, tripData, bags);
      });
    }, function (trip, shipmentCosts, callback) {
      stripe.charges.create({
        amount: shipmentCosts * 100,
        currency: "usd",
        customer: req.user.stripe.customerId,
        source: cardToken,
        description: "Helix Trip " + trip._id,
        receipt_email: req.user.email,
        statement_descriptor: "Helix Trip #" + trip._id
      }, function (err, charge) {
        if (err) return callback(err);

        console.log(charge);
      });
    }, function (tripData, bagsWithParcels, callback) {
      easypost.Batch.create({}, function (err, response) {
        if (err) return callback(err);

        callback(null, tripData, bagsWithParcels, response);
      });
    }, function (tripData, bagsWithParcels, batch, callback) {
      //console.log('-----------------------SHIPMENTS--------------------------');
      var shipments = [];

      async.forEachOf(bagsWithParcels, function iterator(bag, index, callback) {
        easypost.Shipment.create({
          to_address: tripData.dropoff.location.easypost.address,
          from_address: tripData.pickup.location.easypost.address,
          parcel: bag.parcel,
          date_advance: '20',
          delivery_confirmation: 'SIGNATURE'
        }, function (err, shipment) {
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
      //console.log('-----------------------BATCH--------------------------');
      /*var shipments = [];

       for (var i = 0; i < bagsWithShipments.length; i++){
       shipments.push(bagsWithShipments[i].shipment);
       }*/

      batch.addShipments({
        shipments: shipments
      }, function (err, newBatch) {
        if (err) return callback(err);

        callback(null, tripData, shipments, newBatch);
      });
    }, function (tripData, shipments, batch, callback) {
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

      /*if (bags.length > 1) {
       return callback(new Error('We currently only support one piece of luggage at a time.'));
       }*/

      callback(null, tripData, bags);
    }, function (tripData, bags, callback) {
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
      easypost.Batch.create({}, function (err, response) {
        if (err) return callback(err);

        callback(null, tripData, bagsWithParcels, response);
      });
    }, function (tripData, bagsWithParcels, batch, callback) {
      //console.log('-----------------------SHIPMENTS--------------------------');
      var shipments = [];

      async.forEachOf(bagsWithParcels, function iterator(bag, index, callback) {
        easypost.Shipment.create({
          to_address: tripData.dropoff.location.easypost.address,
          from_address: tripData.pickup.location.easypost.address,
          parcel: bag.parcel,
          date_advance: '20',
          delivery_confirmation: 'SIGNATURE'
        }, function (err, shipment) {
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
      //console.log('-----------------------BATCH--------------------------');
      /*var shipments = [];

       for (var i = 0; i < bagsWithShipments.length; i++){
       shipments.push(bagsWithShipments[i].shipment);
       }*/

      batch.addShipments({
        shipments: shipments
      }, function (err, newBatch) {
        if (err) return callback(err);

        callback(null, tripData, shipments, newBatch);
      });
    }, function (tripData, shipments, batch, callback) {
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
 // Pickup
 // TODO: check if earliest and latest work
 console.log('-----------------------PICKUP--------------------------');

 easypost.Pickup.create({
 address: tripData.pickup.location.easypost.address,
 batch: batch,
 min_datetime: tripData.pickup.date.hours(tripData.pickup.time.earliest).utc().format(),
 max_datetime: tripData.pickup.date.hours(tripData.pickup.time.latest).utc().format()
 }, function(err, pickup) {
 if (err) return callback(err);

 console.log(pickup);
 });
 */

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
