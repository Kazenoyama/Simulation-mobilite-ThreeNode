import * as THREE from 'three'; //Import of three js
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'; //Import of the orbital camera

import Table from '/src/js/table.js'; //Import of the Table class

/**
 * Create the scene and set its background color 
*/
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xfffffff);

/** 
 * Create the render and add it to the body of the html
*/
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

/**
 * Add an axes helper to the scene
 */

//const axesHelper = new THREE.AxesHelper(5);
//scene.add(axesHelper);


////////////////////////////////////////
/////////// CAMERA /////////////////////

/** 
 * Create a place holder for the camera, it is fixed in place and does not move
*/
const camera = new THREE.PerspectiveCamera( 
    75, 
    window.innerWidth / window.innerHeight, 
    0.1, 
    1000 
);

/**
 * Update the place holder camera for an orbital camera.
 * It can spin around a point with left-mouse click and move freely with right-mouse click 
 */
const orbit = new OrbitControls(camera, renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
controls.update();
orbit.update();


/**
 * Create the table and add it to the scene
 */
const table = new Table();
table.createTable();
scene.add(table.getTable());


// Add ambient light to the scene
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Soft white light
scene.add(ambientLight);

// Add directional light to the scene
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5); // White light
directionalLight.position.set(0, 1, 1).normalize();
scene.add(directionalLight);

//Create a fix camera
const camera2 = new THREE.PerspectiveCamera( 
    75, 
    window.innerWidth / window.innerHeight, 
    0.1, 
    1000 
);
var activeCamera = camera2;
camera2.position.set(0, 50,0);
camera2.lookAt(0,0,0);

////////////////////////////////////////
/////////// TEST ZONE //////////////////

var drawing = false;
var canDraw = true;
var listePoint = [];

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

function onMousePressed(event){
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, activeCamera);

    const intersects = raycaster.intersectObject(scene.children[0].children[0], true);
    console.log(intersects);

    if(intersects.length >= 0 && canDraw == true){
        if(canDraw == true){
        drawing = true;}
        console.log("Mouse pressed");
        listePoint.push(intersects[0].point);
        console.log(intersects[0].point.x, intersects[0].point.y, intersects[0].point.z);
    }
}

function onMouseDragged(event){
    if(drawing){
        pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(pointer, activeCamera);
        const intersects = raycaster.intersectObject(scene.children[0].children[0], true);
        if(intersects.length > 0){
            listePoint.push(intersects[0].point);
            console.log(intersects[0].point.x, intersects[0].point.y, intersects[0].point.z);
            drawline();
        }
    }
}

function onMouseReleased(event){
    console.log("Mouse released")
    drawing = false;
    canDraw = false;
}

function drawline(){
    if(listePoint.length > 1){
        var material = new THREE.LineBasicMaterial({color: 0x0000ff, linewidth: 10});
        //add smoothness to the line
        var curve = new THREE.CatmullRomCurve3(listePoint);
        var points = curve.getPoints(1000);
        var geometry = new THREE.BufferGeometry().setFromPoints(points);
        var line = new THREE.Line(geometry, material);
        scene.add(line);

        //var geometry = new THREE.BufferGeometry().setFromPoints(listePoint);
        //var line = new THREE.Line(geometry, material);
        scene.add(line);
    }

}

window.addEventListener('mousedown', onMousePressed);
window.addEventListener('mousemove', onMouseDragged);
window.addEventListener('mouseup', onMouseReleased);


///////////////////////////////////////

function animate(time){
    raycaster.setFromCamera(pointer, activeCamera);
    renderer.render(scene, activeCamera);
}


window.addEventListener('keydown', (event) => {
    // Check if the 'w' or 'W' key was pressed
    if (event.key === 'KeyW' || event.key === 'w') {
        // Set the active camera to camera
        activeCamera = camera;
        camera.position.set(0, 40,100);
    }
    // Check if the 's' or 'S' key was pressed
    if (event.key === 'KeyS' || event.key === 's') {
        // Set the active camera to camera2
        activeCamera = camera2;
    }
});

renderer.setAnimationLoop(animate);

