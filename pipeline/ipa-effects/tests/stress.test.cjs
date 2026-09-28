const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const ctx=vm.createContext({performance:{now:()=>0},window:{addEventListener(){}},document:{addEventListener(){},querySelector:()=>null},setTimeout,clearTimeout});
vm.runInContext(fs.readFileSync(path.resolve(__dirname,'../runtime.js'),'utf8'),ctx);
const cases=['ˌfoʊtəˈɡræfɪk','rɪˌspɑːn.səˈbɪl.ə.ti fɔːr','ɪkˈspɪriəns','ˈɜːθkweɪk','ˈwɔː.tə(r)','ˈlɛd · lid','ˈdæd','ləˈdʒɪtəmət','ˈkɑːn.trækt'];
for(const ipa of cases){const html=ctx.ipaEffectStressMarkup(ipa);assert.equal(html.replace(/<\/?[bi]>/g,''),ipa,'Preserve IPA marks, spacing, length and syllable dots');assert(!/<[bi]>[^<]*\s/.test(html),'Do not carry stress across word boundaries');}
assert.equal(ctx.ipaEffectStressMarkup('rɪˌspɑːn.səˈbɪl.ə.ti'),'rɪ<i>ˌspɑːn</i>.sə<b>ˈbɪl</b>.ə.ti');
assert.equal(ctx.ipaEffectStressMarkup('ˈɜːθkweɪk'),'<b>ˈɜːθ</b>kweɪk');
assert.equal(ctx.ipaEffectStressMarkup('<script>'),'&lt;script&gt;');
console.log('PASS stress formatter: primary/secondary, mixed dotted IPA, UK vowels, intact markers, and escaped text.');
