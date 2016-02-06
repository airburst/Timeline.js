(function() {
    var Timeline =  {
        
        bookingData: {},                                                            // Would come from ajax
        colWidth: 30,                                                               // Width of each col in px
        width: 0,                                                                   // Width of timeline col in px
        dayClassName: 'date',                                                       // Class name for days divs
        rowHeadClassName: 'home',                                                   // Class name for row heading
        startDate: '',                                                              // Start date for timeline
        theme: 'default',                                                           // Theme class (default | blue | green)
        $timeline: document.getElementById('timeline'),                             // Timeline component element
        $table:    document.getElementById('timeline-table'),                       // Table element
        $tableHead: document.getElementById('timeline-header'),                     // Table head element
        $header:   document.getElementsByClassName('row-timeline-heading')[0],      // Heading element
        onClickView: function(e) { console.log('booking', e); },                    // Click handler for viewing an event
        onClickRow: function(e) {                                                   // Click handler for empty row event
            e.stopPropagation();
            console.log('column', parseInt(e.offsetX / 30, 10));
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
                $row;
                
            data.homes.forEach(function(home) {
                // Create new row
                $row = timeline.drawRow(home.name);
                
                // Create each booking rectangle in row
                home.bookings.forEach(function(booking) {
                    timeline.drawBooking(
                        $row.children[1].children[0], 
                        booking.ref, 
                        booking.status, 
                        booking.start, 
                        booking.duration, 
                        booking.client
                    )
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
            bookings.className = 'row-timeline',
            bookingsContainer.className = 'bookings-container';
            div.className = this.rowHeadClassName;
            div.appendChild(home);
            heading.appendChild(div);
            row.appendChild(heading);
            row.appendChild(bookings);
            bookings.appendChild(bookingsContainer);
            
            // Add row heading expand and contract handler
            heading.addEventListener('click', this.toggle);
            
            // Add booking container click handler (available day)
            bookings.addEventListener('click', this.onClickRow);
            
            return row;
        },
        
        // <td class="row-timeline">
        //     <div class="bookings-container">
        //         <div class="booking booked" id="b01" data-ref="b01" data-status="booked" data-start="07/02/2016" data-client="Mark Fairhurst"
        //         data-duration="999" style="left: 29.9997px; width: 871px;">Mark Fairhurst</div>
        //         <div class="booking requested" id="b02" data-ref="b02" data-status="requested" data-start="10/02/2016"
        //         data-client="John Doe" data-duration="4" style="left: 120px; width: 119px;">John Doe</div>
        //         <div class="booking undefined" id="b03" data-ref="b03" data-status="undefined" data-start="undefined"
        //         data-client="undefined" data-duration="undefined" style="left: 0px;">undefined</div>
        //         <div class="booking in-use" id="b04" data-ref="b04" data-status="in-use" data-start="24/02/2016"
        //         data-client="IN USE" data-duration="5" style="left: 540px; width: 149px;">IN USE</div>
        //     </div>
        // </td>
        
        
        // Add an individual booking rectangle to element el
        drawBooking: function drawBooking(el, ref, status, start, duration, client) {            
            var div = document.createElement('div'),
                content = document.createTextNode((client !== undefined) ? client : ''),
                offset = this.positionFromDate(start), /* Number of days from start */
                left = ((offset * 30) < 0) ? 0 : offset * 30,
                right = ((left + (duration * 30)) > this.width) ? this.width - 1 : (left + (duration * 30) - 1);

            // Styles
            div.className = 'booking ' +  ((status !== undefined) ? status : '');
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
