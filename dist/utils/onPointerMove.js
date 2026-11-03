import{findFeature as o}from"./findFeature.js";import{setHighlight as t}from"./setHighlight.js";import{showFeature as i}from"./showFeature.js";function m(r,e){r.hoveredFeature=o(r,e),t(r,r.hoveredFeature),i(r,r.hoveredFeature,e),r.fire("featurehover",{feature:r.hoveredFeature,originalEvent:e})}export{m as onPointerMove};
//# sourceMappingURL=onPointerMove.js.map
