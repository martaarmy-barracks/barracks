<?php

require 'phpmailer/PHPMailerAutoload.php';

function sendEmailToSelf($subject, $content, $name, $email) {
	
	$mail = new PHPMailer;

	$mail->isSMTP();
	$mail->SMTPDebug = 0; // Debug mode off; 0 = OFF, 2 = ON

	$mail->Host = 'smtp.gmail.com';
	$mail->Port = 587;
	$mail->SMTPSecure = 'tls';
	$mail->SMTPAuth = true;
	$mail->Username = 'themartaarmy@gmail.com';
	$mail->Password = 'itsMARTA123';

	$mail->FromName = 'Signup Notification';
	$mail->addReplyTo($email, $name);
	$mail->addAddress('themartaarmy@gmail.com', 'Signup Notification Recepient');     // Add a recipient

	$mail->isHTML(true);

	$mail->Subject = $subject;
	$mail->Body = $content;
		

	return $mail->send();
}

function sendNewSignupEmail($name, $email, $stops, $comment, $was_already_registered) {

	$alreadymsg = "";
	if($was_already_registered) {
		$alreadymsg = "<br/><i>This soldier was already registered, today he just added more stops.</i>";
	}

	$stopchosenhtml = "<ol>";
	foreach($stops as $s) {
		$stopchosenhtml .= "<li>$s</li>";
	}
	$stopchosenhtml .= "</ol>";

	$content = <<<CONTENT
		NEW SIGN UP!<br/>
		<b>Soldier name: </b> $name<br/>
		<b>Email: </b>$email<br/>
		<b>Stops chosen: </b><br/>
		$stopchosenhtml
		<br/><br/>
		<b>Comments: </b> $comment<br/>
		$alreadymsg
CONTENT;
	$subject = "New Signup - $name";

	sendEmailToSelf($subject, $content, $name, $email);
}

?>