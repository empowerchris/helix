'use strict';

var _ = require('lodash');
var Trip = require('./trip.model');
var config = require('../../config/environment');
var easypost = require('node-easypost')(config.easypost.apiKey);
var stripe = require('stripe')(config.stripe.apiKey);
var async = require('async');
//var moment = require('moment');
var moment = require('moment-business-days');
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
  service: 'postmark',
  auth: {
    user: '1bc360c6-1253-4f96-9de1-ccf64b9cfaa6',
    pass: '1bc360c6-1253-4f96-9de1-ccf64b9cfaa6'
  }
});

var concur = require('concur-platform');

var postmark = require('postmark');
var client = new postmark.Client('1bc360c6-1253-4f96-9de1-ccf64b9cfaa6');

var serialize = require('node-serialize');

// Get list of trips
exports.index = function (req, res) {
  Trip.find({
      owner: req.user,
      tripStatus: 'pickup-bought'
    },
    function (err, trips) {
      if (err) {
        return handleError(res, err);
      }
      return res.status(200).json(trips);
    });
};

function subtractDeliveryDays(date, days) {
  date = moment(date);
  while (days > 0) {
    date = date.subtract(1, 'days');
    if (date.isoWeekday() !== 7) {
      days -= 1;
    }
  }
  return date;
}

// Get a single trip
exports.show = function (req, res) {
  Trip.findOne({
    owner: req.user,
    _id: req.params.id
  }, function (err, trip) {
    if (err) {
      return handleError(res, err);
    }
    if (!trip) {
      return res.status(404).send('Not Found');
    }
    return res.json(trip);
  });
};


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

    var callTag = 7.5;

    var subtotal = shipmentCosts + estimatedPickupCost + callTag;

    var helixFee = subtotal * 0.03;

    var taxes = (subtotal + helixFee) * 0.07;

    var stripeFee = ((subtotal + helixFee + taxes) * 0.029) + 0.29;

    var estimate = subtotal + helixFee + taxes + stripeFee;

    trip.estimate = {
      estimate: estimate,
      variability: 5
    };

    trip.rates = req.body.shipments;
    trip.tripStatus = 'date-selected';

    trip.save(function (err, trip) {
      if (err) return handleError(res, err);

      return res.json(trip.estimate);
    });
  });
};

// Creates a new trip in the DB.
exports.pay = function (req, res) {
  var cardId = req.body.cardId;
  var report = req.body.report;

  console.log(req.body);

  async.waterfall([
    function (callback) {
      // Verify ownership and calculate shipment costs
      Trip.findById(req.params.id, function (err, trip) {
        if (err) return callback(err, trip);
        if (!trip) return res.status(404).send('Not Found');
        if (!trip.owner.equals(req.user._id)) return res.send(401);

        console.log('Processing payment for trip ' + trip._id + ' for user ' + req.user.email);

        callback(null, trip);
      });
    }, function (trip, callback) {
      var spent = 0;
      var shipments = [];
      var rates = [];

      for (var shipment in trip.rates) {
        rates.push(trip.rates[shipment]);
      }

      async.forEachOf(rates, function iterator(rate, index, callback) {
        var rateId = rate.id;
        var shipmentId = rate.shipment_id;

        console.log('Buying Rate ' + rateId + ' for shipment ' + shipmentId + ' for trip ' + trip._id);

        easypost.Shipment.retrieve(shipmentId, function (err, shipment) {
          if (err) return callback(err, trip);

          var rateToBuy = null;

          for (var i = 0; i < shipment.rates.length; i++) {
            if (shipment.rates[i].id === rateId) {
              rateToBuy = shipment.rates[i];
            }
          }

          if (!rateToBuy) return callback(new Error('Shipment rate not found.'));

          shipment.buy({rate: rateToBuy}, function (err, shipment) {
            if (err) return callback(err, trip);

            console.log(shipment);
            shipments.push(shipment);
            spent = spent + parseFloat(rate.rate);
            console.log('Spent so far ', spent);

            callback(null);
          });
        });
      }, function done(err) {
        if (err) return callback(err, trip);

        trip.shipments = shipments;
        trip.tripStatus = 'shipments-bought';
        trip.save(function (err, trip) {
          if (err) return callback(err, trip);
          callback(null, trip, spent);
        });
      });
    }, function (trip, spent, callback) {
      console.log('Updating batch for trip ' + trip._id);

      easypost.Batch.retrieve(trip.batch.id, function (err, batch) {
        if (err) return callback(err, trip);

        console.log(batch);

        trip.spent = spent;
        trip.batch = batch;
        trip.tripStatus = 'batch-updated';

        trip.save(function (err, trip) {
          if (err) return callback(err, trip);
          callback(null, trip, batch, spent);
        });
      });
    }, function (trip, batch, spent, callback) {
      //console.log('Requesting scan form for batch ' + batch.id + ' for trip ' + trip._id);

      /*batch.createScanForm(function (err, upatedBatch) {
       if (err) return callback(err);

       trip.batch = upatedBatch;
       trip.tripStatus = 'scanform-requested';

       trip.save(function (err) {
       if (err) return callback(err);
       callback(null, trip, batch, spent);
       });
       });*/

      // Scan forms not available for Fedex
      callback(null, trip, batch, spent);
    }, function (trip, batch, spent, callback) {
      console.log('Creating pickup for batch ' + batch.id + ' for trip ' + trip._id);

      var address = trip.tripData.pickup.location.easypost.address;
      if (!address) return callback('No pickup address specified');

      var delivery_date = moment(trip.tripData.travel.arrival);
      var advance = trip.tripData.pickup.advance;
      //var pickup_date = delivery_date.subtract(advance, 'days');
      var pickup_date = subtractDeliveryDays(delivery_date, advance);


      var options = {
        address: address,
        batch: {
          id: batch.id
        },
        reference: 'Trip id ' + trip._id,
        instructions: 'Pickup scheduled through Helix. Expected ' + batch.num_shipments + ' pieces of luggage.',
        min_datetime: pickup_date.hours(trip.tripData.pickup.time.earliest).format('YYYY-MM-DD HH:mm:ss'),
        max_datetime: pickup_date.hours(trip.tripData.pickup.time.latest).format('YYYY-MM-DD HH:mm:ss')
      };

      easypost.Pickup.create(options, function (err, pickup) {
        if (err) return callback(err, trip);

        console.log(pickup);

        trip.pickup = pickup;
        trip.tripStatus = 'pickup-created';

        trip.save(function (err, trip) {
          if (err) return callback(err, trip);
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
        if (err) return callback(err, trip);

        console.log('Pickup ' + pickup.id + ' bought for trip ' + trip._id);

        console.log(pickup);

        spent += parseFloat(pickup.pickup_rates[lowestIndex].rate);

        trip.spent = spent;
        trip.pickup = pickup;
        trip.cardId = cardId;
        trip.tripStatus = 'pickup-bought';

        trip.save(function (err) {
          if (err) return callback(err, trip);
          callback(null, trip, batch, pickup, spent);
        });
      });
    }, function (trip, batch, pickup, spent, callback) {
      if (!report || !report.type) return callback(null, trip, batch, pickup, spent);
      if (!req.user.concur || req.user.concur.accessToken) return callback(null, trip, batch, pickup, spent);

      console.log('Expense reporting for trip ' + trip._id);

      var callTag = 7.5;
      var subtotal = spent + callTag;
      var helixFee = subtotal * 0.03;
      var taxes = (subtotal + helixFee) * 0.07;
      var stripeFee = ((subtotal + helixFee + taxes) * 0.029) + 0.29;
      var estimate = subtotal + helixFee + taxes + stripeFee;

      if (report.type === -1) {
        concur.quickexpenses.send({
          oauthToken: req.user.concur.accessToken,
          loginId: req.user.concur.profile.EmailAddress,
          contentType: 'application/json',
          body: {
            'CurrencyCode': 'USD',
            'TransactionAmount': estimate,
            'TransactionDate': moment().format("YYYY-MM-DD"),
            'VendorDescription': 'Helix',
            'Comment': 'Helix trip #' + trip._id
          }
        }).then(function (data) {
          console.log(data);
          callback(null, trip, batch, pickup, spent);
        }).fail(function (error) {
          console.error(error);
          return callback(new Error('Error processing expense report.'), trip);
        });
      } else if (report.type === -2 || report.type === -3) {
        concur.entries.send({
          oauthToken: req.user.concur.accessToken,
          contentType: 'application/json',
          loginId: req.user.concur.profile.EmailAddress,
          body: {
            'Comment': 'Helix trip #' + trip._id,
            'CrnCode': 'USD',
            'Description': 'Helix trip #' + trip._id,
            'ExpKey': 'SHIPG',
            'TransactionAmount': estimate,
            'VendorDescription': 'Helix',
            'TransactionDate': moment().format("YYYY-MM-DD"),
            'reportId': report.id
          }
        }).then(function (data) {
          console.log(data);
          callback(null, trip, batch, pickup, spent);
        }).fail(function (error) {
          console.error(error);
          return callback(new Error('Error processing expense report.'), trip);
        });
      }

    }, function (trip, batch, pickup, spent, callback) {
      console.log('Sending notification email for trip ' + trip._id);

      client.sendEmail({
        'From': 'notifications@gethelix.com',
        'To': 'luckybeitia@gmail.com',
        'Subject': 'Trip ' + trip._id,
        'TextBody': trip
      });

      client.sendEmail({
        'From': 'notifications@gethelix.com',
        'To': 'Payments@GetHelix.com',
        'Subject': 'Trip ' + trip._id,
        'TextBody': trip
      });

      var labels = '';

      for (var i = 0; i < trip.shipments.length; i++) {
        labels += trip.shipments[i].postage_label.label_url + ' \n'
      }

      client.sendEmail({
        'From': 'notifications@gethelix.com',
        'To': req.user.email,
        'Subject': 'Trip ' + trip._id,
        'TextBody': 'Thank you for using Helix. Please print the following shipping labels and attach them to your luggage: ' + labels
      });

      callback(null, trip);
    }
  ], function (err, trip) {
    if (err) {
      console.log('Error processing payment.');
      if (trip && trip.shipments.length) {
        console.log('Refunding bought shipments.');

        async.forEachOf(trip.shipments, function iterator(shipment, index, callback) {
          easypost.Shipment.retrieve(shipment.id, function (err, shipment) {
            if (err) return callback(err);

            shipment.refund({}, function (err, shipment) {
              if (err) return callback(err);

              console.log(shipment.refund_status);

              callback(null);
            });
          });
        }, function (err) {
          if (err) console.error(err.message);
        });
      }

      if (trip && trip.pickup && trip.pickup.id) {
        console.log('Cancelling pickup.');

        easypost.Pickup.retrieve(trip.pickup.id, function (err, pickup) {
          if (err) return console.error(err.message);

          pickup.cancel({}, function (err, pickup) {
            if (err) return console.error(err.message);

            console.log(pickup);
          });
        });
      }

      return handleError(res, err);
    }

    client.sendEmail({
      'From': 'notifications@gethelix.com',
      'To': 'luckybeitia@gmail.com',
      'Subject': 'Trip Error',
      'TextBody': err + '\n' + trip
    });

    return res.status(201).json(trip);
  });
};

exports.create = function (req, res) {
  var tripData = req.body;

  console.log(tripData);

  async.waterfall([
    function (callback) {
      console.log('Validating trip data for user ' + req.user.email);

      /*tripData.pickup.date = moment(tripData.pickup.date);

       if (!tripData.pickup.date.isValid()) {
       return callback(new Error('Invalid pickup date.'));
       }*/

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

        parcelData.weight = (parcelData.weight).toFixed(2); // pounds to ounzes

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
        var delivery_date = moment(tripData.travel.arrival);
        var today = moment();
        var advance = tripData.pickup.advance;
        //var pickup_date = delivery_date.subtract(advance, 'days');
        //var pickup_date = delivery_date.businessSubtract(advance);
        var pickup_date = subtractDeliveryDays(delivery_date, advance);
        var days_until_pickup = pickup_date.diff(today, 'days');

        var options = {
          to_address: tripData.dropoff.location.easypost.address,
          from_address: tripData.pickup.location.easypost.address,
          parcel: bag.parcel,
          options: {
            delivery_confirmation: 'SIGNATURE',
            print_custom_1: 'Helix. Effortless Travel.',
            date_advance: days_until_pickup
          }
        };

        easypost.Shipment.create(options, function (err, shipment) {
          if (err) return callback(err);

          bagsWithParcels[index].shipment = shipment;

          shipments.push(shipment);
          console.log(shipment);

          if (shipment.messages.length) {
            var errors = '';

            for (var i = 0; i < shipment.messages.length; i++) {
              errors += shipment.messages[i].message + ' ';
            }

            console.log(errors);
            return callback(new Error(errors));
          }

          callback(null);
        });
      }, function done(err) {
        if (err) return handleError(res, err);

        callback(null, tripData, shipments, batch);
      });
    }, function (tripData, shipments, batch, callback) {
      console.log('Validating shipment rates for trip for user ' + req.user.email);

      var shipment_type = tripData.pickup.advance;
      var desired_shipment = false;

      if (shipment_type === 1) {
        desired_shipment = 'STANDARD_OVERNIGHT'
      } else if (shipment_type === 2) {
        desired_shipment = 'FEDEX_2_DAY'
      } else if (shipment_type === 3) {
        desired_shipment = 'FEDEX_EXPRESS_SAVER'
      }

      if (!desired_shipment) {
        return callback(new Error('Invalid pickup details.'));
      }

      var delivery_date = moment(tripData.travel.arrival);
      var advance = tripData.pickup.advance;
      var pickup_date = subtractDeliveryDays(delivery_date, advance);
      var natural_days = delivery_date.diff(pickup_date, 'days');

      console.log('Natural days (shipment delivery days)', natural_days);

      async.forEachOf(shipments, function iterator(shipment, index, callback) {
        var shipmentId = shipment.id;

        easypost.Shipment.retrieve(shipmentId, function (err, shipment) {
          if (err) return handleError(res, err);
          shipments[index] = shipment;
          callback(null);
        });
      }, function done(err) {
        if (err) return handleError(res, err);

        var rates = {};

        for (var i = 0; i < shipments.length; i++) {
          rates[shipments[i].id] = false;

          for (var j = 0; j < shipments[i].rates.length; j++) {
            if (shipments[i].rates[j].service === desired_shipment) {
              rates[shipments[i].id] = shipments[i].rates[j];
              break;
            }
          }
        }

        for (var shipment in rates) {
          console.log(rates, moment(rates[shipment].delivery_date).diff(delivery_date, 'days'));

          if (!rates[shipment] || moment(delivery_date).diff(rates[shipment].delivery_date, 'days') !== 0) {
            return callback(new Error('One or more bags could not be shipped with the dates specified. Please change the pickup details or luggage information and try again.'))
          }
        }

        callback(null, tripData, shipments, batch, rates);
      });
    }, function (tripData, shipments, batch, rates, callback) {
      console.log('Adding shipments to batch ' + batch.id + ' for trip for user ' + req.user.email);

      batch.addShipments({
        shipments: shipments
      }, function (err, newBatch) {
        if (err) return callback(err);

        callback(null, tripData, newBatch, rates);
      });
    }, function (tripData, batch, rates, callback) {
      console.log('Saving Trip object to DB for trip for user ' + req.user.email);

      Trip.create({
        owner: req.user,
        batch: batch,
        tripData: tripData,
        rates: rates
      }, function (err, trip) {
        if (err) return callback(err);

        callback(null, trip);
      });
    }, function (trip, callback) {
      console.log('Calculating estimate for trip ' + trip._id + ' for user ' + req.user.email);
      var shipmentCosts = 0;

      for (var shipment in trip.rates) {
        shipmentCosts += parseFloat(trip.rates[shipment].rate);
      }

      var estimatedPickupCost = 5;

      var callTag = 7.5;

      var subtotal = shipmentCosts + estimatedPickupCost + callTag;

      var helixFee = subtotal * 0.03;

      var taxes = (subtotal + helixFee) * 0.07;

      var stripeFee = ((subtotal + helixFee + taxes) * 0.029) + 0.29;

      trip.estimate = subtotal + helixFee + taxes + stripeFee;
      trip.tripStatus = 'estimated';

      trip.save(function (err, trip) {
        if (err) return handleError(res, err);
        return callback(null, trip);
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
  console.error(err);
  return res.status(500).json(err.message);
}
