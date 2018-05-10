/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

import {PlaceholderOptionsInterface} from "./placeholder-options";

export interface SortableOptionsInterface extends JQueryUI.SortableOptions {
    placeholder?: string | PlaceholderOptionsInterface;
}
