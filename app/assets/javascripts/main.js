// Global variables
var spinner;
var target;
var opts;
var diagnosticoFQDN;

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
	diagnosticoFQDN = window.location.href;

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
		$(".sub").css({"background-color": "#43A047"});

		// If domain is undefined
		if (!domain) {
			domain = "No domain found"
			$(".sub").css({"background-color": "#FFB300"});
		}
	} else {
		ipaddr = getIP(input);
		domain = input;
		$(".sub").css({"background-color": "#43A047"});

		// If IP is undefined
		if (!ipaddr) {
			ipaddr = "Invalid domain"
			$(".sub").css({"background-color": "#D32F2F"});
		}
	}

	$("#results").empty(); // Empty past results
	$("#results").append("<h1>" + ipaddr + "</h1>"); // Add IP to results
	$("#results").append("<h2>" + domain + "</h2>"); // Add domain to results

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
		url: diagnosticoFQDN + "api/getip/" + btoa(input),
		datatype: "json",
		async: false,
		success: function(data) {
			try {
				returnVal = data.answer[0].rdata;
			} catch (e) {
				returnVal = null;
			}
			
		},
		error: function(data) {
			console.log(data);
		}
	});

	// If still not an IP address
	if (!validateIP(returnVal)) {
		console.log(returnVal + " recur");
		$.ajax({
			type: "GET",
			url: diagnosticoFQDN + "api/getip/" + btoa(returnVal),
			datatype: "json",
			async: false,
			success: function(data) {
				try {
					returnVal = data.answer[0].rdata;
				} catch (e) {
					returnVal = null;
				}
				
			},
			error: function(data) {
				console.log(data);
			}
		});
	}

	return returnVal;
}

// Resolve domain function
function getHost(input) {
	var returnVal;
	$.ajax({
		type: "GET",
		url: diagnosticoFQDN + "api/getdomain/" + btoa(input),
		datatype: "json",
		async: false,
		success: function(data) {
			try {
				returnVal = data.answer[0].rdata;
			} catch (e) {
				returnVal = null;
			}
		},
		error: function(data) {
			console.log(data);
		}
	});
	return returnVal;
}