/**
 * Main app.js for ReactJS Components
 */

var ProjectRow = React.createClass({
  render: function() {
    return (
        <tr>
            <td className="name">{this.props.project.name}</td>
            <td className="stage">{this.props.project.stage}</td>
            <td className="status">
            	{this.props.project.status}<br />
            	<small className="pull-right">last updated: {this.props.project.lastUpdated} by {this.props.project.updatedBy}</small>
        	</td>
        </tr>
    );
  }
});

var ProjectBoard = React.createClass({
  render: function() {
    var rows = [];
    this.props.projects.forEach(function(project) {
        rows.push(<ProjectRow project={project} key={project.name} />);
    });
    return (
        <table className="table table-striped table-bordered">
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
  {name: 'APHD IPA', stage: 'In Dev', status: '- Prepping dev to go into production - Last step: Student import.\n- Next: Didi opens up access', lastUpdated:'7/21/15', updatedBy: 'jstewa'},
  {name: 'EBPC Judging', stage: 'In Updates', status: '- Scope/spec meeting with Bobbi and Brad scheduled for 7/29.', lastUpdated:'7/21/15', updatedBy: 'jstewa'},
  {name: 'Web - Newsroom', stage: 'In Dev', status: 'Status status status.', lastUpdated:'7/21/15', updatedBy: 'mariakel'},
  {name: 'CPRE - Knowledge Hub', stage: 'In Specs', status: 'Status status status.', lastUpdated:'7/21/15', updatedBy: 'mariakel'},
  {name: 'RISE - Shaun Harper', stage: 'On Hold', status: 'Status status status.', lastUpdated:'7/21/15', updatedBy: 'mariakel'},
  {name: 'SDP Surveys', stage: 'In Specs', status: 'Status status status.', lastUpdated:'7/21/15', updatedBy: 'mariakel'},
  {name: 'OGAP - Fractions', stage: 'In Updates', status: '- Plan to deploy to prod next week. Training begins 8/10.', lastUpdated:'7/21/15', updatedBy: 'akies'},
];

// ----- Render to the div ------- 
React.render(
  <ProjectBoard projects={PROJECTS} />,
  document.getElementById('project-board')
);