export default class Food {
    constructor(name, position){
        this.name = name;
        name = name.split("_")[0];
        if(name == "bread") position.y -= 1.5;
        this.position = position;
        this.radius = 3;
        this.quantity = 40;
    }

    growingRadius(){
        this.radius += 0.2;
    }

    decreaseQuantity(){
        this.quantity -= 1;
    }
}