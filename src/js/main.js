import * as THREE from 'three';
import Framework from '../../framework/js/framework.js';

import Drawing from './Drawing.js';
import Ant, { antSettings } from './ant.js';
import Loop from './loop.js';
import Food from './Food.js';
import Obstacle from './obstacle.js';

/* --------------- Init of the scene -------------- */
const fw = new Framework();

const scene = fw.mainParameters.scene;
const renderer = fw.mainParameters.renderer;
const camera = fw.mainParameters.camera;

const table = fw.addSimpleSceneWithTable();

const fixCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000); //Create a camera
fixCamera.position.set(0, 50,0); //Set the position of the camera
fixCamera.lookAt(0,0,0); //Set the camera to look at the center of the scene

const raycaster = new THREE.Raycaster(); //Create a new raycaster object
const pointer = new THREE.Vector2(); //Create a new vector2 object

var activeCamera = fixCamera;
fw.onResize({camera: activeCamera});

var listObstacle = [];

window.addEventListener("keydown" , function(event){
    if(event.key == "w"){
        activeCamera = fixCamera;
    }

    if(event.key == "x"){
        activeCamera = camera;
        camera.position.set(0, 60, 50);
        camera.lookAt(0,0,0);
    }
});

/* -------------- Navigation Bar --------------- */

fw.addButtonToNavbar({textButton : "Restart" , onclickFunction : () => location.reload()});
fw.addButtonToNavbar({textButton :"Pause", onclickFunction : () => {
    if(loop != undefined){
    loop.stop = !loop.stop;
    document.getElementById('navbar0').children[2].textContent = loop.stop ? "Play" : "Pause";}
}});
fw.addButtonToNavbar({textButton : "Draw",onclickFunction : changeToDraw});
fw.addButtonToNavbar({textButton : "Wander",onclickFunction : changeMethode});
var dropdownList = [{ text: "More Speed", onClick: () => changeSpeedPlus() }, { text: "Less Speed", onClick: () => changeSpeedMinus() }];
fw.addDropdownToNavbar({textButton : "Speed",dropdownList : dropdownList});
fw.addDropdownToNavbar({textButton : "Distance",dropdownList : [{ text: "More Distance", onClick: () => changeDistancePlus() }, { text: "Less Distance", onClick: () => changeDistanceMinus() }]});

export function changeSpeedPlus(){ antSettings.speed += 0.2;}

export function changeSpeedMinus(){antSettings.speed -= 0.2;
    if(antSettings.speed < 0){
        antSettings.speed = 0.2;
    }

}

export function changeDistancePlus(){antSettings.minDistance += 1;}

export function changeDistanceMinus(){
    antSettings.minDistance -= 1;
    if(antSettings.minDistance <= 0) antSettings.minDistance = 1;
}


/* --------------------------------------------- */

/* -------------- 3D -------------- */

const manager = new THREE.LoadingManager();


async function loadAllModel(){
    fw.startLoadingScreen();
    
    await fw.loadModel("/src/models/ant/scene.gltf", "ant", {size : 0.015});
    await fw.loadModel("/src/models/nest/raptor_nest/scene.gltf", "nest", {size : 3});
    await fw.loadModel("/src/models/enamel_cup/scene.gltf", "cup1", {size : 1});
    await fw.loadModel("/src/models/coffeeMug/scene.gltf", "cup2", {size : 0.03});
    await fw.loadModel("/src/models/tasse_cafe/scene.gltf", "cup3", {size : 20});
    await fw.loadModel("/src/models/handpainted_watercolor_cake/scene.gltf", "cake", {size : 1});
    await fw.loadModel("/src/models/bread/scene.gltf", "bread", {size : 0.5});

    fw.removeLoadingScreen();

}

await loadAllModel();

async function placeObstacle(event){
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
                typeOfMug = "cup1"; 
                scale = 1;
                position.y += 1.2;
                radius = 3;
                break;
            case 1:
                typeOfMug ="cup2";
                scale = 0.03;
                position.y -= 0.5;
                radius = 4;
                break;
            case 2:
                typeOfMug = "cup3";
                scale = 20;
                position.y += 1.05;
                radius = 3;
                break;
            default:
                typeOfMug = "cup1";
                radius = 3;
                position.y += 1.2;
                scale = 1;
                break;
            }

            var mug = await fw.create_copy(typeOfMug,{size : scale} );
            mug.position.set(position.x, position.y, position.z);

            listObstacle.push(new Obstacle(position, typeOfMug));
        }
    }
}

var numfood = 0;

async function placeFood(event){
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(pointer, activeCamera);
    const intersects = raycaster.intersectObject(scene.getObjectByName("table"));
    if(intersects.length > 0){
        var position = intersects[0].point;
        var randomFood = Math.floor(Math.random() * 2);
        switch(randomFood){
            case 0:
                var food = await fw.create_copy("cake", {size : 1});
                food.position.set(position.x, position.y, position.z);
                break;
            case 1:
                var food = await fw.create_copy("bread", {size : 0.5});
                var posY = 1.5;
                food.position.set(position.x, position.y+posY, position.z);
                break;
            default:
                var food = await fw.create_copy("cake", {size :1});
                food.position.set(position.x, position.y, position.z);
                break;
        }
        var position = {x: food.position.x, y: food.position.y, z: food.position.z};
        loop.listF.push(new Food(food.name, position));
    }

}

/* -------------------------------- */

/* -------------- Drawing -------------- */

window.addEventListener('touchstart', onTouch);
window.addEventListener('touchmove', onSwipe);
window.addEventListener('touchend', onRelease);
window.addEventListener('click', placeObstacle);

function changeToDraw(){
    if(drawing.canDraw){
        console.log("Change to drawing a path");
        window.removeEventListener('touchstart',onTouchWander);
        window.addEventListener('touchstart',onTouch);
        window.addEventListener('touchmove',onSwipe);
        window.addEventListener('touchend',onRelease);
        window.addEventListener('click', placeObstacle);
    }
    else{
        console.log("Can't change mode while running the simulation")
    }
}

var drawing = new Drawing();
var loop;

function onTouch(event){
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

async function onRelease(event){
    if(drawing.listPoints.length < 30){
        //alert("Path too short, please draw a longer path");
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
    }

    var FirstAnt = new Ant(drawing.listPoints[0].x, drawing.listPoints[0].y, drawing.listPoints[0].z, scene.getObjectByName("ant"), fw);
    await FirstAnt.createAnt(0);

    loop = new Loop(FirstAnt, drawing.listPoints[0], drawing.listPoints[drawing.listPoints.length-1], drawing.listPoints,listObstacle, scene.getObjectByName("ant"), fw);

    loop.typeOfLoop = "normal";

    await fw.create_copy("nest", {size : 3});
    scene.getObjectByName("nest_copy0").position.set(drawing.listPoints[0].x, drawing.listPoints[0].y, drawing.listPoints[0].z);

    window.removeEventListener('touchstart',onTouch);
    window.removeEventListener('touchmove',onSwipe);
    window.removeEventListener('touchend',onRelease);


}

/* ----------------------------------- */

/* --------------------- Wander ----------------- */


function initWander(){
    window.addEventListener('touchstart',onTouchWander);
}

export function changeMethode(){
    if(drawing.canDraw){
        console.log("Change to wander mode");
        window.removeEventListener('touchstart',onTouch);
        window.removeEventListener('touchmove',onSwipe);
        window.removeEventListener('touchend',onRelease);
        window.removeEventListener('click',placeObstacle);-
        initWander();
    }
    else{
        console.log("Can't change mode while running the simulation");
    }
}

async function onTouchWander(event){
    pointer.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, activeCamera);
    const intersects = raycaster.intersectObject(scene.getObjectByName("table"));
    if(intersects.length > 0){
        drawing.addPoint(intersects[0].point);
        var modelNest = await fw.create_copy("nest", {size : 3});
        modelNest.position.set(intersects[0].point.x, intersects[0].point.y, intersects[0].point.z);
        scene.add(modelNest);
        var FirstAnt = new Ant(intersects[0].point.x, intersects[0].point.y, intersects[0].point.z, scene.getObjectByName("ant"), fw);
        await FirstAnt.createAnt(0);
        FirstAnt.type = "Wandering";

        loop = new Loop(FirstAnt, drawing.listPoints[0], drawing.listPoints[drawing.listPoints.length-1], drawing.listPoints, listObstacle,  scene.getObjectByName("ant"), fw);
        loop.typeOfLoop = "wander";
        loop.name = "WanderLoop";

        window.removeEventListener('touchstart',onTouchWander);

        activeCamera = camera;
        setTimeout(function(){
            window.addEventListener('click',placeFood);}, 1000);
        clearTimeout();
    }
}

/* ----------------------------------- */

function animate() {
    requestAnimationFrame(animate);
    if(loop != undefined){
        if(!loop.stop){loop.launchLoop(scene);}
        
    }
    renderer.render(scene, activeCamera);
}

animate();



