var DURATION = 250;

/* ---------------------------------------------------------------------------------------------------------------------------------------*/

function whenDocumentLoaded(action) {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", action);
	} else {
		// `DOMContentLoaded` already fired
		action();
	}
}

function select_random(max) {
    return Math.floor(Math.random() * Math.floor(max)) 
}

function make_grid_items_clickable() {
	console.log("back to main function")
	d3.select("body")
	  .selectAll(".grid-item")
	  .on("mouseover", function() {
		  d3.select(this)
			.style("color", "#f26627")
			.style("cursor", "pointer")
	  })
	  .on("mouseout", function() {
		  d3.select(this)
		  	.style("color", "#282828")
	  })
	  .on("click", function() {
		  d3.select(this)
			.style("color", "#f26627")
		  d3.select("#choose-year")
			.transition().duration(DURATION)
			.style("opacity", 0)
		  update_visible_points(d3.select(this).text())
	  })
}

function add_events_data_points(date) {
	
	d3.csv("static/data/events.csv").then(function (data) {

		var svg = d3.select('#plot_events')
		var plot_area = svg.append('g')
		var box = svg.append('g')

		var mouseover = function(d) {
			// Each point has a mouseOver function
			d3.selectAll("circle")
				.transition().duration(DURATION)
				.style("opacity", 0.25)
			d3.select(this)
				.transition()
				.duration(DURATION)
				.attr("fill", '#f26627')
				.attr("r", 1)
		
			box.append("text")
				.attr("width", 16)
				.attr("x", (d3.mouse(this)[0]-6) + "px")
				.attr("y", (d3.mouse(this)[1]-5) + "px")
				.style("font-size", "0.15rem")
				.style("font-family", "heavitas")
				.style("font-weight", "100")
				.style("opacity", 0)
				.text(d.Content) 
			box.selectAll("text")
				.transition().duration(DURATION)
				.style("opacity", 1)
		} 
		
		var mouseout = function(d) {
			// Each point has a mouseOut function
			d3.selectAll("text")
				.transition().duration(DURATION)
				.style("opacity", 0)
				.remove()
			d3.selectAll("rect")
				.transition().duration(DURATION)
				.style("opacity", 0)
				.remove()
			d3.selectAll("circle")
				.filter(function(d) {
					return d.Year != date
				})
				.transition().duration(DURATION)
				.style("opacity", 1)
				.attr("fill", 'black')
				.attr("r", 0.5)
		}

		var onclick = function() {
			width = screen.width
			height = screen.width/2
			d3.select("#my_rect2")
				.transition()
				.duration(2000)
				.attr("width", width)
				.transition()
				.attr("height", height)
		}

		plot_area.selectAll("circle")
			.data(data)
			.enter()
			.append("circle")
				.attr("r", 0.5)
				.attr("cx", d => select_random(300))
				.attr("cy", d => select_random(60))
				.style("visibility", "hidden")
				.style("opacity", 0)
			.on("mouseover", mouseover)
			.on("mouseout", mouseout)
			.on("click", onclick)			
	});
}

function add_songs_data_points(date) {
	
	d3.csv("static/data/songs.csv").then(function (data) {

		var svg = d3.select('#plot_songs')
		var plot_area = svg.append('g')
		var box = svg.append('g')

		var mouseover = function(d) {
			// Each point has a mouseOver function
			d3.select(this)
				.transition()
				.duration(DURATION)
				.attr("fill", '#f26627')
				.attr("r", 1)
		
			box.append("text")
				.attr("width", 16)
				.attr("x", (d3.mouse(this)[0]-6) + "px")
				.attr("y", (d3.mouse(this)[1]-5) + "px")
				.style("font-size", "0.15rem")
				.style("font-family", "heavitas")
				.style("font-weight", "100")
				.style("opacity", 0)
				.text(d.Artist + " - " + d.Song)
 			box.selectAll("text")
				.transition().duration(DURATION)
				.style("opacity", 1)
		} 
		
		var mouseout = function() {
			// Each point has a mouseOut function
			d3.selectAll("text")
				.transition().duration(DURATION)
				.style("opacity", 0)
				.remove()
			d3.selectAll("rect")
				.transition().duration(DURATION)
				.style("opacity", 0)
				.remove()
			d3.selectAll("circle")
				.transition().duration(DURATION)
				.attr("fill", 'black')
				.attr("r", 0.5)
		}

		var onclick = function() {
			width = screen.width
			height = screen.width/2
			d3.select("#my_rect2")
				.transition()
				.duration(2000)
				.attr("width", width)
				.transition()
				.attr("height", height)
		}

		plot_area.selectAll("circle")
			.data(data)
			.enter()
			.append("circle")
				.attr("r", 0.5)
				.attr("cx", d => select_random(300))
				.attr("cy", d => select_random(60))
				.style("visibility", "hidden")
				.style("opacity", 0)
			.on("mouseover", mouseover)
			.on("mouseout", mouseout)
			.on("click", onclick)			
	});
}

function update_visible_points(date) {

	d3.selectAll("circle")
		.filter(function(d) {
			return d.Year != date
		})
		.transition().duration(DURATION)
		.style("opacity", 0)
	
	d3.selectAll("circle")
		.filter(function(d) {
			return d.Year == date
		})
		.style("visibility", "visible")
		.transition().duration(DURATION)
		.style("opacity", 1)
		.on("end", function (d) {
			d3.selectAll("circle")
				.style("visibility", function(d) {
					return d.Year == date? "visible": "hidden"
				})
		})
}


/* ---------------------------------------------------------------------------------------------------------------------------------------*/

whenDocumentLoaded(() => {

	// When the document is loaded, we make the year ticks clickable
	// and we add the data points but invisible
	add_events_data_points()
	add_songs_data_points()
	make_grid_items_clickable()
})

/* ---------------------------------------------------------------------------------------------------------------------------------------*/
