const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const year = $("#year");\nif (year) year.textContent = new Date().getFullYear();

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
  else window.setTimeout(enterSite, 2800);
}
const greetings = {
  bobo:["Hi there! Welcome to Big God Academy!","Let's learn, play and shine together!","Every little star has a big future!"],
  teddy:["Learning is an adventure!","Kindness makes our school brighter.","Let's discover something wonderful!"],
  star:["Dream big, little champion!","You have a bright future ahead!","Ready to explore our school?"],
  sunshine:["Hello, sunshine! You're welcome here!","At Big God, every child matters.","Let's grow in love and wisdom!"]
};
let waveTimer;
function greet(el) {
  const words = greetings[el.dataset.mascot] || greetings.bobo;
  $("#speech").textContent = words[Math.floor(Math.random()*words.length)]+" ✦";
  el.classList.remove("wave"); void el.offsetWidth; el.classList.add("wave");
  clearTimeout(waveTimer); waveTimer=setTimeout(()=>el.classList.remove("wave"),2000);
}
$$(".mascot").forEach(el => {
  el.addEventListener("click",()=>greet(el));
  el.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();greet(el);}});
});
$("#dismiss").addEventListener("click",()=>$("#helper").classList.remove("show"));

if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const targets = $$(".section,.stage,.tradition-grid article,.contact-grid");
  targets.forEach(el=>{el.style.opacity="0";el.style.transform="translateY(18px)";el.style.transition="opacity .65s,transform .65s";});
  const observer = new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting){entry.target.style.opacity="1";entry.target.style.transform="none";observer.unobserve(entry.target);}
  }),{threshold:.08});
  targets.forEach(el=>observer.observe(el));
}

/* Small roaming mascot companions: Captain Star flies; friends bounce and wave. */
if (!reduceMotion) {
  const roaming = document.createElement("div");
  roaming.className = "roaming-mascots";
  roaming.setAttribute("aria-hidden", "true");
  const routes = ["roam-bobo", "roam-teddy", "roam-captain", "roam-sunshine"];
  $$(".mascot").forEach((source, index) => {
    const buddy = source.cloneNode(true);
    buddy.className = "roaming-buddy " + routes[index];
    buddy.removeAttribute("role");
    buddy.removeAttribute("tabindex");
    buddy.removeAttribute("data-mascot");
    buddy.querySelectorAll("b").forEach(label => label.remove());
    buddy.querySelectorAll("svg").forEach(svg => svg.setAttribute("focusable", "false"));
    roaming.appendChild(buddy);
  });
  document.body.appendChild(roaming);
}
