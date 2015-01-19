define(['require', '../message/schedule'], function (require) {
  'use strict';
  var plugin = {},
      scheduler = require('../message/schedule');
  plugin.config = {
    name: 'countdown',
    humanName: 'Countdown Timer',
    centered: true,
    scheduler: scheduler
  };

  return plugin;
});