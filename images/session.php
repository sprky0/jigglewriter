<?php

/**
 * create "session" storage and return the associated key
 * 
 * session token is created via a md5 hash of the user's IP + time.
 * config is required to specify the temporary storage location.
 * 
 * @author sprky0
 * @package jigglewriter
 */
include("config.php");

$salt = "jigglewriter"; // (defined("SALT")) ? SALT : "jigglewriter"
$key = $_SERVER['REMOTE_ADDR'] . time() . "_" . microtime();
$session = md5("{$key}_{$salt}");

if (!is_dir(TEMPORARY_STORAGE . "{$session}")) {
	mkdir(TEMPORARY_STORAGE . "{$session}");
}

echo json_encode($session);
