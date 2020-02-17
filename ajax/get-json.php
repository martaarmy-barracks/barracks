<?php

function getJson($url, $timeout=10) {
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);
  curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);
  curl_setopt($ch, CURLOPT_TIMEOUT, $timeout); //timeout in seconds
	$result=curl_exec($ch);
	curl_close($ch);
	return json_decode($result, true);
}
?>