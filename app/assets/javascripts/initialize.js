/*
*
* Initial configuration takes care of the following on document ready:
*
*   * Initializes the map with proper coordinates and zoom.
*
*   * Stores a reference to the map in the myApp object.
*
*   * Binds event handlers to the filters and date
*
*   * Uses the event handlers to set the initial filter to 'charge', so the
*       user does not have to select one in order to begin using the app.
*
*
* -----------------------------------------------------------------------
*/

$(document).ready(function() {
  var model = myApp.Model(),
      view = myApp.View(model),
      ctrl = myApp.Controller(model, view);

  function initializeMap() {
    var mapOptions = {

      center: new google.maps.LatLng(35.896838, -117.948875),
      zoom: 5
    };
    // capture 'map' in scope for use in making markers
    myApp.map = new google.maps.Map(document.getElementById('map-canvas'),
      mapOptions);

  }

  google.maps.event.addDomListener(window, 'load', initializeMap);


  // Event Listener binding

  var filterText = $('nav a'),
      dateText = $('#date').text;

  filterText.on('click', ctrl.setFilter);

  filterText.on('click', function(event) {
    filterText.removeClass("active");
    $(event.target).addClass("active");
  });

  $(dateText).on('change', ctrl.request);


  // set initial filter to "charge" using bound handlers
  $('nav a:contains("CHARGE")').trigger('click');

});