var jQuery = require('jquery');
var _ = require('./utilityFunctions.js'); // helper functions
require('../libs/encapsulatedPlugin');

(function($) {

	// PLUGIN DEFINITION
	var blockResize = function(element, options)
	{
		// Set up plugin vars
		var $thisBlock = $(element),
		obj = this,
		defaults = {
			saveURL : baseURL + "page",
			minColWidth : 3,
			defaultBootstrap : ['col-xs-12'],
			otherClasses : ['contentItem', 'editContent'],
			resizeControlsHeight : '198px'
		},
		settings = $.extend(defaults, options || {});

		/*
		 *
		 * CACHE DOM
		 *
		 */

		// THIS BLOCK
		var $content 		= $thisBlock.find('.content'),
		$blockControls		= $thisBlock.find('ul.contentControlMenu'),
		$resizeControls 	= $thisBlock.find('.resizeContentControls'),
		$targetSizeSelect = $thisBlock.find('select.targetSize'),
		$screenSize			= $thisBlock.find('.screenSize'),
		$increaseWidth		= $resizeControls.find('.increaseWidth'),
		$decreaseWidth		= $resizeControls.find('.decreaseWidth'),
		$increaseOffset	= $resizeControls.find('.increaseOffset'),
		$decreaseOffset	= $resizeControls.find('.decreaseOffset'),
		$resetBlock			= $resizeControls.find('.resetBlock'),
		$save 				= $resizeControls.find('.saveResize'),
		$cancel				= $resizeControls.find('.cancelResize');

		/*
		 *
		 * INIT VARS
		 *
		 */

		var targetSize, // string, 'xs', 'sm', 'md', or 'lg' from UI select
		target, // object, holds width/offset values and current classes if they exist
		startingClasses,
		controlHtml	= $blockControls.html(),
		contentID	= $blockControls.attr('id');

		/*
		 *
		 * BIND EVENTS
		 *
		 */
		
		$thisBlock.on('click', 'a.resizeContent', init);
		$targetSizeSelect.change(updateTargetVars);
		$(window).resize(updateScreenSizeUI);
		$increaseWidth.click(increaseWidth);
		$decreaseWidth.click(decreaseWidth);
		$increaseOffset.click(increaseOffset);
		$decreaseOffset.click(decreaseOffset);
		$resetBlock.click(resetBlock);
		$save.click(saveResize);
		$cancel.click(cancelResize);

		/*
		 *
		 * CORE FUNCTIONS
		 *
		 */

		// INIT - called when user initiates a block resize
		function init(ev){
			ev.preventDefault();
			// Set min-height on block to make room for resize controls
			$thisBlock.css('min-height', settings.resizeControlsHeight);
			// Update screensize UI based on current window dimensions
			updateScreenSizeUI();
			// Show resize controls and hide content but maintain space on the page
			$content.css('visibility', 'hidden');
			$resizeControls.show();
			// Hide block controls
			$blockControls.html('');
			// Get targetSize and build target object
			updateTargetVars();
			// Get starting classes to allow cancellation
			startingClasses = getClassArray();
		}

		// INCREASE WIDTH
		function increaseWidth(){
			// Make sure block can't get too big or too far offset
			if(target.width + target.offset >= 12){	return; }
			var newWidth = target.width + 1,
			newClass = "col-"+targetSize+"-"+newWidth.toString();
			updateClass(newWidth, newClass, 'width');
		}

		// DECREASE WIDTH
		function decreaseWidth(){
			// Make sure block can't get too small
			if(target.width <= settings.minColWidth){ return; }
			var newWidth = target.width - 1,
			newClass = "col-"+targetSize+"-"+newWidth.toString();
			updateClass(newWidth, newClass, 'width');
		}

		// INCREASE OFFSET
		function increaseOffset(){
			// Make sure block can't get too big or too far offset
			if(target.width + target.offset >= 12){	return; }
			var newOffset = target.offset + 1,
			newClass = "col-"+targetSize+"-offset-"+newOffset.toString();
			updateClass(newOffset, newClass, 'offset');
		}

		// DECREASE OFFSET
		function decreaseOffset(){
			// Can't offset < 0
			if(target.offset <= 0){ return; }
			var newOffset = target.offset - 1,
			newClass = "col-"+targetSize+"-offset-"+newOffset.toString();
			updateClass(newOffset, newClass, 'offset');
		}

		// RESET BLOCK
		function resetBlock(){
			var defaultClasses = settings.otherClasses.concat(settings.defaultBootstrap).join(" ");
			$thisBlock.removeClass().addClass(defaultClasses);
			updateTargetVars();
		}

		// UPDATE SCREENSIZE UI
		function updateScreenSizeUI(){
			var width = window.innerWidth;
			if(width < 768) {
	 			$screenSize.html('Mobile');
	 		} else if(width > 768 && width < 992) {
	 			$screenSize.html('Tablet');
	 		} else if(width > 992 && width < 1200) {
	 			$screenSize.html('Desktop');
	 		} else if(width > 1200) {
	 			$screenSize.html('Large Desktop');
	 		}
		}

		// SAVE
		function saveResize(){
			var data = { 'classes' : getBootstrapClasses().join(" ") },
			url = settings.saveURL + '/saveResize/' + contentID;
			_.post(url, data, closeResizeUI, function(){ console.log('Error saving'); });
		}

		// CANCEL
		function cancelResize(){
			$thisBlock.removeClass().addClass(startingClasses.join(" "));
			closeResizeUI();
		}

		/*
		 *
		 * HELPER FUNCTIONS
		 *
		 */

		function buildTarget(){
			var newTarget = {},
			classList = getBootstrapClasses();
			// Get target classes for current target size (e.g. 'col-sm-3' or 'col-sm-offset-1'). Will be "" if there is no class yet for target size
			newTarget.widthClass = getTargetClass(classList, targetSize, 'width');
			newTarget.offsetClass = getTargetClass(classList, targetSize, 'offset');
			// Get current width and offset (int) for target size
			newTarget.width = getTargetValue(classList, newTarget.widthClass, 'width');
			newTarget.offset = getTargetValue(classList, newTarget.offsetClass, 'offset');
			return newTarget;
		}

		function getTargetClass(classList, targetSize, type) {
			var targetClass;
			if(type == 'width') {
				// Get the class from the list where the target size is in the string and 'offset' is not
				targetClass = $.grep(classList, function(value) {
					return (value.indexOf(targetSize) > -1 && value.indexOf('offset') == -1);
				});
			} else if(type == 'offset') {
				targetClass = $.grep(classList, function(value) {
					return (value.indexOf(targetSize) > -1 && value.indexOf('offset') > -1);
				});
			}
			return targetClass.join("");
		}

		function getTargetValue(classList, targetClass, type) {
			var testClass = targetClass;
			if(targetClass.length === 0) {
				// If there is no class for the target size yet, get the width/offset
				// of the next size down until the value is found.
				var sizes = ['lg', 'md', 'sm', 'xs'],
				testSizes = sizes.slice(sizes.indexOf(targetSize) + 1);
				$.each(testSizes, function(i,size){
					testClass = getTargetClass(classList, size, type);
					if(testClass.length > 0){ return false; }
				});
			}
			// If target class is still blank return the default values
			if(testClass.length === 0 && type === 'width') { return 12;}
			else if (testClass.length === 0 && type === 'offset') { return 0; }
			// Return class value (e.g. for 'col-sm-3', the value is 3)
			return Number(testClass.match(/\d+/)[0]);
		}

		function updateClass(newVal, newClass, type){
			if(target[type+'Class'].length > 0){
				$thisBlock.removeClass(target[type+'Class']);
			}
			$thisBlock.addClass(newClass);
			target[type] = newVal;
			target[type+'Class'] = newClass;
		}

		function closeResizeUI(){
			$resizeControls.hide();
			$content.css('visibility', '');
			$blockControls.html(controlHtml);
			$thisBlock.css('min-height', '');
		}
		
		function updateTargetVars(){
			targetSize = $targetSizeSelect.val();
			target = buildTarget();
		}

		function getClassArray(){
			return $thisBlock.attr('class').split(/\s+/);
		}

		function getBootstrapClasses(){
			return difference(getClassArray(), settings.otherClasses);
		}

		// Returns a new array with the items in a1 that are not in a2
		function difference(a1, a2){
			return a1.concat(a2).filter(function(val, index, arr){
				return arr.indexOf(val) === arr.lastIndexOf(val);
			});
		}

		/*
		 *
		 * PUBLIC METHODS
		 *
		 */

		 return {
		 	// Returns Bootstrap classes for use by modals
		 	getClasses: function(){
		 		return getBootstrapClasses().join(" ");
		 	},
		 	// Takes a string of new classes and applies them to the block (string should not include 'otherClasses')
		 	setClasses: function(newClasses){
				newClasses = settings.otherClasses.join(" ")+" "+newClasses;
				$thisBlock.removeClass().addClass(newClasses);
			},
			// Exposes save method so modals can save their changes
			saveResize: function(){
				saveResize();
			}
		 };	
	};
	// Register plugin
	$.fn.blockResize = function(options) {
		return $.fn.encapsulatedPlugin('blockResize', blockResize, this, options);
	};

})(jQuery);