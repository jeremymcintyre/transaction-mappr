var NavFilters = React.createClass({
  getInitialState: function() {
    return { active: 0 };
  },

  setActive: function(index) {
    this.setState({active: index});
  },

  render: function() {
    var self = this;
    return (
      <nav>
        <p>FILTER TRANSACTIONS BY TYPE</p>
        <ul> {this.props.filters.map(function(filterName, index) {
          var style = "";

          if (self.state.focused == index)
            style = 'active';

          return (
            <li className={style} onClick={self.setActive.bind(self, index)} key={index}>
              {filterName}
            </li>
          )})}
        </ul>
      </nav>
    )
  }
})