<?php

namespace Lugosium\Bundle\OVHVPSMonitorBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;

/**
 * @Route("/lugosium/monitor")
 */
class DefaultController extends Controller
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
                'choices' => array_flip($vps),
                'label' => false
            );
            $form = $this->createFormBuilder(array('vps' => 0))
                         ->setAttribute('label', false)
                         ->add('vps', ChoiceType::class, $vpsSelectParams);
            $result = array('form' => $form->getForm()->createView());
        }

        return $result;
    }
}
