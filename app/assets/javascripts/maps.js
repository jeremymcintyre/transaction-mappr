var myApp = {

  MarkersCtrl: (function(){
    var markers = {};

    return {

      createMarker: function(LatLng, userId){
        var map = myApp.map,
            marker = new google.maps.Marker({
              position: LatLng,
              animation: google.maps.Animation.DROP,
              map: map,
              // optimized: false
            });

        // Animating Listener:
        google.maps.event.addListener(marker, 'click', function() {
          if (marker.getAnimation() !== null) {
            marker.setAnimation(null);
          } else {
            marker.setAnimation(google.maps.Animation.BOUNCE);
          }
        });
        // store in object for easy removal by batch
        if (markers[userId]) {
          markers[userId].push(marker);
        } else {
          markers[userId] = [marker];
        }
      },

      setMarkers: function(locations) {
        for (var i = 0, len = locations.length; i < len; i++) {
          var loc = locations[i],
              position = new google.maps.LatLng(loc.latitude, loc.longitude),
              marker = this.createMarker(position, loc.user_id);
        }
      },

      toggleBounceByUserId: function(userId) {
        var markersWithId = markers[userId];
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
      console.log(transactions);
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
      // html += "";
      $('#results').append(html);
      // BIND EVENT HANDLERS HERE
      $('.result').on('mouseenter', function() {
        myApp.MarkersCtrl.toggleBounceByUserId(this.id);
      });
      $('.result').on('mouseleave', function() {
        myApp.MarkersCtrl.toggleBounceByUserId(this.id);
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

  // initialize slider
  myApp.SliderCtrl.initialize();

});


