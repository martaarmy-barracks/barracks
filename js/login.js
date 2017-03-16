jQuery(document).ready(function($) {

	$('#login-form').submit(function(e) {
		e.preventDefault();

		var email = $('#email').val();
		var password = $('#password').val();
		// opt: check for invalids, blanks etc

		$.ajax({
		  url:     "ajax/login.php",
		  type: "POST",
		  data:    {email: email, password: password},
		  dataType: 'json',
		  
		  success: function(d) {
			switch(d.status) {
			case 'success':
				Cookies.set('sid', d.sid, { expires: 365 });
				window.location.href = 'home.php';
				break;

			case 'fail':
			case 'noemail':
			case 'nopassword':
			default:
				$('#password-label').closest('.float-label')
					.showError('Sorry, incorrect password. Try again?', 4000);
				break;
			}
		},
		error: function(jqXHR, textStatus, errorThrown) {
			$('#password-label').closest('.float-label')
					.showError('Oops, something broke. Try again?', 4000);
 		}});
	})
});
