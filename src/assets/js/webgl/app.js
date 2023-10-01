import * as THREE from 'three';
import vertexShader from './shader/vertex.glsl';
import fragmentShader from './shader/fragment.glsl';
import "../../scss/app.scss";

class ImagePlane {
  constructor(mesh, img, canvasSize) {
    this.refImage = img;
    this.mesh = mesh;
    this.canvasSize = canvasSize;
  }

  setParams() {
    const rect = this.refImage.getBoundingClientRect();

    this.mesh.scale.x = rect.width;
    this.mesh.scale.y = rect.height;

    const x = rect.left - this.canvasSize.w / 2 + rect.width / 2;
    const y = -rect.top + this.canvasSize.h / 2 - rect.height / 2;
    this.mesh.position.set(x, y, this.mesh.position.z);
  }

  update() {
    this.setParams();
    this.mesh.material.uniforms.uTime.value++;
  }
}

class WebGLApp {
  constructor(containerSelector) {
    this.canvasEl = document.getElementById('webgl-canvas');
    this.canvasSize = {
      w: window.innerWidth,
      h: window.innerHeight,
    };
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvasEl });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.canvasSize.w, this.canvasSize.h);

    const fov = 60;
    const fovRad = (fov / 2) * (Math.PI / 180);
    const dist = this.canvasSize.h / 2 / Math.tan(fovRad);
    this.camera = new THREE.PerspectiveCamera(
      fov,
      this.canvasSize.w / this.canvasSize.h,
      0.1,
      1000
    );
    this.camera.position.z = dist;

    this.scene = new THREE.Scene();
    this.loader = new THREE.TextureLoader();
    this.imagePlaneArray = [];

    this.loop = this.loop.bind(this);
  }

  createMesh(img) {
    const texture = this.loader.load(img.src);

    const uniforms = {
      uTexture: { value: texture },
      uImageAspect: { value: img.naturalWidth / img.naturalHeight },
      uPlaneAspect: { value: img.clientWidth / img.clientHeight },
      uTime: { value: 0 },
    };
    const geo = new THREE.PlaneGeometry(1, 1, 100, 100);
    const mat = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
    });

    const mesh = new THREE.Mesh(geo, mat);

    return mesh;
  }

  init() {
    window.addEventListener('load', () => {
      const imageArray = [...document.querySelectorAll('img')];
      for (const img of imageArray) {
        const mesh = this.createMesh(img);
        this.scene.add(mesh);

        const imagePlane = new ImagePlane(mesh, img, this.canvasSize);
        imagePlane.setParams();

        this.imagePlaneArray.push(imagePlane);
      }
      this.loop();
    });

    window.addEventListener('resize', () => {
      this.onResize();
    });
  }

  onResize() {
    this.canvasSize = {
      w: window.innerWidth,
      h: window.innerHeight,
    };
    this.renderer.setSize(this.canvasSize.w, this.canvasSize.h);

    const fov = 60;
    const fovRad = (fov / 2) * (Math.PI / 180);
    const dist = this.canvasSize.h / 2 / Math.tan(fovRad);

    this.camera.aspect = this.canvasSize.w / this.canvasSize.h;
    this.camera.position.z = dist;
    this.camera.updateProjectionMatrix();
  }

  loop() {
    for (const plane of this.imagePlaneArray) {
      plane.update();
    }
    this.renderer.render(this.scene, this.camera);

    requestAnimationFrame(this.loop);
  }
}

const app = new WebGLApp('#webgl');
app.init();
