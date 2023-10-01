varying vec2 vUv;
uniform sampler2D uTexture;
uniform float uImageAspect;
uniform float uPlaneAspect;
uniform float uTime;

void main() {
  // 画像のアスペクトとプレーンのアスペクトを比較し、短い方に合わせる。
  // min関数はGLSLに用意された関数で、2つの引数のうち小さい方を返します。
  // 頂点シェーダーから受け取ったuv値をそのまま使わず、画像とプレーンそれぞれのアスペクト比を用いてどちらの辺を余らせるかを判断し、新しい比率（ratio）を計算します。
  vec2 ratio = vec2(
    min(uPlaneAspect / uImageAspect, 1.0),
    min((1.0 / uPlaneAspect) / (1.0 / uImageAspect), 1.0)
  );

  // 計算結果を用いて補正後のuv値を生成
  // 0.5を足したり引いたりしているのは、uvの値がxとyどちらも0.0〜1.0で正規化された値であるため、中央にずらす→反映する→戻す みたいなことをしているイメージです。
  vec2 fixedUv = vec2(
    (vUv.x - 0.5) * ratio.x + 0.5,
    (vUv.y - 0.5) * ratio.y + 0.5
  );

  vec2 offset = vec2(0.0, uTime * 0.0005);
  float r = texture2D(uTexture, fixedUv + offset).r;
  float g = texture2D(uTexture, fixedUv + offset * 0.5).g;
  float b = texture2D(uTexture, fixedUv).b;
  vec3 texture = vec3(r, g, b);

  gl_FragColor = vec4(texture, 1.0);
}