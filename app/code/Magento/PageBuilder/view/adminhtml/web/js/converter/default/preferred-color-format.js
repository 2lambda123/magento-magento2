/*eslint-disable */
define(["tinycolor"], function (_tinycolor) {
  /**
   * Copyright © Magento, Inc. All rights reserved.
   * See COPYING.txt for license details.
   */
  var PreferredColorFormat =
  /*#__PURE__*/
  function () {
    function PreferredColorFormat() {}

    var _proto = PreferredColorFormat.prototype;

    /**
     * Process data after it's read and converted by element converters
     *
     * @param {object} data
     * @param {object} config
     * @returns {object}
     */
    _proto.fromDom = function fromDom(data, config) {
      if (data.background_color_format === null) {
        data.background_color_format = "hex";
      }

      data.background_color = (0, _tinycolor)(data.background_color).toString(data.background_color_format);
      return data;
    };
    /**
     * Process data before it's converted by element converters
     *
     * @param {object} data
     * @param {object} config
     * @returns {object}
     */


    _proto.toDom = function toDom(data, config) {
      data.background_color_format = (0, _tinycolor)(data.background_color).getFormat();
      return data;
    };

    return PreferredColorFormat;
  }();

  return PreferredColorFormat;
});
//# sourceMappingURL=preferred-color-format.js.map
