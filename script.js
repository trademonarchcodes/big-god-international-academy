const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
$("#year").textContent = new Date().getFullYear();

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
function enterSite() {
  intro.classList.add("hide");
  try { sessionStorage.setItem("bga-intro-seen","yes"); } catch(e) {}
  setTimeout(() => $("#helper").classList.add("show"), 900);
}
let seen = false;
try { seen = sessionStorage.getItem("bga-intro-seen") === "yes"; } catch(e) {}
if (seen || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  intro.classList.add("hide");
  setTimeout(() => $("#helper").classList.add("show"), 900);
}
$("#enter").addEventListener("click", enterSite);
$("#skip").addEventListener("click", enterSite);

const confetti = $("#confetti");
const colours = ["#f4c84e","#ef8794","#76c9e8","#8bd19a","#b99ae9","#fff"];
for (let i=0;i<38;i++) {
  const bit = document.createElement("i");
  bit.style.setProperty("--x", Math.random()*100+"%");
  bit.style.setProperty("--c", colours[i%colours.length]);
  bit.style.setProperty("--d", (4+Math.random()*5)+"s");
  bit.style.setProperty("--delay", (Math.random()*4)+"s");
  confetti.appendChild(bit);
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
