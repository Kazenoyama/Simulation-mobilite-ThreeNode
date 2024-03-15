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
/*
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);
*/

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
camera.position.set(0, 30,100);
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

function animate(time){

    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

