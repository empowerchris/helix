'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var timestamps = require('mongoose-timestamp');

var TripSchema = new Schema({
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  batch: {},
  tripData: {},
  spent: Number,
  pickup: {},
  estimate: {},
  shipments: [{}],
  rates: {},
  tripStatus: {
    type: String,
    default: 'created'
  }
});

TripSchema.plugin(timestamps);

module.exports = mongoose.model('Trip', TripSchema);
