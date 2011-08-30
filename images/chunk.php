<?php

/**
 * create a file via a chunk recieved from the harvester object
 * 
 * @author sprky0
 * @package jigglewriter
 */

// Load configuration file
include("config.php");

$required = array('a','b','x','y','w','h','i','s');

foreach($required as $k) {
	if (!isset($_POST[$k])) {
		// bad parameters
		header("HTTP/1.1 406");
		echo json_encode(false);
		exit();	
	}
}

$image_base64 = substr($_POST['i'],strpos($_POST['i'],",")+1);
$image_data = base64_decode( $image_base64 );
$file_name = "{$_POST['a']}_{$_POST['b']}_{$_POST['x']}_{$_POST['y']}_{$_POST['w']}_{$_POST['h']}.png";

file_put_contents(TEMPORARY_STORAGE . "{$_POST['s']}/{$file_name}", $image_data );

echo json_encode(true);
