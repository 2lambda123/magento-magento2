/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

import ConverterInterface from "../../../../converter/converter-interface";
import {DataObject} from "../../../../data-store";

export default class Display implements ConverterInterface {
    /**
     * Convert value to internal format
     *
     * @param value string
     * @returns {boolean}
     */
    public fromDom(value: string): boolean {
        return true;
    }

    /**
     * Hide the slide if the slide is empty on the storefront, fallback to support the ability to hide items
     *
     * @param name string
     * @param data Object
     * @returns {string}
     */
    public toDom(name: string, data: DataObject): string {
        if (
            data.background_color === ""
            && data.background_image.length === 0
            && (!data.link_url || !data.link_url.default || data.link_url.default === "")
            && data.content === ""
            && data.show_button === "never"
            && data.show_overlay === "never"
        ) {
            return "false";
        }
        return "true";
    }
}
