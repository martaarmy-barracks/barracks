jQuery(document).ready(function($) {

	$('#prefs-form').submit(function(e) {
		e.preventDefault();

		var currPass = $('#current-password').val();
		var newPass = $('#new-password').val();
		
		if(currPass == '') {
			$('#current-password').closest('.float-label').showError('Cannot be empty.');
			return;
		}

		if(newPass == '') {
			$('#new-password').closest('.float-label').showError('Cannot be empty.');
			return;
		}

		// todo disable button, enable when done

		$.ajax({
		  url:     "ajax/change-password.php",
		  type: "POST",
		  data:    {'current-password': currPass, 'new-password': newPass},
		  dataType: 'json',
		  
		  success: function(d) {
			switch(d.status) {
			case 'success':
				$('#current-password, #new-password').val('');
				showMessage('Password changed!');
				break;

			case 'invalidpass':
				$('#current-password').closest('.float-label')
					.showError('This is not your current password.', 4000);
				break;

			default:
				$('#new-password').closest('.float-label')
					.showError('Oops, something broke :( Try again later?', 4000);
				break;
			}
		},
		error: function(jqXHR, textStatus, errorThrown) {
			$('#new-password').closest('.float-label')
					.showError('Oops, something broke :( Try again later?', 4000);
 		}});
	})

	function showMessage(msg) {
		var $msg = $('#msg');
		$msg.text(msg).slideDown();
		setTimeout(function() { $msg.slideUp(); }, 3000);
	}
});
