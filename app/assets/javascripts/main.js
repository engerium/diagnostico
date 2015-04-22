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
			$("#search-input").blur(); // Unfocus search input
		}
	});

});


// Query function
function query() {
	
	// Variables
	var results;
	var ip_results;
	var ip_info;
	var input = $("#search-input").val().trim();
	var ipaddr;
	var domain;
	var name;
	var organization;
	var city;
	var state;
	var ip_longitude;
	var ip_latitude;
	var ip_asn;
	var ip_city;
	var ip_region;
	var ip_country;
	var ip_cc;
	var ip_isp;
	var ip_whois;



	// Check if input is a valid IP address else check DNS
	if (validateIP(input)) {
		ipaddr = input;
		domain = getHost(input);
		$(".sub-q").css({"background-color": "#43A047"});

		// If domain is undefined
		if (!domain) {
			domain = "No domain found"
			$(".sub-q").css({"background-color": "#FFB300"});
		}

	} else {
		ipaddr = getIP(input);
		domain = input;

		if (validateIP(ipaddr)) {

			try {
				results = getWhois(domain)[0];
				name = results.name;
				organization = results.organization;
				city = results.city;
				state = results.state;
				$(".sub-q").css({"background-color": "#43A047"});
			} catch (e) {
				name, organization, city, state = null;
			}

		} else {
			ipaddr = "Unresolvable domain"
			$(".sub-q").css({"background-color": "#D32F2F"});
			$("#results-q").empty(); // Empty past q results
			$("#results-d").empty(); // Empty past d results
			$("#results-w").empty(); // Empty past d results
			$(".sub-q").addClass("hidden"); // Make div hidden as originally declared
			$(".sub-d").addClass("hidden"); // Make div hidden as originally declared
			$(".sub-w").addClass("hidden"); // Make div hidden as originally declared
		}
	}

	// Only get whois if there is a valid IP address
	if (validateIP(ipaddr)) {

		try {
			ip_results = getWhois(ipaddr);
			ip_info = ip_results[0];
			ip_whois = ip_results[1].whois;
		
			ip_longitude = ip_info.longitude;
			ip_latitude = ip_info.latitude;
			ip_asn = ip_info.asn;
			ip_city = ip_info.city;
			ip_region = ip_info.region;
			ip_country = ip_info.country;
			ip_cc = ip_info.country_code3;
			ip_isp = ip_info.isp;
		} catch (e) {
			ip_latitude, ip_longitude, ip_asn, ip_city, ip_region, ip_country, ip_cc, ip_isp, ip_whois = null;
		}

		console.log(ip_latitude, ip_longitude, ip_asn, ip_city, ip_region, ip_country, ip_cc, ip_isp, ip_whois);

	} else {
		ip_latitude, ip_longitude, ip_asn, ip_city, ip_region, ip_country, ip_cc, ip_isp, ip_whois = null;
	}

	$("#results-q").empty(); // Empty past q results
	$("#results-d").empty(); // Empty past d results
	$("#results-w").empty(); // Empty past d results
	$(".sub-q").addClass("hidden"); // Make div hidden as originally declared
	$(".sub-d").addClass("hidden"); // Make div hidden as originally declared
	$(".sub-w").addClass("hidden"); // Make div hidden as originally declared

	// Display queried IP and Domin
	$("#results-q").append("<h1>" + ipaddr + "</h1>");
	$("#results-q").append("<h2><i>" + domain + "</i></h2>");
	$(".sub-q").removeClass("hidden"); // Show q results

	// Display domain information if available
	if (name && organization && city && state) {	
		$("#results-d").append("<h2>" + name + "</h2>");
		$("#results-d").append("<h3><i>" + organization + "</i></h3>");
		$("#results-d").append("<h3>" + city + ", " + state + "</h3>");
		$(".sub-d").removeClass("hidden"); // Show d results
	}

	// Display IP address information if available
	if (validateIP(ipaddr)) {
		$("#results-w").append("<h2>" + ip_asn + "</h2>");
		$("#results-w").append("<h3><i>" + ip_isp + "</i></h3>");
		$("#results-w").append("<h3>" + ip_country + "</h3>");
		
		if (ip_city) {
			if (ip_region) {
				$("#results-w").append("<h3>" + ip_city + ", " + ip_region + "</h3>");
			} else {
				$("#results-w").append("<h3>" + ip_city +"</h3>");
			}
		}

		$(".sub-w").removeClass("hidden"); // Show w results
	}

	// Unfocus search input
	$("#search-input").val("").blur();
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

// Get whois information
function getWhois(input) {
	var returnVal;
	$.ajax({
		type: "GET",
		url: diagnosticoFQDN + "api/whois/" + btoa(input),
		datatype: "json",
		async: false,
		success: function(data) {
			try {
				returnVal = data;
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