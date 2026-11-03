function r(h,s,t,o){const[n,c,M]=h,l=n*Math.cos(o)-M*Math.sin(o),u=-n*Math.sin(o)*Math.cos(t)+c*Math.sin(t)-M*Math.cos(o)*Math.cos(t),a=-n*Math.sin(o)*Math.sin(t)-c*Math.cos(t)-M*Math.cos(o)*Math.sin(t);if(a<=0)return null;const y=s.x/2+s.y*1.5*l/a,f=s.y/2-s.y*1.5*u/a;return{left:y,top:f}}export{r as projectCelestialBody};
//# sourceMappingURL=projectCelestialBody.js.map
