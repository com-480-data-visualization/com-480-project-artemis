/*  This script handles the animations related to the data points,
    namely the mouse over, mouse out and click event */

function mouse_over_dot(selection, bubble, text, is_event) {

    bubble_id = is_event ? "bubble-event" : "bubble-song"

    bubble.transition().duration(DURATION)
        .style("opacity", .9);

    bubble.html(text)
        .style("left", (px_to_vw(d3.event.pageX) - 6) + "vw")
        .style("top", (px_to_vh(d3.event.pageY) - px_to_vh(document.getElementById(bubble_id).offsetHeight) - 2) + "vh");

    d3.selectAll("circle")
        .transition().duration(DURATION)
        .style("opacity", 0.25)

    selection
        .transition().duration(DURATION)
        .attr("fill", '#f26627')
        .attr("r", 1)
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
        .attr("r", 0.5)
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
                .style("opacity", 0.0)
                .on("end", function () {
                    window.transition().delay(DURATION)
                        .style("visibility", "hidden")
                    window.selectAll('p')
                        .remove()
                    window.selectAll('h1')
                        .remove()
                    window.selectAll('h2')
                        .remove()
                    window.selectAll('img')
                        .remove()
                });
        })
        .on("mouseover", function () {
            d3.select(this)
                .style("cursor", "pointer")
        })

    window.append('h1')
        .attr("class", "title-box")
        .html(title)

    window.append('h2')
        .attr("class", "subtitle-box")
        .html(subtitle)

    window.append('p')
        .attr("class", "p-box")
        .html(content)

    window
        .style("top", style_top)
        .style("left", style_left)
        .style("color", font_color)
        .style("background", bg_color)
}