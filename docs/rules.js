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
/** Same observed dates across products; no distribution reinvestment. */
function performance(fund,months=12){
 const i=root.ETFCore.rangeStart(fund.dates,months);
 if(i<0)return null;
 const prices=fund.prices.slice(i),base=prices[0];let peak=base,mdd=0;
 const values=prices.map(p=>{peak=Math.max(peak,p);mdd=Math.min(mdd,p/peak-1);return p/base-1;});
 return {dates:fund.dates.slice(i),values,total:values.at(-1),mdd};
}
const api={choices,recommend,performance};
if(typeof module!=='undefined')module.exports=api;root.SurfRules=api;
})(typeof window!=='undefined'?window:globalThis);
