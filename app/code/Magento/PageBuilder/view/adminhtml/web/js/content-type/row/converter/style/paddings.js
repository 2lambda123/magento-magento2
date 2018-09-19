/*eslint-disable */
define([], function () {
  /**
   * Copyright © Magento, Inc. All rights reserved.
   * See COPYING.txt for license details.
   */
  var Paddings =
  /*#__PURE__*/
  function () {
    function Paddings() {}

    var _proto = Paddings.prototype;

    /**
     * @param {string} value
     * @returns {Object | string}
     */
    _proto.fromDom = function fromDom(value) {
      return value;
    };
    /**
     * Convert value to knockout format
     *
     * @param {string} name
     * @param {DataObject} data
     * @returns {string | object}
     */


    _proto.toDom = function toDom(name, data) {
      var result = {};
      var value = data[name];

      if (value && typeof value === "string") {
        value = JSON.parse(value);
      }

      if (undefined !== value && undefined !== value.padding) {
        result.paddingLeft = value.padding.left ? value.padding.left + "px" : "";
        result.paddingTop = value.padding.top ? value.padding.top + "px" : "";
        result.paddingRight = value.padding.right ? value.padding.right + "px" : "";
        result.paddingBottom = value.padding.bottom ? value.padding.bottom + "px" : "";
      }

      return result;
    };

    return Paddings;
  }();

  return Object.assign(Paddings, {
    __esModule: true
  });
});
//# sourceMappingURL=paddings.js.map
