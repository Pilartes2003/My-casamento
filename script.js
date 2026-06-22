const weddingDate = new Date("2025-06-22T00:00:00");
const intro = document.querySelector("#intro");
const enterButton = document.querySelector("#enterButton");
const musicToggle = document.querySelector("#musicToggle");
const envelope = document.querySelector("#envelope");
const typedLetter = document.querySelector("#typedLetter");
const loveLetter = document.querySelector("#loveLetter");
const lightbox = document.querySelector("#lightbox");
const lightboxClose = document.querySelector("#lightboxClose");
const lightboxTitle = document.querySelector("#lightboxTitle");
const lightboxCaption = document.querySelector("#lightboxCaption");
const lightboxArt = document.querySelector("#lightboxArt");
const petalMessage = document.querySelector("#petalMessage");

let audioContext;
let musicNodes = [];
let isPlaying = false;
let hasTypedLetter = false;

document.body.classList.add("is-locked");

enterButton.addEventListener("click", () => {
  intro.classList.add("is-hidden");
  document.body.classList.remove("is-locked");
  setTimeout(() => intro.remove(), 950);
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;

    entry.target.classList.add("is-visible");
    revealObserver.unobserve(entry.target);
  });
}, {
  threshold: 0.18,
  rootMargin: "0px 0px -8% 0px"
});

document.querySelectorAll(".reveal").forEach((element, index) => {
  element.style.setProperty("--delay", `${Math.min(index * 70, 420)}ms`);
  revealObserver.observe(element);
});

function updateCounter() {
  const now = new Date();
  const diff = Math.max(0, now - weddingDate);
  const secondsTotal = Math.floor(diff / 1000);
  const days = Math.floor(secondsTotal / 86400);
  const hours = Math.floor((secondsTotal % 86400) / 3600);
  const minutes = Math.floor((secondsTotal % 3600) / 60);
  const seconds = secondsTotal % 60;

  document.querySelector('[data-unit="days"]').textContent = days.toLocaleString();
  document.querySelector('[data-unit="hours"]').textContent = String(hours).padStart(2, "0");
  document.querySelector('[data-unit="minutes"]').textContent = String(minutes).padStart(2, "0");
  document.querySelector('[data-unit="seconds"]').textContent = String(seconds).padStart(2, "0");
}

updateCounter();
setInterval(updateCounter, 1000);

const letterText = "My Elizandra, one year ago I promised to love you, protect you, and choose you. Today I understand that promise even more deeply. You are my calm, my joy, my answered prayer, and the most beautiful part of my every day. I love the life we are building, and I will keep choosing you in every season, in every sunrise, in every forever we are given.";

function typeLetter() {
  if (hasTypedLetter) return;
  hasTypedLetter = true;
  let index = 0;
  typedLetter.textContent = "";

  const type = () => {
    typedLetter.textContent += letterText.charAt(index);
    index += 1;
    if (index < letterText.length) {
      setTimeout(type, index % 3 === 0 ? 22 : 14);
    }
  };

  type();
}

envelope.addEventListener("click", () => {
  envelope.classList.add("is-open");
  envelope.setAttribute("aria-expanded", "true");
  loveLetter.classList.add("is-visible");
  setTimeout(typeLetter, 520);
});

document.querySelectorAll(".gallery__item").forEach((item) => {
  item.addEventListener("click", () => {
    const artClass = [...item.querySelector(".memory-art").classList].find((className) => className.startsWith("memory-art--"));
    lightboxTitle.textContent = item.dataset.title;
    lightboxCaption.textContent = item.dataset.caption;
    lightboxArt.className = `lightbox__art ${artClass}`;
    lightbox.hidden = false;
    document.body.classList.add("is-locked");
    lightboxClose.focus();
  });
});

function closeLightbox() {
  lightbox.hidden = true;
  document.body.classList.remove("is-locked");
}

lightboxClose.addEventListener("click", closeLightbox);
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) closeLightbox();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !lightbox.hidden) closeLightbox();
});

document.querySelectorAll(".petal").forEach((petal) => {
  petal.addEventListener("click", () => {
    document.querySelectorAll(".petal").forEach((item) => item.classList.remove("is-active"));
    petal.classList.add("is-active");
    petalMessage.textContent = petal.dataset.message;
    petalMessage.animate([
      { opacity: 0, transform: "translateY(0.5rem)" },
      { opacity: 1, transform: "translateY(0)" }
    ], {
      duration: 420,
      easing: "ease-out"
    });
  });
});

function createPetal() {
  const petal = document.createElement("span");
  const size = 9 + Math.random() * 11;
  const duration = 8000 + Math.random() * 6000;
  const drift = (Math.random() * 180 - 90).toFixed(0);

  petal.className = "petal-fall";
  petal.style.left = `${Math.random() * 100}vw`;
  petal.style.width = `${size}px`;
  petal.style.height = `${size * 1.45}px`;
  petal.style.animationDuration = `${duration}ms`;
  petal.style.setProperty("--drift", `${drift}px`);
  document.body.appendChild(petal);
  setTimeout(() => petal.remove(), duration);
}

setInterval(() => {
  if (document.hidden) return;
  createPetal();
}, 650);

function createMusic() {
  audioContext = new AudioContext();
  const masterGain = audioContext.createGain();
  masterGain.gain.value = 0.035;
  masterGain.connect(audioContext.destination);

  const notes = [261.63, 329.63, 392, 523.25];
  musicNodes = notes.map((frequency, index) => {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = index === 0 ? "sine" : "triangle";
    oscillator.frequency.value = frequency;
    gain.gain.value = index === 0 ? 0.8 : 0.32;
    oscillator.connect(gain);
    gain.connect(masterGain);
    oscillator.start();

    return { oscillator, gain };
  });

  const pulse = () => {
    if (!audioContext || !isPlaying) return;
    const time = audioContext.currentTime;
    musicNodes.forEach(({ gain }, index) => {
      gain.gain.cancelScheduledValues(time);
      gain.gain.setValueAtTime(index === 0 ? 0.5 : 0.16, time);
      gain.gain.linearRampToValueAtTime(index === 0 ? 0.9 : 0.34, time + 1.4);
      gain.gain.linearRampToValueAtTime(index === 0 ? 0.5 : 0.16, time + 3.8);
    });
    setTimeout(pulse, 3900);
  };

  pulse();
}

musicToggle.addEventListener("click", async () => {
  if (!audioContext) createMusic();

  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }

  isPlaying = !isPlaying;

  if (isPlaying) {
    await audioContext.resume();
    musicToggle.classList.add("is-playing");
    musicToggle.setAttribute("aria-label", "Pause background music");
    musicToggle.setAttribute("aria-pressed", "true");
  } else {
    await audioContext.suspend();
    musicToggle.classList.remove("is-playing");
    musicToggle.setAttribute("aria-label", "Play background music");
    musicToggle.setAttribute("aria-pressed", "false");
  }
});
