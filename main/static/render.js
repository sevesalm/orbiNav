$(function() { 
    "use strict";

    var objects = [];
    var points;
    var solution_euc;
    var solution_hops;
    var solution;
    var scene = new THREE.Scene();

    var red = new THREE.MeshBasicMaterial({color: 0xee4422});
    var blue = new THREE.MeshBasicMaterial({color: 0x5533dd, wireframe: true});
    var green = new THREE.MeshBasicMaterial({color: 0x22cc11});
    var white = new THREE.MeshBasicMaterial({color: 0xffffff});
    var lineMat = new THREE.LineBasicMaterial({color: 0xffffff, linewidth: 2});
    var lineMat2 = new THREE.LineBasicMaterial({color: 0xbb7766, linewidth: 1, opacity: 0.7, transparent: true});

    var renderer = Detector.webgl ? new THREE.WebGLRenderer({antialias: true}) : new THREE.CanvasRenderer({antialias: true});

    // Pass dummy values for fov and aspect ratio. Will be updated in set_viewport_size()
    var camera = new THREE.PerspectiveCamera(1, 1, 1000000, 40000000);
    camera.position.z = -20000000;

    set_viewport_size();
    $('#renderer').append(renderer.domElement);

    var earth = new THREE.Mesh(new THREE.SphereGeometry(6371000, 32, 32), blue);
    scene.add(earth);

    // Settings for mouse controls
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

    // Initial query
    generate();

    $.notifyDefaults({
        delay: 2000,
        animate: {
            enter: 'animated FailedIn',
            exit: 'animated slideOutRight'
        }
    });

    renderer.domElement.addEventListener('mouseover', onDocumentMouseOver, false);
    renderer.domElement.addEventListener('mouseleave', onDocumentMouseLeave, false);

    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener('orientationchange', onWindowResize, false);

    $('#gen_btn').click(generate);

    // Animation loop
    setInterval(function() {
        controls.update();
        render();
    }, 25);

    $('input:radio').change(function() {
            update_solution();
            update_info();
            update_renderer();
    });

    function onDocumentMouseOver(ev) {
        controls.autoRotateSpeed = 0.0;
    }

    function onDocumentMouseLeave(ev) {
        controls.autoRotateSpeed = 0.1;
    }

    function onWindowResize() {
        set_viewport_size();
        render();
    }

    // Delay added to handle slower/buggy machines/browsers
    function set_viewport_size() {
        var width = get_viewport_width();
        var height = get_viewport_height();
        camera.aspect = width / height;
        camera.fov = get_camera_fov(camera.aspect);
        camera.updateProjectionMatrix();
        renderer.setSize(width, height, true);
    }

    function get_viewport_width() {
        return $(window).innerWidth()*0.90;
    }

    function get_viewport_height() {
        return $(window).innerHeight() - $('#infopanel').outerHeight() - $(".navbar-header").outerHeight()-10;
    }

    // Make sure the scene is always visible (with default zoom)
    function get_camera_fov(aspect) {
        var C = 7800000/20000000;
        var vert_fov = 360*Math.atan(C)/Math.PI;
        var hor_fov = 360*Math.atan(C/aspect)/Math.PI;
        return Math.max(vert_fov, hor_fov);
    }

    function render() {
        renderer.render(scene, camera);
    }

    // Update the pointer to the selected solution
    function update_solution() {
        if ($('input[name=optradio]:checked').attr('id') === "radio_euc") {
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

            update_solution();
            update_info();
            set_viewport_size();
            update_renderer();
            $('#gen_btn').text("Generate new");
        }).fail(function() {
            $.notify({message: 'Failed to load data!'}, {type: 'danger'});
            $('#gen_btn').text("Generate new");
        });
    }

    // Updates textual info
    function update_info() {
        var result = [];

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
            $('#dist').empty();
        }
    }

    // Prevents some nasty memory leaks...
    function clear_scene() {
        while(objects.length) {
            var object = objects.pop();
            object.geometry.dispose();
            scene.remove(object);
        }
    }

    // Creates a new scene object and populates it
    function update_renderer() {
        clear_scene();

        $.each(points, function(idx, val) {
            var color = red;
            if(idx === 0) {
                color = green;      // Start node
            }
            else if(idx === 1) {
                color = white;    // End node
            }
            var node = new THREE.Mesh(new THREE.SphereGeometry(100000, 8, 8), color);
            objects.push(node);
            translate_to(node, val);
            scene.add(node);
        });

        // Draw line segments. Solution segments with different color
        $.each(solution.graph, function(row, row_data) {
            $.each(row_data, function(col, val) {
                if(val === 1) {
                    connect(points[row], points[col], lineMat2);
                }
                else if(val === 2) {
                    connect(points[row], points[col], lineMat);
                }
            });
        });
        render();
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
        objects.push(line);
        scene.add(line);
    }
});