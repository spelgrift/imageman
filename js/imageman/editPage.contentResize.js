var $ = require('jquery');
var _ = require('./utilityFunctions.js'); // helper functions
require('./editPage.blockResize.js');


$(function() {

	/*
	 *
	 * CACHE DOM
	 *
	 */

	var $contentArea 	= $('#contentArea'),
	$contentItems 		= $contentArea.find('.contentItem'),
	$thisBlock, 		// Stores reference to active block when modal is open
	startingClasses,	// Stores initial classes when modal is first opened
	$editClassModal 	= $('#editBSclassModal'),
	$classInput 		= $editClassModal.find('#inputBSclasses'),
	$classMsg 			= $editClassModal.find('#BSclassMsg'),
	$saveBSclass 		= $editClassModal.find('#saveBSclass'),
	$editVisModal 		= $('#editVisibilityModal'),
	$checkboxes			= $editVisModal.find(':checkbox'),
	$hiddenMobile 		= $editVisModal.find('#hiddenMobileCheck'),
	$hiddenDesktop 	= $editVisModal.find('#hiddenDesktopCheck'),
	$visMsg 				= $editVisModal.find('#visibilityMsg'),
	$saveVis 			= $editVisModal.find('#saveVisibility');

	/*
	 *
	 * INIT BLOCK RESIZE
	 *
	 */

	// existing content items
	$contentItems.each(function(){
		$(this).blockResize();
	});
	// new content when added
	events.on('contentAdded', function(){
		$contentArea.find('.contentItem').first().blockResize();
	});

	/*
	 *
	 * BIND EVENTS
	 *
	 */

	$contentArea.on('click', '.advancedBootstrap', showEditClassModal);
	$saveBSclass.click(saveClasses);

	$contentArea.on('click', '.blockVisibility', showVisModal);
	$checkboxes.change(handleChecks);
	$saveVis.click(saveVis);

	/*
	 *
	 * CORE FUNCTIONS
	 *
	 */

	function showEditClassModal(){
		$thisBlock = $(this).closest('.contentItem');
		startingClasses = $thisBlock.blockResize().getClasses();
		$classInput.val(startingClasses);
		$editClassModal.modal('show');
	}

	function saveClasses(){
		var newClasses = $classInput.val();
		$thisBlock.blockResize().setClasses(newClasses);
		$thisBlock.blockResize().saveResize();
		$editClassModal.modal('hide');
	}

	function showVisModal(){
		$thisBlock = $(this).closest('.contentItem');
		startingClasses = $thisBlock.blockResize().getClasses();
		if(startingClasses.indexOf('hidden-xs') === -1){
			$hiddenMobile.prop("checked", false);
		} else {
			$hiddenMobile.prop("checked", true);
		}
		if(startingClasses.indexOf('visible-xs-block') === -1){
			$hiddenDesktop.prop("checked", false);
		} else {
			$hiddenDesktop.prop("checked", true);
		}
		$editVisModal.modal('show');
	}

	function handleChecks(){
		var $thisCheck = $(this),
		$otherCheck;
		if($thisCheck.attr('id') == 'hiddenMobileCheck'){
			$otherCheck = $hiddenDesktop;
		} else {
			$otherCheck = $hiddenMobile;
		}
		// If other box is checked when user checks this one, uncheck the other
		if($thisCheck.is(':checked') && $otherCheck.is(':checked')){
			$otherCheck.prop("checked", false);
		}
		var resizeWarning = 'Warning: Block will disappear if you hit save. Resize your browser window to see/edit again.';
		if($hiddenDesktop.is(':checked') && window.innerWidth > 768){
			_.error(resizeWarning, $visMsg);
		}

		if($hiddenMobile.is(':checked') && window.innerWidth < 768){
			_.error(resizeWarning, $visMsg);
		}
	}

	function saveVis(){
		var hiddenClass = "";
		if($hiddenDesktop.is(':checked')){
			hiddenClass = "visible-xs-block";
		} else {
			startingClasses = startingClasses.replace("visible-xs-block", '');
		}
		if($hiddenMobile.is(':checked')){
			hiddenClass = 'hidden-xs';
		} else {
			startingClasses = startingClasses.replace("hidden-xs", '');
		}
		newClasses = startingClasses+" "+hiddenClass;
		$thisBlock.blockResize().setClasses(newClasses);
		$thisBlock.blockResize().saveResize();
		$editVisModal.modal('hide');
	}
});