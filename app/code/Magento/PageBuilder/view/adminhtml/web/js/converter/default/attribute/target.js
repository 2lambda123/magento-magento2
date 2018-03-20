/*eslint-disable */
define([], function () {
  /**
   * Copyright © Magento, Inc. All rights reserved.
   * See COPYING.txt for license details.
   */
  var Target =
  /*#__PURE__*/
  function () {
    function Target() {}

    var _proto = Target.prototype;

    /**
     * @param {string} value
     * @returns {Object | string}
     */
    _proto.fromDom = function fromDom(value) {
      return value === "_blank" ? "1" : "0";
    };
    /**
     * @param {string} name
     * @param {Object} data
     * @returns {Object | string}
     */


    _proto.toDom = function toDom(name, data) {
      return data[name] === "1" ? "_blank" : null;
    };

    return Target;
  }();

  return Target;
});
//# sourceMappingURL=target.js.map
