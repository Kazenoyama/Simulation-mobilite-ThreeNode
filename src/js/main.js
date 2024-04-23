import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';

import Table from './table.js';
import Drawing from './Drawing.js';
import Ant from './ant.js';
import Loop from './loop.js';




window.onload = loadAllModel();

const scene = new THREE.Scene(); //Create the scene
scene.background = new THREE.Color(0xffffff); //Add a white background to the scene

const renderer = new THREE.WebGLRenderer(); //Create the renderer
renderer.setSize(window.innerWidth, window.innerHeight); //Set the size of the renderer to the size of the window
document.body.appendChild(renderer.domElement); //Add the renderer to the body of the document

const orbitCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000); //Create a camera
const orbit = new OrbitControls(orbitCamera, renderer.domElement); //Create an orbit control for the camera
const controls = new OrbitControls(orbitCamera, renderer.domElement); //Create an orbit control for the camera


const fixCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000); //Create a camera
fixCamera.position.set(0, 50,0); //Set the position of the camera
fixCamera.lookAt(0,0,0); //Set the camera to look at the center of the scene

controls.update(); //Update the orbit control
orbit.update(); //Update the orbit control

orbitCamera.position.z = 50; //Set the position of the camera

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); //Create an ambient light
scene.add(ambientLight); //Add the ambient light to the scene

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5); //Create a directional light
directionalLight.position.set(0, 1, 0); //Set the position of the directional light
scene.add(directionalLight); //Add the directional light to the scene

const table = new Table(50,50); //Create a new table object
scene.add(table.getTable()); //Add the table object to the scene

const raycaster = new THREE.Raycaster(); //Create a new raycaster object
const pointer = new THREE.Vector2(); //Create a new vector2 object

var drawing = new Drawing();
var loop;

function onTouch(event){
    //console.log("Screnn touched");
    if(drawing.canDraw){
        pointer.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
        pointer.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(pointer, activeCamera);
        const intersects = raycaster.intersectObject(scene.getObjectByName("table"));
        if (intersects.length > 0) {
            drawing.addPoint(intersects[0].point);
            drawing.drawing = true;     
        }
    }
}

function onSwipe(event){
    //console.log("Screen swiped");
    if(drawing.drawing){
        pointer.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
        pointer.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(pointer, activeCamera);
        const intersects = raycaster.intersectObject(scene.getObjectByName("table"));
        if (intersects.length > 0) {
            drawing.addPoint(intersects[0].point);
            drawing.drawLine(scene);
        }
    }

    
}

function onRelease(event){
    //console.log("Screen released");
    if(drawing.listPoints.length < 30){
        console.log("Drawing deleted");
        for(drawing.listLine.length; drawing.listLine.length > 0;){
            drawing.deleteLine(scene);
        }
        drawing.listLine = [];
        drawing.listPoints = [];
        drawing.drawing = false;
        return;
    }

    if(drawing.canDraw){
        drawing.drawing = false;
        drawing.canDraw = false;
        console.log("Drawing finished");
        var FirstAnt = new Ant(drawing.listPoints[0].x, drawing.listPoints[0].y, drawing.listPoints[0].z, 0, modelAnt);
        FirstAnt.attachModel(scene);
        loop = new Loop(FirstAnt, drawing.listPoints[0], drawing.listPoints[drawing.listPoints.length-1], drawing.listPoints);

        orbitCamera.position.set(0,20,35);
        orbitCamera.lookAt(0,0,0);

        activeCamera = orbitCamera;

        window.removeEventListener('touchstart',onTouch);
        window.removeEventListener('touchmove',onSwipe);
        window.removeEventListener('touchend',onRelease);
        
        
    }

    else{
        console.log("You have already finished drawing");
    }

}

var modelAnt;
var modelNest;
function loadAllModel(){
    const loader = new GLTFLoader();
    loader.load('/src/modele/ant/ant/scene.gltf', function(gltf){
        gltf.scene.scale.set(0.01,0.01,0.01);
        gltf.scene.name = "OriginalAnt";
        modelAnt = gltf.scene;
    })

    loader.load('/src/modele/nest/raptor_nest/scene.gltf', function(gltf){
        gltf.scene.scale.set(3,3,3);
        gltf.scene.position.set(0,0,0);
        modelNest = gltf.scene;
    
    })
}

var activeCamera = fixCamera; //Set the active camera to the orbit camera

function animate(time) {
    requestAnimationFrame(animate); //Call the animate function
    updateFPS(); //Update the FPS counter

    if(loop != undefined){
        loop.mainLoop(scene);
    }

    raycaster.setFromCamera(pointer,activeCamera); //Set the raycaster to the active camera
    renderer.render(scene, activeCamera); //Render the scene
}

let fpsCounter = 0;
let lastFrame = performance.now();
const fpsDisplay = document.getElementById('fps');
function updateFPS(){
    const currentFrame = performance.now();
    const elapsed = currentFrame - lastFrame;
    lastFrame = currentFrame;
    const fps = Math.round(1000 / elapsed);
    fpsDisplay.textContent = fps.toFixed(1);
}

window.addEventListener('touchstart',onTouch);
window.addEventListener('touchmove',onSwipe);
window.addEventListener('touchend',onRelease);

requestAnimationFrame(animate); //Call the animate function