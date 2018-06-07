/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

import BaseMaster from "./master";

export default class ContentCollection extends BaseMaster {
    /**
     * Retrieve the child template
     *
     * @returns {string}
     */
    get renderChildTemplate(): string {
        return "Magento_PageBuilder/content-type/master-collection";
    }
}
