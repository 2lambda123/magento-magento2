<?php
/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */
declare(strict_types=1);

namespace Magento\CatalogGraphQl\DataProvider\Product\LayeredNavigation\Builder\Aggregations;

use Magento\Catalog\Api\CategoryListInterface;
use Magento\Framework\Api\SearchCriteriaBuilder;
use Magento\Framework\Search\Response\Aggregation;
use Magento\Framework\Search\Response\AggregationFactory;
use Magento\Framework\Search\Response\BucketFactory;
use Magento\Store\Model\StoreManagerInterface;
use Magento\Framework\Api\Search\AggregationInterface;

/**
 * Include only subcategories of category in aggregation
 */
class IncludeSubcategoriesOnly
{
    /**
     * @var string
     */
    private $categoryBucket = 'category_bucket';

    /**
     * @var string
     */
    private $bucketsName = 'buckets';

    /**
     * @var AggregationFactory
     */
    private $aggregationFactory;

    /**
     * @var BucketFactory
     */
    private $bucketFactory;

    /**
     * @var StoreManagerInterface
     */
    private $storeManager;

    /**
     * @var CategoryListInterface
     */
    private $categoryList;

    /**
     * @var array
     */
    private $filter = [];

    /**
     * @var SearchCriteriaBuilder
     */
    private $searchCriteriaBuilder;

    /**
     * @param AggregationFactory $aggregationFactory
     * @param BucketFactory $bucketFactory
     * @param StoreManagerInterface $storeManager
     * @param CategoryListInterface $categoryList
     * @param SearchCriteriaBuilder $searchCriteriaBuilder
     */
    public function __construct(
        AggregationFactory $aggregationFactory,
        BucketFactory $bucketFactory,
        StoreManagerInterface $storeManager,
        CategoryListInterface $categoryList,
        SearchCriteriaBuilder $searchCriteriaBuilder
    ) {
        $this->aggregationFactory = $aggregationFactory;
        $this->bucketFactory = $bucketFactory;
        $this->storeManager = $storeManager;
        $this->categoryList = $categoryList;
        $this->searchCriteriaBuilder = $searchCriteriaBuilder;
    }

    /**
     * Filter category aggregation to include only subcategories of requested category
     *
     * @param AggregationInterface $aggregation
     * @param int|null $storeId
     * @return Aggregation
     */
    public function filter(AggregationInterface $aggregation, ?int $storeId): Aggregation
    {
        $categoryIdsRequested = $this->filter['category'] ?? null;
        if ($categoryIdsRequested === null) {
            return $aggregation;
        }
        $buckets = $aggregation->getBuckets();
        $categoryBucket = $buckets[$this->categoryBucket] ?? null;
        if ($categoryBucket === null || empty($categoryBucket->getValues())) {
            return $aggregation;
        }
        $categoryIdsRequested = is_array($categoryIdsRequested) ? $categoryIdsRequested : [$categoryIdsRequested];
        $bucketValuesFiltered = $this->filterBucketValues(
            $categoryBucket->getValues(),
            $categoryIdsRequested,
            $storeId
        );
        $categoryBucketResolved = $this->bucketFactory->create(
            [
                'name' => $this->categoryBucket,
                'values' => $bucketValuesFiltered
            ]
        );
        $buckets[$this->categoryBucket] = $categoryBucketResolved;
        return $this->aggregationFactory->create([$this->bucketsName => $buckets]);
    }

    /**
     * Set filter for categories aggregation
     *
     * @param array $filter
     */
    public function setFilter(array $filter): void
    {
        $this->filter = $filter;
    }

    /**
     * Filter bucket values to include only subcategories of requested category
     *
     * @param array $categoryBucketValues
     * @param array $categoryIdsRequested
     * @param int|null $storeId
     * @return array
     */
    private function filterBucketValues(
        array $categoryBucketValues,
        array $categoryIdsRequested,
        ?int  $storeId
    ): array {
        $categoryChildIds = [];
        $storeId = $storeId !== null ? $storeId : $this->storeManager->getStore()->getId();
        $searchCriteria = $this->searchCriteriaBuilder
            ->addFilter('entity_id', $categoryIdsRequested, 'in')
            ->create();
        $categoriesRequested = $this->categoryList->getList($searchCriteria);
        foreach ($categoriesRequested->getItems() as $category) {
            $category->setStoreId($storeId);
            $childrenIds = $category->getChildren();
            if ($childrenIds) {
                $categoryChildIds = array_merge($categoryChildIds, explode(',', $childrenIds));
            }
        }
        foreach ($categoryBucketValues as $key => $bucketValue) {
            $categoryId = (int)$bucketValue->getValue();
            if (!in_array($categoryId, $categoryChildIds)) {
                unset($categoryBucketValues[$key]);
            }
        }
        return array_values($categoryBucketValues);
    }
}
