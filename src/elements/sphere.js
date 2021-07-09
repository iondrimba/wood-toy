import * as THREE from 'three';

class Sphere {
  constructor() {
    this.mesh = null;
  }

  static loadTextures() {
    const urls = [
      'assets/envmap/posx.jpg',
      'assets/envmap/negx.jpg',
      'assets/envmap/posy.jpg',
      'assets/envmap/negy.jpg',
      'assets/envmap/posz.jpg',
      'assets/envmap/negz.jpg'
    ];

    Sphere.texture = new THREE.CubeTextureLoader().load(urls);
  }

  static buildMaterial() {
    const material = new THREE.MeshPhysicalMaterial({
      color: '#ffffff',
      roughness: 0,
      metalness: .8,
      emissive: '#000000',
      envMap: Sphere.texture,
    });

    material.clearcoatRoughness = 0;
    material.clearcoat = 0;
    material.reflectivity = 1;

    Sphere.material = material;
  }

  build() {
    const sphere = new THREE.Mesh(new THREE.SphereBufferGeometry(.5, 16, 16), new THREE.MeshStandardMaterial({ color: '#ff00ff' }));
    this.mesh = sphere;
    this.mesh.material.name = 'sphere';
    this.mesh.material.needsUpdate = true;
    this.mesh.material.opacity = 0;
    this.mesh.material.alphaTest = 1;
    this.mesh.position.y = 22;
    this.mesh.position.z = 0;

    const leftSide = new THREE.Mesh(new THREE.SphereBufferGeometry(.5, 16, 16, 0, 3.15), new THREE.MeshPhysicalMaterial({
      color: '#ffffff',
      roughness: .1,
      metalness: .2,
      emissive: '#000000',
    }));
    leftSide.rotation.y = THREE.MathUtils.degToRad(-90);
    leftSide.castShadow = true;
    leftSide.receiveShadow = true;
    this.mesh.add(leftSide);

    const rightSide = new THREE.Mesh(new THREE.SphereBufferGeometry(.5, 16, 16, 0, 3.15), Sphere.material);
    rightSide.rotation.y = THREE.MathUtils.degToRad(90);
    rightSide.castShadow = true;
    rightSide.receiveShadow = true;
    this.mesh.add(rightSide);

    this.mesh.body = new CANNON.Body({
      mass: 2,
      material: new CANNON.Material(),
      shape: new CANNON.Sphere(.5),
      position: new CANNON.Vec3(0, sphere.position.y, 0),
    });

    this.mesh.body.material.name = 'sphere';
    this.mesh.body.fixedRotation = true;
    this.mesh.body.sleepSpeedLimit = 0.1;
    this.mesh.body.sleepTimeLimit = .5;
  }
}

export default Sphere;
