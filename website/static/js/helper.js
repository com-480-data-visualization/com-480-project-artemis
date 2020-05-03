/*  This script handles the helper functions related to the website,
    namely the scroll to element, select random, pixel to viewport height
    and pixel to viewport height functions */

function scroll_to_element(element) {
    var offsetTop = window.pageYOffset || document.documentElement.scrollTop
    d3.transition()
        .delay(1)
        .duration(600)
        .ease(d3.easePolyInOut.exponent(3))
        .tween("scroll", (offset => () => {
            var i = d3.interpolateNumber(offsetTop, offset);
            return t => scrollTo(0, i(t))
        })(offsetTop + element.getBoundingClientRect().top));
}

function select_random(max) {
    return Math.floor(Math.random() * Math.floor(max))
}

function px_to_vw(value) {
    var w = window,
        d = document,
        e = d.documentElement,
        g = d.getElementsByTagName('body')[0],
        x = w.innerWidth || e.clientWidth || g.clientWidth,
        y = w.innerHeight || e.clientHeight || g.clientHeight;

    var result = (100 * value) / x;
    return result;
}

function px_to_vh(value) {
    var w = window,
        d = document,
        e = d.documentElement,
        g = d.getElementsByTagName('body')[0],
        x = w.innerWidth || e.clientWidth || g.clientWidth,
        y = w.innerHeight || e.clientHeight || g.clientHeight;

    var result = (100 * value) / y;
    return result;
}