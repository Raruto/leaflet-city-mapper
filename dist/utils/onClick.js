import{findFeature as t}from"./findFeature";import{setHighlight as e}from"./setHighlight";import{showFeature as f}from"./showFeature";function l(r,i){const o=t(r,i);r.hoveredFeature=o,e(r,o),f(r,o,i),r.fire("featureclick",{feature:o,originalEvent:i})}export{l as onClick};
//# sourceMappingURL=onClick.js.map
