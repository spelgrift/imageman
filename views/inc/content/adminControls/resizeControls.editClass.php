<div id="editBSclassModal" class="modal fade" tabindex="-1" role="dialog">
	<div class="modal-dialog">
		<div class="modal-content">
			<div class="modal-header">
				<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
				<h4 class="modal-title">Edit Layout Classes Manually</h4>
			</div>
			<div class="modal-body">
				<form>
					<div class='form-group'>
						<label for='inputBSclasses'>Bootstrap Classes (only mess with this if you know what you're doing!)</label>
						<input type='text' class='form-control' id='inputBSclasses' placeholder='col-xs-12'>
						<p class='error-block' id='BSclassMsg'></p>
					</div>

				</form>
			</div>
			<div class="modal-footer">
				<button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
				<button type="button" id='saveBSclass' class="btn btn-primary">Save</button>
			</div>
		</div>
	</div>
</div>
