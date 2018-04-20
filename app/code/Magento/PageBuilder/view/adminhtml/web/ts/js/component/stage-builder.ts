/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

import $t from "mage/translate";
import alertDialog from "Magento_Ui/js/modal/alert";
import * as _ from "underscore";
import ContentTypeConfigInterface from "../content-type-config.d";
import createContentType from "../content-type-factory";
import {removeQuotesInMediaDirectives} from "../utils/directives";
import Block from "./block/block";
import Config from "./config";
import EventBus from "./event-bus";
import validateFormat from "./format/format-validator";
import AttributeReaderComposite from "./format/read/composite";
import Stage from "./stage";

/**
 * Build the stage with the provided value
 *
 * @param {stage} stage
 * @param {string} value
 * @returns {Promise<void>}
 */
function buildFromContent(stage: Stage, value: string) {
    const stageDocument = document.createElement("div");
    stageDocument.setAttribute(Config.getConfig("dataRoleAttributeName"), "stage");
    stageDocument.innerHTML = value;
    return buildElementIntoStage(stageDocument, stage, stage);
}

/**
 * Build an element and it's children into the stage
 *
 * @param {Element} element
 * @param {ContentTypeInterface} parent
 * @param {stage} stage
 * @returns {Promise<void>}
 */
function buildElementIntoStage(element: Element, parent: ContentTypeInterface, stage: Stage): Promise<any> {
    if (element instanceof HTMLElement
        && element.getAttribute(Config.getConfig("dataRoleAttributeName"))
    ) {
        const childPromises: Array<Promise<ContentTypeInterface>> = [];
        const childElements: Element[] = [];
        const children = getElementChildren(element);

        if (children.length > 0) {
            _.forEach(children, (childElement: HTMLElement) => {
                childPromises.push(createElementBlock(childElement, stage, parent));
                childElements.push(childElement);
            });
        }

        // Wait for all the promises to finish and add the instances to the stage
        return Promise.all(childPromises).then((childrenPromises) => {
            return Promise.all(childrenPromises.map((child: Block, index) => {
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
 * @param {ContentTypeInterface} parent
 * @param {stage} stage
 * @returns {Promise<ContentTypeInterface>}
 */
function createElementBlock(element: HTMLElement, stage: Stage, parent?: ContentTypeInterface): Promise<ContentTypeInterface> {
    parent = parent || stage;
    const role = element.getAttribute(Config.getConfig("dataRoleAttributeName"));
    const config = Config.getContentTypeConfig(role);

    return getElementData(element, config).then(
        (data: object) => createContentType(
            config,
            parent,
            stage.id,
            data,
            getElementChildren(element).length,
        ),
    );
}

/**
 * Retrieve the elements data
 *
 * @param {HTMLElement} element
 * @param {ContentTypeConfigInterface} config
 * @returns {Promise<any>}
 */
function getElementData(element: HTMLElement, config: ContentTypeConfigInterface) {
    // Create an object with all fields for the content type with an empty value
    const result = _.mapObject(config.fields, () => {
        return "";
    });
    const attributeReaderComposite = new AttributeReaderComposite();
    const readPromise = attributeReaderComposite.read(element);
    return readPromise.then((data) => {
        return _.extend(result, data);
    });
}

/**
 * Return elements children, search for direct descendants, or traverse through to find deeper children
 *
 * @param element
 * @returns {Array}
 */
function getElementChildren(element: Element) {
    if (element.hasChildNodes()) {
        let children: any[] = [];
        // Find direct children of the element
        _.forEach(element.childNodes, (child: HTMLElement) => {
            // Only search elements which tagName's and not script tags
            if (child.tagName && child.tagName !== "SCRIPT") {
                if (child.hasAttribute(Config.getConfig("dataRoleAttributeName"))) {
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

function buildEmpty(stage: Stage, initialValue: string) {
    const stageConfig = Config.getConfig("stage_config");
    const rootContentTypeConfig = Config.getContentTypeConfig(stageConfig.root_content_type);
    const htmlDisplayContentTypeConfig = Config.getContentTypeConfig(stageConfig.html_display_content_type);

    if (rootContentTypeConfig) {
        return createContentType(rootContentTypeConfig, stage, stage.id, {}).then((row: Block) => {
            stage.addChild(row);
            if (htmlDisplayContentTypeConfig && initialValue) {
                return createContentType(
                    htmlDisplayContentTypeConfig,
                    stage,
                    stage.id,
                    {
                        html: initialValue,
                    },
                ).then((text: Block) => {
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
export default function build(
    stage: Stage,
    content: string,
) {
    let currentBuild;

    content = removeQuotesInMediaDirectives(content);
    // Determine if we're building from existing page builder content
    if (validateFormat(content)) {
        currentBuild = buildFromContent(stage, content)
            .catch(() => {
                stage.children([]);
                currentBuild = buildEmpty(stage, content);
            });
    } else {
        currentBuild = buildEmpty(stage, content);
    }

    // Once the build process is finished the stage is ready
    return currentBuild.catch((error: Error) => {
        alertDialog({
            content: $t("An error has occurred while initiating the content area."),
            title: $t("Advanced CMS Error"),
        });
        EventBus.trigger("stage:error", error);
        console.error(error);
    });
}
