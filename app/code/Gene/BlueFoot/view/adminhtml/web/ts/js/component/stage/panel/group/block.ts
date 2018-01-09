/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */
import ko from "knockout";
import EventEmitter from "../../../event-emitter";

/**
 * Block Class
 */

export class Block extends EventEmitter {
    public config: ContentBlockConfig;
    public droppable: boolean = true;
    public icon: KnockoutObservable<string> = ko.observable("");
    public identifier: KnockoutObservable<string> = ko.observable("");
    public label: KnockoutObservable<string> = ko.observable("");

    /**
     * Block Constructor
     *
     * @param {string} identifier
     * @param {ContentBlockConfig} config
     */
    constructor(identifier: string, config: ContentBlockConfig) {
        super();
        this.config = config;
        this.identifier(identifier);
        this.label(config.label);
        this.icon(config.icon);
    }

    /**
     * Return the draggable config to the element
     *
     * @returns {string}
     */
    public getDraggableConfig() {
        return this.config.allowed_parents.map((value, index) => "." + value + "-container").join(", ");
    }
}
