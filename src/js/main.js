import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';

import Table from './table.js';
import Drawing from './Drawing.js';
import Ant from './ant.js';
import Loop from './loop.js';
import Obstacle from './obstacle.js';
import Food from './Food.js';




window.onload =initWander() ;

function init(){
    loadAllModel();
    window.addEventListener('touchstart',onTouch);
    window.addEventListener('touchmove',onSwipe);
    window.addEventListener('touchend',onRelease);
    window.addEventListener('click',placeObstacle);
}

function initWander(){
    loadAllModel();
    window.addEventListener('touchstart',onTouchWander);
    window.addEventListener("keydown" , function(event){
        if(event.key == "w"){
            activeCamera = fixCamera;
        }

        if(event.key == "x"){
            activeCamera = orbitCamera;
        }
    });

}

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
        loop = new Loop(FirstAnt, drawing.listPoints[0], drawing.listPoints[drawing.listPoints.length-1], drawing.listPoints,listObstacle, modelAnt);

        orbitCamera.position.set(0,20,35);
        orbitCamera.lookAt(0,0,0);

        activeCamera = orbitCamera;

        modelNest.position.set(drawing.listPoints[0].x, drawing.listPoints[0].y, drawing.listPoints[0].z);
        scene.add(modelNest);

        loop.typeOfLoop = "normal";

        window.removeEventListener('touchstart',onTouch);
        window.removeEventListener('touchmove',onSwipe);
        window.removeEventListener('touchend',onRelease);
        
        
    }

    else{
        console.log("You have already finished drawing");
    }

}

function onTouchWander(event){
    pointer.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, activeCamera);
    const intersects = raycaster.intersectObject(scene.getObjectByName("table"));
    if(intersects.length > 0){
        drawing.addPoint(intersects[0].point);
        modelNest.position.set(intersects[0].point.x, intersects[0].point.y, intersects[0].point.z);
        scene.add(modelNest);
        var FirstAnt = new Ant(intersects[0].point.x, intersects[0].point.y, intersects[0].point.z, 0, modelAnt);
        FirstAnt.attachModel(scene);
        loop = new Loop(FirstAnt, drawing.listPoints[0], drawing.listPoints[drawing.listPoints.length-1], drawing.listPoints, listObstacle, modelAnt);
        loop.typeOfLoop = "wander";

        window.removeEventListener('touchstart',onTouchWander);

        orbitCamera.position.set(0,20,35);
        orbitCamera.lookAt(0,0,0);
        //console.log("Position of the nest : ", modelNest.position.x, modelNest.position.z);

        activeCamera = orbitCamera;
        setTimeout(function(){
            window.addEventListener('click',placeFood);});
        clearTimeout();
    }
}

function placeObstacle(event){
    if(drawing.canDraw){
        pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(pointer, activeCamera);
        const intersects = raycaster.intersectObject(scene.getObjectByName("table"));
        if(intersects.length > 0){
            var position = intersects[0].point;
            var scale = 1;
            var radius = 3;
            var typeOfMug;
            
            var randoNumber = Math.floor(Math.random() * 3);
            switch(randoNumber){
                case 0:
                typeOfMug = modelCup1;
                scale = 1;
                position.y += 1.2;
                radius = 3;
                break;
            case 1:
                typeOfMug = modelCup2;
                scale = 0.03;
                position.y -= 0.5;
                radius = 4;
                break;
            case 2:
                typeOfMug = modelCup3;
                scale = 20;
                position.y += 1.05;
                radius = 3;
                break;
            default:
                typeOfMug = modelCup1;
                radius = 3;
                position.y += 1.2;
                scale = 1;
                break;
            }

            listObstacle.push(new Obstacle(position, scale, typeOfMug));
            listObstacle[listObstacle.length-1].placeObstacle(scene);
        }
    }
}

function placeFood(event){
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(pointer, activeCamera);
    const intersects = raycaster.intersectObject(scene.getObjectByName("table"));
    if(intersects.length > 0){
        var position = intersects[0].point;
        var randomFood = Math.floor(Math.random() * 2);
        switch(randomFood){
            case 0:
                var food = cake;
                break;
            case 1:
                var food = bread;
                break;
            default:
                var food = cake;
                break;
        }
        loop.listF.push(new Food(position, food, scene));
    }

}

var modelAnt;
var modelNest;
var modelCup1;
var modelCup2;
var modelCup3;
var cake;
var bread;

var listObstacle = [];

async function loadAllModel(){
    const loader = new GLTFLoader();
    loader.load('/src/modele/ant/ant/scene.gltf', function(gltf){
        gltf.scene.scale.set(0.01,0.01,0.01);
        gltf.scene.name = "OriginalAnt";
        modelAnt = gltf.scene;
        console.log("Ant model loaded")
    })

    loader.load('/src/modele/nest/raptor_nest/scene.gltf', function(gltf){
        gltf.scene.scale.set(3,3,3);
        gltf.scene.position.set(0,0,0);
        modelNest = gltf.scene;
        console.log("Nest model loaded")
    })

    loader.load("/src/modele/enamel_cup/scene.gltf", function(gltf){
        gltf.scene.scale.set(0.01,0.01,0.01);
        gltf.scene.position.set(0,0,0);
        modelCup1 = gltf.scene;
        console.log("Cup 1 model loaded")
    });

    loader.load("/src/modele/coffeeMug/scene.gltf", function(gltf){
        gltf.scene.scale.set(0.01,0.01,0.01);
        gltf.scene.position.set(0,0,0);
        modelCup2 = gltf.scene;
        console.log("Cup 2 model loaded")
    });

    loader.load("/src/modele/tasse_cafe/scene.gltf", function(gltf){
        gltf.scene.scale.set(0.01,0.01,0.01);
        gltf.scene.position.set(0,0,0);
        modelCup3 = gltf.scene;
        console.log("Cup 3 model loaded")
    });

    loader.load("/src/modele/handpainted_watercolor_cake/scene.gltf", function(gltf){
        gltf.scene.scale.set(1,1,1);
        gltf.scene.position.set(0,0,0);
        gltf.scene.name = "cake";
        cake = gltf.scene;
        console.log("Cake model loaded")
    });

    
    loader.load("/src/modele/bread/scene.gltf", function(gltf){
        gltf.scene.scale.set(1,1,1);
        gltf.scene.position.set(0,0,0);
        gltf.scene.name = "bread";
        bread = gltf.scene;
        console.log("Bread model loaded")
    });

}

var activeCamera = fixCamera; //Set the active camera to the orbit camera

function animate(time) {
    requestAnimationFrame(animate); //Call the animate function
    updateFPS(); //Update the FPS counter

    if(loop != undefined){
        loop.launchLoop(scene);
    }

    raycaster.setFromCamera(pointer,activeCamera); //Set the raycaster to the active camera
    renderer.render(scene, activeCamera); //Render the scene
}

//let fpsCounter = 0;
let lastFrame = performance.now();
const fpsDisplay = document.getElementById('fps');
function updateFPS(){
    const currentFrame = performance.now();
    const elapsed = currentFrame - lastFrame;
    lastFrame = currentFrame;
    const fps = Math.round(1000 / elapsed);
    fpsDisplay.textContent = fps.toFixed(1);
}



requestAnimationFrame(animate); //Call the animate function