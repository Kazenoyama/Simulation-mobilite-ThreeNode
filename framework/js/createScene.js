import * as THREE from 'three';
import Table from './table';


class createScene {

    createScene(){}

    createPlane(width, height, texture, type = "floor"){
        let plane;
        if(type === "floor"){
            plane = new THREE.Mesh(
                new THREE.PlaneGeometry(width, width, 1, 1),
                new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide })
            );
        }
        else if(type === "wall"){
            plane = new THREE.Mesh(
                new THREE.PlaneGeometry(width, height, 1, 1),
                new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide })
            );
        }
        else{
            plane = new THREE.Mesh(
                new THREE.PlaneGeometry(width, height, 1, 1),
                new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide })
            );
        }
        return plane;
    }

    createBox(scene, textures, fw, dimensions, YoffSet){
        const floor_texture = fw.loadTexture(textures[0], {repeat : 6});
        const ground = this.createPlane(dimensions.x, dimensions.y, floor_texture);
        ground.rotation.x = Math.PI / 2;
        ground.position.y = YoffSet;
        scene.add(ground);

        const wall_texture = fw.loadTexture(textures[1], {repeat : 2});
        const wall1 = this.createPlane(dimensions.x,dimensions.y, wall_texture, "wall");
        wall1.position.z = ground.position.z - ground.geometry.parameters.width / 2;
        wall1.position.y = ground.position.y + wall1.geometry.parameters.height / 2;
        scene.add(wall1);

        const wall2 = this.createPlane(dimensions.x,dimensions.y, wall_texture, "wall");
        wall2.position.z = ground.position.z + ground.geometry.parameters.width / 2;
        wall2.position.y = ground.position.y + wall2.geometry.parameters.height / 2;
        scene.add(wall2);

        const wall3 = this.createPlane(dimensions.x,dimensions.y, wall_texture, "wall");
        wall3.position.x = ground.position.x - ground.geometry.parameters.width / 2;
        wall3.position.y = ground.position.y + wall3.geometry.parameters.height / 2;
        wall3.rotation.y = Math.PI / 2;
        scene.add(wall3);

        const wall4 = this.createPlane(dimensions.x,dimensions.y, wall_texture, "wall");
        wall4.position.x = ground.position.x + ground.geometry.parameters.width / 2;
        wall4.position.y = ground.position.y + wall4.geometry.parameters.height / 2;
        wall4.rotation.y = Math.PI / 2;
        scene.add(wall4);

        const ceiling_texture = fw.loadTexture(textures[2], {repeat : 6});
        const ceiling = this.createPlane(dimensions.x,dimensions.y, ceiling_texture);
        ceiling.rotation.x = Math.PI / 2;
        ceiling.position.y = ground.position.y + wall1.geometry.parameters.height;
        scene.add(ceiling);
    }

    createTable(scene, fw, {width, depth}){
        let table = new Table(width,depth);
        scene.add(table.getTable());
        fw.attachLight( table.getTable(),{color : 'white', intensity :  1, name : "tableLight"});
        return table.getTable();
    }
}

export default createScene;