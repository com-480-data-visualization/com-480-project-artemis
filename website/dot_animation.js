/*
	Run the action when we are sure the DOM has been loaded
	https://developer.mozilla.org/en-US/docs/Web/Events/DOMContentLoaded
	Example:
	whenDocumentLoaded(() => {
		console.log('loaded!');
		document.getElementById('some-element');
	});
*/

function whenDocumentLoaded(action) {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", action);
	} else {
		// `DOMContentLoaded` already fired
		action();
	}
}

/* ar svg_container = d3.select("body")
                      .append("svg")
                      .attr("style", "background-color:green")
                      .attr("width", 200)
                      .attr("height", 200);

/*d3.csv("/ressources/test.csv", show_events)

function show_events(data) {
    svg_container.selectAll("circle")
                 .data(data)
                 .enter()
                 .append("circle")
                    .attr("r", 100) // radius
    console.log(data.length)
    
} */

/* ---------------------------------------------------------------------------------------------------------------------------------------*/

whenDocumentLoaded(() => {

	d3.csv("/ressources/test.csv").then(function (data) {


		var svg = d3.select('#plot')

		var Tooltip = d3.select("#plot")
							.append("div")
							.attr("class", "tooltip")
							.style("background-color", "red")
							.style("border", "solid")
							.style("border-width", "2px")
							.style("border-radius", "5px")
							.style("padding", "5px")

		var plot_area = svg.append('g')

		var mouseover = function(d) {
			// Use D3 to select element, change color and size
			d3.select(this)
			  .transition()
			  .duration(100)
			  .attr("fill", '#f26627')
			  .attr("r", 1)
			  .style("opacity", 1)
			
			/* NOT WORKING
			  box.append("rect")
			  .attr("height", 5)
			  .attr("width", 16)
			  .attr("x", (d3.mouse(this)[0]-8) + "px")
			  .attr("y", (d3.mouse(this)[1]-7) + "px")
			  .style("stroke", "black")
			  .style("fill", "white")
			  .style("stroke-width", "0.4px") */
			
			box.append("text")
			   .attr("width", 16)
			   .attr("x", (d3.mouse(this)[0]-6) + "px")
			   .attr("y", (d3.mouse(this)[1]-5) + "px")
			   .style("font-size", "0.1rem")
			   .style("font-family", "heavitas")
			   .text(d.Content)
			} 
		
		var mouseout = function(d) {
			d3.selectAll("text")
				.transition()
				.duration(100)
				.remove()
			d3.selectAll("rect")
				.transition()
				.duration(100)
				.remove()
			d3.select(this)
			  .transition()
			  .duration(100)
			  .attr("fill", 'black')
			  .attr("r", 0.5)
			  .style("opacity", 0.5)
			}

		plot_area.selectAll("circle")
			.data(data)
			.enter()
			.append("circle")
				.attr("r", 0.5) // radius
				.attr("cx", d => select_random(200)) // position, rescaled
				.attr("cy", d => select_random(50))
				.attr("fill", "black")
				.style("opacity", 0.5)
				.on("mouseover", mouseover)
				.on("mouseout", mouseout)

		var box = svg.append("g")
	
	});
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