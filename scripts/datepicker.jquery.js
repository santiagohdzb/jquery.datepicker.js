/**
 * this is a plugin created by me, plain jQuery
 * @author  Jose Santiago Hernandez Bustillos
 * @date    2015/March/04
 */
$(function() {
  "use strict";
  /**
   * "class" for holydays:
   *    month is 1 based
   *    day is 1 based
   * @param {object} obj month and day
   */
  window.HolyDay = function(obj) {
    this.month = obj.month;
    this.day = obj.day;
  };

  /**
   * binds the datepicker to an element
   */
  $.datepicker = function(el, opt) {
    var $el = $(el),
        $datepicker;

    opt = $.extend({
      datepickerId : "tmg_datepicker",
      datepickerClass : "",
      actualDate : undefined,
      offsetX : 20,
      offsetY : 0,
      daysToLoad: 180,
      disabledDays : [6,7], // saturday and sunday
      rowsBefore : 2,
      holidays : [
        new HolyDay({month:1,day:1}),
        new HolyDay({month:12,day:24}),
        new HolyDay({month:12,day:25}),
        new HolyDay({month:12,day:31})
      ],
      arrMonthsTitles : ["JANUARY","FEBRUARY","MARCH","APRIL","MAY","JUNE","JULY","AUGUST","SEPTEMBER","OCTOBER","NOVEMBER","DECEMBER"],
      arrDayTitles : ["Mo","Tu","We","Th","Fr","Sa","Su"]
    }, opt);

    /**
     * creates the datepicker, it's
     * only called once
     */
    var createDatepicker = function() {
      var acDate = opt.actualDate ?
            new Date(opt.actualDate[0], opt.actualDate[1], opt.actualDate[2]) :
            new Date(),
          acYear = acDate.getFullYear(),
          acMonth = acDate.getMonth(),
          acDay = acDate.getDate(),
          acDayDow = acDate.getDay();

      /**
       * creates the month label
       * @param {Date} date
       */
      var drawMonthLabel = function(date) {
        var year = date.getFullYear(),
            month = date.getMonth(),
            text = opt.arrMonthsTitles[month].substr(0,3),
            label = [],
            i = 0;

        for(; i < text.length; i++)
          label.push(text[i]);

        return ''
          + '<span class="month-label" data-year="' + year + '" data-month="' + month + '">'
            + label.join('<br>')
          + '</span>';
      };

      /**
       * checks if it is a disabled day
       *
       * @param {Date} date : date that is being build
       * @param {integer} dpDay : number of day relative to today = 0
       */
      var isDisabledDay = function(date, dpDay) {
        var max = Math.max(opt.disabledDays.length, opt.holidays.length),
            dow = date.getDay() === 0 ? 7 : date.getDay(),
            i = 0, holiday;

        if(dpDay - acDay < 0) {
          return true;
        }

        for(; i < max; i++) {
          holiday = opt.holidays[i];
          if( (dow === opt.disabledDays[i]) ||
              (holiday &&
                holiday.month - 1 === date.getMonth() &&
                holiday.day === date.getDate()))
            return true;
        }
      };

      /**
       * converts a Date object into a string
       * format dd-MM-YYYY
       *
       * @param {Date} date : date that is being build
       */
      var getDateString = function(date) {
        var month = (date.getMonth() + 1).toString(),
            day = date.getDate().toString();
        return [
          (day[1] ? '' : '0') + day,
          (month[1] ? '' : '0') + month,
          date.getFullYear()
        ].join("-");
      };

      /**
       * creates the string with
       * datepicker's html
       */
      var draw = function() {
        var end = opt.daysToLoad,
            dateString = "",
            dpDay = acDay - (acDayDow - 1) - (opt.rowsBefore * 7),
            result = "",
            i = 0,
            xDate, disabled;

        for(; i < end; dpDay++) {
          xDate = new Date(acYear, acMonth, dpDay);
          dateString = getDateString(xDate);
          disabled = isDisabledDay(xDate, dpDay) ? "disabled" : "";
          result += ''
              + '<td class="' + disabled + '" data-date="' + dateString + '">'
                + (xDate.getDate() === 1 ? drawMonthLabel(xDate) : "")
                + '<span class="day-label">' + xDate.getDate() + '</span>'
              + '</td>'
            + (++i % 7 === 0 ? '</tr><tr>' : '');
        }

        return ''
          + '<div class="dp_arrow"></div>'
          + '<div class="dp_wrapper">'
            + '<table>'
              + '<thead>'
                + '<tr class="month-title">'
                  + '<th colspan=7>MONTH 0000</th>'
                + '</tr>'
                + '<tr class="day-titles">'
                  + '<th>' + opt.arrDayTitles.join('</th><th>') + '</th>'
                + '</tr>'
              + '</thead>'
              + '<tbody>'
                + '<tr>' + result + '</tr>';
              + '</tbody>'
            + '</table>'
          + '</div>';
      };

      return draw();
    };

    /**
     * keeps updated the datepicker's month title
     * when user scrolls the calendar
     *
     * @context {DOMElement} this : datepicker's tbody element
     * @param {jQueryElement} $div : datepicker's wrapper div
     */
    var updateMonthTitle = function($div) {
      var tbOffsetTop = $(this).prop("offsetTop"),
          tbScrollTop = $(this).prop("scrollTop"),
          arrMonths = $(this).find(".month-label").toArray(),
          i = 0, $current, monthY, month, year, xDate;

      for(;i < arrMonths.length; i++) {
        $current = $(arrMonths[i]);
        monthY = $current.parents("tr").prop("offsetTop") - tbOffsetTop;
        if(monthY >= tbScrollTop) {
          year = $current.data("year");
          month = $current.data("month");
          xDate = new Date(year, month - 1, 1);
          $div.find(".month-title th").html(
            opt.arrMonthsTitles[xDate.getMonth()] + " " + xDate.getFullYear()
          );
          break;
        }
      }
    };

    /**
     * obtains/create the datepicker
     * returns DOM reference
     */
    var getDatepicker = function() {
      var $div = $('#' + opt.datepickerId), $tbody, $input;
      if(!$div.length) {
        $div = $('<div>')
          .attr('id', opt.datepickerId)
          .addClass(opt.datepickerClass)
          .html(createDatepicker())
          .on("click", 'td:not(.disabled)', function() {
            writeDate.call(this);
            hide();
          })
          .on("click", 'td.disabled', function() {
            $input = $div.data("current");
            $input.focus();
          });
        $tbody = $div.find('tbody').on("scroll", function() {
          updateMonthTitle.apply(this,[$div]);
        });
        updateMonthTitle.apply($tbody[0], [$div]);
        $("body").append($div);
      }
      return $div;
    };

    /**
     * sets the coords of datepicker and its nice
     * arrow always aware that the full datepicker
     * is user-visible
     */
    var setPosition = function() {
      var y = $el.offset().top, // input info
          x = $el.offset().left,
          middleY = $el.prop("offsetHeight") / 2,
          middleX = $el.prop("offsetWidth") / 2;
      var dpHeight = $datepicker.prop("offsetHeight"), // datepicker info
          dpWidth = $datepicker.prop("offsetWidth"),
          dpMiddleY = dpHeight / 2;
      var wScrollY = $(window).scrollTop(), // window info
          wHeight = $(window).height() + wScrollY,
          wWidth = $(window).width();
      var posY = y + middleY + opt.offsetY - dpMiddleY, // math starts, yeah!
          posX = x + middleX + opt.offsetX;
      var $dpArrow = $datepicker.find(".dp_arrow");
      posY = posY + dpHeight > wHeight ? wHeight - dpHeight : posY ;
      posY = posY < wScrollY ? wScrollY : posY ;
      posX = dpWidth + posX > wWidth ? wWidth - dpWidth : posX ;
      $dpArrow.css({
        "top" : y - posY + "px",
        "left" : -$dpArrow.prop("offsetWidth") + "px"
      });
      $datepicker.css({
        "top" : posY + "px",
        "left" : posX + "px"
      });
    };

    /**
     * selects focused input's date
     * if found in datepicker
     */
    var readDate = function() {
      var $selected = $datepicker.find(".selected"),
          val = $el.val(), $td, $tbody;
      if($selected.length)
        $selected.removeClass("selected");
      if(val) {
        $td = $datepicker.find('td[data-date=' + val + ']');
        if($td.length) {
          $tbody = $datepicker.find('tbody');
          $tbody.animate({
              "scrollTop" : $td.offset().top - $tbody.offset().top + $tbody.scrollTop()
          });
          $td.addClass("selected");
        }
      }
    };

    /**
     * writes the chosen date in
     * the input, format dd-MM-YYYY
     * @context {jQueryElement} this : focused input
     */
    var writeDate = function() {
      var $input = $datepicker.data("current"),
          text = $(this).data("date");
      $input.val(text);
    };

    /**
     * stops hide()'s timer
     * in case that exists
     */
    var clearTime = function() {
      var timer = $datepicker.data("timer");
      if(timer) window.clearTimeout(timer);
    };

    /**
     * sets hide()'s timeout
     */
    var setTime = function() {
      var timer = window.setTimeout(hide, 200);
      $datepicker.data("timer", timer);
    };

    /**
     * hides datepicker and clears hide()'s timer
     */
    var hide = function() {
      $datepicker.fadeOut("fast");
      clearTime();
    };

    /**
     * configures the datepicker:
     * 	- creates/select datepicker
     * 	- fades in the wrapper div
     * 	- sets the current input reference into a "data" in wrapper div
     * 	- selects the input's date in datepicker
     * 	- sets the main-wrapper's absolute coordinates
     */
    var show = function() {
      $datepicker = getDatepicker();
      $datepicker.fadeIn("fast");
      $datepicker.data("current", $el);
      readDate();
      clearTime();
      setPosition();
    };

    /**
     * attatchs the datepicker methods
     * to inputs' focus/blur events
     */
    var init = function() {
      $el.focus(show).blur(setTime);
    }();

  };

  // each binder
  $.fn.datepicker = function(opt) {
    return this.each(function() {
      if (undefined === $(this).data('datepicker')) {
        var datepicker = new $.datepicker(this, opt);
        $(this).data('datepicker', datepicker);
      }
    });
  };
});
