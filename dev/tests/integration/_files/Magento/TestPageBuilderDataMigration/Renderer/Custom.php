<?php
/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */
namespace Magento\TestPageBuilderDataMigration\Renderer;

use Magento\PageBuilder\Setup\DataConverter\RendererInterface;

/**
 * Render custom content type to PageBuilder format
 */
class Custom implements RendererInterface
{
    /**
     * {@inheritdoc}
     */
    public function render(array $itemData, array $additionalData = [])
    {
        return '<div data-role="custom"></div>';
    }
}
