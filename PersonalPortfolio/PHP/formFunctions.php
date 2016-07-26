<?php
session_start();
date_default_timezone_set('America/Los_Angeles');
include 'winhostDB.php';

// Event list functions
if(isset($_POST['editappointment'])){
	if(isset($_POST['id'])){
		if(isset($_SESSION['userid'])) {
			$userid=$_SESSION['userid'];
			$id=$_POST['id'];
			@$db=mysqli_connect(DBHOST,DBUSER,DBPASSWORD,DBNAME);
			$SQLstring="select * from appointment where userid=$userid and id=$id";
			$query=$db->query($SQLstring);
			$appointment=array();
			if ($query) {
				$row=$query->fetch_assoc();
				$query->free();
				$db->close();
				$appointment['id']=$row['id'];
				$timestamp=strtotime($row['date']);
				$appointment['date']=date('m/d/Y',$timestamp);
				$appointment['time']=$row['time'];
				$appointment['description']=$row['description'];
				$appointment['reminder']=$row['reminder'];
				$appointment['status']="success";		
			}
			else {
				$appointment['status']="error";	
			}
			echo json_encode($appointment);
			exit;
		}
	}
}

if(isset($_POST['dismissalarm'])){
	if(isset($_POST['id'])){
		if(isset($_SESSION['userid'])) {
			$userid=$_SESSION['userid'];
			$id=$_POST['id'];
			@$db=mysqli_connect(DBHOST,DBUSER,DBPASSWORD,DBNAME);
			$SQLstring="update appointment set active=0 where id=? and userid=?";
			$statement=$db->prepare($SQLstring);
			$statement->bind_param("ii",$id,$userid);
			$query=$statement->execute();
			if ($query) {
				$statement->close();
				exit("success");
			}
			else {					
				exit("error");
			}
		}
	}
}

if(isset($_POST['snooze'])){
	if(isset($_POST['id'])){
		if(isset($_SESSION['userid'])) {
			$userid=$_SESSION['userid'];
			$id=$_POST['id'];
			$time=time();
			$snooze=$_POST['snooze'];
			$seconds=$snooze*60;
			$time+=$seconds;
			@$db=mysqli_connect(DBHOST,DBUSER,DBPASSWORD,DBNAME);
			$SQLstring="update appointment set alarm=? where id=? and userid=?";
			$statement=$db->prepare($SQLstring);
			$statement->bind_param("iii",$time,$id,$userid);
			$query=$statement->execute();
			if ($query) {
				$statement->close();
				exit("success");
			}
			else {					
				exit("error");
			}
		}
	}
}

if(isset($_POST['getalerts'])) {
	if(isset($_SESSION['userid'])) {
		$userid=$_SESSION['userid'];
		@$db=mysqli_connect(DBHOST,DBUSER,DBPASSWORD,DBNAME);	
		$SQLstring="select * from appointment where userid=$userid and active=1 order by alarm";
		$query=$db->query($SQLstring);
		$row_count=$query->num_rows;
		$appointment=array();			
		for ($i=0; $i<$row_count; $i++) {
			$row=$query->fetch_assoc();
			$reminder=$row['reminder'];
			if ($reminder>-1) {
				$alarm=$row['alarm'];
				$time=time();
				if ($alarm<=$time) {
					$appointment[$i]['id']=$row['id'];
					$seconds=$alarm-$time;
					$appointment[$i]['seconds']=$seconds;
					$timestamp=strtotime($row['date']);
					$appointment[$i]['date']=date('m/d/Y',$timestamp);
					$appointment[$i]['time']=intToTime($row['time']);
					$appointment[$i]['description']=$row['description'];
					$appointment[$i]['status']="set";		
				}
			}
		}
		if (empty($appointment)) $appointment[0]['status']="none";
		echo(json_encode($appointment));
		exit;
	}
	$appointment[0]['status']="none";
	echo(json_encode($appointment));
	exit;
}

if(isset($_POST['appointid'])) {
	if(isset($_SESSION['userid'])) {
		$userid=$_SESSION['userid'];
		$id=$_POST['appointid'];
		@$db=mysqli_connect(DBHOST,DBUSER,DBPASSWORD,DBNAME);
		$SQLstring="delete from appointment where id=? and userid=?";
		$statement=$db->prepare($SQLstring);
		$statement->bind_param("ii", $id, $userid);
		$success=$statement->execute();
		if ($success) {
			$statement->close();
			exit("success");
		}
		else exit("error");
	}
}

if(isset($_POST['appointment'])) {
	if(isset($_SESSION['userid'])) {
		$userid=$_SESSION['userid'];
		@$db=mysqli_connect(DBHOST,DBUSER,DBPASSWORD,DBNAME);
		$SQLstring="select * from appointment where userid=$userid order by date, time";
		$query=$db->query($SQLstring);
		$row_count=$query->num_rows;
		$appointmentList=array();			
		for ($i=0; $i<$row_count; $i++) {
			$row=$query->fetch_assoc();
			$time=strtotime($row['date']);
			$appointmentList[$i]['date']=date('m/d/Y',$time);
			$clock=$row['time'];
			$appointmentList[$i]['time']=intToTime($clock);
			$clock=$row['reminder'];
			if ($clock>-1) {
				$reminder=date("m/d/Y g:i a",$row['alarm']);
			}
			else $reminder="";
			$appointmentList[$i]['reminder']=$reminder;
			$appointmentList[$i]['description']=$row['description'];
			$appointmentList[$i]['id']=$row['id'];
			$appointmentList[$i]['active']=$row['active'];
		}
		echo(json_encode($appointmentList));
		exit;
	}
}

if(isset($_POST['reminder'])) {
	$returnValue=array();
	if(isset($_POST['date'])) {
		if(isset($_POST['time'])) {
			if(isset($_POST['description'])) {
				if(isset($_SESSION['userid'])) {
					if(isset($_POST['id'])) {
						$id=$_POST['id'];
						$userid=$_SESSION['userid'];
						$reminder=$_POST['reminder'];
						$time=$_POST['time'];
						if ($time<0) {
							$timemin=0;
						}
						else $timemin=$time;
						$date=strtotime($_POST['date']);
						if ($reminder>-1) {
							$active=1;
							$alarm=$date+(($timemin-$reminder)*60);
						}
						else {
							$active=0;
							$alarm=0;
						}
						$date=date("Y-m-d H:i:s",$date);
						$description=$_POST['description'];
						@$db=mysqli_connect(DBHOST,DBUSER,DBPASSWORD,DBNAME);
						$SQLstring="update appointment set date=?, time=?, reminder=?, description=?, active=?, alarm=? where userid=? and id=?";
						$statement=$db->prepare($SQLstring);
						$statement->bind_param("siisiiii",$date,$time,$reminder,$description,$active,$alarm,$userid,$id);
						$query=$statement->execute();
						if ($query) {
							$statement->close();
							exit("updated ".$id);
						}
						else {					
							exit("error");
						}
					}
					else {
						$userid=$_SESSION['userid'];
						$reminder=$_POST['reminder'];
						$time=$_POST['time'];
						if ($time<0) {
							$timemin=0;
						}
						else $timemin=$time;
						$date=strtotime($_POST['date']);
						if ($reminder>-1) {
							$active=1;
							$alarm=$date+(($timemin-$reminder)*60);
						}
						else {
							$active=0;
							$alarm=0;
						}
						$date=date("Y-m-d H:i:s",$date);
						$description=$_POST['description'];
						@$db=mysqli_connect(DBHOST,DBUSER,DBPASSWORD,DBNAME);
						$SQLstring="insert into appointment (userid, date, time, alarm, reminder, active, description) values (?,?,?,?,?,?,?)";
						$statement=$db->prepare($SQLstring);
						$statement->bind_param("isiiiis", $userid, $date, $time, $alarm, $reminder, $active, $description);
						$query=$statement->execute();
						if ($query) {
							$statement->close();
							$returnValue['status']="success";
							$returnValue['id']=$db->insert_id;
							echo json_encode($returnValue);
							exit;
						}
						else {
							$returnValue['status']="error";
							echo json_encode($returnValue);
							exit;
						}
					}
				}
			}
		}
	}
	$returnValue['status']="error";
	echo json_encode($returnValue);
	exit;
}

// To Do list functions
if(isset($_POST['deletetask'])) {
	if (isset($_SESSION['userid'])) {
		$userid=$_SESSION['userid'];
		$index=$_POST['deletetask'];
		@$db=mysqli_connect(DBHOST,DBUSER,DBPASSWORD,DBNAME);
		$SQLstring="delete from todo where userid=? and id=?";
		$statement=$db->prepare($SQLstring);
		$statement->bind_param("ii", $userid, $index);
		$success=$statement->execute();
		if ($success) {
			$statement->close();
			exit("success");
		}
		else exit("error");
	}
}

if(isset($_POST['addtask'])) {
	if (isset($_SESSION['userid'])) {
		$userid=$_SESSION['userid'];
		$task=$_POST['addtask'];
		@$db=mysqli_connect(DBHOST,DBUSER,DBPASSWORD,DBNAME);
		$SQLstring="insert into todo (userid, task) values (?,?)";
		$statement=$db->prepare($SQLstring);
		$statement->bind_param("is", $userid, $task);
		$query=$statement->execute();
		if ($query) {
			$taskid=$db->insert_id;
			$statement->close();
			exit($taskid);
		}
		else {
			exit("error");
		}
	}
}

if(isset($_POST['updatetask'])) {
	if (isset($_SESSION['userid'])) {
		if (isset($_POST['task'])) {
			$id=$_POST['updatetask'];
			$task=$_POST['task'];
			$userid=$_SESSION['userid'];
			@$db=mysqli_connect(DBHOST,DBUSER,DBPASSWORD,DBNAME);
			$updateSQL="update todo set task=? where id=? and userid=?";
			$updateStatement=$db->prepare($updateSQL);
			$updateStatement->bind_param("sii",$task,$id,$userid);
			$updateQuery=$updateStatement->execute();
			if ($updateQuery) {
				$updateStatement->close();
				exit("success");
			}
			else {					
				exit("error");
			}
		}
		else exit("task not set");
	}
	else exit("userid not set");
}

if(isset($_POST['gettasks'])) {
	if (isset($_SESSION['userid'])) {
		$userid=$_SESSION['userid'];
		@$db=mysqli_connect(DBHOST,DBUSER,DBPASSWORD,DBNAME);
		$SQLstring="select * from todo where userid=$userid";
		$query=$db->query($SQLstring);
		$row_count=$query->num_rows;
		$todoList=array();			
		for ($i=0; $i<$row_count; $i++) {
			$row=$query->fetch_assoc();
			$todoList[$i]=$row;
		}
		echo(json_encode($todoList));
		exit;
	}
}

if(isset($_POST['reordertasks'])) {
	if (isset($_SESSION['userid'])) {
		$userid=$_SESSION['userid'];
		$tasks=$_POST['reordertasks'];
		@$db=mysqli_connect(DBHOST,DBUSER,DBPASSWORD,DBNAME);
		$SQLstring="select * from todo where userid=$userid";
		$query=$db->query($SQLstring);
		foreach ($tasks as $task) {
			$row=$query->fetch_assoc();
			if ($row['task']!=$task) {
				$id=$row['id'];
				$updateSQL="update todo set task=? where id=? and userid=?";
				$updateStatement=$db->prepare($updateSQL);
				$updateStatement->bind_param("sii",$task,$id,$userid);
				$updateQuery=$updateStatement->execute();
				if ($updateQuery) {
					$updateStatement->close();
				}
				else {					
					exit("error");
				}
			}
		}
	}
}

// User Authentication functions
if(isset($_POST['logout'])) {
	if ($_POST['logout']=="yes") {
		unset($_SESSION['user']);
		unset($_SESSION['userid']);
	}
}

if(isset($_POST['username'])) {
	if(isset($_POST['password'])) {
		if(isset($_POST['mode'])) {
			$username=$_POST['username'];
			$password=md5($_POST['password']);
			$mode=$_POST['mode'];
			@$db=mysqli_connect(DBHOST,DBUSER,DBPASSWORD,DBNAME);
			if (mysqli_connect_errno()) {
				exit('fail');
			}
			else if ($mode=='login') {	
				$SQLstring="select * from user where username='$username'";
				$query=$db->query($SQLstring);
				if ($query) {
					$row=$query->fetch_assoc();
					if ($password==$row['password']) {
						$_SESSION['user']=$username;
						$_SESSION['userid']=$row['id'];
						exit('loggedin');
					}
					else {
						exit('none');
					}					
				}
				else {
					exit ('none');
				}
			}
			else if ($mode=='register') {
				$SQLstring="select * from user where username='$username'";
				$query=$db->query($SQLstring);
				if ($query->num_rows==0) {
					$SQLstring="insert into user (username, password) values (?,?);";
					$statement=$db->prepare($SQLstring);
					$statement->bind_param("ss", $username, $password);
					$query=$statement->execute();
					if ($query) {
						$userid=$db->insert_id;
						$_SESSION['user']=$username;
						$_SESSION['userid']=$userid;
						exit('created');
					}
					exit('error');			
				}
				exit('exists');
			}
			exit('error');		
		}	
	}
}

// Getting Customer Feedback functions
else if (isset($_POST['feedbackdate'])) {
	if(isset($_SESSION['feedback']) && !empty($_SESSION['feedback'])) {
		$feedbackList=$_SESSION['feedback'];
	}
	else {
		$feedbackList=array();
	}
	$feedback=array();
	$errorCount=0;
	$feedbackCount=0;
	$errorMessage="";
	if (!empty($_POST['feedbackdate'])) $feedback['date']=$_POST['feedbackdate'];
	else {
		$errorMessage="The date is required";
		++$errorCount;
	}
	$store=$_POST['store'];
	if ($store=="none") {
		if ($errorCount>0) {
			$errorMessage.="; the";
		}
		else $errorMessage.="The";
		$errorMessage.=" store you visited is required";
		++$errorCount;
	}
	else $feedback['store']=$store;
	if (empty($_POST['easy'])) $feedback['easy']="";
	else {
		$feedback['easy']=$_POST['easy'];
		++$feedbackCount;
	}
	if (!empty($_POST['staff'])) {
		$feedback['staff']=$_POST['staff'];
		++$feedbackCount;
	}
	else $feedback['staff']="";
	$service=$_POST['service'];
	if (!empty($_POST['service'])) {
		$feedback['service']=$service;
		if ($service<5) ++$feedbackCount;
	}
	else $feedback['comments']="";
	if (!empty($_POST['comments'])) {
		$feedback['comments']=$_POST['comments'];
		++$feedbackCount;
	}
	else $feedback['comments']="";
	if ($feedbackCount==0) {
		if ($errorCount>0) {
			$errorMessage.="; you";
		}
		else $errorMessage.="You";
		$errorMessage.=" didn't provide any feedback";
		++$errorCount;
	}
	if ($errorCount>0) {
		$errorMessage="Please fix the following $errorCount errors: ".$errorMessage.".<br /><br />";
		echo $errorMessage;
	}
	else {
		$feedbackList[]=$feedback;
		$_SESSION['feedback']=$feedbackList;
		echo "true";
	}	
}

else if (isset($_POST['feedbackList'])) {
	if(isset($_SESSION['feedback']) && !empty($_SESSION['feedback'])) {
		echo json_encode($_SESSION['feedback']);
	}
	else {
		echo json_encode("empty");
	}
}

// Functions to validate user input on Feedback form
function validateEmail($address) {
	if (preg_match("/^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)*(\.[a-z]{2,4})$/i", $address)) return TRUE;	
	return FALSE;
}

function validatePhone($number) {
	if (preg_match("/^([0-9]{3})?(\-)?([0-9]{3})(\-)?([0-9]{4})$/", $number)) return TRUE;
	return FALSE;
}

function validateZip($zip) {
	if (preg_match("/([0-9]{5})/", $zip)) return TRUE;
	return FALSE;
}

// Functions to turn Appointment stored values into user friendly English
function intToTime($clock) {
	if ($clock>-1) {
		$hours=floor($clock/60);
		$minutes=$clock-($hours*60);
		if ($minutes=='0') $minutes='00';
		$ampm="am";
		if ($hours>11) $ampm="pm";
		if ($hours>12) $hours-=12;
		return ($hours.':'.$minutes.' '.$ampm);
	}
	else {
		if ($clock==-2) return "All Day";
		else return "";
	}
}

function reminderToEnglish($clock) {
	if ($clock>10079) {
		$reminder=floor($clock/10080);
		if ($reminder==1) $reminder.=' week';
		else $reminder.=' weeks';
		}
		else if ($clock>1439) {
			$reminder=floor($clock/1440);
			if ($reminder==1) $reminder.=' day';
			else $reminder.=' days';
		}
		else if ($clock>59) {
			$reminder=floor($clock/60);
			if ($reminder==1) $reminder.=' hour';
			else $reminder.=' hours';
		}
		else {
			$reminder=$clock.' minutes';
	}
	return $reminder;
}
?>