/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

import PropertyReaderInterface from "../property-reader-interface";

export default class Margins implements PropertyReaderInterface {
    /**
     * Read margins from element
     *
     * @param {HTMLElement} element
     * @returns {string | Object}
     */
    public read(element: HTMLElement): string | object {
        return {
            margin: {
                left: element.style.marginLeft,
                top: element.style.marginTop,
                right: element.style.marginRight,
                bottom: element.style.marginBottom,
            },
        };
    }
}
