import{findFeature as o}from"./findFeature";import{setHighlight as t}from"./setHighlight";import{showFeature as i}from"./showFeature";function m(r,e){r.hoveredFeature=o(r,e),t(r,r.hoveredFeature),i(r,r.hoveredFeature,e),r.fire("featurehover",{feature:r.hoveredFeature,originalEvent:e})}export{m as onPointerMove};
//# sourceMappingURL=onPointerMove.js.map
