<?php
/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */
namespace Gene\BlueFoot\Setup\DataConverter;

/**
 * Define keys that used to determine if the content is BlueFoot format or content contains unmigrated data
 */
class Format
{
    // BlueFoot format key <!--GENE_BLUEFOOT="[]"-->
    const BLUEFOOT_KEY = 'GENE_BLUEFOOT';

    // Key of not migrated content in the new format <!--UNMIGRATED_CONTENT="[]"-->
    const UNMIGRATED_KEY = 'UNMIGRATED_CONTENT';
}
