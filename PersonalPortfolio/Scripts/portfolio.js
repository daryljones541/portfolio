﻿$(document).ready(function () {
    $('input, textarea, select').focus(function () {
        $('.error').html('');
        $('#error-summary').html('');
        $('#login-error').html('');
        $('#event-box').hide();
    });
    $('button').click(function () {
        $('.error').html('');
        $('#error-summary').html('');
        $('#login-error').html('');
        $('#event-box').hide();
    });
    $('span').click(function () {
        $('.error').html('');
        $('#error-summary').html('');
        $('#login-error').html('');
        $('#event-box').hide();
    });
    $('.page-links').removeClass('active');
    $('#portfolio-page').addClass('active');
    $('#datePicker').datepicker({
        onSelect: function (dateText, inst) {
            $('#datePicker').valid();
        }
    });
    $('#eventDatePicker').datepicker({
        onSelect: function (dateText, inst) {
            $('#eventDatePicker').valid();
        }
    });
    // called on first load
    // loads the weather conditions for Eugene, OR
    $.ajax({
        url: "http://api.wunderground.com/api/fda8cc170c4d1a3e/geolookup/conditions/q/OR/Eugene.json",
        dataType: "jsonp",
        success: function (data) {
            displayResults(data);
        }
    });
    $.validator.addMethod("regularDate", function (value, element) {
        return value.match(/^(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])\/(19|20)\d{2}$/);
    }, "Please enter a date in the format mm/dd/yyyy");
    $.validator.addMethod("regularDate", function (value, element) {
        return value.match(/^(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])\/(19|20)\d{2}$/);
    }, "Please enter a date in the format mm/dd/yyyy");
    $('#exampleForm').validate({
        rules: {
            Date: {
                required: true,
                regularDate: true
            },
            Email: {
                required: true,
                email: true
            },
            Phone: {
                phoneUS: true
            },
            Feedback: {
                required: true
            }
        },
        messages: {
            Date: {
                required: "Date is required."
            },
            Email: {
                required: "Email is required."
            },
            Feedback: {
                required: "Feedback is required."
            }
        },
        errorContainer: "#error-summary",
        showErrors: function (errorMap, errorList) {
            $("#error-summary").html("Please fix the " + this.numberOfInvalids() + " errors above.");
            this.defaultShowErrors();
        }
    });
    $('#weather-form').validate({
        rules: {
            city: { required: true }
        },
        messages: {
            city: { required: "You must enter a city." }
        },
        showErrors: function (errorMap, errorList) {
            this.defaultShowErrors();
        }
    });
    $('#login-form').validate({
        rules: {
            username: { required: true },
            password: { required: true }
        },
        messages: {
            username: { required: "Please enter your username." },
            password: { required: "Please enter your password." }
        },
        showErrors: function (errorMap, errorList) {
            this.defaultShowErrors();
        }
    });
    $('#form-addevent').validate({
        rules: {
            eventDate: {
                required: true,
                regularDate: true
            },
            Location: {
                required: true
            },
            Title: {
                required: true
            }
        },
        messages: {
            eventDate: { required: "The event's date is required." },
            Location: { required: "The event's location is required." },
            Title: { required: "The event's details are required." }
        },
        showErrors: function (errorMap, errorList) {
            this.defaultShowErrors();
        }
    });
    $('#login-button').click(function () {
        checkUser();
    });
    $('#saveevent-button').click(function () {
        if ($('#form-addevent').valid()) {
            var eventDate = $('#eventDatePicker').val();
            var eventTime = $('#timeDropDown option:selected').text();
            var eventLocation = $('#location').val();
            var eventTitle = $('#title').val();
            if ($('#editEventId').val() == "") { 
                $.ajax({
                    type: "POST",
                    url: "/Home/AddEvent",
                    data: { date: eventDate, time: eventTime, location: eventLocation, title: eventTitle },
                    success: function (data) {
                        if (data) {
                            var addDate = new Date(parseInt(data.replace('/Date(', '')));
                            $('#modal-addevent').modal('hide');
                            month = addDate.getMonth();
                            year = addDate.getFullYear();
                            fetchMonth();
                        }
                    },
                    error: function (xhr, ajaxOptions, thrownError) { alert(xhr.responseText); }
                });
            }
            else {
                var eventId = $('#editEventId').val();
                $.ajax({
                    type: "POST",
                    url: "/Home/UpdateEvent",
                    data: { id:eventId, date:eventDate, time:eventTime, location:eventLocation, title:eventTitle },
                    success: function (data) {
                        if (data) {
                            var addDate = new Date(parseInt(data.replace('/Date(', '')));
                            month = addDate.getMonth();
                            year = addDate.getFullYear();
                            $('#modal-addevent').modal('hide');
                            fetchMonth();
                        }
                    },
                    error: function (xhr, ajaxOptions, thrownError) { alert(xhr.responseText); }
                });
            }
        }
    });
    $('#addevent-button').click(function () {
        $('#eventDatePicker').val('');
        $('#timeDropDown').val('0');
        $('#location').val('');
        $('#title').val('');
        $('#addEditTitle').html("Add Event");
        $('#editEventId').val("");
        $('#eventDatePicker').datepicker("option", { defaultDate: new Date(year, month, day) });
        $('#modal-addevent').modal('show');
    });

    $('#logout-button').click(function () {
        $('#logout-message').html('Logging you out <img src="/Images/Loading_2_transparent.gif" />');
        $.ajax({
            type: "post",
            url: "/Users/Logout",
            dataType: "json",
            success: function (data) {
                if (data == true) {
                    $('#logout-message').html('');
                    $('.logged-in').hide();
                    $('.logged-out').show();
                    fetchMonth();
                }
                else $('#logout-message').html('There was a problem logging you out.');
            }
        });
    });
    $('#submit-button').click(function () {
        if ($('#exampleForm').valid()) {
            var formDate = $('#datePicker').val();
            var formRefer = $("#referrer option:selected").text();
            var formName = $('#name').val();
            var formEmail = $('#email').val();
            var formPhone = $('#phone').val();
            var formFeedback = $('#feedback').val();
            $.ajax({
                type: "POST",
                url: "/Home/AddFeedback",
                data: { date: formDate, referrer: formRefer, name: formName, email: formEmail, phone: formPhone, feedback: formFeedback },
                success: function (data) {
                    if (data) {
                        $('#exampleForm')[0].reset();
                        $('#form-thankyou').modal('show');
                    }
                },
                error: function (xhr, ajaxOptions, thrownError) { alert(xhr.responseText); }
            });
        }
    });
    $('#register-button').click(function () {
        location.href = "/Users/Register";
    });
    $('#viewall-button').click(function () {
        $.ajax({
            type: "post",
            url: "/Home/GetFeedback",
            dataType: "json",
            success: function (data) {
                var tableBody = "";
                for (var x = 0; x < data.length; x++) {
                    var formDate = new Date(parseInt(data[x]["Date"].replace('/Date(', '')));
                    var displayDate = (formDate.getMonth() + 1) + "/" + formDate.getDate() + "/" + formDate.getFullYear();
                    var formRefer = data[x].ReferredBy;
                    var formName = data[x].Name;
                    var formEmail = data[x].Email;
                    var formPhone = data[x].Phone;
                    var formFeedback = data[x].CustomerFeedback;
                    tableBody += "<tr><td>" + displayDate + "</td><td>" + formRefer + "</td><td>" + formName + "</td><td>" + formEmail + "</td><td>" + formPhone + "</td><td>" + formFeedback + "</td></tr>";
                }
                $('#feedback-body').html(tableBody);
            }
        });
        $('#feedback-table').modal('show');
    });
    // called when get weather button clicked
    // sends text entered into #city text input to displayResults()
    $('#weather-button').click(function () {
        if ($('#weather-form').valid()) getWeather();
    });
    $('[title]').tooltip();   
});

function getWeather() {
var uri = 'http://api.wunderground.com/api/';
var apiKey = 'fda8cc170c4d1a3e';
var state = $("#state option:selected").val();
$('#city').blur();
var city = $('#city').val();
var request = uri + apiKey + '/geolookup/conditions/q/' + state + '/' + city + '.json';
$.ajax({
    url: request,
    dataType: "jsonp",
    success: function (data) {
        displayResults(data);
    }
});
}

// attempts to parse information received from Weather Underground
// if successful, the information is formatted and displayed
// if not, an error message is displayed
function displayResults(data) {
    try {
        var location = data['location']['city'];
        var condition = data['current_observation']['weather'];
        var temp = data['current_observation']['temperature_string'];
        var wind = (data['current_observation']['wind_string']);
        wind=wind.charAt(0).toLowerCase() + wind.slice(1);
        var rain = data['current_observation']['precip_today_string'];
        var humidity = data['current_observation']['relative_humidity'];
        var image = data['current_observation']['icon_url'];
        $('#weather').html("<h3>" + location + "</h3><img src='" + image + "' /><br />" + condition +
            ".  The current temperature is: " + temp + "; rainfall for the day will be " + rain +
            "; relative humidity is " + humidity + "; wind is " + wind + ".")
    }
    catch (error)
    {
        $('#weather').html("<strong>Oops!  The city may not have been found.  Please try again.<br />Error returned is " + error + ".</strong>");
    }
}

function checkUser() {
if ($('#login-form').valid()) {
    var username = $('#username').val();
    var password = $('#password').val();
    $('#login-error').html('Checking <img src="/Images/Loading_2_transparent.gif" /><br /><br />');
    $.ajax({
        type: "post",
        url: "/Users/LoginUser",
        data: { username: username, password: password },
        success: function (data) {
            if (data == "true") {
                $('.logged-in').show();
                $('.logged-out').hide();
                $('#welcome-username').html(username);
                fetchMonth();
            }
            else if (data == "false") {
                $('#login-error').html('Incorrect username or password.<br /><br />');
            }
            else if (data == "unverified") {
                $('#login-error').html('You need to verify your email before you can log on.  Click the link this site emailed to you.<br /><br />Did not get it? <input type="button" class="btn btn-primary" title="Resend email verification link" data-placement="right"value="Resend Link" onclick="resendLink();" /><br /><br />');
            }
        }
    });
}
}
function resendLink() {
$('#login-error').html('Resending <img src="/Images/Loading_2_transparent.gif" /><br /><br />');
$.ajax({
    type: "post",
    url: "/Users/ResendEmail",
    dataType: "json",
    success: function (data) {
        if (data=="true") $('#login-error').html('Your verification link was re-emailed to you.<br /><br />');
        else $('#login-error').html('There was a problem emailing you the link.<br /><br />');
    },
    error: function (xhr, ajaxOptions, thrownError) { alert(xhr.responseText); }
});
}
