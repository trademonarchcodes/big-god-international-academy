const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const year = $("#year");
if (year) year.textContent = new Date().getFullYear();

const menu = $(".menu"), nav = $(".header nav");
menu.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menu.setAttribute("aria-expanded", String(open));
  menu.textContent = open ? "×" : "☰";
});
$$(".header nav a").forEach(a => a.addEventListener("click", () => {
  nav.classList.remove("open"); menu.setAttribute("aria-expanded","false"); menu.textContent="☰";
}));

const intro = $("#intro");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
function enterSite() {
  if (!intro || intro.classList.contains("hide")) return;
  intro.classList.add("hide");
  try { sessionStorage.setItem("bga-intro-seen-v2","yes"); } catch(e) {}
  setTimeout(() => { const helper=$("#helper"); if(helper) helper.classList.add("show"); }, 900);
}
let seen = false;
try { seen = sessionStorage.getItem("bga-intro-seen-v2") === "yes"; } catch(e) {}
if (intro) {
  if (seen || reduceMotion) intro.classList.add("hide");
  else window.setTimeout(enterSite, 1400);
}
const guideRoutes = {
  bobo: { message:"Come with me! Let's explore fun school life and activities.", label:"Explore School Life", target:"#life" },
  teddy: { message:"Curious about our school? I'll show you who we are.", label:"Meet Our School", target:"#about" },
  star: { message:"Ready to reach for the stars? Discover your learning journey!", label:"Explore Academics", target:"#academics" },
  sunshine: { message:"Parents, let's take the next step together. We're happy to help!", label:"Contact the School", target:"#contact" }
};
let activeGuide = null;
let guideDismissTimer = null;
function closeGuide() {
  if (guideDismissTimer) window.clearTimeout(guideDismissTimer);
  guideDismissTimer = null;
  $$(".mascot").forEach(item => {
    item.classList.remove("guide-active");
    const bubble = item.querySelector(".mascot-guide-bubble");
    if (bubble) bubble.remove();
  });
  activeGuide = null;
}
function guide(el) {
  const info = guideRoutes[el.dataset.mascot] || guideRoutes.bobo;
  const wasOpen = el.classList.contains("guide-active");
  closeGuide();
  if (wasOpen) return;
  activeGuide = el;
  el.classList.add("guide-active");
  const bubble = document.createElement("div");
  bubble.className = "mascot-guide-bubble";
  bubble.setAttribute("role", "status");
  bubble.innerHTML = '<span class="guide-message"></span><a class="guide-link"></a>';
  bubble.querySelector(".guide-message").textContent = info.message;
  const link = bubble.querySelector(".guide-link");
  link.textContent = info.label + " →";
  link.href = info.target;
  link.addEventListener("click", event => {
    event.stopPropagation();
    closeGuide();
  });
  el.appendChild(bubble);
  el.classList.remove("wave"); void el.offsetWidth; el.classList.add("wave");
  window.setTimeout(() => el.classList.remove("wave"), 1100);
  // Keep the compact greeting brief; it never stays over the mascot.
  guideDismissTimer = window.setTimeout(closeGuide, 4200);
}
document.querySelectorAll(".mascot-guide-bubble a").forEach(a => a.addEventListener("click", event => event.stopPropagation()));

$$(".mascot").forEach(el => {
  el.setAttribute("role","group");
  el.setAttribute("aria-label", (el.querySelector("b")?.textContent || "School mascot") + ", tap to get directions around the website");
  el.addEventListener("click", () => guide(el));
  el.addEventListener("keydown", e => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); guide(el); }
  });
});
$("#dismiss").addEventListener("click",()=>$("#helper").classList.remove("show"));

if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const targets = $$(".section,.stage,.tradition-grid article,.contact-grid,.section>.mascot");
  targets.forEach(el=>{el.style.opacity="0";el.style.transform="translateY(18px)";el.style.transition="opacity .65s,transform .65s";});
  const observer = new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting){entry.target.style.opacity="1";entry.target.style.transform="none";if(entry.target.matches(".mascot")){entry.target.classList.add("mascot-entered");if(!entry.target.classList.contains("captain"))playMascotAction(entry.target);}observer.unobserve(entry.target);}
  }),{threshold:.08});
  targets.forEach(el=>observer.observe(el));
}


/* Character personalities: Captain Star flies through the page; each friend has a distinct greeting. */
function playMascotAction(el) {
  if (!el) return;
  el.classList.remove("teddy-greet","bobo-hop","sunshine-twirl");
  void el.offsetWidth;
  if (el.classList.contains("teddy")) el.classList.add("teddy-greet");
  if (el.classList.contains("bobo")) el.classList.add("bobo-hop");
  if (el.classList.contains("sunshine")) el.classList.add("sunshine-twirl");
  window.setTimeout(() => el.classList.remove("teddy-greet","bobo-hop","sunshine-twirl"), 1900);
}
const captain = document.querySelector(".mascot.captain");
const captainArt = captain?.querySelector(".mascot-art");
const captainOriginalSrc = captainArt?.getAttribute("src") || "";
const captainFrames = {
  // Full 32-frame Captain Star flight sequence uploaded to GitHub.
  flight: Array.from({ length: 32 }, (_, index) =>
    `assets/mascots/captain-actions/flight-${String(index + 1).padStart(2, "0")}.webp`
  ),
  salute: "assets/mascots/captain-actions/salute.webp",
  wave: "assets/mascots/captain-actions/wave.webp",
  point: "assets/mascots/captain-actions/point.webp",
  landing: "assets/mascots/captain-actions/landing.webp"
};
const captainPreloaded = {};
Object.values(captainFrames).flat().forEach(src => { const image = new Image(); image.src = src; captainPreloaded[src] = image; });
let captainFlightTimer = null;
let captainFrameTimer = null;
let captainFlying = false;
function setCaptainPose(src) {
  if (captainArt && src) captainArt.src = src;
}
function wait(ms) { return new Promise(resolve => window.setTimeout(resolve, ms)); }
async function launchCaptain() {
  if (!captain || !captainArt || captainFlying || document.hidden || reduceMotion) return;
  captainFlying = true;
  const home = captain.parentNode;
  const marker = document.createComment("Captain Star home");
  home.insertBefore(marker, captain);
  document.body.appendChild(captain);
  captain.classList.add("captain-flight");
  captain.setAttribute("aria-label","Captain Star is flying between landing spots");
  captain.style.left = "0px";
  captain.style.top = "0px";
  captain.style.transform = "translate(0px,0px)";
  const w = () => Math.min(window.innerWidth * .17, 178);
  const h = () => Math.min(window.innerHeight * .23, 225);
  const spots = [
    {x:window.innerWidth*.06,y:window.innerHeight*.18,turn:-8,pose:captainFrames.salute},
    {x:window.innerWidth*.76,y:window.innerHeight*.34,turn:9,pose:captainFrames.wave},
    {x:window.innerWidth*.40,y:window.innerHeight*.62,turn:-4,pose:captainFrames.point},
    {x:window.innerWidth*.08,y:window.innerHeight*.48,turn:7,pose:captainFrames.landing}
  ];
  const maxX = () => Math.max(8, window.innerWidth - w() - 8);
  const maxY = () => Math.max(8, window.innerHeight - h() - 8);
  const framePause = ms => wait(ms);
  try {
    let previous = {x:-w(),y:window.innerHeight*.12};
    for (let leg=0; leg<spots.length; leg++) {
      if (!captain.isConnected || document.hidden) break;
      const spot=spots[leg], x=Math.max(8,Math.min(maxX(),spot.x)), y=Math.max(8,Math.min(maxY(),spot.y));
      const first=leg*8;
      let frame=first;
      setCaptainPose(captainFrames.flight[frame]);
      const frameTimer=window.setInterval(()=>{
        frame=Math.min(first+7,frame+1);
        setCaptainPose(captainFrames.flight[frame]);
      },105);
      const move=captain.animate([
        {transform:`translate(${previous.x}px,${previous.y}px) rotate(${spot.turn-10}deg) scale(.88)`},
        {transform:`translate(${(previous.x+x)/2}px,${Math.min(previous.y,y)-24}px) rotate(${spot.turn+5}deg) scale(1.04)`},
        {transform:`translate(${x}px,${y}px) rotate(${spot.turn}deg) scale(1)`}
      ],{duration:1050,easing:"cubic-bezier(.22,.72,.24,1)",fill:"forwards"});
      await move.finished.catch(()=>{});
      window.clearInterval(frameTimer);
      captain.style.transform=`translate(${x}px,${y}px) rotate(0deg) scale(1)`;
      setCaptainPose(spot.pose);
      captain.classList.add("captain-salute");
      await framePause(leg===3?650:520);
      captain.classList.remove("captain-salute");
      previous={x,y};
    }
  } finally {
    captain.classList.remove("captain-flight","captain-salute");
    captain.getAnimations().forEach(a=>a.cancel());
    captain.style.left="";
    captain.style.top="";
    captain.style.transform="";
    setCaptainPose(captainOriginalSrc);
    if(marker.parentNode) marker.parentNode.insertBefore(captain,marker);
    marker.remove();
    captain.setAttribute("aria-label","Captain Star, tap to greet");
    captainFlying=false;
    captainFlightTimer=window.setTimeout(launchCaptain,12000);
  }
}
if (captain && !reduceMotion) {
  captainFlightTimer = window.setTimeout(launchCaptain, 2600);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      window.clearTimeout(captainFlightTimer);
      window.clearInterval(captainFrameTimer);
      captainFlightTimer = null;
      captainFrameTimer = null;
    } else if (!captainFlying && !captainFlightTimer) {
      captainFlightTimer = window.setTimeout(launchCaptain, 1600);
    }
  });
}

/* Mascots stay beside their assigned sections and guide visitors when tapped. */
