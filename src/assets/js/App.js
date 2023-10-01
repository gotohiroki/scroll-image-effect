import webGL from "./webgl";
import "../scss/app.scss";


const app = new webGL('#webgl')

window.addEventListener('DOMContentLoaded', () => {
  app.init();
  app.update();
})

let timeoutId = 0;
window.addEventListener('resize', () => {
  if (timeoutId) clearTimeout(timeoutId);
  timeoutId = setTimeout(app.onResize(), 200);
})