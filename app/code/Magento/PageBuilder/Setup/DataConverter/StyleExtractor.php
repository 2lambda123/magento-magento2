<?php
/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */
namespace Magento\PageBuilder\Setup\DataConverter;

use Magento\Framework\Serialize\Serializer\Json;

/**
 * Extract and convert styles from a data array into value style string
 */
class StyleExtractor implements StyleExtractorInterface
{
    /**
     * @var Json
     */
    private $serializer;

    /**
     * @var ColorConverter
     */
    private $colorConverter;

    public function __construct(
        Json $serializer,
        ColorConverter $colorConverter
    ) {
        $this->serializer = $serializer;
        $this->colorConverter = $colorConverter;
    }

    /**
     * @inheritdoc
     *
     * @SuppressWarnings(PHPMD.CyclomaticComplexity)
     * @SuppressWarnings(PHPMD.NPathComplexity)
     */
    public function extractStyle(array $formData)
    {
        $styleAttributes = [
            'text-align' => isset($formData['align']) ? $formData['align'] : '',
            'width' => isset($formData['width']) ? $this->normalizeSizeDimension($formData['width']) : '',
            'height' => isset($formData['height']) ? $this->normalizeSizeDimension($formData['height']) : '',
            'background-color' => isset($formData['background_color'])
                ? $this->colorConverter->convert($formData['background_color']) : '',
            'background-image' => !empty($formData['background_image'])
                ? ('url(\'{{media url=gene-cms' . $formData['background_image'] . '}}\')') : '',
            'border-color' => isset($formData['border_color'])
                ? $this->colorConverter->convert($formData['border_color']) : '',
            'border-width' => $formData['border_width'] ?? '',
            'display' => $formData['display'] ?? ''
        ];

        if (isset($formData['metric']) && $formData['metric']) {
            $metric = $this->serializer->unserialize($formData['metric']);
            $styleAttributes['margin'] = isset($metric['margin']) ?
                $this->extractMarginPadding($metric['margin']) : '';
            $styleAttributes['padding'] = isset($metric['padding']) ?
                $this->extractMarginPadding($metric['padding']) : '';
        }

        $styleString = '';
        foreach ($styleAttributes as $attributeName => $attributeValue) {
            if ($attributeValue) {
                $styleString .= "$attributeName: $attributeValue; ";
            }
        }

        return rtrim($styleString);
    }

    /**
     * Normalize value for width/height
     *
     * @param string $value
     * @return string
     */
    private function normalizeSizeDimension($value)
    {
        if (strpos($value, 'px') !== false || strpos($value, '%') !== false) {
            return $value;
        }
        return ($value * 100) . '%';
    }

    /**
     * Transform data to valid CSS string
     *
     * @param string $attributeData
     * @return string
     */
    private function extractMarginPadding(string $attributeData)
    {
        $valuesArray = explode(' ', $attributeData);
        $convertedValuesArray = array_map(function ($value) {
            return $value === '-' ? '0px' : $value;
        }, $valuesArray);

        return implode($convertedValuesArray, ' ');
    }
}
