import * as THREE from 'three';

import Ant from './ant.js';

export default class Loop {
    constructor(FirstAnt, start, finish, listPoints,listObstacle, modelAnt, fw){
        console.log("Loop created");
        this.fw = fw;

        this.name;
        this.antStart = FirstAnt;
        this.start = start;
        this.finish = finish;
        this.modelAnt = modelAnt;
        this.listP = listPoints;
        this.listA = [];
        this.listA.push(FirstAnt);
        this.MaxAnt = 50;
        this.MaxWanderingAnt = 4;
        this.listO = listObstacle;
        this.counter = 1 + FirstAnt.number * 1000;
        console.log(this.listO.length);
        
        this.typeOfLoop;
        this.intervallLaunched = false;
        this.maxPath = 100;
        this.listF = [];

        this.listLoop = [];
        this.stop = false;
        this.deleteLoop = false;
        this.foodToEat = null;
    }

    launchLoop(scene){
        switch(this.typeOfLoop){
            case 'normal':
                //console.log("Normal loop launched");
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

    async mainLoop(scene){
        //Follow the path
        if(this.listP.length > 0){
            this.listA[0].followN(this.listP[0].x, this.listP[0].y, this.listP[0].z, scene);
            if(this.listA[0].position.x == this.listP[0].x  && this.listA[0].position.z == this.listP[0].z && this.listA[0].position.y == this.listP[0].y){
                this.listP.shift();
            }
            await this.actionForAnt(scene);
            
        }
        //Follow the previous ant created
        else{
            await this.actionForAnt(scene);
        }
    };

    async actionForAnt(scene){
        if(!this.stop) await this.addAnt(scene);
        this.updateAnt();
        this.follow(scene);
        for(var i =0; i < this.listA.length; i++){this.deleteAnt(i,scene);}
        if(this.listA.length <= 0){
            this.deleteLoop = true;
        }
    }

    async wanderLoop(scene){
        this.addAnt(scene);

        this.deleteFood(scene);

        if(!this.intervallLaunched){
            this.launchIntervall(); 
        }
        for(var i =0 ; i < this.listA.length; i++){
            if(this.listA[i].pathTaken.length >= this.maxPath){
                this.listA[i].retracePath = true;
            }

            for(var f = 0; f < this.listF.length; f++){
                if(this.listA[i].distance(this.listF[f].position.x, this.listF[f].position.y, this.listF[f].position.z) <= 1 && this.listA[i].eat == false){
                    this.listA[i].foodEaten = this.listF[f];
                    this.listA[i].retracePath = true;
                    this.listA[i].eat = true;
                }
                else if(this.listA[i].distance(this.listF[f].position.x, this.listF[f].position.y, this.listF[f].position.z) < this.listF[f].radius && this.listA[i].retracePath == false){
                    this.listA[i].targetDirection = {x: this.listF[f].position.x, y: 0, z: this.listF[f].position.z};
                }
                // else{
                //     //this.listF[f].growingRadius();
                // }
            }
            if(this.listA[i].loopLaunched == false){
                this.listA[i].wander(scene);
            }
            

            if(this.listA[i].eat && this.listA[i].pathTaken.length <= 1 && this.listA[i].loopLaunched == false){
                var finish = {x: this.listA[i].goodPath[this.listA[i].goodPath.length-1].x, y: this.listA[i].goodPath[this.listA[i].goodPath.length-1].y, z: this.listA[i].goodPath[this.listA[i].goodPath.length-1].z};
                var start = {x: this.listA[i].goodPath[0].x, y: this.listA[i].goodPath[0].y, z: this.listA[i].goodPath[0].z};
                this.listLoop.push(new Loop(this.listA[i], start, finish, this.listA[i].goodPath, this.listO, this.modelAnt, this.fw));
                this.listLoop[this.listLoop.length -1].typeOfLoop = 'normal';
                this.listLoop[this.listLoop.length -1].name = "loop"+this.listA[i].number;
                this.listLoop[this.listLoop.length -1].foodToEat = this.listA[i].foodEaten;
                this.listA[i].loopLaunched = true;
            }

            if(this.listLoop.length > 0){
                for(var l = 0; l < this.listLoop.length; l++){
                    this.listLoop[l].launchLoop(scene);
                    if(this.listLoop[l].deleteLoop){
                        console.log("Loop deleted");
                        for(var a = 0; a < this.MaxWanderingAnt; a++){
                            if(this.listLoop[l].antStart.number == this.listA[a].number){
                                var ant = this.listA[a];
                                console.log("Ant found")
                                ant.position = {x: this.start.x, y: this.start.y+0.5, z: this.start.z};
                                ant.pathTaken = [];
                                ant.goodPath = [];
                                ant.pathTaken.push({x: this.start.x, y: this.start.y, z: this.start.z});
                                
                                ant.arrived = false;
                                ant.eat = false;
                                ant.foodEaten = null;
                                
                                ant.retracePath = false;
                                ant.retracePath = false;
                                ant.loopLaunched = false;
                                
                            }
                        }
                       this.listLoop.splice(l,1);
                    }
                }
            }
            
        };   
    }

    deleteFood(scene){
        for(var f = 0; f < this.listF.length; f++){
            if(this.listF[f].quantity <= 0){
                var wait = false;
                
                for(var l = 0; l < this.listLoop.length; l++){
                    if(this.listLoop[l].foodToEat.name == this.listF[f].name){
                        wait = true;
                    }
                }
                if(!wait){
                    console.log('Food deleted');
                    scene.remove(scene.getObjectByName(this.listF[f].name));
                    this.listF.splice(f,1);
                }
            }
        }
    }

    launchIntervall(){
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

    follow(scene){
        if(this.listP.length <= 1){
            this.listA[0].followN(this.finish.x, this.finish.y, this.finish.z, scene);
        }
        for(var i = 1; i < this.listA.length; i++){
            this.listA[i].followPrevious(this.listA[i-1],this.listO, scene); 
        }
    }

    deleteAnt(i,scene){
        if(this.listA[i].type != "Wandering"){
            if(this.listA[i].distance(this.finish.x, this.finish.y, this.finish.z) < 0.1){
                this.fw.delete_copy("ant_copy"+this.listA[i].number);
                this.listA.splice(i,1);
            }
        }
        else{
            if(this.listA[i].distance(this.finish.x, this.finish.y, this.finish.z) < 0.1){
                this.listA.splice(i,1);
            }
        }
    }

    async addAnt(){
        if(this.typeOfLoop == 'normal'){
            if(this.listA.length < this.MaxAnt && this.listA[this.listA.length-1].distance(this.start.x, this.start.y, this.start.z) > 4){
                this.listA.push(new Ant(this.start.x, this.start.y +0.5, this.start.z, this.modelAnt, this.fw));
                await this.listA[this.listA.length-1].createAnt(this.counter);
                this.counter++;
                if(this.foodToEat != null){
                    this.foodToEat.decreaseQuantity();
                    if(this.foodToEat.quantity <= 0){
                        this.stop = true;
                    }
                }
            }
        }

        else{
            if(this.listA.length < this.MaxWanderingAnt && this.listA[this.listA.length-1].distance(this.start.x, this.start.y, this.start.z) > 4){
                var ant = new Ant(this.start.x, this.start.y +0.5, this.start.z,this.modelAnt, this.fw);
                this.listA.push(ant);
                await ant.createAnt(this.counter);
                this.counter++;
                ant.type = "Wandering";
            }
        }
    }

    updateAnt(){
        for(var i = 0; i < this.listA.length; i++){
            //this.listA[i].updateParameter();
        }
    }








}