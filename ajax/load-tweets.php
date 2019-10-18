<?php
//header('Content-Type: application/json');
date_default_timezone_set('America/New_York');
include_once('../lib/db.php');
include_once('../lib/dbutils.php');

$skipDb = ($_DB != null);
if ($skipDb) echo "Skipping DB init.";
else init_db();


$today = date("Y-m-d");
//$url = "https://api.twitter.com/1.1/statuses/user_timeline.json?count=20&screen_name=martaservice";
$url = "https://api.twitter.com/1.1/search/tweets.json?q=list%3Amartaarmy/testlist+since%3A$today&result_type=recent&count=50&tweet_mode=extended";


// First, load and process tweets.
$data = loadTweets($url);
$parsedData = parseTweets($data['statuses']);

//echo json_encode($parsedData);

//var_dump($data);
//var_dump($parsedData);

clearTweetTable();
insertParsedTweets($parsedData);
include('load-tweet-blockids.php');

if (!$skipDb) {
	echo "Closing.";
	mysqli_close($_DB);
}


function loadTweets($url) {
//	curl -H "Host: api.twitter.com" -H "Authorization: Bearer AAAAAAAAAAAAAAAAAAAAAPMZ8AAAAAAAVbXrIv3xy7bdYlBuhusP%2FTRBEN8%3D86xAq7Eoq4FeSNz7nni1tXBTgCFp9ffm43icm9tLmAW5RPMKTb" -H "Accept: */*" -H "User-Agent: Experimental Poller" -L -v "https://api.twitter.com/1.1/statuses/user_timeline.json?count=20&screen_name=martaservice" --output c:\Temp\a.txt

	$host = "api.twitter.com";
	$bearerToken = "AAAAAAAAAAAAAAAAAAAAAPMZ8AAAAAAAVbXrIv3xy7bdYlBuhusP%2FTRBEN8%3D86xAq7Eoq4FeSNz7nni1tXBTgCFp9ffm43icm9tLmAW5RPMKTb";
	$userAgent = "TimelyTrip Poller";


	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL, $url);
	curl_setopt($ch, CURLOPT_HTTPHEADER, array("Host: $host", "Authorization: Bearer $bearerToken", "Accept: */*", "User-Agent: $userAgent"));

	curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);
	curl_setopt($ch, CURLOPT_TIMEOUT, 20); //timeout in seconds
	
	$result=curl_exec($ch);
	curl_close($ch);
	return json_decode($result, true);
}

function parseTweets($tweets) {
	$parsedData = [];
	foreach ($tweets as $t) {
		$parsedData[] = parse($t);
	}
	return $parsedData;
}
function parse($tweet) {
	$output = [];
	$output["id"] = $tweet["id_str"];
	$output["date"] = $tweet["created_at"];
	$tweetText = $tweet["full_text"];
	$output["text"] = $tweetText;
	$output["source"] = $tweet["user"]["name"];

	$rx = [ // first pass
		["id" => "route", "regex" => '/\b(route|rte|rt|#)\b\s*:?\s*(\w+)\s*:?/i', "index" => 2],
		["id" => "direction", "regex" => '/((e|w|n|s)b)|((east|west|north|south)([\s\-]*)bound)/i', "index" => 0],
		["id" => "time", "regex" => '/((at|@)?\s*([0-1]?\d[:;]?[0-5]\d\s*((a|p)(\.|\s)?m?\.?)?))($|[^\w])/i', "index" => 3], // us am/pm time
		["id" => "isDelay", "regex" => '/\b(delay\w{0,3}|late)\b/i', "index" => 0],
		["id" => "minutes", "regex" => '/(\d+)\s*(mn|min|mins|m|minute|minutes)($|[^\w])/i', "index" => 1],
		["id" => "origin", "regex" => '/(\s*(from|at|@)\s*:?)?\s*(\w.*\w)\s*(from|to|$)?/i', "index" => 3]
	];

	for ($i = 0; $i < count($rx); $i++) {
		$item = $rx[$i];
		$matches = [];
		preg_match($item["regex"], $tweetText, $matches);

		if ($matches != null) {
			$output[$item["id"]] = trim($matches[$item["index"]]);

			// remove searched strings before second pass
			$tweetText = str_replace($matches[0], "", $tweetText);
		}
	}

	return $output;
}
function clearTweetTable() {
	echo "Clearing twwets table...";
	execSimpleQuery("DELETE from service_tweets where 1");
}

function toStdTime($str) {
	$dateparse = date_parse($str);
	return sprintf("%02d", $dateparse["hour"]) . ":" . sprintf("%02d", $dateparse["minute"]) . ":00";
}

function getDirectionId($str) {
	switch ($str) {
		case "SB": return 1;
		case "NB": return 0;
		case "EB": return 0;
		case "WB": return 1;
	}
}

function insertParsedTweets($parsedData) {
	echo "Inserting parsed tweets...";

	$rtsql = array();

	$datestrU = date("Gi");
	$date_as_int = intval($datestrU);
	$day_code = date("N");

	// Assume service day changes at 3 AM.
	// Midnight to 3AM goes to previous day.
	if ($date_as_int >= 0 && $date_as_int < 300) {
		$date_as_int += 2400;
		$day_code_n = intval($day_code) - 1;
		if ($day_code_n == 0) $day_code_n = 7;
		$day_code = strval($day_code_n);
	}

	// Determine service_id for today.
	// TODO: night time.
	$day_name = "WEEKDAY";
	$service_id = 5;
	if ($day_code == "6") {
		$service_id = 3;
		$day_name = "SATURDAY";
	}
	else if ($day_code == "7") {
		$service_id = 4;
		$day_name = "SUNDAY";
	}


	foreach($parsedData as $d ) {
		if (isset($d["route"]) && isset($d["direction"]) && isset($d["isDelay"]) && isset($d["time"])) {
			$rowData = array();
			$rowData["id"] = $d["id"];
			$rowData["date"] = $d["date"];
			$rowData["route"] = $d["route"];
			$rowData["direction"] = $d["direction"];
			$rowData["direction_id"] = getDirectionId($d["direction"]);
			$rowData["time"] = $d["time"];
			$rowData["status"] = $d["isDelay"];
			$rowData["text"] = $d["text"];
			$rowData["source"] = $d["source"];
			$rowData["service_id"] = $service_id;
			$rowData["stdtime"] = toStdTime($d["time"]);
	
			$rtsql[] = '("' . implode('", "', $rowData) . '")';
		}
	}

	$query = "insert into service_tweets (id, date, route, direction, direction_id, timetext, status, text, source, service_id, stdtime) values " . implode(',', $rtsql);
	execSimpleQuery($query);
}

?>