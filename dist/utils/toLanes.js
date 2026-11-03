const o=({features:i=[]})=>i.flatMap(({geometry:n,properties:t})=>(n?.type==="LineString"?[n.coordinates]:n?.type==="MultiLineString"?n.coordinates:[]).map(a=>({latlngs:a.map(([e,l])=>[l,e]),properties:t??{},elevation:t?.elevation})));export{o as toLanes};
//# sourceMappingURL=toLanes.js.map
