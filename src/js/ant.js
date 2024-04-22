import * as THREE from 'three';

import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'; //Import of the orbital camera

export default class Ant {
    constructor(x,y,z, number, model){
        this.position = {x:x, y:y, z:z};
        this.number = number;
        this.speed = 0.25;
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
        const body = new THREE.BoxGeometry(0.01,0.01,0.01);
        const bodyMaterial = new THREE.MeshStandardMaterial({color: "green"});
        const bodyMesh = new THREE.Mesh(body, bodyMaterial);
        bodyMesh.position.set(this.position.x, this.position.y, this.position.z);
        bodyMesh.name = "ant"+this.number;
        return bodyMesh;
    }

    attachModel(scene){
        const clonedModel = this.model.clone();
        clonedModel.scale.set(this.modelSize, this.modelSize, this.modelSize);
        clonedModel.position.set(this.position.x, this.position.y, this.position.z);
        clonedModel.name = "ant"+this.number;
        scene.add(clonedModel);
    }
}