import * as THREE from 'three';

import Ant from './ant.js';
import { add } from 'three/examples/jsm/libs/tween.module.js';

export default class Loop {
    constructor(FirstAnt, start, finish, listPoints, modelAnt){
        this.start = start;
        this.finish = finish;
        this.modelAnt = modelAnt;
        this.listP = listPoints;
        this.listA = [];
        this.listA.push(FirstAnt);
        this.MaxAnt = 100; 
        this.listO = [];
        this.counter = 1;

    }

    mainLoop(scene){
        //Follow the path
        if(this.listP.length > 0){
            this.listA[0].followN(this.listP[0].x, this.listP[0].y, this.listP[0].z, scene);
            if(this.listA[0].position.x == this.listP[0].x  && this.listA[0].position.z == this.listP[0].z && this.listA[0].position.y == this.listP[0].y){
                this.listP.shift();
            }
            this.actionForAnt(scene);
            
        }
        //Follow the previous ant created
        else{
            this.actionForAnt(scene);
        }
    };

    actionForAnt(scene){
        this.addAnt(scene);
        this.follow(scene);
        for(var i =0; i < this.listA.length; i++){this.deleteAnt(i,scene);}
        console.log(this.listA.length);
    }

    follow(scene){
        if(this.listP.length <= 1){
            this.listA[0].followN(this.finish.x, this.finish.y, this.finish.z, scene);
        }
        for(var i = 1; i < this.listA.length; i++){
            this.listA[i].followPrevious(this.listA[i-1], scene); 
        }
    }

    deleteAnt(i,scene){
        if(this.listA[i].distance(this.finish.x, this.finish.y, this.finish.z) < 0.1){
            scene.remove(scene.getObjectByName("ant3D"+this.listA[i].number)); 
            scene.remove(scene.getObjectByName("ant"+this.listA[i].number)); 
            this.listA.splice(i,1);
        }
    }

    addAnt(scene){
        if(this.listA.length < this.MaxAnt && this.listA[this.listA.length-1].distance(this.start.x, this.start.y, this.start.z) > 4){
            this.listA.push(new Ant(this.start.x, this.start.y +0.5, this.start.z, this.counter, this.modelAnt));
            this.listA[this.listA.length-1].attachModel(scene);
            this.counter++;
        }
    }






}