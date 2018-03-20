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
     * @param {string} value
     * @returns {Object | string}
     */
    _proto.fromDom = function fromDom(value) {
      return value === "initial" ? "" : value.replace("px", "");
    };
    /**
     * @param {string} name
     * @param {Object} data
     * @returns {Object | string}
     */


    _proto.toDom = function toDom(name, data) {
      return data[name] + "px";
    };

    return BorderWidth;
  }();

  return BorderWidth;
});
//# sourceMappingURL=border-width.js.map
