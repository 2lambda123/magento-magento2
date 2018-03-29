/*eslint-disable */
define(["mage/translate", "Magento_Ui/js/modal/alert", "underscore", "../utils/directives", "./block/factory", "./config", "./event-bus", "./format/format-validator", "./format/read/composite"], function (_translate, _alert, _, _directives, _factory, _config, _eventBus, _formatValidator, _composite) {
  /**
   * Copyright © Magento, Inc. All rights reserved.
   * See COPYING.txt for license details.
   */

  /**
   * Build the stage with the provided value
   *
   * @param {stage} stage
   * @param {string} value
   * @returns {Promise<void>}
   */
  function buildFromContent(stage, value) {
    var stageDocument = document.createElement("div");
    stageDocument.setAttribute(_config.getValueAsString("dataRoleAttributeName"), "stage");
    stageDocument.innerHTML = value;
    return buildElementIntoStage(stageDocument, stage, stage);
  }
  /**
   * Build an element and it's children into the stage
   *
   * @param {Element} element
   * @param {EditableArea} parent
   * @param {stage} stage
   * @returns {Promise<void>}
   */


  function buildElementIntoStage(element, parent, stage) {
    if (element instanceof HTMLElement && element.getAttribute(_config.getValueAsString("dataRoleAttributeName"))) {
      var childPromises = [];
      var childElements = [];
      var children = getElementChildren(element);

      if (children.length > 0) {
        _.forEach(children, function (childElement) {
          childPromises.push(createElementBlock(childElement, stage, parent));
          childElements.push(childElement);
        });
      } // Wait for all the promises to finish and add the instances to the stage


      return Promise.all(childPromises).then(function (childrenPromises) {
        return Promise.all(childrenPromises.map(function (child, index) {
          parent.addChild(child);
          return buildElementIntoStage(childElements[index], child, stage);
        }));
      });
    }
  }
  /**
   * Parse an element in the structure and build the required element
   *
   * @param {Element} element
   * @param {EditableArea} parent
   * @param {stage} stage
   * @returns {Promise<EditableAreaInterface>}
   */


  function createElementBlock(element, stage, parent) {
    parent = parent || stage;
    var role = element.getAttribute(_config.getValueAsString("dataRoleAttributeName"));

    var config = _config.getInitConfig("content_types")[role];

    return getElementData(element, config).then(function (data) {
      return (0, _factory)(config, parent, stage, data, getElementChildren(element).length);
    });
  }
  /**
   * Retrieve the elements data
   *
   * @param {HTMLElement} element
   * @param {ConfigContentBlock} config
   * @returns {Promise<any>}
   */


  function getElementData(element, config) {
    // Create an object with all fields for the content type with an empty value
    var result = _.mapObject(config.fields, function () {
      return "";
    });

    var attributeReaderComposite = new _composite();
    var readPromise = attributeReaderComposite.read(element);
    return readPromise.then(function (data) {
      return _.extend(result, data);
    });
  }
  /**
   * Return elements children, search for direct descendants, or traverse through to find deeper children
   *
   * @param element
   * @returns {Array}
   */


  function getElementChildren(element) {
    if (element.hasChildNodes()) {
      var children = []; // Find direct children of the element

      _.forEach(element.childNodes, function (child) {
        // Only search elements which tagName's and not script tags
        if (child.tagName && child.tagName !== "SCRIPT") {
          if (child.hasAttribute(_config.getValueAsString("dataRoleAttributeName"))) {
            children.push(child);
          } else {
            children = getElementChildren(child);
          }
        }
      });

      return children;
    }

    return [];
  }
  /**
   * Build a new instance of stage, add row & text content types if needed
   *
   * @param {Stage} stage
   * @param {string} initialValue
   * @returns {Promise<any>}
   */


  function buildEmpty(stage, initialValue) {
    var stageConfig = _config.getInitConfig("stage_config");

    var rootContentTypeConfig = _config.getContentType(stageConfig.root_content_type);

    var htmlDisplayContentTypeConfig = _config.getContentType(stageConfig.html_display_content_type);

    if (rootContentTypeConfig) {
      return (0, _factory)(rootContentTypeConfig, stage, stage, {}).then(function (row) {
        stage.addChild(row);

        if (htmlDisplayContentTypeConfig && initialValue) {
          return (0, _factory)(htmlDisplayContentTypeConfig, stage, stage, {
            html: initialValue
          }).then(function (text) {
            row.addChild(text);
          });
        }
      });
    }

    return Promise.resolve();
  }
  /**
   * Build a stage with the provided parent, content observable and initial value
   *
   * @param {StageInterface} stage
   * @param {string} content
   * @returns {Promise}
   */


  function build(stage, content) {
    var currentBuild;
    content = (0, _directives.removeQuotesInMediaDirectives)(content); // Determine if we're building from existing page builder content

    if ((0, _formatValidator)(content)) {
      currentBuild = buildFromContent(stage, content).catch(function () {
        stage.children([]);
        currentBuild = buildEmpty(stage, content);
      });
    } else {
      currentBuild = buildEmpty(stage, content);
    } // Once the build process is finished the stage is ready


    return currentBuild.catch(function (error) {
      (0, _alert)({
        content: (0, _translate)("An error has occurred while initiating the content area."),
        title: (0, _translate)("Advanced CMS Error")
      });

      _eventBus.trigger("stage:error", error);

      console.error(error);
    });
  }

  return build;
});
//# sourceMappingURL=stage-builder.js.map
