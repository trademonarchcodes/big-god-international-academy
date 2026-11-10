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
  playMascotAction(el);
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

// Keep the floating mascot hint out of the footer so the DEVLYON credit stays visible.
const mascotHint = $("#helper");
const pageFooter = $("footer");
if (mascotHint && pageFooter && "IntersectionObserver" in window) {
  const footerHintObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      mascotHint.classList.toggle("footer-hidden", entry.isIntersecting);
    });
  }, {threshold:0.01});
  footerHintObserver.observe(pageFooter);
}


if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const targets = $$(".section,.stage,.tradition-grid article,.contact-grid,.section>.mascot");
  targets.forEach(el=>{el.style.opacity="0";el.style.transform="translateY(18px)";el.style.transition="opacity .65s,transform .65s";});
  const observer = new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting){entry.target.style.opacity="1";entry.target.style.transform="none";if(entry.target.matches(".mascot")){entry.target.classList.add("mascot-entered");if(!entry.target.classList.contains("captain"))playMascotAction(entry.target);}else{observer.unobserve(entry.target);}}
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
// Use the clean, full-size Captain Star artwork during flight. The old extracted
// sprite frames contain neighbouring poses and clipped limbs, so they are intentionally bypassed.
let captainFlightTimer = null;
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
  captain.setAttribute("aria-label","Captain Star is flying between four landing spots");
  captain.style.left = "0px";
  captain.style.top = "0px";
  captain.style.transform = "translate(0px,0px)";
  // Square viewport keeps the original transparent artwork at its natural proportions.
  const size = () => Math.min(window.innerWidth * .17, 178);
  const maxX = () => Math.max(8, window.innerWidth - size() - 8);
  const maxY = () => Math.max(8, window.innerHeight - size() - 8);
  const poseBase = "/assets/mascots/captain-actions/";
  const poseSources = {
    flight: poseBase + "captain-flight.svg",
    wave: poseBase + "captain-wave.svg",
    landing: poseBase + "captain-landing.svg"
  };
  const rawSpots = [
    {x:window.innerWidth*.07,y:window.innerHeight*.16,turn:-9,hold:650,pose:"flight"},
    {x:window.innerWidth*.76,y:window.innerHeight*.31,turn:10,hold:850,pose:"wave"},
    {x:window.innerWidth*.43,y:window.innerHeight*.63,turn:-6,hold:650,pose:"flight"},
    {x:window.innerWidth*.09,y:window.innerHeight*.47,turn:7,hold:900,pose:"landing"}
  ];
  const spots = rawSpots.map(p=>({...p,x:Math.max(8,Math.min(maxX(),p.x)),y:Math.max(8,Math.min(maxY(),p.y))}));
  try {
    let previous = {x:-size(),y:window.innerHeight*.12};
    for (const spot of spots) {
      if (!captain.isConnected || document.hidden) break;
      setCaptainPose(poseSources[spot.pose] || poseSources.flight);
      const move = captain.animate([
        {transform:`translate(${previous.x}px,${previous.y}px) rotate(${spot.turn-13}deg) scale(.82)`},
        {transform:`translate(${(previous.x+spot.x)/2}px,${Math.min(previous.y,spot.y)-55}px) rotate(${spot.turn+8}deg) scale(1.08)`},
        {transform:`translate(${spot.x}px,${spot.y}px) rotate(${spot.turn}deg) scale(1)`}
      ],{duration:1250,easing:"cubic-bezier(.18,.72,.2,1)",fill:"forwards"});
      await move.finished.catch(()=>{});
      captain.style.transform=`translate(${spot.x}px,${spot.y}px) rotate(0deg) scale(1)`;
      captain.classList.add("captain-salute");
      await wait(spot.hold);
      captain.classList.remove("captain-salute");
      previous = {x:spot.x,y:spot.y};
    }
  } finally {
    captain.classList.remove("captain-flight","captain-salute");
    captain.getAnimations().forEach(animation=>animation.cancel());
    captain.style.left="";
    captain.style.top="";
    captain.style.transform="";
    setCaptainPose(captainOriginalSrc);
    if(marker.parentNode) marker.parentNode.insertBefore(captain,marker);
    marker.remove();
    captain.setAttribute("aria-label","Captain Star, tap to greet");
    captainFlying=false;
    captainFlightTimer=window.setTimeout(launchCaptain,15000);
  }
}
if (captain && !reduceMotion) {
  captainFlightTimer = window.setTimeout(launchCaptain, 2600);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      window.clearTimeout(captainFlightTimer);
      captainFlightTimer = null;
    } else if (!captainFlying && !captainFlightTimer) {
      captainFlightTimer = window.setTimeout(launchCaptain, 1600);
    }
  });
}

/* Mascots stay beside their assigned sections and guide visitors when tapped. */
