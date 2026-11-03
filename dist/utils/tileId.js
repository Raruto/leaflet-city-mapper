function f(t,e,r){if(![t,e,r].every(Number.isInteger)||t<0||t>26||e<0||r<0||e>=2**t||r>=2**t)throw new Error("Invalid PMTiles tile coordinates");let o=(4**t-1)/3;const n=2**t;for(let i=n/2;i>=1;i/=2){const l=e&i?1:0,s=r&i?1:0;o+=i*i*(3*l^s),s||(l&&(e=n-1-e,r=n-1-r),[e,r]=[r,e])}return o}export{f as tileId};
//# sourceMappingURL=tileId.js.map
