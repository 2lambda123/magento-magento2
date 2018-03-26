/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

import ElementConverterInterface from "../../element-converter-interface";

export default class Color implements ElementConverterInterface {
    /**
     * Convert value to internal format
     *
     * @param value string
     * @returns {string | object}
     */
    public fromDom(value: string): string | object {
        if (value === "default" || value === "initial" || value === "") {
            value = "";
        } else {
            const regexp = /(\d{0,3}),\s(\d{0,3}),\s(\d{0,3})/;
            const matches = regexp.exec(value);
            if (matches) {
                value = "#"
                    + this.fromIntToHex(parseInt(matches[1], 10))
                    + this.fromIntToHex(parseInt(matches[2], 10))
                    + this.fromIntToHex(parseInt(matches[3], 10));
            }
        }
        return value;
    }

    /**
     * Convert value to knockout format
     *
     * @param name string
     * @param data Object
     * @returns {string | object}
     */
    public toDom(name: string, data: object): string {
        return data[name];
    }

    /**
     * Convert from int to hex
     *
     * @param {number} value
     * @returns {string}
     */
    private fromIntToHex(value: number): string {
        const hex = value.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    }
}
