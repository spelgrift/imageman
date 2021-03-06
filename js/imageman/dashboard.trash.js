var $ = require('jquery');

$(function() {
/**
 * 
 * CACHE DOM
 * 
 */
	var $contentList = $('#contentList'),
	$contentTypeFilter = $contentList.find('select#filterContentList'),
	$contentTbody = $contentList.find('tbody'),
	$trashList = $('#trash'),
	$trashTypeFilter = $trashList.find('select#filterTrashList'),
	$trashTbody = $trashList.find('tbody'),
	$checkAll = $trashList.find('#trashCheckAll'),
	$mainNav = $('#mainNav').children('ul.navbar-nav');

/**
 * 
 * BIND EVENTS
 * 
 */
	// Trash button clicked
	$contentList.on('click', '.trashContent', trashContent);

	// Delete button
	$trashList.on('click', '.deleteContent', deleteContent);

	// Restore button
	$trashList.on('click', '.restoreContent', restoreContent);

	// Empty Trash
	$trashList.on('click', '.emptyTrash', emptyTrash);

	// Delete Selected
	$trashList.on('click', '.deleteSelected', deleteSelected);

	// Restore Selected
	$trashList.on('click', '.restoreSelected', restoreSelected);

	// Check/uncheck-all behavior
	$checkAll.on('change', checkAll);
	$trashList.on('change', '.trashCheck', updateCheckboxes);

	// Trash reload event
	events.on('reloadTrash', reloadTrash);

/**
 * 
 * MAIN FUNCTIONS
 * 
 */
 	
 	// Trash content
 	function trashContent(ev) {
 		ev.preventDefault();
		var contentID = $(this).attr('id'),
		$thisRow = $(this).closest('tr'),
		confirmMessage;
		if($thisRow.hasClass('page')) {
			confirmMessage = 'Are you sure you want to trash this page? Associated content and subpages will be orphaned';
		} else {
			confirmMessage = 'Are you sure you want to trash this item?';
		}
		if(!confirm(confirmMessage)) {
			return false;
		}
 		$.ajax({
 			type: 'DELETE',
 			url: baseURL + 'dashboard/trashContent/' + contentID,
 			dataType: 'json',
 			success: function(data) {
 				if(!data.error) {
 					var $trashedRows = $contentList.find('tr#' +data.affectedRows.join(',tr#'));
			 		$trashedRows.fadeOut(300, function() {
			 			$(this).remove();
			 			if($contentTbody.find('tr').length === 0) {
							reloadContentList();
						}
			 		});
			 		reloadTrash();
			 		reloadNav();
 				}
 			}
 		});
 	}

   // Empty Trash
   function emptyTrash(ev) {
   	ev.preventDefault();
		if(!confirm('Are you sure you want to PERMANENTLY DELETE all items in trash?')) {
			return false;
		}
   	$.ajax({
   		type: 'DELETE',
   		url: baseURL + 'dashboard/emptyTrash/',
   		dataType: 'json',
   		success: function(data) {
   			if(!data.error) {
 					$trashTbody.find('tr').fadeOut(300, function() {
			 			$(this).remove();
			 		});
			 		reloadTrash();
 				}
   		}
   	});
   }

 	// Delete content
 	function deleteContent(ev) {
 		ev.preventDefault();
		var contentID = $(this).attr('id'),
		$thisRow = $(this).closest('tr');

		if($thisRow.hasClass('page')) {
			confirmMessage = 'Are you sure you want to PERMANENTLY DELETE this page? Associated content and subpages will also be deleted. This action cannot be undone.';
		} else {
			confirmMessage = 'Are you sure you want to PERMANENTLY DELETE this item?';
		}
		if(!confirm(confirmMessage)) {
			return false;
		}
 		$.ajax({
 			type: 'DELETE',
 			url: baseURL + 'dashboard/deleteContent/' + contentID,
 			dataType: 'json',
 			success: function(data) {
 				if(!data.error) {
			 		$thisRow.fadeOut(300, function() {
			 			$(this).remove();
			 			if($trashTbody.find('tr').length === 0) {
							reloadTrash();
						}
			 		});
 				}
 			}
 		});
 	}

 	// Delete Selected
 	function deleteSelected(ev) {
 		ev.preventDefault();
		var checkedItems = buildCheckedArray();
		if(checkedItems.length === 0) {
			return false;
		}
		if(!confirm('Are you sure you want to PERMANENTLY DELETE the selected items?')) {
			return false;
		}	

 		$.ajax({
 			type: 'POST',
 			url: baseURL + 'dashboard/deleteMultiple/',
 			data: {checkedItems : checkedItems},
 			dataType: 'json',
 			success: function(data) {
 				if(!data.error) {
			 		var $deletedRows = $trashList.find('tr#' +checkedItems.join(',tr#'));
			 		$deletedRows.fadeOut(300, function() {
			 			$(this).remove();
			 			if($trashTbody.find('tr').length === 0) {
							reloadTrash();
						}
			 		});
			 		$checkAll.prop('checked', false);
 				}
 			}
 		});
 	}

 	// Restore content
 	function restoreContent(ev) {
 		ev.preventDefault();
		var contentID = $(this).attr('id'),
		$thisRow = $(this).closest('tr');
 		$.ajax({
 			type: 'POST',
 			url: baseURL + 'dashboard/restoreContent/' + contentID,
 			dataType: 'json',
 			success: function(data) {
 				if(!data.error) {
			 		$thisRow.fadeOut(300, function() {
			 			$(this).remove();
			 			if($trashTbody.find('tr').length === 0) {
							reloadTrash();
						}
			 		});
			 		reloadContentList();
			 		reloadNav();
 				}
 			}
 		});
 	}

 	// Restore Selected
 	function restoreSelected(ev) {
 		ev.preventDefault();
		var checkedItems = buildCheckedArray();
		if(checkedItems.length === 0) {
			return false;
		}
		if(!confirm('Are you sure you want to restore the selected items?')) {
			return false;
		}	
 		$.ajax({
 			type: 'POST',
 			url: baseURL + 'dashboard/restoreMultiple/',
 			data: {checkedItems : checkedItems},
 			dataType: 'json',
 			success: function(data) {
 				if(!data.error) {
			 		var $restoredRows = $trashList.find('tr#' +checkedItems.join(',tr#'));
			 		$restoredRows.fadeOut(300, function() {
			 			$(this).remove();
			 			if($trashTbody.find('tr').length === 0) {
							reloadTrash();
						}
			 		});
			 		reloadContentList();
			 		reloadNav();
			 		$checkAll.prop('checked', false);
 				}
 			}
 		});
 	}

	// Check/uncheck All
	function checkAll() {
		var $trashChecks = $trashList.find('.trashCheck');
		$trashChecks.each(function(){
			$(this).prop('checked', $checkAll.prop('checked'));
		});
	}
	// Update checkboxes
	function updateCheckboxes() {
		var $trashChecks = $trashList.find('.trashCheck');
		// If user unchecks a box and the check-all box is checked, uncheck it!
		if(!$(this).prop('checked') && $checkAll.prop('checked')) {
			$checkAll.prop('checked', false);
		}
		// If all checkboxes are checked and check-all box is unchecked, check it!
		if($('.trashCheck:checked').length == $trashChecks.length && !$checkAll.prop('checked')) {
			$checkAll.prop('checked', true);
		}
	}

	/**
	 * 
	 * UTLITY FUNCTIONS
	 * 
	 */
 	function reloadTrash()
 	{
 		$trashTypeFilter.val('all');
 		$trashTbody.load(baseURL + 'dashboard/reloadTrash/');
 	}

 	function reloadContentList()
 	{
 		$contentTypeFilter.val('page');
 		$contentTbody.load(baseURL + 'dashboard/reloadContentList/');
 	}

 	function reloadNav() {
		$mainNav.load(baseURL + 'dashboard/reloadNav', function() {
			events.emit('reloadNav');
		});
	}

	function buildCheckedArray()
	{
		var checkedItems = [],
		$checkBoxes = $trashList.find('.trashCheck:checked');
		$checkBoxes.each(function() {
			checkedItems.push($(this).closest('tr').attr('id'));
		});
		return checkedItems;
	}
});