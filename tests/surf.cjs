const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const ctx={window:{},console,Date,URLSearchParams};vm.createContext(ctx);
for(const f of ['prices','fundamentals','data-core','rules'])vm.runInContext(fs.readFileSync(`docs/${f}.js`,'utf8'),ctx);
const C=ctx.window.ETFCore,R=ctx.window.SurfRules,funds=C.catalog(ctx.window.ETF_DATA);
assert.equal(funds.length,20);
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
assert.equal(R.recommend({goal:'income',horizon:'long',risk:'accept',market:'us'},funds).funds.length,3);
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
console.log(`${cases} questionnaire combinations; missing/conflicting inputs; price drawdown; all ETF details; routes and comparison passed.`);
// Every questionnaire outcome keeps the beginner path honest, including no candidates.
for(const goal of R.choices.goal)for(const horizon of R.choices.horizon)for(const risk of R.choices.risk)for(const market of R.choices.market){
 const a={goal,horizon,risk,market},r=R.recommend(a,funds);
 vm.runInContext('answers='+JSON.stringify(a),ctx);
 const html=vm.runInContext('result()',ctx);
 assert.ok(html.includes('내 답변부터 돌아봐요'));
 if(r.kind!=='candidates'){assert.ok(!html.includes('data-peer='));assert.ok(!html.includes('id="scenario"'));}
 else {
  assert.ok(html.indexOf('02 / UNDERSTAND')<html.indexOf('03 / EXPLORE'));
  assert.ok(html.indexOf('03 / EXPLORE')<html.indexOf('04 / COMPARE'));
  assert.ok(html.includes('선택 전에, 세 가지'));
  const beforeMore=html.split('나머지 후보')[0];
  assert.equal((beforeMore.match(/<article class="card">/g)||[]).length,Math.min(3,r.funds.length));
  for(const fund of r.funds)assert.ok(html.includes(fund.ticker));
  const pairs=[...html.matchAll(/data-peer="([^"]+)"/g)];
  for(const [,pair] of pairs){const [a,b]=pair.split(':');assert.ok(R.peers(funds.find(e=>e.ticker===a),r.funds).some(e=>e.ticker===b));}
 }
}
console.log('Beginner result flow: all answer combinations, hidden extra candidates and valid peer pairs passed.');
// Expanded taxonomy, peer identity and differing listing dates.
assert.equal(C.filterEtfs(funds,{group:'sp500'}).length,3);
assert.equal(C.filterEtfs(funds,{group:'nasdaq'}).length,2);
assert.equal(C.filterEtfs(funds,{group:'usdividend',region:'us'}).length,3);
assert.equal(C.filterEtfs(funds,{category:'cash'}).length,2);
assert.equal(C.filterEtfs(funds,{group:'sp500',region:'korea'}).length,0);
for(const group of ['sp500','nasdaq','usdividend']){
 const list=C.filterEtfs(funds,{group});
 assert.equal(R.peers(list[0],funds).length,list.length-1);
 const aligned=R.comparison(list);
 assert.equal(aligned.length,list.length);
 assert.ok(aligned.every(s=>JSON.stringify(s.p.dates)===JSON.stringify(aligned[0].p.dates)));
}
assert.equal(R.peers(funds.find(e=>e.ticker==='459580'),funds).length,0);
assert.equal(R.peers(funds.find(e=>e.ticker==='153130'),funds).length,0);
assert.equal(R.scenario(funds.find(e=>e.ticker==='489250'),{monthly:100000,months:36}),null);
assert.equal(funds[0].dates[0],'2022-12-29');
assert.equal(funds.find(e=>e.ticker==='489250').dates[0],'2024-08-13');
const shifted=[{dates:['2024-01-01','2024-06-01','2025-01-01'],prices:[100,200,150]},{dates:['2024-01-01','2024-07-01','2025-01-01'],prices:[100,20,120]}];
const shared=R.comparison(shifted);
assert.equal(shared[0].p.dates.length,2);
assert.equal(shared[0].p.mdd,0); // Non-common intermediate observations are excluded.
assert.equal(R.comparison([shifted[0],{dates:['2024-12-01','2025-01-01'],prices:[100,110]}]).length,0);
for(const topic of ['sp500','nasdaq','usdividend','shortbond','rates']){
 ctx.location.hash='#/explore/'+topic;vm.runInContext('render(false)',ctx);
 assert.equal((elements.main.innerHTML.match(/class="product-name"/g)||[]).length,C.filterEtfs(funds,{group:topic}).length);
}
assert.ok(R.productGuide(funds.find(e=>e.ticker==='489250')).target.includes('미국'));
assert.ok(R.productGuide(funds.find(e=>e.ticker==='153130')).target.includes('짧은'));
assert.ok(R.productGuide(funds.find(e=>e.ticker==='423160')).target.includes('합성'));
console.log('Expanded catalog filters, same-index peers, listing dates and common-calendar metrics passed.');

ctx.location.hash='#/explore/all';vm.runInContext('render(false)',ctx);
assert.equal((elements.main.innerHTML.match(/class="product-name"/g)||[]).length,20);
for(const e of funds)assert.ok(elements.main.innerHTML.includes(`href="#/etf/${e.ticker}"`));
vm.runInContext("catalogView='returns';render(false)",ctx);
assert.ok(elements.main.innerHTML.includes('1개월'));
assert.ok(elements.main.innerHTML.includes('분배금 재투자 수익률이 아니며'));

const holdingHtml=vm.runInContext("composition(funds.find(e=>e.ticker==='069500'))",ctx);
assert.ok(holdingHtml.includes('2026-03-31'));
assert.equal((holdingHtml.match(/<meter /g)||[]).length,10);
assert.ok(vm.runInContext("composition({...funds[0],ticker:'999999'})",ctx).includes('아직 확보하지'));
ctx.window.ETF_FUNDAMENTALS.holdings['069500'].items[0].weight=101;
assert.ok(vm.runInContext("composition(funds.find(e=>e.ticker==='069500'))",ctx).includes('아직 확보하지'));

for(const e of funds){
 const h=ctx.window.ETF_FUNDAMENTALS.holdings[e.ticker];
 assert.ok(h && h.asOf && h.sourceUrl.startsWith('https://'));
 if(e.ticker==='069500')continue; // Invalid-value fixture above deliberately mutates this snapshot.
 const html=vm.runInContext(`composition(funds.find(e=>e.ticker==='${e.ticker}'))`,ctx);
 assert.ok(!html.includes('아직 확보하지'));
 assert.equal((html.match(/<meter /g)||[]).length,h.items.length);
 if(h.kind==='structure')assert.ok(html.includes('실제 편입 비중표가 아닌'));
}
console.log('All 20 ETFs: 17 composition snapshots and 3 sourced structure descriptions passed.');
// Source age boundaries and conditional name explanations.
assert.match(vm.runInContext("compositionAge({asOf:'2026-01-01'},new Date('2026-06-30'))",ctx),/180일/);
assert.doesNotMatch(vm.runInContext("compositionAge({asOf:'2026-01-01'},new Date('2026-06-29'))",ctx),/180일/);
assert.match(vm.runInContext("compositionAge({asOf:'invalid'})",ctx),/확인 필요/);
for(const e of funds){
 const html=vm.runInContext(`nameGuide(funds.find(e=>e.ticker==='${e.ticker}'))`,ctx);
 assert.ok(html.includes('ETF 이름 풀어보기'));
 assert.equal(html.includes('환헤지 전략'),e.name.includes('(H)'));
 assert.equal(html.includes('계약 상대방 위험'),e.name.includes('합성'));
 const composition=vm.runInContext(`composition(funds.find(e=>e.ticker==='${e.ticker}'))`,ctx);
 for(const label of ['투자 대상','영향 요인','주의할 점','자료 기준일'])assert.ok(composition.includes(label));
}
console.log('Name explanations and source-age boundary checks passed.');
for(const choice of ['soon','later','unknown']){
 ctx.location.hash='#/types/'+choice;vm.runInContext('render(false)',ctx);
 for(const text of ['주식형','채권형','기대할 수 있는 점','손실 가능성'])assert.ok(elements.main.innerHTML.includes(text));
 assert.ok(!elements.main.innerHTML.includes('data-select='));
}
ctx.location.hash='#/types/invalid';vm.runInContext('render(false)',ctx);
assert.ok(elements.main.innerHTML.includes('아직 모르겠어요'));
console.log('Three beginner paths and invalid-path fallback passed.');

for(const asset of ['all','equity','bonds','commodity','cash'])for(const market of ['all','korea','us','global']){
 ctx.location.hash='#/guide?asset='+asset+'&market='+market;
 vm.runInContext('render(false)',ctx);
 const state=vm.runInContext('discoveryState()',ctx);
 assert.ok(state.base.every(e=>(asset==='all'||e.category===asset||(asset==='equity'&&e.category==='theme'))&&(market==='all'||e.region===market)));
 assert.equal((elements.main.innerHTML.match(/class="product-name"/g)||[]).length,state.base.length);
}
ctx.location.hash='#/guide?asset=equity&market=us&group=sp500';vm.runInContext('render(false)',ctx);
assert.equal((elements.main.innerHTML.match(/class="product-name"/g)||[]).length,3);
ctx.location.hash='#/guide?asset=bonds&market=korea&group=sp500';
assert.equal(vm.runInContext('discoveryState().group',ctx),'all');
console.log('Self-directed filters, invalid combinations and exact candidate counts passed.');
