<?php
// $start = microtime(true);
require 'config.php';
function __autoload($class){
	require LIBS . $class. ".php";
}
$bootstrap =  new Bootstrap();
$bootstrap->init();
// echo microtime(true) - $start;