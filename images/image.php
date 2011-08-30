<?php

/**
 * finalize an image
 * 
 * 
 * 
 * @author sprky0
 * @package jigglewriter
 */

include("config.php");

// Do we have a session?

if (!isset($_GET['s'])) {
	header("HTTP/1.1 406");
	echo json_encode(false);
	exit();
}

// We do!  Great, let's use it!

$session_token = $_GET['s'];

// Did we create this one already?

if (is_file("complete/{$session_token}.jpg")) {
	header("HTTP/1.1 302");
	header("Location: complete/{$session_token}.jpg");
}

// Do we have an open batch for this one?

if (!is_dir(TEMPORARY_STORAGE . $session_token)) {
	header("HTTP/1.1 404");
	echo json_encode(false);
	exit();
}

$disallowed = array(".","..");
$dir = opendir(TEMPORARY_STORAGE . "{$session_token}");
$chunks = array();

$width = 0;
$height = 0;

while($cur = readdir($dir)) {

	if (!in_array($cur,$disallowed) && strstr($cur,".png")) {

		$meta = explode("_",substr($cur,0,-4));

		$chunk = new stdClass();

		$chunk->file = $cur;
		$chunk->image = imagecreatefrompng(TEMPORARY_STORAGE . "{$session_token}/{$cur}");

		// grid position
		$chunk->a = (int) $meta[0];
		$chunk->b = (int) $meta[1];

		// pixel position
		$chunk->x = (int) $meta[2];
		$chunk->y = (int) $meta[3];
		
		// image width / height
		$chunk->w = (int) $meta[4];
		$chunk->h = (int) $meta[5];

		$chunks[] = $chunk;

		// increment master width / height
		if ($chunk->b == 0)
			$width += $chunk->w;

		if ($chunk->a == 0)
			$height += $chunk->h;

	}

}

closedir($dir);

$i = imagecreatetruecolor($width,$height);

imagealphablending($i, true);

$white = imagecolorallocate($i, 255, 255, 255);

imagefilltoborder($i, 0, 0, $white, $white);

// join images!
for($c = 0; $c < count($chunks); $c++) {
	imagecopy($i, $chunks[$c]->image, $chunks[$c]->x, $chunks[$c]->y, 0, 0, $chunks[$c]->w, $chunks[$c]->h);
	// imagecopymerge($i, $chunks[$c]->image, $chunks[$c]-x, $chunks[$c]-y, 0, 0, $chunks[$c]->w, $chunks[$c]->h, 2);
}

// Output image + thumbs:

imagejpeg($i, "complete/{$session_token}.jpg", 95);


// create a thumbnail

$i2 = imagecreatetruecolor(320,240);

imagecopyresampled ($i2, $i, 0, 0, 0, 0, 320, 240, $width, $height);
// imagecopyresampled ( resource $dst_image , resource $src_image , int $dst_x , int $dst_y , int $src_x , int $src_y , int $dst_w , int $dst_h , int $src_w , int $src_h )

imagejpeg($i2, "complete/{$session_token}t.jpg", 50);


imagedestroy($i);
imagedestroy($i2);

// make a thumbnail too!
// also delete the cached bits


// We've created the full size images now.  Clear out the temporary stuff:
for($c = 0; $c < count($chunks); $c++)
	unlink( TEMPORARY_STORAGE . "{$session_token}/{$chunks[$c]->file}" );

unset($chunks);

// delete the session directory
rmdir( TEMPORARY_STORAGE . $session_token);



// Last up - redirect to the location of the large image!

header("HTTP/1.1 302");
// header("Content-type: image/png");
// header("Content-Disposition: attachment; filename=\"{$session_token}.png\"");
header("Location: complete/{$session_token}.jpg");



