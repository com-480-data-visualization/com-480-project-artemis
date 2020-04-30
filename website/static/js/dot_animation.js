var DURATION = 250;

function whenDocumentLoaded(action) {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", action);
	} else {
		// `DOMContentLoaded` already fired
		action();
	}
}


/* ---------------------------------------------------------------------------------------------------------------------------------------*/

whenDocumentLoaded(() => {

	// When the document is loaded, we make the year ticks clickable
	// and we add the data points but with 0 opacity
	add_data_points()
	make_grid_items_clickable()
})
/* ---------------------------------------------------------------------------------------------------------------------------------------*/

function select_random(max) {
    return Math.floor(Math.random() * Math.floor(max)) 
}

function split_string(string) {
	console.log(string)
	tokens = string.split(" ")
	var l = tokens.length
  	var iter = Math.floor(l/5)
  	var str_final = '<tspan x="0" dy="1.2em">' + tokens[0] + ' '
  	for(let i=1; i<l; i++) {
		  if(i == l-1) {
			str_final += (tokens[i]) + '</tspan>'
		  }
		  else if(i % 5 == 0) {
			  str_final += (tokens[i] + '</tspan>' + '<tspan x="0" dy="1.2em">')
		  }
		  else {
			str_final += (tokens[i] + ' ')
		  }
	}
	return str_final
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
			.transition()
			.duration(DURATION)
			.style("opacity", 0)
		  update_visible_points(d3.select(this).text())
	  })
}

function add_data_points(date) {
	
	d3.csv("http://localhost:7800/ressources/test.csv").then(function (data) {

		var svg = d3.select('#plot')
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
				.style("font-size", "0.1rem")
				.style("font-family", "heavitas")
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
				.transition().duration(DURATION)
				.attr("fill", 'black')
				.attr("r", 0.5)
		}

		plot_area.selectAll("circle")
			.data(data)
			.enter()
			.append("circle")
				.attr("r", 0.5)
				.attr("cx", d => select_random(200))
				.attr("cy", d => select_random(50))
				.style("visibility", "hidden")
				.style("opacity", 0)
			.on("mouseover", mouseover)
			.on("mouseout", mouseout)				
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
