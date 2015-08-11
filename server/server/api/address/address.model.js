'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var AddressSchema = new Schema({
  easypost_id: String,
  name: String,
  company: String,
  street1: String,
  street2: String
});

module.exports = mongoose.model('Address', AddressSchema);
