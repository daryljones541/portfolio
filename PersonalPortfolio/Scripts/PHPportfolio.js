$(document).ready(function () {
	// Get rid of messages to user whenever user begins to do something
	$('input:not(:button), textarea, select').focus(function() {
		$('.messageLabel').html('&nbsp;');
	});

    // FILE UPLOAD/DOWNLOAD FUNCTIONS

	$('#new_file').on("change", function(e){
		$('#fileToUpload').html(e.target.files[0].name); 
	});
	
	$('#uploadButton').click(function() {
		$('.messageLabel').html('&nbsp;');
		if ($('#fileToUpload').html()!="None selected") {
			$('#uploadLoadingIcon').html('<img src="../Images/Loading_2_transparent.gif" alt="loading image" />');
		}
	});
	
	$('#downloadForm').on('submit', function (e) {
		$('.messageLabel').html('&nbsp;');
		var fileSelection=$('#filename option:selected').val();
		var file="";
		if (fileSelection=='resume') file="../Images/MyResume.PDF";
		else if (fileSelection=='picture') file="../Images/Daryl Jones.PNG";
		else if (fileSelection=='upload') file="<?php echo $_SESSION['image']; ?>";
		if (file!="") {
			var http = new XMLHttpRequest();
			http.open('HEAD', file, false);
			http.send();
			
			if (http.status==404) {
				$('#downloadMessage').html("There was a problem reading the file.");
				e.preventDefault();
			}
		}
		else {
			$('#downloadMessage').html("Please select a file.");
			e.preventDefault();
		}
	});

    // APPOINTMENT FUNCTIONS

	$('#appointmentDate').datepicker();
	
	$('#deleteAppointmentButton').click(function() {
		$('.messageLabel').html('&nbsp;');
		var id=$('#appointmentBody tr.highlighted').attr('id');
		if (id!=null) {
			$.ajax({
				type: 'post',
				url: 'formFunctions.php',
				data: { appointid:id },
				success: function (data) {				
					if (data=="success") {
						$('#'+id).remove();
					}
					else {
						$('#appointmentMessage').html('There was a problem deleting your appointment.');
					}
				}
			  });
		}
		else {
			$('#appointmentMessage').html("Click on an event to highlight it first.");
		}
	});
	
	$('#dismissAlarmButton').click(function() {
		$('.messageLabel').html('&nbsp;');
		var id=$('#alarmBody tr.highlighted').attr('id');
		if (id!=null) {
			var tableId=id.substr(1,id.length);
			$.ajax({
				type: 'post',
				url: 'formFunctions.php',
				data: { dismissalarm:true, id:tableId },
				success: function (data) {
					if (data=="success") {
						$('#'+id).remove();
						$('#'+tableId).removeClass('display-event');
						$('#'+tableId).children('td').children('img').remove();
					}
				}
			});
		}
		else {
			$('#snoozeMessage').html("Click on an event to highlight it first.");
		}
	});
	
	$('#snoozeButton').click(function() {
		$('.messageLabel').html('&nbsp;');
		var id=$('#alarmBody tr.highlighted').attr('id');		
		if (id!=null) {
			var tableId=id.substr(1,id.length);
			var snooze=$('#snooze option:selected').val();
			$.ajax({
				type: 'post',
				url: 'formFunctions.php',
				data: { snooze:snooze, id:tableId },
				success: function (data) {
					if (data=="success") {
						$('#'+id).remove();
					}
				}
			});
		}
		else {
			$('#snoozeMessage').html("Click on an event to highlight it first.");
		}
	});
	
	$('#editAppointmentButton').click(function() {
		$('.messageLabel').html('&nbsp;');			
		var id=$('#appointmentBody tr.highlighted').attr('id');
		if (id!=null) {
			$.ajax({
			type: 'post',
			url: 'formFunctions.php',
			data: { editappointment:true,id:id },
			dataType:"json",
			success: function (data) {
				if (data['status']=='success') {
					$('#appointmentDate').val(data['date']);
					$('#appointmentDescripion').val(data['description']);
					if (data['time']!=-1) $('#appointmentTime').removeClass("placeholder");
					else $('#appointmentTime').addClass("placeholder");
					$('#appointmentTime').val(data['time']);
					if (data['reminder']!=-1) $('#appointmentReminder').removeClass("placeholder");
					else $('#appointmentReminder').addClass("placeholder");
					$('#appointmentReminder').val(data['reminder']);
					$('#appointmentModalTitle').html('Edit Appointment');
					$('#appointmentId').val(data['id']);
					$('#addAppointmentTable').modal('show');
				}
				else {
					$('#addAppointmentMessage').html("There was a problem saving your edit.");
				}
			}
		  });
		}
		else {
			$('#appointmentMessage').html('Click on an event to highlight it first.');
		}
	});
	
	$('#addAppointmentButton').click(function() {
		$('.messageLabel').html('&nbsp;');
		$('#appointmentModalTitle').html('Add Appointment');
		$('#appointmentDate').val('');
		$('#appointmentDescripion').val('');
		$('#appointmentTime').val('-1');
		$('#appointmentReminder').val('-1');
		$('#appointmentReminder').addClass("placeholder");
		$('#appointmentTime').addClass("placeholder");
		$('#appointmentId').val('');
		$('#addAppointmentTable').modal('show');
	});
	
	$('#closeAddAppointmentButton').click(function() {
		$('#addAppointmentTable').modal('hide');;
	});
	
	$('#saveAppointmentButton').click(function() {
		$('.messageLabel').html('&nbsp;');
		var date=$('#appointmentDate').val();
		var description=$('#appointmentDescripion').val();
		var errorMessage="";
		if (date=="") {
			errorMessage+="Date is required. ";
		}
		if (description=="") {
			errorMessage+="What's Happening is required.";
		}	
		if (errorMessage=="") {
			var time=$('#appointmentTime option:selected').val();
			var reminder=$('#appointmentReminder option:selected').val();		
			var id=$('#appointmentId').val();
			
			if (id=="") {
				$.ajax({
					type: 'post',
					url: 'formFunctions.php',
					data: { date:date,time:time,reminder:reminder,description:description },
					dataType:"json",
					success: function (data) {
						if (data['status']=="success") {
							$('#addAppointmentTable').modal('hide');
							getAppointmentList(data['id']);				
						}
						else {
							$('#addAppointmentMessage').html('There was a problem saving your appointment.');
						}
					}
				  });
			}	
			else {
			$.ajax({
				type: 'post',
				url: 'formFunctions.php',
				data: { id:id,date:date,time:time,reminder:reminder,description:description },
				success: function (data) {
						$('#addAppointmentTable').modal('hide');
						getAppointmentList(id);						
					}
			  });
			}
		}
		else $('#addAppointmentMessage').html(errorMessage);	
		
	});
	
    // PLACEHOLDERS IN ADD/EDIT APPOINTMENT FUNCTIONS

	$('select.placeholder').on('change', function() {
		if ($(this).val()=="none") {
			$(this).addClass("placeholder");
		}
		else {
			$(this).removeClass("placeholder");
		}
	});
	
    // USER AUTHENTICATION FUNCTIONS

	$('#registerButton').click(function() {
		$('.messageLabel').html('&nbsp;');
		var errorMessage="";
		var username=$('#username').val();
		var password=$('#password').val();
		var confirmPassword=$('#confirmPassword').val();
		if (username=="") errorMessage+="Username is required. ";
		if (password=="") errorMessage+="Password is required. ";
		if (confirmPassword=="") errorMessage+="Re-Enter password is required. ";
		if (password!=confirmPassword) errorMessage+="The passwords do not match.";
		if (errorMessage=="") {
			$.ajax({
			type: 'post',
			url: 'formFunctions.php',
			data: { mode:'register', username:username, password:password },
			success: function (data) {
				if (data=='exists') {
					$('#loginMessage').html('Username already taken.  Please choose another.');
				}
				else if (data=='created') {
					$('#registerMessage').html('User account created successfully.');
					$('#welcomeUser').html(username);
					$('.loggedOut').slideUp("slow", function () {
					    $('.loggedIn').slideDown("slow");
					});

				    //$('.loggedIn').show();
					//$('.loggedOut').hide();
				}
				else $('#loginMessage').html("There was a problem creating your account.");
			}
		  });
		}
		else $('#loginMessage').html(errorMessage);
	});
	
	$('#loginButton').click(function() {
		$('.messageLabel').html('&nbsp;');
		var username=$('#username').val();
		var password=$('#password').val();
		$.ajax({
		type: 'post',
		url: 'formFunctions.php',
		data: { mode:'login', username:username, password:password },
		success: function (data) {
			if (data=='none') {
				$('#loginMessage').html('Incorrect username or password.  Please try again.');
			}
			else if (data=='loggedin') {
				getToDoList();
				getAppointmentList(-1);
				$('#welcomeUser').html(username);
				$('.loggedOut').slideUp("slow", function () {
				    $('.loggedIn').slideDown("slow");
				});
				//$('.loggedIn').show();
				//$('.loggedOut').hide();
				checkTime = setInterval(function(){ getAlerts() }, 300000);
				getAlerts();
			}
			else if (data=='fail') {
				$('#loginMessage').html("There was a problem connecting to the server.");
			}
			else {
				$('#loginMessage').html(data);
				//$('#loginMessage').html("There was a problem logging you in.");
			}
		}
	  });
	});
	
	$('#logoutButton').click(function() {
		$('.messageLabel').html('&nbsp;');
		$.ajax({
		type: 'post',
		url: 'formFunctions.php',
		data: { logout:'yes' },
		success: function () {
		    $('.loggedIn').slideUp("slow", function () {
		        $('.loggedOut').slideDown("slow");
		    });
			//$('.loggedIn').hide();
		    //$('.loggedOut').show();
		    $('.register').slideUp("slow", function () {
		        $('.login').slideDown("slow");
		    });
			$('#register-text').hide();
			$('#login-text').show();
			clearInterval(checkTime);
		}
	  });
	});
	
	$('#new-user-link').click(function() {
	    $('.messageLabel').html('&nbsp;');
	    $('.login').slideUp("slow", function () {
	        $('.register').slideDown("slow");
	    });
		$('#register-text').show();
		$('#login-text').hide();
	});
	
	$('#exist-user-link').click(function() {
	    $('.messageLabel').html('&nbsp;');
	    $('.register').slideUp("slow", function () {
	        $('.login').slideDown("slow");
	    });
		$('#register-text').hide();
		$('#login-text').show();
	});
		
    // HIGHLIGHT ROW ON CLICK FUNCTIONS FOR TO DO LIST, APPOINTMENT LIST, AND REMINDER LIST

	$("#alarmBody").on("click", "tr", function() {
		$('.messageLabel').html('&nbsp;');
		$("#alarmBody tr").removeClass('highlighted');
		$(this).addClass('highlighted');
	});
	
	$('#alarmWindow').click(function(e) {
		if (!$(e.target).closest('#alarmBody tr').length) {
			$("#alarmBody tr").removeClass('highlighted');
		}
	});
	
	$("#appointmentBody").on("click", "tr", function() {
		$('.messageLabel').html('&nbsp;');
		$("#appointmentBody tr").removeClass('highlighted');
		$(this).addClass('highlighted');
	});
	
	$(document).click(function(e) {
		if (!$(e.target).closest('#appointmentBody tr').length) {
			$("#appointmentBody tr").removeClass('highlighted');
		}
	});
	
	$("#toDoBody").on("click", "td", function() {
		$('.messageLabel').html('&nbsp;');
		$("#toDoBody td").removeClass('highlighted');
		$(this).addClass('highlighted');
	});
	
	$(document).click(function(e) {
		if (!$(e.target).closest('#toDoBody td').length) {
			$("#toDoBody td").removeClass('highlighted');
		}
	});
	
    // TO DO LIST FUNCTIONS

	$('#toDoBody').sortable({
		update: function (event, ui) {
			$('.messageLabel').html('&nbsp;');
			reorderToDo();
		}
	});	
	
	$('#addTaskButton').click(function() {
		$('.messageLabel').html('&nbsp;');
		var task=$('#addTask').val();
		if (task!="") {
			$.ajax({
				type: 'post',
				url: 'formFunctions.php',
				data: { addtask:task },
				success: function (data) {
					$('#toDoBody').append('<tr><td id="toDo'+data+'">'+task+'</td></tr>');
					$('#addTask').val('');
					$('#toDoBox').animate({ scrollTop: $('#toDoBox').prop("scrollHeight")}, 1000);
				}
			});
		}
		else {
			$('#toDoMessage').html('Enter your new task in the field below.');
		}
	});
	
	$('#deleteTaskButton').click(function() {
		$('.messageLabel').html('&nbsp;');
		var selectedTask=$('#toDoBody td.highlighted');
		var id=selectedTask.attr('id');
		if (id!=null) {
			var index=id.substr(4);
			$.ajax({
				type: 'post',
				url: 'formFunctions.php',
				data: { deletetask:index },
				success: function (data) {
					selectedTask.remove();
					$('#addTask').val('');
				}
			});
		}
		else {
			$('#toDoMessage').html('Click on a task to highlight it first.');
		}
	});
	
	$('#editTaskButton').click(function() {
		$('.messageLabel').html('&nbsp;');
		var selectedTask=$('#toDoBody td.highlighted');
		var id=selectedTask.attr('id');
		if (id!=null) {
			var index=id.substr(4);
			$('#editTaskText').val(selectedTask.html());
			$('#editTaskObject').val(index);
			$('#editTaskModal').modal('show');
		}
		else {
			$('#toDoMessage').html('Click on a task to highlight it first.');
		}
	});
	
	$('#saveEditTaskButton').click(function() {
		var editTaskText=$('#editTaskText').val();
		var index=$('#editTaskObject').val();		
		$.ajax({
			type: 'post',
			url: 'formFunctions.php',
			data: { updatetask:index,task:editTaskText },
			success: function (data) {
				$('#toDo'+index).html(editTaskText);
				$('#editTaskModal').modal('hide');
			}
		});
	});
	
    // CUSTOMER FEEDBACK FORM FUNCTIONS

	$('#feedbackdate').datepicker();
	
	$('#custExperience').on('submit', function (e) {
		$('.messageLabel').html('&nbsp;');
		e.preventDefault();

		$.ajax({
		type: 'post',
		url: 'formFunctions.php',
		data: $('#custExperience').serialize(),
		success: function (data) {
			if (data=='true') {
				$('#feedbackMessage').html(data);
				$('#feedbackMessage').html('Your information was saved.');
				$('#custExperience')[0].reset();
			}
			else $('#feedbackMessage').html(data);
		}
	  });
	});

	$('#feedbackViewAll').click(function() {
		$('.messageLabel').html('&nbsp;');
		$.ajax({
			type: "post",
			url: "formFunctions.php",
			data: { feedbackList: 'get' },
			dataType:"json",
			success: function (data) {
				if (data!="empty") {
					var tableBody = "";
					for (var x = 0; x < data.length; x++) {
						var formDate = data[x].date;
						var formStore = data[x].store;
						var formEasy = data[x].easy;
						var formStaff = data[x].staff;
						var formService = data[x].service;
						var formComments = data[x].comments;
						tableBody += "<tr><td>" + formDate + "</td><td>" + formStore + "</td><td>" + formEasy + "</td><td>" + formStaff + "</td><td>" + formService + "</td><td>" + formComments + "</td></tr>";
					}
				}
				else tableBody="";
				$('#feedbackBody').html(tableBody);
			}
		});
		$('#feedbackTable').modal('show');
	});
});
	
// Get list of active (returns 'set') Appointment reminders, if any are returned, 
// call function to display them
function getAlerts() {
	$.ajax({
		type: 'post',
		url: 'formFunctions.php',
		data: { getalerts:true },
		dataType:"json",
		success: function (data) {
			if (data[0]['status']=='set') {
				alarm(data);
			}
		}
	});
}

// Display Appointment reminders
function alarm(data) {
	var alarmText="";
	$.each(data, function(index) {
		if (data[index].time=="") {
			alarmText+='<tr id="a'+data[index].id+'"><td>'+data[index].date+'</td><td>'+data[index].description+'</td></tr>';
		}
		else {
			alarmText+='<tr id="a'+data[index].id+'"><td>'+data[index].date+' '+data[index].time+'</td><td>'+data[index].description+'</td></tr>';
		}
	});
	// check if the reminder window is already visible
	if ($('#alarmWindow').is(':visible')) {
		// if so, see if the reminders it is displaying need updating
		var currentText=$('#alarmBody').html().replace(' class="highlighted"', '');
		if (currentText!=alarmText) $('#alarmBody').html(alarmText);
		return;	
	}
	
	else {
		$('#alarmBody').html(alarmText);
		// check if any other modal is open;
		// if so, close it and remember it, and
		// when the reminder window is closed,
		// redisplay it
		if ($('.modal').is(':visible')) {
		var openModal=$('.modal:visible');
		openModal.modal('hide');
		$('#alarmWindow').on('hidden.bs.modal', function () {
			openModal.modal('show');
		})
	}
	else {
		// if no other modal is open, 
		// remove all 'on' event handlers
		// from reminder modal 
		$('#alarmWindow').off();
	}
	$('#alarmWindow').modal('show');
	}
	
}

// Get and display To Do list
function getToDoList() {
	$.ajax({
		type: 'post',
		url: 'formFunctions.php',
		data: { gettasks:true },
		dataType:"json",
		success: function (data) {
			var toDoList="";
			for (var x = 0; x < data.length; x++) {
				toDoList+='<tr><td id="toDo'+data[x].id+'">'+data[x].task+'</td></tr>';
			}
			$('#toDoBody').html(toDoList);
			$('#addTask').val('');
		}
	});		
}

// Backup the currently displayed To Do list to the database
function reorderToDo() {
	var tasks = [];
	var counter=0;
	$("#toDoBody td").each(function() {
		tasks[counter] = $(this).html();
		counter++;
	});
	$.ajax({
		type: 'post',
		url: 'formFunctions.php',
		data: { reordertasks:tasks },
		success: function (data) {
			if (data=='success') {
			}
			else if (data=='error') $('#toDoMessage').html('There was a problem saving your list.');
		}
	});		
}

// Get and display Appointment list; if id of an Appointment is passed, highlight it and scroll to it, 
// which is used to highlight a newly added Appointment
function getAppointmentList(id) {
	$('#appointmentMessage').html('');
	$.ajax({
		type: 'post',
		url: 'formFunctions.php',
		data: { appointment:true },
		dataType:"json",
		success: function (data) {
			var appointmentList="";
			for (var x = 0; x < data.length; x++) {
				if (data[x].active==1) appointmentList+='<tr class="display-event" ';
				else appointmentList+='<tr ';
				appointmentList+='id="'+data[x].id+'"><td>'+data[x].date+' '+data[x].time;
				if (data[x].active==1) {
					appointmentList+='<img id="Alarm set for '+data[x].reminder+'" src="../Images/Nuvola_apps_kalarm.png" alt="alarm" />';
				} 
				appointmentList+='</td><td>'+data[x].description+'</td></tr>';
			}
			$('#appointmentBody').html(appointmentList);
			if (id>-1) {
				$('#'+id).addClass('highlighted');
				var scrollTo=$('#appointmentBox').scrollTop() - $('#appointmentBox').offset().top + $('#'+id).offset().top - ($('#appointmentBox').height()/2 - $('#'+id).height()/2);
				$('#appointmentBox').animate({ scrollTop: scrollTo }, 1000); 
			}
			$('.display-event').mouseenter(function () {
				var eventText = $(this).children('td').children('img').attr('id');
				$('#appointmentMessage').html(eventText);
		   }).mouseleave(
			function () {
				$('#appointmentMessage').html('&nbsp;');
			});
		}
	});
}