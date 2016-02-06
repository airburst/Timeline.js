(function () {
    var Timeline = {

        bookingData: {},                                                            // Would come from ajax
        colWidth: 30,                                                               // Width of each col in px
        width: 0,                                                                   // Width of timeline col in px
        dayClassName: 'date',                                                       // Class name for days divs
        rowHeadClassName: 'home',                                                   // Class name for row heading
        startDate: '',                                                              // Start date for timeline
        theme: 'default',                                                           // Theme class (default | blue | green)
        $timeline: document.getElementById('timeline'),                             // Timeline component element
        $table: document.getElementById('timeline-table'),                       // Table element
        $tableHead: document.getElementById('timeline-header'),                     // Table head element
        $header: document.getElementsByClassName('row-timeline-heading')[0],      // Heading element
        onClickView: function (e) { console.log('booking', e); },                    // Click handler for viewing an event
        onClickBed: function (e) {                                                   // Click handler for empty bed event
            e.stopPropagation();
            var col = parseInt(e.offsetX / 30, 10);
            console.log(col);
        },
        onHoverBed: function (e) {
            var klass,
                target = e.target;
            if (target.className === 'bed') {
                klass = document.getElementById(target.id).className;
                klass = (klass.indexOf('hover') > -1) ? klass : klass + 'hover';
                document.getElementById(id).className = klass;
            }
        },
        onOutBed: function(e) {
            var klass,
                target = e.target;
            if (target.className === 'bed') {
                klass = document.getElementById(target.id).className;
                klass = (klass.indexOf('hover') > -1) ? klass.replace(' hover', '') : klass;
                document.getElementById(id).className = klass;
            }
        },

        init: function init(data, options) {
            if (options !== undefined) { this.setOptions(options); }
            
            // Destroy current instance
            this.destroy();
            
            // Set days in table headings
            // Get start date from timeline component.  If empty, use today.
            var startDateString = (this.startDate != '') ? this.startDate : this.$timeline.dataset['start'],
                startDate = (startDateString != '') ?
                    moment(startDateString, 'DD/MM/YYYY') :
                    moment().hour(0).minute(0).second(0);
            this.startDate = moment(startDate);
            
            // Draw header
            this.drawHeader(startDate);
            
            // Draw bookings
            this.bookingData = data;
            this.drawBookings(this.bookingData);
        },

        setOptions: function setOptions(options) {
            var key;
            for (key in options) {
                this[key] = options[key];
            }
        },
        
        // Calculate how many days dateString occurs from start date of timeline
        positionFromDate: function positionFromDate(dateString) {
            var date = moment(dateString, 'DD/MM/YYYY');
            return moment.duration(date.diff(this.startDate)).asDays();
        },
        
        // Draw the header element
        drawHeader: function drawHeader(date) {
            var row = document.createElement('tr'),
                th1 = document.createElement('th'),
                th2 = document.createElement('th'),
                div = document.createElement('div'),
                content = document.createTextNode('Care Home'),
                numberOfDays,
                d;

            th1.className = 'row-heading ' + this.theme;
            th2.className = 'row-timeline-heading ' + this.theme;
            div.className = this.rowHeadClassName;
            div.appendChild(content);
            th1.appendChild(div);
            row.appendChild(th1);
            row.appendChild(th2);
            this.$tableHead.appendChild(row);
            
            // Setup header 
            this.width = th2.offsetWidth;
            numberOfDays = parseInt(this.width / this.colWidth, 10);
            
            // Draw days into header
            for (d = 0; d < numberOfDays; d++) {
                this.addDayToHeader(th2, date.format('D'), this.dayClassName);
                date.add(1, 'days');
            }
        },
        
        // Write day numbers into timeline header
        addDayToHeader: function addDayToHeader(el, text, className) {
            var div = document.createElement('div'),
                content = document.createTextNode(text);
            div.className = className;
            div.appendChild(content);
            el.appendChild(div);
        },
        
        // Draw a new row in timeline for each care home and
        // draw each booking rectangle into the correct row
        drawBookings: function drawBookings(data) {
            var timeline = this,
                $row,
                $bed;

            data.homes.forEach(function (home) {
                // Create new row
                $row = timeline.drawRow(home.name);
                
                // Add beds
                home.beds.forEach(function (bed) {
                    $bed = timeline.drawBed(bed.id, bed.name);
                    
                    // Create each booking rectangle in row
                    bed.bookings.forEach(function (booking) {
                        timeline.drawBooking(
                            $bed,
                            booking.ref,
                            booking.status,
                            booking.start,
                            booking.duration,
                            booking.client
                            )
                    });
                    // DOM is tr > td.row-timeline > div.bookings-container
                    $row.children[1].children[0].appendChild($bed);
                });
                
                // Append rows to timeline table
                timeline.$table.appendChild($row);
            });
        },
        
        // Create and return the template structure for a 
        // Care Home row in the timleline table
        drawRow: function drawRow(name) {
            var row = document.createElement('tr'),
                heading = document.createElement('td'),
                bookings = document.createElement('td'),
                bookingsContainer = document.createElement('div'),
                div = document.createElement('div'),
                home = document.createTextNode(name);

            heading.className = 'row-heading ' + this.theme;
            bookings.className = 'row-timeline';
            bookingsContainer.className = 'bookings-container';
            div.className = this.rowHeadClassName;
            div.appendChild(home);
            heading.appendChild(div);
            row.appendChild(heading);
            row.appendChild(bookings);
            bookings.appendChild(bookingsContainer);
            
            // Add row heading expand and contract handler
            heading.addEventListener('click', this.toggle);
            return row;
        },
        
        // Add a bed div element with a click handler
        drawBed: function drawBed(id, name) {
            var bed = document.createElement('div'),
                bedName = document.createTextNode(name);
            bed.id = id;
            bed.className = 'bed';
                        
            // Add bed container hover and click handlers (available day)
            bed.addEventListener('mouseover', this.onHoverBed);
            bed.addEventListener('mouseout', this.onOutBed);
            bed.addEventListener('click', this.onClickBed);
            return bed;
        },
        
        // Add an individual booking rectangle to element el
        drawBooking: function drawBooking(el, ref, status, start, duration, client) {
            var div = document.createElement('div'),
                content = document.createTextNode((client !== undefined) ? client : ''),
                offset = this.positionFromDate(start), /* Number of days from start */
                left = ((offset * 30) < 0) ? 0 : offset * 30,
                right = ((left + (duration * 30)) > this.width) ? this.width - 1 : (left + (duration * 30) - 1);

            // Styles
            div.className = 'booking ' + ((status !== undefined) ? status : '');
            div.id = ref;
            div.style.left = left + 'px';
            div.style.width = (right - left) + 'px';
            
            // Data and Events
            if (ref !== undefined) { div.dataset['ref'] = ref; }
            if (status !== undefined) { div.dataset['status'] = status; }
            if (start !== undefined) { div.dataset['start'] = start; }
            if (client !== undefined) { div.dataset['client'] = client; }
            if (duration !== undefined) { div.dataset['duration'] = duration; }
            div.addEventListener('click', this.onClickView);

            div.appendChild(content);
            el.appendChild(div);
        },
        
        // When clicking a row heading, expand or collapse bookings in row
        // The toggle class is "expand" and is applied to the row element
        toggle: function toggle(e) {
            var target = e.target;
            while (target.tagName !== 'TR') {
                target = target.parentElement;
            }

            if (target !== undefined) {
                if (target.className.indexOf(' expand') > -1) {
                    target.className = target.className.replace(' expand', '');
                } else {
                    target.className += ' expand';
                }
            }
        },

        destroy: function destroy() {
            this.removeChildren(this.$tableHead);
            this.removeChildren(this.$table);
        },

        removeHovers: function removeHovers() {
            var h = document.getElementsByClassName('hover'),
                i;
            for (i = 0; i < h.length; i++) {
                h[0].parentElement.removeChild(h[0]);
            }
        },

        removeChildren: function removeChildren(el) {
            var i, l;
            if (el.hasChildNodes()) {
                l = el.childNodes.length;
                for (i = 0; i < l; i++) {
                    el.removeChild(el.childNodes[0]);
                }
            }
        }

    };

    window.Timeline = Timeline;

})();
