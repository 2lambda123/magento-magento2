/*eslint-disable */
define(["uiEvents", "Magento_PageBuilder/js/content-type/preview", "Magento_PageBuilder/js/content-type/uploader"], function (_uiEvents, _preview, _uploader) {
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

  var Preview =
  /*#__PURE__*/
  function (_BasePreview) {
    _inheritsLoose(Preview, _BasePreview);

    function Preview() {
      var _temp, _this;

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return (_temp = _this = _BasePreview.call.apply(_BasePreview, [this].concat(args)) || this, _this.uploader = void 0, _temp) || _this;
    }

    var _proto = Preview.prototype;

    /**
     * Get registry callback reference to uploader UI component
     *
     * @returns {Uploader}
     */
    _proto.getUploader = function getUploader() {
      return this.uploader;
    };
    /**
     * @inheritDoc
     */


    _proto.bindEvents = function bindEvents() {
      var _this2 = this;

      _BasePreview.prototype.bindEvents.call(this);

      _uiEvents.on(this.parent.id + ":updated", function () {
        var imageDataStore = _this2.parent.dataStore.get();

        var imageObject = imageDataStore[_this2.config.additional_data.uploaderConfig.dataScope][0] || {};

        _uiEvents.trigger("image:assigned:" + _this2.parent.id, imageObject);
      });

      _uiEvents.on(this.config.name + ":block:ready", function () {
        var imageDataStore = _this2.parent.dataStore.get();

        var initialImageValue = imageDataStore[_this2.config.additional_data.uploaderConfig.dataScope] || ""; // Create uploader

        _this2.uploader = new _uploader(_this2.parent.id, "imageuploader_" + _this2.parent.id, Object.assign({}, _this2.config.additional_data.uploaderConfig, {
          value: initialImageValue
        })); // Register listener when image gets uploaded from uploader UI component

        _this2.uploader.onUploaded(_this2.onImageUploaded.bind(_this2));
      });
    };
    /**
     * Update image data inside data store
     *
     * @param {Array} data - list of each files' data
     */


    _proto.onImageUploaded = function onImageUploaded(data) {
      this.parent.dataStore.update(data, this.config.additional_data.uploaderConfig.dataScope);
    };

    return Preview;
  }(_preview);

  return Preview;
});
//# sourceMappingURL=preview.js.map
