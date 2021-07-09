import * as THREE from 'three';

class Edge {
  constructor() {
    this.mesh = null;
    this.size = 3;
  }

  getMaterial(color = '#ff440c') {
    const material = new THREE.MeshPhysicalMaterial({
      color,
      roughness: 1,
      metalness: 0,
      emissive: '#000000',
    });

    return material;
  }

  build(world, color, textures) {
    this.mesh = new THREE.Object3D();
    this.world = world;
    const material = this.getMaterial(color, textures);

    this.front = new THREE.Mesh(new THREE.BoxBufferGeometry(this.size, 4, .1, 16, 16), material);
    this.front.receiveShadow = true;
    this.front.castShadow = true;
    this.front.position.y = .5;
    this.front.position.z = .6;
    this.front.position.x = 3;
    this.front.body = new CANNON.Body({
      mass: 0,
      material: new CANNON.Material(),
      shape: new CANNON.Box(new CANNON.Vec3(this.size / 2, 2, .05)),
    });

    this.mesh.add(this.front);
    this.world.addBody(this.front.body);

    this.back = this.front.clone();
    this.back.position.y = .5;
    this.back.position.z = -.6;
    this.back.position.x = 3;
    this.back.body = new CANNON.Body({
      mass: 0,
      material: new CANNON.Material(),
      shape: new CANNON.Box(new CANNON.Vec3(this.size / 2, 2, .05)),
    });
    this.mesh.add(this.back);
    this.world.addBody(this.back.body);

    this.bottom = new THREE.Mesh(new THREE.BoxBufferGeometry(1.2, 4, .1, 16, 16), material);
    this.bottom.receiveShadow = true;
    this.bottom.castShadow = true;
    this.bottom.position.y = .5;
    this.bottom.position.z = 0;
    this.bottom.position.x = 4.45;
    this.bottom.rotateY(Math.PI / 2);
    this.bottom.body = new CANNON.Body({
      mass: 0,
      material: new CANNON.Material(),
      shape: new CANNON.Box(new CANNON.Vec3(2, .1, .5)),
    });
    this.bottomInside = new CANNON.Body({
      mass: 0,
      material: new CANNON.Material(),
      shape: new CANNON.Box(new CANNON.Vec3(.5, .05, .5)),
    });

    this.mesh.add(this.bottom);
    this.world.addBody(this.bottom.body);
    this.world.addBody(this.bottomInside);

    this.cylinder = new THREE.Mesh(new THREE.CylinderGeometry(.25, .25, .2, 32), new THREE.MeshPhysicalMaterial({
      color: '#fbff0e',
      roughness: .5,
      metalness: .2,
      emissive: '#000000',
    }));

    this.cylinder.receiveShadow = true;
    this.cylinder.castShadow = true;
  }

  position({ x, y, z }) {
    this.mesh.position.set(x, y, z);

    this.front.body.position = new CANNON.Vec3(this.front.position.x + x, this.front.position.y + y, this.front.position.z + z);
    this.back.body.position = new CANNON.Vec3(this.back.position.x + x, this.back.position.y + y, this.back.position.z - z);
    this.bottom.body.position = new CANNON.Vec3(this.bottom.position.x + x, this.bottom.position.y + y, this.bottom.position.z + z);
    this.bottomInside.position = new CANNON.Vec3(this.bottom.position.x + x, this.bottom.position.y + y, this.bottom.position.z + z);
  }

  rotate({ z }) {
    this.bottom.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, -1), -z)
    this.bottomInside.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, -1), -z)
  }
}

export default Edge;
