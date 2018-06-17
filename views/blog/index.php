<?php 

require 'views/inc/header.php'; 

// echo "<pre>";
// print_r($this->posts);
// echo "</pre>";

foreach($this->posts as $post) {
	$this->postContent = $post['content'];
	require 'views/inc/blog/post.php';
}

require 'views/inc/footer.php'; 