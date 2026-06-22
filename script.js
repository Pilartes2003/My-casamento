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
const videoCarousel = document.querySelector(".video-carousel");
const videoTrack = document.querySelector("#videoTrack");
const videoSlides = [...document.querySelectorAll(".video-slide")];
const videoPrev = document.querySelector("#videoPrev");
const videoNext = document.querySelector("#videoNext");
const videoDots = document.querySelector("#videoDots");

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

const letterText = "Minha Elizandra, há um ano prometi amar-te, proteger-te e escolher-te. Hoje compreendo essa promessa ainda mais profundamente. Tu és a minha calma, a minha alegria, a minha oração respondida e a parte mais bonita de todos os meus dias. Amo a vida que estamos a construir, e vou continuar a escolher-te em cada estação, em cada amanhecer, em cada para sempre que nos for dado.";

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

let currentVideoSlide = 0;

function pauseCarouselVideos() {
  videoSlides.forEach((slide) => {
    const video = slide.querySelector("video");
    if (video) video.pause();
  });
}

function updateVideoCarousel(index) {
  currentVideoSlide = (index + videoSlides.length) % videoSlides.length;
  videoTrack.style.transform = `translateX(-${currentVideoSlide * 100}%)`;

  videoSlides.forEach((slide, slideIndex) => {
    slide.classList.toggle("is-active", slideIndex === currentVideoSlide);
    slide.setAttribute("aria-hidden", String(slideIndex !== currentVideoSlide));
  });

  videoDots.querySelectorAll("button").forEach((dot, dotIndex) => {
    dot.classList.toggle("is-active", dotIndex === currentVideoSlide);
    dot.setAttribute("aria-current", dotIndex === currentVideoSlide ? "true" : "false");
  });

  const activeVideo = videoSlides[currentVideoSlide].querySelector("video");
  if (activeVideo && activeVideo.readyState === 0) activeVideo.load();

  pauseCarouselVideos();
}

function setVideoFrameReady(video) {
  const frame = video.closest(".video-frame");
  frame.classList.remove("is-missing");
  frame.classList.add("is-ready");
}

function setVideoFrameMissing(video) {
  const frame = video.closest(".video-frame");
  frame.classList.add("is-missing");
  frame.classList.remove("is-ready");
}

videoSlides.forEach((slide, index) => {
  const video = slide.querySelector("video");
  const dot = document.createElement("button");

  dot.type = "button";
  dot.setAttribute("aria-label", `Mostrar vídeo ${index + 1}`);
  dot.addEventListener("click", () => updateVideoCarousel(index));
  videoDots.appendChild(dot);

  video.addEventListener("loadedmetadata", () => setVideoFrameReady(video));
  video.addEventListener("loadeddata", () => setVideoFrameReady(video));
  video.addEventListener("canplay", () => setVideoFrameReady(video));

  video.addEventListener("error", () => setVideoFrameMissing(video));

  if (video.readyState > 0) setVideoFrameReady(video);
});

videoPrev.addEventListener("click", () => updateVideoCarousel(currentVideoSlide - 1));
videoNext.addEventListener("click", () => updateVideoCarousel(currentVideoSlide + 1));

videoCarousel.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") updateVideoCarousel(currentVideoSlide - 1);
  if (event.key === "ArrowRight") updateVideoCarousel(currentVideoSlide + 1);
});

updateVideoCarousel(0);

const roseGarden = document.querySelector("#interactiveRose");
const petals = [...document.querySelectorAll(".petal")];

function revealPetalMessage(petal) {
  petals.forEach((item) => item.classList.remove("is-active"));
  petal.classList.add("is-active");
  petalMessage.textContent = petal.dataset.message;
  petalMessage.animate([
    { opacity: 0, transform: "translateY(0.5rem)" },
    { opacity: 1, transform: "translateY(0)" }
  ], {
    duration: 420,
    easing: "ease-out"
  });
}

petals.forEach((petal) => {
  petal.addEventListener("click", () => revealPetalMessage(petal));
});

roseGarden.addEventListener("click", (event) => {
  if (event.target.closest(".petal")) return;

  const rect = roseGarden.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const angle = Math.atan2(event.clientY - centerY, event.clientX - centerX);
  const normalizedAngle = (angle + Math.PI * 2) % (Math.PI * 2);
  const petalIndex = Math.round(normalizedAngle / (Math.PI / 3)) % petals.length;

  revealPetalMessage(petals[petalIndex]);
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
    musicToggle.setAttribute("aria-label", "Pausar música de fundo");
    musicToggle.setAttribute("aria-pressed", "true");
  } else {
    await audioContext.suspend();
    musicToggle.classList.remove("is-playing");
    musicToggle.setAttribute("aria-label", "Tocar música de fundo");
    musicToggle.setAttribute("aria-pressed", "false");
  }
});
