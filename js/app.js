/**
 * Main app.js for ReactJS Components
 */

/* ======= ProjectRow React =======*/
var ProjectRow = React.createClass({
  getInitialState: function() {
    return {editing: false}
  },
  componentWillMount: function() {
    this.stageChoices = ["In Specs", "In Dev", "In Test", "Maintenance", "In Updates", "On Hold"];
  },
  componentWillReceiveProps: function(nextProps) {
    if (!nextProps.editingState || !nextProps.editing) {
      this.setState({editing:false});
    }
  },
  edit: function() {
      this.setState({editing:true});
  },
  save: function() {
      this.props.onChange(this.refs.newStatus.getDOMNode().value, this.refs.newStage.getDOMNode().value, this.props.index);
      this.setState({editing:false});
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
          <a onClick={this.save} className="btn btn-success btn-xs pull-right glyphicon glyphicon-floppy-disk"></a>
        </td>
      );
    } else {
      return (
        <td className="status">
          <a className="btn btn-warning btn-xs pull-right edit-btn glyphicon glyphicon-pencil"></a>
          {this.props.project.status}<br />
          <small className="pull-right">last updated: {this.props.project.lastUpdated}</small>
        </td>
      );
    }
  },
  render: function() {
    return (
        <tr onDoubleClick={this.edit}>
            <td className="name">{this.props.project.name}</td>
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
      editingProjects: false,
      projects: this.props.projects,
    }
  },
  update: function(newStatus, newStage, i) {
    var arr = this.state.projects;
    arr[i].status = newStatus;
    arr[i].stage = newStage;

    this.setState({projects:arr});
  },
  render: function() {
    var rows = [];
    self = this;
    this.state.projects.forEach(function(project, i) {
        rows.push(<ProjectRow 
          project={project} 
          index={i} 
          onChange={self.update} 
          editingState={self.state.editingProjects} 
          key={project.name}>
        </ProjectRow>);
    });
    return (
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
    );
  }
});

var PROJECTS = [
  {id: 1, name: 'APHD IPA', stage: 'In Dev', status: '- Prepping dev to go into production - Last step: Student import.\n- Next: Didi opens up access', lastUpdated:'7/21/15', updatedBy: 'jstewa'},
  {id: 2, name: 'EBPC Judging', stage: 'In Updates', status: '- Scope/spec meeting with Bobbi and Brad scheduled for 7/29.', lastUpdated:'7/21/15', updatedBy: 'jstewa'},
  {id: 3, name: 'Web - Newsroom', stage: 'In Dev', status: 'Status status status.', lastUpdated:'7/21/15', updatedBy: 'mariakel'},
  {id: 4, name: 'CPRE - Knowledge Hub', stage: 'In Specs', status: 'Status status status.', lastUpdated:'7/21/15', updatedBy: 'mariakel'},
  {id: 5, name: 'RISE - Shaun Harper', stage: 'On Hold', status: 'Status status status.', lastUpdated:'7/21/15', updatedBy: 'mariakel'},
  {id: 6, name: 'SDP Surveys', stage: 'In Specs', status: 'Status status status.', lastUpdated:'7/21/15', updatedBy: 'mariakel'},
  {id: 7, name: 'OGAP - Fractions', stage: 'In Updates', status: '- Plan to deploy to prod next week. Training begins 8/10.', lastUpdated:'7/21/15', updatedBy: 'akies'},
];

// ----- Render to the div ------- 
React.render(
  <ProjectBoard projects={PROJECTS} />,
  document.getElementById('project-board')
);