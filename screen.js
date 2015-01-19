define(['lib/datetime-arrays', 'require', './admin'], function (dta, require) {
  'use strict';
  var plugin = require('./admin'),
      scheduler = plugin.config.scheduler,
      getUtcDate = function (dateArray, time) {
        var hours, mins, secs, ret, timeOk = dta.time.isValid(time);
        if (!dta.dateArray.isValid(dateArray)) {
          return null;
        }
        hours = timeOk && time[0] || 0;
        mins = timeOk && time[1] || 0;
        secs = timeOk && time[2] || 0;
        ret = Date.UTC(dateArray[0], dateArray[1] - 1, dateArray[2], hours, mins, secs);
        return ret;
      },
      pad = function (v) {
        return v < 10 ? '0' + v : v;
      },
      getDuration = function (ms) {
        var totalseconds = Math.floor(ms / 1000);
        var seconds = totalseconds % 60;
        var minutes = Math.floor((totalseconds % 3600) / 60);
        var hours = Math.floor((totalseconds % 86400) / 3600);
        var days = Math.floor(totalseconds / 86400);
        return days + ':' + pad(hours) + ':' + pad(minutes) + ':' + pad(seconds);
      },
      getTimeLeft = function (data) {
        var parsedTime, parsedDate, now, then;
        if (!data.parsedTarget) {
          if (!data.targetDate) {
            return 'Invalid Target Date';
          }
          parsedDate = dta.dateArray.fromString(data.targetDate);
          parsedTime = data.targetTime ? dta.time.fromString(data.targetTime) : [0, 0, 0];
          data.parsedTarget = getUtcDate(parsedDate, parsedTime);
          if (!data.parsedTarget) {
            return 'Invalid Target Date';
          }
        }
        then = data.parsedTarget;
        now = (new Date()).getTime();
        //console.log(then, now, then - now);
        if (now >= then) {
          return 'none';
        }
        return getDuration(then - now);
      },
      updateTimeLeft = function ($scr, str) {
        var a;
        if (str !== 'none') {
          a = Array.prototype.slice.call(str);
          $scr.find('.time-left').html('<span>' + a.join('</span><span>') + '</span>');
        } else {
          $scr.find('.time-left,.static-text').hide();
        }
      },
      localScreen = function () {
        var self = this,
            viewData;
        if (!window.dta) {
          window.dta = dta;
        }
        return {
          getViewData: function () {
            var timeLeft = getTimeLeft(self.props.data),
                eventName = self.props.data.eventName;
            viewData = {eventName: eventName, timeLeft: Array.prototype.slice.call(timeLeft), notElapsed: timeLeft !== 'none'};
            return viewData;
          },
          preShow: function () {
            var newTimeLeft = getTimeLeft(self.props.data);
            updateTimeLeft(self.$screen, newTimeLeft);
            self.maximizeTextSize();
          },
          postShow: function () {
            var timer;
            if (!self.animating) {
              self.animating = true;
              timer = setInterval(function () {
                var newTimeLeft;
                if (!self.$screen || !self.$screen.is(':visible')) {
                  self.animating = false;
                  clearInterval(timer);
                  return;
                }
                newTimeLeft = getTimeLeft(self.props.data);
                updateTimeLeft(self.$screen, newTimeLeft);
              }, 1000);
            }
          },
          shouldBeShown: function () {
            var daters = self.props.data,
                now = (new Date()).getTime();

            return scheduler.isActive(daters, now);
          }
        };
      };

  localScreen.config = plugin.config;
  return localScreen;
});