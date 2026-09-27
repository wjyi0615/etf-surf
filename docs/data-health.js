/* One freshness policy shared by the site and the maintenance report. */
(function(root){
 'use strict';
 const policies={expenseRatio:['총보수',31],aum:['순자산',31],inceptionDate:['상장일',null],holdings:['구성자료',180],distributions:['분배금 일부 내역',31],hedgingPolicy:['환헤지 정책',180],distributionPolicy:['분배 정책',180]};
 function day(value){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(value||''))return NaN;
  const n=Date.parse(value+'T00:00:00Z');return Number.isFinite(n)&&new Date(n).toISOString().slice(0,10)===value?n:NaN;
 }
 function today(){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());}
 function status(record,limit,date=today(),basis='asOf'){
  if(!record)return '미확보';
  if(!record.sourceName||!/^https:\/\//.test(record.sourceUrl||''))return '출처 확인 필요';
  const now=day(date),checked=day(record.checkedAt),asOf=day(record[basis]);
  if(!Number.isFinite(now)||!Number.isFinite(checked)||!Number.isFinite(asOf)||checked>now||asOf>now||(basis==='asOf'&&asOf>checked))return '날짜 확인 필요';
  return limit!==null&&(now-asOf)/864e5>=limit?'재확인 필요':'기록 확인';
 }
 function rows(funds,metadata,date=today()){
  return funds.flatMap(e=>Object.entries(policies).map(([key,[label,limit]])=>{
   const record=key==='holdings'?metadata?.holdings?.[e.ticker]:key==='distributions'?metadata?.distributions?.[e.ticker]:metadata?.funds?.[e.ticker]?.[key];
   const basis=key==='distributions'?'checkedAt':'asOf';
   return {ticker:e.ticker,name:e.name,key,label,limit,basis,status:status(record,limit,date,basis),asOf:record?.asOf||null,checkedAt:record?.checkedAt||null,sourceName:record?.sourceName||null,sourceUrl:record?.sourceUrl||null};
  }));
 }
 const api={policies,day,today,status,rows};root.ETFHealth=api;
 if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
