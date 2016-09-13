<ul class='contentControlMenu' <?php echo "id='$contentID' data-id='$ID'"; ?>>
<?
	switch($type) {
		case 'page':
			echo "<li><a class='shortcutSettings' data-id='$contentID' data-type='$type' href='#'><i class='fa fa-cog'></i></a></li>";
			break;
		case 'gallery':
			echo "<li><a href='$path/edit'><i class='fa fa-cog'></i></a></li>";
			break;
		case 'video':
			echo "<li><a class='shortcutSettings' data-id='$contentID' data-type='video' href='#'><i class='fa fa-cog'></i></a></li>";
			break;
	}
?>
	<li><a class='resizeContent' href='#'><i class="fa fa-arrows-h"></i></a></li>
	<li><a class='trashContent' href='#'><i class='fa fa-fw fa-trash'></i></a></li>
	<li class='handle'><i class="fa fa-plus"></i></li>
</ul>