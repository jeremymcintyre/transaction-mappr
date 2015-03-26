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
              // optimized: false
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
        // I tried making a markerReferences object that maps user_ids to coordinates.
        // This way, I could still drop a new marker on top of the one corresponding
        // with the userId. It is not implemented here - too clunky.
        google.maps.event.addListener(marker, 'click', function() {
          if (marker.getAnimation() !== null) {
            marker.setAnimation(null);
          } else {
            marker.setAnimation(google.maps.Animation.BOUNCE);
          }
        });
        // store in array for easy removal by batch
        markers.push(marker);
      },

      setMarkers: function(locations) {
        for (var i = 0, len = locations.length; i < len; i++) {
          var loc = locations[i],
              position = new google.maps.LatLng(loc.latitude, loc.longitude),
              marker = this.createMarker(position);
        }
      },

      clearMarkers: function() {
        for (i=0; i < markers.length; i++) {
          markers[i].setMap(null);
        }
        // removes references to markers
        markers.length = 0;
      }

    };

  })(),


  SliderCtrl: (function() {
    // If there's time, dynamically set slider min/max during initialize
    var initialized = false;

    return {
      initialize: function() {
        // don't do this more than once
        if (!initialized) {
          initialized = true;
          var previousValue = parseInt($('#slider').attr('value'));

          $('#slider').on('change', function() {
            var daysToAdd = parseInt(this.value) - previousValue,
                date = new Date($('#date').text()),
                formattedDate;

            // updates
            previousValue += daysToAdd;
            date.setDate(date.getDate() + daysToAdd);

            // preformatting
            month = (date.getMonth() + 1).toString();
            day = date.getDate().toString();

            formattedDate = date.getFullYear() + '-' + month + '-' + day;
            $('#date').text(formattedDate);

          });
        }
      }
    };
  })(),


  AjaxCtrl: (function() {
    return {
      request: function() {
        var mode = myApp.mode;

        if (mode !== "all") {
          myApp.MarkersCtrl.clearMarkers();
        }

        if (mode === "earning") {
          console.log("we earning");
        } else if (mode === "charge") {
          console.log("we charging");
        } else if (mode === "both") {
          console.log("you just gotta have Evverrything");
        }
      }
    };
  })()

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
  function bindEvents(element, action, callback) {
    $(element).on(action, callback);
  }
  // setMode is for determining what to request in Ajax calls
  bindEvents('nav a', 'click', setMode);

  bindEvents($('#date').text, 'change', myApp.AjaxCtrl.request);


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

  // initialize slider
  myApp.SliderCtrl.initialize();

});


