var myApp = {};

$(document).ready(function() {

  function initialize() {
    var mapOptions = {
      center: new google.maps.LatLng(37.773972, -122.431297),
      zoom: 12
    };
    var map = new google.maps.Map(document.getElementById('map-canvas'),
      mapOptions);
    window.map = map;
  }
  google.maps.event.addDomListener(window, 'load', initialize);


  // event binding for reuse
  function bindClickEvents(element, callback) {
  $(element).on('click', callback);
  }
  // setMode is for determining what to request in Ajax calls
  bindClickEvents('nav a', setMode);


  // capture 'map' in scope for use in making markers
  myApp.setMarkers = function(locations) {
    console.log("available");
    var loadMap = map;
    for (var i = 0, len = locations.length; i < len; i++) {
      var location = locations[i],
          position = new google.maps.LatLng(location.latitude, location.longitude);

      console.log(location);
      var marker = new google.maps.Marker({
        position: position,
        map: map
      });
    }
  };
});





function setMode(event) {
  event.preventDefault();

  var mode = this.innerHTML.toLowerCase();
  window.mode = mode;
  if (mode === "all") {
    $.ajax({
      type: 'GET',
      url: '/all'
    }).success(function(resp) {
      // currently limiting data to first user for proof of concept
      var currentLocations = resp.locations['Art Treaster'];
      var currentTransactions = resp.transactions['Art Treaster'];
      myApp.setMarkers(current);
    });
  }
}

