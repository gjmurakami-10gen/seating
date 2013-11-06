
var NUM_SEATS = 164;

var bySeat;

$(document).ready(function () {
    // set up highlighting behavior
    for (var i = 1; i <= NUM_SEATS; i++) {
        highlightOnMouseenter(i);
    }
});

function highlightOnSearch(seatid) {
    // get positioning info from the seat number
    var seatid_str = '#seat_' + seatid;
    var seat = $(seatid_str);
    seat.attr('fill', 'red');
    var transform = seat.attr('transform');
    transform += ' translate(2 -2)';

    // create and position a circle over the seat
    var circ = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circ.setAttribute("transform", transform);
    circ.setAttribute("id", 'circ_' + seatid);
    circ.setAttribute("r",  12);
    circ.setAttribute("fill", "red");
    circ.setAttribute("fill-opacity", 0.1);
    circ.setAttribute("stroke", "red");
    $('svg').append(circ);
}

function highlightOnMouseenter(seatid) {
    var seatid_str = '#seat_' + seatid;

    // mouseenter turns number red
    $(seatid_str).mouseenter(function(e) {
        $(seatid_str).attr('fill', 'red');

        var person = bySeat[seatid];
        if (person) {
            var overlay = $('<div></div>');
            overlay.attr('class', 'seat_overlay alert alert-success');
            overlay.css('left', e.pageX);
            overlay.css('top', e.pageY);
            overlay.html(person.first + ' ' + person.last);
            $('body').append(overlay);
        }
    });

    // mouseleave turns it black again
    $(seatid_str).mouseleave(function() {
        $(seatid_str).attr('fill', 'black');
        $('.seat_overlay').remove();
    });
}

function unhighlightAfterSearch(seatid) {
    $('#circ_' + seatid).remove();
    $('#seat_' + seatid).attr('fill', 'black');
}



