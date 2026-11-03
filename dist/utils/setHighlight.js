import{update as t}from"./update.js";function l(i,h){h?.model&&(h=null),!(i.highlightedFeature?.mesh===h?.mesh&&i.highlightedFeature?.vertexStart===h?.vertexStart)&&(i.highlightedFeature&&(i.highlightedFeature.mesh.highlight=null),i.highlightedFeature=h,h&&(h.mesh.highlight=[h.vertexStart,h.vertexEnd]),t(i))}export{l as setHighlight};
//# sourceMappingURL=setHighlight.js.map
