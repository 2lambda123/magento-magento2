<?php
/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */
declare(strict_types=1);

namespace Magento\Captcha\Test\Unit\Model\Filter;

use Magento\Framework\TestFramework\Unit\Helper\ObjectManager;
use PHPUnit\Framework\TestCase;
use Magento\Captcha\Api\CaptchaConfigFilterInterface;
use Magento\Captcha\Model\Filter\CaptchaConfigFilterComposite;
use PHPUnit\Framework\MockObject\MockObject;

/**
 * Test for Class \Magento\Captcha\Model\Filter\CaptchaConfigFilterComposite
 */
class CaptchaConfigFilterCompositeTest extends TestCase
{
    /**
     * @var CaptchaConfigFilterComposite
     */
    private $model;

    /**
     * @var ObjectManager
     */
    private $objectManager;

    /**
     * @var MockObject
     */
    private $filterMock1;

    /**
     * @var MockObject
     */
    private $filterMock2;

    /**
     * Initialize Class Dependencies
     */
    protected function setUp(): void
    {
        $this->objectManager = new ObjectManager($this);

        $this->filterMock1 = $this->getMockBuilder(CaptchaConfigFilterInterface::class)
            ->disableOriginalConstructor()
            ->setMethods(['filter'])
            ->getMock();
        $this->filterMock2 = $this->getMockBuilder(CaptchaConfigFilterInterface::class)
            ->disableOriginalConstructor()
            ->setMethods(['filter'])
            ->getMock();

        $filterList = [$this->filterMock1, $this->filterMock2];

        $this->model = $this->objectManager->getObject(
            CaptchaConfigFilterComposite::class,
            [
                'filters' => $filterList,
            ]
        );
    }

    /**
     * Test for Composite
     *
     * @return void
     */
    public function testFilter(): void
    {
        $config = ['test1','test2', 'test3'];

        $this->filterMock1->expects($this->atLeastOnce())
            ->method('filter')
            ->with($config)
            ->willReturn(['test1', 'test2']);
        $this->filterMock2->expects($this->atLeastOnce())
            ->method('filter')
            ->with($config)
            ->willReturn(['test3']);

        $this->assertEquals(['test1','test2', 'test3'], $this->model->filter($config));
    }
}
