var $ = require('jquery');
var Mustache = require('../libs/mustache.min.js');
var Dropzone = require('../libs/dropzone.js');
var _ = require('./utilityFunctions.js'); // helper functions
$(function() {
/*
*
* CACHE DOM
*
*/
	var $contentArea = $('#contentArea'),
	$singleImgSettingsModal = $('#singleImgSettingsModal'),
	singleImgDZTemplate = $('#updateSingleImgDZTemplate').html(),
	$urlInput = $singleImgSettingsModal.find('#inputSingleImgURL'),
	$saveButton = $singleImgSettingsModal.find('#saveSingleImgSettings'),
	$urlMsg = $singleImgSettingsModal.find('#singleImgURLMsg'),
	$dzMsg = $singleImgSettingsModal.find('#updateSingleImgMsg'),
	origURL,
	$thisBlock,
	pageURL = _.getURL();

/*
*
* BIND EVENTS
*
*/
	$contentArea.on('click', '.singleImageSettings', loadSettingsModal);	
	$saveButton.click(saveSettings);

/*
 *
 * CORE FUNCTIONS
 *
 */
 	function saveSettings(ev) {
 		ev.preventDefault();
 		// Get user input/target contentID
 		var contentID = $(this).attr('data-id'),
 		data = {
 			url : $urlInput.val()
 		};
 		// Check if url is different from original
 		if(data.url != origURL) {
 			// Update database
 			var url = pageURL + '/updateSingleImgURL/' + contentID;
 			_.post(url, data, saveSuccess, saveError);
 		} else {
 			// If no new cover image return...
 			if($updateSingleImgDropzone.files.length < 1) {
				$singleImgSettingsModal.modal('hide');
				return;
			}
			// ...otherwise, process Dropzone queue
 			$updateSingleImgDropzone.processQueue();
 		}
 	}

 	function saveSuccess(data) {
		// Update image url
		updateImgURL(data.url);
		// If no new cover image return
		if($updateSingleImgDropzone.files.length === 0) {
			$singleImgSettingsModal.modal('hide');
			return;
		}
		// Process Dropzone queue
		$updateSingleImgDropzone.processQueue();
 	}

 	function saveError(data) {
 		_.error('Unknown error', $urlMsg, $urlInput);
 	}

 	function updateImgURL(url) {
 		var $img = $thisBlock.find('img');
 		if($img.parent().attr('href') === undefined){
 			if(url.length > 0){
 				$img.wrap("<a href='" + url + "'></a>");
 			}
 		} else {
 			if(url.length > 0) {
 				$img.parent().attr('href', url);
 			} else {
 				$img.unwrap();
 			}
 		}
 	}

 	function dzSuccess(file, data) {
 		data = JSON.parse(data);
		if(!data.error) { // Success!
			// Get image element from this block
			var $img = $thisBlock.find('img');
			// Replace src with new image
			$img.attr('src', baseURL+data.results.lgVersion);
			// Hide modal
			$singleImgSettingsModal.modal('hide');
		} else { // Error!		
			$updateSingleImgDropzone.emit("error", file, data.error_msg);
		}
 	}

 	function loadSettingsModal(ev) {
 		ev.preventDefault();
 		$thisBlock = $(this).closest('.contentItem');
 		var contentID = $thisBlock.find('.contentControlMenu').attr('id'),
 		$img = $thisBlock.find('img'),
 		url;
 		if($img.parent().attr('href') === undefined){
 			url = "";
 		} else {
 			url = $img.parent().attr('href');
 		}
 		origURL = url;

 		$updateSingleImgDropzone.options.url = pageURL + '/updateSingleImg/' + contentID;

 		$saveButton.attr('data-id', contentID);
 		$urlInput.val(url);

 		$singleImgSettingsModal.modal('show');
 	}

/**
 * 
 * COVER DROPZONE
 * 
 */
	Dropzone.autoDiscover = false;

	var $updateSingleImgDropzone = new Dropzone('div.updateSingleImgDropzone', {
		url : pageURL + '/updateSingleImg',
		autoProcessQueue : false,
		maxFiles : 1,
		maxFilesize : 5,
		thumbnailWidth : 125,
		thumbnailHeight : 125,
		previewTemplate : singleImgDZTemplate,
		dictDefaultMessage : "Drop file here to replace image"
	});

	// Remove file if more than 1 added
	$updateSingleImgDropzone.on("maxfilesexceeded", function(file) {
		this.removeFile(file);
	});

	// Remove files when modal closed
	$singleImgSettingsModal.on('hidden.bs.modal', function() {
		$updateSingleImgDropzone.removeAllFiles();
	});

	// Handle Dropzone success
	$updateSingleImgDropzone.on("success", dzSuccess);

/**
 * 
 * HELPER FUNCTIONS
 * 
 */
	function clearMsg(selector, timeout) {
		if (timeout === undefined) {
			timeout = 4000;
		}
		setTimeout(function(){
			selector.fadeOut('slow', function() {
				selector.html('');
				selector.show();
			});
		}, timeout);
	}

});