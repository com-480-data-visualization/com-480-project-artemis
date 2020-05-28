/*  This script handles the functions called to construct the basis of the
	website when the function "whenDocumentLoaded" is called. */

var DURATION_SHORT = 250;
var DURATION_LONG = 1500;
var zoomed_in = false;
var menu_open = false;
var filtered_data = false;
var mindate = new Date(1965, 0, 1);
var maxdate = new Date(2015, 11, 31);
var xScale;
var event_clicked = false;
var song_clicked = false;
var show_only_linked = true;
var count_clicked = 0;
var demo_in_progress = false;


function whenDocumentLoaded(action) {
	/*	This function handles the event "whenDocumentLoaded" and will call
		  actions when the document is ready. */

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", action);
	} else {
		action();
	}
}

function add_data_points(date) {
	/*	This function creates the SVG in which the points will be displayed
		  together with the time line. */

	// Define sizes and margins
	var width = d3.select("#plot-div").node().getBoundingClientRect().width
	var height = d3.select("#plot-div").node().getBoundingClientRect().height
	var margin_lr = 2 * width / 100
	var margin_tb = 10 * height / 100

	// Create svg
	var svg = d3.select('#plot')
		.attr("preserveAspectRatio", "xMinYMin meet")
		.attr("viewBox", "0 0 " + width + " " + height)
		.attr("width", width)
		.attr("height", height)

	// Create plot area
	var plot_area = svg.append('g')
		.attr("id", "plot-area")

	// Create pop-up on circle mouse-over
	var bubble = d3.select("#main")
		.append("div")
		.attr("class", "tooltip")
		.attr("id", "bubble")
		.style("opacity", 0)

	// Create title
	svg.append("text")
		.attr("transform", "translate(" + (width / 2) + " ," + ((height / 2) - 5) + ")")
		.attr("id", "title")
		.attr("class", "title")
		.style("text-anchor", "middle")
		.html("select a year")
		.attr("font-family", "heavitas")
		.attr("font-size", "1.4vw")
		.attr("fill", "#282828")

	// Create x-axis
	xScale = d3.scaleTime().domain([mindate, maxdate]).range([margin_lr, width - margin_lr])
	var xAxis = fc.axisBottom(xScale)
		.tickArguments([52])
		.tickCenterLabel(true)
		.tickSizeInner(0)
		.tickSizeOuter(0)

	// Append x-axis to svg
	svg.append("g")
		.attr("transform", "translate(0," + (height / 2) + ")")
		.attr("class", "xaxis")
		.call(xAxis)

	// Make year ticks clickable
	make_year_clickable()

	// Create zoom-out button
	d3.select("#unzoom-button")
		.style("visibility", "hidden")
		.style("opacity", "0")
	d3.select("#unzoom-button")
		.on("mouseover", function () {
			d3.select(this)
				.style("cursor", "pointer")
				.style("color", "#f26627")
		})
		.on("click", function () {
			// Close the half windows
			d3.selectAll(".half-window")
				.transition().duration(DURATION_SHORT)
				.style("opacity", 0)
				.on("end", function () {
					d3.selectAll(".half-window").style("visibility", "hidden")
					d3.selectAll(".half-window").selectAll('p').remove()
					d3.selectAll(".half-window").selectAll('img').remove()
				})
			// Close the menu
			d3.select("#menu")
				.transition().duration(DURATION_SHORT)
				.style("left", "-30vw")
				.on("end", function () {
					zoom_out()
				})
		})

	// Create button to only show data points with links
	d3.select("#show-only-linked")
		.style("opacity", 0)
		.style("visibility", "hidden")
		.on("mouseover", function () {
			d3.select(this)
				.style("cursor", "pointer")
				.style("color", "#f26627")
		})
		.on("click", function () {
			// Show the other button
			d3.select("#show-not-only-linked")
				.style("visibility", "visible")
				.transition().duration(750)
				.style("opacity", 1)
			// Hide this button
			d3.select(this)
				.transition().duration(750)
				.style("opacity", 0)
				.on("end", function () {
					d3.select(this)
						.style("visibility", "hidden")
				})
			hide_unlinked_data_points()
		})

	// Create button to show all data points (not only linked ones)
	d3.select("#show-not-only-linked")
		.style("opacity", 1)
		.style("visibility", "visible")
		.on("mouseover", function () {
			d3.select(this)
				.style("cursor", "pointer")
				.style("color", "#f26627")
		})
		.on("click", function () {
			// Show the other button
			d3.select("#show-only-linked")
				.style("visibility", "visible")
				.transition().duration(750)
				.style("opacity", 1)
			// Hide this button
			d3.select(this)
				.transition().duration(750)
				.style("opacity", 0)
				.on("end", function () {
					d3.select(this)
						.style("visibility", "hidden")
				})
			show_unlinked_data_points()
		})

	// Create button to remove filters
	d3.select("#remove-filter-button")
		.style("visibility", "hidden")
		.style("opacity", "0")
	d3.select("#remove-filter-button")
		.on("mouseover", function () {
			d3.select(this)
				.style("cursor", "pointer")
				.style("color", "#f26627")
		})
		.on("click", function () {
			document.getElementById("year-event-field").value = ""
			document.getElementById("month-field").value = ""
			document.getElementById("day-field").value = ""
			document.getElementById("song-field").value = ""
			document.getElementById("artist-field").value = ""
			document.getElementById("album-field").value = ""
			document.getElementById("year-song-field").value = ""
			document.getElementById("rank-field").value = ""
			document.getElementById("genre-field").value = ""
			document.getElementById("lyrics-field").value = ""
			if (zoomed_in) {
				show_all_data("events")
				show_all_data("songs")
			}
			else {
				hide_all_data("events")
				hide_all_data("songs")
				if (filtered_data) {
					subtitle_to_title()
				}
			}
			filtered_data = false
			hide_button("#remove-filter-button")
		})

	// Create events data points on the upper part of the svg
	d3.csv("../static/data/events_refs_website.csv").then(function (data) {
		var event_window = d3.select("#main")
			.append("div")
			.attr("class", "half-window")
			.attr("id", "half-window-event")
			.style("opacity", 0)
			.style("visibility", "hidden")
		plot_area.selectAll("#circle-event")
			.data(data)
			.enter()
			.append("circle")
			.style("r", "0.25vh")
			.attr("id", "circle-event")
			.attr("class", "circle-event-hidden")
			.attr("cx", d => xScale(get_date(d, true)))
			.attr("cy", d => select_random(margin_tb, ((height / 2) - (margin_tb / 2))))
			.on("mouseout", d => mouse_out_dot(bubble))
			.on("click", d => on_click_dot(event_window, d.Day + " " + d.Month + " " + d.Year + "<hr class='hr-box-event' align='right'>",
				d.Content, d.Summary_embedded + "<br><br><a href=\"" + d.Wikipedia + "\" class=\"href-wiki\"\" target=\"_blank\"\">Read more on Wikipedia</a> &#x2192;",
				d.filteredRefs, true, d.Year))
			.on("mouseover", function (d) {
				d3this = d3.select(this)
				mouse_over_dot(d3this, bubble, d.Day + " " + d.Month + " " + d.Year + "<br><br>" + d.Content, d.filteredRefs, true)
			})
	})

	// Create songs data points on the lower part of the svg
	d3.csv("../static/data/songs_refs_website.csv").then(function (data) {
		var song_window = d3.select("#main")
			.append("div")
			.attr("class", "half-window")
			.attr("id", "half-window-song")
			.style("opacity", 0)
			.style("visibility", "hidden")
		plot_area.selectAll("#circle-song")
			.data(data)
			.enter()
			.append("circle")
			.style("r", "0.25vh")
			.attr("id", "circle-song")
			.attr("class", "circle-song-hidden")
			.attr("cx", d => xScale(get_date(d, false)))
			.attr("cy", d => select_random(height / 2 + margin_tb / 2, height - margin_tb))
			.on("mouseout", d => mouse_out_dot(bubble))
			.on("click", d => on_click_dot(song_window, d.Song + "<span style=\"font-size:14px; color:#757575; font-weight:bold;\"> by </span> " + d.Artist + "<hr class='hr-box-song' align='right'>",
				"Year: " + d.Year + "<br>Rank: " + d.Rank + "<br>Album: " + d.Album + "<br>Genre: " + d.Genre,
				d.Lyrics_print_embedded + "<br><br><a href=\"" + d.Youtube + "\" class=\"href-youtube\" target=\"_blank\"\">Watch the video on Youtube</a> &#x2192;",
				d.filteredRefs, false, d.Year))
			.on("mouseover", function (d) {
				d3this = d3.select(this)
				mouse_over_dot(d3this, bubble, d.Artist + " - " + d.Song, d.filteredRefs, false)
			})
	})
}

function make_arrows_clickable() {
	/*	This function handles various events on the arrows, such as "mouseover", "mouseout"
		or "click" and the scroll action resulting from the "click" event. */

	// Arrow down in the main div
	d3.select("#arrow-down-main")
		.on("mouseover", function () {
			d3.select(this)
				.style("cursor", "pointer")
		})
		.on("click", function () {
			// Close the half windows
			d3.selectAll(".half-window")
				.transition().duration(DURATION_SHORT)
				.style("opacity", 0)
				.on("end", function () {
					window.transition().delay(DURATION_SHORT)
						.style("visibility", "hidden")
					window.selectAll('p')
						.remove()
					window.selectAll('img')
						.remove()
				})
			// Close the menu
			d3.select("#menu")
				.transition().duration(DURATION_SHORT)
				.style("left", "-30vw")
				.on("end", function () {
					var element = document.getElementById("description")
					scroll_to_element(element)
				})
		})

	// Arrow down in the description div
	d3.select("#arrow-down-description")
		.on("mouseover", function () {
			d3.select(this)
				.style("cursor", "pointer")
		})
		.on("click", function () {
			var element = document.getElementById("footer")
			scroll_to_element(element)
		})

	// Arrow up in the footer div
	d3.select("#arrow-up-footer")
		.on("mouseover", function () {
			d3.select(this)
				.style("cursor", "pointer")
		})
		.on("click", function () {
			var element = document.getElementById("main")
			scroll_to_element(element)
		})
}

function make_team_clickable() {
	/*	This function handles various events on the team images, such as "mouseover", "mouseout"
		or "click", together with their animtation. */

	d3.selectAll(".member-image")
		.on("mouseover", function () {
			d3.select(this).select('.img-team')
				.transition().duration(DURATION_SHORT)
				.style("opacity", 0.1)
			d3.select(this).select('.res-icon-gh')
				.transition().duration(DURATION_SHORT)
				.style("opacity", 1)
			d3.select(this).select('.res-icon-li')
				.transition().duration(DURATION_SHORT)
				.style("opacity", 1)
		})
		.on("mouseout", function () {
			d3.select(this).select('.img-team')
				.transition().duration(DURATION_SHORT)
				.style("opacity", 1)
			d3.select(this).select('.res-icon-gh')
				.transition().duration(DURATION_SHORT)
				.style("opacity", 0)
			d3.select(this).select('.res-icon-li')
				.transition().duration(DURATION_SHORT)
				.style("opacity", 0)
		})
}

function create_menu() {
	/*	This function creates the filter menu and manage the animations. It also
		performs the filter itself on song and event data points when the input
		fields are non-empty. */

	main_window = d3.select('#main')
	menu = main_window.append('div')
		.attr("id", "menu")
		.attr("class", "menu")
		.style("width", "24vw")
		.style("left", "-30vw")
	filters = menu.append('div')
		.attr("id", "filters")
		.attr("class", "filters")

	// Events section
	events_bloc = filters.append('div')
		.attr("id", "event-bloc")
		.attr("class", "event-bloc")
	events_bloc.append('h1')
		.attr("class", "title-menu")
		.html("Filter by events<hr class='hr-menu' align='left'>")
	// Event fields
	year_field = events_bloc.append('div')
		.attr("class", "div-field")
	month_field = events_bloc.append('div')
		.attr("class", "div-field")
	day_field = events_bloc.append('div')
		.attr("class", "div-field")
	content_field = events_bloc.append('div')
		.attr("class", "div-field")
	year_field.append('p')
		.attr("class", "p-menu")
		.html('Year')
	year_field.append('input')
		.attr("class", "input")
		.attr("id", "year-event-field")
	month_field.append('p')
		.attr("class", "p-menu")
		.html('Month')
	month_field.append('input')
		.attr("class", "input")
		.attr("id", "month-field")
	day_field.append('p')
		.attr("class", "p-menu")
		.html('Day')
	day_field.append('input')
		.attr("class", "input")
		.attr("id", "day-field")
	content_field.append('p')
		.attr("class", "p-menu")
		.html('Content')
	content_field.append('input')
		.attr("class", "input")
		.attr("id", "content-field")

	// Songs section
	songs_bloc = filters.append('div')
		.attr("id", "song-bloc")
		.attr("class", "song-bloc")
	songs_bloc.append('h1')
		.attr("class", "title-menu")
		.html("Filter by songs<hr class='hr-menu' align='left'>")
	// Song fields
	song_field = songs_bloc.append('div')
		.attr("class", "div-field")
	artist_field = songs_bloc.append('div')
		.attr("class", "div-field")
	album_field = songs_bloc.append('div')
		.attr("class", "div-field")
	year_field_s = songs_bloc.append('div')
		.attr("class", "div-field")
	rank_field = songs_bloc.append('div')
		.attr("class", "div-field")
	genre_field = songs_bloc.append('div')
		.attr("class", "div-field")
	lyrics_field = songs_bloc.append('div')
		.attr("class", "div-field")
	song_field.append('p')
		.attr("class", "p-menu")
		.html('Song')
	song_field.append('input')
		.attr("class", "input")
		.attr("id", "song-field")
	artist_field.append('p')
		.attr("class", "p-menu")
		.html("Artist")
	artist_field.append('input')
		.attr("class", "input")
		.attr("id", "artist-field")
	album_field.append('p')
		.attr("class", "p-menu")
		.html('Album')
	album_field.append('input')
		.attr("class", "input")
		.attr("id", "album-field")
	year_field_s.append('p')
		.attr("class", "p-menu")
		.html("Year")
	year_field_s.append('input')
		.attr("class", "input")
		.attr("id", "year-song-field")
	rank_field.append('p')
		.attr("class", "p-menu")
		.html('Rank')
	rank_field.append('input')
		.attr("class", "input")
		.attr("id", "rank-field")
	genre_field.append('p')
		.attr("class", "p-menu")
		.html("Genre")
	genre_field.append('input')
		.attr("class", "input")
		.attr("id", "genre-field")
	lyrics_field.append('p')
		.attr("class", "p-menu")
		.html("Lyrics")
	lyrics_field.append('input')
		.attr("class", "input")
		.attr("id", "lyrics-field")

	// Filter button
	filter_button = menu.append('div')
		.attr("id", "filter-button")
		.attr("class", "filter-button")
		.on("mouseover", function () {
			d3.select(this)
				.style("cursor", "pointer")
				.transition().duration(DURATION_SHORT)
				.style("background-color", "#f26627")
			d3.select("#filter-button-text")
				.transition().duration(DURATION_SHORT)
				.style("color", "white")
		})
		.on("mouseout", function () {
			d3.select(this)
				.transition().duration(DURATION_SHORT)
				.style("cursor", "pointer")
				.style("background-color", "white")
			d3.select("#filter-button-text")
				.transition().duration(DURATION_SHORT)
				.style("color", "#282828")
		})
		.on("click", function () {

			if (!event_fields_empty() || !song_fields_empty()) {
				filtered_data = true
				if (!event_fields_empty() && song_fields_empty()) {
					apply_filter()
					hide_all_data("songs")
				}
				if (!song_fields_empty() && event_fields_empty()) {
					apply_filter()
					hide_all_data("events")
				}
				if (!song_fields_empty() && !event_fields_empty()) {
					apply_filter()
					apply_filter()
				}
				show_button("#remove-filter-button")
			}

			d3.select("#menu")
				.transition().duration(DURATION_SHORT)
				.style("left", "-30vw")
		})
	// Add button text
	filter_button.append('p')
		.attr("id", "filter-button-text")
		.attr("class", "filter-button-text")
		.html("apply")

	// Remove filters button
	remove_button = menu.append('div')
		.attr("id", "remove-button")
		.attr("class", "remove-button")
		.on("mouseover", function () {
			d3.select(this)
				.style("cursor", "pointer")
				.transition().duration(DURATION_SHORT)
				.style("background-color", "#f26627")
			d3.select("#remove-button-text")
				.transition().duration(DURATION_SHORT)
				.style("color", "white")
		})
		.on("mouseout", function () {
			d3.select(this)
				.transition().duration(DURATION_SHORT)
				.style("cursor", "pointer")
				.style("background-color", "white")
			d3.select("#remove-button-text")
				.transition().duration(DURATION_SHORT)
				.style("color", "#282828")
		})
		.on("click", function () {
			document.getElementById("year-event-field").value = ""
			document.getElementById("month-field").value = ""
			document.getElementById("day-field").value = ""
			document.getElementById("song-field").value = ""
			document.getElementById("artist-field").value = ""
			document.getElementById("album-field").value = ""
			document.getElementById("year-song-field").value = ""
			document.getElementById("rank-field").value = ""
			document.getElementById("genre-field").value = ""
			document.getElementById("lyrics-field").value = ""
			if (zoomed_in) {
				show_all_data("events")
				show_all_data("songs")
			}
			else {
				hide_all_data("events")
				hide_all_data("songs")
				if (filtered_data) {
					subtitle_to_title()
					filtered_data = false
				}
			}
			hide_button("#remove-filter-button")
		})
	// Add button text
	remove_button.append('p')
		.attr("id", "remove-button-text")
		.attr("class", "remove-button-text")
		.html("remove")

	// Close menu button
	close_button = menu.append('img')
		.attr("id", "close-menu-button")
		.attr("class", "cross")
		.attr("src", "../static/img/cross_white.png")
		.on("mouseover", function () {
			d3.select(this)
				.style("cursor", "pointer")
		})
		.on("click", function () {
			menu_open = false;
			menu.transition().duration(DURATION_SHORT)
				.style("left", "-35vw")
		})

	// Open menu button
	d3.select("#open-menu-button")
		.on("mouseover", function () {
			d3.select(this)
				.style("cursor", "pointer")
		})
		.on("click", function () {
			menu_open = true;
			// Close the half windows
			d3.selectAll(".half-window")
				.transition().duration(DURATION_SHORT)
				.style("opacity", 0)
				.on("end", function () {
					d3.selectAll(".half-window").style("visibility", "hidden")
					d3.selectAll(".half-window").selectAll('p').remove()
					d3.selectAll(".half-window").selectAll('img').remove()
					menu.transition().duration(DURATION_SHORT)
						.style("left", "0vw")
				})
		})
}

/*
function demo() {
	demo_in_progress = true

	let our_date = 2001

	// hide title and timeline at beginning
	var xaxis = d3.select(".xaxis")
		.style("opacity", 0)
		.on("end", function () {
			d3.select(this)
				.style("visibility", "hidden")
		})

	var select_title = d3.select("#title")
		.style("opacity", 0)
		.on("end", function () {
			d3.select(this)
				.style("visibility", "hidden")
		})


	hide_button("#open-menu-button")
	hide_button("#show-not-only-linked")
	hide_button("#show-only-linked")
	hide_button("#show-not-only-linked")
	hide_button("#unzoom-button")
	hide_button("#remove-filter-button")
	hide_button("#arrow-down-main")

	// welcoming message
	var width = d3.select("#plot-div").node().getBoundingClientRect().width
	var height = d3.select("#plot-div").node().getBoundingClientRect().height

	var welcome = d3.select('#plot').append("text")
		.attr("transform", "translate(" + (width / 2) + " ," + ((height / 2) - 5) + ")")
		.attr("id", "welcome-title")
		.attr("class", "title")
		.style("text-anchor", "middle")
		.html("Welcome !")
		.attr("font-family", "heavitas")
		.attr("font-size", "1.4vw")
		.attr("fill", "#282828")
		.style("opacity", 0)

	// show welcome
	welcome
		.style("visibility", "visible")
		.transition()
		.duration(1500)
		.style("opacity", 1)

	// hide welcome
	welcome.transition().delay(1500).duration(750)
		.style("opacity", 0)
		.on("end", function () {
			d3.select(this)
				.style("visibility", "hidden")
		}
		)

	// show time axis
	xaxis
		.style("visibility", "visible")
		.transition().delay(1500).duration(1000)
		.style("opacity", 1)

	// zoom on year
	setTimeout(function () {
		zoom_in(new Date(our_date - 2, 0, 1),
			new Date(our_date + 2, 11, 31));
	}, 2500);

	//TODO : select dot
	setTimeout(function () {
		demo_in_progress = true

		var event_window = d3.select("#main").selectAll(".half-window")
		console.log(event_window)
		var bubble = d3.select("#bubble")

		d3.select("#plot-area").selectAll(".circle-event-visible")
			.filter(d => d.Year == "2001" && d.Month == "July" && d.Day == "9")
			.transition().duration(DURATION_SHORT)
			.attr("fill", '#f26627')
			.style("r", "0.75vh")
			.style("opacity", 1)
			.call(function() {
				count_clicked = 1
				var year = ""
					var month = ""
					var day = ""
					var content = ""
					var summary = ""
					var wikipedia = ""
					var filteredRefs = ""
				d3.select("#plot-area").selectAll(".circle-event-visible")
				.filter(function(d) {
					year = d.Year
					month = d.Month
					day = d.Day
					content = d.Content
					summary = d.Summary_embedded
					wikipedia = d.Wikipedia
					filteredRefs = d.filteredRefs
					return year == "2001" && month == "July" && day == "9"
				})

				on_click_dot(event_window, day + " " + month + " " + year + "<hr class='hr-box-event' align='right'>",
				content, summary + "<br><br><a href=\"" + wikipedia + "\" class=\"href-wiki\"\" target=\"_blank\"\">Read more on Wikipedia</a> &#x2192;",
				filteredRefs, true, year)
				on_click_dot()
			})

}, 5000);

	// zooming out
	setTimeout(function () {
		demo_in_progress = true
		zoom_out();
	}, 10000);

	setTimeout(function () {
		show_button("#open-menu-button")
		show_button("#show-not-only-linked")
		show_button("#show-only-linked")
		show_button("#show-not-only-linked")
		show_button("#unzoom-button")
		show_button("#remove-filter-button")
	}, 14000);

	setTimeout(function () {
		subtitle_to_title()
	}, 14000)

	count_clicked = 0
	demo_in_progress = false
}*/

function instant_hide(id){
	d3.select(id)
		.style("opacity", 0)
		.on("end", function () {
			d3.select(this)
				.style("visibility", "hidden")
		})
}

function show(id){
	d3.select(id)
		.style("visibility", "visible")
		.transition().duration(1000)
		.style("opacity", 1)
}

function display_intro_title(text, stay_time){

	var width = d3.select("#plot-div").node().getBoundingClientRect().width
	var height = d3.select("#plot-div").node().getBoundingClientRect().height

	var welcome = d3.select('#plot').append("text")
		.attr("transform", "translate(" + (width / 2) + " ," + ((height / 2) - 5) + ")")
		.attr("id", "welcome-title")
		.attr("class", "title")
		.style("text-anchor", "middle")
		.html(text)
		.attr("font-family", "heavitas")
		.attr("font-size", "1.4vw")
		.attr("fill", "#282828")
		.style("opacity", 0)

	// show welcome
	welcome
		.style("visibility", "visible")
		.transition()
		.duration(1500)
		.style("opacity", 1)

	// hide welcome
	welcome.transition().delay(stay_time).duration(750)
		.style("opacity", 0)
		.on("end", function () {
			d3.select(this)
				.style("visibility", "hidden")
		})
}

function simple_intro(){
	demo_in_progress = true

	// hide title and timeline at beginning
	instant_hide(".xaxis")
	instant_hide("#title")
	instant_hide("#open-menu-button")
	instant_hide("#show-not-only-linked")
	instant_hide("#show-only-linked")
	instant_hide("#show-not-only-linked")
	instant_hide("#unzoom-button")
	instant_hide("#remove-filter-button")
	instant_hide("#arrow-down-main")

	// welcoming message
	display_intro_title("Welcome !", 1500)
	setTimeout(function () {
		display_intro_title("This website allows you to explore the influence of historical events on pop culture.", 5000)
	}, 2000)

	setTimeout(function () {
		display_intro_title("Have fun and get lost in time !", 3500)
	}, 8000)

	// show time axis
	setTimeout(function () {
		show(".xaxis")
	}, 11000)

	// show all
	setTimeout(function () {
		show_button("#open-menu-button")
		show_button("#show-not-only-linked")
		show_button("#arrow-down-main")

		subtitle_to_title()
	}, 12000)

	demo_in_progress = false
}

whenDocumentLoaded(() => {
	// When the document we add the data points but invisible, we create the animations
	// on the animated elements and we create the filter menu.
	add_data_points()
	make_arrows_clickable()
	make_team_clickable()
	create_menu()
	simple_intro()

})
