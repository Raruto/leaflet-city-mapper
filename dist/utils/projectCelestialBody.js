function l(c,s,t,o){const[M,h,a]=c,n=-M*Math.sin(o)*Math.sin(t)-h*Math.cos(t)-a*Math.cos(o)*Math.sin(t);return n>0?{left:s.x/2+s.y*1.5*(M*Math.cos(o)-a*Math.sin(o))/n,top:s.y/2-s.y*1.5*(-M*Math.sin(o)*Math.cos(t)+h*Math.sin(t)-a*Math.cos(o)*Math.cos(t))/n}:null}export{l as projectCelestialBody};
//# sourceMappingURL=projectCelestialBody.js.map
