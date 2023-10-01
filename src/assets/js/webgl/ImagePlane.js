// 画像をテクスチャにしたplaneを扱うクラス
export default class ImagePlane {
  constructor(mesh, img) {
    this.renderParam = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    this.refImage = img; // 参照するimg要素
    this.mesh = mesh;
  }

  setParams() {
    // 参照するimg要素から大きさ、位置を取得してセットする
    const rect = this.refImage.getBoundingClientRect();

    this.mesh.scale.x = rect.width;
    this.mesh.scale.y = rect.height;

    // window座標をWebGL座標に変換
    const x = rect.left - this.renderParam.width / 2 + rect.width / 2;
    const y = -rect.top + this.renderParam.height / 2 - rect.height / 2;
    this.mesh.position.set(x, y, this.mesh.position.z);
  }

  updateImage(offset) {
    this.setParams();
    // this.mesh.material.uniforms.uTime.value++; // uTimeを毎フレーム加算することで時間経過をシェーダーに渡す
    this.mesh.material.uniforms.uTime.value = offset; // offetを受け取り代入する
  }
}