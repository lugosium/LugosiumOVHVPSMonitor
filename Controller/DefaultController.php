<?php

namespace Lugosium\Bundle\OVHVPSMonitorBundle\Controller;

use Symfony\Component\DependencyInjection\ContainerAware;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\HttpFoundation\Response;

/**
 * @Route("/lugosium/monitor")
 */
class DefaultController extends ContainerAware
{
    /**
     * indexAction
     *
     * @access public
     * @return array
     * @Route("/")
     * @Template()
     */
    public function indexAction()
    {
        $ovhVpsMonitor = $this->container->get('lugosium_ovhvps_monitor.ovhVpsMonitor');
        $vps = $ovhVpsMonitor->getVps();
        $result = array();

        if (!empty($vps)) {
            $vpsSelectParams = array(
                'choices' => $vps,
                'label' => false
            );
            $form = $this->container->get('form.factory')->createBuilder('form', array('vps' => 0))
                                                         ->setAttribute('label', false)
                                                         ->add('vps', 'choice', $vpsSelectParams);
            $result = array('form' => $form->getForm()->createView());
        }

        return $result;
    }
}

