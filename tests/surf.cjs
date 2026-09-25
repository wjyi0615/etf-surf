const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const ctx={window:{},console,Date};vm.createContext(ctx);
for(const f of ['prices','fundamentals','data-core','rules'])vm.runInContext(fs.readFileSync(`docs/${f}.js`,'utf8'),ctx);
const C=ctx.window.ETFCore,R=ctx.window.SurfRules,funds=C.catalog(ctx.window.ETF_DATA);
assert.equal(funds.length,9);
let cases=0;
for(const goal of R.choices.goal)for(const horizon of R.choices.horizon)for(const risk of R.choices.risk)for(const market of R.choices.market){
 const result=R.recommend({goal,horizon,risk,market},funds);cases++;
 if(horizon==='short'||risk==='none')assert.equal(result.funds.length,0);
 else if(risk==='cautious')assert.ok(result.funds.every(e=>e.category==='bonds'));
 else {assert.ok(result.funds.every(e=>e.category==='equity'));if(market!=='any')assert.ok(result.funds.every(e=>e.region===market));if(goal==='income')assert.ok(result.funds.every(e=>e.strategy==='dividend'));}
 assert.ok(result.funds.every(e=>!['commodity','theme'].includes(e.category)));
}
assert.throws(()=>R.recommend({},funds));
assert.throws(()=>R.recommend({goal:'growth',horizon:'long',risk:'invented',market:'any'},funds));
assert.equal(R.recommend({goal:'income',horizon:'long',risk:'accept',market:'us'},funds).kind,'unavailable');
assert.equal(R.recommend({goal:'growth',horizon:'long',risk:'accept',market:'any'},[]).funds.length,0);
// Dates and drawdown: zero-based price path, no deposits/distributions.
const synthetic={dates:['2024-01-01','2024-06-01','2025-01-01'],prices:[100,120,90]};
assert.ok(Math.abs(R.performance(synthetic).mdd+.25)<1e-10);
assert.ok(Math.abs(R.performance(synthetic).total+.1)<1e-10);
assert.equal(R.performance({dates:['2025-01-01','2025-02-01'],prices:[100,101]}),null);
for(const e of funds){const p=R.performance(e);assert.ok(Number.isFinite(p.total));assert.ok(p.mdd<=0);}
const scenario=R.scenario(funds.find(e=>e.ticker==='069500'),{monthly:100000,months:12});
assert.equal(scenario.monthCount,12);
assert.ok(scenario.invested===1200000 && Number.isFinite(scenario.value));
assert.equal(R.scenario(funds[0],{monthly:100000,months:36}).invested,3600000);
assert.equal(R.scenario(funds[0],{monthly:100000,months:60}),null);
assert.ok(scenario.start<=scenario.end);
assert.throws(()=>R.scenario(funds[0],{monthly:100,months:12}));
assert.throws(()=>R.scenario(funds[0],{monthly:100000,months:24}));
const elements={main:{innerHTML:'',focus(){},addEventListener(){},querySelector(){return null}},count:{},toast:{}};
Object.assign(ctx,{document:{getElementById:id=>elements[id]||null,querySelectorAll:()=>[]},location:{hash:'#/'},history:{replaceState(){}},setTimeout:()=>0,clearTimeout(){}});
Object.assign(ctx.window,{addEventListener(){},scrollTo(){}});
vm.runInContext(fs.readFileSync('docs/app.js','utf8'),ctx);
assert.ok(elements.main.innerHTML.includes('첫 ETF'));
ctx.window.ETF_UPDATE={state:'failed',attemptedAt:'2026-09-25T10:00:00Z'};
assert.ok(vm.runInContext('notice()',ctx).includes('마지막 정상 가격'));
assert.equal((fs.readFileSync('docs/index.html','utf8').match(/<!doctype html>/gi)||[]).length,1);
assert.ok(!fs.readFileSync('docs/index.html','utf8').includes('#/basket'));
for(const route of ['guide','explore','compare','learn','method','result','missing']){ctx.location.hash='#/'+route;vm.runInContext('render(false)',ctx);assert.ok(elements.main.innerHTML.length>20);}
vm.runInContext("answers={goal:'growth',horizon:'long',risk:'accept',market:'korea'}",ctx);
ctx.location.hash='#/result';vm.runInContext('render(false)',ctx);assert.ok(elements.main.innerHTML.includes('KODEX 200'));assert.ok(elements.main.innerHTML.includes('투자 시나리오'));
for(const e of funds){ctx.location.hash='#/etf/'+e.ticker;vm.runInContext('render(false)',ctx);assert.ok(elements.main.innerHTML.includes(e.ticker));}
ctx.location.hash='#/etf/360750';vm.runInContext('render(false)',ctx);assert.ok(elements.main.innerHTML.includes('0.0068%'));
vm.runInContext("selected.add('069500');selected.add('114260');selected.add('161510')",ctx);
ctx.location.hash='#/compare';vm.runInContext('render(false)',ctx);assert.ok(elements.main.innerHTML.includes('<polyline'));assert.ok(elements.main.innerHTML.includes('서로 다른'));
// Invalid snapshot still leaves lessons available.
const invalid={...ctx.window.ETF_DATA,dates:[]};assert.throws(()=>C.catalog(invalid));
const kodex=funds.find(e=>e.ticker==='069500');
assert.equal(R.peers(kodex,funds).length,3);
assert.equal(R.peers(funds.find(e=>e.ticker==='132030'),funds).length,0);
assert.equal(R.peers(kodex,[{...kodex,ticker:'999999',productType:'레버리지'}]).length,0);
assert.equal(R.peers(kodex,[{...kodex,ticker:'999999',benchmark:'다른 지수'}]).length,0);
vm.runInContext("selected=new Set(['114260','132030','161510'])",ctx);
assert.equal(vm.runInContext("comparePair('069500:102110')",ctx),true);
assert.equal(ctx.location.hash,'#/compare');
assert.equal(vm.runInContext("selected.size",ctx),2);
assert.equal(vm.runInContext("comparePair('069500:132030')",ctx),false);
assert.equal(vm.runInContext("comparePair('999999:102110')",ctx),false);
for(const e of funds){
 ctx.location.hash='#/etf/'+e.ticker;vm.runInContext('render(false)',ctx);
 assert.ok(elements.main.innerHTML.includes('가격에 영향을 주는 요인'));
 assert.ok(elements.main.innerHTML.includes('어디까지 확인된 자료'));
}
ctx.location.hash='#/etf/132030';vm.runInContext('render(false)',ctx);
assert.ok(elements.main.innerHTML.includes('선물'));
assert.ok(elements.main.innerHTML.includes('같은 기준의 다른 상품이 없습니다'));
ctx.location.hash='#/etf/161510';vm.runInContext('render(false)',ctx);
assert.ok(elements.main.innerHTML.includes('일부 8건 확인'));
for(const file of ['index.html','style.css','icon.svg','app.js','rules.js','data-core.js','prices.js','fundamentals.js'])assert.ok(fs.statSync('docs/'+file).size>0);
console.log(`${cases} questionnaire combinations; missing/conflicting inputs; price drawdown; nine ETF details; routes and comparison passed.`);
