/**
 * Main app.js for ReactJS Components
 */

var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

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
        console.log('callback was called after update');
        self.setState({
          saving: false,
          editingName: false, 
          editing: false          
        });
      });
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
            console.log('archive response', response);
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

/* ======= ProjectBoard React =======*/
var ProjectBoard = React.createClass({
  getInitialState: function() {
    return {
      canAdd: true,
      editingProjects: false,
      projects: [],
      errors: [],
      detailView: false,
      selectedProject: null,
      selectedProjectDetails: null
    }
  },
  componentDidMount: function() {
    $.getJSON(this.props.source, function(result) {
      if (this.isMounted()) {
        this.setState({
          projects: result,
        });
      }
    }.bind(this));
  },
  update: function(newStatus, newStage, newName, i, callback) {
    var arr = this.state.projects;

    if (arr[i].status = newStatus) { // Do not update
      console.log('status unchanged in update()');
      this.setState({canAdd: true});
      callback();

      return true;
    }

    arr[i].id = (typeof this.state.projects[i].id == "undefined") ? "new" : this.state.projects[i].id;
    arr[i].status = newStatus;
    arr[i].stage = newStage;
    var errorList = [];

    if (typeof newName != "undefined" && newName == "") {
      errorList.push({field: "Project Name", msg: "cannot be left blank"});
    } else if (typeof newName != "undefined") {
      arr[i].name = newName;
    }
    if (newStatus == "") {
      errorList.push({field: "Status", msg: "cannot be left blank"});
    }

    if (errorList.length) {
      this.setState({
        errors: errorList
      })
      return false;
    } else {
      var self = this;
      $.post("web/projects/update", {project: arr[i]}, function(response){
        console.log(arr[i]);
        console.log('Update Response: ', response);
        if (response.status == "success") {
          arr[i] = response.project;
          self.setState({
            projects: arr,
            canAdd: true,
            errors: errorList
          });
          callback();         
        }
      });

      return true;
    }
  },
  add: function() {
    var arr = this.state.projects;
    arr.push({
        name: "",
        stage: "In Specs",
        status: ""
    });

    this.setState({
      projects: arr, 
      canAdd: false
    });
  },
  cancelAdd: function() {
    this.state.projects.pop();
    this.setState({
      canAdd: true
    });    
  },
  remove: function(i) {
    var arr = this.state.projects;
    arr.splice(i, 1);
    this.setState({
      projects: arr
    });
  },
  addError: function(errorMsg) {
    var errors = this.state.errors;
    errors.push({msg: errorMsg});
    this.setState({
      errors: errors
    })
  },
  setError: function(errorMsg) { // Flash an error message
    var errors = [{msg: errorMsg}];
    this.setState({
      errors: errors
    });
    setTimeout(function(){
      self.setState({
        errors: []
      })
    }, 1500);
  },
  showDetails: function(i) {
    var self = this;
    $.get("web/projects/"+this.state.projects[i].id, function(response){
      self.setState({
        detailView: true,
        selectedProject: self.state.projects[i],
        selectedProjectDetails: response
      });
    });    
  },
  returnToViewAll: function() {
    this.setState({
      detailView: false,
      selectedProject: null,
      selectedProjectDetails: null
    });
  },
  renderDetailView: function(errors) {
    var rows = [];
    var errorDisplay = "";

    // Construct Error Display
    if (this.state.errors.length) {
      errorDisplay = <div className='alert alert-danger'>{errors}</div>;
    }

    var self = this;
    this.state.selectedProjectDetails.forEach(function(status, i) {
        rows.push(<StatusRow 
          status={status} 
          index={i} 
          key={status.status + status.lastUpdated}>
        </StatusRow>);
    });    

    return (
      <ReactCSSTransitionGroup transitionName="detailedBoard" transitionAppear={true}>      
        <div className="projectBoard" key="detailed-view">
          <a title="Return to View All" onClick={this.returnToViewAll} className="btn btn-danger pull-right return-btn glyphicon glyphicon-triangle-left"></a>
          <h3>{this.state.selectedProject.name} - Project History</h3>
          {errorDisplay}
          <table className="table table-striped table-bordered table-hover">
              <thead>
                  <tr>
                      <th className="stage">Stage</th>
                      <th className="status">Status</th>
                      <th className="updated">Updated</th>
                  </tr>
              </thead>
              <tbody>{rows}</tbody>
          </table>
        </div>
      </ReactCSSTransitionGroup>
    );
  },
  render: function() {
    var errors = [];
    var rows = [];
    self = this;
    this.state.errors.forEach(function(error, i) {
        errors.push(<span>- <strong>{error.field}</strong> {error.msg}<br /></span>);
    });

    // Render Detail View
    if (this.state.detailView) {
      return this.renderDetailView(errors);
    }

    // Otherwise, continue to get status fo each project.
    this.state.projects.forEach(function(project, i) {
        rows.push(<ProjectRow 
          project={project} 
          index={i} 
          onChange={self.update}
          showDetails={self.showDetails}
          removeProject={self.remove}
          cancelAdd={self.cancelAdd}
          addErrorMessage={self.setError}
          newProject={typeof project.id == "undefined"} 
          editingState={self.state.editingProjects} 
          key={project.name}>
        </ProjectRow>);
    });
    var addButton = "";
    if (this.state.canAdd) {
      addButton = <a onClick={this.add} className="btn btn-success pull-right add-btn glyphicon glyphicon-plus"></a>;
    }
    var errorDisplay = "";
    if (this.state.errors.length) {
      errorDisplay = <div className='alert alert-danger'>{errors}</div>;
    }
    return (
      <ReactCSSTransitionGroup transitionName="mainBoard" transitionAppear={true}>
        <div className="projectBoard" key="main-view">
          {errorDisplay}
          <table className="table table-striped table-bordered table-hover">
              <thead>
                  <tr>
                      <th className="name">Project Name</th>
                      <th className="stage">Stage</th>
                      <th className="status">Current Status</th>
                  </tr>
              </thead>
              <tbody>{rows}</tbody>
          </table>
          {addButton}
        </div>
      </ReactCSSTransitionGroup>
    );
  }
});

// var PROJECTS = [
//   {id: 1, name: 'APHD IPA', stage: 'In Dev', status: '- Prepping dev to go into production - Last step: Student import.\n- Next: Didi opens up access', lastUpdated:'7/21/15', updatedBy: 'jstewa'},
//   {id: 2, name: 'EBPC Judging', stage: 'In Updates', status: '- Scope/spec meeting with Bobbi and Brad scheduled for 7/29.', lastUpdated:'7/21/15', updatedBy: 'jstewa'},
//   {id: 3, name: 'Web - Newsroom', stage: 'In Dev', status: 'Status status status.', lastUpdated:'7/21/15', updatedBy: 'mariakel'},
//   {id: 4, name: 'CPRE - Knowledge Hub', stage: 'In Specs', status: 'Status status status.', lastUpdated:'7/21/15', updatedBy: 'mariakel'},
//   {id: 5, name: 'RISE - Shaun Harper', stage: 'On Hold', status: 'Status status status.', lastUpdated:'7/21/15', updatedBy: 'mariakel'},
//   {id: 6, name: 'SDP Surveys', stage: 'In Specs', status: 'Status status status.', lastUpdated:'7/21/15', updatedBy: 'mariakel'},
//   {id: 7, name: 'OGAP - Fractions', stage: 'In Updates', status: '- Plan to deploy to prod next week. Training begins 8/10.', lastUpdated:'7/21/15', updatedBy: 'akies'},
// ];

// ----- Render to the div ------- 
React.render(
  <ProjectBoard source="web/projects" />,
  document.getElementById('project-board')
);