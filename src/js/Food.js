import * as THREE from 'three';

export default class Food {
    constructor(position, typeFood, name, scale,positionY, scene){
        this.name = name;
        this.position = position
        this.food  = this.createFood(typeFood,scale,positionY, name, scene);
        this.radius = 3;
        this.quantity = 40;
    }

    createFood(typeFood, scale, positionY,name, scene){
        const foodCloned = typeFood.clone();
        foodCloned.position.set(this.position.x, this.position.y, this.position.z);
        foodCloned.name = name;
        foodCloned.scale.set(scale, scale, scale);
        foodCloned.position.y += positionY;
        scene.add(foodCloned);
        return foodCloned;
    }

    growingRadius(){
        this.radius += 0.2;
    }

    decreaseQuantity(){
        this.quantity -= 1;
        console.log(this.quantity);
    }
}