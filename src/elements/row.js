import * as THREE from 'three';

class Row {
  constructor(world) {
    this.mesh = null;
    this.world = world;
  }

  static buildMaterial () {
    const material = new THREE.MeshPhysicalMaterial({
      color: '#ffffff',
      roughness: 0,
      metalness: 0,
      emissive: '#000000',
    });

    material.clearcoatRoughness = 0;
    material.clearcoat = 0;
    material.reflectivity = 1;
    material.aoMapIntensity = .5;
    material.displacementScale = 0;
    material.displacementBias = 0;
    material.aoMap = new THREE.TextureLoader().load('assets/plywood/ambientOcclusion.avif');
    material.displacementMap = new THREE.TextureLoader().load('assets/plywood/height.avif');
    material.roughnessMap = new THREE.TextureLoader().load('assets/plywood/roughness.avif');
    material.normalMap = new THREE.TextureLoader().load('assets/plywood/normal.avif');
    material.map = new THREE.TextureLoader().load('assets/plywood/basecolor.avif');

    material.normalScale = new THREE.Vector2(1.5, 0);
    material.map.wrapS = THREE.RepeatWrapping;
    material.map.wrapT = THREE.RepeatWrapping;
    material.map.repeat.x = 1;
    material.map.repeat.y = .1;

    Row.material = material;
  }

  build({ size }) {
    this.mesh = new THREE.Object3D();
    const geometry = new THREE.BoxBufferGeometry(size, 1, .1, 16, 16);
    const cannonSize = size * .5; // half size

    this.front = new THREE.Mesh(geometry, Row.material);
    this.front.receiveShadow = true;
    this.front.castShadow = true;
    this.front.position.y = 2.5;
    this.front.position.z = .5;
    this.front.body = new CANNON.Body({
      mass: 0,
      inertia: 1,
      force: 10,
      material: new CANNON.Material(),
      shape: new CANNON.Box(new CANNON.Vec3(cannonSize, .5, .05)),
    });

    this.mesh.add(this.front);
    this.world.addBody(this.front.body);

    this.back = new THREE.Mesh(geometry, Row.material);
    this.back.receiveShadow = true;
    this.back.castShadow = true;
    this.back.position.y = 2.5;
    this.back.position.z = -.5;
    this.back.body = new CANNON.Body({
      mass: 0,
      inertia: 1,
      force: 10,
      material: new CANNON.Material(),
      shape: new CANNON.Box(new CANNON.Vec3(cannonSize, .5, .05)),
    });
    this.mesh.add(this.back);
    this.world.addBody(this.back.body);

    this.bottom = new THREE.Mesh(new THREE.BoxBufferGeometry(size, .9, .1, 16, 16), Row.material);
    this.bottom.receiveShadow = true;
    this.bottom.castShadow = true;
    this.bottom.body = new CANNON.Body({
      mass: 0,
      material: new CANNON.Material(),
      shape: new CANNON.Box(new CANNON.Vec3(cannonSize, .05, .5)),
    });

    this.mesh.add(this.bottom);
    this.world.addBody(this.bottom.body);
  }

  position({ x, y, z, gutter }) {
    this.mesh.position.set(x, y, z);
    this.bottom.position.y = 2.05;
    this.bottom.position.z = z;

    this.bottom.position.x = gutter;
    this.front.body.position = new CANNON.Vec3(this.front.position.x + x, this.front.position.y + y, this.front.position.z + z);
    this.back.body.position = new CANNON.Vec3(this.back.position.x + x, this.back.position.y + y, this.back.position.z - z);
    this.bottom.body.position = new CANNON.Vec3(this.mesh.position.x + this.bottom.position.x, this.bottom.position.y + y, this.bottom.position.z + z);
  }

  rotateZ(z) {
    this.front.rotateZ(z);
    this.back.rotateZ(z);
    this.bottom.rotateZ(z);
    this.bottom.rotateX(Math.PI / 2);

    this.front.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, -1), -z)
    this.back.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, -1), -z)
    this.bottom.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, -1), -z)
  }
}

export default Row;
