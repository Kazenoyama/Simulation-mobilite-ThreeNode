import * as THREE from 'three'; //Import of three js
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

class Obstacle {
    constructor(position){
        this.position = position;
        this.mesh = null;
        this.modelCoffeMugEmpty = "/src/modele/enamel_cup/scene.gltf";
        this.modelCoffeMug = "/src/modele/coffeeMug/scene.gltf";
        this.modelWhiteCoffeMug = "/src/modele/tasse_cafe/scene.gltf";
        this.scale = 1;

        this.model;
    }

    randomModel(){
        var random = Math.floor(Math.random() * 3);
        switch(random){
            case 0:
                this.model = this.modelCoffeMugEmpty;
                this.scale = 1;
                this.position.y += 0.8;
                break;
            case 1:
                this.model = this.modelCoffeMug;
                this.scale = 0.03;
                this.position.y -= 0.5;
                break;
            case 2:
                this.model = this.modelWhiteCoffeMug;
                this.scale = 20;
                this.position.y += 0.5;
                break;
            default:
                this.model = this.modelCoffeMugEmpty;
                break;
        }
    }

    createObstacle(scene){
        this.randomModel();
        console.log(this.model);
        const loader = new GLTFLoader();
        loader.load(this.model, (gltf) => {
            this.mesh = gltf.scene;
            this.mesh.scale.set(this.scale, this.scale, this.scale);
            this.mesh.position.set(this.position.x, this.position.y, this.position.z);
            scene.add(this.mesh);
        });
    }


}

export default Obstacle;