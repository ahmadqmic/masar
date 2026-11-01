/* Masar landing page interactions — hero, feature demos, shuttle SVG and story. */
/* ===== Components: app.js ===== */
(() => {
  'use strict';

  const byId = id => document.getElementById(id);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  // Product screenshots are approved captures, not a live map or a recreated UI.
  const sharedDestinationFrames = [
    {src:'home.webp',label:'Home screen',alt:'Masar home map showing locations across Qatar University',tap:[.38,.095],hotspot:{x:3,y:6,w:77,h:9,aria:'Open Search'}},
    {src:'search-open.webp',label:'Open search',alt:'Masar search screen displaying recent destination history',tap:[.25,.09],hotspot:{x:9,y:6,w:81,h:10,aria:'Search for a campus destination'}},
    {src:'search-typed.webp',label:'Select College of Education',alt:'Masar results for College of Education',tap:[.40,.187],hotspot:{x:7,y:14,w:86,h:11,aria:'Select College of Education'}},
    {src:'go-later-destination.webp',label:'Choose Go Now or Go Later',alt:'College of Education details with Go Now and Go Later actions',tap:null,branchChoice:true}
  ];
  const destinationBranches = {
    now: [
      {src:'routes.webp',label:'Compare available routes',alt:'Masar route alternatives with GO button',tap:[.50,.96],hotspot:{x:9,y:91,w:82,h:8,aria:'Start navigation with GO'}},
      {src:'navigation.webp',label:'Follow turn-by-turn guidance',alt:'Masar active navigation with turn guidance and ETA',tap:null}
    ],
    later: [
      {src:'go-later-picker.webp',label:'Choose arrival time',alt:'Masar Plan for Later arrival-time selector set to 3 PM',tap:[.75,.926],hotspot:{x:52,y:89,w:44,h:9,aria:'Confirm selected arrival time with Done'}},
      {src:'go-later-planned.webp',label:'Review your planned trip',alt:'Planned trip with expected travel time and Notify Me button',tap:[.25,.932],hotspot:{x:4,y:89,w:43,h:9,aria:'Activate Notify Me reminder'}},
      {src:'go-later-confirmed.webp',label:'Notification confirmed',alt:'Masar confirmation saying you will be notified at expected leave time',tap:null}
    ]
  };
  const demos = {
    discover: {kicker:'01 / DESTINATIONS',frames:sharedDestinationFrames},
    navigation: {kicker:'02 / NAVIGATION',frames:[
      {src:'go-later-destination.webp',label:'Select Go Now',alt:'College of Education destination with Go Now action',tap:[.26,.675],hotspot:{x:4,y:63,w:43,h:10,aria:'Choose Go Now to navigate'}},
      ...destinationBranches.now
    ]},
    parking: {kicker:'03 / PARKING',frames:[
      {src:'home.webp',label:'See campus parking',alt:'Masar campus home map with parking indicators',tap:[.672,.337],hotspot:{x:61,y:29,w:13,h:10,aria:'View parking information at the 8% marker'}},
      {src:'parking.webp',label:'View available parking',alt:'Parking location details with available spaces and route actions',tap:null}
    ]},
    gates: {kicker:'04 / SMART GATES',frames:[
      {src:'home.webp',label:'Find a campus gate',alt:'Masar campus map showing campus gates',tap:[.095,.402],hotspot:{x:4,y:35,w:14,h:12,aria:'View Gate 4 traffic conditions'}},
      {src:'gate.webp',label:'Check Gate 4 conditions',alt:'Gate 4 details with smooth traffic conditions',tap:null}
    ]},
    transport: {kicker:'05 / TRANSPORT',frames:[
      {src:'transport-start.webp',label:'Open transportation',alt:'Transportation before bus stops are selected',tap:[.35,.106]},
      {src:'transport-search.webp',label:'Choose a bus station',alt:'Bus station selection with search results',tap:[.25,.272]},
      {src:'transport-picked.webp',label:'Confirm your stops',alt:'Selected bus stops with Show My Way active',tap:[.48,.245]},
      {src:'transport-results.webp',label:'View the journey on the map',alt:'Transportation route and journey panel on campus map',tap:[.5,.78]},
      {src:'transport-details.webp',label:'Follow stops and transfers',alt:'Bus stops, transfer and walking details',tap:null}
    ]},
    layers: {kicker:'06 / MAP LAYERS',frames:[
      {src:'home.webp',label:'Explore your map',alt:'Masar home map with map markers',tap:[.933,.224]},
      {src:'layers.webp',label:'Customize map details',alt:'Map layers for traffic, gates, parking and buildings',tap:null}
    ]}
  };
  let currentBranch = null;
  const framesForCurrent = () => current==='discover' && currentBranch
    ? sharedDestinationFrames.concat(destinationBranches[currentBranch])
    : demos[current].frames;
  const demoImg = byId('mainDemoImage');
  const stageScreen = demoImg.closest('.stage-screen');
  const kicker = byId('stageKicker');
  const label = byId('stageScreenLabel');
  const dots = byId('stageDots');
  const timeline = byId('stageTimelineFill');
  const tapHand = byId('tapHand');
  const navigationIndicator = byId('navigationIndicator');
  const hotspots = byId('stageHotspots');
  const stageFooterLabel = byId('stageFooterLabel');
  const stageStepCount = byId('stageStepCount');
  const stageControlBottom = byId('stageControlBottom');
  const stageSticky = byId('stageSticky');
  const stageBranchChoices = byId('stageBranchChoices');
  const prevFrameButton=byId('prevFrame'),nextFrameButton=byId('nextFrame');
  const chapterEls = [...document.querySelectorAll('.feature-chapter')];
  let current = 'discover';
  let frame = 0;
  let playTimer = null;
  let pendingTransition = null;
  let scrollTicking = false;
  let canAutoPlay = !reduceMotion.matches;
  let contentReady = false;
  let autoPausedForChoice = false;
  let branchPending = false;

  // Preload all images to keep transitions quick after a scroll or a replay.
  [...Object.values(demos).flatMap(demo=>demo.frames),...Object.values(destinationBranches).flat()].forEach(fr => { const image=new Image(); image.src='assets/'+fr.src; });

  function clearPlayback(){
    window.clearTimeout(playTimer);
    window.clearTimeout(pendingTransition);
    playTimer = null; pendingTransition = null;
    tapHand.classList.remove('animating');
    tapHand.classList.remove('tap-complete');
    branchPending = false;
  }

  function showHotspot(h, handler, primary=false){
    if(!h) return;
    const b=document.createElement('button');
    b.type='button'; b.className='screen-hotspot'+(primary?' branch-hotspot':'');
    b.style.left=h.x+'%'; b.style.top=h.y+'%'; b.style.width=h.w+'%'; b.style.height=h.h+'%';
    b.setAttribute('aria-label',h.aria);
    b.title=h.aria;
    b.addEventListener('click',handler);
    hotspots.appendChild(b);
  }
  function isAwaitingChoice(){return current==='discover' && currentBranch===null && frame===sharedDestinationFrames.length-1;}
  function renderHotspots(){
    hotspots.replaceChildren();
    const fr=framesForCurrent()[frame];
    if(!fr) return;
    if(isAwaitingChoice()){
      showHotspot({x:4,y:63,w:43,h:10,aria:'Go Now — compare routes and navigate'},()=>chooseBranch('now'),true);
      showHotspot({x:52,y:63,w:44,h:10,aria:'Go Later — schedule a journey'},()=>chooseBranch('later'),true);
    }else if(fr.hotspot && frame<framesForCurrent().length-1){
      showHotspot(fr.hotspot,()=>{
        clearPlayback(); performTap(fr);
        pendingTransition=window.setTimeout(()=>setFrame(frame+1),reduceMotion.matches?0:1110);
      });
    }
  }
  function updateDots(){
    const frames=framesForCurrent();
    dots.replaceChildren();
    frames.forEach((fr,i) => {
      const b=document.createElement('button');
      b.type='button'; b.className='stage-dot'+(i===frame?' active':i<frame?' completed':'');
      b.setAttribute('aria-label',`Show step ${i+1}: ${fr.label}`);
      if(i===frame)b.setAttribute('aria-current','step');
      b.title=fr.label;
      b.addEventListener('click',()=>{clearPlayback();setFrame(i);});
      dots.appendChild(b);
    });
    timeline.style.width=`${100*(frame+1)/frames.length}%`;
    stageStepCount.textContent=`${frame+1} / ${frames.length}`;
    const waiting=isAwaitingChoice();
    stageControlBottom.classList.toggle('awaiting-choice',waiting);
    stageSticky.classList.toggle('is-awaiting-choice',waiting);
    stageBranchChoices.hidden=!waiting;
    stageFooterLabel.textContent=waiting?'TAP A BUTTON IN THE PHONE':'APP SCREEN PREVIEW · NOT LIVE';
    prevFrameButton.disabled=frame===0;
    nextFrameButton.disabled=waiting||frame>=frames.length-1;
  }

  function setFrame(index,instant=false){
    const frames=framesForCurrent();
    frame=Math.max(0,Math.min(index,frames.length-1));
    const fr=frames[frame];
    kicker.textContent=demos[current].kicker;
    label.textContent=fr.label;
    updateDots();
    stageScreen.classList.toggle('is-navigating',current==='navigation'&&frame===2 || current==='discover'&&currentBranch==='now'&&frame===5);
    hotspots.replaceChildren();
    if(instant||reduceMotion.matches){
      demoImg.src='assets/'+fr.src;demoImg.alt=fr.alt;
      demoImg.classList.remove('changing');
      renderHotspots();
    }else{
      demoImg.classList.add('changing');
      pendingTransition=window.setTimeout(()=>{
        demoImg.src='assets/'+fr.src;demoImg.alt=fr.alt;
        demoImg.classList.remove('changing');
        renderHotspots();
        pendingTransition=null;
      },200);
    }
  }

  function chooseBranch(which){
    if(current!=='discover'||!destinationBranches[which]||!isAwaitingChoice()||branchPending)return;
    clearPlayback();
    branchPending=true;
    // The visitor chooses; the pointer acknowledges the chosen real app button,
    // rather than automatically selecting a branch for them.
    performTap({tap:[which==='now'?.263:.748,.676]});
    pendingTransition=window.setTimeout(()=>{
      branchPending=false;currentBranch=which;
      setFrame(sharedDestinationFrames.length);
      byId('demoStatus').textContent=which==='later'?'Go Later selected: choose an arrival time.':'Go Now selected: view route choices.';
      if(!reduceMotion.matches)playTimer=window.setTimeout(scheduleNext,1450);
    },reduceMotion.matches?0:1110);
  }
  document.querySelectorAll('[data-branch]').forEach(button=>button.addEventListener('click',()=>chooseBranch(button.dataset.branch)));
  function performTap(fr){
    if(!fr?.tap || reduceMotion.matches) return;
    tapHand.style.left = `${fr.tap[0]*100}%`;
    tapHand.style.top = `${fr.tap[1]*100}%`;
    tapHand.style.setProperty('--tap-start-x', (fr.tap[0] > .6 ? 42 : -42) + 'px');
    tapHand.style.setProperty('--tap-start-y', (fr.tap[1] > .70 ? -50 : 48) + 'px');
    tapHand.classList.remove('animating','tap-complete');
    void tapHand.offsetWidth;
    tapHand.classList.add('animating');
  }

  function scheduleNext(){
    if(reduceMotion.matches) return;
    const f = framesForCurrent()[frame];
    if(frame >= framesForCurrent().length-1 || isAwaitingChoice()) return;
    playTimer = window.setTimeout(() => {
      if(isAwaitingChoice())return;
      performTap(f);
      playTimer = window.setTimeout(() => {
        setFrame(frame+1);
        playTimer = window.setTimeout(scheduleNext,1150);
      },1120);
    },780);
  }

  function activate(name, autoplay=true){
    if(!demos[name]) return;
    clearPlayback();
    const changed = current!==name;
    current=name;
    currentBranch=null;
    chapterEls.forEach(el => el.classList.toggle('is-active',el.dataset.demo===name));
    setFrame(0, !changed);
    if(autoplay && canAutoPlay){playTimer = window.setTimeout(scheduleNext,800);}
  }

  function replay(name=current){
    if(name!==current) activate(name,false);
    clearPlayback();
    if(current==='discover')currentBranch=null;
    setFrame(0);
    if(!reduceMotion.matches) playTimer = window.setTimeout(scheduleNext,500);
    else byId('demoStatus').textContent='Demo reset. Use Next to explore the individual screens.';
  }

  byId('replayButton').addEventListener('click',() => replay());
  byId('prevFrame').addEventListener('click',() => {clearPlayback();if(current==='discover'&&currentBranch&&frame===sharedDestinationFrames.length){currentBranch=null;setFrame(sharedDestinationFrames.length-1)}else setFrame(frame-1);});
  byId('nextFrame').addEventListener('click',() => {if(isAwaitingChoice())return;clearPlayback();setFrame(frame+1);});
  document.querySelectorAll('[data-replay]').forEach(b => b.addEventListener('click',() => {
    const chapter=byId('chapter-'+b.dataset.replay);
    chapter.scrollIntoView({behavior:reduceMotion.matches?'instant':'smooth',block:'center'});
    activate(b.dataset.replay,false);
    replay(b.dataset.replay);
  }));

  function updateScroll(){
    scrollTicking=false;
    const y=window.scrollY;
    const scrollable=Math.max(1,document.documentElement.scrollHeight-window.innerHeight);
    byId('progressLine').style.width=(100*y/scrollable).toFixed(2)+'%';
    const header = byId('siteHeader');
    header.classList.toggle('scrolled',y>24);
    const darkSection = [...document.querySelectorAll('.download-section')].some(section => {const r=section.getBoundingClientRect();return r.top<=40 && r.bottom>=40;});
    header.classList.toggle('on-dark',darkSection);
    const experience=byId('experience').getBoundingClientRect();
    if(experience.top < window.innerHeight*.8 && experience.bottom > window.innerHeight*.15){
      const targetY=window.innerHeight*(window.innerWidth<=820?.78:.52);
      let best=null, bestDist=Infinity;
      for(const chapter of chapterEls){
        const box=chapter.getBoundingClientRect();
        const mid=(box.top+box.bottom)/2;
        const dist=Math.abs(mid-targetY);
        if(dist<bestDist){bestDist=dist;best=chapter;}
      }
      if(best && best.dataset.demo!==current)activate(best.dataset.demo,true);
      const stage=byId('stagePhone');
      const p=Math.max(0,Math.min(1,(window.innerHeight*.6-experience.top)/(experience.height-window.innerHeight*.1)));
      const amp=window.innerWidth<=820?2:5;
      stage.style.setProperty('--phone-ry',`${(-amp+p*amp*2).toFixed(2)}deg`);
      stage.style.setProperty('--phone-rz',`${((p-.5)*1.6).toFixed(2)}deg`);
    }
  }
  function requestScroll(){if(!scrollTicking){scrollTicking=true;requestAnimationFrame(updateScroll);}}
  window.addEventListener('scroll',requestScroll,{passive:true});
  window.addEventListener('resize',requestScroll,{passive:true});
  updateScroll();
  setFrame(0,true);

  // Hero stages are managed by hero-v5.js, using the edited real Masar navigation recording.

  const menu=byId('menuButton'),mobileNav=byId('mobileNav');
  function setMenu(open){menu.setAttribute('aria-expanded',String(open));mobileNav.hidden=!open;}
  menu.addEventListener('click',()=>setMenu(menu.getAttribute('aria-expanded')!=='true'));
  mobileNav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')setMenu(false);});
  byId('copyrightYear').textContent=new Date().getFullYear();
  reduceMotion.addEventListener('change',e=>{canAutoPlay=!e.matches;if(e.matches){clearPlayback();}});
})();


/* ===== Components: hero-v5.js ===== */
/* V5: intentional chapter transitions, scroll without hijacking, authentic edited navigation footage. */
(() => {
  'use strict';
  const hero = document.querySelector('.hero');
  const phone = document.getElementById('heroDevice');
  const video = document.getElementById('heroNavVideo');
  const label = document.getElementById('heroSceneLabel');
  const number = document.getElementById('heroSceneNumber');
  const advance = document.getElementById('heroPhoneAdvance');
  const replay = document.getElementById('heroReplay');
  const actionText = document.getElementById('heroTapText');
  if(!hero || !phone || !video || !advance) return;
  const small = matchMedia('(max-width: 820px)');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const stages = ['splash', 'home', 'routes', 'navigate'];
  const labels = ['OPEN MASAR', 'EXPLORE THE CAMPUS', 'CHOOSE YOUR ROUTE', 'FOLLOW THE JOURNEY'];
  let current=0, wanted=0, pending=null, delayed=[], loaded=false, visible=true, pauseScrollUntil=0;
  let lastSceneAt=0, scrollProgress=0, easedProgress=0, animating=false, introElapsed=false;
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const clearDelays=()=>{delayed.forEach(clearTimeout);delayed=[];};
  function loadVideo(){
    if(loaded) return;
    const source=video.querySelector('source');
    if(source && source.dataset.src){source.src=source.dataset.src;video.load();loaded=true;}
  }
  function syncScene(index){
    const previous=current;
    current=clamp(index,0,3);
    hero.dataset.scene=stages[current];
    label.textContent=labels[current];
    number.textContent=`${String(current+1).padStart(2,'0')} / 04`;
    actionText.textContent=current===3?'Tap the phone to replay navigation':'Tap the phone to explore';
    advance.setAttribute('aria-label',current===3?'Replay the navigation preview':'Show the next Masar preview scene');
    if(current===3){
      loadVideo();
      if(previous!==3)video.currentTime=0;
      if(visible && !reduce.matches && !document.hidden)video.play().catch(()=>{});
    } else {video.pause();}
    lastSceneAt=performance.now();
  }
  // A fast wheel gesture does not jump directly from splash to the fourth scene.
  // Scenes settle one at a time while native scrolling remains free.
  function moveTowardTarget(){
    if(pending){clearTimeout(pending);pending=null;}
    if(current===wanted)return;
    const ms=Math.max(0,650-(performance.now()-lastSceneAt));
    pending=setTimeout(()=>{
      pending=null;
      if(current!==wanted){syncScene(current+Math.sign(wanted-current));moveTowardTarget();}
    },ms);
  }
  function requestScene(n){
    wanted=clamp(n,0,3);
    moveTowardTarget();
  }
  function scrollState(){
    if(small.matches || reduce.matches)return;
    const distance=Math.max(1,hero.offsetHeight-innerHeight);
    const rect=hero.getBoundingClientRect();
    scrollProgress=clamp(-rect.top/distance,0,1);
    if(performance.now()>pauseScrollUntil && (introElapsed || scrollProgress>.03)){
      requestScene(scrollProgress>=.67?3:scrollProgress>=.33?2:1);
    }
    if(!animating){animating=true;requestAnimationFrame(smoothPhone);}
  }
  function smoothPhone(){
    const diff=scrollProgress-easedProgress;
    easedProgress+=diff*.09;
    if(Math.abs(diff)<.001)easedProgress=scrollProgress;
    const p=easedProgress;
    phone.style.setProperty('--hero-rotate',(-5+5*p).toFixed(2)+'deg');
    phone.style.setProperty('--hero-y',(-6+6*p).toFixed(2)+'deg');
    phone.style.setProperty('--hero-lift',(-8*p).toFixed(1)+'px');
    phone.style.setProperty('--hero-scale',(1+.015*p).toFixed(3));
    if(Math.abs(scrollProgress-easedProgress)>.001)requestAnimationFrame(smoothPhone);
    else animating=false;
  }
  function startMobile(){
    clearDelays();
    if(reduce.matches){syncScene(1);return;}
    syncScene(0);wanted=0;
    delayed.push(setTimeout(()=>requestScene(1),1300));
    delayed.push(setTimeout(()=>requestScene(2),4100));
    delayed.push(setTimeout(()=>requestScene(3),6500));
  }
  function playPreview(){
    clearDelays();
    pauseScrollUntil=performance.now()+9000;
    if(current===3){
      loadVideo();video.currentTime=0;
      if(!reduce.matches)video.play().catch(()=>{});
    }else{
      requestScene(current+1);
    }
  }
  function restart(){
    clearDelays();
    if(pending){clearTimeout(pending);pending=null;}
    pauseScrollUntil=performance.now()+14500;
    wanted=0;syncScene(0);
    if(reduce.matches)return;
    delayed.push(setTimeout(()=>requestScene(1),1150));
    delayed.push(setTimeout(()=>requestScene(2),3300));
    delayed.push(setTimeout(()=>requestScene(3),5300));
  }
  advance.addEventListener('click',playPreview);
  if(replay)replay.addEventListener('click',restart);
  const observer=new IntersectionObserver(([entry])=>{
    visible=entry.isIntersecting;
    if(!visible)video.pause();
    else if(current===3 && !video.ended && !document.hidden && !reduce.matches)video.play().catch(()=>{});
  },{threshold:.12});
  observer.observe(phone);
  video.addEventListener('ended',()=>hero.classList.add('hero-video-ended'));
  video.addEventListener('play',()=>hero.classList.remove('hero-video-ended'));
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden)video.pause();
    else if(current===3 && !video.ended && visible && !reduce.matches)video.play().catch(()=>{});
  });
  addEventListener('scroll',scrollState,{passive:true});
  addEventListener('resize',()=>{
    if(small.matches){
      phone.style.setProperty('--hero-rotate','0deg');
      phone.style.setProperty('--hero-y','0deg');
      phone.style.setProperty('--hero-scale','1');
      phone.style.setProperty('--hero-lift','0px');
      if(!reduce.matches && current===0)startMobile();
    }else{clearDelays();scrollState();}
  },{passive:true});
  reduce.addEventListener('change',()=>{
    clearDelays();video.pause();
    if(reduce.matches){if(pending)clearTimeout(pending);wanted=1;syncScene(1);}
    else if(small.matches)startMobile();else scrollState();
  });
  hero.dataset.scene='splash';
  if(reduce.matches){syncScene(1);}
  else if(small.matches)startMobile();
  else{
    delayed.push(setTimeout(()=>{introElapsed=true;if(scrollProgress<.33)requestScene(1);},1300));
    scrollState();
  }
})();


/* ===== Components: motion-v6.js ===== */
/* V6 enhancement — authentic navigation video and supplied SVG-based campus transport animation. */
(() => {
  'use strict';

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* Navigation video */
  const video = document.getElementById('chapterNavVideo');
  const toggle = document.getElementById('chapterNavToggle');
  let navVisible = false;
  let navPausedByUser = false;

  function syncButton() {
    if (!toggle || !video) return;
    const paused = video.paused;
    toggle.setAttribute('aria-pressed', String(!paused));
    toggle.innerHTML = paused
      ? '<i class="fa-solid fa-play" aria-hidden="true"></i><span>Play preview</span>'
      : '<i class="fa-solid fa-pause" aria-hidden="true"></i><span>Pause preview</span>';
    toggle.setAttribute('aria-label', paused ? 'Play navigation preview' : 'Pause navigation preview');
  }

  function readyVideo() {
    if (!video) return;
    const source = video.querySelector('source');
    if (source?.dataset.src && !source.src) {
      source.src = source.dataset.src;
      video.load();
    }
  }

  function playVideo() {
    if (!video || reduce.matches || navPausedByUser || !navVisible || document.hidden) return;
    readyVideo();
    video.play().catch(() => {});
  }

  if (video) {
    video.addEventListener('pause', syncButton);
    video.addEventListener('play', syncButton);
    toggle?.addEventListener('click', () => {
      navPausedByUser = !video.paused;
      if (video.paused) {
        navPausedByUser = false;
        readyVideo();
        video.play().catch(() => {});
      } else {
        navPausedByUser = true;
        video.pause();
      }
    });
    const obs = new IntersectionObserver(([entry]) => {
      navVisible = entry.isIntersecting;
      if (navVisible) playVideo();
      else video.pause();
    }, { threshold: 0.35 });
    obs.observe(video);
    document.addEventListener('visibilitychange', () => (document.hidden ? video.pause() : playVideo()));
    syncButton();
  }

  /* Authentic vector transport map: move the four original bus groups,
     never draw a replacement bus over the screenshot. The green line has
     no vehicle in the provided SVG, so no artificial one is introduced. */
  const transportViewport = document.getElementById('transportNetworkViewport');
  const transportSvg = document.getElementById('transportNetworkSvg');
  const replay = document.getElementById('replayBus');

  const vehicleSpecs = [
    { busId: 'bus-group-1', pathId: 'motion-purple', travel: 60, duration: 6700, delay: 0, direction: 1 },
    { busId: 'bus-group-2', pathId: 'motion-orange-lower', travel: 62, duration: 7100, delay: 550, direction: -1 },
    { busId: 'bus-group-3', pathId: 'motion-orange-upper', travel: 56, duration: 6900, delay: 1100, direction: -1 },
    { busId: 'bus-group-4', pathId: 'motion-teal', travel: 62, duration: 7500, delay: 1550, direction: 1 }
  ];

  let vehicles = [];
  let transportVisible = false;
  let transportFrame = null;
  let transportStart = 0;

  function pointAt(path, length) {
    const total = path.getTotalLength();
    const at = Math.max(0, Math.min(total, length));
    const point = path.getPointAtLength(at);
    const before = path.getPointAtLength(Math.max(0, at - .7));
    const after = path.getPointAtLength(Math.min(total, at + .7));
    return { point, angle: Math.atan2(after.y - before.y, after.x - before.x) * 180 / Math.PI };
  }

  function findClosestLength(path, center) {
    const length = path.getTotalLength();
    let best = 0, bestDistance = Infinity;
    for (let i = 0; i <= 320; i++) {
      const distance = length * i / 320;
      const p = path.getPointAtLength(distance);
      const sq = (center.x-p.x)**2 + (center.y-p.y)**2;
      if (sq < bestDistance) { bestDistance=sq;best=distance; }
    }
    return best;
  }

  function resetVehicles() {
    for (const vehicle of vehicles) {
      vehicle.el.removeAttribute('transform');
      vehicle.el.style.opacity = '1';
    }
  }

  function initTransport() {
    if (!transportSvg) return;
    vehicles = vehicleSpecs.map(spec => {
      const el = transportSvg.querySelector('#' + spec.busId);
      const path = transportSvg.querySelector('#' + spec.pathId);
      if (!el || !path) return null;
      const box = el.getBBox();
      const center = {x:box.x + box.width/2, y:box.y + box.height/2};
      const startLength = findClosestLength(path, center);
      const baseAngle = pointAt(path, startLength).angle;
      const available = spec.direction > 0 ? path.getTotalLength()-startLength-2 : startLength-2;
      const maxTravel = Math.min(spec.travel, Math.max(0,available));
      return {spec, el, path, center, startLength, baseAngle, maxTravel: Math.max(0,maxTravel)};
    }).filter(Boolean);
    resetVehicles();
  }

  function renderTransport(elapsedMs) {
    for (const v of vehicles) {
      const period = v.spec.duration;
      const local = Math.max(0,elapsedMs-v.spec.delay) % period;
      const progress = local / period;
      // Finish naturally, fade during the last 12%, then restart at the
      // original position without flashing across an unrelated road.
      const fraction = Math.min(progress/.88,1);
      const distance = v.startLength + v.spec.direction * v.maxTravel * fraction;
      const {point,angle} = pointAt(v.path,distance);
      const dx=point.x-v.center.x, dy=point.y-v.center.y;
      const heading=angle-v.baseAngle; // Initial SVG orientation preserved; orange buses travel in reverse path direction to match their front-facing artwork.
      v.el.setAttribute('transform',`translate(${dx.toFixed(2)} ${dy.toFixed(2)}) rotate(${heading.toFixed(2)} ${v.center.x.toFixed(2)} ${v.center.y.toFixed(2)})`);
      v.el.style.opacity = progress < .88 ? '1' : String(Math.max(0,1-(progress-.88)/.12));
    }
  }

  function transportStep(ts) {
    if (!transportVisible || !vehicles.length || reduce.matches || document.hidden) {
      transportFrame=null;return;
    }
    if (!transportStart) transportStart=ts;
    renderTransport(ts-transportStart);
    transportFrame=requestAnimationFrame(transportStep);
  }

  function stopTransport() {
    if (transportFrame != null) cancelAnimationFrame(transportFrame);
    transportFrame=null;
    transportStart=0;
  }
  function startTransport(reset=false) {
    if (reduce.matches || !transportVisible || document.hidden || !vehicles.length) return;
    if (reset) { stopTransport();resetVehicles(); }
    if (transportFrame==null) transportFrame=requestAnimationFrame(transportStep);
  }

  if (transportSvg) {
    initTransport();
    new IntersectionObserver(([entry]) => {
      transportVisible=entry.isIntersecting;
      if (transportVisible) startTransport();else stopTransport();
    }, {threshold:.16}).observe(transportViewport);
    replay?.addEventListener('click', () => startTransport(true));
    reduce.addEventListener('change', () => {
      if(reduce.matches){stopTransport();resetVehicles();video?.pause();}
      else{startTransport(true);playVideo();}
    });
    document.addEventListener('visibilitychange', () => {
      if(document.hidden) stopTransport();else startTransport(true);
    });
  }
})();


/* ===== Components: story-v9.js ===== */
(() => {
  'use strict';
  const section = document.querySelector('.story-v9');
  if (!section) return;
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      section.classList.add('is-in-view');
      observer.disconnect();
    }
  }, {threshold: 0.17});
  observer.observe(section);
})();

