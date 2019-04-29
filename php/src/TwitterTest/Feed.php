<?php

namespace TwitterTest;

class Feed {
    private $requestHandler;

    public function __construct($requestHandler) {
        $this->requestHandler = $requestHandler;
    }

    public function getTweets($screenName, $since=0, $max=0, $count=20) {
        $data = [];
        $data['screen_name'] = $screenName;
        $data['count'] = $count;
        $data['exclude_replies'] = 'true';
        $data['trim_user'] = 'true';
        if ($since > 0) {
            $data['since_id'] = $since;
        }
        if ($max > 0) {
            $data['max_id'] = $max;
        }

        $res = $this->requestHandler->get('statuses/user_timeline.json', $data);
        return $res;
    }
}
