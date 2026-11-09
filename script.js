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
function guide(el) {
  const info = guideRoutes[el.dataset.mascot] || guideRoutes.bobo;
  const wasOpen = el.classList.contains("guide-active");
  $$(".mascot").forEach(item => {
    item.classList.remove("guide-active");
    const old = item.querySelector(".mascot-guide-bubble");
    if (old) old.remove();
  });
  if (wasOpen) { activeGuide = null; return; }
  activeGuide = el;
  el.classList.add("guide-active");
  const bubble = document.createElement("div");
  bubble.className = "mascot-guide-bubble";
  bubble.innerHTML = '<span class="guide-message"></span><a class="guide-link"></a>';
  bubble.querySelector(".guide-message").textContent = info.message;
  const link = bubble.querySelector(".guide-link");
  link.textContent = info.label + " →";
  link.href = info.target;
  link.addEventListener("click", event => {
    event.stopPropagation();
    el.classList.remove("guide-active");
    bubble.remove();
    activeGuide = null;
  });
  el.appendChild(bubble);
  el.classList.remove("wave"); void el.offsetWidth; el.classList.add("wave");
  window.setTimeout(() => el.classList.remove("wave"), 1100);
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
    if(entry.isIntersecting){entry.target.style.opacity="1";entry.target.style.transform="none";if(entry.target.matches(".mascot"))entry.target.classList.add("mascot-entered");observer.unobserve(entry.target);}
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
let captainFlightTimer = null;
let captainFlying = false;
function launchCaptain() {
  if (!captain || captainFlying || document.hidden || reduceMotion) return;
  captainFlying = true;
  const home = captain.parentNode;
  const marker = document.createComment("Captain Star home");
  home.insertBefore(marker, captain);
  document.body.appendChild(captain);
  captain.classList.add("captain-flight");
  captain.setAttribute("aria-label","Captain Star is flying across the school website");
  const finishFlight = () => {
    captain.classList.remove("captain-flight","captain-salute");
    marker.parentNode?.insertBefore(captain, marker);
    marker.remove();
    captain.setAttribute("aria-label","Captain Star, tap to greet");
    captainFlying = false;
    captainFlightTimer = window.setTimeout(launchCaptain, 17000);
  };
  captain.addEventListener("animationend", finishFlight, {once:true});
  window.setTimeout(() => {
    if (!captainFlying) return;
    captain.classList.add("captain-salute");
  }, 2600);
}
if (captain && !reduceMotion) {
  captainFlightTimer = window.setTimeout(launchCaptain, 2600);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && captainFlightTimer) {
      window.clearTimeout(captainFlightTimer);
      captainFlightTimer = null;
    } else if (!document.hidden && !captainFlying && !captainFlightTimer) {
      captainFlightTimer = window.setTimeout(launchCaptain, 1600);
    }
  });
}

/* Mascots stay beside their assigned sections and guide visitors when tapped. */
