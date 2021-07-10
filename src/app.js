import * as THREE from 'three';
import Stats from 'stats-js';
import { Pane } from 'tweakpane';
import { gsap } from 'gsap';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Column from './elements/column';
import Row from './elements/row';
import Edge from './elements/edge';
import FloorBox from './elements/floor-box';
import Sphere from './elements/sphere';

class App {
  init() {
    this.setup();
    this.createScene();
    this.createCamera();
    this.addCameraControls();
    this.addAmbientLight();
    this.addDirectionalLight();
    this.addPhysicsWorld();
    this.addBackWall();
    this.addFloor();
    this.addWoodColumns();
    this.addRows();
    this.addEdges();
    this.addSphere();
    this.addFloorBox();
    this.addStatsMonitor();
    this.addWindowListeners();
    this.addGuiControls();
    this.addDummyCameraTarget();
    this.animateDummyCameraTarget();
    this.animate();
  }

  setup() {
    this.debug = false;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.cameraAutoAnimate = false;
    this.spheres = [];

    Sphere.loadTextures();
    Sphere.buildMaterial();
    Column.buildMaterial();
    Row.buildMaterial();
  }

  createScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(window.getComputedStyle(document.body).backgroundColor);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });

    this.renderer.setSize(this.width, this.height);
    this.scene.position.set(0, -5, 0);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    document.body.appendChild(this.renderer.domElement);
  }

  createCamera() {
    this.camera = new THREE.PerspectiveCamera(20, this.width / this.height, 1, 1000);
    this.camera.position.set(20, 20, 80);

    this.scene.add(this.camera);
  }

  addCameraControls() {
    this.orbitControl = new OrbitControls(this.camera, this.renderer.domElement);
    this.orbitControl.minPolarAngle = THREE.MathUtils.degToRad(0);
    this.orbitControl.maxPolarAngle = THREE.MathUtils.degToRad(90);
    this.orbitControl.minAzimuthAngle = THREE.MathUtils.degToRad(-50);
    this.orbitControl.maxAzimuthAngle = THREE.MathUtils.degToRad(50);
    this.orbitControl.maxDistance = 90;
    this.orbitControl.minDistance = 40;
    this.orbitControl.enableDamping = true;
    this.orbitControl.dampingFactor = 0.02;
    this.orbitControl.enablePan = !this.cameraAutoAnimate;
    this.orbitControl.enableRotate = !this.cameraAutoAnimate;
    this.orbitControl.enableZoom = !this.cameraAutoAnimate;
    this.orbitControl.saveState();

    this.orbitControl.addEventListener('start', () => {
      requestAnimationFrame(() => {
        document.body.style.cursor = '-moz-grabbing';
        document.body.style.cursor = '-webkit-grabbing';
      });
    });

    this.orbitControl.addEventListener('end', () => {
      requestAnimationFrame(() => {
        document.body.style.cursor = '-moz-grab';
        document.body.style.cursor = '-webkit-grab';
      });
    });
  }

  addPhysicsWorld() {
    this.physics = {
      fixedTimeStep: 1 / 60,
      maxSubSteps: 10,
      damping: .09,
      time: .01,
      lastTime: .01,
    };

    this.world = new CANNON.World();
    this.world.gravity.set(0, -120, 0);
    this.world.broadphase = new CANNON.NaiveBroadphase();
    this.world.solver.iterations = 10;
    this.world.defaultContactMaterial.contactEquationStiffness = 1e6;
    this.world.defaultContactMaterial.contactEquationRelaxation = 3;
    this.world.allowSleep = true;

    this.cannonDebugRenderer = this.debug && new CannonDebugRenderer(this.scene, this.world, { THREE, CANNON });
  }

  addAmbientLight() {
    this.scene.add(new THREE.AmbientLight({ color: '#ffffff' }, .6));
  }

  addDirectionalLight() {
    this.directionalLight = new THREE.DirectionalLight('#ffffff', .6);
    this.directionalLight.castShadow = true;
    this.directionalLight.position.set(10, 15, 15);

    this.directionalLight.shadow.camera.needsUpdate = true;
    this.directionalLight.shadow.mapSize.width = 2048;
    this.directionalLight.shadow.mapSize.height = 2048;
    this.directionalLight.shadow.camera.left = -20;
    this.directionalLight.shadow.camera.right = 20;
    this.directionalLight.shadow.camera.top = 15;
    this.directionalLight.shadow.camera.bottom = -15;

    this.scene.add(this.directionalLight);
  }

  addFloor() {
    const geometry = new THREE.PlaneBufferGeometry(400, 150);
    const material = new THREE.MeshStandardMaterial({ color: '#ffffff', side: THREE.DoubleSide });

    this.floor = new THREE.Mesh(geometry, material);
    this.floor.position.y = -5;
    this.floor.position.z = 0;
    this.floor.rotateX(Math.PI / 2);
    this.floor.receiveShadow = true;
    this.floor.body = new CANNON.Body({
      mass: 0,
      position: new CANNON.Vec3(0, this.floor.position.y, 0),
      material: new CANNON.Material(),
      shape: new CANNON.Plane(40, 40, 40),
    });

    this.floor.body.material.name = 'floor';
    this.floor.body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), THREE.MathUtils.degToRad(-90));
    this.world.addBody(this.floor.body);

    this.scene.add(this.floor);

    this.addFloorGrid();
  }

  addFloorGrid() {
    const size = 400;
    const divisions = size;
    const grid = new THREE.GridHelper(size, divisions, '#888888');

    grid.position.set(0, this.floor.position.y, 0);

    this.scene.add(grid);
  }

  addWoodColumns() {
    this.columnFront = new Column();
    this.columnFront.build();
    this.columnFront.mesh.position.y = 7;
    this.columnFront.mesh.position.z = .7;
    this.scene.add(this.columnFront.mesh);

    this.columnFront.cylinder.position.set(0, .2, 8.7);
    this.columnFront.mesh.add(this.columnFront.cylinder);

    const cylinder2 = this.columnFront.cylinder.clone();
    cylinder2.position.set(0, .2, 4);
    this.columnFront.mesh.add(cylinder2);

    const cylinder3 = this.columnFront.cylinder.clone();
    cylinder3.position.set(0, .2, -.7);
    this.columnFront.mesh.add(cylinder3);

    const cylinder4 = this.columnFront.cylinder.clone();
    cylinder4.position.set(0, .2, -5.5);
    this.columnFront.mesh.add(cylinder4);

    const cylinder5 = this.columnFront.cylinder.clone();
    cylinder5.position.set(0, .2, -10.5);
    this.columnFront.mesh.add(cylinder5);

    this.columnBack = this.columnFront.mesh.clone();
    this.columnBack.position.y = this.columnFront.mesh.position.y;
    this.columnBack.position.z = -this.columnFront.mesh.position.z;

    this.scene.add(this.columnBack);
  }

  addRows() {
    this.row1 = new Row(this.world);
    this.row1.build({ size: 6 });
    this.row1.rotateZ(THREE.MathUtils.degToRad(-20))
    this.row1.position({ x: 2.2, y: 14, z: 0, gutter: -.18 });
    this.scene.add(this.row1.mesh);

    this.row2 = new Row(this.world);
    this.row2.build({ size: 12 });
    this.row2.rotateZ(THREE.MathUtils.degToRad(10));
    this.row2.position({ x: .25, y: 10, z: 0, gutter: .1 });
    this.scene.add(this.row2.mesh);

    this.row3 = new Row(this.world);
    this.row3.build({ size: 12 });
    this.row3.rotateZ(THREE.MathUtils.degToRad(-15));
    this.row3.position({ x: -1, y: 5.5, z: 0, gutter: -.1 });
    this.scene.add(this.row3.mesh);

    this.row4 = new Row(this.world);
    this.row4.build({ size: 12 });
    this.row4.rotateZ(THREE.MathUtils.degToRad(10));
    this.row4.position({ x: 0, y: .5, z: 0, gutter: .1 });
    this.scene.add(this.row4.mesh);

    this.row5 = new Row(this.world);
    this.row5.build({ size: 12 });
    this.row5.rotateZ(THREE.MathUtils.degToRad(-15));
    this.row5.position({ x: -1, y: -4, z: 0, gutter: -.1 });
    this.scene.add(this.row5.mesh);
  }

  addEdges() {
    this.edge1 = new Edge();
    this.edge1.build(this.world, '#fbff0e');
    this.edge1.rotate({ x: 0, y: 0, z: THREE.MathUtils.degToRad(90) })
    this.edge1.position({ x: 2, y: 14, z: 0 });
    this.edge1.bottom.body.position = new CANNON.Vec3(6.4, 14.5, this.edge1.bottom.position.z);
    this.edge1.bottomInside.position = new CANNON.Vec3(6, 14.2, this.edge1.bottom.position.z);
    this.edge1.bottomInside.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, -1), THREE.MathUtils.degToRad(-40))
    this.scene.add(this.edge1.mesh);
    this.edge1.cylinder.rotateX(THREE.MathUtils.degToRad(90));
    this.edge1.cylinder.position.set(2, -1, .75);
    this.edge1.mesh.add(this.edge1.cylinder);
    const cylinder2 = this.edge1.cylinder.clone();
    cylinder2.position.set(2, 1.8, .75);
    this.edge1.mesh.add(cylinder2);

    this.edge2 = new Edge();
    this.edge2.build(this.world, '#ff0e0e');
    this.edge2.rotate({ x: 0, y: 0, z: THREE.MathUtils.degToRad(90) })
    this.edge2.position({ x: -9, y: 9.8, z: 0 });
    this.edge2.bottom.position.x = 1.55;
    this.edge2.bottom.body.position = new CANNON.Vec3(-7.5, 10, this.edge2.bottom.position.z);
    this.edge2.bottomInside.position = new CANNON.Vec3(-7, 10.5, this.edge2.bottom.position.z);
    this.edge2.bottomInside.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, -1), THREE.MathUtils.degToRad(35))
    this.scene.add(this.edge2.mesh);
    const cylinder3 = this.edge1.cylinder.clone();
    cylinder3.material = this.edge1.cylinder.material.clone();
    cylinder3.material.color = new THREE.Color('#ff0e0e');
    cylinder3.position.set(4, -1, .75);
    this.edge2.mesh.add(cylinder3);
    const cylinder4 = cylinder3.clone();
    cylinder4.position.set(4, 1.8, .75);
    this.edge2.mesh.add(cylinder4);

    this.edge3 = new Edge();
    this.edge3.build(this.world, '#15ff47');
    this.edge3.rotate({ x: 0, y: 0, z: THREE.MathUtils.degToRad(90) })
    this.edge3.position({ x: 2, y: 4.8, z: 0 });
    this.edge3.bottom.position.x = 4.45;
    this.edge3.bottom.body.position = new CANNON.Vec3(6.5, 5.5, this.edge3.bottom.position.z);
    this.edge3.bottomInside.position = new CANNON.Vec3(6, 5.2, this.edge3.bottom.position.z);
    this.edge3.bottomInside.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, -1), THREE.MathUtils.degToRad(-40))
    this.scene.add(this.edge3.mesh);
    const cylinder5 = this.edge1.cylinder.clone();
    cylinder5.material = this.edge1.cylinder.material.clone();
    cylinder5.material.color = new THREE.Color('#15ff47');
    cylinder5.position.set(2, -1, .75);
    this.edge3.mesh.add(cylinder5);
    const cylinder6 = cylinder5.clone();
    cylinder6.position.set(2, 1.8, .75);
    this.edge3.mesh.add(cylinder6);

    this.edge4 = new Edge();
    this.edge4.build(this.world, '#1c57ff');
    this.edge4.rotate({ x: 0, y: 0, z: THREE.MathUtils.degToRad(90) })
    this.edge4.position({ x: -9, y: .3, z: 0 });
    this.edge4.bottom.position.x = 1.55;
    this.edge4.bottom.body.position = new CANNON.Vec3(-7.4, .8, this.edge4.bottom.position.z);
    this.edge4.bottomInside.position = new CANNON.Vec3(-7, 1, this.edge4.bottom.position.z);
    this.edge4.bottomInside.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, -1), THREE.MathUtils.degToRad(40))
    this.scene.add(this.edge4.mesh);
    const cylinder7 = this.edge1.cylinder.clone();
    cylinder7.material = this.edge1.cylinder.material.clone();
    cylinder7.material.color = new THREE.Color('#1c57ff');
    cylinder7.position.set(4, -.7, .75);
    this.edge4.mesh.add(cylinder7);
    const cylinder8 = cylinder7.clone();
    cylinder8.position.set(4, 1.8, .75);
    this.edge4.mesh.add(cylinder8);
  }

  addFloorBox() {
    this.floorBox = new FloorBox();
    this.floorBox.build(this.world);
    this.scene.add(this.floorBox.mesh);
  }

  addBackWall() {
    const materialParams = { color: '#1c7dff', side: THREE.DoubleSide };
    const geometry = new THREE.PlaneBufferGeometry(400, 140);
    const material = new THREE.MeshStandardMaterial(materialParams);

    const backwall = new THREE.Mesh(geometry, material);
    backwall.position.z = -10;
    backwall.receiveShadow = true;

    this.scene.add(backwall);
  }

  addSphere() {
    const sphere = new Sphere();
    sphere.build();

    const collideEvent = e => {
      if (e.body.material.name === 'floor' || e.body.material.name === 'sphere') {
        sphere.mesh.body.removeEventListener('collide', collideEvent);

        this.moveCameraUp();
      }
    };

    sphere.mesh.body.addEventListener('collide', collideEvent);

    this.world.addBody(sphere.mesh.body);
    const mat = new CANNON.ContactMaterial(this.floor.body.material, sphere.mesh.body.material, { friction: 0.3, restitution: 0.5 });
    this.world.addContactMaterial(mat);

    this.spheres.push(sphere);
    this.scene.add(sphere.mesh);
  }

  addDummyCameraTarget() {
    this.dummyCameraTarget = new THREE.Mesh(new THREE.SphereBufferGeometry(.5, 8, 8), new THREE.MeshStandardMaterial());
    this.dummyCameraTarget.material.needsUpdate = true;
    this.dummyCameraTarget.material.opacity = 0;
    this.dummyCameraTarget.material.alphaTest = 1;
    this.dummyCameraTarget.position.y = 20;
    this.dummyCameraTarget.position.z = 2;
    this.scene.add(this.dummyCameraTarget);
  }

  animateDummyCameraTarget() {
    const tl = gsap.timeline({
      defaults: { duration: 11, ease: 'sine.out', delay: .5 },
      onComplete: () => {
        tl.kill();
      }
    });

    tl.to(this.dummyCameraTarget.position, { y: -4});
  }

  moveCameraUp() {
    const tl = gsap.timeline({
      defaults: { duration: 3, ease: 'linear', delay: .5 },
      onComplete: () => {
        tl.kill();
        this.dummyCameraTarget.position.y = 14;
        this.addSphere();
        this.animateDummyCameraTarget();
      }
    });

    tl.to(this.dummyCameraTarget.position, { y: 14 });
  }

  addGuiControls() {
    this.pane = new Pane();
    this.guiCamera = this.pane.addFolder({
      title: 'Camera',
      expanded: true,
    });

    this.guiCamera.addInput({ auto: this.cameraAutoAnimate }, 'auto').on('change', ({ value }) => {
      this.cameraAutoAnimate = value;
      this.orbitControl.enablePan = !this.cameraAutoAnimate;
      this.orbitControl.enableRotate = !this.cameraAutoAnimate;
      this.orbitControl.enableZoom = !this.cameraAutoAnimate;

      if (this.cameraAutoAnimate) {
        this.orbitControl.reset();
      }
    });;
  }

  animate() {
    this.stats.begin();
    this.renderer.render(this.scene, this.camera);

    if (!this.cameraAutoAnimate) {
      this.orbitControl.update();
    }

    // physics loop
    if (this.physics.lastTime !== undefined) {
      this.debug && this.cannonDebugRenderer.update();
      const dt = (this.physics.time - this.physics.lastTime) / 1000;
      this.world.step(this.physics.fixedTimeStep, dt, this.physics.maxSubSteps);

      if (this.cameraAutoAnimate) {
        const { x, y, z } = this.dummyCameraTarget.position;
        this.camera.lookAt(new THREE.Vector3(x, y, z));
        this.camera.position.y = y + 2;
      }

      // map physics position to threejs mesh position
      this.spheres.map((sphere) => {
        sphere.mesh.position.copy(sphere.mesh.body.position);
        sphere.mesh.quaternion.copy(sphere.mesh.body.quaternion);
      })
    }

    this.stats.end();
    this.physics.lastTime = this.physics.time;

    requestAnimationFrame(this.animate.bind(this));
  }

  addWindowListeners() {
    window.addEventListener('resize', this.onResize.bind(this), { passive: true });
  }

  addStatsMonitor() {
    this.stats = new Stats();
    this.stats.showPanel(0);

    document.body.appendChild(this.stats.dom);
  }

  onResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.camera.aspect = this.width / this.height;

    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  }
}

export default App;
