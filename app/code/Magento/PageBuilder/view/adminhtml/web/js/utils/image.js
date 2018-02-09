/*eslint-disable */
define(["../component/config"], function (_config) {
  /**
   * Copyright © Magento, Inc. All rights reserved.
   * See COPYING.txt for license details.
   */

  /**
   * Decode image background URL to object
   *
   * @param value
   * @returns {Object}
   */
  function decodeUrl(value) {
    var result = "";
    value = decodeURIComponent(value.replace(window.location.href, ""));
    var regexp = /{{.*\s*url="?(.*\.([a-z|A-Z]*))"?\s*}}/;

    if (regexp.test(value)) {
      var _regexp$exec = regexp.exec(value),
          url = _regexp$exec[1],
          type = _regexp$exec[2];

      var image = {
        name: url.split("/").pop(),
        size: 0,
        type: "image/" + type,
        url: _config.getInitConfig("media_url") + url
      };
      result = [image];
    }

    return result;
  }

  return {
    decodeUrl: decodeUrl
  };
});
//# sourceMappingURL=image.js.map
