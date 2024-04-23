import * as THREE from 'three';

export default class Loop {
    constructor(FirstAnt, start, finish, listPoints){
        this.start = start;
        this.finish = finish;
        this.listP = listPoints;
        this.listA = [];
        this.listA.push(FirstAnt);
        this.listO = [];

    }

    mainLoop(scene){
        
        if(this.listP.length > 0){
            this.listA[0].followN(this.listP[0].x, this.listP[0].y, this.listP[0].z, scene);
            if(this.listA[0].position.x == this.listP[0].x  && this.listA[0].position.z == this.listP[0].z && this.listA[0].position.y == this.listP[0].y){
                this.listP.shift();
            }
        }
    };






}