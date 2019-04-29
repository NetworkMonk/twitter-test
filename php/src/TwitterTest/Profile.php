<?php

namespace TwitterTest;

class Profile {
    private $requestHandler;

    public function __construct($requestHandler) {
        $this->requestHandler = $requestHandler;
    }

    public function getProfile($screenName) {
        $res = $this->requestHandler->get('users/show.json', [
            'screen_name' => $screenName,
        ]);

        return $res;
    }
}
