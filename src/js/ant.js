import * as THREE from 'three'; //Import of three js
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'; //Import of the orbital camera
// export let antSpeed = 0.1; //Export of the ant speed to use it in other modules
export let antSettings = {
    speed: 0.1,// initial speed value
    minDistanceToAnt: 6 // minimum distance between ants
};

class  Ant {
    constructor(x,y,z, number) {
        this.pos = {x:x, y:y, z:z};
        this.speed = antSettings.speed;
        this.body;
        this.minDistanceToAnt = antSettings.minDistanceToAnt;
        this.drawingAnt = false;
        this.point = [];
        this.number = number;
        this.point.push(new THREE.Vector3(this.pos.x, this.pos.y, this.pos.z));

        this.color = this.randomColor();
        this.path = '/src/modele/ant/ant/scene.gltf'

        this.createAnt();
    }

    /**
     * Create the ant
     * @returns {THREE.Group} The ant
     * @memberof Ant
     */
    createAnt() {
        const ant = new THREE.Group();
        const body = this.createBody();
        this.body = body;
        ant.add(body);
        return ant;
    }
    // bug here  : created ant will be ant1, ant2 ...etc instead of ant3d1 etc ... 
    createBody(){
        const body = new THREE.BoxGeometry(0.01, 0.01, 0.01);
        const bodyMaterial = new THREE.MeshStandardMaterial({ color: "green" });
        const bodyMesh = new THREE.Mesh(body, bodyMaterial);
        bodyMesh.position.set(this.pos.x, this.pos.y, this.pos.z);
        bodyMesh.name = "ant3D" + this.number;
        return bodyMesh;
    }

    /**
     * Follow a path given point by point
     * @param {x axis} x 
     * @param {y axis} y 
     * @param {z axis} z 
     */
    followN(x,y,z){
        //console.log("FollowN")
        var dx = x - this.pos.x;
        var dy = y - this.pos.y;
        var dz = z - this.pos.z;
        var maxDistance = Math.max(Math.abs(dx), Math.abs(dy), Math.abs(dz));
        if (maxDistance >= this.speed) {
            var ratio = this.speed / maxDistance; // Ratio to limit speed
            var speedX = dx * ratio;
            var speedY = dy * ratio;
            var speedZ = dz * ratio;
        }
        else {
            var speedX = dx;
            var speedY = dy;
            var speedZ = dz;
        }

        //console.log("SpeedX: " + speedX + " SpeedY: " + speedY + " SpeedZ: " + speedZ);
        this.pos.x += speedX;
        this.pos.y += speedY;
        this.pos.z += speedZ;
        this.body.position.x = this.pos.x;
        this.body.position.y = this.pos.y+ this.body.geometry.parameters.height/2 + 0.1;
        this.body.position.z = this.pos.z;
    }

    //Check the distance between the ant and the point
    distance(x,y,z){
        var dx = x - this.pos.x;
        var dy = y - this.pos.y;
        var dz = z - this.pos.z;
        return Math.sqrt(dx*dx + dy*dy + dz*dz);
    }

    //Follow the previous ant
    followPrevious(ant) {
        //console.log("FollowPrevious")
        var dx = ant.pos.x - this.pos.x;
        var dy = ant.pos.y - this.pos.y;
        var dz = ant.pos.z - this.pos.z;
        var distanceToAnt = this.distance(ant.pos.x, ant.pos.y, ant.pos.z);
        
        if (distanceToAnt < this.minDistanceToAnt) {
            // If too close to ant, stop moving
            var speedX = 0;
            var speedY = 0;
            var speedZ = 0;
        } else {
            var maxDistance = Math.max(Math.abs(dx), Math.abs(dy), Math.abs(dz));
            if (maxDistance >= this.speed) {
                var ratio = this.speed / maxDistance; // Ratio to limit speed
                var speedX = dx * ratio;
                var speedY = dy * ratio;
                var speedZ = dz * ratio;
            } else {
                var speedX = dx;
                var speedY = dy;
                var speedZ = dz;
            }
        }
    
        this.pos.x += speedX;
        this.pos.y += speedY;
        this.pos.z += speedZ;
        this.body.position.x = this.pos.x;
        this.body.position.y = this.pos.y + this.body.geometry.parameters.height / 2 + 0.1;
        this.body.position.z = this.pos.z;

        if (this.drawingAnt) {
            //console.log("Drawing ant")
            this.point.push(new THREE.Vector3(this.pos.x, this.pos.y, this.pos.z));
        }
    }

    traceLine(scene){
        
        if (this.point.length > 1){
            const material = new THREE.LineBasicMaterial( { color: this.color, linewidth: 1, linejoin: 'round'} );
            const geometry = new THREE.BufferGeometry().setFromPoints( this.point );
            const line = new THREE.Line( geometry, material );
            scene.add( line );

        }

    }

    randomColor(){
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++){
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

}

export default Ant;