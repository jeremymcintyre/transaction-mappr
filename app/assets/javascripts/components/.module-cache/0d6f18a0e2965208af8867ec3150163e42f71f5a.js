//= require react
//= require components/app

$(document).ready(function() {
  React.render(React.createElement(SliderCtrl, null), $('#slider-wrapper')[0])
})