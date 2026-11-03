import{decodeHeader as r}from"./decodeHeader";import{read as o}from"./read";function p(e){return e.options.archive?e.options.archive.getHeader():e._header||=o(e,0,127).then(r)}export{p as getHeader};
//# sourceMappingURL=getHeader.js.map
