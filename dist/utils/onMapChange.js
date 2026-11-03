import{update as r}from"./update.js";import{render as u}from"./render.js";function o(){const e=this;e._queued||(e._queued=!0,queueMicrotask(()=>{e._queued=!1,!(e._shared!==e||!e.renderer)&&(e._map._animatingZoom?r(e):u(e))}))}export{o as onMapChange};
//# sourceMappingURL=onMapChange.js.map
