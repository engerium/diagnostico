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
		top: '48%', // Top position relative to parent
		left: '50%' // Left position relative to parent
	};

	target = document.getElementById("spinjs");
	spinner = new Spinner(opts);
	diagnosticoFQDN = window.location.href;

	$("#search-input").keyup(function(e) {
		if(e.keyCode === 13) {
			$("#search-input").blur(); // Unfocus search input
			spinner.spin(target);
			query();
		}
	});

});


// Query function
function query() {
	
	// Remove any existing results
	removeResults();

	// Variables
	var input = $("#search-input").val().trim();

	// If input is a valid IP address
	if (validateIP(input)) {

		// Get domain name for input
		getHost(input);

	} else {

		// Get IP address for input
		getIP(input);

	}

}


// Validate IP address function
function validateIP(input) {  
	if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(input)) {  
			return (true);
	}
	return (false);
}


// Resolve domain function
function getHost(input) {
	$.ajax({
		type: "GET",
		url: diagnosticoFQDN + "api/getdomain/" + btoa(input),
		datatype: "json",
		success: function(data) {
			try {

				// Get domain name from JSON
				domain = data.answer[0].rdata;

				// Set query box to green
				$(".sub-q").css({"background-color": "#43A047"});

				cl("[DEBUG] getHost() success try : " + domain); //Debug

				// Get whois information for domain name
				//getWhois(domain, "d");

				// Get whois information for ip address
				getWhois(input, "i");

			} catch (e) {
				// Set domain name to not found
				domain = "No domain found";

				// Set query box to yellow
				$(".sub-q").css({"background-color": "#FFB300"});

				cl("[DEBUG] getHost() success catch : " + domain); //Debug

				// Get whois information for ip address
				getWhois(input, "i");
			}

			cl("[DEBUG] getHost() success end : " + domain); //Debug

			// Display query information
			qDisplay(input, domain);

		},
		error: function(data) {
			// Print error message
			cl("[ERROR] getHost() :\n" + data);
		}
	});
}


// Resolve IP address function
function getIP(input) {
	$.ajax({
		type: "GET",
		url: diagnosticoFQDN + "api/getip/" + btoa(input),
		datatype: "json",
		success: function(data) {
			try {

				// Get IP address from JSON
				ipaddr = data.answer[0].rdata;

				cl("[DEBUG] getIP() success try : " + ipaddr); //Debug

				// Diplay query information
				qDisplay(ipaddr, input);

				// If still not an IP address
				if (!validateIP(ipaddr)) {
					$.ajax({
						type: "GET",
						url: diagnosticoFQDN + "api/getip/" + btoa(ipaddr),
						datatype: "json",
						success: function(data) {
							try {

								// Remove any existing results
								removeResults();

								// Get IP address from JSON
								ipaddr = data.answer[0].rdata;

								cl("[DEBUG] getIP() 2nd success try : " + ipaddr); //Debug

								// Diplay query information
								qDisplay(ipaddr, input);

								// Get ip address information
								getWhois(ipaddr, "i");

							} catch (e) {
								// Set IP address to null
								ipaddr = null;

								// Display query error
								queryError("Unresolvable domain", input);

								// Stop spinjs
								spinner.stop();

							}
							
						},
						error: function(data) {
							// Print error message
							cl("[ERROR] second getIP() :\n" + data);
						}
					});
				}

				// Get domain name information
				getWhois(input, "d");

				// If valid ip address
				if (validateIP(ipaddr)) {
					// Get ip address information
					getWhois(ipaddr, "i");
				}
				


			} catch (e) {

				// Set IP address to null
				ipaddr = null;

				// Display query error
				queryError("Unresolvable domain", input);

			}
			
		},
		error: function(data) {
			// Print error message
			cl("[ERROR] getIP() :\n" + data);
		}
	});

	

}


// Get whois information
function getWhois(input, type) {
	// Variables
	var name, organization, city, state;
	var ip_latitude, ip_longitude, ip_asn, ip_city, ip_region, ip_country, ip_cc, ip_isp;

	$.ajax({
		type: "GET",
		url: diagnosticoFQDN + "api/whois/" + btoa(input),
		datatype: "json",
		success: function(data) {
			// If domain type
			if (type === "d") {

				try {

					// Get information from JSON
					name = data[0].name;
					organization = data[0].organization;
					city = data[0].city;
					state = data[0].state;

					cl("[DEBUG] getWhois() try d : " + data); //Debug

					// Display domain information
					dDisplay(name, organization, city, state);

				} catch (e) {
					// Set variables to null
					name, organization, city, state = null;
					cl("[DEBUG] getWhois() catch d : " + data + " | " + input); //Debug
				}

			} else {

				try {

					// Get information from JSON
					ip_info = data;
					ip_longitude = ip_info.longitude;
					ip_latitude = ip_info.latitude;
					ip_asn = ip_info.asn;
					ip_city = ip_info.city;
					ip_region = ip_info.region;
					ip_country = ip_info.country;
					ip_cc = ip_info.country_code3;
					ip_isp = ip_info.isp;

					cl("[DEBUG] getWhois() try i : " + data); //Debug

					// Display IP address information
					iDisplay(ip_latitude, ip_longitude, ip_asn, ip_city, ip_region, ip_country, ip_cc, ip_isp);

				} catch (e) {
					// Set variables to null
					ip_latitude, ip_longitude, ip_asn, ip_city, ip_region, ip_country, ip_cc, ip_isp = null;
					cl("[DEBUG] getWhois() catch i : " + data); //Debug
				}

			}
			
		},
		error: function(data) {
			// Print error message
			cl("[ERROR] getWhois() :\n" + data);
		}
	});
}


// Display query information function
function qDisplay(ipaddr, domain) {

	// Append IP address
	$("#results-q").append("<h1>" + ipaddr + "</h1>");

	// Append domain name
	$("#results-q").append("<h2><i>" + domain + "</i></h2>");

	// Remove hidden property
	$(".sub-q").removeClass("hidden");

}


// Display domain information function
function dDisplay(name, organization, city, state) {

	// Append name
	$("#results-d").append("<h2>" + name + "</h2>");

	// Append organization
	$("#results-d").append("<h3><i>" + organization + "</i></h3>");

	// Append city and state
	$("#results-d").append("<h3>" + city + ", " + state + "</h3>");

	// Remove hidden property
	$(".sub-d").removeClass("hidden");

}

function iDisplay(ip_latitude, ip_longitude, ip_asn, ip_city, ip_region, ip_country, ip_cc, ip_isp) {

	// Append ASN number
	$("#results-i").append("<h2>" + ip_asn + "</h2>");

	// Append ISP
	$("#results-i").append("<h3><i>" + ip_isp + "</i></h3>");

	// Append country
	$("#results-i").append("<h3>" + ip_country + "</h3>");

	// If city is present
	if (ip_city) {
		// If region is present
		if (ip_region) {
			// Append city and region
			$("#results-i").append("<h3>" + ip_city + ", " + ip_region + "</h3>");
		} else {
			// Append city
			$("#results-i").append("<h3>" + ip_city +"</h3>");
		}
	}

	// Remove hidden property
	$(".sub-i").removeClass("hidden");

	// Remove search input
	$("#search-input").val("");

	// Stop spinjs
	spinner.stop();

}


// Display error for query function
function queryError(ipaddr, domain) {

	// Set red error background
	$(".sub-q").css({"background-color": "#D32F2F"});

	// Append IP address
	$("#results-q").append("<h1>" + ipaddr + "</h1>");

	// Append domain name
	$("#results-q").append("<h2><i>" + domain + "</i></h2>");

	// Remove hidden property
	$(".sub-q").removeClass("hidden");

	// Remove search input
	$("#search-input").val("");

	// Stop spinjs
	spinner.stop();
	
}


// Remove results function
function removeResults() {

	$("#results-q").empty(); // Empty past q results
	$("#results-d").empty(); // Empty past d results
	$("#results-i").empty(); // Empty past d results
	$(".sub-q").addClass("hidden"); // Make div hidden as originally declared
	$(".sub-d").addClass("hidden"); // Make div hidden as originally declared
	$(".sub-i").addClass("hidden"); // Make div hidden as originally declared
	$(".sub-q").css({"background-color": "#43A047"}); // Reset css backgound color
	$(".sub-d").css({"background-color": "#43A047"}); // Reset css backgound color
	$(".sub-i").css({"background-color": "#43A047"}); // Reset css backgound color

}


// Debug console log function
function cl(input) {
	console.log(input);
}