const fs=require('fs');const read=fs.readFileSync;fs.readFileSync=function(...args){const v=read.apply(this,args);return typeof v==='string'?v.replace(/\r\n/g,'\n'):v;};
