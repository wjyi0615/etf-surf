// Read-only report; never advances a source date or changes published snapshots.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),ctx={window:{}};vm.createContext(ctx);
for(const file of ['prices','fundamentals','data-core'])vm.runInContext(fs.readFileSync(path.join(root,'docs',file+'.js'),'utf8'),ctx);
const health=require('../docs/data-health.js');
const date=process.argv[2]||health.today();
if(!Number.isFinite(health.day(date)))throw new Error('Expected YYYY-MM-DD');
const rows=health.rows(ctx.window.ETFCore.catalog(ctx.window.ETF_DATA),ctx.window.ETF_FUNDAMENTALS,date);
const summary=rows.reduce((out,r)=>(out[r.status]=(out[r.status]||0)+1,out),{});
console.log(JSON.stringify({evaluatedOn:date,summary,rows},null,2));
if(rows.some(r=>['출처 확인 필요','날짜 확인 필요'].includes(r.status)))process.exitCode=1;
