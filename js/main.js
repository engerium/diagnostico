// Global variables
var spinner;
var target;
var opts;

// Document ready function
$(function() {
	// Configure spin.js
	opts = {
		lines: 8, // The number of lines to draw
		length: 1, // The length of each line
		width: 8, // The line thickness
		radius: 16, // The radius of the inner circle
		corners: 1, // Corner roundness (0..1)
		rotate: 0, // The rotation offset
		direction: 1, // 1: clockwise, -1: counterclockwise
		color: '#FFFFFF', // #rgb or #rrggbb or array of colors
		speed: 1, // Rounds per second
		trail: 25, // Afterglow percentage
		shadow: false, // Whether to render a shadow
		hwaccel: true, // Whether to use hardware acceleration
		className: 'spinner', // The CSS class to assign to the spinner
		zIndex: 2e9, // The z-index (defaults to 2000000000)
		top: '50%', // Top position relative to parent
		left: '50%' // Left position relative to parent
	};

	target = document.getElementsByTagName("body")[0];
	spinner = new Spinner(opts);

	$("#search-input").keyup(function(e) {
		if(e.keyCode === 13) {
			query();
		}
	});

});


// Query function
function query() {
	
	// Variables
	var input = $("#search-input").val();
	var ipaddr;
	var domain;

	// Check if input is a valid IP address else check DNS
	if (validateIP(input)) {
		ipaddr = input;
		domain = getHost(input);
	} else {
		ipaddr = getIP(input);
		domain = input;
	}

	$("#results").empty(); // Empty past results
	$("#results").append("<h1>" + ipaddr + "</h1>"); // Add seach query
	$("#results").append("<h2>" + domain + "</h2>");

	$(".sub").removeClass("hidden"); // Show results
	$("#search-input").val("").blur(); // Unfocus search input
}


// Validate IP address function
function validateIP(input) {  
	if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(input)) {  
			return (true);
	}
	return (false);
}


// Resolve IP address function
function getIP(input) {
	var returnVal;
	$.ajax({
		type: "GET",
		url: "http://api.statdns.com/" + input + "/a",
		datatype: "json",
		async: false,
		success: function(data) {
			returnVal = data.answer[0].rdata;
		},
		error: function(data) {
			console.log(data);
		}
	});
	return returnVal;
}

// Resolve host function
function getHost(input) {
	var returnVal;
	$.ajax({
		type: "GET",
		url: "http://api.statdns.com/x/" + input,
		datatype: "json",
		async: false,
		success: function(data) {
			returnVal = data.answer[0].rdata;
		},
		error: function(data) {
			console.log(data);
		}
	});
	return returnVal;
}