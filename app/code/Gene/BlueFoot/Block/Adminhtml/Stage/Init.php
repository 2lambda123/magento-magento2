<?php
/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */
namespace Gene\BlueFoot\Block\Adminhtml\Stage;

use Magento\Framework\UrlInterface;

class Init extends \Magento\Backend\Block\Template
{
    /**
     * @var \Magento\Framework\UrlInterface
     */
    private $urlBuilder;

    /**
     * @var \Magento\Framework\Url
     */
    private $frontendUrlBuilder;

    /**
     * @var \Gene\BlueFoot\Model\Stage\Config
     */
    private $stageConfig;

    /**
     * Constructor
     *
     * @param \Magento\Backend\Block\Template\Context $context
     * @param \Gene\BlueFoot\Model\Stage\Config $stageConfig
     * @param \Magento\Framework\Url $frontendUrlBuilder
     * @param array $data
     */
    public function __construct(
        \Magento\Backend\Block\Template\Context $context,
        \Gene\BlueFoot\Model\Stage\Config $stageConfig,
        \Magento\Framework\Url $frontendUrlBuilder,
        array $data = []
    ) {
        parent::__construct($context, $data);
        $this->urlBuilder = $context->getUrlBuilder();
        $this->frontendUrlBuilder = $frontendUrlBuilder;
        $this->stageConfig = $stageConfig;
    }

    /**
     * Get the initial configuration
     *
     * @return string
     */
    public function getConfig()
    {
        $data = array_merge(
            [
                'form_key' => $this->formKey->getFormKey(),
                'init_button_class' => '.init-gene-bluefoot',
                'media_url' => $this->urlBuilder->getBaseUrl(['_type' => UrlInterface::URL_TYPE_MEDIA]),
                'preview_url' => $this->frontendUrlBuilder->getUrl('bluefoot/contenttype/preview')
            ],
            $this->stageConfig->getConfig()
        );
        $config = new \Magento\Framework\DataObject($data);
        return $config->toJson();
    }
}
