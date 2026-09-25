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
/** Match the registered index and implementation, not merely a broad category. */
function peers(e,funds){
 return funds.filter(x=>x.ticker!==e.ticker && !!e.benchmark && x.benchmark===e.benchmark
  && x.category===e.category && x.region===e.region && x.strategy===e.strategy && x.productType===e.productType)
  .sort((a,b)=>a.ticker.localeCompare(b.ticker));
}
/** Educational drivers, not an attribution of today's observed price movement. */
function productGuide(e){
 if(e.category==='commodity')return {
  target:'금 선물에 투자하고 환헤지를 추구하는 상품이에요. 금 현물을 직접 보유하는 방식과 구분해요.',
  drivers:'금 선물 가격, 만기 계약을 교체하는 과정의 손익과 비용, 환헤지 결과가 성과에 영향을 줄 수 있어요.',
  check:'금 현물과 선물 중 어느 방식인지, 선물 교체 방식과 환헤지 정책을 공식 자료에서 확인해요.',lesson:'currency'};
 if(e.category==='theme')return {
  target:'반도체 산업의 기업들에 집중하는 주식 ETF예요. 여러 기업을 담아도 산업은 한쪽에 집중될 수 있어요.',
  drivers:'편입 기업의 주가 변화와 비중에 영향을 받아요. 반도체 업황과 기업 실적에 대한 기대도 가격에 반영될 수 있어요.',
  check:'상위 종목의 비중과 산업 집중도를 확인해요. 이름이 비슷해도 국내·해외 또는 편입 종목이 다를 수 있어요.',lesson:'risk'};
 if(e.category==='bonds')return {
  target:'국내 국고채에 투자하는 상품이에요. 이름의 3년은 투자자가 3년 뒤 원금을 보장받는다는 의미가 아니에요.',
  drivers:'보유 채권 가격과 이자 등이 성과에 영향을 줘요. 일반적으로 시장금리가 오르면 기존 채권 가격은 하락하는 방향으로 작용해요.',
  check:'편입 채권의 만기와 금리 민감도, 지수의 종목 교체 규칙을 살펴봐요. 예금과 달리 원금은 보장되지 않아요.',lesson:'risk'};
 if(e.strategy==='dividend')return {
  target:'국내 고배당주 중심으로 투자하는 상품이에요. 분배금을 받더라도 투자금 전체의 가치가 줄어들 수 있어요.',
  drivers:'편입 주식의 가격과 배당, 분배금 지급 등이 성과에 영향을 줘요. 지급액만으로 투자 성과를 판단하기 어려워요.',
  check:'분배금 지급 내역과 가격 변화를 함께 확인해요. 최근 지급액을 그대로 미래 월소득으로 가정하지 않아요.',lesson:'distribution'};
 return e.region==='us'?{
  target:'미국 대형주 시장을 따라가는 국내 상장 ETF예요. 원화로 거래하지만 투자 대상은 미국 주식이에요.',
  drivers:'미국 주가와 원·달러 환율 변화가 함께 원화 가격에 반영돼요. 원화 거래라는 이유로 환율 영향을 피할 수 있는 것은 아니에요.',
  check:'추종지수와 환헤지 여부, 총보수 외 추가 비용을 확인해요. 다른 미국 주가지수 상품과 투자 대상이 같은지도 살펴봐요.',lesson:'currency'}:{
  target:'KOSPI200 지수를 따라가는 국내 주식 ETF예요. 지수 구성과 종목 비중에 따라 여러 기업에 투자해요.',
  drivers:'편입 주식의 가격 변화와 비중이 성과에 영향을 줘요. 같은 지수를 따라도 보수·거래가격·분배금 때문에 차이가 날 수 있어요.',
  check:'같은 KOSPI200 상품끼리 추종 방식과 비용을 비교해요. 최신 공식 자료의 기준일과 실제 매수·매도 호가도 확인해요.',lesson:'index'};
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
 const end=fund.dates.at(-1),lastMonth=end.slice(0,7);
 const first=new Date(lastMonth+'-01T00:00:00Z');first.setUTCMonth(first.getUTCMonth()-(months-1));
 const start=first.toISOString().slice(0,10);
 if(fund.dates[0]>start)return null;
 const result=root.ETFCore.simulate(fund,{start,end,monthly});
 if(result.monthCount!==months)return null;
 return {...result,start:result.history[0].date,end};
}
const api={choices,recommend,explanation,productGuide,peers,performance,scenario};
if(typeof module!=='undefined')module.exports=api;root.SurfRules=api;
})(typeof window!=='undefined'?window:globalThis);
