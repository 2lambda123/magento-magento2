<?php
/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

declare(strict_types=1);

namespace Magento\PageBuilder\Controller\Adminhtml\ContentType\Products;

use Magento\Rule\Model\Condition\Combine;

/**
 * Responsible for rendering the top-level conditions rule tree using the provided params
 */
class Conditions extends \Magento\CatalogWidget\Controller\Adminhtml\Product\Widget
{
    /**
     * @var \Magento\CatalogWidget\Model\Rule
     */
    private $rule;

    /**
     * @var \Magento\Framework\Serialize\Serializer\Json
     */
    private $serializer;

    /**
     * @param \Magento\Backend\App\Action\Context $context
     * @param \Magento\CatalogWidget\Model\Rule $rule
     * @param \Magento\Framework\Serialize\Serializer\Json $serializer
     */
    public function __construct(
        \Magento\Backend\App\Action\Context $context,
        \Magento\CatalogWidget\Model\Rule $rule,
        \Magento\Framework\Serialize\Serializer\Json $serializer
    ) {
        $this->rule = $rule;
        $this->serializer = $serializer;
        parent::__construct($context);
    }

    /**
     * @return void
     */
    public function execute()
    {
        $conditions = $this->getRequest()->getParam('conditions');
        $this->rule->loadPost(['conditions'=> $this->serializer->unserialize($conditions)]);
        $conditions = $this->rule->getConditions();
        $formName = $this->getRequest()->getParam('form_namespace');
        // Combine class recursively sets jsFormObject so we don't need to
        $conditions->setJsFormObject($formName);
        // The Combine class doesn't need the data attribute on children but we do.
        $this->configureConditionsFormName($conditions, $formName);
        $result = $conditions->asHtmlRecursive();
        $this->getResponse()->setBody($result);
    }

    /**
     * Recursively set form name for data-form-part to be set on all conditions HTML
     *
     * @param Combine $conditions
     * @param string $formName
     * @return void
     */
    private function configureConditionsFormName(Combine $conditions, string $formName): void
    {
        $conditions->setFormName($formName);

        foreach ($conditions->getConditions() as $condition) {
            if ($condition instanceof Combine) {
                $this->configureConditionsFormName($condition, $formName);
            } else {
                $condition->setFormName($formName);
            }
        }
    }
}
