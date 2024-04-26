import * as THREE from 'three';

import Ant from './ant.js';

export default class Loop {
    constructor(FirstAnt, start, finish, listPoints,listObstacle, modelAnt){
        console.log("Loop created")
        console.log(start, finish, listPoints, listObstacle, modelAnt)
        this.start = start;
        this.finish = finish;
        this.modelAnt = modelAnt;
        this.listP = listPoints;
        this.listA = [];
        this.listA.push(FirstAnt);
        this.MaxAnt = 20;
        this.MaxWanderingAnt = 1;
        this.listO = listObstacle;
        this.counter = 1;
        
        this.typeOfLoop;
        this.intervallLaunched = false;
        this.maxPath = 20;
        this.listF = [];

        this.listLoop = [];

    }

    launchLoop(scene){
        switch(this.typeOfLoop){
            case 'normal':
                //console.log("Launch normal loop")
                this.mainLoop(scene);
                break;
            case 'wander':
                this.wanderLoop(scene);
                this.intervallLaunched = true;
                
                break;
            default:
                console.log("Error: type of loop not defined");
                break;
        }
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

    wanderLoop(scene){
        this.addAnt(scene);
        if(!this.intervallLaunched){
            this.launcIntervall(); 
        }
        for(var i =0 ; i < this.listA.length; i++){
            if(this.listA[i].pathTaken.length >= this.maxPath){
                this.listA[i].retracePath = true;
            }
            //console.log("Ant number" +this.listA[i].number +" is recalling back " + this.listA[i].retracePath);
            
            for(var f = 0; f < this.listF.length; f++){
                if(this.listA[i].distance(this.listF[f].position.x, this.listF[f].position.y, this.listF[f].position.z) <= 0.5){
                    this.listA[i].retracePath = true;
                    this.listA[i].eat = true;
                }
                else if(this.listA[i].distance(this.listF[f].position.x, this.listF[f].position.y, this.listF[f].position.z) < this.listF[f].radius && this.listA[i].retracePath == false){
                    //console.log(this.listA[i].distance(this.listF[f].position.x, this.listF[f].position.y, this.listF[f].position.z));
                    this.listA[i].targetDirection = {x: this.listF[f].position.x, y: 0, z: this.listF[f].position.z};
                }
                else{
                    //this.listF[f].growingRadius();
                }
            }
            
            this.listA[i].wander(scene);

            if(this.listA[i].eat && this.listA[i].pathTaken.length <= 1 && this.listA[i].loopLaunched == false){
                console.log("hello")

                var finish = {x: this.listA[i].goodPath[this.listA[i].goodPath.length-1].x, y: this.listA[i].goodPath[this.listA[i].goodPath.length-1].y, z: this.listA[i].goodPath[this.listA[i].goodPath.length-1].z};
                this.listLoop.push(new Loop(this.listA[i], this.listA[i].position, finish, this.listA[i].goodPath, this.listO, this.modelAnt));
                this.listLoop[this.listLoop.length -1].typeOfLoop = 'normal';
                this.listA[i].loopLaunched = true;
            }

            if(this.listLoop.length > 0){
                for(var l = 0; l < this.listLoop.length; l++){
                    //this.listLoop[l].launchLoop(scene);
                }
            }
        };
        //console.log(this.listA[0].pathTaken.length);
        
    }

    launcIntervall(){
        setInterval(() => {
            for(var i = 0; i < this.listA.length; i++){
                if(this.listA[i].pathTaken.length < this.maxPath){
                    const angle = Math.random() * Math.PI; // Random angle within 180 degrees
                    const distance = Math.random() * 50  ; // Random distance within 10 units
                    var offsetX = Math.sin(angle) * distance; // X offset based on angle and distance
                    var offsetZ = Math.cos(angle) * distance; // Z offset based on angle and distance
                    const goBehind = Math.random() * 2;
                    if(goBehind < 1){
                        offsetX = -offsetX;
                        offsetZ = -offsetZ;
                    }
                    const negativeOffsetX = -offsetX; // Negative X offset
                    const negativeOffsetZ = -offsetZ; // Negative Z offset
                    this.listA[i].targetDirection = {x: offsetX, y: 0, z: offsetZ};

                    if(this.listF.length > 0){
                        for(var f= 0; f < this.listF.length; f++){
                            this.listF[f].growingRadius();
                        }
                    }
                }
            }
        },500);
    }

    actionForAnt(scene){
        this.addAnt(scene);
        this.updateAnt();
        this.follow(scene);
        for(var i =0; i < this.listA.length; i++){this.deleteAnt(i,scene);}
    }

    follow(scene){
        if(this.listP.length <= 1){
            this.listA[0].followN(this.finish.x, this.finish.y, this.finish.z, scene);
        }
        for(var i = 1; i < this.listA.length; i++){
            this.listA[i].followPrevious(this.listA[i-1],this.listO, scene); 
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
        if(this.typeOfLoop == 'normal'){
            if(this.listA.length < this.MaxAnt && this.listA[this.listA.length-1].distance(this.start.x, this.start.y, this.start.z) > 4){
                this.listA.push(new Ant(this.start.x, this.start.y +0.5, this.start.z, this.counter, this.modelAnt));
                this.listA[this.listA.length-1].attachModel(scene);
                this.counter++;
            }
        }

        else{
            if(this.listA.length < this.MaxWanderingAnt && this.listA[this.listA.length-1].distance(this.start.x, this.start.y, this.start.z) > 4){
                this.listA.push(new Ant(this.start.x, this.start.y +0.5, this.start.z, this.counter, this.modelAnt));
                this.listA[this.listA.length-1].attachModel(scene);
                this.counter++;
            }

        }
    }

    updateAnt(){
        for(var i = 0; i < this.listA.length; i++){
            this.listA[i].updateParameter();
        }
    }








}