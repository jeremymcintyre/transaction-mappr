var myApp = {

  MarkersCtrl: (function(){
    var markers = [];

    return {

      setMarkers: function(locations) {
        var map = myApp.map;
        for (var i = 0, len = locations.length; i < len; i++) {
          var location = locations[i],
              position = new google.maps.LatLng(location.latitude,
                location.longitude),

              marker = new google.maps.Marker({
                position: position,
                animation: google.maps.Animation.DROP,
                map: map
              });

          markers.push(marker);
        }
      },

      clearMarkers: function() {
        for (i=0; i < markers.length; i++) {
          markers[i].setMap(null);
        }
        // remove references to markers
        markers.length = 0;
      }

    };
  })()

};


$(document).ready(function() {
  function initialize() {
    var mapOptions = {
      center: new google.maps.LatLng(37.773972, -122.431297),
      zoom: 12
    };
    // capture 'map' in scope for use in making markers
    myApp.map = new google.maps.Map(document.getElementById('map-canvas'),
      mapOptions);
  }
  google.maps.event.addDomListener(window, 'load', initialize);


  // event binding for reuse
  function bindClickEvents(element, callback) {
    $(element).on('click', callback);
  }
  // setMode is for determining what to request in Ajax calls
  bindClickEvents('nav a', setMode);

  function setMode(event) {
    event.preventDefault();

    var mode = this.innerHTML.toLowerCase();
    myApp.mode = mode;
    if (mode === "all") {
      $.ajax({
        type: 'GET',
        url: '/all'
      }).success(function(resp) {
      // currently limiting data to first user for proof of concept
      var currentLocations = resp.locations['Art Treaster'];
      var currentTransactions = resp.transactions['Art Treaster'];
      console.log(currentTransactions);
      myApp.MarkersCtrl.setMarkers(currentLocations);
    });
    }
  }
});


