import{update as a}from"./update.js";function m(){const o=this;for(const e of o._zoomTransitions?.keys()||[])e.finish();o._zoomTransitions=null,o._zoomView=null,delete o._map._cameraView,o._map.getContainer().classList.remove("leaflet-camera-zoom"),o._map._updateCameraOverlays(),o._zoomLevel=null,a(o)}export{m as endZoom};
//# sourceMappingURL=endZoom.js.map
