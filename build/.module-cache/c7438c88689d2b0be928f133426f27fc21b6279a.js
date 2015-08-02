/**
 * Main app.js for ReactJS Components
 */

React.render(
  React.createElement(ProjectBoard, {source: "web/projects"}),
  document.getElementById('project-board')
);