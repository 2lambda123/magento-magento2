<?php
/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */
namespace Magento\PageBuilder\Setup\DataConverter\Renderer;

use Magento\PageBuilder\Setup\DataConverter\RendererInterface;
use Magento\PageBuilder\Setup\DataConverter\StyleExtractorInterface;

/**
 * Render column group to PageBuilder format
 */
class ColumnGroup implements RendererInterface
{
    /**
     * {@inheritdoc}
     */
    public function render(array $itemData, array $additionalData = [])
    {
        $rootElementAttributes = [
            'class' => 'pagebuilder-column-group',
            'style' => 'display: flex;',
            'data-role' => 'column-group',
        ];

        $rootElementHtml = '<div';
        foreach ($rootElementAttributes as $attributeName => $attributeValue) {
            $attributeValue = trim($attributeValue);
            $rootElementHtml .= $attributeValue ? " $attributeName=\"$attributeValue\"" : '';
        }
        $rootElementHtml .= '>' . (isset($additionalData['children']) ? $additionalData['children'] : '') . '</div>';

        return $rootElementHtml;
    }
}
