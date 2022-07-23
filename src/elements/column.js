import * as THREE from 'three';

class Column {
  constructor() {
    this.mesh = null;
  }

  static buildMaterial() {
    const material = new THREE.MeshPhysicalMaterial({
      color: '#ffffff',
      roughness: .1,
      metalness: .4,
      emissive: '#000000',
    });

    material.clearcoatRoughness = 0;
    material.clearcoat = 0;
    material.reflectivity = 1;
    material.aoMapIntensity = .5;
    material.displacementScale = 0;
    material.displacementBias = 0;
    material.aoMap = new THREE.TextureLoader().load('assets/roughwood/ambientOcclusion.avif');
    material.displacementMap = new THREE.TextureLoader().load('assets/roughwood/height.png');
    material.roughnessMap = new THREE.TextureLoader().load('assets/roughwood/roughness.avif');
    material.normalMap = new THREE.TextureLoader().load('assets/roughwood/normal.avif');
    material.map = new THREE.TextureLoader().load('assets/roughwood/basecolor.avif');
    material.normalScale = new THREE.Vector2(6, 2);

    material.map.wrapS = THREE.RepeatWrapping;
    material.map.wrapT = THREE.RepeatWrapping;
    material.map.repeat.x = .1;
    material.map.repeat.y = 2;

    Column.material = material;
  }

  build() {
    const geometry = new THREE.BoxBufferGeometry(1.5, .2, 24, 16, 16);
    const column = new THREE.Mesh(geometry, Column.material);
    this.mesh = column;
    this.mesh.rotateX(Math.PI / 2);
    this.mesh.receiveShadow = true;
    this.mesh.castShadow = true;
    this.cylinder = new THREE.Mesh(new THREE.CylinderGeometry(.25, .25, .2, 32), new THREE.MeshPhysicalMaterial({
      color: '#ffffff',
      roughness: 1,
      metalness: 0,
      emissive: '#000000',
    }));

    this.cylinder.receiveShadow = true;
    this.cylinder.castShadow = true;
  }
}

export default Column;
