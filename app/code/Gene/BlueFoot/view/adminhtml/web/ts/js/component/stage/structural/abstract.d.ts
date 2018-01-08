import EditableArea from './editable-area';
import { EditableAreaInterface } from "./editable-area.d";
import { OptionInterface } from "./options/option.d";
import Stage from "../../stage";

/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */
/**
 * StructuralInterface
 */
export interface Structural extends EditableAreaInterface {
    parent: EditableArea;
    stage: Stage;
    title: string;
    wrapperStyle: KnockoutObservable<object>;
    options: Array<OptionInterface>;
    children: KnockoutObservableArray<Structural>;
    template: string;
    childTemplate: string;
    config: any;
}