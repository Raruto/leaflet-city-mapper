async function n(r,e){if(e===1)return r;if(e!==2)throw new Error(`Unsupported PMTiles compression: ${e}`);return new Response(new Blob([r]).stream().pipeThrough(new DecompressionStream("gzip"))).arrayBuffer()}export{n as decompress};
//# sourceMappingURL=decompress.js.map
