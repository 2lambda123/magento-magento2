/*eslint-disable */
define(["Magento_PageBuilder/js/loader", "Magento_PageBuilder/js/config", "Magento_PageBuilder/js/component/block/data-converter-pool"], function (_loader, _config, _dataConverterPool) {
  /**
   * Copyright © Magento, Inc. All rights reserved.
   * See COPYING.txt for license details.
   */

  /**
   * Create a new instance of converter pool
   */
  function create(contentType) {
    var config = _config.getContentTypeConfig(contentType);

    var converters = [];

    var _arr = Object.keys(config.appearances);

    for (var _i = 0; _i < _arr.length; _i++) {
      var appearanceName = _arr[_i];
      var dataMapping = config.appearances[appearanceName].data_mapping;

      if (undefined !== dataMapping && undefined !== dataMapping.converters) {
        for (var _iterator = dataMapping.converters, _isArray = Array.isArray(_iterator), _i2 = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
          var _ref;

          if (_isArray) {
            if (_i2 >= _iterator.length) break;
            _ref = _iterator[_i2++];
          } else {
            _i2 = _iterator.next();
            if (_i2.done) break;
            _ref = _i2.value;
          }

          var _converterConfig = _ref;

          if (!!_converterConfig.component && !_dataConverterPool.get(_converterConfig.component)) {
            converters.push(_converterConfig.component);
          }
        }
      }
    }

    return new Promise(function (resolve) {
      (0, _loader)(converters, function () {
        for (var _len = arguments.length, loadedConverters = new Array(_len), _key = 0; _key < _len; _key++) {
          loadedConverters[_key] = arguments[_key];
        }

        for (var i = 0; i < converters.length; i++) {
          _dataConverterPool.register(converters[i], new loadedConverters[i]());
        }

        resolve(_dataConverterPool);
      });
    });
  }

  return create;
});
//# sourceMappingURL=data-converter-pool-factory.js.map
