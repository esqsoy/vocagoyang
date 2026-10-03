'use strict';
const hooks=require('./host-hooks.json');
// Reverse only the recorded personal-mode guards before comparing historical
// learning-rule hashes. The live saved-mode paths have their own runtime tests.
function restoreHostFunction(source,file){
 let result=source.replace(/\r\n/g,'\n');
 for(const patch of [...hooks.files[file]].reverse())result=result.split(patch.new).join(patch.old);
 return result;
}
module.exports={restoreHostFunction};
