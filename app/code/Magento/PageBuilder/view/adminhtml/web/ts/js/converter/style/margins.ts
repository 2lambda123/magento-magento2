/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

import ConverterInterface from "../converter-interface";

export default class Margins implements ConverterInterface {
    /**
     * Convert value to internal format
     *
     * @param value string
     * @returns {string | object}
     */
    public fromDom(value: string): string | object {
        const result = {};
        if (undefined !== value.margin) {
            result.margin = {
                top: value.margin.top.replace("px", ""),
                left: value.margin.left.replace("px", ""),
                right: value.margin.right.replace("px", ""),
                bottom: value.margin.bottom.replace("px", ""),
            };
        }
        return result;
    }

    /**
     * Convert value to knockout format
     *
     * @param name string
     * @param data Object
     * @returns {string | object}
     */
    public toDom(name: string, data: object): string | object {
        const result = {};
        let value = data[name];
        if (value && typeof value === "string") {
            value = JSON.parse(value);
        }
        if (value && undefined !== value.margin) {
            result.marginLeft = value.margin.left + "px";
            result.marginTop = value.margin.top + "px";
            result.marginRight = value.margin.right + "px";
            result.marginBottom = value.margin.bottom + "px";
        }
        return result;
    }
}
