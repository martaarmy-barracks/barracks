function enableJoinAndCancelOpButtons() {
	$('.btn-join').click(function() {

		var $joinbtn = $(this);
		var $op = $joinbtn.closest('.operation');

		if($op.hasClass('nodetail')) {
			processJoinOp($op);
		} else if($op.hasClass('showingdetail')) {
			processJoinOp($op);
		} else {
			$op.addClass('showingdetail');

			$joinbtn.text('Join Now!');

			$op.find('.operation-detail').slideDown();
			$op.find(".op-data-form").slideDown();
			$op.find('.cancel-link').addClass('showing-form');
		}
	});

	$('.cancel-link').click(function() {
		var $opcancel = $(this);
		var $op = $opcancel.closest('.operation');

		$op.removeClass('showingdetail');
		$op.find('.btn-join').text('Read More...');
		$op.find('.operation-detail').slideUp();
		$op.find(".op-data-form").slideUp();
		$opcancel.removeClass('showing-form');
	});

	function processJoinOp($op) {

		// todo show "waiting" spinner on button while working

		var opid = $op.attr('data-value');
		var $form = $op.find('.op-data-form');

		var result = $form.getFormData();
		if(!result.success) {
			var $err_fl = result.fl;
			var type = result.type;
			if(type=='empty') {
				$err_fl.showError('Cannot be empty!', 4000);
			} else if(type=='noitem') {
				$err_fl.showError('Select at least one bus stop', 4000);
			}
			return;
		}

		var data = { 
			opid: opid,
			data: JSON.stringify(result.formdata)
		};

		$opcard = $op.closest('.card');

		$.ajax({
		  url: "ajax/join-op.php",
		  type: "POST",
		  data: data,
		  dataType: 'json',
		  
		  success: function(d) {
			switch(d.status) {
			case 'success':
				var ophtml = d.ophtml;
				var $joined_op = $(ophtml).hide();
				$('#participating-operations').append($joined_op);
				$opcard.slideUp(function() {
					$opcard.remove();
					addPoints(parseInt(d.addedpoints));
					$joined_op.slideDown(function() {
						// todo scroll to $joined_op
						setTimeout(function() {
							showOpMessage($joined_op, 'success', "You've joined this operation. +5 points!");
						}, 500);
					});
				});
				break;

			default:
				showOpMessage($opcard, 'failure', 'Oops! Something went wrong :(');
			}
		},
		error: function(jqXHR, textStatus, errorThrown) {
			showOpMessage($opcard, 'failure', 'Oops! Something went wrong :(');
 		}});
	}
}

function showOpMessage($opcard, type, msg) {
	msg = "<p class='opmsg "+type+"'>"+msg+"</p>";
	var $msg = $(msg).hide();
	$opcard.prepend($msg);
	$msg.slideDown();

	setTimeout(function() {
		$msg.slideUp(function() { $msg.remove(); });
	}, 3000);
}

function enableOperationTaskCompletion() {
	var $modal = $('#complete-task-modal');
	var $opcard = null;
	var $task = null;

	$('#participating-operations').on('click', '.operation-task:not(.completed)', function() {
		$task = $(this).closest('li.operation-task');
		$opcard = $task.closest('.card');

		var opname = $task.closest('.operation').find('.operation-title').text();

		$modal.find('.operation-title').text(opname);

		var $taskli = $modal.find('li.operation-task');
		$taskli.html($task.html());
		if($task.hasClass('late')) { $taskli.addClass('late'); }
		else { $taskli.removeClass('late'); }

		$modal.find('.data-taskid').text($task.attr('data-taskid'));

		$modal.modal();
	});

	$('#complete-task-modal .complete-task').click(function() {

		var taskid = $modal.find('.data-taskid').text();
		
		$.ajax({
		  url: "ajax/complete-task.php",
		  type: "POST",
		  data: {taskid: taskid},
		  dataType: 'json',
		  
		  success: function(d) {
			switch(d.status) {
			case 'success':
				$modal.modal('hide');
				showOpMessage($opcard, 'success', 'The task is now marked success!');
				$task.addClass('completed').find('i.fa').attr('class', 'fa fa-li fa-check-square-o');
				break;

			default:
				showModalMessage($opcard, 'failure', 'Oops! Something went wrong :(');
			}
		},
		error: function(jqXHR, textStatus, errorThrown) {
			showModalMessage($opcard, 'failure', 'Oops! Something went wrong :(');
 		}});
	});
}

function showModalMessage($modal, type, msg) {
	var $msg = $modal.find('.modalmsg').hide().removeClass('success').removeClass('failure')
		.addClass(type).text(msg).slideDown();

	setTimeout(function() {
		$msg.slideUp(function() { $msg.remove(); });
	}, 3000);
}


jQuery(document).ready(function($) {

	enableJoinAndCancelOpButtons();

	enableOperationTaskCompletion();

});