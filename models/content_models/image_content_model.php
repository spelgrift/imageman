<?php

class Image_Content_Model extends Content_Model {

	function __construct(){parent::__construct();}

	// Add Single Image
	public function addSingleImage($parentPageID, $parentUrl, $type = 'page')
	{
		if(!$image = $this->_saveOriginalImage($_FILES)) {
			return false;
		}

		// Advance positions of existing content
		$home = $parentPageID === 0 ? 1 : 0;
		$this->_advanceContentPositions($parentPageID, $home, $type);

		$original = $image['original'];
		$fileName = $image['fileName'];
		$fileExt = $image['fileExt'];

		// Resize to display versions
		$baseName = $parentUrl . "_" . date("Ymd-his") . "_";
		$smVersion = UPLOADS . $baseName . "sm." . $fileExt;
		$lgVersion = UPLOADS . $baseName . "lg." . $fileExt;

		Image::makeDisplayImgs($original, $smVersion, $lgVersion);

		// Get orientation and set bootstrap value accordingly
		$orientation = Image::getOrientation($original);
		if($orientation == 'portrait' || $orientation == 'square') {
			$bootstrap = 'col-xs-12 col-sm-6';
			if($type === 'post'){
				$bootstrap = 'col-xs-12 col-sm-4';
			}
		} else {
			$bootstrap = 'col-xs-12';
		}

		// Content DB Entry
		$typeID = "parent".ucfirst($type)."ID";
		$this->db->insert('content', array(
			'type' => 'singleImage',
			$typeID => $parentPageID,
			'frontpage' => $home,
			'author' => $_SESSION['login'],
			'bootstrap' => $bootstrap
		));
		$contentID = $this->db->lastInsertId();

		// Single Image DB Entry
		$this->db->insert('singleImage', array(
			'contentID' => $contentID,
			'name' => $fileName,
			'original' => $original,
			'smVersion' => $smVersion,
			'lgVersion' => $lgVersion,
			'orientation' => $orientation
		));
		$singleImageID = $this->db->lastInsertId();

		// Success!
		$results = array(
			'error' => false,
			'results' => array(
				'contentID' => $contentID,
				'singleImageID' => $singleImageID,
				'bootstrap' => $bootstrap,
				'smVersion' => $smVersion,
				'lgVersion' => $lgVersion
			)
		);
		echo json_encode($results);	
	}

	// Replace image
	public function updateSingleImage($contentID, $filename)
	{
		if(!$image = $this->_saveOriginalImage($_FILES)) {
			return false;
		}
		// Delete old image display versions
		$this->_deleteSingleImgFiles($contentID);

		$original = $image['original'];
		$fileName = $image['fileName'];
		$fileExt = $image['fileExt'];

		// Resize to display versions
		$baseName = $filename . "_" . date("Ymd-his") . "_";
		$smVersion = UPLOADS . $baseName . "sm." . $fileExt;
		$lgVersion = UPLOADS . $baseName . "lg." . $fileExt;
		Image::makeDisplayImgs($original, $smVersion, $lgVersion);
		// Get orientation 
		$orientation = Image::getOrientation($original);
		// Update DB
		$this->db->update('singleImage', array(
			'original' => $original,
			'smVersion' => $smVersion,
			'lgVersion' => $lgVersion,
			'orientation' => $orientation
		), "`contentID` = ".$contentID);
		$results = array(
			'error' => false,
			'results' => array(
				'lgVersion' => $lgVersion
			)
		);
		echo json_encode($results);
	}

	// Update image URL
	public function updateURL($contentID)
	{
		$this->db->update('singleImage', array('singleImageURL' => $_POST['url']), "`contentID` = ".$contentID);
		echo json_encode(array(
			'error' => false,
			'url' => $_POST['url']
		));
	}
}