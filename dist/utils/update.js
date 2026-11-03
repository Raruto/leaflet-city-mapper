import{render as e}from"./render";function f(r){const t=r._shared;return t?t!==r?(f(t),r):(r._frame||=requestAnimationFrame(()=>{r._frame=null,r._shared===r&&r.renderer&&e(r)}),r):r}export{f as update};
//# sourceMappingURL=update.js.map
