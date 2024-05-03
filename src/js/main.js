import * as THREE from 'three'; //Import of three js
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'; //Import of the orbital camera
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import Table from '/src/js/table.js'; //Import of the Table class
import Ant from '/src/js/ant.js'; //Import of the Ant class

import { controleSettings } from './controle.js';

/**
 * Create the scene and set its background color 
*/
export const scene = new THREE.Scene();
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
/*
function splitScreen(){
    // Rendu de la grande vue de l'objet (active)
    renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.setScissor(0, 0, window.innerWidth, window.innerHeight);
    renderer.setScissorTest(true);
    renderer.render(scene, camera2);
}*/

////////////////////////////////////////
/////////// TABLE //////////////////////

/**
 * Create the table and add it to the scene
 */
const table = new Table(50,50,100);
scene.add(table.getTable());


////////////////////////////////////////
/////////// LIGHT //////////////////////

// Add ambient light to the scene
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Soft white light
scene.add(ambientLight);

// Add directional light to the scene
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5); // White light
directionalLight.position.set(0, 1, 1).normalize();
scene.add(directionalLight);

////////////////////////////////////////
/////////// DRAWING ////////////////////


var drawing = false;
var canDraw = true;
var listePoint = [];

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

function onMousePressed(event){
    if(canDraw == true){
        pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(pointer, activeCamera);

        const intersects = raycaster.intersectObject(scene.children[0].children[0], true);
        //console.log(intersects);

        if(intersects.length >= 0 && canDraw == true){
            
            drawing = true;
            console.log("Mouse pressed");
            listePoint.push(intersects[0].point);
            //console.log(intersects[0].point.x, intersects[0].point.y, intersects[0].point.z);
        }
    }
    else console.log("Can't draw")
}

function onMouseDragged(event){
    if(drawing){
        pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(pointer, activeCamera);
        const intersects = raycaster.intersectObject(scene.children[0].children[0], true);
        if(intersects.length > 0){
            listePoint.push(intersects[0].point);
            //console.log(intersects[0].point.x, intersects[0].point.y, intersects[0].point.z);
            drawline();
        }
    }
}

function onMouseReleased(event){
    console.log("Mouse released")
    if(listePoint.length < 15){
        console.log("Not enough points");
        listePoint = [];
    }
    else{
        drawing = false;
        canDraw = false;
        activeCamera = camera;
        camera.position.set(0, 50,100);
    
        //Remove the event listener
        window.removeEventListener('mousedown', onMousePressed);
        window.removeEventListener('mousemove', onMouseDragged);
        window.removeEventListener('mouseup', onMouseReleased);
        window.removeEventListener('touchstart', onTouch);
        window.removeEventListener('touchmove', onSwipe);
        window.removeEventListener('touchend', onReleased);
    
        //Init the ant and the first point
        start = {x: listePoint[0].x, y: listePoint[0].y, z: listePoint[0].z};
        finish = {x: listePoint[listePoint.length-1].x, y: listePoint[listePoint.length-1].y, z: listePoint[listePoint.length-1].z};
        Firstant = new Ant(start.x,start.y,start.z, counter);
        attach3DModel(counter);
        counter++;
        listeAnt.push(Firstant);
        scene.add(Firstant.body);
    }
    
    
}

function onTouch(event){
    console.log("Screen touched");
    //Find the coordinate where i touched
    var x = event.touches[0].clientX;
    var y = event.touches[0].clientY;
    console.log(x,y);

    if(canDraw == true){
        pointer.x = (x / window.innerWidth) * 2 - 1;
        pointer.y = - (y / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(pointer, activeCamera);

        const intersects = raycaster.intersectObject(scene.children[0].children[0], true);
        //console.log(intersects);

        if(intersects.length >= 0 && canDraw == true){
            
            drawing = true;
            console.log("Mouse pressed");
            listePoint.push(intersects[0].point);
            //console.log(intersects[0].point.x, intersects[0].point.y, intersects[0].point.z);
        }
    }
    else console.log("Can't draw")
}

function onSwipe(event){
    console.log("Screen swiped");

    if(drawing){
        pointer.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
        pointer.y = - (event.touches[0].clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(pointer, activeCamera);
        const intersects = raycaster.intersectObject(scene.children[0].children[0], true);
        if(intersects.length > 0){
            listePoint.push(intersects[0].point);
            //console.log(intersects[0].point.x, intersects[0].point.y, intersects[0].point.z);
            drawline();
        }
    }
}

function onReleased(event){
    console.log("Screen Released");

    if(listePoint.length < 15){
        console.log("Not enough points");
        listePoint = [];
    }
    else{
        drawing = false;
        canDraw = false;
        activeCamera = camera;
        camera.position.set(0, 15,35);
        camera.lookAt(0,10.5,0);
    
        //Remove the event listener
        window.removeEventListener('mousedown', onMousePressed);
        window.removeEventListener('mousemove', onMouseDragged);
        window.removeEventListener('mouseup', onMouseReleased);
        window.removeEventListener('touchstart', onTouch);
        window.removeEventListener('touchmove', onSwipe);
        window.removeEventListener('touchend', onReleased);
    
        //Init the ant and the first point
        start = {x: listePoint[0].x, y: listePoint[0].y, z: listePoint[0].z};
        finish = {x: listePoint[listePoint.length-1].x, y: listePoint[listePoint.length-1].y, z: listePoint[listePoint.length-1].z};
        Firstant = new Ant(start.x,start.y,start.z, counter);
        attach3DModel(counter);
        counter++;
        listeAnt.push(Firstant);
        scene.add(Firstant.body);
    }

}

function drawline(){
    if(listePoint.length > 1){
        var material = new THREE.LineBasicMaterial({color: 0x0000ff, linewidth: 20});
        //add smoothness to the line
        var curve = new THREE.CatmullRomCurve3(listePoint);
        var points = curve.getPoints(1000);
        var geometry = new THREE.BufferGeometry().setFromPoints(points);
        var line = new THREE.Line(geometry, material);
        scene.add(line);
    }

}

///////////////////////////////////////
/////////// ANTS //////////////////////
var Firstant;
var start;
var finish;
var counter = 0;
var intervalleDrawingAnt = 4;

var listeAnt = [];
function addAnt(){
    // console.log("Add ant enter");
    if(listeAnt.length > 0 && listeAnt[listeAnt.length-1].distance(start.x,start.y,start.z) > 4 && listeAnt.length < 100){
        console.log("Add ant case 1");
        listeAnt.push(new Ant(start.x,start.y,start.z,counter));
        attach3DModel(counter);
        counter++;
        // not sure if it works! 
        if(counter%intervalleDrawingAnt == 0){
            listeAnt[listeAnt.length-1].drawingAnt = true;
            listeAnt[listeAnt.length-1].body.material.color.setHex(0x0000ff);
        }
        // scene.add(listeAnt[listeAnt.length-1].body);
    }
    

    if(listeAnt[0].distance(finish.x,finish.y,finish.z) < 0.1){
      if(listeAnt.length > 1){
        listeAnt[1].minDistanceToAnt = 0;
        console.log("Add ant case 2-1");
        if(listeAnt[1].distance(finish.x,finish.y,finish.z) < 0.1){
            //console.log(scene.getObjectByName("ant0"));
            scene.remove(scene.getObjectByName(listeAnt[0].body.name));
            listeAnt.shift();
            rescaleAntsTarget(10);
        }
      }
    }
    // console.log("Add ant leave");
}

function movingAnt(){

    if(canDraw == false && drawing == false && listePoint.length > 0){
        console.log("moving ant case 1");
        addAnt();
        Firstant.followN(listePoint[0].x, listePoint[0].y, listePoint[0].z);
        if(listeAnt.length > 1){
            for(var i = 1; i < listeAnt.length; i++){
                listeAnt[i].followPrevious(listeAnt[i-1]);
                listeAnt[i-1].traceLine(scene);
                
            }
        }
        if(Firstant.pos.x == listePoint[0].x && Firstant.pos.y == listePoint[0].y && Firstant.pos.z == listePoint[0].z){
            listePoint.shift();
        }
    };

    if(listePoint.length == 0 && canDraw == false){
        console.log("moving ant case 2");
        addAnt();
        if(listeAnt.length > 1){
            for(var i = 1; i < listeAnt.length; i++){
                listeAnt[i].followPrevious(listeAnt[i-1]);
                listeAnt[i-1].traceLine(scene);
                if(listeAnt[i].distance(finish.x,finish.y,finish.z) < 0.1){
                    removeAnt(i);
                    /*
                    scene.remove(scene.getObjectByName(listeAnt[i].body.name));
                    listeAnt.splice(i,1);
                    */
                }
            }
        }
    }

}

////////////////////////////////////////
/////////// 3D MODELS //////////////////
var model;
var tailleModel = 0.015;

function attach3DModel(counterT){
    console.log("attach3d model started");
    if(model == undefined){
        console.log("case new model");
        const loader = new GLTFLoader();
        loadNest(loader);
        loadAntsTarget(loader);
        loader.load('/src/modele/ant/ant/scene.gltf', function(bod){
            bod.scene.scale.set(tailleModel,tailleModel,tailleModel);
            bod.scene.position.set(start.x,start.y,start.z);
            bod.scene.name = "ant3D" + counterT;
            model = bod.scene;
            scene.add(bod.scene);
            //console.log(bod);
        });
    }
    else{
        console.log("case cloned model");
        const cloneModel = model.clone();
        cloneModel.scale.set(tailleModel,tailleModel,tailleModel);
        cloneModel.position.set(start.x,start.y,start.z);
        cloneModel.name = "ant3D" + counterT;
        scene.add(cloneModel);
    }
    console.log("attach3d model ended");

}

function removeAnt(toRemove){
    scene.remove(scene.getObjectByName("ant3D"+ listeAnt[toRemove].number));
    scene.remove(scene.getObjectByName(listeAnt[toRemove].body.name));
    /*
    console.log("Remove ant");
    console.log(scene.getObjectByName("ant3D"+ listeAnt[toRemove].number));
    console.log(scene.getObjectByName(listeAnt[toRemove].body.name));*/
}

function loadAntsTarget(loader){
    console.log("loadAntsTarget enter in function");
    loader.load('/src/modele/StrawberryTarget.gltf', function(bod){
        bod.scene.scale.set(1,1,1);
        bod.scene.position.set(finish.x,finish.y,finish.z);
        bod.scene.name = "AntsTarget";
        model = bod.scene;
        scene.add(bod.scene);
        //console.log(scene)
    });
    console.log("loadAntsTarget end of function");
}

function rescaleAntsTarget(percentage) {
    if(scene.getObjectByName("AntsTarget") != undefined){
        var antsTarget = scene.getObjectByName("AntsTarget");
        var currentScale = antsTarget.scale.x;
        if( currentScale > 0.15){
            // Convert the percentage to a scale factor
            var scaleFactor = 1-(percentage / 100);
            // Get the current scale
            console.log("scale factor: " + scaleFactor);
            console.log("Current scale: " + currentScale);
            // Set the new scale
            antsTarget.scale.set(currentScale * scaleFactor, currentScale * scaleFactor, currentScale * scaleFactor);    
        }
        else{
            // Target is too small, remove it. 
            scene.remove(scene.getObjectByName("AntsTarget"));

            // do we need to stop the game  
            controleSettings.isPaused = true;
            document.getElementById('pauseButton').textContent = 'Reprendre';
        }
    }
}

function loadNest(loader){
    console.log("Load nest")
    loader.load('/src/modele/nest/raptor_nest/scene.gltf', function(bod){
        bod.scene.scale.set(3,3,3);
        bod.scene.position.set(start.x,start.y,start.z);
        bod.scene.name = "Nest";
        model = bod.scene;
        scene.add(bod.scene);
        //console.log(scene)
    });
}

function move3DModel(){
    for(var i = 0; i < listeAnt.length; i++){
        if(scene.getObjectByName("ant3D" + listeAnt[i].number) != undefined){
            var antUsed = scene.getObjectByName("ant3D" + listeAnt[i].number);
            antUsed.position.set(listeAnt[i].pos.x, listeAnt[i].pos.y+0.5, listeAnt[i].pos.z);
            if(i > 0){
                rotateModel3D(antUsed, listeAnt[i-1].pos);
            }
            else{
                if(listePoint.length > 0){
                    var target = new THREE.Vector3(listePoint[0].x, listePoint[0].y +0.5, listePoint[0].z);
                    rotateModel3D(antUsed, target);
                }
                
            }
                
            
        }
    }
}

function rotateModel3D(theModel, direction){
    const lookAtVector = new THREE.Vector3().copy(direction).sub(theModel.position);
    theModel.quaternion.setFromUnitVectors(new THREE.Vector3(1,0,0), lookAtVector.clone().normalize());
    theModel.rotateY(Math.PI);
    theModel.updateMatrixWorld(true);
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////// TEST ZONE //////////////////







//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////// ANIMATION AND LISTENER ////////

window.addEventListener('mousedown', onMousePressed);
window.addEventListener('mousemove', onMouseDragged);
window.addEventListener('mouseup', onMouseReleased);

window.addEventListener('touchstart', onTouch);
window.addEventListener('touchmove', onSwipe);
window.addEventListener('touchend', onReleased);

window.addEventListener('keydown', (event) => {
    // Check if the 'w' or 'W' key was pressed
    if (event.key === 'KeyW' || event.key === 'w') {
        // Set the active camera to camera
        activeCamera = camera;
        camera.position.set(0, 50,100);
    }
    // Check if the 's' or 'S' key was pressed
    if (event.key === 'KeyS' || event.key === 's') {
        // Set the active camera to camera2
        activeCamera = camera2;
    }

    if(event.key === 'KeyR' || event.key === 'r'){
        window.location.reload();
    }
});


function animate(time){
    requestAnimationFrame(animate);
    raycaster.setFromCamera(pointer, activeCamera);
    move3DModel();
    //splitScreen();
    if (!controleSettings.isPaused) {
        updateFPS();
        movingAnt();        
    }
    renderer.render(scene, activeCamera);
}

let fpsCounter = 0;
let lastcheck = performance.now();
const fpsdisplay = document.getElementById('fps');

function updateFPS(){
    const currentcheck = performance.now();
    const elapsed = currentcheck - lastcheck;
    lastcheck = currentcheck;
    const fps = 1000 / elapsed;
    fpsdisplay.textContent = fps.toFixed(1);
    //console.log(fps);

}

requestAnimationFrame(animate);


