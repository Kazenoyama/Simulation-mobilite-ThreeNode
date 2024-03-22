import * as THREE from 'three'; //Import of three js
class  Ant {
    constructor(x,y,z) {
        this.pos = {x:x, y:y, z:z};
        this.speed = 0.25;
        this.body;
        this.minDistanceToAnt = 6;

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

    createBody(){
        const body = new THREE.BoxGeometry(2, 2, 2);
        const bodyMaterial = new THREE.MeshStandardMaterial({ color: "green" });
        const bodyMesh = new THREE.Mesh(body, bodyMaterial);
        bodyMesh.position.set(this.pos.x, this.pos.y, this.pos.z);
        return bodyMesh;
    }

    /**
     * Follow a path given point by point
     * @param {x axis} x 
     * @param {y axis} y 
     * @param {z axis} z 
     */
    followN(x,y,z){
        console.log("FollowN")
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
    }
}

export default Ant;