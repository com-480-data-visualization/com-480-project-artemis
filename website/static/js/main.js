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

function add_data_points(date) {

	var width = d3.select("#plot-div").node().getBoundingClientRect().width
	var height = d3.select("#plot-div").node().getBoundingClientRect().height
	var margin_lr = 2 * width / 100
	var margin_tb = 8 * height / 100

	var svg = d3.select('#plot')
		.attr("preserveAspectRatio", "xMinYMin meet")
		.attr("viewBox", "0 0 " + width + " " + height)
		.attr("width", width)
		.attr("height", height);
	var plot_area = svg.append('g')
	var bubble = d3.select("#main")
		.append("div")
		.attr("class", "tooltip")
		.attr("id", "bubble")
		.style("opacity", 0)

	// Create x-axis
	var mindate = new Date(1965, 0, 1)
	var maxdate = new Date(2015, 11, 31);
	var xScale = d3.scaleTime().domain([mindate, maxdate]).range([margin_lr, width - margin_lr])
	var xAxis = fc.axisBottom(xScale)
		.tickArguments([52])
		.tickCenterLabel(true)
		.tickSizeInner(0)
		.tickSizeOuter(0)
	svg.append("g")
		.attr("transform", "translate(0," + (height / 2) + ")")
		.attr("class", "xaxis")
		.call(xAxis)
	make_year_clickable()

	// Create unzoom button
	d3.select("#unzoom-button")
		.style("visibility", "hidden")
		.style("opacity", "0")
	d3.select("#unzoom-button")
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
					d3.selectAll(".half-window").style("visibility", "hidden")
					d3.selectAll(".half-window").selectAll('p').remove()
					d3.selectAll(".half-window").selectAll('img').remove()
				})
			// Close the menu
			d3.select("#menu")
				.transition().duration(DURATION)
				.style("left", "-30vw")
				.on("end", function () {
					unzoom()
				})
		})

	// Create events data points on the upper part of the svg
	d3.csv("static/data/events.csv").then(function (data) {
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
			.on("mouseout", d => mouse_out_dot(bubble, d.Year, date))
			.on("click", d => on_click_dot(event_window, d.Day + " " + d.Month + " " + d.Year + "<hr class='hr-box-event' align='right'>", d.Content, d.Summary + "<br><br><a href=\"" + d.Wikipedia + "\" class=\"href-wiki\"\" target=\"_blank\"\">Read more on Wikipedia</a> &#x2192;", true))
			.on("mouseover", function (d) {
				d3this = d3.select(this)
				mouse_over_dot(d3this, bubble, d.Day + " " + d.Month + " " + d.Year + "<br><br>" + d.Content)
			})
	});

	// Create songs data points on the lower part of the svg
	d3.csv("static/data/songs.csv").then(function (data) {
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
			.on("mouseout", d => mouse_out_dot(bubble, d.Year, date))
			.on("click", d => on_click_dot(song_window, d.Song + " by " + d.Artist + "<hr class='hr-box-song' align='right'>", "Year: " + d.Year + "<br>Rank: " + d.Rank + "<br>Album: " + d.Album + "<br>Genre: " + d.Genre, d.Lyrics + "<br><br><a href=\"" + d.Youtube + "\" class=\"href-youtube\" target=\"_blank\"\">Watch the video on Youtube</a> &#x2192;", false))
			.on("mouseover", function (d) {
				d3this = d3.select(this)
				mouse_over_dot(d3this, bubble, d.Artist + " - " + d.Song, false)
			})
	});

	// Handle the mouseover and click event of the ticks
	function make_year_clickable() {
		d3.selectAll(".tick")
			.on("mouseover", function () {
				var current_date = +d3.select(this).text()
				if (1967 <= current_date && current_date <= 2013) {
					d3.select(this).select("text")
						.transition().duration(DURATION)
						.style("fill", "#f26627")
						.style("cursor", "pointer")
				}
			})
			.on("mouseout", function () {
				var current_date = +d3.select(this).text()
				if (1967 <= current_date && current_date <= 2013) {
					d3.select(this).select("text")
						.transition().duration(DURATION)
						.style("fill", "#282828")
						.style("cursor", "pointer")
				}
			})
			.on("click", function () {
				var current_date = +d3.select(this).text()
				if (1967 <= current_date && current_date <= 2013) {
					var min_date = new Date(current_date - 2, 0, 1)
					var max_date = new Date(current_date + 2, 11, 31)
					zoom_on_year(min_date, max_date)
				}
			})
	}

	// Handle the zoom function called on click of ticks
	function zoom_on_year(min_date, max_date) {
		xScale.domain([min_date, max_date])
		xAxis = fc.axisBottom(xScale)
			.tickArguments([5])
			.tickCenterLabel(true)
			.tickSizeInner(0)
			.tickSizeOuter(0)

		d3.select("#unzoom-button")
			.style("visibility", "visible")
			.transition().duration(1500)
			.style("opacity", 1)

		svg.select(".xaxis")
			.transition().duration(1500)
			.call(xAxis)
			.on("end", function () {
				make_year_clickable()
			})

		plot_area.selectAll(".circle-event")
			.style("visibility", "visible")
			.transition().duration(1500)
			.attr("cx", d => xScale(get_date(d, true)))
			.style("opacity", 1)
		plot_area.selectAll(".circle-song")
			.style("visibility", "visible")
			.transition().duration(1500)
			.attr("cx", d => xScale(get_date(d, false)))
			.style("opacity", 1)
	}

	function unzoom() {
		xScale.domain([mindate, maxdate])
		xAxis = fc.axisBottom(xScale)
			.tickArguments([51])
			.tickCenterLabel(true)
			.tickSizeInner(0)
			.tickSizeOuter(0)

		d3.select("#unzoom-button")
			.transition().duration(1500)
			.style("opacity", 0)
			.on("end", function () {
				d3.select(this)
					.style("visibility", "hidden")
			})

		svg.select(".xaxis")
			.transition().duration(1500)
			.call(xAxis)
			.on("end", function () {
				make_year_clickable()
			})

		plot_area.selectAll(".circle-event")
			.transition().duration(1500)
			.attr("cx", d => xScale(get_date(d, true)))
			.style("opacity", 0)
			.on("end", function () {
				plot_area.selectAll(".circle-event")
					.style("visibility", "hidden")
			})
		plot_area.selectAll(".circle-song")
			.transition().duration(1500)
			.attr("cx", d => xScale(get_date(d, false)))
			.style("opacity", 0)
			.on("end", function () {
				plot_area.selectAll(".circle-song")
					.style("visibility", "hidden")
			})
	}
}

function make_arrows_clickable() {

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
	// When the document is loaded, we make the year ticks clickable and we add the data points but invisible
	add_data_points()
	make_arrows_clickable()
	make_team_clickable()
	create_menu()
})
