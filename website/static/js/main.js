/*  This script handles the functions called to construct the basis of the
	website when the function whenDocumentLoaded is called. */


var DURATION = 250;

function whenDocumentLoaded(action) {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", action);
	} else {
		action();
	}
}

function make_grid_items_clickable() {
	var clicked = false
	d3.selectAll(".grid-item")
		.on("mouseover", function () {
			d3.select(this)
				.transition().duration(DURATION)
				.style("color", "#f26627")
				.style("cursor", "pointer")
		})
		.on("mouseout", function () {
			d3.select(this)
				.transition().duration(DURATION)
				.style("color", "#282828")
		})
		.on("click", function () {
			d3.select(this)
				.style("color", "#f26627")
			if (!clicked) {
				d3.select("#h1-tl")
					.transition().duration(DURATION / 2)
					.style("opacity", 0)
					.on("end", function () {
						d3.select("#h1-tl")
							.html("events / songs")
							.transition().duration(DURATION / 2)
							.style("opacity", 1)
						clicked = true
					})
			}
			update_visible_points(d3.select(this).text())
		})
}

function add_events_data_points(date) {

	d3.csv("static/data/events.csv").then(function (data) {

		var svg = d3.select('#plot-events')
		var plot_area = svg.append('g')

		var bubble = d3.select("#main").append("div")
			.attr("class", "tooltip")
			.attr("id", "bubble-event")
			.style("opacity", 0);

		var event_window = d3.select("#main")
			.append("div")
			.attr("class", "half-window")
			.attr("id", "half-window")
			.style("opacity", 0)

		plot_area.selectAll("circle")
			.data(data)
			.enter()
			.append("circle")
			.attr("r", 0.5)
			.attr("cx", d => select_random(300))
			.attr("cy", d => select_random(60))
			.style("visibility", "hidden")
			.style("opacity", 0)
			.on("mouseout", d => mouse_out_dot(bubble, d.Year, date))
			.on("click", d => on_click_dot(event_window, d.Content, d.Day + " " + d.Month + " " + d.Year + "<hr class='hr-box-event' align='left'>", d.Summary + "<br><br>Read more on <a href=\"" + d.Wikipedia + "\">Wikipedia</a>", true))
			.on("mouseover", function (d) {
				d3this = d3.select(this)
				mouse_over_dot(d3this, bubble, d.Day + " " + d.Month + " " + d.Year + "<br><br>" + d.Content, true)
			})
	});
}

function add_songs_data_points(date) {

	d3.csv("static/data/songs.csv").then(function (data) {
		var svg = d3.select('#plot-songs')
		var plot_area = svg.append('g')

		var bubble = d3.select("#main").append("div")
			.attr("class", "tooltip")
			.attr("id", "bubble-song")
			.style("opacity", 0);

		var song_window = d3.select("#main")
			.append("div")
			.attr("class", "half-window")
			.attr("id", "half-window")
			.style("opacity", 0);

		plot_area.selectAll("circle")
			.data(data)
			.enter()
			.append("circle")
			.attr("r", 0.5)
			.attr("cx", d => select_random(300))
			.attr("cy", d => select_random(60))
			.style("visibility", "hidden")
			.style("opacity", 0)
			.on("mouseout", d => mouse_out_dot(bubble, d.Year, date))
			.on("click", d => on_click_dot(song_window, d.Artist + " - " + d.Song, "Year: " + d.Year + "&emsp;Rank: " + d.Rank + "&emsp;Album: " + d.Album + "&emsp;Genre: " + d.Genre + "<hr class='hr-box-song' align='left'>", d.Lyrics, false))
			.on("mouseover", function (d) {
				d3this = d3.select(this)
				mouse_over_dot(d3this, bubble, d.Artist + " - " + d.Song, false)
			})
	});
}

function update_visible_points(date) {

	d3.selectAll("circle")
		.filter(function (d) {
			return d.Year != date
		})
		.transition().duration(DURATION)
		.style("opacity", 0)

	d3.selectAll("circle")
		.filter(function (d) {
			return d.Year == date
		})
		.style("visibility", "visible")
		.transition().duration(DURATION)
		.style("opacity", 1)
		.on("end", function (d) {
			d3.selectAll("circle")
				.style("visibility", function (d) {
					return d.Year == date ? "visible" : "hidden"
				})
		})
}

function make_arrows_clickable() {

	d3.select("#arrow-down-main")
		.on("mouseover", function () {
			d3.select(this)
				.style("cursor", "pointer")
		})
		.on("click", function () {
			d3.select("#menu")
				.transition().duration(DURATION)
				.style("left", "-30vw")
				.on("end", function () {
					var element = document.getElementById("description")
					scroll_to_element(element)
				})

		})

	d3.select("#arrow-down-description")
		.on("mouseover", function () {
			d3.select(this)
				.style("cursor", "pointer")
		})
		.on("click", function () {
			var element = document.getElementById("footer")
			scroll_to_element(element)
		})

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

function create_time_line_container() {
	var tl_container = d3.select("#main").append("div")
		.attr("class", "tl-container")
		.attr("id", "tl-container")

	tl_container.append('h1')
		.attr("class", "h1-tl")
		.attr("id", "h1-tl")
		.html('choose a year')

	tl_container.append('line')
		.attr("class", "timeline")
		.attr("id", "timeline")

	grid_container = tl_container.append('div')
		.attr("id", "grid-container")
		.attr("class", "grid-container")

	for (var i = 1965; i <= 2015; i++) {
		grid_container.append("div")
			.attr("class", "grid-item")
			.html(i)
	}
}

function make_team_clickable() {

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
	main_window = d3.select('#main')
	menu = main_window.append('div')
		.attr("id", "menu")
		.attr("class", "menu")
		.style("width", "24vw")
		.style("left", "-30vw")

	filters = menu.append('div')
		.attr("id", "filters")
		.attr("class", "filters")

	events_bloc = filters.append('div')
		.attr("id", "event-bloc")
		.attr("class", "event-bloc")
	events_bloc.append('h1')
		.attr("class", "title-menu")
		.html("Filter by events<hr class='hr-menu' align='left'>")

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
	month_field.append('p')
		.attr("class", "p-menu")
		.html('Month')
	month_field.append('input')
		.attr("class", "input")
	day_field.append('p')
		.attr("class", "p-menu")
		.html('Day')
	day_field.append('input')
		.attr("class", "input")

	songs_bloc = filters.append('div')
		.attr("id", "song-bloc")
		.attr("class", "song-bloc")
	songs_bloc.append('h1')
		.attr("class", "title-menu")
		.html("Filter by songs<hr class='hr-menu' align='left'>")

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
	artist_field.append('p')
		.attr("class", "p-menu")
		.html("Artist")
	artist_field.append('input')
		.attr("class", "input")
	album_field.append('p')
		.attr("class", "p-menu")
		.html('Album')
	album_field.append('input')
		.attr("class", "input")
	year_field_s.append('p')
		.attr("class", "p-menu")
		.html("Year")
	year_field_s.append('input')
		.attr("class", "input")
	rank_field.append('p')
		.attr("class", "p-menu")
		.html('Rank')
	rank_field.append('input')
		.attr("class", "input")
	genre_field.append('p')
		.attr("class", "p-menu")
		.html("Genre")
	genre_field.append('input')
		.attr("class", "input")
	lyrics_field.append('p')
		.attr("class", "p-menu")
		.html("Lyrics")
	lyrics_field.append('input')
		.attr("class", "input")

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
			console.log("Filter applied!")
		})

	filter_button.append('p')
		.attr("id", "filter-button-text")
		.attr("class", "filter-button-text")
		.html("apply")

	close_button = menu.append('img')
		.attr("id", "close-menu-button")
		.attr("class", "cross")
		.attr("src", "static/img/cross_white.png")
		.on("mouseover", function () {
			d3.select(this)
				.style("cursor", "pointer")
		})
		.on("click", function () {
			menu.transition().duration(DURATION)
				.style("left", "-35vw")
		})

	d3.select("#open-menu-button")
		.on("mouseover", function () {
			d3.select(this)
				.style("cursor", "pointer")
		})
		.on("click", function () {
			menu.transition().duration(DURATION)
				.style("left", "0vw")
		})
}

whenDocumentLoaded(() => {
	// When the document is loaded, we make the year ticks clickable and we add the data points but invisible
	create_time_line_container()
	add_events_data_points()
	add_songs_data_points()
	make_grid_items_clickable()
	make_arrows_clickable()
	make_team_clickable()
	create_menu()
})