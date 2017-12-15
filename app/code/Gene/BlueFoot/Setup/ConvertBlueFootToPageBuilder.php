<?php
/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */
namespace Gene\BlueFoot\Setup;

use Magento\Framework\Setup\ModuleDataSetupInterface;
use Magento\Cms\Api\Data\BlockInterface;
use Magento\Cms\Api\Data\PageInterface;
use Magento\Framework\EntityManager\MetadataPool;
use Magento\Framework\DB\AggregatedFieldDataConverter;
use Magento\Framework\DB\Select\QueryModifierFactory;
use Magento\Framework\DB\FieldToConvert;

class ConvertBlueFootToPageBuilder
{
    /**
     * @var ModuleDataSetupInterface
     */
    private $setup;

    /**
     * @var MetadataPool
     */
    private $metadataPool;

    /**
     * @var AggregatedFieldDataConverter
     */
    private $aggregatedFieldConverter;

    /**
     * @var QueryModifierFactory
     */
    private $queryModifierFactory;

    /**
     * ConvertBlueFootToPageBuilder constructor.
     *
     * @param ModuleDataSetupInterface $setup
     * @param MetadataPool $metadataPool
     * @param AggregatedFieldDataConverter $aggregatedFieldConverter
     * @param QueryModifierFactory $queryModifierFactory
     */
    public function __construct(
        ModuleDataSetupInterface $setup,
        MetadataPool $metadataPool,
        AggregatedFieldDataConverter $aggregatedFieldConverter,
        QueryModifierFactory $queryModifierFactory
    ) {
        $this->setup = $setup;
        $this->metadataPool = $metadataPool;
        $this->aggregatedFieldConverter = $aggregatedFieldConverter;
        $this->queryModifierFactory = $queryModifierFactory;
    }

    /**
     * Convert BlueFoot data into Page Builder compatible structures
     */
    public function convert()
    {
        $pageMetadata = $this->metadataPool->getMetadata(PageInterface::class);
        $blockMetadata = $this->metadataPool->getMetadata(BlockInterface::class);
        $this->aggregatedFieldConverter->convert(
            [
                new FieldToConvert(
                    DataConverter\BlueFootToPageBuilder::class,
                    $this->setup->getTable('cms_page'),
                    $pageMetadata->getIdentifierField(),
                    'content',
                    $this->createQueryModifier('content', DataConverter\Validator::BLUEFOOT_KEY)
                ),
                new FieldToConvert(
                    DataConverter\BlueFootToPageBuilder::class,
                    $this->setup->getTable('cms_block'),
                    $blockMetadata->getIdentifierField(),
                    'content',
                    $this->createQueryModifier('content', DataConverter\Validator::BLUEFOOT_KEY)
                ),
                new FieldToConvert(
                    DataConverter\BlueFootToPageBuilder::class,
                    $this->setup->getTable('catalog_product_entity_text'),
                    'value_id',
                    'value',
                    $this->createQueryModifier('value', DataConverter\Validator::BLUEFOOT_KEY)
                )
            ],
            $this->setup->getConnection()
        );
    }

    /**
     * Create a new query modifier based on a specific field and match string
     *
     * @param $field string
     * @param $match string
     *
     * @return \Magento\Framework\DB\Select\QueryModifierInterface
     */
    private function createQueryModifier($field, $match)
    {
        return $this->queryModifierFactory->create(
            'like',
            [
                'values' => [
                    $field => '%' . $match . '%'
                ]
            ]
        );
    }
}
