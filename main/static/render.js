
var points = [];
var start = [];
var end = [];
var solution_euc = []
var solution_hops = []
var solution = [];
var graph = [];
var scene = new THREE.Scene();

var red = new THREE.MeshBasicMaterial( {color: 0xee4422});
var blue = new THREE.MeshBasicMaterial( {color: 0x5533dd, wireframe: true});
var green = new THREE.MeshBasicMaterial( {color: 0x22cc11});
var white = new THREE.MeshBasicMaterial( {color: 0xffffff});
var lineMat = new THREE.LineBasicMaterial({color: 0xffffff, linewidth: 2})
var lineMat2 = new THREE.LineBasicMaterial({color: 0xbb7766, linewidth: 1, opacity: 0.7, transparent: true})

var renderer = new THREE.WebGLRenderer({antialias: true}); 

var WIDTH = get_viewport_width(), HEIGHT=get_viewport_height();
var VIEW_ANGLE = 43, ASPECT = WIDTH/HEIGHT, NEAR = 100, FAR = 100000000;

var camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
camera.position.z = -20000000;

renderer.setSize(WIDTH, HEIGHT, true);
$('#renderer').append(renderer.domElement);

renderer.domElement.addEventListener('mouseover', onDocumentMouseOver, false);
renderer.domElement.addEventListener('mouseleave', onDocumentMouseLeave, false);

var controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableZoom = true;
controls.enablePan = false;
controls.rotateSpeed = 0.1;
controls.autoRotate = true;
controls.minDistance = 10000000;
controls.maxDistance = 30000000;
controls.enableDamping = true;
controls.dampingFactor = 0.1;
controls.autoRotateSpeed = 0.1;
controls.addEventListener('change', render);

generate();

$.notifyDefaults({
	delay: 2000,
	animate: {
		enter: 'animated FailedIn',
		exit: 'animated slideOutRight',
	}
});

window.addEventListener( 'resize', onWindowResize, false );
window.addEventListener( 'orientationchange', onWindowResize, false );

setInterval(function() {
	controls.update();
	render();
}, 25);

$('input:radio').change(function(){
        update_solution();  
        update_info();
        update_renderer();
    }
);  

function onDocumentMouseOver(ev) {
	controls.autoRotateSpeed = 0.0;
}

function onDocumentMouseLeave(ev) {
	controls.autoRotateSpeed = 0.1;
}

function onWindowResize(){
	set_viewport_size();
	render();
}

function set_viewport_size() {
	var width = get_viewport_width();
	var height = get_viewport_height();
	camera.aspect = width / height;
	camera.updateProjectionMatrix();
	renderer.setSize( width, height, true );
}

function get_viewport_width() {
	return window.innerWidth*0.9;
}

function get_viewport_height() {
	return window.innerHeight-$('#infopanel').height()-100;
}

function render() {
	renderer.render(scene, camera);
};

// Update the pointer to the selected solution
function update_solution() {
	if($('input[name=optradio]:checked').attr('id') == "radio_euc") {
		solution = solution_euc;
	}
	else {
		solution = solution_hops;
	}
}

// AJAX request for server to get a solution for a new problem.
// Displays alert if AJAX fails.
function generate() {
	$('#gen_btn').html('<i class="fa fa-refresh fa-spin fa-1x fa-fw margin-bottom"></i> Generating...');
	$.get("/generate/", function(data) {
		$('#seed').text("Seed: " + data.seed);
		solution_euc = data.euc;
		solution_hops = data.hops;
		points = $.makeArray(data.points);
		start = points[0];
		end = points[1];

		update_solution();
		update_info();
		set_viewport_size();
		update_renderer();
		$('#gen_btn').text("Generate new");
	}).fail(function() {
		$.notify(
			{message: 'Failed to load data!'}, 
			{type: 'danger'});
		$('#gen_btn').text("Generate new");
	});
}

function update_info() {
	var result = []

	$.each(solution.solution, function(idx, val) {
		result.push("SAT" + val);
	});

	if(solution.hops > 0) {
		$('#solution').text("Solution: " + result);
		$('#hops').text("Hops: " + (solution.hops));
		$('#dist').text(", distance: " + (Math.round(solution.distance*0.001)) + " km");
	}
	else {
		$('#solution').text("No solution possible!");
		$('#hops').empty();
		$('#dist').empty()
	}
}

// Creates a new scene object and populates it 
function update_renderer() {
	scene = new THREE.Scene();
	//scene.fog = new THREE.Fog(0x000000, 20000000, 30000000);
	var earth = new THREE.Mesh(new THREE.SphereGeometry(6371000, 32, 32), blue);
	scene.add(earth);

	$.each(points, function(idx, val) {
		if(idx < 2)
			return true;
		var node = new THREE.Mesh(new THREE.SphereGeometry(100000, 12, 12), red)
		translate_to(node, val);
		scene.add(node);
	});

	var node = new THREE.Mesh(new THREE.SphereGeometry(100000, 12, 12), green)
	translate_to(node, start);
	scene.add(node);

	var node = new THREE.Mesh(new THREE.SphereGeometry(100000, 12, 12), white)
	translate_to(node, end);
	scene.add(node);

	// Draw line segments. Solution with different color
	$.each(solution.graph, function(row, row_data) {
		$.each(row_data, function(col, val) {
			if(val == 1) {
				connect(points[row], points[col], lineMat2);
			}
			else if(val==2) {
				connect(points[row], points[col], lineMat);
			}
		})
	})
	renderer.render(scene, camera);
}

function translate_to(obj, coord) {
	obj.position.x = coord[0];
	obj.position.y = coord[1];
	obj.position.z = coord[2];
}

function connect(start, end, material) {
	var geometry = new THREE.Geometry();
	geometry.vertices.push(
		new THREE.Vector3(start[0], start[1], start[2]),
		new THREE.Vector3(end[0], end[1], end[2])
	);
	var line = new THREE.Line(geometry, material);
	scene.add(line);
}