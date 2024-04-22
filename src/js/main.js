import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import Table from './table.js';
import { or } from 'three/examples/jsm/nodes/Nodes.js';


const scene = new THREE.Scene(); //Create the scene
scene.background = new THREE.Color(0xffffff); //Add a white background to the scene

const renderer = new THREE.WebGLRenderer(); //Create the renderer
renderer.setSize(window.innerWidth, window.innerHeight); //Set the size of the renderer to the size of the window
document.body.appendChild(renderer.domElement); //Add the renderer to the body of the document

const orbitCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000); //Create a camera
const orbit = new OrbitControls(orbitCamera, renderer.domElement); //Create an orbit control for the camera
const controls = new OrbitControls(orbitCamera, renderer.domElement); //Create an orbit control for the camera


controls.update(); //Update the orbit control
orbit.update(); //Update the orbit control

orbitCamera.position.z = 50; //Set the position of the camera

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); //Create an ambient light
scene.add(ambientLight); //Add the ambient light to the scene

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5); //Create a directional light
directionalLight.position.set(0, 1, 0); //Set the position of the directional light
scene.add(directionalLight); //Add the directional light to the scene

const table = new Table(50,50); //Create a new table object
scene.add(table.tableElement); //Add the table object to the scene

const raycaster = new THREE.Raycaster(); //Create a new raycaster object
const pointer = new THREE.Vector2(); //Create a new vector2 object

function onTouch(event){
    //console.log("Screnn touched");
    pointer.x = (event.touches[0] / window.innerWidth) * 2 - 1;
    pointer.y = - (event.touches[0] / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(pointer, activeCamera);
    const intersects = raycaster.intersectObjects(scene.getObjectByName("table"), true);
}

function onSwipe(event){
    //console.log("Screen swiped");

    
}

function onRelease(event){
    //console.log("Screen released");
}


var activeCamera = orbitCamera; //Set the active camera to the orbit camera

function animate() {
    requestAnimationFrame(animate); //Call the animate function
    renderer.render(scene, activeCamera); //Render the scene
}

window.addEventListener('touchstart',onTouch,false);
window.addEventListener('touchmove',onSwipe,false);
window.addEventListener('touchend',onRelease,false);

requestAnimationFrame(animate); //Call the animate function