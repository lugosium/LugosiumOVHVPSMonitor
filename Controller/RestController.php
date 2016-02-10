<?php

namespace Lugosium\Bundle\OVHVPSMonitorBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpFoundation\Response;

class RestController extends Controller
{
    /**
     * @Route("/lugosium/monitor/rest/{model}/{method}/{params}", requirements={"model" = "[\w]+", "method" = "[\w]+", "params" = "^{.*}$"})
     */
    public function restAction($model, $method, $params = '{}')
    {
        $params = json_decode($params, true);
        $ovhVpsMonitor = $this->container->get('lugosium_ovhvps_monitor.ovhVpsMonitor');

        if (empty($params['vpsName'])) {
            throw new \InvalidArgumentException('You must provide a VPS name.');
        } else if (!preg_match('/^[\w\.]+$/', $params['vpsName'])) {
            throw new \InvalidArgumentException('VPS name is not valid.');
        } else if (!in_array($params['vpsName'], $ovhVpsMonitor->getVps())) {
            throw new \UnexpectedValueException('VPS not found.');
        } else if (!$this->container->has('lugosium_ovhvps_monitor.' . $model)) {
            throw new \InvalidArgumentException('Model does not exist');
        }

        if ($model != 'ovhVpsMonitor') {

            if ($this->container->has('lugosium_ovhvps_monitor.' . $model)) {
                $model = $this->container->get('lugosium_ovhvps_monitor.' . $model);
            } else {
                throw new \UnexpectedValueException('Model does not exist...');
            }
        } else {
            $model = $ovhVpsMonitor;
        }

        if (!method_exists($model, $method)) {
            throw new \UnexpectedValueException('Method does not exist...');
        }
        $data = $model->$method($params);
        $response = new Response(json_encode($data));
        $response->headers->set('Content-Type', 'application/json');

        return $response;
    }
}

