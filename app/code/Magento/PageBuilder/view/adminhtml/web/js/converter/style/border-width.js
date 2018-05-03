/*eslint-disable */
define([], function () {
  /**
   * Copyright © Magento, Inc. All rights reserved.
   * See COPYING.txt for license details.
   */
  var BorderWidth =
  /*#__PURE__*/
  function () {
    function BorderWidth() {}

    var _proto = BorderWidth.prototype;

    /**
     * Convert value to internal format
     *
     * @param value string
     * @returns {string | object}
     */
    _proto.fromDom = function fromDom(value) {
      return value === "initial" ? "" : value.replace("px", "");
    };
    /**
     * Convert value to knockout format
     *
     * @param name string
     * @param data Object
     * @returns {string | object}
     */


    _proto.toDom = function toDom(name, data) {
      return data[name] + "px";
    };

    return BorderWidth;
  }();

  return BorderWidth;
});
//# sourceMappingURL=border-width.js.map
