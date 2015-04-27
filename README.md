# transaction-mappr

This is a [simple app](https://stark-shelf-3141.herokuapp.com/) with a clean interface for looking at correlations in a sample data set. The sample data set contains users, locations of users at certain times (like check-ins), and transactions.

The main parts of the interface include a ReactJS slider bar for changing the date, options for filtering different types of transactions, and a list of transactions (if there are any on a given day) next to a Google Maps visualization. Clicking on a transaction list item toggles a `BOUNCE` animation on the corresponding user's location markers. If no locations are available for that user on the selected date, mouseover events bring up a notification.

The user is the common thread between transactions and locations, so I made all AJAX calls to one of two controllers in the User controller, which functions as an API.

Any time a type of transaction is selected ("earning", "charge", or "both"), `GET` requests are made to `/results`. The controller API expects a params object to be sent in the format of this example: `{date: "2015-01-23", filter: "earning"}`. The controller renders a JSON response in the format `{transactions: {}, locations: {}}`, where each value is object mapping `[user.id, user.name]` sets to arrays of their transactions/locations on the specified date. To keep these JSON objects lighter, the objects only include users who have transactions and/or locations on the given date.

The only other route is `/all`, which returns a JSON response with the same format, but includes all records.

Most of the logic is located in `app/assets/javascripts/myapp.js`. It contains a `myApp` object with a Model, View, and Controller (MVC).

Initial configurations on document ready are set in `app/assets/javascripts/initialize.js`. This initializes the map, makes a reference to it accessible via `myApp`, and binds all relevant events.

Interactive features include the slider bar for changing date, the filters in the nav bar, and the map markers.