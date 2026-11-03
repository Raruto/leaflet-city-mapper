function n(a,d,i){let o=1;for(;o<d.length-1&&d[o]<i;)o++;const c=a[o-1],r=a[o],t=d[o]-d[o-1]||1,x=(i-d[o-1])/t;return{x:c[0]+(r[0]-c[0])*x,y:(c[2]??0)+((r[2]??0)-(c[2]??0))*x,z:c[1]+(r[1]-c[1])*x,dx:(r[0]-c[0])/t,dz:(r[1]-c[1])/t}}export{n as along};
//# sourceMappingURL=along.js.map
