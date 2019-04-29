<?php

require_once('../config.php');

$jsonResult = [];

$request = new TwitterTest\Request($config);
$profile = new TwitterTest\Profile($request);

$screen_name = '';
if (isset($_GET['screen_name'])) {
    $screen_name = $_GET['screen_name'];
}

$result = $profile->getProfile($screen_name);
if ($result === false) {
    $jsonResult['status'] = 'Failed to get profile data';
    echo json_encode($jsonResult);
    exit();
}

$jsonResult['result'] = $result;
$jsonResult['status'] = 'success';
echo json_encode($jsonResult);
exit();
