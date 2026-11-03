function u(a,t){const s=new Float32Array(a.length*8);return a.forEach(({position:[o,n,r],radius:c,color:h,flux:i},l)=>{const e=t[3]*o+t[7]*n+t[11]*r+t[15];s.set([(t[0]*o+t[4]*n+t[8]*r+t[12])/e,(t[1]*o+t[5]*n+t[9]*r+t[13])/e,(t[2]*o+t[6]*n+t[10]*r+t[14])/e,c,...h,i/(4*Math.PI)*.03],l*8)}),s}export{u as worldLights};
//# sourceMappingURL=worldLights.js.map
