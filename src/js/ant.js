import * as THREE from 'three'; //Import of three js
class  Ant {
    constructor(x,y,z) {
        this.pos = {x:x, y:y, z:z};
    }

    /**
     * Create the ant
     * @returns {THREE.Group} The ant
     * @memberof Ant
     */
    createAnt() {
        const ant = new THREE.Group();
        const body = this.createBody();
        ant.add(body);
        return ant;
    }

    createBody(){
        const body = new THREE.BoxGeometry(2, 2, 2);
        const bodyMaterial = new THREE.MeshStandardMaterial({ color: "green" });
        const bodyMesh = new THREE.Mesh(body, bodyMaterial);
        bodyMesh.position.set(this.pos.x, this.pos.y, this.pos.z);
        return bodyMesh;
    }
}

export default Ant;