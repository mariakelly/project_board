/* ======= StatusRow React ========*/
var StatusRow = React.createClass({displayName: "StatusRow",
  render: function() {
    var status = this.props.status.status.replace(/\n\r?/g, '<br />');
    var status = status.replace(/TODO?/g, '<mark>TODO</mark>');    
    return (
        React.createElement("tr", null, 
            React.createElement("td", {className: "stage"}, this.props.status.stage), 
            React.createElement("td", {className: "status"}, 
              React.createElement("div", {dangerouslySetInnerHTML: {__html:status}})
            ), 
            React.createElement("td", {className: "updated"}, this.props.status.lastUpdated, " by ", React.createElement("u", null, this.props.status.lastUpdatedBy))
        )
    );
  }
});