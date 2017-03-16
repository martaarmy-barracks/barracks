;(function($) {

	$(document).on('focus', '.float-label input, .float-label textarea', function() {
		var $inp = $(this);
		var $fl = $inp.closest('.float-label');

		$fl.addClass("focussed");
	});

	$(document).on('blur', '.float-label input, .float-label textarea', function() {
		$(this).closest('.float-label').refreshLabel();
	});

	$(document).on('mousedown', '.form-group.float-label .plus-btn', function() {
		var $plusBtn = $(this);
		var $fl = $plusBtn.closest('.float-label');
		var $td = $fl.find('td.input-region');
		var $inp = $("<div class='input-wrapper'><input type='text' class='form-control'/><i class='ionicons ion-android-delete delete-button'></i></div>").hide();

		$td.append($inp);

		$inp.slideDown(function() {$fl.find('.delete-button').fadeIn(); $inp.find('input')[0].focus(); });
	});

	$(document).on('mousedown', '.form-group.float-label .delete-button', function() {
		var $delBtn = $(this);
		var $iw = $delBtn.closest('.input-wrapper');
		var $fl = $iw.closest('.float-label');

		var numOfIw = $fl.find('.input-wrapper').length;
		if(numOfIw==2) {
			$fl.find('.delete-button').fadeOut();
		}

		$iw.slideUp(function() { $iw.remove(); });
	});

	$.fn.showError = function(msg, duration) {
		return this.each(function() {
			var $fl = $(this);
			var $msg = $fl.find('.error-message');

			if(!$fl.hasClass('float-label') || $msg.length==0) {
				return;
			}

			$msg.html('<i class="ionicons ion-alert"></i> '+msg);
			$fl.addClass('message-shown');
		
			setTimeout(function() { $fl.removeClass('message-shown');}, duration)
		})
	}

	$.fn.getFormData = function() {
		var $form = this;

		var formdata = {};

		var error = false;
		var error_retval = null;

		$form.find('.float-label').each(function(i, fl) {
			if(error) return;

			var $fl = $(fl);
			var flid = $fl.attr('id');
			var fltype = $fl.attr('data-type');
			fltype = (fltype===undefined) ? 'text' : fltype;

			if(fltype=='text') {
				var $inp = $fl.find('input');
				var val = $inp.val();

				if(val=='') {
					error = true;
					error_retval = { success: false, fl: $fl, type: 'empty' };
					return;
				}
				
				formdata[flid] = val;
			} else if(fltype=='list') {
				var vals = [];
				$fl.find('.input-wrapper input').each(function(i,inp) {
					var val = $(inp).val();
					if(val!='') { vals.push(val); }
				});

				if(vals.length==0) {
					error = true;
					error_retval = { success: false, fl: $fl, type: 'noitem' };
					return;
				}
				formdata[flid] = vals;
			}
		});

		if(error) {
			return error_retval;
		} else {
			return { success: true, formdata: formdata };
		}
	}

	$.fn.refreshLabel = function() {
		return this.each(function() {
			var $fl = $(this);
			if(!$fl.hasClass('float-label')) {
				$fl = $fl.closest('.float-label');
				if($fl.length==0) { return };
			}

			var $inp = $fl.find('input');
			if($inp.length==0) $inp = $fl.find('textarea');

			var fltype = $fl.attr('data-type');
			fltype = (fltype===undefined) ? 'text' : fltype;

			if(fltype=='text') {
				if($inp.val() == "") {
					$fl.removeClass('focussed');
				} else {
					$fl.addClass('focussed');
				}
			} else if(fltype=='list') {
				var $inputs = $fl.find('td.input-region input');
				if($inputs.length==1) {
					if($inputs.first().val() == "") {
						$fl.removeClass('focussed');
					} else {
						$fl.addClass('focussed');
					}
				} else {
					$fl.addClass('focussed');
				}
			}
		})
	}

	$('.form-group.float-label .input-help').tooltip();

})(jQuery);




