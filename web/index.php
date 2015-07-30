<?php

use Symfony\Component\HttpFoundation\Request;

require_once __DIR__.'/../vendor/autoload.php';

$app = new Silex\Application();

$app['debug'] = true;

//configure database connection
$app->register(new Silex\Provider\DoctrineServiceProvider(), array(
    'db.options' => array(
        'driver' => 'pdo_mysql',
        'host' => 'localhost',
        'dbname' => 'projects',
        'user' => 'projectdbuser',
        'password' => 'VEqdudsFvUBR677R',
        'charset' => 'utf8',
    ),
));

// define route for /projects
$app->get('/projects', function () use ($app) {
	$sql = "SELECT p.id, p.name, s.stage, s.status, s.lastUpdated, s.lastUpdatedBy 
		FROM status s join project p ON p.id = s.project_id
		WHERE s.lastUpdated = (
		  SELECT max(lastUpdated) 
		  from status
		  WHERE project_id = s.project_id
		)";

	$projects = $app['db']->fetchAll($sql);

	return $app->json($projects);
});

// define route for /projects/{id}
$app->get('/projects/{id}', function ($id) use ($app) {
  $sql = "SELECT * FROM project WHERE id = ? and isDeleted = 0 ORDER BY name";
  $project = $app['db']->fetchAssoc($sql, array((int) $id));

  return $app->json($project);
})->assert('id', '\d+');

// Route for updating status of project
$app->post('/projects/update', function (Request $request) use ($app) {
	$project = $request->get('project');

	/** ==== New Project ====== */
	if ($project['id'] == 'new') { 
		try {
			// Insert new project
			$app['db']->insert('project', array(
				'name' => $project['name']
			));

			// Get generated Project ID
			$id = $app['db']->fetchColumn("SELECT id FROM project WHERE name = ?", array($project["name"]));
			$project['project_id'] = $id;

			// Insert new status
			$rowData = getStatusRowForData($project);
			$app['db']->insert('status', $rowData);			
		} catch (\Exception $e) {
			return $app->json(array("status" => "error", "errorMessage" => $e->getMessage()));
		}
	}

	/* ==== Existing Project ===== */
	// Get generated ID
	$project['project_id'] = $project['id']; // This is the id of the project.

	// Insert new status
	$rowData = getStatusRowForData($project);
	$app['db']->insert('status', $rowData);

	// Return successful update
	return $app->json(array(
		'status' => 'success',
		'id' => $project['project_id'],
	));
});

// Archive project
$app->post('/projects/archive', function (Request $request) use ($app) {
	echo "<pre>"; var_dump($request->get('project')); die;
});

// default route
$app->get('/', function () {
  return "List of available methods:<br>
  - /projects - returns list of existing projects;<br>
  - /projects/{id} - returns project's data by id;";
});

/**
 * Generate the required status row data for the
 * given $projectData (contains keys for: 'stage' and 'status')
 */
function getStatusRowForData($projectData)
{
	$statusData = array(
		'project_id' => $projectData['project_id'],
		'stage' => $projectData['stage'],
		'status' => $projectData['status'],
	);

	return array_merge($statusData, array(
		'lastUpdated' => date("Y-m-d H:i:s"),
		'lastUpdatedBy' => 'admin',
	));
}


$app->run();
