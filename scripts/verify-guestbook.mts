import assert from 'node:assert/strict';
const base=process.env.TEST_BASE_URL||'http://127.0.0.1:4173';
const ids:{id:number;token:string}[]=[];
const make=()=>({nickname:'QA 검증',message:'서버 저장과 조회를 검증하는 테스트입니다.',consent:true,ornament:'heart',requestId:crypto.randomUUID()});
const post=async(body:unknown,user='qa-one')=>fetch(base+'/api/guestbook',{method:'POST',headers:{'Content-Type':'application/json','oai-authenticated-user-id':user},body:JSON.stringify(body)});
try{
 const b=make();
 assert.equal((await post({...b,nickname:'   '})).status,400);
 assert.equal((await post({...b,message:'가'.repeat(101)})).status,400);
 assert.equal((await post({...b,consent:false})).status,400);
 assert.equal((await post({...b,website:'spam'})).status,400);
 assert.equal((await post({...b,ornament:'invalid'})).status,400);
 const created=await post(b);assert.equal(created.status,201);const one=await created.json() as any;ids.push({id:one.entry.id,token:one.deleteToken});assert.equal(one.entry.ornament,'heart');
 const replay=await post(b);assert.equal(replay.status,200);const again=await replay.json() as any;assert.equal(again.entry.id,one.entry.id);assert.equal(again.deleteToken,one.deleteToken);
 assert.equal((await post(make())).status,429);
 assert.equal((await fetch(base+'/api/guestbook/'+one.entry.id,{method:'DELETE',headers:{'X-Delete-Token':'0'.repeat(64)}})).status,404);
 for(let i=0;i<20;i++){const res=await post(make(),'qa-page-'+i);assert.equal(res.status,201);const v=await res.json() as any;ids.push({id:v.entry.id,token:v.deleteToken});}
 const page1=await(await fetch(base+'/api/guestbook')).json() as any;assert.equal(page1.entries.length,20);assert.equal(page1.hasMore,true);assert.ok(!('deleteHash'in page1.entries[0]));assert.ok(!('rateKey'in page1.entries[0]));
 const page2=await(await fetch(base+'/api/guestbook?before='+page1.entries.at(-1).id)).json() as any;assert.ok(page2.entries.some((x:any)=>x.id===one.entry.id));assert.ok(!page2.entries.some((x:any)=>page1.entries.some((y:any)=>x.id===y.id)));
 assert.equal((await fetch(base+'/api/guestbook?before=oops')).status,400);
 assert.equal((await fetch(base+'/api/guestbook',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://different.example'},body:JSON.stringify(make())})).status,403);
 console.log('PASS: input validation, persistence, duplicate retry, rate limiting, delete authorization, pagination, origin checks');
}finally{
 for(const v of ids){const res=await fetch(base+'/api/guestbook/'+v.id,{method:'DELETE',headers:{'X-Delete-Token':v.token}});assert.equal(res.status,200);}
 const remaining=await(await fetch(base+'/api/guestbook')).json() as any;assert.ok(!remaining.entries.some((e:any)=>ids.some(i=>i.id===e.id)));console.log('PASS: deleted entries hidden; all local test entries cleaned up');
}
