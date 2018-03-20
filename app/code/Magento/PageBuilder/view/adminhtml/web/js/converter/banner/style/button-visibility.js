/*eslint-disable */
define([], function () {
  /**
   * Copyright © Magento, Inc. All rights reserved.
   * See COPYING.txt for license details.
   */
  var ButtonVisibility =
  /*#__PURE__*/
  function () {
    function ButtonVisibility() {}

    var _proto = ButtonVisibility.prototype;

    _proto.fromDom = function fromDom(value) {
      return value;
    };

    _proto.toDom = function toDom(name, data) {
      return data.show_button === "always" ? "visible" : "hidden";
    };

    return ButtonVisibility;
  }();

  return ButtonVisibility;
});
//# sourceMappingURL=button-visibility.js.map
