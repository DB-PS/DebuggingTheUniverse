function formatDate(str, isFullFormat) {
  // str: YYYY-MM-DD:HH-MM
  var parts = str.split(':');
  var dateParts = parts[0].split('-');

  var months = [
    'Jan','Feb','Mar','Apr','May','Jun',
    'Jul','Aug','Sep','Oct','Nov','Dec'
  ];

  var y = dateParts[0];
  var m = months[parseInt(dateParts[1], 10) - 1];
  var d = dateParts[2];

  if (!isFullFormat) {
    return m + ' ' + d + ', ' + y;
  }

  var timeParts = parts[1].split('-');
  var hours = parseInt(timeParts[0], 10);
  var minutes = timeParts[1];
  var ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;

  return y + ' ' + m + ' ' + d + ' ' + hours + ':' + minutes + ' ' + ampm;
}
