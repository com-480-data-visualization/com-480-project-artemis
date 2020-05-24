/*  This script handles the animations related to the data points,
    namely the mouseover, mouseout and click event as well as timeline
    animation, namely the zoom in and zoom out animations. It also handles */

function mouse_over_dot(selection, bubble, text) {
    /*  This function handles the "mouseover" event on the dots. It shows the pop-up
        with the summary. */

    // Create the pop-up called bubble
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

    // Change the opacity of all circles except the selected one
    d3.selectAll("circle")
        .transition().duration(DURATION)
        .style("opacity", 0.25)
    selection
        .transition().duration(DURATION)
        .attr("fill", '#f26627')
        .style("r", "0.75vh")
}

function mouse_out_dot(bubble) {
    /*  This function handles the "mouseout" event on the dots. It hides the pop-up
        and reinitialize the color and the size of all dots */

    // Hide the pop-up
    bubble.transition()
        .duration(DURATION)
        .style("opacity", 0);

    // Reinitialize dots property
    d3.selectAll("circle")
        .transition().duration(DURATION)
        .style("opacity", 1)
        .attr("fill", '#282828')
        .style("r", "0.25vh")
}

function on_click_dot(window, title, subtitle, content, is_event) {
    /*  This function handle the "click" event on the dots. It shows the upper-half window and lower-half window
        filled with all information from the song and event data. */

    // Create properties depending on the type of data point (event or song)
    var icon_path = is_event ? "static/img/cross_white.png" : "static/img/cross_black.png"
    var font_color = is_event ? "white" : "#282828"
    var bg_color = is_event ? "#f26627" : "rgb(233, 233, 233)"
    var style_top = is_event ? "0px" : "50vh"
    var style_left = "0px"

    // Show the half window
    window.style("visibility", "visible")
        .transition().duration(DURATION)
        .style("opacity", 1);

    // Add the close button
    window.append('img')
        .attr("class", "cross")
        .attr("id", "cross")
        .attr("src", icon_path)
        // Handle the click event
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
        // Handle the mouseover event
        .on("mouseover", function () {
            d3.select(this)
                .style("cursor", "pointer")
        })

    // Format the space in the half window div
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

function zoom_in(xScale, min_date, max_date, zoomed_in) {
    /*  This function handles the "zoom-in" function of the time line. It updates the x-axis as well as
        the data points position. */

    // Change the title once zoomed in
    if (!zoomed_in && !filtered_data) {
        title_to_subtitle()
    }
    zoomed_in = true

    // Handle the x-axis
    xScale.domain([min_date, max_date])
    xAxis = fc.axisBottom(xScale)
        .tickArguments([5])
        .tickCenterLabel(true)
        .tickSizeInner(0)
        .tickSizeOuter(0)

    // Show zoom-out button
    show_button("#unzoom-button")

    // Update the x-axis and the data points position
    d3.select("#plot").select(".xaxis")
        .transition().duration(1500)
        .call(xAxis)
        .on("end", function () {
            make_year_clickable(xScale)
        })
    if (!filtered_data) {
        d3.select("#plot-area").selectAll(".circle-event")
            .style("visibility", "visible")
            .transition().duration(1500)
            .attr("cx", d => xScale(get_date(d, true)))
            .style("opacity", 1)
        d3.select("#plot-area").selectAll(".circle-song")
            .style("visibility", "visible")
            .transition().duration(1500)
            .attr("cx", d => xScale(get_date(d, false)))
            .style("opacity", 1)
    }
    else {
        d3.select("#plot-area").selectAll(".circle-event")
            .transition().duration(1500)
            .attr("cx", d => xScale(get_date(d, true)))
        d3.select("#plot-area").selectAll(".circle-song")
            .transition().duration(1500)
            .attr("cx", d => xScale(get_date(d, false)))
    }
}

function zoom_out(xScale) {
    /*  This function handle the "zoom-out" function of the time-line. This function is called
        when the "zoom-out" button is clicked. */

    // Change the title
    if (!filtered_data) {
        subtitle_to_title()
    }
    zoomed_in = false

    // Update x-axis
    xScale.domain([mindate, maxdate])
    xAxis = fc.axisBottom(xScale)
        .tickArguments([51])
        .tickCenterLabel(true)
        .tickSizeInner(0)
        .tickSizeOuter(0)
    d3.select("#plot").select(".xaxis")
        .transition().duration(1500)
        .call(xAxis)
        .on("end", function () {
            make_year_clickable(xScale)
        })

    // Hide unzoom button
    hide_button("#unzoom-button")

    // Update data points position
    if (!filtered_data) {
        d3.select("#plot-area").selectAll(".circle-event")
            .transition().duration(1500)
            .attr("cx", d => xScale(get_date(d, true)))
            .style("opacity", 0)
            .on("end", function () {
                d3.select("#plot-area").selectAll(".circle-event")
                    .style("visibility", "hidden")
            })
        d3.select("#plot-area").selectAll(".circle-song")
            .transition().duration(1500)
            .attr("cx", d => xScale(get_date(d, false)))
            .style("opacity", 0)
            .on("end", function () {
                d3.select("#plot-area").selectAll(".circle-song")
                    .style("visibility", "hidden")
            })
    }
    else {
        d3.select("#plot-area").selectAll(".circle-event")
            .transition().duration(1500)
            .attr("cx", d => xScale(get_date(d, true)))
        d3.select("#plot-area").selectAll(".circle-song")
            .transition().duration(1500)
            .attr("cx", d => xScale(get_date(d, false)))
    }
}

function make_year_clickable(xScale) {
    /*  This function makes the year ticks clickable, allowing the user
        to zoom into the time line by selecting a year tick. */

    d3.selectAll(".tick")
        // Handle the mouseover event
        .on("mouseover", function () {
            d3.select(this).select("text")
                .transition().duration(DURATION)
                .style("fill", "#f26627")
                .style("cursor", "pointer")
        })
        // Handle the mouseout event
        .on("mouseout", function () {
            d3.select(this).select("text")
                .transition().duration(DURATION)
                .style("fill", "#282828")
                .style("cursor", "pointer")
        })
        // Handle the click event
        .on("click", function () {
            d3.select("#menu")
                .transition().duration(DURATION)
                .style("left", "-30vw")
            var current_date = +d3.select(this).text()
            // Handle the lower bound
            if (current_date == 1965 || current_date == 1966) {
                current_date = 1967
            }
            // Handle the upper bound
            if (current_date == 2014 || current_date == 2015) {
                current_date = 2013
            }
            var min_date = new Date(current_date - 2, 0, 1)
            var max_date = new Date(current_date + 2, 11, 31)
            zoom_in(xScale, min_date, max_date, zoomed_in)
            zoomed_in = true
        })
}

function update_event_points_given_query(zoomed_in) {
    /*  This function handles the filters passed by the user in the filter menu
        to the event data points */

    if (zoomed_in) {
        d3.select("#plot-area").selectAll(".circle-event")
            .transition().duration(1500)
            .style("opacity", d => {
                if (d.Year.includes(document.getElementById("year-event-field").value) &&
                    d.Month.includes(document.getElementById("month-field").value) &&
                    d.Day.includes(document.getElementById("day-field").value)) {
                    return 1
                }
                else {
                    return 0
                }
            })
            .on("end", function () {
                console.log("SALUTI")
                d3.select("#plot-area").selectAll(".circle-event")
                    .style("visibility", d => {
                        console.log("coucou")
                        if (d.Year.includes(document.getElementById("year-event-field").value) &&
                            d.Month.includes(document.getElementById("month-field").value) &&
                            d.Day.includes(document.getElementById("day-field").value)) {
                            return "visible"
                        }
                        else {
                            return "hidden"
                        }
                    })
            })
    }
    else {
        d3.select("#plot-area").selectAll(".circle-event")
            .style("visibility", d => {
                if (d.Year.includes(document.getElementById("year-event-field").value) &&
                    d.Month.includes(document.getElementById("month-field").value) &&
                    d.Day.includes(document.getElementById("day-field").value)) {
                    return "visible"
                }
                else {
                    return "hidden"
                }
            })
            .transition().duration(1500)
            .style("opacity", d => {
                if (d.Year.includes(document.getElementById("year-event-field").value) &&
                    d.Month.includes(document.getElementById("month-field").value) &&
                    d.Day.includes(document.getElementById("day-field").value)) {
                    return 1
                }
                else {
                    return 0
                }
            })
    }
}

function update_song_points_given_query(is_zoomed_in) {
    /*  This function handles the filters passed by the user in the filter menu
        to the song data points */
    
    if (is_zoomed_in) {
        d3.select("#plot-area").selectAll(".circle-song")
            .transition().duration(1500)
            .style("opacity", d => {
                if (d.Song.includes(document.getElementById("song-field").value) &&
                    d.Artist.includes(document.getElementById("artist-field").value) &&
                    d.Album.includes(document.getElementById("album-field").value) &&
                    d.Year.includes(document.getElementById("year-song-field").value) &&
                    d.Rank.includes(document.getElementById("rank-field").value) &&
                    d.Genre.includes(document.getElementById("genre-field").value) &&
                    d.Lyrics.includes(document.getElementById("lyrics-field").value)) {
                    return 1
                }
                else {
                    return 0
                }
            })
            .on("end", function () {
                d3.select("#plot-area").selectAll(".circle-song")
                    .style("visibility", d => {
                        if (d.Song.includes(document.getElementById("song-field").value) &&
                            d.Artist.includes(document.getElementById("artist-field").value) &&
                            d.Album.includes(document.getElementById("album-field").value) &&
                            d.Year.includes(document.getElementById("year-song-field").value) &&
                            d.Rank.includes(document.getElementById("rank-field").value) &&
                            d.Genre.includes(document.getElementById("genre-field").value) &&
                            d.Lyrics.includes(document.getElementById("lyrics-field").value)) {
                            return "visible"
                        }
                        else {
                            return "hidden"
                        }
                    })
            })
    }
    else {
        d3.select("#plot-area").selectAll(".circle-song")
            .style("opacity", 0)
            .style("visibility", d => {
                if (d.Song.includes(document.getElementById("song-field").value) &&
                    d.Artist.includes(document.getElementById("artist-field").value) &&
                    d.Album.includes(document.getElementById("album-field").value) &&
                    d.Year.includes(document.getElementById("year-song-field").value) &&
                    d.Rank.includes(document.getElementById("rank-field").value) &&
                    d.Genre.includes(document.getElementById("genre-field").value) &&
                    d.Lyrics.includes(document.getElementById("lyrics-field").value)) {
                    return "visible"
                }
                else {
                    return "hidden"
                }
            })
            .transition().duration(1500)
            .style("opacity", d => {
                if (d.Song.includes(document.getElementById("song-field").value) &&
                    d.Artist.includes(document.getElementById("artist-field").value) &&
                    d.Album.includes(document.getElementById("album-field").value) &&
                    d.Year.includes(document.getElementById("year-song-field").value) &&
                    d.Rank.includes(document.getElementById("rank-field").value) &&
                    d.Genre.includes(document.getElementById("genre-field").value) &&
                    d.Lyrics.includes(document.getElementById("lyrics-field").value)) {
                    return 1
                }
                else {
                    return 0
                }
            })
    }
}

function show_all_event_data() {
    /*  This function shows all event data points */

    d3.select("#plot-area").selectAll(".circle-event")
        .style("visibility", "visible")
        .transition().duration(1500)
        .style("opacity", 1)
}

function show_all_song_data() {
    /*  This function shows all song data points */

    d3.select("#plot-area").selectAll(".circle-song")
        .style("visibility", "visible")
        .transition().duration(1500)
        .style("opacity", 1)
}

function hide_all_event_data() {
    /*  This function hide all event data points */

    d3.select("#plot-area").selectAll(".circle-event")
        .transition().duration(1500)
        .style("opacity", 0)
        .on("end", function () {
            d3.select("#plot-area").selectAll(".circle-event")
                .style("visibility", "hidden")
        })
}

function hide_all_song_data() {
    /*  This function shows all song data points */

    d3.select("#plot-area").selectAll(".circle-song")
        .transition().duration(1500)
        .style("opacity", 0)
        .on("end", function () {
            d3.select("#plot-area").selectAll(".circle-song")
                .style("visibility", "hidden")
        })
}