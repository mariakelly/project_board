/**
 * Main app.js for ReactJS Components
 */

/* ======= ProjectRow React =======*/
var ProjectRow = React.createClass({
  getInitialState: function() {
    if (this.props.newProject) {
      return {
        editingName: true,
        editing: true
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
  // componentWillReceiveProps: function(nextProps) {
  //   if (!nextProps.editingState || !nextProps.editing) {
  //     this.setState({editing:false});
  //   }
  // },
  componentDidUpdate: function(prevProps, prevState) {
    console.log(this.props.project.id, 'componentDidUpdate');
    if (this.state.editingName) {
      this.refs.newStatus.getDOMNode().focus();
    }
  },
  edit: function() {
      this.setState({editing:true});
  },
  save: function() {
      var newName = (typeof this.refs.newName == "undefined") ? undefined : this.refs.newName.getDOMNode().value;
      var success = this.props.onChange(this.refs.newStatus.getDOMNode().value, this.refs.newStage.getDOMNode().value, newName, this.props.index);
      if (success) {
        this.setState({
          editingName: false, 
          editing:false
        });
      }
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
          <a onClick={this.save} className="btn btn-primary btn-xs pull-right glyphicon glyphicon-floppy-disk"></a>
        </td>
      );
    } else {
      var lastUpdated = this.formatDate(this.props.project.lastUpdated);
	  lastUpdated = this.props.project.lastUpdated;
      var status = this.props.project.status.replace(/\n\r?/g, '<br />');
      var status = status.replace(/TODO?/g, '<mark>TODO</mark>');
      return (
        <td className="status">
          <a className="btn btn-danger btn-xs pull-right edit-btn glyphicon glyphicon-trash"></a>
          <a onClick={this.edit} className="btn btn-warning btn-xs pull-right edit-btn glyphicon glyphicon-pencil"></a>
          <div dangerouslySetInnerHTML={{__html:status}}></div>
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
  update: function(newStatus, newStage, newName, i) {
    var arr = this.state.projects;
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
      $.post("web/index.php/projects/update", {project: arr[i]}, function(response){
        console.log(arr[i]);
        console.log('Update Response: ', response);
      });
      this.setState({
        projects: arr,
        canAdd: true,
        errors: errorList
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
      canAdd: false,
    });
  },
  remove: function() {
  },
  render: function() {
    var errors = [];
    var rows = [];
    self = this;
    this.state.errors.forEach(function(error, i) {
        errors.push(<span>- <strong>{error.field}</strong> {error.msg}<br /></span>);
    });
    this.state.projects.forEach(function(project, i) {
        rows.push(<ProjectRow 
          project={project} 
          index={i} 
          onChange={self.update}
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
      <div className="projectBoard">
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
  <ProjectBoard source="web/index.php/projects" />,
  document.getElementById('project-board')
);