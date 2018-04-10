/*eslint-disable */
define([], function () {
  /**
   * Copyright © Magento, Inc. All rights reserved.
   * See COPYING.txt for license details.
   */
  var BorderStyleDefault =
  /*#__PURE__*/
  function () {
    function BorderStyleDefault() {}

    var _proto = BorderStyleDefault.prototype;

    /**
     * Convert value to internal format
     *
     * @param value string
     * @returns {string | object}
     */
    _proto.fromDom = function fromDom(value) {
      if (!value) {
        return "_default";
      }

      return value;
    };
    /**
     * Convert value to knockout format
     *
     * @param {string} name
     * @param {DataObject} data
     * @returns {string}
     */


    _proto.toDom = function toDom(name, data) {
      if (data[name]) {
        return data[name].toString();
      }
    };

    return BorderStyleDefault;
  }();

  return BorderStyleDefault;
});
//# sourceMappingURL=border-style-default.js.map
