<?php

namespace Lugosium\Bundle\OVHVPSMonitorBundle\DependencyInjection;

use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\Config\FileLocator;
use Symfony\Component\HttpKernel\DependencyInjection\Extension;
use Symfony\Component\DependencyInjection\Loader;
use Symfony\Component\DependencyInjection\Exception\InvalidArgumentException;

/**
 * This is the class that loads and manages your bundle configuration
 *
 * To learn more see {@link http://symfony.com/doc/current/cookbook/bundles/extension.html}
 */
class LugosiumOVHVPSMonitorExtension extends Extension
{
    /**
     * mandatory properties in app/config/config.yml
     *
     * @access private
     * @var array
     */
    private $_mandatoryProperties = array('zone', 'AK', 'AS', 'CK');

    /**
     * {@inheritDoc}
     */
    public function load(array $configs, ContainerBuilder $container)
    {
        $configuration = new Configuration();
        $config = $this->processConfiguration($configuration, $configs);

        $this->_setContainerParameters($config, $container);

        $loader = new Loader\YamlFileLoader($container, new FileLocator(__DIR__.'/../Resources/config'));
        $loader->load('services.yml');
    }

    /**
     * _setContainerParameters
     *
     * @access private
     * @param ContainerBuilder $container
     * @return self
     */
    private function _setContainerParameters(array $config, ContainerBuilder $container)
    {
        if (empty($config['vps'])) {
            throw new \InvalidArgumentException('Config is missing.');
        }
        $paramsMissing = array_diff($this->_mandatoryProperties, array_keys($config['vps']));

        if (!empty($paramsMissing)) {
            throw new \InvalidArgumentException('Some parameters are missing.');
        }

        foreach ($config['vps'] as $key => $value) {
            $container->setParameter(sprintf('lugosium_ovhvps_monitor.vps.%s', $key), $value);
        }

        return $this;
    }
}
