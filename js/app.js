/**
 * Main app.js for ReactJS Components
 */

var ProjectBoard = React.createClass({
  render: function() {
    return (
      <div className="projectBoard">
        Hello, world! I am a ProjectBoard.
      </div>
    );
  }
});

// ----- Render to the div ------- 
React.render(
  <ProjectBoard />,
  document.getElementById('project-board')
);