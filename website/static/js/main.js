/*  This script handles the functions called to construct the basis of the
	website when the function "whenDocumentLoaded" is called. */

var DURATION = 250;
var zoomed_in = false;
var menu_open = false;
var filtered_data = false;
var mindate = new Date(1965, 0, 1);
var maxdate = new Date(2015, 11, 31);

var event_clicked = false;
var song_clicked = false;

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
	var xScale = d3.scaleTime().domain([mindate, maxdate]).range([margin_lr, width - margin_lr])
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
	make_year_clickable(xScale)

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
				.transition().duration(DURATION)
				.style("opacity", 0)
				.on("end", function () {
					d3.selectAll(".half-window").style("visibility", "hidden")
					d3.selectAll(".half-window").selectAll('p').remove()
					d3.selectAll(".half-window").selectAll('img').remove()
				})
			// Close the menu
			d3.select("#menu")
				.transition().duration(DURATION)
				.style("left", "-30vw")
				.on("end", function () {
					zoom_out(xScale)
				})
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
				show_all_event_data()
				show_all_song_data()
			}
			else {
				hide_all_event_data()
				hide_all_song_data()
				if (filtered_data) {
					subtitle_to_title()
				}
			}
			filtered_data = false
			hide_button("#remove-filter-button")
		})

	// Create events data points on the upper part of the svg
	d3.csv("static/data/events_refs_website.csv").then(function (data) {
		var event_window = d3.select("#main")
			.append("div")
			.attr("class", "half-window")
			.attr("id", "half-window")
			.style("opacity", 0)
		
		plot_area.selectAll(".circle-event")
			.data(data)
			.enter()
			.append("circle")
			.style("r", "0.25vh")
			.attr("class", "circle-event")
			.attr("cx", d => xScale(get_date(d, true)))
			.attr("cy", d => select_random(margin_tb, ((height / 2) - (margin_tb / 2))))
			.style("visibility", "hidden")
			.style("opacity", 0)
			.on("mouseout", d => mouse_out_dot(bubble))
			.on("click", d => on_click_dot(event_window, d.Day + " " + d.Month + " " + d.Year + "<hr class='hr-box-event' align='right'>",
				d.Content, d.Summary + "<br><br><a href=\"" + d.Wikipedia + "\" class=\"href-wiki\"\" target=\"_blank\"\">Read more on Wikipedia</a> &#x2192;",
				d.filteredRefs, true))
			.on("mouseover", function (d) {
				d3this = d3.select(this)
				mouse_over_dot(d3this, bubble, d.Day + " " + d.Month + " " + d.Year + "<br><br>" + d.Content, d.filteredRefs, true)
			})
	})

	// Create songs data points on the lower part of the svg
	d3.csv("static/data/songs_refs_website.csv").then(function (data) {
		var song_window = d3.select("#main")
			.append("div")
			.attr("class", "half-window")
			.attr("id", "half-window")
			.style("opacity", 0);
		plot_area.selectAll(".circle-song")
			.data(data)
			.enter()
			.append("circle")
			.style("r", "0.25vh")
			.attr("class", "circle-song")
			.attr("cx", d => xScale(get_date(d, false)))
			.attr("cy", d => select_random(height / 2 + margin_tb / 2, height - margin_tb))
			.style("visibility", "hidden")
			.style("opacity", 0)
			.on("mouseout", d => mouse_out_dot(bubble))
			.on("click", d => on_click_dot(song_window, 
				d.Song + " by " + d.Artist + "<hr class='hr-box-song' align='right'>", "Year: " + d.Year + "<br>Rank: " + d.Rank + "<br>Album: " + d.Album + "<br>Genre: " + d.Genre, d.Lyrics + "<br><br><a href=\"" + d.Youtube + "\" class=\"href-youtube\" target=\"_blank\"\">Watch the video on Youtube</a> &#x2192;", 
				d.filteredRefs, false))
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
				.transition().duration(DURATION)
				.style("opacity", 0)
				.on("end", function () {
					window.transition().delay(DURATION)
						.style("visibility", "hidden")
					window.selectAll('p')
						.remove()
					window.selectAll('img')
						.remove()
				})
			// Close the menu
			d3.select("#menu")
				.transition().duration(DURATION)
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
				.transition().duration(DURATION)
				.style("opacity", 0.1)
			d3.select(this).select('.res-icon-gh')
				.transition().duration(DURATION)
				.style("opacity", 1)
			d3.select(this).select('.res-icon-li')
				.transition().duration(DURATION)
				.style("opacity", 1)
		})
		.on("mouseout", function () {
			d3.select(this).select('.img-team')
				.transition().duration(DURATION)
				.style("opacity", 1)
			d3.select(this).select('.res-icon-gh')
				.transition().duration(DURATION)
				.style("opacity", 0)
			d3.select(this).select('.res-icon-li')
				.transition().duration(DURATION)
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
				.transition().duration(DURATION)
				.style("background-color", "#f26627")
			d3.select("#filter-button-text")
				.transition().duration(DURATION)
				.style("color", "white")
		})
		.on("mouseout", function () {
			d3.select(this)
				.transition().duration(DURATION)
				.style("cursor", "pointer")
				.style("background-color", "white")
			d3.select("#filter-button-text")
				.transition().duration(DURATION)
				.style("color", "#282828")
		})
		.on("click", function () {
			if (zoomed_in) {
				if (!event_fields_empty() || !song_fields_empty()) {
					filtered_data = true
					if (!event_fields_empty() && song_fields_empty()) {
						update_event_points_given_query(zoomed_in)
						hide_all_song_data()
					}
					if (!song_fields_empty() && event_fields_empty()) {
						update_song_points_given_query(zoomed_in)
						hide_all_event_data()
					}
					if (!song_fields_empty() && !event_fields_empty) {
						update_event_points_given_query(zoomed_in)
						update_song_points_given_query(zoomed_in)
					}
					show_button("#remove-filter-button")
				}
			}
			else {
				if (!event_fields_empty() || !song_fields_empty()) {
					filtered_data = true
					if (!event_fields_empty()) {
						update_event_points_given_query(false)
					}
					if (!song_fields_empty()) {
						update_song_points_given_query(false)
					}
					title_to_subtitle()
					show_button("#remove-filter-button")
				}
			}
			d3.select("#menu")
				.transition().duration(DURATION)
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
				.transition().duration(DURATION)
				.style("background-color", "#f26627")
			d3.select("#remove-button-text")
				.transition().duration(DURATION)
				.style("color", "white")
		})
		.on("mouseout", function () {
			d3.select(this)
				.transition().duration(DURATION)
				.style("cursor", "pointer")
				.style("background-color", "white")
			d3.select("#remove-button-text")
				.transition().duration(DURATION)
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
				show_all_event_data()
				show_all_song_data()
			}
			else {
				hide_all_event_data()
				hide_all_song_data()
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
		.attr("src", "static/img/cross_white.png")
		.on("mouseover", function () {
			d3.select(this)
				.style("cursor", "pointer")
		})
		.on("click", function () {
			menu_open = false;
			menu.transition().duration(DURATION)
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
				.transition().duration(DURATION)
				.style("opacity", 0)
				.on("end", function () {
					d3.selectAll(".half-window").style("visibility", "hidden")
					d3.selectAll(".half-window").selectAll('p').remove()
					d3.selectAll(".half-window").selectAll('img').remove()
					menu.transition().duration(DURATION)
						.style("left", "0vw")
				})
		})
}

whenDocumentLoaded(() => {
	// When the document we add the data points but invisible, we create the animations
	// on the animated elements and we create the filter menu.
	d3.csv("static/data/events_refs_website.csv").then(function (data) {
		console.log(typeof data[0][""]);
	})
	
	add_data_points()
	make_arrows_clickable()
	make_team_clickable()
	create_menu()
})