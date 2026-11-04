import{findFeature as r}from"./findFeature.js";import{setHighlight as e}from"./setHighlight.js";import{showFeature as f}from"./showFeature.js";function n(o,t){const i=r(o,t);o.hoveredFeature=i,e(o,i),f(o,i,t),o.fire("featureclick",{feature:i,originalEvent:t})}export{n as onClick};
//# sourceMappingURL=onClick.js.map
