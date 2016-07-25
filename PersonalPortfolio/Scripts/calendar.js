// load the calendar when the page is ready
$().ready(function () {
    loadCalendar();
    $("#event-box").on("click", "img", function () {
        $('#event-box').hide();
    });

    // when an event's (in event-box) delete button is pressed, tell server to delete the event
    // and manually remove it from the event-box and adjust it for appearance
    $("#event-box").on("click", ".delete-event", function () {
        var eventId = $(this).attr('id').substr(5);
        $.ajax({
            type: "post",
            url: "/Home/DeleteEvent",
            data: { id: eventId },
            success: function (data) {
                if (data == "deleted") {
                    var spanPos = $('#span' + eventId).index();
                    $('#span' + eventId).remove();
                    if (spanPos == 1 && $('#event-box hr').length > 0) {
                        $('#event-box hr').first().remove();
                    }
                    if ($('#event-box span').length == 0) {
                        $('#event-box').hide();
                    }
                    fetchMonth();
                }
            }
        });
    });

    // when event's (in event-box) edit button is pressed
    // use the shared add/edit modal to display event's data for editing
    $("#event-box").on("click", ".edit-event", function () {
        var eventId = $(this).attr('id').substr(5);
        var event = $(this).parent().parent().text();
        var at = event.indexOf("at");
        var location = event.indexOf("Location");
        if (at == -1 || at > location) {
            var allDay = event.indexOf("All");
            if (allDay != -1) {
                var date = event.substr(0, allDay - 1) + ", " + year;
                var time = "All Day";
                var title = event.substr(allDay + 7, location - (allDay + 7));
            }
        }
        else {
            var date = event.substr(0, at - 1) + ", " + year;
            var ampm = event.indexOf("AM");
            if (ampm == -1) ampm = event.indexOf("PM");
            var time = event.substr(at + 3, ampm - (at + 1));
            var title = event.substr(ampm + 2, location - (ampm + 2));
        }
        var place = event.substr(location + 10, event.length - (location + 20));
        $('#addEditTitle').html("Edit Event");
        $('#editEventId').val(eventId);
        jDate = new Date(date);
        $('#eventDatePicker').datepicker('setDate', jDate);
        var timeVal = $("#timeDropDown option:contains(" + time + ")").val();
        $('#timeDropDown').val(timeVal);
        $('#location').val(place);
        $('#title').val(title);
        $("#event-box").hide();
        $('#modal-addevent').modal('show');
    });
});

function loadCalendar() {
    // global variables that hold the position of the scrollbar and the month/year
    // scrollbar is to keeep page where it is when going forward/back a month
    // monthYear holds what month and year should be displayed
    scrollbar = 0;
    monthYear = new Date();
    month = monthYear.getMonth();
    year = monthYear.getFullYear();
    day = monthYear.getDate();
    fetchMonth();
}

// keep the calendar td height and width the same when the window is resized
$(window).resize(function () {
    var width = $('#events td').width();
    $('#events td').height(width);
});

// get the list of events for the passed month and send it to calendar function to display
function fetchMonth() {
    scrollbar = $(window).scrollTop();   
    $.ajax({
        type: "post",
        url: "/Home/GetList",
        data: { month:month, year:year },
        dataType: "json",
        success: function (data) {
            numEvents = data.length;
            for (var i = 0; i < numEvents; i++) {
                var objDate = new Date(parseInt(data[i]["Date"].replace('/Date(', '')));
                data[i]["Date"] = objDate;
            }
            calendar(data);
        }
    });
}

// get the days in the current month
function daysInMonth(calendarDay) {
    var dayCount = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (year % 4 == 0) {
        if ((year % 100 != 0 || (year % 400 == 0))) {
            dayCount[1] = 29;
        }
    }
    return dayCount[month];
}

// write the calendar to the page
function calendar(events) {
    var monthName = ["January", "February", "March", "April", "May", "June",
		"July", "August", "September", "October", "November", "December"];
    var calendar = '<table id="events"><thead><tr><th id="calendar-title" colspan="7"><img src="/Images/120px-Arrow_left.svg.png"  alt="Back one month" title="Back one month" id="left-arrow" /> ' + monthName[month] + ' ' + year + ' <img src="/Images/120px-Arrow_right.svg.png" alt="Forward one month" title="Forward one month" id="right-arrow" /></th></tr><tr id="weekdays"><th>Sun</th><th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th><th>Sat</th></tr></thead>';
    var dayOfMonth = new Date(year, month, 1);
    var weekday = dayOfMonth.getDay();
    if (weekday > 0) {
        calendar += '<tbody><tr>';
        for (var i = 0; i < weekday ; i++) {
            calendar += '<td></td>';
        }
    }
    var days = daysInMonth(monthYear);
    for (var i = 1; i <= days ; i++) {
        dayOfMonth.setDate(i);
        weekday = dayOfMonth.getDay();
        if (i == 1 && weekday == 0) calendar += '<tbody>';
        if (weekday == 0) calendar += '<tr>';
        var calendarBox = '<td class="calendar-box">' + i + '<br />';
        var eventID = '';
        for (var x = 0; x < events.length; x++) {
            var eventDate = new Date(events[x].Date);
            if (eventDate.getDate()==i) {
                if (x > 0 && eventID != "") var hr = '<hr />';
                else var hr = "";
                if (events[x].AllDay == false) {
                    var ampm = ' AM';
                    var calendarHour = eventDate.getHours();
                    if (calendarHour > 12) {
                        calendarHour -= 12;
                        ampm = ' PM';
                    }
                    var calendarMinutes = eventDate.getMinutes();
                    if (calendarMinutes < 10) calendarMinutes = '0' + calendarMinutes;
                    var time = ' at ' + calendarHour + ':' + calendarMinutes + ampm;
                }
                else var time = ' All Day';
                var eventTitle = events[x].Title;
                var displayEvent = monthName[month] + ' ' + i + time + '\n' + eventTitle + '\nLocation: ' + events[x].Location;
                eventID += '<span id=&quot;span' + events[x].ID + '&quot>' + hr + displayEvent + '<div class=&quot;event-buttons&quot;><button id=&quot;event' + events[x].ID + '&quot; class=&quot;delete-event&quot;>Delete</button><button id=&quot;event' + events[x].ID + '&quot; class=&quot;edit-event&quot;>Edit</button></div></span>';
            }
        }
        if (eventID != '') {
            calendarBox = '<td class="calendar-box display-event" id="' + eventID + '">' + i;
        }
        calendar += calendarBox + '</td>';
        if (weekday == 6) calendar += '</tr>';
    }
    if (weekday < 6) {
        for (var x = weekday; x < 6; x++) {
            calendar += '<td></td>';
        }
    }
    calendar += '</tbody></table>';
    $('#calendar').html(calendar);
    var width = $('#events td').width();
    $('#events td').height(width);
    $(window).scrollTop(scrollbar);

    $('.display-event').click(
       function () {
           var eventText = $(this).attr('id');
           eventText = eventText.replace(/\n/g, "<br />");
           eventText = '<img id="closer-window" src="/Images/CloseWindow19x19.png" alt="close window" title="Close event window" />' + eventText;
           var pos = $(this).position();
           var positionLeft = pos.left;
           var positionTop = pos.top;
           var boxHeight = $(this).outerHeight();
           var boxWidth = $(this).outerWidth();
           $('#event-box').html(eventText);
           var eventWidth = $('#event-box').outerWidth();
           var eventHeight = $('#event-box').outerHeight();
           positionLeft += (boxWidth / 2) - (eventWidth / 2);
           positionTop += boxHeight / 2 - (eventHeight / 2);
           if (positionLeft < 0) positionLeft = 0;
           if (positionTop < 0) positionTop = 0;
           $('#event-box').css('top', positionTop);
           $('#event-box').css('left', positionLeft);
           $('#event-box').show();
       });

    $('#left-arrow').click(
        function () {
            $('#event-box').hide();
            month--;
            if (month < 0) {
                month = 11;
                year--;
            }
            monthYear = new Date(year, month, day);
            fetchMonth();
            scrollbar = $(window).scrollTop();
    });

    $('#right-arrow').click(
        function () {
            $('#event-box').hide();
            month++;
            if (month > 11) {
                month = 0;
                year++;
            }
            monthYear = new Date(year, month, day);
            fetchMonth();
    });
}


