let targetScrollY = 0; // 本来のスクロール位置
let currentScrollY = 0; // 線形補間を適用した現在のスクロール位置
let scrollOffset = 0; // 上記2つの差分

// 開始と終了をなめらかに補間する関数
const lerp = (start, end, multiplier) => {
  return (1 - multiplier) * start + multiplier * end;
}

const updateScroll = () => {
  // スクロール位置を取得
  targetScrollY = document.documentElement.scrollTop;

  // リープ関数でスクロール位置をなめらかに追従
  currentScrollY = lerp(currentScrollY, targetScrollY, 0.1);

  // フレーム前後のスクロール位置の差分
  scrollOffset = targetScrollY - currentScrollY;
}

export {
  updateScroll,
  currentScrollY,
  scrollOffset,
}