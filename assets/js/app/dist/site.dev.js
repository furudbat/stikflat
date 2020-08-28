"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/*global localStorage, console, $, CodeMirrorSpellChecker, CodeMirror, setTimeout, document, Mustache, html_beautify, js_beautify, css_beautify */
(function () {
  'use strict'; /// https://stackoverflow.com/questions/13639464/javascript-equivalent-to-pythons-format

  String.prototype.format = function () {
    var args = arguments;
    var unkeyed_index = 0;
    return this.replace(/\{(\w*)\}/g, function (match, key) {
      if (key === '') {
        key = unkeyed_index;
        unkeyed_index++;
      }

      if (key == +key) {
        return args[key] !== 'undefined' ? args[key] : match;
      } else {
        for (var i = 0; i < args.length; i++) {
          if (_typeof(args[i]) === 'object' && typeof args[i][key] !== 'undefined') {
            return args[i][key];
          }
        }

        return match;
      }
    });
  }; /// https://stackoverflow.com/questions/19491336/how-to-get-url-parameter-using-jquery-or-plain-javascript


  var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
      sParameterName = sURLVariables[i].split('=');

      if (sParameterName[0] === sParam) {
        return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
      }
    }
  };

  var isOnScreen = function isOnScreen(element) {
    var factor_width = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1.0;
    var factor_height = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1.0;
    var win = $(window);
    var viewport = {
      top: win.scrollTop(),
      left: win.scrollLeft()
    };
    viewport.right = viewport.left + win.width();
    viewport.bottom = viewport.top + win.height();
    var bounds = $(element).offset();
    bounds.right = bounds.left + $(element).outerWidth() * factor_width;
    bounds.bottom = bounds.top + $(element).outerHeight() * factor_height; //console.debug('isOnScreen', viewport, bounds);
    //console.debug('isOnScreen', bounds.left >= viewport.left, bounds.top >= viewport.top, bounds.right <= viewport.right, bounds.bottom <= viewport.bottom);

    return !(bounds.left >= viewport.left && bounds.top >= viewport.top && bounds.right <= viewport.right && bounds.bottom <= viewport.bottom);
  };

  var countlines = function countlines(str) {
    return str !== null && str !== "" ? str.split(/\r\n|\r|\n/).length : 0;
  }; /// https://css-tricks.com/snippets/javascript/bind-different-events-to-click-and-double-click/


  var makeDoubleClick = function makeDoubleClick(element, doDoubleClickAction, doClickAction) {
    var timer = 0;
    var delay = 250;
    var prevent = false;
    element.on('click', function (e) {
      var that = this;
      timer = setTimeout(function () {
        if (!prevent) {
          doClickAction(that);
        }

        prevent = false;
      }, delay);
    }).on('dblclick', function (e) {
      clearTimeout(timer);
      prevent = true;
      doDoubleClickAction(this);
    });
  };
})();