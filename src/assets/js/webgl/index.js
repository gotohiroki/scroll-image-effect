import { Color, Mesh, PerspectiveCamera, PlaneGeometry, Scene, ShaderMaterial, TextureLoader, Vector3, WebGLRenderer } from 'three';
import ImagePlane from './ImagePlane';
import { updateScroll, scrollOffset, currentScrollY } from './scroll';
import vertexShader from './shader/vertex.glsl';
import fragmentShader from './shader/fragment.glsl';

export default class webGL {
  // コンストラクタ
  constructor(containerSelector) {
    this.renderParam = {
      clearColor: 0x4f6c5e,
      width: window.innerWidth,
      height: window.innerHeight
    };
    this.cameraParam = {
      fov: 60,
      aspect: window.innerWidth / window.innerHeight,
      near: 0.1,
      far: 1000,
      fovRad: null,
      dist: null,
      lookAt: new Vector3(0, 0, 0),
      x: 0,
      y: 0,
      z: 1,
    };

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.loader = null;
    this.texture = null;
    this.geometry = null;
    this.material = null;
    this.mesh = null;
    this.uniforms = null;
    this.imagePlaneArray = []; // 画像オブジェクトの配列

    // canvasタグが配置されるコンテナを取得
    this.container = document.querySelector(containerSelector);

    // 慣性スクロール
    this.scrollArea = document.querySelector('.scrollable');
    document.body.style.height = `${this.scrollArea.getBoundingClientRect().height}px`;

    // updateメソッドのスコープをthis(このクラスのインスタンス)に縛る
    this.update = this.update.bind(this);

  }

  init() {
    this._setScene();
    this._setRender();
    this._setCamera();
    this.imageLoad();
  }

  _setScene() {
    this.scene = new Scene();
  }

  _setRender() {
    this.renderer = new WebGLRenderer({
      transparent: true,
    });
    this.renderer.setClearColor(new Color(this.renderParam.clearColor));
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.renderParam.width, this.renderParam.height);

    this.container.appendChild(this.renderer.domElement);
  }

  _setCamera() {
    // ウィンドウとwebGLの座標を一致させるため、描画がウィンドウぴったりになるようカメラを調整
    this.camera = new PerspectiveCamera(
      this.cameraParam.fov,
      this.cameraParam.aspect,
      this.cameraParam.near,
      this.cameraParam.far
    );
    this.cameraParam.fovRad = (this.cameraParam.fov / 2) * (Math.PI / 180);
    this.cameraParam.dist = this.renderParam.height / 2 / Math.tan(this.cameraParam.fovRad);
    this.camera.position.z = this.cameraParam.dist;
  }

  _setTexture() {
  }

  _setMesh(img) {
    this.loader = new TextureLoader();
    this.texture = this.loader.load(img.src);

    this.geometry = new PlaneGeometry(1, 1, 100, 100);
    this.material = new ShaderMaterial({
      uniforms: {
        uTexture: { value: this.texture },
        uImageAspect: { value: img.naturalWidth / img.naturalHeight }, // 画像のアスペクト（naturalWidth は画像ファイルの元の幅）
        uPlaneAspect: { value: img.clientWidth / img.clientHeight }, // プレーンのアスペクト（clientWidth は要素の表示領域の幅）
        uTime: {value: 0} // 時間経過
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
    });

    this.mesh = new Mesh(this.geometry, this.material);
    return this.mesh;
  }

  _render() {
    this.renderer.render(this.scene, this.camera)
  }

  // 毎フレーム呼び出す
  update() {
    requestAnimationFrame(this.update);
    this._render();
    updateScroll();

    this.scrollArea.style.transform = `translate3d(0,${-currentScrollY}px,0)`;

    for(const plane of this.imagePlaneArray) {
      plane.updateImage(scrollOffset);
    }
  };

  imageLoad() {

      const imageArray = [...document.querySelectorAll('img')];

      for(const img of imageArray) {
        const mesh = this._setMesh(img);
        this.scene.add(mesh);

        const imagePlane = new ImagePlane(mesh, img);
        imagePlane.setParams();
        this.imagePlaneArray.push(imagePlane);
      }


  }

  onResize() {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    this.camera.aspect = windowWidth / windowHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(windowWidth, windowHeight);
    this.cameraParam.fovRad = (this.cameraParam.fov / 2) * (Math.PI / 180);
    this.cameraParam.dist = windowHeight / 2 / Math.tan(this.cameraParam.fovRad);
    this.camera.position.z = this.cameraParam.dist;
    this._render();
  }
}