import * as THREE from 'three';
import Framework from '../framework/framework.js';

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

fw.onResize(renderer, window, camera);

const textures = ["./src/textures/wood_floor.jpg", "./src/textures/wall.jpg", "./src/textures/roof.jpg"];
const table = fw.addScene(textures, fw, {width : 50, depth : 50})

const fixCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000); //Create a camera
fixCamera.position.set(0, 50,0); //Set the position of the camera
fixCamera.lookAt(0,0,0); //Set the camera to look at the center of the scene

const raycaster = new THREE.Raycaster(); //Create a new raycaster object
const pointer = new THREE.Vector2(); //Create a new vector2 object

var activeCamera = fixCamera;

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

fw.addButtonToNavbar("Restart", () => location.reload());
fw.addButtonToNavbar("Pause", () => {
    if(loop != undefined){
        loop.stop = !loop.stop;
        document.getElementById('navbar0').children[2].textContent = loop.stop ? "Play" : "Pause";
    }
});
fw.addButtonToNavbar("Draw", changeToDraw);
fw.addButtonToNavbar("Wander", changeMethode);

var dropdownList = [{ text: "More Speed", onClick: () => changeSpeedPlus() }, { text: "Less Speed", onClick: () => changeSpeedMinus() }];
fw.addDropdownToNavbar("Speed", dropdownList);
fw.addDropdownToNavbar("Distance", [
    { text: "More Distance", onClick: () => zoomOut() }, // Appelle zoomOut
    { text: "Less Distance", onClick: () => zoomIn() }   // Appelle zoomIn
]);
// Créer le bouton d'aide séparé
const helpButton = document.createElement('button');
helpButton.textContent = "❓";
helpButton.className = 'help-button';
helpButton.onclick = () => {
    const modal = document.createElement("div");
    modal.id = "helpModal";
    modal.className = "modal";
    modal.style.display = "block";
    modal.style.position = "fixed";
    modal.style.zIndex = "1000";
    modal.style.left = "0";
    modal.style.top = "0";
    modal.style.width = "100%";
    modal.style.height = "100%";
    modal.style.backgroundColor = "rgba(0,0,0,0.4)";
    modal.style.display = "flex";
    modal.style.justifyContent = "center";
    modal.style.alignItems = "center";

    const modalContent = document.createElement("div");
    modalContent.className = "modal-content";
    modalContent.style.backgroundColor = "#fefefe";
    modalContent.style.margin = "15% auto";
    modalContent.style.padding = "20px";
    modalContent.style.border = "1px solid #888";
    modalContent.style.width = "80%";
    modalContent.style.maxWidth = "500px";
    modalContent.style.borderRadius = "10px";
    modalContent.style.position = "relative";

    const closeBtn = document.createElement("span");
    closeBtn.innerHTML = "&times;";
    closeBtn.style.position = "absolute";
    closeBtn.style.right = "10px";
    closeBtn.style.top = "5px";
    closeBtn.style.fontSize = "28px";
    closeBtn.style.fontWeight = "bold";
    closeBtn.style.cursor = "pointer";
    closeBtn.onclick = () => modal.remove();

    const title = document.createElement("h2");
    title.textContent = "Les Phéromones, c'est quoi ?";
    title.style.color = "#333";
    title.style.marginBottom = "20px";

    const content = document.createElement("div");
    content.innerHTML = `
        <p style="font-size: 16px; line-height: 1.6; color: #444;">
            Les phéromones sont comme des messages secrets que les fourmis laissent derrière elles ! 🐜
        </p>
        <p style="font-size: 16px; line-height: 1.6; color: #444;">
            C'est comme si elles dessinaient un chemin invisible avec une odeur spéciale. Quand une fourmi trouve de la nourriture, elle laisse des phéromones sur son chemin pour que les autres fourmis puissent la suivre !
        </p>
        <p style="font-size: 16px; line-height: 1.6; color: #444;">
            Plus il y a de fourmis qui passent par le même chemin, plus les phéromones deviennent fortes. C'est comme si elles disaient : "Hey, par ici, j'ai trouvé de la nourriture !" 🍰
        </p>
        <p style="font-size: 16px; line-height: 1.6; color: #444;">
            Dans notre simulation, les phéromones sont représentées par des points verts. Plus il y a de points verts, plus le chemin est populaire ! 🌟
        </p>
    `;

    modalContent.appendChild(closeBtn);
    modalContent.appendChild(title);
    modalContent.appendChild(content);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // Fermer la fenêtre si on clique en dehors
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.remove();
        }
    };
};
document.body.appendChild(helpButton);

// Ajouter les boutons de zoom et de caméra
fw.addButtonToNavbar("👁️", toggleCameraMode);

/* --------------------------------------------- */

/* -------------- 3D -------------- */

const manager = new THREE.LoadingManager();


async function loadAllModel(){
    const loadingScreen = document.createElement('div');
    loadingScreen.id = 'loading-screen';
    loadingScreen.style.position = 'fixed';
    loadingScreen.style.top = '0';
    loadingScreen.style.left = '0';
    loadingScreen.style.width = '100%';
    loadingScreen.style.height = '100%';
    loadingScreen.style.backgroundColor = '#000';
    loadingScreen.style.color = '#fff';
    loadingScreen.style.display = 'flex';
    loadingScreen.style.justifyContent = 'center';
    loadingScreen.style.alignItems = 'center';
    loadingScreen.style.zIndex = '1000';
    loadingScreen.innerHTML = '<h1>Loading...</h1>';
    document.body.appendChild(loadingScreen);
    
    await fw.loadModel("/src/models/ant/scene.gltf", "ant");
    await fw.loadModel("/src/models/nest/raptor_nest/scene.gltf", "nest");
    await fw.loadModel("/src/models/enamel_cup/scene.gltf", "cup1");
    await fw.loadModel("/src/models/coffeeMug/scene.gltf", "cup2");
    await fw.loadModel("/src/models/tasse_cafe/scene.gltf", "cup3");
    await fw.loadModel("/src/models/handpainted_watercolor_cake/scene.gltf", "cake");
    await fw.loadModel("/src/models/bread/scene.gltf", "bread");

    document.body.removeChild(loadingScreen);
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

            var mug = await fw.create_copy(typeOfMug, scale);
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
                var food = await fw.create_copy("cake", 1);
                food.position.set(position.x, position.y, position.z);
                break;
            case 1:
                var food = await fw.create_copy("bread", 0.5);
                var posY = 1.5;
                food.position.set(position.x, position.y+posY, position.z);
                break;
            default:
                var food = await fw.create_copy("cake", 1);
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

async function onRelease(event){
    //console.log("Screen released");
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

    await fw.create_copy("nest", 3)
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
        var modelNest = await fw.create_copy("nest", 3);
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

// Après la déclaration des caméras et avant les event listeners
export function toggleCameraMode() {
    if (activeCamera === fixCamera) {
        activeCamera = camera;
        camera.position.set(0, 60, 50);
        camera.lookAt(0, 0, 0);
    } else {
        activeCamera = fixCamera;
        fixCamera.position.set(0, 50, 0);
        fixCamera.lookAt(0, 0, 0);
    }
}

export function zoomIn() {
    if (activeCamera === camera) {
        if (camera.position.y > 20) {
            camera.position.y -= 5;
            camera.position.z -= 4;
            camera.lookAt(0, 0, 0);
        }
    } else if (activeCamera === fixCamera) {
        if (fixCamera.position.y > 20) {
            fixCamera.position.y -= 5;
            fixCamera.lookAt(0, 0, 0);
        }
    }
}

export function zoomOut() {
    if (activeCamera === camera) {
        if (camera.position.y < 100) {
            camera.position.y += 5;
            camera.position.z += 4;
            camera.lookAt(0, 0, 0);
        }
    } else if (activeCamera === fixCamera) {
        if (fixCamera.position.y < 100) {
            fixCamera.position.y += 5;
            fixCamera.lookAt(0, 0, 0);
        }
    }
}

animate();


