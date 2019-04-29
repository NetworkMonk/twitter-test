<?php

namespace TwitterTest;

class Request {
    private $authToken;
    private $apiPath;
    private $apiKey;
    private $bearerToken;

    public function __construct($config) {
        $this->authToken = '';
        $this->apiPath = '';
        $this->apiKey = '';
        $this->bearerToken = '';

        if (isset($config['authToken'])) {
            $this->authToken = $config['authToken'];
        }
        if (isset($config['apiPath'])) {
            $this->apiPath = $config['apiPath'];
        }
        if (isset($config['apiKey'])) {
            $this->apiKey = $config['apiKey'];
        }
        if (isset($config['bearerToken'])) {
            $this->bearerToken = $config['bearerToken'];
        }
    }

    public function serialize($data) {
        $parts = [];
        foreach ($data as $key => $value) {
            $parts[] = urlencode($key) . '=' . urlencode($value);
        }
        return join('&', $parts);
    }

    public function get($path, $data) {
        $fullPath = $this->apiPath . $path . '?' . $this->serialize($data);

        $req = curl_init($fullPath);
        curl_setopt($req, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($req, CURLOPT_HTTPHEADER, array('Authorization: Bearer '. $this->bearerToken));
        $res = curl_exec($req);
        $code = curl_getinfo($req, CURLINFO_HTTP_CODE);
        curl_close($req);

        if (!$res) {
            return false;
        }

        if ($code === 200) {
            return json_decode($res);
        } else {
            return false;
        }
    }
}