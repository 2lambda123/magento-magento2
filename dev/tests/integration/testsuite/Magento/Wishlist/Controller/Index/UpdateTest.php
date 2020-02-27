<?php
/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */
declare(strict_types=1);

namespace Magento\Wishlist\Controller\Index;

use Magento\Customer\Model\Session;
use Magento\Framework\App\Request\Http as HttpRequest;
use Magento\Framework\Message\MessageInterface;
use Magento\TestFramework\TestCase\AbstractController;
use Magento\Wishlist\Model\ResourceModel\Item\Collection as WishlistCollection;
use Magento\Wishlist\Model\WishlistFactory;

/**
 * Test for update wish list item.
 *
 * @magentoDbIsolation enabled
 * @magentoAppArea frontend
 * @magentoDataFixture Magento/Wishlist/_files/wishlist.php
 */
class UpdateTest extends AbstractController
{
    /** @var Session */
    private $customerSession;

    /** @var WishlistFactory */
    private $wishlistFactory;

    /**
     * @inheritdoc
     */
    protected function setUp()
    {
        parent::setUp();

        $this->customerSession = $this->_objectManager->get(Session::class);
        $this->wishlistFactory = $this->_objectManager->get(WishlistFactory::class);
    }

    /**
     * @inheritdoc
     */
    protected function tearDown()
    {
        $this->customerSession->setCustomerId(null);

        parent::tearDown();
    }

    /**
     * @return void
     */
    public function testUpdateWishListItem(): void
    {
        $this->customerSession->setCustomerId(1);
        $item = $this->getWishListItemsByCustomerId(1)->getFirstItem();
        $params = ['description' => [$item->getId() => 'Some description.'], 'qty' => [$item->getId() => 5]];
        $this->performUpdateWishListItemRequest($params);
        $message = sprintf("%s has been updated in your Wish List.", $item->getProduct()->getName());
        $this->assertSessionMessages($this->equalTo([(string)__($message)]), MessageInterface::TYPE_SUCCESS);
        $this->assertRedirect($this->stringContains('wishlist/index/index/wishlist_id/' . $item->getWishlistId()));
        $updatedItem = $this->getWishListItemsByCustomerId(1)->getFirstItem();
        $this->assertEquals(5, $updatedItem->getQty());
        $this->assertEquals('Some description.', $updatedItem->getDescription());
    }

    /**
     * @return void
     */
    public function testUpdateWishListItemZeroQty(): void
    {
        $this->customerSession->setCustomerId(1);
        $item = $this->getWishListItemsByCustomerId(1)->getFirstItem();
        $params = ['description' => [$item->getId() => ''], 'qty' => [$item->getId() => 0]];
        $this->performUpdateWishListItemRequest($params);
        $message = sprintf("%s has been updated in your Wish List.", $item->getProduct()->getName());
        $this->assertSessionMessages($this->equalTo([(string)__($message)]), MessageInterface::TYPE_SUCCESS);
        $this->assertRedirect($this->stringContains('wishlist/index/index/wishlist_id/' . $item->getWishlistId()));
        $this->assertCount(0, $this->getWishListItemsByCustomerId(1));
    }

    /**
     * Perform update wish list item request.
     *
     * @param array $params
     * @return void
     */
    private function performUpdateWishListItemRequest(array $params): void
    {
        $this->getRequest()->setPostValue($params)->setMethod(HttpRequest::METHOD_POST);
        $this->dispatch('wishlist/index/update');
    }

    /**
     * Get wish list items collection.
     *
     * @param int $customerId
     * @return WishlistCollection
     */
    private function getWishListItemsByCustomerId(int $customerId): WishlistCollection
    {
        return $this->wishlistFactory->create()->loadByCustomerId($customerId)->getItemCollection();
    }
}
