$(function(){
  $("input[data-type=date]").datepicker({
    datepickerId : "tmg_datepicker",
    datepickerClass : "",
    offsetX : 50,
    offsetY : -30,
    daysToLoad: 182,
    disabledDays : [6,7], // 1 - 7
    rowsBefore : 2,
    //actualDate : [2015,1,1], // option available, by default is today, format YYYY,MM,DD
    holidays: [
      new HolyDay({month:1,day:1}),
      new HolyDay({month:12,day:24}),
      new HolyDay({month:12,day:25}),
      new HolyDay({month:3,day:19}),
      new HolyDay({month:12,day:31})
    ]
  });
});
