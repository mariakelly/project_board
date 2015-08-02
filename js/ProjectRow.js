/* ======= ProjectRow React =======*/
var ProjectRow = React.createClass({
  getInitialState: function() {
    if (this.props.newProject) {
      return {
        editingName: true,
        editing: true,
        saving: false
      };
    }
    return {
      editingName: false,
      editing: false
    };
  },
  componentWillMount: function() {
    this.stageChoices = ["In Specs", "In Dev", "In Test", "Maintenance", "In Updates", "On Hold"];
  },
  componentDidUpdate: function(prevProps, prevState) {
    if (this.state.editingName) {
      this.refs.newStatus.getDOMNode().focus();
    }
  },
  edit: function() {
      this.setState({editing:true});
  },
  save: function() {
    var newName = (typeof this.refs.newName == "undefined") ? undefined : this.refs.newName.getDOMNode().value;
    this.setState({
      saving: true
    });

    var self = this;
    var success = this.props.onChange(this.refs.newStatus.getDOMNode().value, this.refs.newStage.getDOMNode().value, newName, this.props.index, function(){
      if (this.isMounted()) {        
        self.setState({
          saving: false,
          editingName: false, 
          editing: false          
        });
      }
    }.bind(this));
  },
  showDetails: function() {
    this.props.showDetails(this.props.index);
  },
  cancelEdit: function() {
      if (typeof this.props.project.id == "undefined") {
        this.props.cancelAdd(this.props.index);
      }
      this.setState({
        editingName: false, 
        editing:false
      });
  },
  confirmArchive: function() {
    var self = this;
    bootbox.confirm({
      title: "Archive Project",
      message: "Are you sure you want to archive <strong>"+self.props.project.name+"</strong>?<br><br>This action cannot be undone.", 
      buttons: {
        confirm: {
          className: "btn-danger",
          label: "<span class='glyphicon glyphicon-trash'></span>&nbsp;Archive"
        }
      },
      callback: function(result) {
        if (result) {
          $.post("web/projects/archive", {project: self.props.project}, function(response){
            if (response.status != "error") {
              self.props.removeProject(self.props.index);
            } else {
              self.props.addErrorMessage(response.errorMessage);
            }
          }).fail(function(){ 
            self.props.addErrorMessage("An error occurred while trying to archive the project (ERR: 500).");
          });
        }
      }
    }); 
  },
  formatDate: function(timestamp) {
    var d = new Date(timestamp);
    var n = d.getHours();
    var h = (n > 12) ? n - 12 : n;
    var a = (n < 11) ? "am" : "pm";

    return (d.getMonth()+1) + "-" + d.getDate() + "-" + d.getFullYear() + ", " + h + ":" + d.getMinutes() + a;
  },
  renderStage: function() {
    if (this.state.editing) {
      var optionNodes = this.stageChoices.map(function(option){
        return <option key={option} value={option}>{option}</option>;
      });
      return (
        <td className="stage">
          <select ref="newStage" className="form-control" defaultValue={this.props.project.stage}>
            {optionNodes}
          </select>
        </td>
      );
    } else if (this.state.saving) {
      return <td className="stage"></td>
    } else {
      return (
        <td className="stage">
          {this.props.project.stage}
        </td>
      );
    }
  },
  renderStatus: function() {
    if (this.state.editing) {
      return (
        <td className="status">
          <textarea ref="newStatus" defaultValue={this.props.project.status} className="form-control"></textarea>
          <div className="actions">
            <a title="Cancel" onClick={this.cancelEdit} className="btn btn-danger btn-xs pull-right glyphicon glyphicon-remove"></a>
            <a title="Save" onClick={this.save} className="btn btn-primary btn-xs pull-right glyphicon glyphicon-floppy-disk"></a>
          </div>
        </td>
      );
    } else if (this.state.saving) {
      return (
        <td className="status status-saving">
          <button className="btn btn btn-primary">
            <span className="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span> Saving...
          </button>
        </td>
      );
    } else {
      var lastUpdated = this.formatDate(this.props.project.lastUpdated);
	    lastUpdated = this.props.project.lastUpdated;
      var status = this.props.project.status.replace(/\n\r?/g, '<br />');
      var status = status.replace(/TODO?/g, '<mark>TODO</mark>');

      return (
        <td className="status">
          <div className="actions">
            <a title="Archive Project" onClick={this.confirmArchive} className="btn btn-danger btn-xs pull-right edit-btn glyphicon glyphicon-trash"></a>
            <a title="Edit Status" onClick={this.edit} className="btn btn-warning btn-xs pull-right edit-btn glyphicon glyphicon-pencil"></a>
            <a title="View History" onClick={this.showDetails} className="btn btn-success btn-xs pull-right edit-btn glyphicon glyphicon-list"></a>
          </div>
          <div key={this.props.project.name+'-status'} dangerouslySetInnerHTML={{__html:status}}></div>
          <small className="pull-right">last updated: {lastUpdated} by <u>{this.props.project.lastUpdatedBy}</u></small>
        </td>
      );
    }
  },
  render: function() {
    var nameCell
    if (this.state.editingName) {
      nameCell = <input ref="newName" defaultValue={this.props.project.name} className="form-control" />;
    } else {
      nameCell = this.props.project.name;
    }

    var savingRow = this.state.saving ? <div className="savingRow"></div> : null;

    return (
        <tr onDoubleClick={this.edit}>
            <td className="name">{nameCell}</td>
            {this.renderStage()}
            {this.renderStatus()}
        </tr>
    );
  }
});