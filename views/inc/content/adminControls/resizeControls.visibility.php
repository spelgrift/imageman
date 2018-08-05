<div id="editVisibilityModal" class="modal fade" tabindex="-1" role="dialog">
	<div class="modal-dialog modal-sm">
		<div class="modal-content">
			<div class="modal-header">
				<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
				<h4 class="modal-title">Block Visibility</h4>
			</div>
			<div class="modal-body">
				<form>
					<div class='checkbox'>
						<label>
							<input type='checkbox' id='hiddenMobileCheck'> Hide block on mobile devices
						</label>
					</div>
					<div class='checkbox'>
						<label>
							<input type='checkbox' id='hiddenDesktopCheck'> Hide block on tablets/computers
						</label>
					</div>
					<p class='error-block' id='visibilityMsg'></p>

				</form>
			</div>
			<div class="modal-footer">
				<button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
				<button type="button" id='saveVisibility' class="btn btn-primary">Save</button>
			</div>
		</div>
	</div>
</div>
