/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

export interface DataConverterInterface {
    /**
     * Process data after it's read and converted by element converters
     *
     * @param {object} data
     * @param {object} config
     * @returns {object}
     */
    fromDom(data: object, config: object): object;

    /**
     * Process data before it's converted by element converters
     *
     * @param {object} data
     * @param {object} config
     * @returns {object}
     */
    toDom(data: object, config: object): object;
}
