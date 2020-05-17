/*  This script handles the animations related to the data points,
    namely the mouse over, mouse out and click event */

function mouse_over_dot(selection, bubble, text) {

    bubble.transition().duration(DURATION)
        .style("opacity", 0.9);

    bubble.html(text)
        .style("left", function () {
            var left = px_to_vw(d3.event.pageX) - 6
            var max_x = px_to_vw(d3.select("#plot-div").node().getBoundingClientRect().width)
            if (left < 0) {
                return 1 + "vw"
            }
            if (left + 12 > max_x) {
                return max_x - 13 + "vw"
            }
            else {
                return left + "vw"
            }
        })
        .style("top", function () {
            var top = px_to_vh(d3.event.pageY) - px_to_vh(document.getElementById("bubble").offsetHeight) - 2
            if (top < 0) {
                return 1 + "vh"
            }
            else {
                return top + "vh"
            }
        })

    d3.selectAll("circle")
        .transition().duration(DURATION)
        .style("opacity", 0.25)

    selection
        .transition().duration(DURATION)
        .attr("fill", '#f26627')
        .style("r", "0.75vh")
}

function mouse_out_dot(bubble, year, date) {

    bubble.transition()
        .duration(DURATION)
        .style("opacity", 0);

    d3.selectAll("circle")
        .filter(function (d) {
            return year != date
        })
        .transition().duration(DURATION)
        .style("opacity", 1)
        .attr("fill", '#282828')
        .style("r", "0.25vh")
}

function on_click_dot(window, title, subtitle, content, is_event) {

    var icon_path = is_event ? "static/img/cross_white.png" : "static/img/cross_black.png"
    var font_color = is_event ? "white" : "#282828"
    var bg_color = is_event ? "#f26627" : "rgb(233, 233, 233)"
    var style_top = is_event ? "0px" : "50.1vh"
    var style_left = "0px"

    window.style("visibility", "visible")
        .transition().duration(DURATION)
        .style("opacity", 1);

    window.append('img')
        .attr("class", "cross")
        .attr("id", "cross")
        .attr("src", icon_path)
        .on("click", function () {
            window.transition().duration(DURATION)
                .style("opacity", 0)
                .on("end", function () {
                    window.transition().delay(DURATION)
                        .style("visibility", "hidden")
                    window.selectAll('p')
                        .remove()
                    window.selectAll('img')
                        .remove()
                });
        })
        .on("mouseover", function () {
            d3.select(this)
                .style("cursor", "pointer")
        })

    var left_div = window.append("div")
        .attr("class", "left-div")
    left_div.append('p')
        .attr("class", "title-box")
        .html(title + subtitle)

    var right_div = window.append("div")
        .attr("class", "right-div")
    right_div.append('p')
        .attr("class", "p-box")
        .html(content)
    window
        .style("top", style_top)
        .style("left", style_left)
        .style("color", font_color)
        .style("background", bg_color)
}