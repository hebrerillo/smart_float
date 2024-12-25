import "../styles/sass/main.scss";
import { FloatElementHandler } from "./smart_float";

(function () {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  function init() {
    new FloatElementHandler();  
  }
})();
