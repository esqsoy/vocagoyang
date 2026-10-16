'use strict';
// Exact behavior of the previous review helper: normalize CRLF on text reads only.
const fs=require('node:fs');const read=fs.readFileSync;fs.readFileSync=function(...args){const v=read.apply(this,args);return typeof v==='string'?v.replace(/\r\n/g,'\n'):v;};
