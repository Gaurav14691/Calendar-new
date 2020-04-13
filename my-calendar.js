

(function(factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else if (typeof exports !== 'undefined') {
        module.exports = factory(require('jquery'));
    } else {
        factory(jQuery);
    }

}(function($) {
    'use strict';
    var MyCalendar = window.MyCalendar || {};

    MyCalendar = (function() {
        function MyCalendar(element, settings) {
            var _ = this, dataSettings;
            _.defaults = {
                format: 'mm/dd/yyyy',
                titleFormat: 'MM yyyy',
                eventHeaderFormat: 'MM d, yyyy',
                firstDayOfWeek: 'Sun',
                language: 'en',
                todayHighlight: false,
                sidebarDisplayDefault: true,
                sidebarToggler: true,
                eventListToggler: true,
                eventDisplayDefault: true,
                calendarEvents: null,
                disabledDate: null,
                canAddEvent: true,

                onSelectDate: null,
                onAddEvent: null
            };

            _.initials = {
                validParts: /dd?|DD?|mm?|MM?|yy(?:yy)?/g,
                dates: {
                    en: {
                        days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                        daysShort: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat","Sun"],
                        daysMin: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
                        months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
                        monthsShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
                    }
                }
            }

            _.options = $.extend({}, _.defaults, settings);
            
            _.$parseFormat = function(format) {
                if (typeof format.toValue === 'function' && typeof format.toDisplay === 'function')
                    return format;
                // IE treats \0 as a string end in inputs (truncating the value),
                // so it's a bad format delimiter, anyway
                var separators = format.replace(_.initials.validParts, '\0').split('\0'),
                    parts = format.match(_.initials.validParts);
                if (!separators || !separators.length || !parts || parts.length === 0){
                    throw new Error("Invalid date format.");
                }
                return {separators: separators, parts: parts};
            };
            
            _.$formatDate = function(date, format, language){
                if (!date)
                    return '';
                if (typeof format === 'string')
                    format = _.$parseFormat(format);
                if (format.toDisplay)
                    return format.toDisplay(date, format, language);


                var val = {
                    d: new Date(date).getDate(),
                    D: _.initials.dates[language].daysShort[new Date(date).getDay()],
                    DD: _.initials.dates[language].days[new Date(date).getDay()],
                    m: new Date(date).getMonth() + 1,
                    M: _.initials.dates[language].monthsShort[new Date(date).getMonth()],
                    MM: _.initials.dates[language].months[new Date(date).getMonth()],
                    yy: new Date(date).getFullYear().toString().substring(2),
                    yyyy: new Date(date).getFullYear()
                };
                val.dd = (val.d < 10 ? '0' : '') + val.d;
                val.mm = (val.m < 10 ? '0' : '') + val.m;
                date = [];
                var seps = $.extend([], format.separators);
                for (var i=0, cnt = format.parts.length; i <= cnt; i++){
                    if (seps.length)
                        date.push(seps.shift());
                    date.push(val[format.parts[i]]);
                }
                return date.join('');
            };

            if(_.options.calendarEvents != null) {
                for(var i=0; i < _.options.calendarEvents.length; i++) {
                    if(_.isValidDate(_.options.calendarEvents[i].date)) {
                        _.options.calendarEvents[i].date = _.$formatDate(new Date(_.options.calendarEvents[i].date), _.options.format, 'en')
                    }
                }
            }

            if(_.options.disabledDate != null) {
                for(var i=0; i < _.options.disabledDate.length; i++) {
                    if(_.isValidDate(_.options.disabledDate[i])) {
                        _.options.disabledDate[i] = _.$formatDate(new Date(_.options.disabledDate[i]), _.options.format, 'en')
                    }
                }
            }

            _.$cal_days_labels = [];
            // _.$cal_days_labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

            // these are human-readable month name labels, in order
            _.$cal_months_labels = ['January', 'February', 'March', 'April',
                                 'May', 'June', 'July', 'August', 'September',
                                 'October', 'November', 'December'];

            // these are the days of the week for each month, in order
            _.$cal_days_in_month = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

            // this is the current date
            _.$cal_current_date = new Date();

            _.$month = (isNaN(_.$month) || _.$month == null) ? _.$cal_current_date.getMonth() : _.$month; // 0
            _.$year  = (isNaN(_.$year) || _.$year == null) ? _.$cal_current_date.getFullYear() : _.$year; // 2020
            _.$mainHTML = '';
            _.$sidebarHTML = '';
            _.$calendarHTML = '';
            _.$eventHTML = '';

            _.$active_day_el = null;
            _.$active_date = _.$formatDate(new Date(), _.options.format, 'en');
            _.$active_month_el = null;
            _.$active_month = _.$month;
            _.$active_year_el = null;
            _.$active_year = _.$year;

            _.$calendar = $(element);
            _.$calendar_sidebar = '';
            _.$calendar_inner = '';
            _.$calendar_events = '';

            _.selectDate = $.proxy(_.selectDate, _);
            _.selectMonth = $.proxy(_.selectMonth, _);
            _.selectYear = $.proxy(_.selectYear, _);
           
            

            _.init(true);
        }

        return MyCalendar;

    }());


    MyCalendar.prototype.init = function(creation) {

        var _ = this;

        if (!$(_.$calendar).hasClass('calendar-initialized')) {

            $(_.$calendar).addClass('evo-calendar calendar-initialized');

            

            _.buildCalendar('all');
        }
    };

    MyCalendar.prototype.buildCalendar = function(val, new_month, new_year) {
        debugger;
      
        var _ = this;
        // get first day of month
        new_month = (isNaN(new_month) || new_month == null) ? _.$active_month : new_month;
        console.log(new_month);
        new_year = (isNaN(new_year) || new_year == null) ? _.$active_year : new_year;
        console.log(new_month);

        // find number of days in month
        var monthLength = _.$cal_days_in_month[new_month];

        // compensate for leap year
        if (new_month == 1) { // February only!
            if((new_year % 4 == 0 && new_year % 100 != 0) || new_year % 400 == 0){
                monthLength = 29;
            }
        }
        
        var nameDays = _.initials.dates[_.options.language].daysShort;
        var firstDayOfWeekName = _.initials.dates[_.options.language].daysShort.map(function(obj) {return obj}).indexOf(_.options.firstDayOfWeek);

        while (_.$cal_days_labels.length < nameDays.length) {
            if (firstDayOfWeekName == nameDays.length) {
                firstDayOfWeekName=0;
            }
            _.$cal_days_labels.push(nameDays[firstDayOfWeekName]);
            firstDayOfWeekName++;
        }
        
        var firstDay = new Date(new_year, new_month).getDay() - firstDayOfWeekName;
        var startingDay = firstDay < 0 ? (_.$cal_days_labels.length + firstDay) : firstDay;

        // do the header
        
        var monthName =  _.$cal_months_labels[new_month];

        var mainHTML = '';
        var sidebarHTML = '';
        var calendarHTML = '';
        
        var mainHTML = '';
        var sidebarHTML = '';
        var calendarHTML = '';
        var START_DAY =[];

        
            for(var i = 0; i < _.$cal_months_labels.length; i++) {
            var firstDay = new Date(new_year, i).getDay();
            var j=0;
            var day = _.$cal_months_labels[i];
            if(firstDay==0)
            START_DAY.push([6,day,i]);
            if(firstDay==1)
            START_DAY.push([0,day,i]);
            if(firstDay==2)
            START_DAY.push([1,day,i]);
            if(firstDay==3)
            START_DAY.push([2,day,i]);
            if(firstDay==4)
            START_DAY.push([3,day,i]);
            if(firstDay==5)
            START_DAY.push([4,day,i]);
            if(firstDay==6)
            START_DAY.push([5,day,i]);
            j++;
            
            }


     
        

        
        function buildMainHTML() {
            var mainHTML = '<div class="calendar-sidebar"></div><div class="calendar-inner"></div><div class="calendar-events"></div>';
            
            _.$mainHTML = mainHTML;
        }
       

        function buildSidebarHTML() {
            sidebarHTML = '<div >'
             sidebarHTML += '<table>';
             for(var j=0; j < 7;j++)
             {
                sidebarHTML += '<tr >';
                var abc  = START_DAY.filter(x=> x[0]==j);
                 for(var k=0; k<3;k++)
                 {
                   if((abc[k] != undefined))
                   {
                   sidebarHTML += '<td class="th-height"  month-val="'+abc[k][2]+'">'+ abc[k][1] +'</td>';
                   }
                   else
                   sidebarHTML += '<td class="th-height" >'+'   '+'</td>';
                   
                    
                 }
                 sidebarHTML += '</tr>';
             }
            
             sidebarHTML += '</table><table>';
             for(var j=0; j < 7;j++)
             {
                sidebarHTML += '<tr >';
                for(var i=j; i < 7;i++)
                {
                if(i==6)
                sidebarHTML += '<td class="th-height" style="color:red">'+ _.initials.dates[_.options.language].daysShort[i] +'</td>';
                else
                sidebarHTML += '<td class="th-height">'+ _.initials.dates[_.options.language].daysShort[i] +'</td>';
                }
                for(var k=0; k <j; k++)
                {
                sidebarHTML += '<td class="th-height">'+ _.initials.dates[_.options.language].daysShort[k] +'</td>';
                }
                 sidebarHTML += '</tr>';
             }
             sidebarHTML += '</table>';
            
            _.$calendarHTML = sidebarHTML;
           
        }

       
        

        function buildCalendarHTML() {
            calendarHTML = '<div class="calendar-year"><button class="icon-button" year-val="prev" title="Previous year"><span class="chevron-arrow-left"></span></button>&nbsp;<p>'+new_year+'&nbsp;</p><button class="icon-button" year-val="next" title="Next year"><span class="chevron-arrow-right"></span></button></div>';
            calendarHTML += '<table >';
            calendarHTML += '<tr><th colspan="7">';
            
            calendarHTML += '</th></tr>';
           
            calendarHTML += '</tr><tr class="calendar-body" >';
            // fill in the days
            var day = 1;
            // this loop is for is weeks (rows)
            for (var i = 0; i < 9; i++) {
                // this loop is for weekdays (cells)
                for (var j = 0; j <= 6; j++) { 
                    calendarHTML += '<td class="calendar-day" >';
                    if (day <= monthLength ) { //&& (i > 0 || j >= startingDay)
                        var thisDay = _.$formatDate(new Date(monthName +'/'+ day +'/'+ new_year), _.options.format, 'en');
                        calendarHTML += '<div class="day'
                        calendarHTML += ((_.$active_date === thisDay) ? ' calendar-active' : '') + '" date-val="'+thisDay+'">'+day+'</div>';
                        day++;
                    }
                    calendarHTML += '</td>';
                }
                // stop making rows if we've run out of days
                if (day > monthLength) {
                  break;
                } else {
                  calendarHTML += '</tr><tr class="calendar-body">';
                }
            }
            calendarHTML += '</tr></table>';
            
            _.$sidebarHTML = calendarHTML;
          
        }
        
        function buildEventListHTML() {
            if(_.options.calendarEvents != null) {
                var eventHTML = '<div class="event-header"><p>'+_.$formatDate(new Date(_.$active_date), _.options.eventHeaderFormat, 'en')+'</p></div>';
                var hasEventToday = false;
                eventHTML += '<div>';
                for (var i = 0; i < _.options.calendarEvents.length; i++) {
                    if(_.$active_date === _.options.calendarEvents[i].date) {
                        hasEventToday = true;
                        eventHTML += '<div class="event-container">';
                        eventHTML += '<div class="event-icon"><div class="event-bullet-'+_.options.calendarEvents[i].type+'"></div></div>';
                        eventHTML += '<div class="event-info"><p>'+_.options.calendarEvents[i].name+'</p></div>';
                        eventHTML += '</div>';
                    } else if (_.options.calendarEvents[i].everyYear) {
                        var d = _.$formatDate(new Date(_.$active_date), 'mm/dd', 'en');
                        var dd = _.$formatDate(new Date(_.options.calendarEvents[i].date), 'mm/dd', 'en');
                        if(d==dd) {
                            hasEventToday = true;
                            eventHTML += '<div class="event-container">';
                            eventHTML += '<div class="event-icon"><div class="event-bullet-'+_.options.calendarEvents[i].type+'"></div></div>';
                            eventHTML += '<div class="event-info"><p>'+_.options.calendarEvents[i].name+'</p></div>';
                            eventHTML += '</div>';
                        }
                    }
                };
                if(!hasEventToday) {
                    eventHTML += '<p>No event for this day.. so take a rest! :)</p>';
                }
                eventHTML += '</div>';
                _.$eventHTML = eventHTML;
            }
        }

        if(val == 'all') {
            buildMainHTML();
            buildSidebarHTML();
            buildCalendarHTML();
            //aligntable();
            buildEventListHTML();
            
        } else if (val == 'sidebar') {
            buildSidebarHTML();
           buildCalendarHTML();
          
        } else if (val == 'inner') {
            // console.log('buildCalendar---inner', _.options.calendarEvents);
            buildCalendarHTML();
            buildSidebarHTML();
            
        } else if (val == 'events') {
            buildEventListHTML();
            buildSidebarHTML();
           
        }

        _.setHTML(val);
       
    };

    // Set the HTML to element
    MyCalendar.prototype.setHTML = function(val) {
        var _ = this;

        if(val == 'all') {
            _.$calendar.html(_.$mainHTML);
           _.$calendar_sidebar = $('.calendar-sidebar');
            _.$calendar_inner = $('.calendar-inner');
           
            _.$calendar_events = $('.calendar-events');

            _.$calendar_sidebar.html(_.$sidebarHTML);
            _.$calendar_inner.html(_.$calendarHTML);
            _.$calendar_events.html(_.$eventHTML);
            _.$calendar.removeClass('event-hide');
            
        } else if (val == 'sidebar') {
            _.$calendar_sidebar = $('.calendar-sidebar');
            _.$calendar_sidebar.html(_.$sidebarHTML);
        } else if (val == 'inner') {
            _.$calendar_inner = $('.calendar-inner');
            _.$calendar_inner.html(_.$calendarHTML);
            _.$calendar_sidebar = $('.calendar-sidebar');
            _.$calendar_sidebar.html(_.$sidebarHTML);
        } else if (val == 'events') {
            _.$calendar_events = $('.calendar-events');
            _.$calendar_events.html(_.$eventHTML);
        }

        if(_.options.calendarEvents != null) {
            _.initCalendarEvents();
        }

        if(_.options.todayHighlight) {
            $('.day[date-val="'+_.$formatDate(_.$cal_months_labels[_.$month] +'/'+ _.$cal_current_date.getDate() +'/'+ _.$year, _.options.format, 'en')+'"]').addClass('calendar-today');
        }

        _.initEventListener();
    };

    // Add calendar events
    MyCalendar.prototype.initCalendarEvents = function() {
        var _ = this;
        // prevent duplication
        $('.event-indicator').empty();
        // find number of days in month
        var monthLength = _.$cal_days_in_month[_.$active_month];

        // compensate for leap year
        if (_.$active_month == 1) { // February only!
            if((_.$active_year % 4 == 0 && _.$active_year % 100 != 0) || _.$active_year % 400 == 0){
                monthLength = 29;
            }
        }
        
        for (var i = 0; i < _.options.calendarEvents.length; i++) {
            for (var x = 0; x < monthLength; x++) {
                var active_date = _.$formatDate(new Date(_.$cal_months_labels[_.$active_month] +'/'+ (x + 1) +'/'+ _.$active_year), _.options.format, 'en');
                // console.log(active_date, _.$formatDate(new Date(_.options.calendarEvents[i].date), _.options.format, 'en'))
                
                var thisDate = $('[date-val="'+active_date+'"]');
                if(active_date==_.options.calendarEvents[i].date) {
                    thisDate.addClass('calendar-'+ _.options.calendarEvents[i].type);

                    if($('[date-val="'+active_date+'"] span.event-indicator').length == 0) {
                        thisDate.append('<span class="event-indicator"></span>');
                    }

                    if($('[date-val="'+active_date+'"] span.event-indicator > .type-bullet > .type-'+_.options.calendarEvents[i].type).length == 0) {
                        var htmlToAppend = '<div class="type-bullet"><div class="type-'+_.options.calendarEvents[i].type+'"></div></div>';
                        thisDate.find('.event-indicator').append(htmlToAppend);
                    }
                } else if (_.options.calendarEvents[i].everyYear) {
                    var d = _.$formatDate(new Date(active_date), 'mm/dd', 'en');
                    var dd = _.$formatDate(new Date(_.options.calendarEvents[i].date), 'mm/dd', 'en');
                    if(d==dd) {
                        thisDate.addClass('calendar-'+ _.options.calendarEvents[i].type);
    
                        if($('[date-val="'+active_date+'"] span.event-indicator').length == 0) {
                            thisDate.append('<span class="event-indicator"></span>');
                        }
    
                        if($('[date-val="'+active_date+'"] span.event-indicator > .type-bullet > .type-'+_.options.calendarEvents[i].type).length == 0) {
                            var htmlToAppend = '<div class="type-bullet"><div class="type-'+_.options.calendarEvents[i].type+'"></div></div>';
                            thisDate.find('.event-indicator').append(htmlToAppend);
                        }
                    }
                }
            }
        };
    };

    // Add listeners
    MyCalendar.prototype.initEventListener = function() {
        var _ = this;

        if(_.options.sidebarToggler) {
            $('#sidebarToggler')
               .off('click.MyCalendar')
               .on('click.MyCalendar', _.toggleSidebar);
        }
        if(_.options.eventListToggler) {
            $('#eventListToggler')
               .off('click.MyCalendar')
               .on('click.MyCalendar', _.toggleEventList);
        }
        if(_.options.canAddEvent) {
            $('#eventAddButton')
               .off('click.MyCalendar')
               .on('click.MyCalendar', _.options.onAddEvent);
        }


        $('[date-val]')
           .off('click.MyCalendar')
           .on('click.MyCalendar', _.selectDate)
           .on('click.MyCalendar', _.options.onSelectDate);

        // set event listener for each month
        $('[month-val]')
           .off('click.MyCalendar')
           .on('click.MyCalendar', _.selectMonth);

        // set event listener for year
        $('[year-val]')
           .off('click.MyCalendar')
           .on('click.MyCalendar', _.selectYear);

    };

    // select year
    MyCalendar.prototype.selectYear = function(event) {
        var _ = this;

        _.$active_year_el = $(event.currentTarget);

        if($(event.currentTarget).attr("year-val") == "prev") {
            --_.$active_year;
        } else if ($(event.currentTarget).attr("year-val") == "next") {
            ++_.$active_year;
        } else {

        }

        $('[year-val]').removeClass('active-year');
        $(_.$active_year_el).addClass('active-year');

        $('.calendar-year p').text(_.$active_year);
         _.buildCalendar('inner', null, _.$active_year);
    };

    // select month
    MyCalendar.prototype.selectMonth = function(event) {
        var _ = this;

        _.$active_month = $(event.currentTarget).attr("month-val");
        _.$active_month_el = $("li[month-val="+_.$active_month+"]");
        $(_.$active_month_el).addClass('active-month');

        $('[month-val]').removeClass('active-month');
        $('[month-val='+_.$active_month+']').addClass('active-month');
         _.buildCalendar('inner', _.$active_month);
    };

    // select specific date
    MyCalendar.prototype.selectDate = function(event) {
        var _ = this;

        _.$active_day_el = $(event.currentTarget);
        _.$active_date = _.$active_day_el.attr("date-val");
        $('.day').removeClass('calendar-active');
        $(_.$active_day_el).addClass('calendar-active');
         _.buildCalendar('events');
    };
    
    // toggle sidebar
    MyCalendar.prototype.toggleSidebar = function(event) {
        var _ = this;

        if($(_.$calendar).hasClass('sidebar-hide')) {
            $(_.$calendar).removeClass('sidebar-hide');
        } else {
            $(_.$calendar).addClass('sidebar-hide');
        }
    };

    // toggle event list
    MyCalendar.prototype.toggleEventList = function(event) {
        var _ = this;
        $(_.$calendar).removeClass('event-hide');

      
    };

    // add calendar event(s)
    MyCalendar.prototype.addCalendarEvent = function(new_data) {
        var _ = this;
        var data = new_data;
        for(var i=0; i < data.length; i++) {
            if(_.isValidDate(data[i].date)) {
                data[i].date = _.$formatDate(new Date(data[i].date), _.options.format, 'en');
                _.options.calendarEvents.push(data[i]);
            }
        }
         _.buildCalendar('inner');
         _.buildCalendar('events');
    };

    // remove calendar event
    MyCalendar.prototype.removeCalendarEvent = function(new_data) {
        var _ = this;
        // code here...
    };

    MyCalendar.prototype.isValidDate = function(d){
        return new Date(d) && !isNaN(new Date(d).getTime());
    }

    $.fn.MyCalendar = function() {
        var _ = this,
            opt = arguments[0],
            args = Array.prototype.slice.call(arguments, 1),
            l = _.length,
            i,
            ret;
        for (i = 0; i < l; i++) {
            if (typeof opt == 'object' || typeof opt == 'undefined')
                _[i].MyCalendar = new MyCalendar(_[i], opt);
            else
                ret = _[i].MyCalendar[opt].apply(_[i].MyCalendar, args);
            if (typeof ret != 'undefined') return ret;
        }
        return _;
    };

}));