var myApp = {
  MarkersCtrl: (function(){
    var markers = [];

    return {

      createMarker: function(LatLng){
        var map = myApp.map,
            marker = new google.maps.Marker({
              position: LatLng,
              animation: google.maps.Animation.DROP,
              map: map
              // optimized: false,
              // title: userId.toString()
            });

        // Animating Listener:

        // My idea was that I could have a list of users and transactions,
        // and by mouseenter/mouseleaving I could use jQuery .trigger('click')
        // to dynamically make the corresponding locations bounce on the map.
        // Unfortunately, it turned out that it is unreasonably difficult to select
        // google maps markers with jQuery.

        // Interesting challenge but it did not pan out.

        // As a workaround,
        // I tried making a markerReferences object that maps user_ids to coordinates
        // This way, I could still drop a new marker on top of the one corresponding
        // with the userId.
        google.maps.event.addListener(marker, 'click', function() {
          if (marker.getAnimation() !== null) {
            marker.setAnimation(null);
          } else {
            marker.setAnimation(google.maps.Animation.BOUNCE);
          }
        });
      },

      setMarkers: function(locations) {
        for (var i = 0, len = locations.length; i < len; i++) {
          var loc = locations[i],
              position = new google.maps.LatLng(loc.latitude, loc.longitude),
              marker = this.createMarker(position, loc.user_id);
          // store in array for easy removal
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

  })(),

};


// CONFIG TO HAPPEN ON DOCUMENT READY:

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



  // Event binding for reuse
  function bindClickEvents(element, callback) {
    $(element).on('click', callback);
  }
  // setMode is for determining what to request in Ajax calls
  bindClickEvents('nav a', setMode);



  function setMode(event) {
    event.preventDefault();

    var mode = this.innerHTML.toLowerCase();
    myApp.mode = mode;
    // For initial test of ajax:
    if (mode === "all") {
      $.ajax({
        type: 'GET',
        url: '/all'
      }).success(function(resp) {
      // currently limiting data to first user for proof of concept
      var currentLocations = resp.locations['Art Treaster'];
      var currentTransactions = resp.transactions['Art Treaster'];
      myApp.MarkersCtrl.setMarkers(currentLocations);
    });
    }
  }
});


