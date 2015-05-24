<?php

/**
 * This file is part of the Lugosium Monitor Bundle
 *
 * (c) Lugosium <http://www.lugosium.com/>
 */

use Symfony\Component\DependencyInjection\Exception\InvalidArgumentException;

namespace Lugosium\Bundle\OVHVPSMonitorBundle\Model;

/**
 * @author Alban L. <contact@lugosium.com>
 */
class OvhVpsMonitor
{
    /**
     * OVH urls
     *
     * @access private
     * @var array
     */
    private $_ovhUrls = array(
        'EU' => 'https://eu.api.ovh.com/1.0',
        'CA' => 'https://ca.api.ovh.com/1.0'
    );

    /**
     * Zone to use
     *
     * @access private
     * @var string
     */
    protected $_zone;

    /**
     * Application key
     *
     * @access private
     * @var string
     */
    protected $_ak;

    /**
     * Secret application key
     *
     * @access private
     * @var string
     */
    protected $_as;

    /**
     * Consumer key (the token)
     *
     * @access private
     * @var string
     */
    protected $_ck;

    /**
     * Time drift
     *
     * @access protected
     * @var integer
     */
    protected $_timeDrift;

    /**
     * __construct
     *
     * @access public
     * @return void
     */
    public function __construct($zone, $ak, $as, $ck)
    {
        $this->setZone($zone)
             ->setAk($ak)
             ->setAs($as)
             ->setCk($ck);
    }

    /**
     * setZone
     *
     * @access public
     * @param string $zone
     * @return self
     */
    public function setZone($zone)
    {
        $this->_zone = (string) $zone;

        return $this;
    }

    /**
     * getZone
     *
     * @access public
     * @return string
     */
    public function getZone()
    {
        return $this->_zone;
    }

    /**
     * setAk
     *
     * @access public
     * @param string $ak
     * @return self
     */
    public function setAk($ak)
    {
        $this->_ak = (string) $ak;

        return $this;
    }

    /**
     * getAk
     *
     * @access public
     * @return string
     */
    public function getAk()
    {
        return $this->_ak;
    }

    /**
     * setAs
     *
     * @access public
     * @param string $as
     * @return self
     */
    public function setAs($as)
    {
        $this->_as = (string) $as;

        return $this;
    }

    /**
     * getAs
     *
     * @access public
     * @return string
     */
    public function getAs()
    {
        return $this->_as;
    }

    /**
     * setCk
     *
     * @access public
     * @param string $ck
     * @return self
     */
    public function setCk($ck)
    {
        $this->_ck = (string) $ck;

        return $this;
    }

    /**
     * getCk
     *
     * @access public
     * @return string
     */
    public function getCk()
    {
        return $this->_ck;
    }

    /**
     * getTimeDrift
     *
     * @access public
     * @return integer
     */
    public function getTimeDrift()
    {
        static $timeDrift = null;

        if ($timeDrift === null) {
            $url = sprintf('%s/auth/time', $this->_ovhUrls[$this->_zone]);
            $ovhServerTime = file_get_contents($url);

            if ($ovhServerTime != false) {
                $timeDrift = time() - $ovhServerTime;
            }
        }

        return $timeDrift;
    }

    /**
     * _call
     *
     * @access private
     * @param string $method
     * @param string $url
     * @param string $body
     * @return array
     */
    private function _call($method, $url, $body = '')
    {
        if (!is_string($url)) {
            throw new \InvalidArgumentException('URL must be type string');
        }
        $result = array();
        $url = $this->_ovhUrls[$this->_zone] . $url;

        if (!empty($body)) {
            $body = json_encode($body);
        }
        $time = time() - $this->_timeDrift;
        $result = $this->_getResult($method, $url, $time, $body);

        return !empty($result) ? $result : array();
    }

    /**
     * get
     *
     * @access public
     * @param string $url
     * @return array
     */
    public function get($url)
    {
        return $this->_call('GET', $url);
    }

    /**
     * _getSignature
     *
     * @access private
     * @param string $method
     * @param string $url
     * @param string $body
     * @return string
     */
    private function _getSignature($method, $url, $time, $body = '')
    {
        // Compute signature
        $toSign = $this->_as . '+' . $this->_ck . '+' . $method . '+' . $url . '+' . $body . '+' . $time;
        $signature = '$1$' . sha1($toSign);

        return $signature;
    }

    /**
     * _getResult
     *
     * @access private
     * @param string $url
     * @param string $method
     * @param string $signature
     * @return array
     * @throws
     */
    private function _getResult($method, $url, $time, $body = '')
    {
        $signature = $this->_getSignature($method, $url, $time, $body);

        // Call
        $curl = curl_init($url);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($curl, CURLOPT_CUSTOMREQUEST, $method);
        curl_setopt($curl, CURLOPT_HTTPHEADER, array(
            'Content-Type:application/json',
            'X-Ovh-Application:' . $this->_ak,
            'X-Ovh-Consumer:' . $this->_ck,
            'X-Ovh-Signature:' . $signature,
            'X-Ovh-Timestamp:' . $time,
        ));

        if ($body) {
            curl_setopt($curl, CURLOPT_POSTFIELDS, $body);
        }
        $result = curl_exec($curl);

        if ($result != false) {
            $result = json_decode($result, true);
        } else {
            $result = array('message' => curl_error($curl));
        }

        return $result;
    }

    /**
     * getVps
     *
     * @access public
     * @return array
     */
    public function getVps($params = array())
    {
        $vps = $this->get('/vps');

        return $vps;
    }

    /**
     * getVpsMonitorData
     *
     * @access public
     * @param string $vpsServiceName
     * @return array
     */
    public function getVpsMonitorData($params = array())
    {
        $types = array(
            array('mem:max', 'mem:used'),
            array('cpu:max', 'cpu:used'),
            array('net:rx', 'net:tx')
        );
        $period = 'today';

        if (isset($params['period'])
            && in_array($params['period'], array('today', 'lastday', 'lastweek', 'lastmonth', 'lastyear'))
        ) {
            $period = $params['period'];
        }

        foreach ($types as $type) {
            $keyMax = $type[0];
            $keyUsed = $type[1];

            $vpsMonitorData[$keyMax] = $this->get(
                sprintf('/vps/%s/monitoring?%s',
                    $params['vpsName'],
                    http_build_query(array('period' => $period, 'type' => $keyMax))
                )
            );

            $vpsMonitorData[$keyUsed] = $this->get(
                sprintf('/vps/%s/monitoring?%s',
                    $params['vpsName'],
                    http_build_query(array('period' => $period, 'type' => $keyUsed))
                )
            );
        }
        $this->_cleanMemoryArray($vpsMonitorData);

        return $vpsMonitorData;
    }

    /**
     * _cleanMemoryArray
     *
     * @access private
     * @param array $vpsMonitorData
     * @return void
     */
    private function _cleanMemoryArray(array &$vpsMonitorData)
    {
        $maxmemory = 0;

        foreach ($vpsMonitorData as $indexType => &$dataArray) {

            foreach ($dataArray['values'] as $index => &$arrayData) {

                if (empty($arrayData['value'])) {
                    unset($dataArray['values'][$index]);

                    continue;
                }
                $arrayData['timestamp'] *= 1000;
                $arrayData = array_values($arrayData);
            }
            $vpsMonitorData[$indexType]['values'] = array_values($dataArray['values']);
        }
    }
}

