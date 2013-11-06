
var NUM_SEATS = 164;

var bySeat;

$(document).ready(function () {
    // set up highlighting behavior
    for (var i = 1; i <= NUM_SEATS; i++) {
        highlightOnMouseenter(i);
    }

    // set up search bar
    initializeSearchBar();
});

function initializeSearchBar() {
    $('#searchbar').keyup(function(e){
        if(e.keyCode == 13){
            clearMatches();
            var elmatch = '#searchbar input';
            var searchText = $(elmatch).val();
            $(elmatch).val('');

            // if search text is blank, just return
            if (!searchText) {
                return;
            }

            var matches = findMatches(searchText);
            for (var i = 0; i < matches.length; i++) {
                showMatch(matches[i]);
            }
        }
    });
}

function findMatches(searchText) {
    var matches = [];
    var t = searchText.toLowerCase();
    var re = new RegExp(t);
    for (var i = 1; i <= NUM_SEATS; i++) {
        if (bySeat[i]) {
            var person = bySeat[i];
            var fullName = person.first + " " + person.last;
            var fullNameLower = fullName.toLowerCase();
            if (re.test(fullNameLower)) {
                matches.push(i);
            }
        }
    }
    return matches;
}

function clearMatches() {
    $('.found').attr('fill', 'black');
    $('.search_overlay').remove();
}

function showMatch(seatid) {
    var seat = $('#seat_' + seatid);
    seat.attr('fill', 'red');
    seat.attr('class', 'found');
    makeOverlay(seatid);
}

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

function makeOverlay(seatid) {
    var seat = $('#seat_' + seatid);
    var offset = seat.offset();

    var person = bySeat[seatid];
    if (person) {
        var overlay = $('<div></div>');
        overlay.attr('class', 'search_overlay alert alert-success');
        overlay.css('position', 'absolute');
        overlay.css('left', offset.left + 30);
        overlay.css('top', offset.top - 30);
        overlay.html(person.first + ' ' + person.last);
        $('body').append(overlay);
    }
}

function highlightOnMouseenter(seatid) {
    var seatid_str = '#seat_' + seatid;

    // mouseenter turns number red
    $(seatid_str).mouseenter(function(e) {
        $(seatid_str).attr('fill', 'red');

        var person = bySeat[seatid];
        if (person && !$('.overlay_' + seatid).length) {
            var overlay = $('<div></div>');
            var classes = 'alert alert-success overlay_' + seatid; 
            overlay.attr('class', classes);
            overlay.css('position', 'absolute');
            overlay.css('left', e.pageX);
            overlay.css('top', e.pageY);
            overlay.html(person.first + ' ' + person.last);
            $('body').append(overlay);
        }
    });

    // mouseleave turns it black again
    $(seatid_str).mouseleave(function() {
        $(seatid_str).attr('fill', 'black');
        $('.overlay_' + seatid).remove();
    });
}

function unhighlightAfterSearch(seatid) {
    $('#circ_' + seatid).remove();
    $('#seat_' + seatid).attr('fill', 'black');
}



