// variable to control the pause button
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
export let controleSettings = { isPaused: false }; // Exportez isPaused pour l'utiliser dans d'autres modules
import { antSettings } from './ant.js';
import Table from './table.js'; //Import of the Table class
import { scene } from './main.js';
/// Control the Pause button with mouse click
document.getElementById('pauseButton').addEventListener('click', function() {
    togglePauseState();
});

// Control the Pause button with 'p' keypress
document.addEventListener('keypress', function(event) {
    // Check if the 'p' key was pressed
    if (event.key === 'p' || event.key === 'P') {
        togglePauseState();
    }
});

// Function to toggle the pause state
function togglePauseState() {
    var pauseButton = document.getElementById('pauseButton');
    if (controleSettings.isPaused) {
        controleSettings.isPaused=false;
        this.textContent = 'Pause';
    } else {
        controleSettings.isPaused=true;
        this.textContent = 'Reprendre';
    }
}

// Control the Restart button with mouse click
document.getElementById('restartButton').addEventListener('click', function() {
    // Refresh the page to restart the simulation
    location.reload();
});

// Control the Restart button with 'r' keypress
document.addEventListener('keypress', function(event) {
    // Check if the 'r' key was pressed
    if (event.key === 'r' || event.key === 'R') {
        // Refresh the page to restart the simulation
        location.reload();
    }
});

// Control the ant speed with mouse change
document.getElementById('antSpeed').addEventListener('change', function(event) {
    antSettings.speed = Number(event.target.value);
});

// Control the ant speed with '+' and '-' keypress
document.addEventListener('keypress', function(event) {
    // Check if the '+' key was pressed
    if (event.key === '+') {
        // Increase the speed of the ants
        antSettings.speed += 0.05;
        document.getElementById('antSpeed').value = antSettings.speed;
    }
    // Check if the '-' key was pressed
    else if (event.key === '-') {
        // Decrease the speed of the ants
        antSettings.speed -= 0.05;
        document.getElementById('antSpeed').value = antSettings.speed;
    }
});

//control ant distance
// Listen for keypress events  'd'   'f'
document.addEventListener('keypress', function(event) {
    // Check if the 'd' key was pressed
    if (event.key === 'd' || event.key === 'D') {
        // Increase the distance between ants
        antSettings.minDistanceToAnt += 0.05;
        document.getElementById('antDistance').value = antSettings.minDistanceToAnt;
    }
    // Check if the 'f' key was pressed
    else if (event.key === 'f' || event.key === 'F') {
        // Decrease the distance between ants
        antSettings.minDistanceToAnt -= 0.05;
        document.getElementById('antDistance').value = antSettings.minDistanceToAnt;
    }
});

// Control the color of the table with a dropdown
document.getElementById('backgroundSelector').addEventListener('change', function(event) {
    // Get the selected color
    var selectedColor = event.target.value;
    console.log('Selected color:', selectedColor);  // Debug line

    // Get the table mesh
    var tableMesh = scene.getObjectByName('table');
    console.log('Table mesh:', tableMesh);  // Debug line

    // Change the color of the table
    tableMesh.material.color = new THREE.Color(selectedColor);
});