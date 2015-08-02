/**
 * ProjectBoard ReactJS Component.
 */

// For animations
var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

/* ======= ProjectBoard React =======*/
var ProjectBoard = React.createClass({displayName: "ProjectBoard",
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
        // Update with projects
        this.setState({
          projects: result,
        });

        this.setupDataTables();
      }
    }.bind(this));
  },
  componentDidUpdate: function(prevProps, prevState) {
    if ($('.projectBoard table').length && !$.fn.DataTable.isDataTable('#main-table')) {
      this.setupDataTables(searchEvent = false);
    }
  },
  update: function(newStatus, newStage, newName, i, callback) {
    var arr = this.state.projects;

    if (arr[i].status == newStatus && arr[i].stage == newStage) { // Do not update
      this.setState({canAdd: true});
      $('input[type=search]').attr('disabled', null)
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
        if (response.status == "success") {
          arr[i] = response.project;
          self.setState({
            projects: arr,
            canAdd: true,
            errors: errorList
          });
          $('input[type=search]').attr('disabled', null);
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

    $('input[type=search]').attr('disabled', 'disabled');
  },
  cancelAdd: function() {
    this.state.projects.pop();
    this.setState({
      canAdd: true
    });    
    $('input[type=search]').attr('disabled', null)
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
  setupDataTables: function(searchEvent) {
    // Datatables
    var self = this;
    if ($('#main-table').length) {
      mainTable = $('#main-table').dataTable({
        "bAutoWidth": false,
        "bDestroy": true,
        paging: false
      });

      if (typeof searchEvent != "undefined" || !searchEvent) {
        mainTable.on('search.dt', function(){
          var currentSearch = mainTable.api().search();
          self.setState({
            canAdd: (currentSearch == "")
          });
        });
      }
    }
  },
  renderDetailView: function(errors) {
    var rows = [];
    var errorDisplay = "";

    // Construct Error Display
    if (this.state.errors.length) {
      errorDisplay = React.createElement("div", {className: "alert alert-danger"}, errors);
    }

    var self = this;
    this.state.selectedProjectDetails.forEach(function(status, i) {
        rows.push(React.createElement(StatusRow, {
          status: status, 
          index: i, 
          key: status.status + status.lastUpdated}
        ));
    });    

    return (
      React.createElement(ReactCSSTransitionGroup, {transitionName: "detailedBoard", transitionAppear: true}, 
        React.createElement("div", {className: "projectBoard", key: "detailed-view"}, 
          React.createElement("a", {title: "Return to View All", onClick: this.returnToViewAll, className: "btn btn-danger pull-right return-btn glyphicon glyphicon-triangle-left"}), 
          React.createElement("h3", null, this.state.selectedProject.name, " - Project History"), 
          errorDisplay, 
          React.createElement("table", {className: "table table-striped table-bordered table-hover"}, 
              React.createElement("thead", null, 
                  React.createElement("tr", null, 
                      React.createElement("th", {className: "stage"}, "Stage"), 
                      React.createElement("th", {className: "status"}, "Status"), 
                      React.createElement("th", {className: "updated"}, "Updated")
                  )
              ), 
              React.createElement("tbody", null, rows)
          )
        )
      )
    );
  },
  render: function() {
    var errors = [];
    var rows = [];
    self = this;
    this.state.errors.forEach(function(error, i) {
        errors.push(React.createElement("span", null, "- ", React.createElement("strong", null, error.field), " ", error.msg, React.createElement("br", null)));
    });

    // Render Detail View
    if (this.state.detailView) {
      return this.renderDetailView(errors);
    }

    // Otherwise, continue to get status fo each project.
    this.state.projects.forEach(function(project, i) {
        rows.push(React.createElement(ProjectRow, {
          project: project, 
          index: i, 
          onChange: self.update, 
          showDetails: self.showDetails, 
          removeProject: self.remove, 
          cancelAdd: self.cancelAdd, 
          addErrorMessage: self.setError, 
          newProject: typeof project.id == "undefined", 
          editingState: self.state.editingProjects, 
          key: project.name}
        ));
    });
    var addButton = "";
    if (this.state.canAdd) {
      addButton = React.createElement("a", {onClick: this.add, className: "btn btn-success pull-right add-btn glyphicon glyphicon-plus"});
    }
    var errorDisplay = "";
    if (this.state.errors.length) {
      errorDisplay = React.createElement("div", {className: "alert alert-danger"}, errors);
    }
    return (
      React.createElement(ReactCSSTransitionGroup, {transitionName: "mainBoard", transitionAppear: true}, 
        React.createElement("div", {className: "projectBoard", key: "main-view"}, 
          errorDisplay, 
          React.createElement("table", {className: "table table-striped table-bordered table-hover", id: "main-table"}, 
              React.createElement("thead", null, 
                  React.createElement("tr", null, 
                      React.createElement("th", {className: "name"}, "Project Name"), 
                      React.createElement("th", {className: "stage"}, "Stage"), 
                      React.createElement("th", {className: "status"}, "Current Status")
                  )
              ), 
              React.createElement("tbody", null, rows)
          ), 
          addButton
        )
      )
    );
  }
});