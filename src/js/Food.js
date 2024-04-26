import * as THREE from 'three';

export default class Food {
    constructor(position, typeFood, scene){
        this.position = position
        this.createFood(typeFood, scene);
        this.radius = 3;
        this.quantity = 100;
    }

    createFood(typeFood, scene){
        const foodCloned = typeFood.clone();
        foodCloned.position.set(this.position.x, this.position.y, this.position.z);
        foodCloned.name = typeFood.name;
        if(foodCloned.name === 'bread'){
            foodCloned.scale.set(0.5, 0.5, 0.5);
            foodCloned.position.y += 1.5;

        }
        scene.add(foodCloned);
        this.food = foodCloned;
    }

    growingRadius(){
        this.radius += 0.2;
    }

    decreaseQuantity(){
        this.quantity -= 1;
    }
}