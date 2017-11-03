/**
 * Copyright © 2013-2017 Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

import {DataObject} from "../component/data-store";
import AppearanceInterface from "../component/appearance/appearance-interface";

interface AppearanceList {
    [key: string]: AppearanceInterface;
}

export default class AppearanceApplier {
    // List of type appearances
    appearances: AppearanceList;

    constructor(appearances: AppearanceList) {
        this.appearances = appearances;
    }

    /**
     * @param data
     * @returns {DataObject}
     */
    apply(data: DataObject): DataObject {
        if (data['appearance'] !== undefined) {
            if (this.appearances[data['appearance']] === undefined) {
                console.error('No appearances specified for content type.');
            }
            return this.appearances[data['appearance']].apply(data);
        }
        return data;
    }
}