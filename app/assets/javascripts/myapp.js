/*
*   Behavior for the slider component is located in:
*     app/assets/javascripts/components/react-slider.js
*/


var myApp = {

  Model: function() {
    var _markers = {};

    return ({

      getMarkers: function() {return _markers; },

      getMarkersByUserId: function(userId) {
        return (
          _markers[userId] ?
          _markers[userId] :
          false
        );
      },

      storeMarkerById: function(userId, marker) {
        _markers[userId] ?
        _markers[userId].push(marker) :
        _markers[userId] = [marker]
      },

      clearMarkerData: function() { _markers = {}; }

    });
  },



  View: function(model) {

    function _createMarker(LatLng, userId){
      var map = myApp.map;
      var marker = new google.maps.Marker({
            position: LatLng,
            animation: google.maps.Animation.DROP,
            map: map
          });
      // store in markers object for easy removal by batch
      model.storeMarkerById(userId, marker);
    }

    function _informNoTransactionData() {
      $('<div id="no-trans-notification" class="result" style="opacity:0;">' +
          'There is no transaction data of the selected type for this date' +
        '</div>')
      .appendTo('#results').fadeTo(600, 1);
    }

    function _informNoLocationData() {
      $('<div id="no-loc-notification" class="result" style="opacity:0;">' +
            'There is no location data for this person on this date' +
          '</div>')
      .appendTo('#results').fadeTo(600, 1);
    }

    function _toggleBounce() {
      this.getAnimation() !== null ?
      this.setAnimation(null) :
      this.setAnimation(google.maps.Animation.BOUNCE);
    }

    function _toggleBounceByUserId(userId) {
      var markersWithId = model.getMarkersByUserId(userId);
      if (markersWithId) {
        for (var i=0, len = markersWithId.length; i < len; i++) {
          _toggleBounce.call(markersWithId[i]);
        }
      }
    }

    return ({

      setMarkers: function(locations) {
        for (var i = 0, len = locations.length; i < len; i++) {
          var loc = locations[i],
              position = new google.maps.LatLng(loc.latitude, loc.longitude),
              marker = _createMarker(position, loc.user_id);
        }
      },

      clearMarkers: function() {
        var markers = model.getMarkers();

        for (var userId in markers) {
          if (markers.hasOwnProperty(userId)) {
            var currentSet = markers[userId],
                len = currentSet.length;
            for (var i=0; i < len; i++) {
              currentSet[i].setMap(null);
            }
          }
        }
      },

      formatCurrency: function(transactions) {
        return (transactions.map(
          function(transaction) {
            return "$" + transaction.amount;
        }));
      },

      clearList: function() {
        $('#results').html("");
      },

      newTransactionListItem: function(userId, opacityClass, userName, amounts) {
        return (
          "<div id=" + userId + " class='result " + opacityClass + "'>" +
            userName + " - " + amounts.join(", ") +
          "</div>"
        );
      },

      displayList: function(html) {
        if (html.length === 0) {
          _informNoTransactionData();
        } else {
          $('#no-trans-notification').remove();
          $('#results').append(html);
        }
      },

      bindListItemEventHandlers: function() {
        $('.result').click(function() {
          if (model.getMarkersByUserId(this.id))
            _toggleBounceByUserId(this.id);
        });

        $('.result').on('mouseenter', function() {
          if (!(model.getMarkersByUserId(this.id)) &&
             (this.id !== "no-trans-notification")) {
              _informNoLocationData();
          }
          else { $(this).css("cursor", "pointer"); }
        });

        $('.result').on('mouseleave', function() {
          $('#no-loc-notification').remove();
        });
      },

      colorOpacity: function(total) {
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
      }

    });
  },


  Controller: function(model, view) {

    function _locationResponseHandler(locations) {
      for (var property in locations) {
        if (locations.hasOwnProperty(property)) {
          view.setMarkers(locations[property]);
        }
      }
    }

    function _transactionsResponseHandler(transactions) {
      var html = [];

      view.clearList();

      for (var userInfo in transactions) {
        if (transactions.hasOwnProperty(userInfo)) {
          var usersTransactions = transactions[userInfo],
              amounts = view.formatCurrency(usersTransactions),
              userInfoArray = JSON.parse(userInfo),
              userId = userInfoArray[0],
              userName = userInfoArray[1],
              opacityClass = _getOpacityClass(usersTransactions);

          html.push(view.newTransactionListItem(
            userId,
            opacityClass,
            userName,
            amounts)
          );
        }
      }
      view.displayList(html.join(""));
      view.bindListItemEventHandlers();
    }

    function _responseHandler(response) {
      _locationResponseHandler(response.locations);
      _transactionsResponseHandler(response.transactions);
    };

    function _getRequestFactory(data, url) {
      $.ajax({
        type: 'GET',
        url: url,
        data: data
      }).success(_responseHandler);
    };

    // the results returned at any time aren't huge, so this is okay
    function _getOpacityClass(group) {
      var total = 0;
      for (var i=0, len = group.length; i<len; i++) {
        total += parseFloat(group[i].amount);
      }
      return view.colorOpacity(total);
    };

    function _makeRequest() {
      var filter = model.filter,
          date = $('#date').html();

      view.clearMarkers();
      model.clearMarkerData();

      if (filter !== "all") {
        _getRequestFactory({date: date, filter: filter}, '/results');
      } else if (filter === "all") {
        _getRequestFactory({}, '/all');
      }
    };

    return ({

      request: _makeRequest,

      setFilter: function(event) {
        // From UX perspective,
        // makes sense to clear markers when changing filter
        view.clearList();
        view.clearMarkers();
        model.clearMarkerData();

        var filter = this.innerHTML.toLowerCase();

        model.filter = filter;
        if (filter === "all")
          _makeRequest();
      }

    });
  }
};




