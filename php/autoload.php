<?php

spl_autoload_register(function($class) {
    $file = dirname(__FILE__) . '/src/' . str_replace('\\', DIRECTORY_SEPARATOR, $class).'.php';
    if (file_exists($file)) {
        require_once($file);
    }
});
