import * as THREE from 'three';

export let antSettings = {
    speed: 0.1,
    minDistance: 4
};

export default class Ant {
    constructor(x,y,z, number, model){
        this.position = {x:x, y:y, z:z};
        this.number = number;
        this.speed = antSettings.speed;
        this.model = model;
        this.modelSize = 0.015;

        this.minDistance = antSettings.minDistance;

        this.targetDirection = {x:0, y:0, z:0};
        this.pathTaken = [];
        this.retracePath = false;
        this.callback = true;
        this.goodPath =[];
        this.arrived = false;

        this.eat =false;
        this.loopLaunched = false;
        this.foodEaten = null;
        this.type = "";
    }

    createAnt(){
        const ant = new THREE.Group();
        const body = this.createBody();
        this.body = body;
        ant.add(body);
        return ant;
    }

    createBody(){
        const body = new THREE.BoxGeometry(10,10,10);
        const bodyMaterial = new THREE.MeshStandardMaterial({color: "black"});
        const bodyMesh = new THREE.Mesh(body, bodyMaterial);
        bodyMesh.position.set(this.position.x, this.position.y, this.position.z);
        bodyMesh.name = "ant"+this.number;
        return bodyMesh;
    }

    attachModel(scene){
        const clonedModel = this.model.clone();
        clonedModel.scale.set(this.modelSize, this.modelSize, this.modelSize);
        clonedModel.position.set(this.position.x, this.position.y, this.position.z);
        clonedModel.name = "ant3D"+this.number;
        scene.add(clonedModel);
    }

    //Check the distance between the ant and the point
    distance(x,y,z){
        var dx = x - this.position.x;
        var dy = y - this.position.y;
        var dz = z - this.position.z;
        return Math.sqrt(dx*dx + dy*dy + dz*dz);
    }

    followN(x,y,z,scene){
        var dx = x - this.position.x;
        var dy = y - this.position.y;
        var dz = z - this.position.z;
        var speedX, speedY, speedZ;

        var maxDistance = Math.max(Math.abs(dx), Math.abs(dy), Math.abs(dz));

        if(maxDistance > this.speed){
            speedX = dx * this.speed / maxDistance;
            speedY = dy * this.speed / maxDistance;
            speedZ = dz * this.speed / maxDistance;
        }
        else{
            speedX = dx;
            speedY = dy;
            speedZ = dz;
        }

        this.position.x += speedX;
        this.position.y += speedY;
        this.position.z += speedZ;

        if(this.type == "Wandering"){
            var ant3D = scene.getObjectByName("Wanderingant3D"+this.number);
            //console.log(ant3D);
        }
        else{
            var ant3D = scene.getObjectByName("ant3D"+this.number);
        }
        
        var direction = new THREE.Vector3(x, y+0.5, z);
        ant3D.position.set(this.position.x, this.position.y+0.5, this.position.z);
        this.rotateModel(ant3D, direction);
    }

    followPrevious(ant,listO, scene){
        var dx = ant.position.x - this.position.x;
        var dy = ant.position.y - this.position.y;
        var dz = ant.position.z - this.position.z;
        var speedX, speedY, speedZ;
        var distanceToAnt = this.distance(ant.position.x, ant.position.y, ant.position.z);
        if(distanceToAnt < this.minDistance){
            speedX = 0;
            speedY = 0;
            speedZ = 0;
        }
        else{
            var maxDistance = Math.max(Math.abs(dx), Math.abs(dy), Math.abs(dz));
            if(maxDistance > this.speed){
                speedX = dx * this.speed / maxDistance;
                speedY = dy * this.speed / maxDistance;
                speedZ = dz * this.speed / maxDistance;
            }
            else{
                speedX = dx;
                speedY = dy;
                speedZ = dz;
            }

            speedX, speedY, speedZ = this.avoidObstacle(speedX, speedY, speedZ, listO);
        }

        this.position.x += speedX;
        this.position.y += speedY;
        this.position.z += speedZ;

        if(this.type == "Wandering"){
            var ant3D = scene.getObjectByName("Wanderingant3D"+this.number);
            
        }
        else{
            var ant3D = scene.getObjectByName("ant3D"+this.number);
        }
        var direction = new THREE.Vector3(ant.position.x, ant.position.y+0.5, ant.position.z);
        ant3D.position.set(this.position.x, this.position.y+0.5, this.position.z);
        this.rotateModel(ant3D, direction);
    }

    rotateModel(ant3D, direction){
        const lookAtVector = new THREE.Vector3().copy(direction).sub(ant3D.position);
        ant3D.quaternion.setFromUnitVectors(new THREE.Vector3(1,0,0), lookAtVector.clone().normalize());
        ant3D.rotateY(Math.PI);
        ant3D.updateMatrixWorld(true);
    }

    avoidObstacle(sX, sY, sZ, listO){
        for(var i = 0; i < listO.length; i++){
            var dx = listO[i].position.x - this.position.x;
            var dz = listO[i].position.z - this.position.z;
            if(Math.abs(dx) < 2 && Math.abs(dz) < 2){
                if(dx < 0 && dz >= 0){
                    sX -= sX;
                    sZ = sZ;
                }
                else{
                    sX = dx;
                    sZ -= dz;
                }
            }
        }
        return sX, sY, sZ;
    }

    wander(scene){
        if(this.retracePath){
            this.followN(this.pathTaken[this.pathTaken.length-1].x, this.pathTaken[this.pathTaken.length-1].y, this.pathTaken[this.pathTaken.length-1].z, scene);
            if(this.distance(this.pathTaken[this.pathTaken.length-1].x, this.pathTaken[this.pathTaken.length-1].y, this.pathTaken[this.pathTaken.length-1].z) < 0.1 && this.pathTaken.length > 1){
                this.pathTaken.pop();    
            }
            if((this.pathTaken.length <= 1 && !this.arrived)|| !this.callback){
                this.arrived = true;
            }
        }
        else{
            var targetX = this.targetDirection.x; // Calculate target X position
            var targetZ = this.targetDirection.z; // Calculate target Z positichaon

            if(targetX > 24 ){
                targetX = targetX - (targetX - 24);
                targetZ = targetZ;
            }
            if(targetX < -24){
                targetX = targetX - (targetX + 24);
                targetZ = targetZ;
            }
            if(targetZ > 24){
                targetZ = targetZ - (targetZ - 24);
                targetX = targetX;
            }
            if(targetZ < -24){
                targetZ = targetZ - (targetZ + 24);
                targetX = targetX;
            }

            

            this.followN(targetX, this.position.y, targetZ, scene); // Call followN with the modified target position
            this.addToPathTaken(this.position.x, this.position.y, this.position.z); // Add the current position to the path taken
        }

    }

    addToPathTaken(x,y,z){
        if(this.pathTaken.length <= 0){
            this.pathTaken.push({x:x, y:y, z:z});
            this.goodPath.push({x:x, y:y, z:z});
        }
        if(this.pathTaken[this.pathTaken.length-1].x != x &&
            this.pathTaken[this.pathTaken.length-1].z != z &&
            (Math.abs(this.pathTaken[this.pathTaken.length-1].x - x) > 4 ||
            Math.abs(this.pathTaken[this.pathTaken.length-1].z - z) > 4)){
            this.pathTaken.push({x:x, y:y, z:z});
            this.goodPath.push({x:x, y:y, z:z});
        } 
    }

    updateParameter(){
        this.speed = antSettings.speed;
        this.minDistance = antSettings.minDistance;
    }


}