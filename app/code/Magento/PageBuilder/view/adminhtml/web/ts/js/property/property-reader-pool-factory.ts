/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

import loadModule from "Magento_PageBuilder/js/loader";
import Config from "../config";
import PropertyReaderPool from "./property-reader-pool";

/**
 * Create a new instance of property reader pool
 */
export default function create(contentType: string): Promise<> {
    const config = Config.getContentTypeConfig(contentType);
    const propertyReaders = [];
    for (const appearanceName: string of Object.keys(config.appearances)) {
        const dataMapping = config.appearances[appearanceName].data_mapping;
        if (dataMapping !== undefined && dataMapping.elements !== undefined) {
            for (const elementName: string of Object.keys(dataMapping.elements)) {
                const element = dataMapping.elements[elementName];
                if (element.style !== undefined) {
                    for (const propertyConfig of element.style) {
                        if (!!propertyConfig.complex
                            && propertyConfig.reader
                            && propertyReaders.indexOf(propertyConfig.reader) === -1
                            && !PropertyReaderPool.get(propertyConfig.reader)
                        ) {
                            propertyReaders.push(propertyConfig.reader);
                        }
                    }
                }

                if (element.attributes !== undefined) {
                    for (const attributeConfig of element.attributes) {
                        if (!!attributeConfig.complex
                            && attributeConfig.reader
                            && propertyReaders.indexOf(attributeConfig.reader) === -1
                            && !PropertyReaderPool.get(attributeConfig.reader)
                        ) {
                            propertyReaders.push(attributeConfig.reader);
                        }
                    }
                }
            }
        }
    }

    return new Promise((resolve: (PropertyReaderPool: object) => void) => {
        loadModule(propertyReaders, (...loadedPropertyReaders: any[]) => {
            for (let i = 0; i < propertyReaders.length; i++) {
                PropertyReaderPool.register(propertyReaders[i], new loadedPropertyReaders[i]());
            }
            resolve(PropertyReaderPool);
        });
    });
}
