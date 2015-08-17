'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var timestamps = require('mongoose-timestamp');

var AddressSchema = new Schema({
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  easypost: {}
});

AddressSchema.plugin(timestamps);

module.exports = mongoose.model('Address', AddressSchema);
