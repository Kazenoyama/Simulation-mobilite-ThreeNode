import * as THREE from 'three';
import Framework from '../../framework/js/framework.js';

export let antSettings = {
    speed: 0.2,
    minDistance: 4
};

export default class Ant{
    position = {x:0, y:0, z:0};
    speed = antSettings.speed;
    modelSize = 0.015;
    minDistance = antSettings.minDistance;
    targetDirection = {x:0, y:0, z:0};
    pathTaken = [];
    retracePath = false;
    callback = true;
    goodPath = [];
    arrived = false;
    eat = false;
    loopLaunched = false;
    foodEaten = null;
    type = "";
    fw = null;

    constructor(x,y,z, model, fw){
        console.log('Ant constructor');
        this.position = {x:x, y:y, z:z};
        this.fw = fw;

    }

    async createAnt(counter){
        console.log('createAnt');
        var ant = await this.fw.create_copy("ant", {size :0.015,timeToWait : 200,counter : counter});
        ant.position.set(this.position.x, this.position.y+20, this.position.z );
        this.number = ant.name.split("ant_copy")[1];
        return ant;
    }

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
        var ant = scene.getObjectByName("ant_copy"+this.number);
        
        var direction = new THREE.Vector3(x, y+0.5, z);
        ant.position.set(this.position.x, this.position.y+0.5, this.position.z);
        this.rotateModel(ant, direction);
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

        var ant = scene.getObjectByName("ant_copy"+this.number);
        // var direction = new THREE.Vector3(ant.position.x, ant.position.y, ant.position.z);
        var direction = new THREE.Vector3(0,10,0);
        ant.position.set(this.position.x, this.position.y+0.5, this.position.z);
        this.rotateModel(ant, direction);
    }

    rotateModel(ant3D, direction){
        //TODO: Rotate the model to face the direction
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

    updateParameter(){
        this.speed = antSettings.speed;
        this.minDistance = antSettings.minDistance;
    }

}