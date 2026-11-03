function m(o){if(o.matrix)return Array.from(o.matrix);const[r,t,n,a]=o.rotation||[0,0,0,1],[i,x,f]=o.scale||[1,1,1];return[(1-2*(t*t+n*n))*i,2*(r*t+n*a)*i,2*(r*n-t*a)*i,0,2*(r*t-n*a)*x,(1-2*(r*r+n*n))*x,2*(t*n+r*a)*x,0,2*(r*n+t*a)*f,2*(t*n-r*a)*f,(1-2*(r*r+t*t))*f,0,...o.translation||[0,0,0],1]}export{m as nodeMatrix};
//# sourceMappingURL=nodeMatrix.js.map
