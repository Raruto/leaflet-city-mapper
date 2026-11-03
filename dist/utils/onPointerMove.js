import{findFeature as r}from"./findFeature.js";import{setHighlight as t}from"./setHighlight.js";import{showFeature as i}from"./showFeature.js";function m(e,o){e.hoveredFeature=r(e,o),t(e,e.hoveredFeature),i(e,e.hoveredFeature,o),e.fire("featurehover",{feature:e.hoveredFeature,originalEvent:o})}export{m as onPointerMove};
//# sourceMappingURL=onPointerMove.js.map
