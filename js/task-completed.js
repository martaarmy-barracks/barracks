$(function() {
	var actionState = 'cancel';
	var $actionLink = $('#cancel-undo');
	var $msg = $('#complete-msg');
	var $progress = $('#task-progress .inner');

	var $task = $('#task-container li').first();

	$progress.animate({width: '100%'}, 3000, function() {
		$progress.fadeOut();
		completeTask();
	});

	$actionLink.click(function() {
		if($actionLink.hasClass('disabled')) { return; }

		if(actionState=='undo') {
			uncompleteTask();
		} else if(actionState=='complete') {
			completeTask();
		} else if(actionState=='cancel') {
			$msg.text('Cancelled');
			$actionLink.text('Mark Complete').removeClass('disabled');
			actionState = 'complete';
			$progress.stop().animate({width: 0}, 300);
		}
	});

	function completeTask() { 
		var taskid = $('.data-taskid').text();
		$msg.text('Marking complete...');
		$actionLink.addClass('disabled');
		
		$.ajax({
			url: "ajax/complete-task.php",
			type: "POST",
			data: {taskid: taskid},
			dataType: 'json',

			success: function(d) {
				switch(d.status) {
				case 'success':
					$msg.text('Done.');
					$actionLink.text('Undo').removeClass('disabled');
					actionState = 'undo';
					$task.addClass('completed').find('i.fa').attr('class', 'fa fa-li fa-check-square-o');
					addPoints(parseInt(d.addedpoints));
					break;

				default:
					showError('Oops! Something broke :(');
					$actionLink.removeClass('disabled');
				}
			},
			error: function(jqXHR, textStatus, errorThrown) {
				showError('Oops! Something broke :(');
				$actionLink.removeClass('disabled');
			},
	 		complete: function(xhr, data) {
		        if (xhr.status == 0) { showError('Oops! Something broke :('); $actionLink.removeClass('disabled'); }
		    }
		});
	}

	function uncompleteTask() {
		var taskid = $('.data-taskid').text();
		$msg.text('Undoing...');
		$actionLink.addClass('disabled');

		$.ajax({
			  url: "ajax/uncomplete-task.php",
			  type: "POST",
			  data: {taskid: taskid},
			  dataType: 'json',
			  
			  success: function(d) {
				switch(d.status) {
				case 'success':
					$msg.text('Undone.');
					$task.removeClass('completed').find('i.fa').attr('class', 'fa fa-li fa-square-o');
					$actionLink.text('Mark Complete').removeClass('disabled');
					actionState = 'complete';
					addPoints(-1 * parseInt(d.removedpoints));
					break;

				default:
					showError('Oops! Something broke :(');
					$actionLink.removeClass('disabled');
				}
			},
			error: function(jqXHR, textStatus, errorThrown) {
				showError('Oops! Something broke :(');
				$actionLink.removeClass('disabled');
	 		},
	 		complete: function(xhr, data) {
		        if (xhr.status == 0) { showError('Oops! Something broke :('); $actionLink.removeClass('disabled'); }
		    }
	 	});
	}

	function showError(msg) {
		$msg.text(msg).addClass('error');
		setTimeout(function() { $msg.removeClass('error').text(''); }, 3000)
	}

});