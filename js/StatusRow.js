/* ======= StatusRow React ========*/
var StatusRow = React.createClass({
  render: function() {
    var status = this.props.status.status.replace(/\n\r?/g, '<br />');
    var status = status.replace(/TODO?/g, '<mark>TODO</mark>');    
    return (
        <tr>
            <td className="stage">{this.props.status.stage}</td>
            <td className="status">
              <div dangerouslySetInnerHTML={{__html:status}}></div>
            </td>
            <td className="updated">{this.props.status.lastUpdated} by <u>{this.props.status.lastUpdatedBy}</u></td>
        </tr>
    );
  }
});