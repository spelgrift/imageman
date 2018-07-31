<?php require 'views/inc/header.php'; ?>

<div id="allPosts">
<?
foreach($this->posts as $post) {
	$this->postContent = $post['content'];
	require 'views/inc/blog/post.php';
}
?>
</div>



<? require 'views/inc/footer.php'; 