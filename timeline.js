(function () {
    var Timeline = {

        bookingData: {},                                                            // Would come from ajax
        colWidth: 30,                                                               // Width of each col in px
        width: 0,                                                                   // Width of timeline col in px
        dayClassName: 'date',                                                       // Class name for days divs
        rowHeadClassName: 'home',                                                   // Class name for row heading
        startDate: '',                                                              // Start date for timeline
        endDate: '',                                                                // Computed end date for timeline
        data: {},                                                                   // Store initial bed data
        theme: 'default',                                                           // Theme class (default | blue | green)
        showBackButton: false,                                                      // Whether back button can be displayed
        $timeline: document.getElementById('timeline'),                             // Timeline component element
        $table: document.getElementById('timeline-table'),                          // Table element
        $tableHead: document.getElementById('timeline-header'),                     // Table head element
        $header: document.getElementsByClassName('row-timeline-heading')[0],        // Heading element
        onClickView: function (e) { console.log('booking', e); },                   // Click handler for viewing an event
        onClickBed: function (e) {                                                  // Click handler for empty bed event
            e.stopPropagation();
            var col = parseInt(e.offsetX / 30, 10);
            console.log(col);
        },
        onHoverBed: function (e) {
            var klass,
                target = e.target;
            if (target.className.indexOf('bed') > -1) {
                klass = document.getElementById(target.id).className;
                klass = (klass.indexOf('hover') > -1) ? klass : klass + ' hover';
                document.getElementById(target.id).className = klass;
            }
        },
        onOutBed: function(e) {
            var klass,
                target = e.target;
            if (target.className.indexOf('bed') > -1) {
                klass = document.getElementById(target.id).className;
                klass = (klass.indexOf('hover') > -1) ? klass.replace(' hover', '') : klass;
                document.getElementById(target.id).className = klass;
            }
        },

        init: function init(data, options) {
            if (options !== undefined) { this.setOptions(options); }
            
            // Store data
            if (data !== undefined) {
                this.data = data;
            } else {
                data = this.data;   //TODO: circular - need to ensure data for first time
            }
            
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
        
        advance: function advance(days) {
            var next;
            if (days === undefined) {
                // Go to first monday in next month
                next = this.startDate.endOf('month').add(1, 'day');
                while (next.day() !== 1) { next.add(1, 'day'); }
                this.startDate = next;
            } else {
                // Advance requested number of days
                this.startDate.add(days, 'days');
            }
            this.init();
        },
        
        back: function back(days) {
            var last;
            if (days === undefined) {
                // Go to first monday in last month
                last = this.startDate.startOf('month').subtract(1, 'month');                
                while (last.day() !== 1) { last.add(1, 'day'); }
                // Don't go earlier than today
                this.startDate = (last < moment().hour(0).minute(0).second(0)) ?
                    moment().hour(0).minute(0).second(0) : 
                    last;
                this.init();
            } else {
                // Go back requested number of days
                this.advance(-days);
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
            
            // Add row heading expand and contract handler
            div.addEventListener('click', this.toggle.bind(this));
            
            // Setup header 
            this.width = th2.offsetWidth;
            numberOfDays = parseInt(this.width / this.colWidth, 10);
            
            // Draw days into header
            for (d = 0; d < numberOfDays; d++) {
                this.addDayToHeader(th2, date, this.dayClassName);
                date.add(1, 'days');
            }
            // Update endDate of component
            this.endDate = date.add(-1, 'days');
        },
        
        // Write day numbers into timeline header
        addDayToHeader: function addDayToHeader(el, date, className) {
            var div = document.createElement('div'),
                span = document.createElement('span'),
                day = document.createTextNode(date.format('ddd')),
                d = document.createTextNode(date.format('D'));
            div.className = className;
            // First day of month: need darker border
            if (date.date() === 1) { div.className += ' first'; }
            span.className = 'day';
            span.appendChild(day);
            div.appendChild(span);
            div.appendChild(d);
            el.appendChild(div);
        },
        
        // Draw a new row in timeline for each care home and
        // draw each booking rectangle into the correct row
        drawBookings: function drawBookings(data) {
            var timeline = this,
                $row,
                $bed,
                $bedLabel;

            data.homes.forEach(function (home) {
                // Create new row
                $row = timeline.drawRow(home.name);
                
                // Add beds
                home.beds.forEach(function (bed) {
                    $bedLabel = timeline.drawBedLabel(home.name, bed.id, bed.name);
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
                    $row.children[0].children[1].appendChild($bedLabel);
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
                bedLabelContainer = document.createElement('div'),
                div = document.createElement('div'),
                home = document.createTextNode(name);

            heading.className = 'row-heading ' + this.theme;
            bookings.className = 'row-timeline';
            bookingsContainer.className = 'bookings-container';
            bedLabelContainer.className = 'label-container';
            div.className = this.rowHeadClassName;
            div.appendChild(home);
            heading.appendChild(div);
            heading.appendChild(bedLabelContainer);
            row.appendChild(heading);
            row.appendChild(bookings);
            bookings.appendChild(bookingsContainer);
            
            // Add row heading expand and contract handler
            heading.addEventListener('click', this.toggle);
            return row;
        },
        
        // Add a bed label div element to row heading
        drawBedLabel: function drawBedLabel(home, id, bedName) {
            var bed = document.createElement('div'),
                bedName = document.createTextNode(home + ' - ' + bedName);
            bed.dataset['id'] = id;
            bed.className = 'bed-label';
            bed.appendChild(bedName);
                        
            // Add bed container hover and click handlers (available day)
            //bed.addEventListener('click', this.onClickBed);
            return bed;
        },
        
        // Add a bed div element with a click handler
        drawBed: function drawBed(id, name) {
            var bed = document.createElement('div');
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
                date = moment(start, 'DD/MM/YYYY'),
                offset = this.positionFromDate(start), /* Number of days from start */
                left = ((offset * 30) < 0) ? 0 : offset * 30,
                right = ((left + (duration * 30)) > this.width) ? this.width - 1 : (left + (duration * 30) - 1);

            // Only draw booking if it falls in current timeline range
            if ((date < this.endDate) && (date.add(duration, 'days') > this.startDate)) {
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
            }
        },
        
        // When clicking a row heading, expand or collapse bookings in row
        // The toggle class is "expand" and is applied to the row element
        toggle: function toggle(e) {
            var target = e.target,
                owner;
            while (target.tagName !== 'TR') {
                target = target.parentElement;
            }
            
            if (target !== undefined) {
                owner = target.parentElement.tagName;
                if (target.className.indexOf(' expand') > -1) {
                    target.className = target.className.replace(' expand', '');
                    if (owner === 'THEAD') { this.contractAll(); }
                } else {
                    target.className += ' expand';
                    if (owner === 'THEAD') { this.expandAll(); }
                }
            }
        },
        
        expandAll: function() {
            var rows = document.getElementsByTagName('tr'),
                i;
            for (i = 0; i < rows.length; i++) {
                if (rows[i].className.indexOf(' expand') === -1) {
                    rows[i].className += ' expand';
                }
            }
        },
        
        contractAll: function() {
            var rows = document.getElementsByTagName('tr'),
                i;
            for (i = 0; i < rows.length; i++) { 
                rows[i].className = rows[i].className.replace(' expand', '');
            }
        },

        destroy: function destroy() {
            // TODO: verify that eventlisteners are all detached
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
