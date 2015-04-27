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
      $('#results')
        .append(
          '<div id="no-trans-notification" class="result">' +
            'There is no transaction data of the selected type for this date' +
          '</div>'
        );
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

      toggleBounce: function() {
        this.getAnimation() !== null ?
        this.setAnimation(null) :
        this.setAnimation(google.maps.Animation.BOUNCE);
      },


      informNoLocationData: function() {
        $('#results')
            .append(
              '<div id="no-loc-notification" class="result">' +
                'There is no location data for this person on this date' +
              '</div>'
            );
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
      }

    });
  },


  Controller: function(model, view) {

    function _toggleBounceByUserId(userId) {
      var markersWithId = model.getMarkersByUserId(userId);
      if (markersWithId) {
        for (var i=0, len = markersWithId.length; i < len; i++) {
          view.toggleBounce.call(markersWithId[i]);
        }
      }
    }

    function _locationResponseHandler(locations) {
      for (var property in locations) {
        if (locations.hasOwnProperty(property)) {
          view.setMarkers(locations[property]);
        }
      }
    }

    function _bindListItemEventHandlers() {
      $('.result').click(function() {
        if (model.getMarkersByUserId(this.id))
          _toggleBounceByUserId(this.id);
      });

      $('.result').on('mouseenter', function() {
        if (!(model.getMarkersByUserId(this.id)) &&
          (this.id !== "no-trans-notification"))
          view.informNoLocationData();
      });

      $('.result').on('mouseleave', function() {
        $('#no-loc-notification').remove();
      });
    }

    function _transactionsResponseHandler(transactions) {
      var html = "";

      view.clearList();

      for (var userInfo in transactions) {
        if (transactions.hasOwnProperty(userInfo)) {
          var usersTransactions = transactions[userInfo],
              amounts = view.formatCurrency(usersTransactions),
              userInfoArray = JSON.parse(userInfo),
              userId = userInfoArray[0],
              userName = userInfoArray[1],
              opacityClass = _getOpacityClass(usersTransactions);

          html += view.newTransactionListItem(
            userId,
            opacityClass,
            userName,
            amounts);
        }
      }

      view.displayList(html);
      _bindListItemEventHandlers();

    }

    var _responseHandler = function(response) {
      _locationResponseHandler(response.locations);
      _transactionsResponseHandler(response.transactions);
    };

    var _getRequestFactory = function(data, url) {
      $.ajax({
        type: 'GET',
        url: url,
        data: data
      }).success(_responseHandler);
    };

    // the results returned at any time aren't huge, so this is okay
    var _getOpacityClass = function(group) {
      var total = 0;
      for (var i=0, len = group.length; i<len; i++) {
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

    var _makeRequest = function() {
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
        event.preventDefault();
        // From UX perspective,
        // makes sense to clear current markers when changing filter
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




