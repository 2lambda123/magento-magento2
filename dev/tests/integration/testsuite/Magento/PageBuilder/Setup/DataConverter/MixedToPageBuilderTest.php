<?php
/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */
namespace Magento\PageBuilder\Setup\DataConverter;

use Magento\Framework\ObjectManagerInterface;
use Magento\TestFramework\Helper\Bootstrap;

class MixedToPageBuilderTest extends \PHPUnit\Framework\TestCase
{
    /**
     * @var ObjectManagerInterface
     */
    private static $objectManager;
    
    /**
     * @param $originalContentFileName
     * @param $migratedContentFileName
     * @dataProvider convertDataProvider
     */
    public function testConvert($originalContentFileName, $migratedContentFileName)
    {
        self::$objectManager = Bootstrap::getObjectManager();
        $mixedToPageBuilderConverter =
            self::$objectManager->create(\Magento\PageBuilder\Setup\DataConverter\MixedToPageBuilder::class);

        $this->assertEquals(
            file_get_contents(__DIR__ . '/../../_files/' . $migratedContentFileName),
            $mixedToPageBuilderConverter->convert(
                file_get_contents(__DIR__ . '/../../_files/' . $originalContentFileName)
            )
        );
    }

    /**
     * @return array
     */
    public function convertDataProvider()
    {
        return [
            [
                'mixed.html',
                'mixed_migrated.html'
            ],
            [
                'mixed_multiple_content_types.html',
                'mixed_multiple_content_types_migrated.html'
            ]
        ];
    }
}
