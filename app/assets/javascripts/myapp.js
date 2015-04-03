/*

This file contains 2 main parts:
1. myApp object with functions & behaviors organized into controllers
2. Initial configuration to happen on document ready

These sections are further explained below.

-----------------------------------------------------------------------
ONE.

The myApp object has 2 main controllers:

   * MarkersCtrl
       - Controls the creation, setting, getting, clearing,
       event binding, and animations of google maps markers

   * AjaxCtrl
       - Handles all requests to the backend API and all responses,
       including transforming the responses into formatted DOM elements
       - There is only one returned method, request()

Both controllers are properties of the myApp object, and expressed as
Immediately-Invoking Function Expressions (IIFEs). This allows "private"
functions to be declared inside of them that are not returned, and so are
inaccessible from outside. For example, myApp.AjaxCtrl.request() is the
only returned function from AjaxCtrl that can be accessed elsewhere. This
encapsulates and shields behavior specific to the controller that is not
necessary to share.


****** NOTE: Behavior for the slider component is located in:
****** app/assets/javascripts/components/react-slider.js



-----------------------------------------------------------------------
TWO.

Initial configuration takes care of the following on document ready:

  * Initializes the map with proper coordinates and zoom.

  * Stores a reference to the map in the myApp object.

  * Binds event handlers to the nav and date container.

  * Defines the setMode() function, which event handlers use to set the
      mode. In this case, the 'mode' refers to the type of transaction
      filter currently being used.

  * Uses the event handlers to set the initial mode to 'Earning', so the
      user does not have to select one in order to begin using the app.


-----------------------------------------------------------------------
*/


var myApp = {

  MarkersCtrl: (function(){
    var markers = {};

    function toggleBounce() {
      if (this.getAnimation() !== null) {
        this.setAnimation(null);
      } else {
        this.setAnimation(google.maps.Animation.BOUNCE);
      }
    }

    function storeMarkerById(userId, marker) {
      if (markers[userId]) {
        markers[userId].push(marker);
      } else {
        markers[userId] = [marker];
      }
    }

    return {

      createMarker: function(LatLng, userId){
        var map = myApp.map,
            marker = new google.maps.Marker({
              position: LatLng,
              animation: google.maps.Animation.DROP,
              map: map
            });

        // Animating Listener:
        google.maps.event.addListener(marker, 'click', toggleBounce);

        // store in markers object for easy removal by batch
        storeMarkerById(userId, marker);
      },

      setMarkers: function(locations) {
        for (var i = 0, len = locations.length; i < len; i++) {
          var loc = locations[i],
              position = new google.maps.LatLng(loc.latitude, loc.longitude),
              marker = this.createMarker(position, loc.user_id);
        }
      },

      getMarkers: function(userId) {
        return (markers[userId]) ? markers[userId] : false;
      },

      toggleBounceByUserId: function(userId) {
        var markersWithId = this.getMarkers(userId);
        if (markersWithId) {
          markersWithId.forEach(function(marker) {
            google.maps.event.trigger(marker, 'click');
          });
        }
      },

      clearMarkers: function() {
        for (var userId in markers) {
          if (markers.hasOwnProperty(userId)) {
            var currentSet = markers[userId];
            for (i=0; i < currentSet.length; i++) {
              currentSet[i].setMap(null);
            }
          }
        }
        markers = {};
      }

    };

  })(),



  AjaxCtrl: (function() {

    var locationResponseHandler = function(locations) {
      for (var property in locations) {
        if (locations.hasOwnProperty(property)) {
          myApp.MarkersCtrl.setMarkers(locations[property]);
        }
      }
    };

    var transactionsResponseHandler = function(transactions) {
      var html = "";
      var formatCurrency = function(array, group) {
        group.map(function(transaction) {
          array.push("$" + transaction.amount);
        });
      };

      $('#results').html(""); // clear the list

      for (var property in transactions) {
        if (transactions.hasOwnProperty(property)) {
          var amounts = [],
              group = transactions[property],
              propertyArray = JSON.parse(property),
              userId = propertyArray[0],
              userName = propertyArray[1],
              opacityClass = getOpacityClass(group);

          formatCurrency(amounts, group);

          html += "<div id=" + userId + " class='result " + opacityClass + "'>" + userName + " - " + amounts.join(", ") + "</div>";
        }
      }
      if (html.length === 0) {
        $('#results').append('<div id="no-trans-notification" class="result">There is no transaction data of the selected type for this date</div>');
      } else {
        $('#no-trans-notification').remove();
        $('#results').append(html);
      }
      // BIND EVENT HANDLERS HERE
      $('.result').on('mouseenter', function() {
        if (myApp.MarkersCtrl.getMarkers(this.id)) {
          myApp.MarkersCtrl.toggleBounceByUserId(this.id);
        } else if (this.id !== "no-trans-notification") {
          $('#results').append('<div id="no-loc-notification" class="result">There is no location data for this person on this date</div>');
        }
      });
      $('.result').on('mouseleave', function() {
        if (myApp.MarkersCtrl.getMarkers(this.id)) {
          myApp.MarkersCtrl.toggleBounceByUserId(this.id);
        } else {
          $('#no-loc-notification').remove();
        }
      });
    };

    var responseHandler = function(response) {
      locationResponseHandler(response.locations);
      transactionsResponseHandler(response.transactions);
    };

    var getRequestFactory = function(data, url) {
      $.ajax({
        type: 'GET',
        url: url,
        data: data
      }).success(responseHandler);
    };

    // the results returned at any time aren't huge, so this is okay
    var getOpacityClass = function(group) {
      var total = 0;
      for (i=0, len = group.length; i<len; i++) {
        total += parseFloat(group[i].amount);
      }
      if (total < 50) {
        return "light";
      } else if (total < 100) {
        return "medium-light";
      } else if (total < 150) {
        return "medium";
      } else if (total < 150) {
        return "medium-dark";
      } else if (total >= 150) {
        return "dark";
      }
    };

    return {
      request: function() {
        var mode = myApp.mode,
            date = $('#date').html();

        myApp.MarkersCtrl.clearMarkers();
        if (mode !== "all") {
          getRequestFactory({date: date, mode: mode}, '/results');
        } else if (mode === "all") {
          getRequestFactory({}, '/all');
        }
      }
    };
  })()

};


// CONFIG TO HAPPEN ON DOCUMENT READY:

$(document).ready(function() {
  function initialize() {
    var mapOptions = {

      center: new google.maps.LatLng(35.896838, -117.948875),
      zoom: 5
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

  bindEvents($('nav a'), 'click', function(event) {
    $('nav a').removeClass("active");
    $(event.target).addClass("active");
  });

  // set initial mode to "charge" using bound handlers
  $('nav a:contains("CHARGE")').trigger('click');


  function setMode(event) {
    event.preventDefault();

    var mode = this.innerHTML.toLowerCase();
    myApp.mode = mode;
    if (mode === "all") {
      myApp.AjaxCtrl.request();
    }
  }

});


