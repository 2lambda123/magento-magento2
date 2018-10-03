/*eslint-disable */
function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

define(["jquery", "Magento_PageBuilder/js/events", "underscore", "Magento_PageBuilder/js/config", "Magento_PageBuilder/js/content-type/preview", "Magento_PageBuilder/js/content-type/wysiwyg/factory"], function (_jquery, _events, _underscore, _config, _preview, _factory) {
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

  /**
   * @api
   */
  var Preview =
  /*#__PURE__*/
  function (_BasePreview) {
    _inheritsLoose(Preview, _BasePreview);

    function Preview() {
      return _BasePreview.apply(this, arguments) || this;
    }

    var _proto = Preview.prototype;

    /**
     * Wysiwyg instance
     */

    /**
     * The element the text content type is bound to
     */

    /**
     * The textarea element in disabled mode
     */

    /**
     * @returns {Boolean}
     */
    _proto.isWysiwygSupported = function isWysiwygSupported() {
      return _config.getConfig("can_use_inline_editing_on_stage");
    };
    /**
     * @param {HTMLElement} element
     */


    _proto.initWysiwyg = function initWysiwyg(element) {
      var _this = this;

      this.element = element;
      element.innerHTML = this.data.main.html();
      element.id = this.parent.id + "-editor";
      var wysiwygConfig = this.config.additional_data.wysiwygConfig.wysiwygConfigData;
      wysiwygConfig.adapter.settings.auto_focus = this.parent.dropped ? element.id : null;
      (0, _factory)(this.parent.id, element.id, this.config.name, wysiwygConfig, this.parent.dataStore, "content").then(function (wysiwyg) {
        _this.wysiwyg = wysiwyg;
      });
    };
    /**
     * @param {HTMLTextAreaElement} element
     */


    _proto.initTextarea = function initTextarea(element) {
      var _this2 = this;

      this.textarea = element; // set initial value of textarea based on data store

      this.textarea.value = this.parent.dataStore.get("content");
      this.adjustTextareaHeightBasedOnScrollHeight(); // Update content in our stage preview textarea after its slideout counterpart gets updated

      _events.on("form:" + this.parent.id + ":saveAfter", function () {
        _this2.textarea.value = _this2.parent.dataStore.get("content");

        _this2.adjustTextareaHeightBasedOnScrollHeight();
      });
    };
    /**
     * Save current value of textarea in data store
     */


    _proto.onTextareaKeyUp = function onTextareaKeyUp() {
      this.adjustTextareaHeightBasedOnScrollHeight();
      this.parent.dataStore.update(this.textarea.value, "content");
    };
    /**
     * Start stage interaction on textarea blur
     */


    _proto.onTextareaFocus = function onTextareaFocus() {
      (0, _jquery)(this.textarea).closest(".pagebuilder-content-type").addClass("pagebuilder-toolbar-active");

      _events.trigger("stage:interactionStart");
    };
    /**
     * Stop stage interaction on textarea blur
     */


    _proto.onTextareaBlur = function onTextareaBlur() {
      (0, _jquery)(this.textarea).closest(".pagebuilder-content-type").removeClass("pagebuilder-toolbar-active");

      _events.trigger("stage:interactionStop");
    };
    /**
     * Retrieve the margin & padding styles for the placeholder
     *
     * @returns {any}
     */


    _proto.getPlaceholderStyle = function getPlaceholderStyle() {
      var keys = ["marginBottom", "marginLeft", "marginRight", "marginTop", "paddingBottom", "paddingLeft", "paddingRight", "paddingTop"];
      return _underscore.pick(this.data.main.style(), function (style, key) {
        return keys.indexOf(key) !== -1;
      });
    };
    /**
     * Adjust textarea's height based on scrollHeight
     */


    _proto.adjustTextareaHeightBasedOnScrollHeight = function adjustTextareaHeightBasedOnScrollHeight() {
      this.textarea.style.height = "";
      var scrollHeight = this.textarea.scrollHeight;
      var minHeight = parseInt((0, _jquery)(this.textarea).css("min-height"), 10);

      if (scrollHeight === minHeight) {
        // leave height at 'auto'
        return;
      }

      (0, _jquery)(this.textarea).height(scrollHeight);
    };

    return Preview;
  }(_preview);

  return _extends(Preview, {
    __esModule: true
  });
});
//# sourceMappingURL=preview.js.map
