/*global localStorage, console, $, CodeMirrorSpellChecker, CodeMirror, setTimeout, document, Mustache, html_beautify, js_beautify, css_beautify, jsyaml */

/*global site, makeDoubleClick */
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SavedConfigs = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var SAVED_CONFIG_SELECTED_BUTTON_CLASS = 'btn-primary';
var SAVED_CONFIG_NOT_SELECTED_BUTTON_CLASS = 'btn-outline-secondary';
var SAVED_CONFIG_BUTTON_CLASS = 'saved-content-content';

var SavedConfigs =
/*#__PURE__*/
function () {
  function SavedConfigs() {
    _classCallCheck(this, SavedConfigs);

    var that = this;

    this.overrideConfig = function (configButton) {
      var index = $(configButton).data('index');

      if (index === null || index === '') {
        console.error('overrideConfig', 'index is empty');
        return;
      } //console.debug('overrideConfig', {index, configButton});


      _currentConfigIndex = parseInt(index);
      var savedConfig = getCurrentSavedConfigJson();

      if (savedConfig !== null) {
        setConfigJson(savedConfig.json);
        _configJsonStr = savedConfig.jsonstr;
        _configYamlStr = savedConfig.yamlstr;
        initEditors();
        generateHTML();
      } else {
        _currentConfigIndex = null;
      }

      that.updateSaveConfigControls();
      that.updateSavedConfigsSelection(_currentConfigIndex);
    };

    this.previewWithConfig = function (configButton) {
      var index = $(configButton).data('index');

      if (index === null || index === '') {
        console.error('previewWithConfig', 'index is empty');
        return;
      } //console.debug('previewWithConfig', {index, configButton});


      _currentConfigIndex = parseInt(index);
      var savedConfig = getCurrentSavedConfigJson();

      if (savedConfig !== null) {
        var template = getTemplateCode();
        var css = getCssCode();
        generateHTMLFromTemplate(template, savedConfig.json, css, true);
        selectPreviewTab();
      }
    };
  }

  _createClass(SavedConfigs, [{
    key: "generateButtonFromConfig",
    value: function generateButtonFromConfig(config) {
      var index = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
      var cssclass = 'mr-1 mt-1 mb-2 btn ' + SAVED_CONFIG_BUTTON_CLASS + ' ' + SAVED_CONFIG_NOT_SELECTED_BUTTON_CLASS;
      var name = site.data.strings.content.content_default_prefix + (index !== '' ? ' ' + (index + 1) : '');

      if (config) {
        if ('title' in config && config.title !== '') {
          name = config.title;
        } else if ('name' in config && config.name !== '') {
          name = config.name;
        }
      }

      return $('<button type="button" class="' + cssclass + '" data-index="' + index + '">' + name + '</button>');
    }
  }, {
    key: "addSavedConfigToList",
    value: function addSavedConfigToList(config, index) {
      if (config === null || index === null) {
        console.error('addSavedConfigToList', 'config or index are null', {
          config: config,
          index: index
        });
        return;
      }

      var configButton = this.generateButtonFromConfig(config, index);
      $('.saved-content-list').append(configButton);
      makeDoubleClick($('.' + SAVED_CONFIG_BUTTON_CLASS + "[data-index='" + index + "']"), this.overrideConfig, this.previewWithConfig); //console.debug('addSavedConfigToList', index, config, configButton, $('.saved-content-list').find('.' + SAVED_CONFIG_BUTTON_CLASS).last());

      this.updateSaveConfigControls();
    }
  }, {
    key: "generateSavedConfigsFromList",
    value: function generateSavedConfigsFromList() {
      if (_savedConfigs.length > 0) {
        $('.saved-content-list').empty();

        for (var i = 0; i < _savedConfigs.length; i++) {
          var config = _savedConfigs[i].json; //console.debug(i, config);

          this.addSavedConfigToList(config, i);
        }

        $('.saved-content-container').show();
      } else {
        $('.saved-content-list').empty();
        $('.saved-content-container').hide();
      }

      this.updateSavedConfigsSelection(_currentConfigIndex);
    }
  }, {
    key: "updateSaveConfigControls",
    value: function updateSaveConfigControls() {
      if (_currentConfigIndex !== null && _currentConfigIndex < _savedConfigs.length) {
        $('#btnSaveConfig').show();
      } else {
        $('#btnSaveConfig').hide();
      }

      if ($('#configError').is(":visible")) {
        $('.main-config-controls').each(function () {
          $(this).prop('disabled', true);
        });
      } else {
        $('.main-config-controls').each(function () {
          $(this).prop('disabled', false);
        });
      }
    }
  }, {
    key: "updateSavedConfigsSelection",
    value: function updateSavedConfigsSelection(index) {
      if (_savedConfigs.length > 0) {
        $('.saved-content-container').show();
      } else {
        $('.saved-content-container').hide();
      }

      $('.' + SAVED_CONFIG_BUTTON_CLASS).each(function (i) {
        $(this).removeClass(SAVED_CONFIG_SELECTED_BUTTON_CLASS).removeClass(SAVED_CONFIG_NOT_SELECTED_BUTTON_CLASS);

        if ($(this).data('index') == index) {
          $(this).addClass(SAVED_CONFIG_SELECTED_BUTTON_CLASS);
        } else {
          $(this).addClass(SAVED_CONFIG_NOT_SELECTED_BUTTON_CLASS);
        }
      });
    }
  }, {
    key: "initSaveConfigControls",
    value: function initSaveConfigControls() {
      var savedConfigs = $('.' + SAVED_CONFIG_BUTTON_CLASS);
      var that = this;

      if (savedConfigs && savedConfigs.length) {
        savedConfigs.each(function () {
          makeDoubleClick($(this), that.overrideConfig, that.previewWithConfig);
        });
      }

      $('#btnAddConfig').click(function () {
        addConfig(getConfigJson(), that._configJsonStr, that._configYamlStr); //console.debug('btnAddConfig', {_currentConfigIndex});

        var savedConfig = getCurrentSavedConfigJson();

        if (savedConfig !== null) {
          that.addSavedConfigToList(savedConfig.json, _currentConfigIndex);
        }

        that.updateSavedConfigsSelection(_currentConfigIndex);
      });
      $('#btnSaveConfig').click(function () {
        saveConfig(_currentConfigIndex, getConfigJson(), _configJsonStr, _configYamlStr);
        var savedConfig = getCurrentSavedConfigJson();

        if (savedConfig !== null) {
          var savedConfigBtn = $('.' + SAVED_CONFIG_BUTTON_CLASS + "[data-index='" + _currentConfigIndex + "']");

          if (savedConfigBtn) {
            var configButton = this.generateButtonFromConfig(savedConfig.json, _currentConfigIndex);
            savedConfigBtn.replaceWith(configButton);
            makeDoubleClick($('.' + SAVED_CONFIG_BUTTON_CLASS + "[data-index='" + _currentConfigIndex + "']"), that.overrideConfig, that.previewWithConfig);
          }
        }

        that.updateSavedConfigsSelection(_currentConfigIndex);
      });
      this.updateSaveConfigControls();
    }
  }]);

  return SavedConfigs;
}();

exports.SavedConfigs = SavedConfigs;