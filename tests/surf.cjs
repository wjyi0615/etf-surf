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
assert.equal(scenario.monthCount,13);
assert.ok(scenario.invested>100000 && Number.isFinite(scenario.value));
assert.throws(()=>R.scenario(funds[0],{monthly:100,months:12}));
assert.throws(()=>R.scenario(funds[0],{monthly:100000,months:24}));
const basket=R.portfolioScenario([funds[0],funds[6]],{'069500':.6,'114260':.4},{monthly:100000,months:12});
assert.equal(basket.monthCount,13);assert.ok(Number.isFinite(basket.value));
assert.throws(()=>R.portfolioScenario([funds[0],funds[6]],{'069500':.6,'114260':.3},{monthly:100000,months:12}));
assert.throws(()=>R.portfolioScenario([funds[0],funds[1],funds[2],funds[3]],{'069500':.25,'102110':.25,'148020':.25,'152100':.25},{monthly:100000,months:12}));
const elements={main:{innerHTML:'',focus(){},addEventListener(){},querySelector(){return null}},count:{},toast:{}};
Object.assign(ctx,{document:{getElementById:id=>elements[id]||null,querySelectorAll:()=>[]},location:{hash:'#/'},history:{replaceState(){}},setTimeout:()=>0,clearTimeout(){}});
Object.assign(ctx.window,{addEventListener(){},scrollTo(){}});
vm.runInContext(fs.readFileSync('docs/app.js','utf8'),ctx);
assert.ok(elements.main.innerHTML.includes('첫 ETF'));
for(const route of ['guide','explore','compare','learn','method','result','missing']){ctx.location.hash='#/'+route;vm.runInContext('render(false)',ctx);assert.ok(elements.main.innerHTML.length>20);}
ctx.location.hash='#/basket';vm.runInContext('render(false)',ctx);assert.ok(elements.main.innerHTML.includes('ETF 바구니'));
vm.runInContext("answers={goal:'growth',horizon:'long',risk:'accept',market:'korea'}",ctx);
ctx.location.hash='#/result';vm.runInContext('render(false)',ctx);assert.ok(elements.main.innerHTML.includes('KODEX 200'));assert.ok(elements.main.innerHTML.includes('투자 시나리오'));
for(const e of funds){ctx.location.hash='#/etf/'+e.ticker;vm.runInContext('render(false)',ctx);assert.ok(elements.main.innerHTML.includes(e.ticker));}
ctx.location.hash='#/etf/360750';vm.runInContext('render(false)',ctx);assert.ok(elements.main.innerHTML.includes('0.0068%'));
vm.runInContext("selected.add('069500');selected.add('114260');selected.add('161510')",ctx);
ctx.location.hash='#/compare';vm.runInContext('render(false)',ctx);assert.ok(elements.main.innerHTML.includes('<polyline'));assert.ok(elements.main.innerHTML.includes('서로 다른'));
// Invalid snapshot still leaves lessons available.
const invalid={...ctx.window.ETF_DATA,dates:[]};assert.throws(()=>C.catalog(invalid));
for(const file of ['index.html','style.css','icon.svg','app.js','rules.js','data-core.js','prices.js','fundamentals.js'])assert.ok(fs.statSync('docs/'+file).size>0);
console.log(`${cases} questionnaire combinations; missing/conflicting inputs; price drawdown; nine ETF details; routes and comparison passed.`);
