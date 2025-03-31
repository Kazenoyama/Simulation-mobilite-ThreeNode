import * as THREE from 'three';

export default class Pheromone {
    constructor(position) {
        this.position = position;
        this.intensity = 1.0;
        this.lifetime = 1000; // durée de vie en millisecondes
        this.createdAt = Date.now();
        this.particles = null;
    }

    createParticleSystem(scene) {
        const particleCount = 50;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        
        // Couleur verte pour les phéromones
        const color = new THREE.Color(0, 1, 0);
        
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = this.position.x + (Math.random() - 0.5) * 2;
            positions[i * 3 + 1] = this.position.y + (Math.random() - 0.5) * 2;
            positions[i * 3 + 2] = this.position.z + (Math.random() - 0.5) * 2;
            
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.1,
            vertexColors: true,
            transparent: true,
            opacity: 0.6
        });

        this.particles = new THREE.Points(geometry, material);
        scene.add(this.particles);
    }

    update() {
        const age = Date.now() - this.createdAt;
        this.intensity = Math.max(0, 1 - (age / this.lifetime));
        
        if (this.particles) {
            this.particles.material.opacity = 0.6 * this.intensity;
        }

        return this.intensity > 0;
    }

    remove(scene) {
        if (this.particles) {
            scene.remove(this.particles);
        }
    }
} 