<?php

namespace Lugosium\Bundle\OVHVPSMonitorBundle\DependencyInjection;

use Symfony\Component\Config\Definition\Builder\TreeBuilder;
use Symfony\Component\Config\Definition\Builder\ArrayNodeDefinition;
use Symfony\Component\Config\Definition\ConfigurationInterface;

/**
 * This is the class that validates and merges configuration from your app/config files
 *
 * To learn more see {@link http://symfony.com/doc/current/cookbook/bundles/extension.html#cookbook-bundles-extension-config-class}
 */
class Configuration implements ConfigurationInterface
{
    /**
     * {@inheritDoc}
     */
    public function getConfigTreeBuilder()
    {
        $treeBuilder = new TreeBuilder();
        $rootNode = $treeBuilder->root('lugosium_ovhvps_monitor');

        $this->_setGlobalParameters($rootNode);

        return $treeBuilder;
    }

    /**
     * _setGlobalParameters
     *
     * @access private
     * @param ArrayNodeDefinition $rootNode
     * @return self
     */
    private function _setGlobalParameters(ArrayNodeDefinition $rootNode)
    {
        $rootNode
            ->children()
                ->arrayNode('vps')
                    ->isRequired()
                    ->children()
                        ->enumNode('zone')
                            ->isRequired()
                            ->cannotBeEmpty()
                            ->values(array('EU', 'CA'))
                            ->info('Zone to use for API requests.')
                        ->end()
                        ->scalarNode('AK')
                            ->isRequired()
                            ->cannotBeEmpty()
                            ->info('Application Key')
                        ->end()
                        ->scalarNode('AS')
                            ->isRequired()
                            ->cannotBeEmpty()
                            ->info('Secret Application Key')
                        ->end()
                        ->scalarNode('CK')
                            ->isRequired()
                            ->cannotBeEmpty()
                            ->info('Consumer Key (the token)')
                        ->end()
                    ->end()
                ->end()
            ->end()
        ->end();

        return $this;
    }
}
