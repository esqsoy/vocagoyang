// Normalize the later approved text-color change for earlier editorial audits.
const assert=require('node:assert/strict');
const before='.hoectx .ex{margin-top:4px;font-size:1rem;color:var(--pinkpale);';
const after='.hoectx .ex{margin-top:4px;font-size:1rem;color:var(--ink);';
function restoreExampleTextColor(html){
 if(html.includes(before))return html;
 assert.equal(html.split(after).length,2,'Expected the recorded example-color change exactly once');
 return html.replace(after,before);
}
module.exports={restoreExampleTextColor};
