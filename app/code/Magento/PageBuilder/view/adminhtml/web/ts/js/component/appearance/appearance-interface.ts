/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

import {DataObject} from "../data-store";

export interface AppearanceInterface {
    /**
     * Apply appearance
     *
     * @param {DataObject} data
     * @returns {DataObject}
     */
    add(data: DataObject): DataObject;
}
