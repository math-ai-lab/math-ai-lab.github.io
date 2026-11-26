/* Each section and the homepage read the same published records. */
(async () => {
  const host=document.querySelector('[data-feed]');
  if(!host)return;
  const mode=host.dataset.feed;
  const read=async url=>{const r=await fetch(url,{cache:'no-cache'});if(!r.ok)throw Error(r.status);return r.json()};
  const [catalog,snapshot]=await Promise.all([read('lab-publications.json'),read('video-snapshot.json')]);
  let videos=snapshot;
  const channel='UCGt3ddfae13LQoVHRorz73g';
  const key='math-ai-videos-'+channel;
  function safe(url){try{const u=new URL(url,location.href);return u.protocol==='https:'||u.origin===location.origin?u.href:null}catch{return null}}
  function render(){
    const media=videos.map(v=>({...v,type:'Video',url:'https://www.youtube.com/watch?v='+v.id}));
    const artifacts=catalog.artifacts.map(v=>({...v,type:'Artifact'}));
    const blogs=catalog.blogs.map(v=>({...v,type:'Blog'}));
    const projects=(catalog.projects||[]).map(v=>({...v,type:'Project'}));
    const list=mode==='projects'?projects:mode==='videos'?media:mode==='blogs'?blogs:mode==='artifacts'?artifacts:[...projects,...artifacts,...blogs,...media];
    const cards=list.filter(v=>safe(v.url)&&Date.parse(v.date)<=Date.now()).sort((a,b)=>Date.parse(b.date)-Date.parse(a.date)).slice(0,mode==='news'?3:mode==='videos'?3:Infinity);
    const rail=host.querySelector('.feed-rail');rail.replaceChildren();
    for(const v of cards){
      const card=document.createElement('a');card.className='feed-card';card.href=safe(v.url);
      if(v.thumbnail || v.id){const img=document.createElement('img');img.src=v.thumbnail || 'https://i.ytimg.com/vi/'+v.id+'/hqdefault.jpg';img.alt='';img.loading='lazy';card.append(img)}
      else{const art=document.createElement('div');art.className='feed-art';art.textContent=v.type==='Project'?'▥':v.type==='Blog'?'ŷ = wx + b':'∑';art.setAttribute('aria-hidden','true');card.append(art)}
      const meta=document.createElement('small');meta.textContent=mode==='projects' && v.topic ? v.topic : v.type+' · '+v.date.slice(0,10);
      const title=document.createElement('strong');title.textContent=v.title;
      card.append(meta,title);
      if(v.summary && (mode==='projects'||mode==='blogs')){const p=document.createElement('p');p.textContent=v.summary;card.append(p)}
      if (mode === 'projects' || mode === 'blogs') {
        const action = document.createElement('span');
        action.textContent = mode === 'blogs' ? 'Read article →' : 'Open case study ↗';
        card.append(action);
      }
      rail.append(card);
    }
    if(!cards.length)rail.textContent='Published articles will appear here.';
  }
  render();
  if(!['news','videos'].includes(mode))return;
  try{
    const cache=JSON.parse(localStorage.getItem(key)||'null');
    if(cache?.videos?.length&&Date.now()-cache.time<900000){videos=cache.videos;render();return}
  }catch{}
  try{
    const feed=await read('https://api.rss2json.com/v1/api.json?rss_url='+encodeURIComponent('https://www.youtube.com/feeds/videos.xml?channel_id='+channel));
    const latest=(feed.items||[]).map(item=>({id:new URL(item.link).searchParams.get('v')||item.guid?.split(':').pop(),title:item.title,date:item.pubDate.replace(' ','T')+'Z'})).filter(v=>/^[\w-]{11}$/.test(v.id)&&Number.isFinite(Date.parse(v.date))).sort((a,b)=>Date.parse(b.date)-Date.parse(a.date)).slice(0,3);
    if(latest.length===3&&Date.parse(latest[0].date)>=Date.parse(snapshot[0].date)){videos=latest;render();try{localStorage.setItem(key,JSON.stringify({time:Date.now(),videos}))}catch{}}
  }catch{/* The verified snapshot stays visible during a feed outage. */}
})().catch(()=>{});

