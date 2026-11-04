import{render as e}from"./render.js";function i(o){const t=this._map;o&&!this._zoomView&&(this._zoomView={from:t.getCenter(),zoom:t.getZoom(),to:o.center,targetZoom:o.zoom,start:performance.now()},t.getContainer().classList.add("leaflet-camera-zoom")),queueMicrotask(()=>{this._shared===this&&this.renderer&&e(this)})}export{i as onZoomAnim};
//# sourceMappingURL=onZoomAnim.js.map
