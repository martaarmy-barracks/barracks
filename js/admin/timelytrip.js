$(function() {
	var $curr_modal_stop = null;

	$(document).on('click', '#soldiers-table td span.stop', function() {
		var $stop = $(this);
		var adoptedtime = $stop.find('span.adoptedtime').text();
		var stopname = $stop.find('span.name').text();
		var stopid = $stop.find('span.stopid').text();
		var agency = $stop.find('span.agency').text().trim();
		var given = $stop.find('span.given').text()==='true';
		var nameonsign = $stop.find('span.nameonsign').text();
		var abandoned = $stop.hasClass('abandoned');

		var $m = $('#stopdetail-modal');

		$m.find('.adoptedtime').text(adoptedtime);
		$m.find('.stopname input').val(stopname).refreshLabel();
		$m.find('.stopid input').val(stopid).refreshLabel();
		$m.find('.agency select').val(agency);
		$m.find('.given input').prop('checked', given).trigger('change');
		$m.find('.nameonsign input').val(nameonsign).refreshLabel();
		$m.find('.abandoned input').prop('checked', abandoned);

		$curr_modal_stop = $stop;

		$m.modal();
	});

//	$('#stopdetail-modal .given input').change(function() {
//		var checked = $(this).prop('checked');
//		var $nameonsign = $('#stopdetail-modal .nameonsign');
//		if(checked) { $nameonsign.slideDown(); } else { $nameonsign.slideUp(); }
//	});

	$('#stopdetail-modal .stopdetail-submit').click(function() {
		var $m = $('#stopdetail-modal');
		
		var id = $curr_modal_stop.find('span.id').text();

		var stopname = $m.find('.stopname input').val();
		var stopid = $m.find('.stopid input').val().trim();
		
		if(stopid.length==0) { $m.find('#agency select').val(''); };
		var agency = $m.find('.agency select').val().trim();

		var given = $m.find('.given input').prop('checked');
		var nameonsign = $m.find('.nameonsign input').val().trim();
		var abandoned = $m.find('.abandoned input').prop('checked');

		var data = { 
			id: id,
			stopname: stopname,
			stopid: stopid,
			agency: agency,
			given: given,
			nameonsign: nameonsign,
			abandoned: abandoned
		};

		$.ajax({
		  url: "../ajax/admin/update-stopdetail.php",
		  type: "POST",
		  data: data,
		  dataType: 'json',
		  
		  success: function(d) {
			switch(d.status) {
			case 'success':
				// update stop
				$curr_modal_stop.toggleClass('nostopid', stopid.length===0);
				$curr_modal_stop.find('span.name').text(stopname);
				$curr_modal_stop.find('span.stopid').text(stopid);
				$curr_modal_stop.find('span.agency').text(agency);
				$curr_modal_stop.find('span.given').text(given ? 'true' : 'false');
				$curr_modal_stop.find('span.nameonsign').text(nameonsign);
				$curr_modal_stop.toggleClass('abandoned', abandoned);

//				var $curr_td = $curr_modal_stop.closest('td');
//				var $new_td = null;

//				switch(d.stop_classification) {
//				case 'notgiven':
//					$new_td = $curr_modal_stop.closest('tr').find('td.notgiven-td');
//					break;
//				case 'notask':
//					$new_td = $curr_modal_stop.closest('tr').find('td.notask-td');
//					break;
//				}

//				if($curr_td[0]!=$new_td[0]) {
//					$curr_modal_stop.fadeOut(function() {
//						$curr_modal_stop.detach().appendTo($new_td[0]).fadeIn();
//					});
//				}
					
				$m.modal('hide');
				break;

			case 'agencynull':
				alert('Agency cannot be left empty or blank.');
				break;

			case 'given_nameonsign':
				alert('If stop is marked as "given", then name on sign must also be filled.');
				break;

			case 'missing':
			default:
				console.log(d);
				alert('Oops, an error occurred: '+d.status);
			}
		},
		error: function(jqXHR, textStatus, errorThrown) {
			console.log(textStatus, errorThrown);
			alert('Oops, an error occurred.');
 		}});
	});

	$('#stopdetail-modal button.get-sign').click(function() {
		var $m = $('#stopdetail-modal');

		var name = $m.find('.nameonsign input').val().trim();
		var stopid = $m.find('.stopid input').val().trim();
		var agency = $m.find('.agency select').val();
		var signsBaseUrl = $m.find('.signs-base-url').val();
		

		if(stopid.length==0 || agency.length==0) {
			alert('The stopid and agency needs to be set first.');
			return;
		}

		if(name.length==0) {
			alert('Select a name on the sign after checking the "Given" box.');
			return;
		}

		//Old OBA URL: window.open(signsBaseUrl + 'bus-sign/signs.php?sids[]='+agency+'_'+stopid+'&adopters[]='+name);
		window.open(signsBaseUrl + 'bus-sign/signdirect.php?sid=' + agency + '_' + stopid + '&adopter=' + name);
	});

	$('#new-soldier-button').click(function() {
		$('#newsoldier-modal').modal();
	});

	$('#signs-from-emails-button').click(function() {
		$('#signs-from-emails-modal').modal();
	});

	$curr_modal_soldier = null;

	$('.addstoplink').click(function() {
		$curr_modal_soldier = $(this).closest('tr');

		var $m = $('#addstop-modal');
		$m.find('.stopname input').val('');
		$m.find('.stopid input').val('');
		$m.find('.agency select').val('');

		$m.modal();
	});

	$('#addstop-modal .addstop-submit').click(function() {
		var userid = $curr_modal_soldier.attr('data-userid');
		var $m = $('#addstop-modal');
		var stopname = $m.find('.stopname input').val().trim();
		var stopid = $m.find('.stopid input').val().trim();
		var agency = $m.find('.agency select').val();

		if(stopid.length!=0 && agency.length==0) {
			alert('Select agency along with stop id');
			return;
		}

		var data = { userid: userid, stopname: stopname, stopid: stopid, agency: agency };

		$.ajax({
		  url: "../ajax/admin/adopt-new-stop.php",
		  type: "POST",
		  data: data,
		  dataType: 'json',
		  
		  success: function(d) {
			switch(d.status) {
			case 'success':
				alert('done! refresh your window.');
				$m.modal('hide');
				break;

			default:
				console.log(d);
				alert('Oops, an error occurred: '+d.status);
			}
		},
		error: function(jqXHR, textStatus, errorThrown) {
			console.log(textStatus, errorThrown);
			alert('Oops, an error occurred.');
 		}});
		
	});

	$('#signs-from-emails-modal .getsigns-submit').click(function() {
		var $m = $('#signs-from-emails-modal');
		var allEmailsStr = $('#signs-from-emails-input').val().replace("\n", ";").trim();
		var emails = allEmailsStr.split(/\n/g);

		var data = { emails: allEmailsStr };

		$.ajax({
		  url: "../ajax/admin/signs-from-email.php",
		  type: "POST",
		  data: data,
		  dataType: 'json',
		  
		  success: function(data, textStatus, jqXHR) {
				//alert('done! refresh your window.');
				var output = "<ul>";
				if (data != null && data.length != 0) {
					for (var i = 0; i < data.length; i++) {
						output += "<li>" + data[i][0] + " - <a target='_blank' href='" + data[i][1] + "'>" + data[i][1] + "</a></li>";					
					}
				}
				else {
					output += "<li>No signs found for the emails provided.</li>";
				}
				output += "</ul>";
				$('#signs-from-emails-results').html(output);

			},
			error: function(jqXHR, textStatus, errorThrown) {
				console.log(textStatus, errorThrown);
				alert('Oops, an error occurred.');
			}});		
	});

	$('#update-stop-routes-button').click(function() {
		$.ajax({
		  url: "../ajax/admin/update-adoptedstop-routes.php",
		  type: "POST",
		  data: {},
		  dataType: 'json',
		  
		  success: function(d) {
			switch(d.status) {
			case 'success':
				alert('Routes for adopted stops have been updated.');
				break;

			default:
				console.log(d);
				alert('Oops, an error occurred: '+d.status);
			}
		},
		error: function(jqXHR, textStatus, errorThrown) {
			console.log(textStatus, errorThrown);
			alert('Oops, an error occurred.');
 		}});
	});

	$('#get-emails-for-changed-routes').click(function() {
		var $m = $('#signs-from-emails-modal');
		var changedRoutes = $('#changed-routes-input').val();

		var data = { routes: changedRoutes };

		$.ajax({
		  url: "../ajax/admin/get-emails-for-changed-routes.php",
		  type: "POST",
		  data: data,
		  dataType: 'json',
		  
		  success: function(data, textStatus, jqXHR) {
				//alert('done! refresh your window.');
				var output = "<ol>";
				if (data != null && data.length != 0) {
					for (var i = 0; i < data.length; i++) {
						output += "<li>" + data[i][0] + " - <a target='_blank' href='" + data[i][1] + "'>" + data[i][1] + "</a></li>";					
					}
				}
				else {
					output += "<li>No users/emails found for the routes provided.</li>";
				}
				output += "</ol>";
				$('#signs-from-emails-results').html(output);
				$m.modal();

			},
			error: function(jqXHR, textStatus, errorThrown) {
				console.log(textStatus, errorThrown);
				alert('Oops, an error occurred.');
			}});		
	});

	$('#expire-stops-with-changed-routes').click(function() {
		var changedRoutes = $('#changed-routes-input').val();
		var expdate = $('#expiration-input').val();

		var data = { routes: changedRoutes, expdate: expdate };

		$.ajax({
		  url: "../ajax/admin/expire-stops-with-changed-routes.php",
		  type: "POST",
		  data: data,
		  dataType: 'json',
		  
		  success: function(data, textStatus, jqXHR) {
				alert('Expiration date for adopted stops on these routes has been set.');
			},
			error: function(jqXHR, textStatus, errorThrown) {
				console.log(textStatus, errorThrown);
				alert('Oops, an error occurred.');
			}});		
	});

	$('#select-all-soldiers').click(function(e) {
		e.preventDefault();
		$('#soldiers-table td.selection input[type=checkbox]').prop('checked', true).change();
		return false;
	});

	$('#select-none-soldiers').click(function(e) {
		e.preventDefault();
		$('#soldiers-table td.selection input[type=checkbox]').prop('checked', false).change();
		return false;
	});

	$('#select-nosign-all-soldiers').click(function(e) {
		e.preventDefault();
		$('#soldiers-table td.notgiven-td:not(:empty)')
			.closest('tr').find('td.selection input[type=checkbox]').prop('checked', true).change();
		return false;
	});

	$('#select-nosign-none-soldiers').click(function(e) {
		e.preventDefault();
		$('#soldiers-table td.notgiven-td:not(:empty)')
			.closest('tr').find('td.selection input[type=checkbox]').prop('checked', false).change();
		return false;
	});

	$('#select-sign-notask-all-soldiers').click(function(e) {
		e.preventDefault();
		$('#soldiers-table td.notask-td:not(:empty)')
			.closest('tr').find('td.selection input[type=checkbox]').prop('checked', true).change();
		return false;
	});

	$('#select-sign-notask-none-soldiers').click(function(e) {
		e.preventDefault();
		$('#soldiers-table td.notask-td:not(:empty)')
			.closest('tr').find('td.selection input[type=checkbox]').prop('checked', false).change();
		return false;
	});

	$(document).on('change', '#soldiers-table td.selection input[type=checkbox]', function() {
		var $cb = $(this);
		$cb.closest('tr').toggleClass('soldier-selected', $cb.prop('checked'));
	})

	$('#get-emails').click(function() {
		$selectedSoldiers = $('#soldiers-table td.selection input[type=checkbox]:checked').closest('tr');
		if($selectedSoldiers.length==0) { 
			alert('No soldiers selected!');
			return;
		}

		var $emails = $selectedSoldiers.find('td.user-data span.email').clone();

		$emails.each(function(i, e) {
			var $e = $(e);
			$e.text($e.text() + ';');
		})

		var $modal = $('#email-list-modal');
		$modal.find('.modal-body').empty().append($emails);
		$modal.modal();
	});

	$('#get-signs').click(function() {
		$selectedSoldiers = $('#soldiers-table td.selection input[type=checkbox]:checked').closest('tr');
		if($selectedSoldiers.length==0) { 
			alert('No soldiers selected! Select the soldiers you want to create signs for first.');
			return;
		}

		function createStopForSign(stopid, adopter) {
			return "<span class='stop-for-sign'><input type='checkbox' checked/>"+
			"<span class='stopid'>"+stopid+"</span>(<span class='adopter'>"+adopter+"</span>)</span>";
		}

		var $tbody = $('#signs-to-print-table tbody').empty();
		var tbody_html = '';
		
		$selectedSoldiers.each(function(i,el) {
			$sol = $(el);
			
			var nameTd = "<td>";
			var soldierName = $sol.find('td.user-data .soldier-name').text();
			var firstName = soldierName.split(/[\s]+/)[0];
			nameTd += soldierName+'</td>';
			
			var previouslyGivenTd = '<td class="stops-with-signs">';
			var defaultAdopterName = null;
			$sol.find('td.notask-td span.stop:not(.nostopid)').each(function(i,el) {
				var $s = $(el);
				var agency = $s.find('.agency').text();
				var stopid = $s.find('.stopid').text();
				var nameonsign = $s.find('.nameonsign').text();
				if(nameonsign.length==0) {
					nameonsign = firstName;
				} else {
					if(defaultAdopterName===null) { defaultAdopterName = nameonsign; }
				}
				previouslyGivenTd += createStopForSign(agency+'_'+stopid, nameonsign);
			});
			previouslyGivenTd += "</td>";

			var neverGivenTd = "<td class='stops-without-signs'>";
			$sol.find('td.notgiven-td span.stop:not(.nostopid)').each(function(i,el) {
				var $s = $(el);
				var agency = $s.find('.agency').text();
				var stopid = $s.find('.stopid').text();
				var nameonsign = $s.find('.nameonsign').text();
				if(nameonsign.length==0) {
					nameonsign = (defaultAdopterName!==null) ? defaultAdopterName : firstName;
				}
				neverGivenTd += createStopForSign(agency+'_'+stopid, nameonsign);
			});
			neverGivenTd += '</td>';
			
			tbody_html += "<tr>"+nameTd + neverGivenTd + previouslyGivenTd + "</tr>";
		});

		$tbody.html(tbody_html);

		var $modal = $('#get-signs-modal');
		$modal.modal();
	});

	$('#get-signs-modal button.get-signs-ok-button').click(function() {
		var totalSigns = $('#signs-to-print-table input[type=checkbox]:checked').length;
		var defaultBatchSize = 10;

		var batchSize = defaultBatchSize;

		if(totalSigns > defaultBatchSize) {
			var input = prompt('We\'re about to create a LOT of signs. How many signs do you want per PDF?', defaultBatchSize);
			if(input===null) { 
				// cancelled
				return;
			}
			input = parseInt(batchSize);
			if(!isNaN(input)) {
				batchSize = input;
			} else {
				alert('Invalid number entered! Using '+defaultBatchSize+' as default');
			}
		}		

		var urlArgs = '';
		var count = 0;
		$('#signs-to-print-table input[type=checkbox]:checked').closest('span.stop-for-sign').each(function(i,el) {
			var $s = $(el);
			var stopid = $s.find(".stopid").text();
			var adopter = $s.find(".adopter").text();

			urlArgs += 'sids[]='+stopid+'&adopters[]='+adopter+'&';
			count ++;

			if(count>batchSize) {
				window.open('bus-sign/signs.php?'+urlArgs);
				urlArgs = '';
				count = 0;
			}
		})

		if(urlArgs.length != 0) {
			window.open('bus-sign/signs.php?'+urlArgs);
		}
	})

	$('#get-signs-modal button.copy-stopids').click(function() {
		$('#signs-to-print-table input[type=checkbox]:checked').closest('span.stop-for-sign').each(function(i,el) {
			var $s = $(el);
			var stopid = $s.find(".stopid").text().split('_');
			var adopter = $s.find(".adopter").text();
			console.log(stopid[0] +'\t' + stopid[1] + '\t' + adopter);
		})
		alert('check the browser console (if you are using chrome) and copy the values.');
	})

	$('#select-never-given-signs').click(function(e) {
		e.preventDefault();
		$('#signs-to-print-table td.stops-without-signs input[type=checkbox]').prop('checked', true).change();
		return false;
	});
	$('#deselect-never-given-signs').click(function(e) {
		e.preventDefault();
		$('#signs-to-print-table td.stops-without-signs input[type=checkbox]').prop('checked', false).change();
		return false;
	});
	$('#select-previously-given-signs').click(function(e) {
		e.preventDefault();
		$('#signs-to-print-table td.stops-with-signs input[type=checkbox]').prop('checked', true).change();
		return false;
	});
	$('#deselect-previously-given-signs').click(function(e) {
		e.preventDefault();
		$('#signs-to-print-table td.stops-with-signs input[type=checkbox]').prop('checked', false).change();
		return false;
	});

	$curr_modal_soldier = null;

	$('.user-data a.soldier-name').click(function(e) {
		e.preventDefault();

		var $details = $(this).closest('.user-data');

		var name = $details.find('a.soldier-name').text();
		var email = $details.find('span.email').text();
		var phone = $details.find('span.phone').text();
		var notes = $details.find('span.notes').text();
		var joindate = $details.closest('tr').find('td.join-date').text();

		var $m = $('#soldier-details-modal');

		$m.find('.soldiername input').val(name).refreshLabel();
		$m.find('.soldieremail input').val(email).refreshLabel();
		$m.find('.soldierphone input').val(phone).refreshLabel();
		$m.find('.soldiernotes textarea').val(notes).refreshLabel();

		$curr_modal_soldier = $details;

		$m.modal();

		return false;
	});

	$('#soldier-details-modal .update-soldierdetails').click(function() {
		if($curr_modal_soldier == null) { return; }

		var $m = $('#soldier-details-modal');

		var name = $m.find('.soldiername input').val();
		var email = $m.find('.soldieremail input').val();
		var phone = $m.find('.soldierphone input').val();
		var notes = $m.find('.soldiernotes textarea').text();

		var data = { name: name, email: email, phone: phone, notes: notes };

		$.ajax({
		  url: "../ajax/admin/update-soldierdetail.php",
		  type: "POST",
		  data: data,
		  dataType: 'json',
		  
		  success: function(d) {
			switch(d.status) {
			case 'success':
				// update soldier
				
				
				$curr_modal_soldier.find('a.soldier-name').text(name);
				$curr_modal_soldier.find('span.email').text(email);
				$curr_modal_soldier.find('span.phone').text(phone);
				$curr_modal_soldier.find('span.notes').text(notes);
				$curr_modal_soldier.closest('tr').find('td.join-date').text(joindate);

				$curr_modal_soldier.toggleClass('hasnotes', notes.length===0);

				$curr_modal_soldier = null;
					
				$m.modal('hide');
				break;

			case 'agencynull':
				alert('Agency cannot be left empty or blank.');
				break;

			case 'given_nameonsign':
				alert('If stop is marked as "given", then name on sign must also be filled. (and vice-versa).');
				break;

			case 'missing':
			default:
				console.log(d);
				alert('Oops, an error occurred: '+d.status);
			}
		},
		error: function(jqXHR, textStatus, errorThrown) {
			console.log(textStatus, errorThrown);
			alert('Oops, an error occurred.');
 		}});
	})

})