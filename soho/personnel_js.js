var SVG = {
    xmlns: 'http://www.w3.org/2000/svg',
    initialize: function() {
        this.xmlns = $('svg').attr('xmlns');
        this.fontFamilyFix('[font-family*=ArialMT]', 'arial');
    },
    fontFamilyFix: function(selector, font) {
        $(selector).attr('font-family', font);
    }
}

var Personnel = {
    byFullName: personnelByFullName, // global reference
    bySeat:{},
    pageDisplayArray:[],
    initialize: function() {
        $.each(this.byFullName, function(key, value) {
            var seat = value['Seat'];
            if (seat)
                Personnel.bySeat[seat] = value;
        });
        this.reinitializeDirectoryArray();
    },
    reinitializeDirectoryArray: function() {
        this.pageDisplayArray = $.map(this.byFullName, function(value, key) {
            return value;
        }).sort(function(a, b) {
            var aLastName = a['Last Name'].toLowerCase();
            var bLastName = b['Last Name'].toLowerCase();
            if (aLastName == bLastName) return a['First Name'].toLowerCase() < b['First Name'].toLowerCase() ? -1 : 1;
            return aLastName < bLastName ? -1 : 1;
        });
    },
    fullNameToPerson: function(fullName) {
        return this.byFullName[fullName] || null;
    },
    seatToPerson: function(seat) {
        return this.bySeat[seat] || null;
    }
};

var PersonDirectory = {
    highlightHasSeat:'fill: green',
    highlightNoSeat:'fill: red',
    pageNum: 0,
    pageItem: [],
    pageSize: function() { return this.pageItem.length; },
    pages: function() { return Math.floor((Personnel.pageDisplayArray.length + this.pageSize() - 1)/this.pageSize()); },
    initialize: function() {
        this.pageItem = $('[id^="page_item_"]').sort(function(a, b) {
            return parseInt(a.id.replace('page_item_','')) < parseInt(b.id.replace('page_item_','')) ? -1 : 1
        });
        $('#button_directory_page_first').bind('click', function(evt) { PersonDirectory.showPageFirst(); });
        $('#button_directory_page_prev').bind('click', function(evt) { PersonDirectory.showPagePrev(); });
        $('#button_directory_page_next').bind('click', function(evt) { PersonDirectory.showPageNext(); });
        $('#button_directory_page_last').bind('click', function(evt) { PersonDirectory.showPageLast(); });
        $('[id^="page_item_"]').bind('click mouseenter', function(evt) {
            var person = Personnel.fullNameToPerson($(this).text());
            $(this).attr('class', 'highlight').attr('style', person['Seat'] ? PersonDirectory.highlightHasSeat : PersonDirectory.highlightNoSeat);
            PersonDetails.show(person, null);
        });
        $('[id^="page_item_"]').bind('mouseleave', function(evt) {
            $(this).removeAttr('class').removeAttr('style')
            PersonDetails.show(null, null);
        });
    },
    showPage: function(pageNum) {
        this.pageNum = Math.max(pageNum, 0);
        this.pageNum = Math.min(this.pageNum, this.pages() - 1);
        var directoryOffset = this.pageNum * this.pageSize();
        for (var i = 0; i < this.pageItem.length; i++) {
            var directoryItem = Personnel.pageDisplayArray[directoryOffset + i];
            this.pageItem[i].textContent = directoryItem ? directoryItem['Full Name'] : '';
        }
    },
    showPageFirst: function() { this.showPage(0); },
    showPagePrev: function() { this.showPage(this.pageNum - 1); },
    showPageNext: function() { this.showPage(this.pageNum + 1); },
    showPageLast: function() { this.showPage(this.pages()-1); }
};

var Seats = {
    highlightStyle:'fill: red',
    highlightHasSeat:'fill: green',
    highlightNoSeat:'fill: red',
    hotSeatId:null,
    initialize: function() {
        $('[id^="seat_"]').bind('click mouseenter mouseleave', function(evt) {
            var seatId = evt.type == 'mouseleave' ? null : $(this).attr('id');
            var seatNum = seatId && seatId.split('_')[1];
            var person = Personnel.seatToPerson(seatNum);
            Seats.highlight(seatId, (person && person['Seat']) ? Seats.highlightHasSeat : Seats.highlightNoSeat);
            PersonDetails.show(person, seatId);
        });
    },
    highlight: function(seatId, style) {
        if (seatId == this.hotSeatId) return;
        $('#' + this.hotSeatId).removeAttr('class').removeAttr('style');
        $('#' + seatId).attr('class', 'highlight').attr('style', style);
        this.hotSeatId = seatId;
    }
}

var PersonDetails = {
    blankPhoto: 'images/Unknown-person.gif',
    nullPerson: {},
    orderedKeys:[
        "First Name",
        "Last Name",
        "Title",
        "Areas of Focus",
        "Ofc/ Location",
        "Primary Chat",
        "Primary Phone",
        "Primary Phone Provider",
        "Extension",
        "Twitter",
        "Intercall Code and PIN (PIN for call owner only)",
        "",
        "Onsip Conference Bridge",
        "JIRA username",
        "Primary Email",
        "Secondary Email",
        "Secondary Phone",
        "Secondary Phone Provider",
        "Birthday",
        "10gen Anniversary",
        "Empl Status",
        "Full Name",
        "Seat",
    ],
    idFromKey: function(key) {
        return key.toLowerCase().replace(/[^A-Za-z]/g, '_');
    },
    show: function(person, selectId) {
        person = person || this.nullPerson;
        for (var i in PersonDetails.orderedKeys) {
            var key = PersonDetails.orderedKeys[i];
            if (!key || key.length == 0) continue;
            $('text#' + PersonDetails.idFromKey(key)).text(key + ': ' + (person[key] || ''));
        }
        $('#person_photo').attr('xlink:href', person['Photo'] || this.blankPhoto);
        var seat = person['Seat'];
        switch(seat) {
            case null:
                seatId = 'no_seat';
                break;
            case undefined:
                seatId = null;
                break;
            default:
                seatId = 'seat_' + seat;
        }
        Seats.highlight(selectId || seatId, seat ? Seats.highlightHasSeat : Seats.highlightNoSeat);
    },
    initialize: function() {
        //this.nullPerson['Seat'] = null;
    }
};

function svgLoad(evt) {
    SVG.initialize();
    Personnel.initialize();
    PersonDirectory.initialize();
    Seats.initialize();
    PersonDetails.initialize();
    PersonDirectory.showPageFirst();
}
