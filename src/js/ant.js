import * as THREE from 'three';

import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'; //Import of the orbital camera

export default class Ant {
    constructor(x,y,z, number, model){
        this.position = {x:x, y:y, z:z};
        this.number = number;
        this.speed = 0.10;
        this.model = model;
        this.modelSize = 0.015;
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
        var dx = x - this.pos.x;
        var dy = y - this.pos.y;
        var dz = z - this.pos.z;
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

        var ant3D = scene.getObjectByName("ant3D"+this.number);
        var direction = new THREE.Vector3(x, y+0.5, z);
        ant3D.position.set(this.position.x, this.position.y+0.5, this.position.z);
        this.rotateModel(ant3D, direction);
    }

    rotateModel(ant3D, direction){
        const lookAtVector = new THREE.Vector3().copy(direction).sub(ant3D.position);
        ant3D.quaternion.setFromUnitVectors(new THREE.Vector3(1,0,0), lookAtVector.clone().normalize());
        ant3D.rotateY(Math.PI);
        ant3D.updateMatrixWorld(true);
    }
}