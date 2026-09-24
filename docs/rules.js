/* Transparent discovery rules. No prediction, suitability score or allocation. */
(function(root){
'use strict';
const choices={goal:['growth','income','learn'],horizon:['short','medium','long'],risk:['none','cautious','accept'],market:['any','korea','us']};
/** All inputs are required. Product categories are learning candidates only. */
function recommend(a,funds){
 for(const [key,values] of Object.entries(choices))if(!values.includes(a?.[key]))throw Error('네 가지 질문에 모두 답해 주세요.');
 let title,reason,match;
 if(a.horizon==='short'||a.risk==='none')return {title:'지금은 상품 선택보다 자금 계획부터',reason:'1년 안에 사용할 돈이거나 원금 손실을 받아들이기 어렵다고 답했어요. 이 서비스에서는 ETF 후보를 제시하지 않습니다. ETF는 예금처럼 원금이 보장되지 않아요.',funds:[],kind:'pause'};
 if(a.risk==='cautious'){
  title='채권 ETF의 구조부터 살펴봐요';
  reason='가격 변동이 부담스럽다는 답변을 먼저 반영했어요. 등록된 국내 국고채 ETF를 학습 후보로 보여드립니다. 금리 상승으로 손실이 날 수 있으며, 배당·해외시장 선호보다 손실에 대한 답변을 우선했어요.';
  match=e=>e.category==='bonds';
 }else if(a.goal==='income'){
  title='분배금과 주가를 함께 살펴봐요';
  reason='분배금에 관심이 있다는 답변에 따라 배당 전략을 살펴봅니다. 분배금의 지급 여부와 규모는 보장되지 않으며 주가 하락으로 총손실이 날 수 있어요. 현재 등록된 배당 전략은 국내 상품 1개뿐입니다.';
  match=e=>e.strategy==='dividend' && (a.market==='any'||e.region===a.market);
 }else{
  title='넓은 시장을 따라가는 ETF부터';
  reason='시장 전반을 이해할 수 있는 대표지수 상품을 모았어요. 선택한 관심 시장을 반영하며, 여러 산업에 투자해도 주식시장 하락 위험은 남아요. 기간이 길다고 손실이 사라지지는 않습니다.';
  match=e=>e.category==='equity'&&e.strategy==='broad'&&(a.market==='any'||e.region===a.market);
 }
 const selected=funds.filter(match).sort((a,b)=>a.ticker.localeCompare(b.ticker));
 return {title,reason:reason+(selected.length?'':' 현재 등록 범위에는 조건에 맞는 상품이 없습니다. 관심 시장을 바꾸거나 전체 탐색에서 살펴보세요.'),funds:selected,kind:selected.length?'candidates':'unavailable'};
}
function explanation(e){
 const common={
  equity:{why:'여러 기업에 나누어 투자하는 대표지수 후보라서 시장 전체의 흐름을 배우기 좋아요.',risk:'주식시장이 하락하면 ETF 가격도 내려갈 수 있어요.',check:'추종지수·총보수·환율 영향·가격 수익률'},
  bonds:{why:'채권 가격과 금리의 관계를 배울 수 있는 국내 국고채 후보예요.',risk:'금리가 오르면 채권 ETF 가격이 하락할 수 있고 원금은 보장되지 않아요.',check:'채권 만기·금리 민감도·총보수·분배금'},
  commodity:{why:'주식과 다른 움직임을 보일 수 있는 원자재 학습 후보예요.',risk:'선물 교체 비용과 가격 변동이 있고 금 현물과 같은 상품이 아니에요.',check:'선물 구조·환헤지·총보수·롤오버 비용'},
  theme:{why:'특정 산업에 집중했을 때의 기회와 위험을 공부할 수 있어요.',risk:'한 산업에 집중해 가격 변동과 손실이 커질 수 있어요.',check:'산업 집중도·구성종목·총보수·최대낙폭'}
 };
 const base=common[e.category]||common.equity;
 return {...base,why:e.strategy==='dividend'?'분배금 전략을 살펴볼 수 있는 후보라서 주가와 분배금을 함께 공부하기 좋아요.':base.why};
}
/** Same observed dates across products; no distribution reinvestment. */
function performance(fund,months=12){
 const i=root.ETFCore.rangeStart(fund.dates,months);
 if(i<0)return null;
 const prices=fund.prices.slice(i),base=prices[0];let peak=base,mdd=0;
 const values=prices.map(p=>{peak=Math.max(peak,p);mdd=Math.min(mdd,p/peak-1);return p/base-1;});
 return {dates:fund.dates.slice(i),values,total:values.at(-1),mdd};
}
function scenario(fund,{monthly,months}){
 if(!fund||!Number.isFinite(monthly)||monthly<1000||monthly>1e8||![12,36,60].includes(months))throw Error('투자금과 기간을 확인해 주세요.');
 const i=root.ETFCore.rangeStart(fund.dates,months); if(i<0)return null;
 return root.ETFCore.simulate(fund,{start:fund.dates[i],end:fund.dates.at(-1),monthly});
}
const api={choices,recommend,explanation,performance,scenario};
if(typeof module!=='undefined')module.exports=api;root.SurfRules=api;
})(typeof window!=='undefined'?window:globalThis);
