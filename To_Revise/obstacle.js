import * as THREE from 'three';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';

export default class Obstacle {
    constructor(position, scale, typeOfMug){
        this.position = position;
        this.scale = scale;
        this.typeOfMug = typeOfMug;

    }

    placeObstacle(scene){
        const clonedModel = this.typeOfMug.clone();
        clonedModel.scale.set(this.scale, this.scale, this.scale);
        clonedModel.position.set(this.position.x, this.position.y, this.position.z);
        clonedModel.name = "obstacle"+this.position.x+this.position.z;
        scene.add(clonedModel);
    }
}