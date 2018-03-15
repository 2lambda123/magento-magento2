/*eslint-disable */
define(["../../../utils/color-converter", "../../../utils/number-converter"], function (_colorConverter, _numberConverter) {
  /**
   * Copyright © Magento, Inc. All rights reserved.
   * See COPYING.txt for license details.
   */
  var OverlayBackgroundColor =
  /*#__PURE__*/
  function () {
    function OverlayBackgroundColor() {}

    var _proto = OverlayBackgroundColor.prototype;

    _proto.fromDom = function fromDom(value, key, data) {
      return value;
    };

    _proto.toDom = function toDom(value, key, data) {
      var overlayColor = "transparent";

      if (data.show_overlay === "always" && data.overlay_color !== "" && data.overlay_color !== undefined) {
        overlayColor = (0, _colorConverter.fromHex)(data.overlay_color, (0, _numberConverter.percentToDecimal)(data.overlay_transparency));
      }

      return overlayColor;
    };

    return OverlayBackgroundColor;
  }();

  return OverlayBackgroundColor;
});
//# sourceMappingURL=overlay-background-color.js.map
