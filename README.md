# transaction-mappr

This is a [simple app](https://stark-shelf-3141.herokuapp.com/) with a clean interface for looking at correlations in a sample data set. The sample data set contains users, locations of users at certain times (like check-ins), and transactions.

The main parts of the interface include a slider bar for changing the date, options for filtering different types of transactions, and a list of transactions (if there are any on a given day) next to a Google Maps visualization.

The user is the common thread between transactions and locations, so I made all AJAX calls to one of two controllers in the User controller, which functions as an API.

Any time a type of transaction is selected ("earning", "charge", or "both"), get requests are made to `/result`. The controller API expects a params object to be sent in the format of this example: `{date: "2015-1-23", mode: "earning"}`. The controller renders a JSON response in the format `{transactions: {}, locations: {}}`, where each value is object mapping names of users to an array of their transactions/locations on the specified date. To keep these JSON objects lighter, the objects only include users who have transactions and/or locations on the given date.

The only other route is '/all', which returns a JSON response with the same format, but includes all records.

Most of the logic is located in app/assets/javascripts/maps.js. It contains a myApp variable with a number of controllers as properties. Many of the controllers are IIFE's to keep certain variables and functions private. For example, the AjaxCtrl has 6 main functions, but only one returned accessible function, AjaxCtrl.request().

Below the myApp object is a section for initial configurations on document ready. This initializes the map, makes a reference to it accessible via myApp, and binds all relevant events.

The User controller is designed similarly, with few public methods and a number of modular private helper methods.

Interactive features include the slider bar for changing date, the filters in the nav bar, and the map markers.