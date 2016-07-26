<?php
session_start();
if(!isset($_SESSION['image'])) {
	$_SESSION['image']="upload/Smiley.png";
}
else {
	$imageFile=$_SESSION['image'];
	if (!file_exists($imageFile)) {
		$_SESSION['image']="upload/Smiley.png";
	}
}
if (isset($_POST['filename'])) {
	$value=$_POST['filename'];
	if ($value!="") {
		if ($value=="resume") $filename="../Images/MyResume.PDF";
		else if ($value=="picture") $filename="../Images/Daryl Jones.PNG";
		else if ($value=="upload") $filename=$_SESSION['image'];
		if (isset($filename) && is_readable($filename)) {
			header("Content-Description: File Transfer");
			header("Content-Type: application/force-download");
			header("Content-Disposition: attachment; filename=\"" . $filename . "\"");
			header("Content-Transfer-Encoding: base64");
			header("Content-Length: " . filesize($filename));
			readfile($filename);
		}		
	}
}
if (isset($_POST['upload']) && !isset($_SESSION['uploadMessage'])) {
	$dir = "upload/";
	if (isset($_FILES['new_file'])) {
		$tmp_name=$_FILES['new_file']['tmp_name'];
		if ($tmp_name!=null) {
			if (getimagesize($tmp_name)===false) {			
				$_SESSION['uploadMessage'] = "File must be a JPEG or PNG image.";
			}
			else {
				$file_name=$dir . $_FILES['new_file']['name'];		
				if (move_uploaded_file($tmp_name,$file_name)==TRUE) {
					chmod($file_name, 0644);
					$currentImage=$_SESSION['image'];
					if ($currentImage!="upload/Smiley.png") {
						if (file_exists($currentImage)) { 
							unlink($currentImage);
						}
					}
					$_SESSION['image']=$file_name;
					// do garbage collection on upload folder whenever a new file is uploaded
					foreach (glob($dir."*") as $file) {
						$time=time()-fileatime($file);
						if ($time > 600 && $file!="upload/Smiley.png" && $file!=$file_name) {
							unlink($file);
						}
					}
				}
			}
		}
		else {
			$errorMessage="There was a problem uploading your file.".$_FILES['new_file']['error'];
			if ($_FILES['new_file']['error']==1 || $_FILES['new_file']['error']==1 || $_FILES['new_file']['size']>6291456) $errorMessage="The file exceeded the 6 MB max.";
			else if ($_FILES['new_file']['error']==4) $errorMessage="The file was only partially uploaded.";
			else if ($_FILES['new_file']['error']==4) $errorMessage="No file was uploaded.";
			$_SESSION['uploadMessage'] = $errorMessage;
			//header("Location:Portfolio.php");
		}	
	}	
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="language" content="english" />
    <meta name="description" content="Portfolio for Daryl P. Jones" />
    <meta name="keywords" content="daryl jones,daryl jones eugene,daryl p jones,daryl p jones eugene,web developer,web design,web designer,website design,website designer,programmer" />
    <meta name="author" content="Daryl P. Jones" />
    <meta name="google-site-verification" content="MNMppwab6Xhwkj9r4Cf_oPAVuf_tHAiqYGDGXbFnvR4" />
    <title>PHP Portfolio - Daryl P. Jones</title>
    <link href="/Content/bootstrap.min.css" rel="stylesheet" type="text/css" />
    <link href="/Content/custom.min.css" rel="stylesheet" type="text/css" />
	<link href="/Content/jquery-ui.min.css" rel="stylesheet" />
	<link href="/Content/PHPportfolio.css" rel="stylesheet" />
<style>
	
</style>
</head>
<body>
    <div class="navbar navbar-inverse navbar-fixed-top">
        <div class="container">
            <div class="navbar-header">
                <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                </button>
                <a href="/Home/Index" class="navbar-brand">Daryl P. Jones</a>
            </div>
            <div class="navbar-collapse collapse">
                <ul class="nav navbar-nav">
					<li class="dropdown page-links active">
                        <a href="#" data-toggle="dropdown" class="dropdown-toggle">Portfolio <b class="caret"></b></a>
                        <ul class="dropdown-menu">
                            <li><a href="/">ASP.NET</a></li>
                            <li><a href="/PHP/Portfolio.php">PHP</a></li>
                        </ul>
                    </li>
					<li class="page-links"><a href="/Home/About">About</a></li>
					<li class="page-links"><a href="/Home/Contact">Contact</a></li>
                </ul>
            </div>
        </div>
    </div>
	<div class="container body-content">   
		<div id="greeting" class="panel panel-default col-md-12" style="font-size:x-large;">
		<div class="panel-body">
			<p>Welcome to my <strong>PHP portfolio</strong>.  I also have an <a href="/">ASP.NET portfolio</a>.  Below you'll find examples of</p>
			
			<ul>
				<li class="col-md-6">Server Side Validation</li> 
				<li class="col-md-6">HTML5 Validation</li>
				<li class="col-md-6">File I/O</li>						
				<li class="col-md-6">JavaScript</li>
				<li class="col-md-6">MySQL</li>
				<li class="col-md-6">User Authentication</li>
				<li class="col-md-6">Bootstrap</li>
				<li id="listItem1" class="col-md-6">JQuery</li>
				<li id="listItem2" class="col-md-6">AJAX</li>
			</ul>
			<p id="thankyou-top" style="clear:both;">Thank you for taking the time to view my work.</p>
			</div>
		</div>
		<div class="col-md-6">
		<div class="panel panel-primary">
			<div class="panel-heading">
				<h3 class="panel-title">User Authentication</h3>
			</div>
			<div class="panel-body">
				<div class="loggedOut" style="display:none;">
					<p><span class="login">Don't have an account yet?  Click 
					<span class="fake-link" id="new-user-link">here</span> to register.</span>
					<span class="register" style="display:none;">Already have an account?  Click 
					<span class="fake-link" id="exist-user-link">here</span> to login.</span>
					Users are stored in a MySQL database.  Passwords are encrypted using md5.  
					Credentials created on the ASP.NET Portfolio will not work here and vice versa.</p>
					<p class="login">You can use my test account, which has an already populated To Do list and
					Event list.  The username is user1 and the password is Password1.</p>
					<div class="form-horizontal">
						<div class="form-group">
							<Label class = "control-label col-md-4 required">Username</label>
							<div class="col-md-8">
								<input class="form-control text-box single-line" id="username" name="username" type="text" value="">
							</div>
						</div>
						<div class="form-group">
							<Label class = "control-label col-md-4 required">Password</label>
							<div class="col-md-8">
								<input class="form-control text-box single-line" id="password" name="password" type="password" value="">
							</div>
						</div>
						<div class="form-group register" style="display:none;" >
							<Label class = "control-label col-md-4 required">Re-Enter Password</label>
							<div class="col-md-8">
								<input class="form-control text-box single-line" id="confirmPassword" name="confirmPassword" type="password" value="">
							</div>
						</div>
						<label class="col-md-12 text-danger messageLabel" id="loginMessage"></label>
						<div class="centered">
							<input type="button" id="loginButton" class="login btn btn-default" value="Login" />
							<input type="button" id="registerButton" class="register btn btn-default" value="Register" style="display:none;" />
						</div>
					</div>
				</div>
				<div class="loggedIn" style="display:none;">
				<h4>Welcome, <span id="welcomeUser">
				<?php
				if (isset($_SESSION['user'])) {
					echo $_SESSION['user'];
				}
				?>
				</span>.</h4>
				<label class="col-md-12 text-danger messageLabel" id="registerMessage"></label>
				<div style="text-align:center;">
					<input type="button" id="logoutButton" class="btn btn-default" value="Log Out" />
				</div>
				</div>
			</div>
		</div>
		<div class="panel panel-primary">
			<div class="panel-heading">
				<h3 class="panel-title">MySQL To Do List</h3>
			</div>
			<div class="panel-body">
				<div class="loggedIn">
					<p>You can change the order of the tasks in your to-do list by dragging and dropping them.  
					All changes are immediately saved to the database.<p>
					<div id="toDoBox" class="tableBox">
						<table id="toDoTable" class="table table-striped table-hover">
							<thead>
								<tr>
									<th>Task</th>
								</tr>
							</thead>	
							<tbody id="toDoBody"></tbody>
						</table>
					</div>
					<label class="col-md-12 text-danger messageLabel" id="toDoMessage"></label>
					<div id="addTaskBox">
						<input class="form-control text-box single-line" id="addTask" name="addTask" type="text" placeholder="To add a task, enter it here and click the Add button." value="">				
					</div>
					<div class="centered">
						<button type="button" id="addTaskButton" class="btn btn-default">Add</button>
						<button type="button" id="editTaskButton" class="btn btn-default">Edit</button>
						<button type="button" id="deleteTaskButton" class="btn btn-default">Delete</button>
					</div>
				</div>
				<div class="loggedOut">
					<p>You must be logged in to use this feature.  You can use the User Authentication form
					above to log in or register.<p>
				</div>	
			</div>
		</div>	

		<div class="panel panel-primary">
			<div class="panel-heading">
				<h3 class="panel-title">MySQL Event Scheduler</h3>
			</div>
			<div class="panel-body">
				<div class="loggedIn">
					<p>Create a list of events and set optional alarm reminders.  Point to events with
					an alarm icon for details.  There is a snooze feature for alarms.  Event list
					autoscrolls to newly added and edited events and highlights them.</p>
					
					<div id="appointmentBox" class="tableBox">
						<table id="appointmentTable" class="table table-striped table-hover">
							<thead>
								<tr>
									<th>When</th><th>What's Happening</th>
								</tr>
							</thead>
							<tbody id="appointmentBody"></tbody>
						</table>	
					</div>
					<label class="col-md-12 text-danger messageLabel" id="appointmentMessage">&nbsp;</label>
					<div class="centered">
						<button type="button" id="addAppointmentButton" class="btn btn-default">Add</button>
						<button type="button" id="editAppointmentButton" class="btn btn-default">Edit</button>
						<button type="button" id="deleteAppointmentButton" class="btn btn-default">Delete</button>	
					</div>
				</div>
				<div class="loggedOut">
					<p>You must be logged in to use this feature.  You can use the User Authentication form
					above to log in or register.<p>
				</div>	
			</div>
		</div>
				
		</div>
		<div class="col-md-6">
		<div class="panel panel-primary">
			<div class="panel-heading">
				<h3 class="panel-title">Upload File</h3>
			</div>
			<div class="panel-body">
				<form method="POST" action="Portfolio.php" enctype="multipart/form-data">
					<p>Replace the smiley face with one of your own pictures.  Server side 
					validation ensures that only an image is uploaded, and that it is 6MB 
					or less.  Uploaded images might be deleted from the server if they have 
					not been accessed for ten minutes.</p>
					<div id="file-upload" style="margin-bottom:1em;width:50%;float:left;">
						<label>File to upload:</label>
						<div id="fileToUpload">None selected</div>
						<div id="fileUpload" style="float:left;">
							<div id="parent">
							<input type="hidden" name="MAX_FILE_SIZE" value="6291456" />
							<input type="file" id="new_file" name="new_file" accept="image/*" required />
								<div id="child">
									<button type="button" class="btn btn-default">Browse</button>
								</div>
							</div>				
						</div>
						<div style="float:left;margin-left:5px;"><input class="btn btn-default" id="uploadButton" type="submit" name="upload" value="Upload" />
						</div>
						<div style="clear:both;">
						(6 MB limit)
						</div>
						<div id="uploadLoadingIcon"></div>
						<label class="col-md-12 text-danger messageLabel" id="uploadMessage">
						<?php 
						if (isset($_SESSION['uploadMessage'])) {
							echo $_SESSION['uploadMessage'];
							unset($_SESSION['uploadMessage']);
						}
						?>	
						</label>		
					</div>
					<div style="width:50%;float:left;" id="image-box">
						<?php
						if (isset($_SESSION['image'])) {
						$imageFile = pathinfo($_SESSION['image']);
						echo '<img src="'.$_SESSION['image'].'" alt="'.$imageFile['filename'].'" />'; 		
						}
						?>
					</div>
				</form>
			</div>
		</div>
		<div class="panel panel-primary">
			<div class="panel-heading">
				<h3 class="panel-title">Download File</h3>
			</div>
			<div class="panel-body">
				<form method="POST" id="downloadForm" action="Portfolio.php">
					<fieldset>
						<p>JavaScript is used to make sure the file exists before initiating download
						request.  PHP reads the requested file and sets the proper HTTP headers to 
						trigger the browser to download the file.</p>
						<label class="col-md-12 text-danger messageLabel" id="downloadMessage"></label>
						<div class="col-md-8">
							<select class="form-control" name="filename" id="filename" required>
								<option selected="Selected" value="">Please Select</option>
								<option value="resume">My Resume</option>
								<option value="picture">My Picture</option>
								<?php if ($_SESSION['image']!="upload/Smiley.png") {
									echo '<option value="upload">Your Upload</option>';
								}
								?>
							</select>
						</div>
						<div class="col-md-4">
							<input type="submit" name="download" class="btn btn-default" value="Download" />
						</div>
					</fieldset>
				</form>
			</div>
		</div>	
		<div class="panel panel-primary">
			<div class="panel-heading">
				<h3 class="panel-title">Getting Customer Feedback</h3>
			</div>
			<div class="panel-body">
				<form id="custExperience"> 
					<fieldset>
						<p>
							This form does not specify what feedback must be given, but it does require the user
							to provide a response to at least one feedback prompt.  Validation is handled server side using PHP and AJAX.
							Anything you submit is stored for the duration of the session.  You can view your submissions
							by clicking the View All button.
						</p>
						<div class="form-horizontal">
							<div class="form-group">
								<Label class = "control-label col-md-4 required">Date of Visit</label>
								<div class="col-md-8">
									<input class="form-control text-box single-line" id="feedbackdate" name="feedbackdate" type="text" value="">
								</div>
							</div>
							<div class="form-group">
								<Label class = "control-label col-md-4 required">Store Location</label>
								<div class="col-md-8">
									<select class="form-control" name="store" id="store">
										<option selected="Selected" value="none">Please Select</option>
										<option value="main">Eugene Main Street</option>
										<option value="coburg">Eugene Coburg Road</option>
										<option value="springfield">Springfield</option>
										<option value="cottage">Cottage Grove</option>
									</select>
								</div>
							</div>
							<div class="form-group">
								<Label class = "control-label col-md-8">Were items easy to find?</label>
								<div class="col-md-4">
									<label class = "control-label">Yes</label>
									<input class="radio-inline" type="radio" name="easy" id="eYes" value="yes" />
									<label class = "control-label">No</label>
									<input class="radio-inline" type="radio" name="easy" id="eNo" value="no" />
								</div>
							</div>
							<div class="form-group">
								<Label class = "control-label col-md-8">Was the staff friendly and helpful?</label>
								<div class="col-md-4">
									<label class = "control-label">Yes</label>
									<input class="radio-inline" type="radio" name="staff" id="sYes" value="yes" />
									<label class = "control-label">No</label>
									<input class="radio-inline" type="radio" name="staff" id="sNo" value="no" />
								</div>
							</div>
							<div class="form-group">
								<Label class = "control-label col-md-6">Rate Overall service</label>
								<div class="col-md-6">
									<label>Poor</label><label style="float:right;">Great</label>
									<input name="service" id="service" type="range" value=5 min="0" max="10" step=1 />					
								</div>
							</div>
							<div class="form-group">
								<Label class = "control-label col-md-6">What can we do better?</label>
								<div class="col-md-6">
									<textarea class="form-control" rows="3" id="comments" name="comments"></textarea>									
								</div>
							</div>
						</div>
						<label class="col-md-12 text-danger messageLabel" id="feedbackMessage"></label>
					</fieldset>
					<div class="centered">
						<input type="button" value="View All" id="feedbackViewAll" class="btn btn-default" />
						<input type="submit" value="Submit" class="btn btn-default" />
					</div>
					<label class="required">Required</label>
				</form>
				</div>
			</div>
	</div>
		
		<hr />
		<footer>
			<p>&copy; <?php echo date('Y'); ?> - Daryl P. Jones</p>
		</footer>
	</div>
	
	<div class="modal fade" id="feedbackTable">
		<div class="modal-dialog modal-lg">
			<div class="modal-content">
				<div class="modal-header">
					<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
					<h4 class="modal-title">All Your Submitted Feedback</h4>
				</div>
				<div class="modal-body">
					<table class="table table-striped table-hover">
						<thead>
							<tr>
								<th>Date</th>
								<th>Store</th>
								<th>Find Items</th>
								<th>Friendly Staff</th>
								<th>Service</th>
								<th>Do Better</th>
							</tr>
						</thead>
						<tbody id="feedbackBody"></tbody>
					</table>
				</div>
				<div class="modal-footer">
					<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
				</div>
			</div>
		</div>
	</div>
	
	<div class="modal" id="addAppointmentTable">
		<div class="modal-dialog">
			<div class="modal-content">
				<div class="modal-header">
					<h4 class="modal-title"><span id="appointmentModalTitle"></span></h4>
				</div>
				<div class="modal-body">
					<p>"Date" and "What's Happening?" are required.  Time is optional.  If you select a reminder, you will receive an alert
					at your chosen time.  You must be on this PHP Portfolio page and logged in to receive your alerts.</p>
					<hr />
					<input type="hidden" id="appointmentId" value="">
					<div class="form-horizontal">
						<div class="form-group row">
							<div class="col-md-4">
								<input class="form-control text-box single-line required" id="appointmentDate" name="appointmentDate" type="text" placeholder="Date" value="">
							</div>
							<div class="col-md-4">
								<select class="form-control placeholder" name="appointmentTime" id="appointmentTime">
									<option class="placeholder" selected="Selected" value="-1">Time?</option>
									<option value="-2">All Day</option>
									<?php
										for ($hour=6; $hour<24; $hour++) {
											for ($minute=0; $minute<4; $minute++) {
												$ampm="am";		
												$displayMinute=$minute*15;											
												$value=($hour*60)+$displayMinute;
												$displayHour=$hour;
												if ($hour>12) {
													$displayHour=$hour-12;
												}
												if ($displayMinute=="0") {
													$displayMinute="00";
												}
												if ($hour==0) {
													$displayHour="12";
												}
												else if ($hour>11) {
													$ampm="pm";
												}
												$displayTime=$displayHour.":".$displayMinute.$ampm;
												echo '<option value="'.$value.'">'.$displayTime.'</option>';
											}
										}
										for ($hour=0; $hour<6; $hour++) {
											for ($minute=0; $minute<4; $minute++) {
												$ampm="am";
												$displayMinute=$minute*15;											
												$value=($hour*60)+$displayMinute;
												if ($displayMinute=="0") {
													$displayMinute="00";
												}
												if ($hour==0) {
													$displayHour="12";
												}
												else if ($hour>12) {
													$displayHour=$hour-12;
													$ampm="pm";
												}
												else{
													$displayHour=$hour;
												}
												$displayTime=$displayHour.":".$displayMinute.$ampm;
												echo '<option value="'.$value.'">'.$displayTime.'</option>';
											}
										}
									?>
								</select>
							</div>
							<div class="col-md-4">
								<select class="form-control placeholder" name="appointmentReminder" id="appointmentReminder">
									<option class="placeholder" selected="Selected" value="-1">Reminder?</option>
									<?php
										$reminders=array(0,5,10,15,30,1,2,3,4,5,6,12,1,2,3,1,2);
										$multiplier=array(1,1,1,1,1,60,60,60,60,60,60,60,1440,1440,1440,10080,10080);
										$duration=array("minutes","minutes","minutes","minutes","minutes","hour","hours","hours","hours","hours","hours","hours",
											"day","days","days","week","weeks");
										$length = count($reminders);
										for ($i = 0; $i < $length; $i++) {
											$value=$reminders[$i]*$multiplier[$i];
											$text=$reminders[$i].' '.$duration[$i];
											echo '<option value="'.$value.'">'.$text.'</option>';
										}
									?>
								</select>
							</div>
						</div>
						<div class="row">
							<div class="col-md-12">
								<textarea rows="2" class="form-control" id="appointmentDescripion" name="appointmentDescription" placeholder="What's Happening?"></textarea>	
							</div>
						</div>
					</div>		
				</div>					
				<div class="modal-footer">
					<label class="col-md-12 text-danger messageLabel" id="addAppointmentMessage"></label>
					<button id="saveAppointmentButton" type="button" class="btn btn-default">Save</button>
					<button id="closeAddAppointmentButton" type="button" class="btn btn-default">Close</button>
				</div>
			</div>
		</div>
	</div>
	
	<div class="modal" id="alarmWindow">
		<div class="modal-dialog">
			<div class="modal-content">
				<div class="modal-header">
					<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
					<h4 class="modal-title">Reminder</h4>
				</div>
				<div class="modal-body">
					<table class="table table-striped table-hover">
						<thead>
							<tr>
								<th>When</th><th>What's Happening</th>
							</tr>
						</thead>
						<tbody id="alarmBody"></tbody>
					</table>								
				</div>			
				<div class="modal-footer">
					<label class="col-md-12 text-danger messageLabel" id="snoozeMessage"></label>
					<div class="form-inline">
						<select class="form-control" name="snooze" id="snooze">
							<?php
								$reminders=array(5,10,15,30,1,2,3,4,5,6,12,1,2,3,1,2);
								$multiplier=array(1,1,1,1,60,60,60,60,60,60,60,1440,1440,1440,10080,10080);
								$duration=array("minutes","minutes","minutes","minutes","hour","hours","hours","hours","hours","hours","hours",
									"day","days","days","week","weeks");
								$length = count($reminders);
								for ($i = 0; $i < $length; $i++) {
									$value=$reminders[$i]*$multiplier[$i];
									$text=$reminders[$i].' '.$duration[$i];
									echo '<option value="'.$value.'">'.$text.'</option>';
								}
							?>
						</select>
						<button id="snoozeButton" type="button" class="btn btn-default">Snooze</button>
						<button id="dismissAlarmButton" type="button" class="btn btn-default">Dismiss</button>
						<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
					</div>
				</div>
			</div>
		</div>
	</div>
	
	<div class="modal" id="editTaskModal">
		<div class="modal-dialog modal-sm">
			<div class="modal-content">
				<div class="modal-header">
					<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
					<h4 class="modal-title">Edit Task</h4>
				</div>
				<div class="modal-body">
					<input id="editTaskObject" type="hidden" />
					<div class="row">
						<div class="col-md-12">
							<textarea class="form-control" rows="3" id="editTaskText"></textarea>
						</div>
					</div>					
				</div>			
				<div class="modal-footer">
					<label class="col-md-12 text-danger messageLabel" id="editTaskMessage"></label>
					<button id="saveEditTaskButton" type="button" class="btn btn-default">Save</button>
					<button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
				</div>
			</div>
		</div>
	</div>
	
	<div class="modal" id="appointmentDetailsModal">
		<div class="modal-dialog">
			<div class="modal-content">
				<div class="modal-header">
					<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
					<h4 class="modal-title">Appointment Details</h4>
				</div>
				<div class="modal-body">
					<div class="row">
						<div id="appointmentDetailsBody">	
						</div>
					</div>					
				</div>			
				<div class="modal-footer">
					<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
				</div>
			</div>
		</div>
	</div>
	
	<script src="/Scripts/modernizr-2.6.2.js"></script>
	<script src="/Scripts/jquery-2.2.3.min.js"></script>
	<script src="/Scripts/bootstrap.min.js"></script>
	<script src="/Scripts/jquery-ui.min.js"></script>
	<script src="/Scripts/PHPportfolio.js"></script>
	<script>
	$(document).ready(function () {
		<?php
		if (isset($_SESSION['user'])) {
			echo "$('.loggedIn').show();$('.loggedOut').hide();checkTime = setInterval(function(){ getAlerts() }, 60000);getToDoList();getAppointmentList(-1);";
		}
		else {
			echo "$('.loggedIn').hide();$('.loggedOut').show();";
		}
		?>
	});	
	</script>
</body>
</html>
