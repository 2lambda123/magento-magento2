<?php
/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */
namespace Magento\PageBuilder\Setup\DataConverter\ChildrenRenderer;

use Magento\PageBuilder\Setup\DataConverter\ChildrenRendererInterface;

/**
 * Children renderer which concatenates all children output together
 */
class Concatenation implements ChildrenRendererInterface
{
    /**
     * {@inheritdoc}
     */
    public function render(array $children, $renderChildCallback)
    {
        $childHtml = '';
        foreach ($children as $childIndex => $childItem) {
            $childHtml .= $renderChildCallback($childItem, $childIndex);
        }
        return $childHtml;
    }
}
