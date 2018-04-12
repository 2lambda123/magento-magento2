/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

export interface ConfigFieldInterface {
    [key: string]: {
        default: null | string | number;
    };
}
