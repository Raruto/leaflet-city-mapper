function h(t,s,o,M){const a=-t.x*Math.sin(M)*Math.sin(o)-t.y*Math.cos(o)-t.z*Math.cos(M)*Math.sin(o);return a>0?{left:s.x/2+s.y*1.5*(t.x*Math.cos(M)-t.z*Math.sin(M))/a,top:s.y/2-s.y*1.5*(-t.x*Math.sin(M)*Math.cos(o)+t.y*Math.sin(o)-t.z*Math.cos(M)*Math.cos(o))/a}:null}export{h as projectCelestialBody};
//# sourceMappingURL=projectCelestialBody.js.map
