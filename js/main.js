function refreshPoints() {
	var $rank = $('#rank');

	var points = parseInt($rank.attr('data-value'));
	var ranks = [
		{name: 'Cadet', upper: 30}, 
		{name: 'Corporal', upper: 80}, // 50
		{name: 'Sergeant', upper: 150}, // 70
		{name: 'Lieutenant', upper: 250}, // 100
		{name: 'Captain', upper: 400}, // 150
		{name: 'Colonel', upper: 600}, // 200
		{name: 'General', upper: 900}, // 300
	];

	var lower = 0;
	for(var i=0; i<ranks.length; i++) {
		if(points >= lower && points < ranks[i].upper) break;
		lower = ranks[i].upper;
	}
	
	var rankName = ranks[i].name;
	$('#rank-name').text(rankName);

	if(i==ranks.length-1) {
		$rank.attr('title', "You have reached the highest rank of "+rankName+" in the MARTA Army!");
		$('#rank-progress').hide();
	} else {
		var totalInThisRank = ranks[i].upper - lower;
		var progressInThisRank = points - lower;

		// format: "Captain: 60/100 points. 40 points to Major!"
		$rank.attr('title', 
			ranks[i].name+": "+progressInThisRank+"/"+totalInThisRank+" points. "+
			(totalInThisRank- progressInThisRank) +" points to "+ranks[i+1].name+"!");

		var rankCompletion = (progressInThisRank / totalInThisRank) * 100;
		if(rankCompletion < 5) rankCompletion = 5;
		$('#rank-progress').css('width', rankCompletion+'%');

	}

	$rank.tooltip('fixTitle');
}

function addPoints(pts) {
	console.log('adding points', pts);
	var $rank = $('#rank');
	var points = parseInt($rank.attr('data-value'));

	$rank.attr('data-value', points + pts);
	refreshPoints();
}

function enableLogout() {
	$('#logout').click(function() {
		Cookies.remove('sid');
		window.location.reload();
	});
}


jQuery(document).ready(function($) {
	refreshPoints();
	enableLogout();
});