<?php

require_once('../config.php');

$jsonResult = [];

$request = new TwitterTest\Request($config);
$feed = new TwitterTest\Feed($request);

$screen_name = '';
$since = 0;
$max = 0;
$count = 20;
if (isset($_GET['screen_name'])) {
    $screen_name = $_GET['screen_name'];
}
if (isset($_GET['since'])) {
    $since = intval($_GET['since']);
}
if (isset($_GET['count'])) {
    $count = intval($_GET['count']);
}
if (isset($_GET['max'])) {
    $max = intval($_GET['max']);
}

$result = $feed->getTweets($screen_name, $since, $max, $count);

$jsonResult['result'] = $result;
$jsonResult['status'] = 'success';
echo json_encode($jsonResult);
exit();
