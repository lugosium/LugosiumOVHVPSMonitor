<?php

namespace Lugosium\Bundle\OVHVPSMonitorBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;

class DefaultController extends Controller
{
    /**
     * @Route("/lugosium/monitor")
     */
    public function indexAction()
    {
        $ovhVpsMonitor = $this->container->get('lugosium_ovhvps_monitor.ovhVpsMonitor');
        $vps = $ovhVpsMonitor->getVps();
        $result = array();

        if (!empty($vps)) {
            $vpsSelectParams = array(
                'choices' => array_flip($vps),
                'choices_as_values' => true,
                'label' => false
            );
            $form = $this->createFormBuilder(array('vps' => 0))
                         ->setAttribute('label', false)
                         ->add('vps', ChoiceType::class, $vpsSelectParams);
        }

        return $this->render(
            'LugosiumOVHVPSMonitorBundle:Default:index.html.twig',
            array('form' => $form->getForm()->createView())
        );
    }
}
