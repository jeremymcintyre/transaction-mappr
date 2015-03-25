$(document).ready(function() {
  function initialize() {
    var mapOptions = {
      center: new google.maps.LatLng(37.773972, -122.431297),
      zoom: 12
    };
    var map = new google.maps.Map(document.getElementById('map-canvas'),
      mapOptions);
  }
  google.maps.event.addDomListener(window, 'load', initialize);
});