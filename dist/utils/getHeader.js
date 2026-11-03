import{decodeHeader as e}from"./decodeHeader.js";import{read as o}from"./read.js";function p(r){return r.options.archive&&r.options.archive!==r?r.options.archive.getHeader():r._header||=o(r,0,127).then(e)}export{p as getHeader};
//# sourceMappingURL=getHeader.js.map
