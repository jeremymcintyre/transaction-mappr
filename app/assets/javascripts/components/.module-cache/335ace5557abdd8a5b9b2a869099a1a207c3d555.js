
var SliderControl = React.createClass({

  getInitialState:function(){
    return {
      slider:30
    }
  },
  componentDidMount:function(){
    var previousValue = this.state.slider;
    // after React component has a DOM representation, add listener
    $('#slider').on('change', function() {
      var daysToAdd = parseInt($(this).val()) - previousValue,
          date = new Date($('#date').text()),
          formattedDate;

      // Updates
      previousValue += daysToAdd;
      date = new Date(date.setDate(date.getDate() + daysToAdd + 1));
      // Pre-formatting and padding
      var month = (date.getMonth() + 1);
      month = (month < 10) ? ("0" + month) : (month).toString();
      var day = date.getDate();
      day = (day < 10) ? ("0" + day) : (day).toString();

      formattedDate = date.getFullYear() + '-' + month + '-' + day;
      $('#date').text(formattedDate);
    });
  },
  update:function() {
    this.setState({
      slider:this.refs.slider.refs.range.getDOMNode().value,
    });
  },
  render:function() {
    return (
      <div>
        <Slider ref="slider" update={this.update} />
        <label id="label">{this.state.slider}</label>
      </div>
    );
  }
});

var Slider = React.createClass({
  render:function(){
    return (
        <input id="slider" ref="range" type="range" step="1" min="0" max="60" onChange={this.props.update} />
    );
  }
})