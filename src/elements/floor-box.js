import * as THREE from 'three';

class FloorBox {
  constructor() {
    this.mesh = null;
  }

  getMaterial() {
    const material = new THREE.MeshPhysicalMaterial({
      color: '#ff5403',
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
    material.normalScale = new THREE.Vector2(6, 6);

    return material;
  }

  build(world) {
    this.mesh = new THREE.Object3D();
    this.world = world;
    const geometry = new THREE.BoxBufferGeometry(7, 2, .2, 16, 16);
    const material = this.getMaterial();

    this.left = new THREE.Mesh(geometry, material);
    this.left.receiveShadow = true;
    this.left.castShadow = true;
    this.left.position.y = -4.5;
    this.left.position.x = 8.2;
    this.left.position.z = 4;
    this.left.body = new CANNON.Body({
      mass: 0,
      inertia: 1,
      force: 10,
      material: new CANNON.Material(),
      shape: new CANNON.Box(new CANNON.Vec3(3.5, 1, .3)),
      position: new CANNON.Vec3(this.left.position.x, this.left.position.y, this.left.position.z)
    });

    this.world.addBody(this.left.body);
    this.mesh.add(this.left);

    this.right = new THREE.Mesh(geometry, material);
    this.right.receiveShadow = true;
    this.right.castShadow = true;
    this.right.position.y = -4.5;
    this.right.position.x = 8.2;
    this.right.position.z = -4;
    this.right.body = new CANNON.Body({
      mass: 0,
      inertia: 1,
      force: 10,
      material: new CANNON.Material(),
      shape: new CANNON.Box(new CANNON.Vec3(3.5, 1, .3)),
      position: new CANNON.Vec3(this.right.position.x, this.right.position.y, this.right.position.z)
    });

    this.world.addBody(this.right.body);
    this.mesh.add(this.right);

    this.back = new THREE.Mesh(new THREE.BoxBufferGeometry(7.8, 2, .2, 16, 16), material);
    this.back.receiveShadow = true;
    this.back.castShadow = true;
    this.back.position.y = -4.5;
    this.back.position.x = 11.6;
    this.back.position.z = 0;
    this.back.rotateY(Math.PI / 2);
    this.back.body = new CANNON.Body({
      mass: 0,
      inertia: 1,
      force: 10,
      material: new CANNON.Material(),
      shape: new CANNON.Box(new CANNON.Vec3(4, 1, .3)),
      position: new CANNON.Vec3(this.back.position.x-.1, this.back.position.y, this.back.position.z)
    });

    this.back.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, -1, 0), -THREE.MathUtils.degToRad(90))
    this.world.addBody(this.back.body);
    this.mesh.add(this.back);

    this.leftFront = new THREE.Mesh(new THREE.BoxBufferGeometry(7.8, 2, .2, 16, 16), material);
    this.leftFront.receiveShadow = true;
    this.leftFront.castShadow = true;
    this.leftFront.position.y = -4.5;
    this.leftFront.position.x = 4.80;
    this.leftFront.position.z = 0;
    this.leftFront.rotateY(Math.PI / 2);
    this.leftFront.body = new CANNON.Body({
      mass: 0,
      inertia: 1,
      force: 10,
      material: new CANNON.Material(),
      shape: new CANNON.Box(new CANNON.Vec3(4, 1, .3)),
      position: new CANNON.Vec3(this.leftFront.position.x-.2, this.leftFront.position.y, this.leftFront.position.z)
    });

    this.leftFront.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, -1, 0), -THREE.MathUtils.degToRad(90))
    this.world.addBody(this.leftFront.body);
    this.mesh.add(this.leftFront);
  }
}

export default FloorBox;
