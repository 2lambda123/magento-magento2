<?php
/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

declare(strict_types=1);

namespace Magento\PageBuilder\Model\Config\ContentTypes\AdditionalData\Provider\Uploader;

use Magento\PageBuilder\Model\Config\ContentTypes\AdditionalData\ProviderInterface;
use Magento\Framework\View\Element\UiComponent\ContextInterface;
use Magento\Framework\App\RequestInterface;

/**
 * Provides save URL for uploader
 */
class SaveUrl implements ProviderInterface
{
    /**
     * @var ContextInterface
     */
    private $context;

    /**
     * @var RequestInterface
     */
    private $request;

    /**
     * @param ContextInterface $context
     * @param RequestInterface $request
     */
    public function __construct(ContextInterface $context, RequestInterface $request)
    {
        $this->context = $context;
        $this->request = $request;
    }

    /**
     * @inheritdoc
     */
    public function getData(string $itemName) : array
    {
        return [
            $itemName => $this->context->getUrl(
                'pagebuilder/contenttype/image_upload',
                ['_secure' => $this->request->isSecure()]
            )
        ];
    }
}
