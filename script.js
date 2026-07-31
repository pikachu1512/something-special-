/* ============================================================
   CONFIG — everything you're likely to want to change lives here
   ============================================================ */

// 🔐 REPLACE PASSWORD — this is the only place the password is checked
const PASSWORD_1 = "0110";
const PASSWORD_2 = "070324";

// ✍️ REPLACE LETTER — keep this in sync with the text inside #letterText
//    in index.html. Use "\n\n" for paragraph breaks.
const LETTER_TEXT = `
My dearest,

First and most importantly, Happy Girlfriend's Day to the best girlfriend anyone could ever have. <3

I wanted to express my gratitude towards you. Thank you for being by my side even after I annoy you all the time, eheee. In return, you can throw your tantrums at me whenever you want... although you already do that all the time. 😂

You are the best person I have ever met, and this is the longest friendship I have ever had in my entire life.

AND DAMN BRO... how can someone be that gorgeous, pretty, cute and beautiful? I seriously can't express your beauty in words. I'm already just a 5/10, but when I'm with you, you somehow make me look like a 2/10. 😭 I'm so lucky to have a GODDESS like you in my life.

I just wanted to make you feel special all the time (although someone is already self-obsessed 😤), and I think you also like my company... I'm not sure, but whatever.

If I ever do something wrong or hurt you, just point it out. I'll always try my best not to repeat it. And I'm sorry for making you worry sometimes and for bothering you with my lame habits and all the random nonsense I do.

At the end of the day, you're the best.

I love you. ❤️

Happy Girlfriend's Day once again.

                                   ~ From your cute little
                                             Idiot ❤️
`;

// Typewriter speed (ms per character)
const TYPE_SPEED = 28;

// 🌸 UNLOCK BURST TUNING — change these to customize the reveal feel
const BURST_PARTICLE_COUNT = 12;   // how many petals/hearts fly out
const BURST_SHRINK_MS = 120;       // step 1: button compress duration
const BURST_EXPAND_MS = 850;       // step 2: button expand + glow duration
const LOCK_FADE_OUT_MS = 700;      // step 4: password screen fade-out duration

/* ============================================================
   ELEMENT REFERENCES
   ============================================================ */
const body = document.body;
const lockScreen = document.getElementById("lockScreen");
const lockForm = document.getElementById("lockForm");
const passwordInput = document.getElementById("passwordInput");
const lockError = document.getElementById("lockError");
const lockCard = document.querySelector(".lock-card");

const unlockBtn = document.getElementById("unlockBtn");
const burstContainer = document.getElementById("burstContainer");
const mainContent = document.getElementById("mainContent");

const bgMusic = document.getElementById("bgMusic");
const muteToggle = document.getElementById("muteToggle");
const muteIcon = document.getElementById("muteIcon");

const letterText = document.getElementById("letterText");
const scrollIndicator = document.getElementById("scrollIndicator");

const navDots = document.querySelectorAll(".nav-dot");
const galleryCards = document.querySelectorAll(".gallery-card");

const finalHearts = document.getElementById("finalHearts");
const replayBtn = document.getElementById("replayBtn");

const petalLayer = document.getElementById("petalLayer");
const heartLayer = document.getElementById("heartLayer");

/* ============================================================
   PREVENT SCROLLING UNTIL UNLOCKED
   ============================================================ */
body.classList.add("locked");

/* ============================================================
   AMBIENT PARTICLES — sakura petals + floating hearts
   Runs continuously in the background (lightweight, CSS-driven)
   ============================================================ */
function spawnPetal() {
  const petal = document.createElement("div");
  petal.className = "petal";
  const startX = Math.random() * 100; // vw
  const drift = (Math.random() - 0.5) * 160; // px horizontal drift
  const duration = 8 + Math.random() * 7; // seconds
  const size = 8 + Math.random() * 10;

  petal.style.left = `${startX}vw`;
  petal.style.setProperty("--drift", `${drift}px`);
  petal.style.animationDuration = `${duration}s`;
  petal.style.width = `${size}px`;
  petal.style.height = `${size}px`;

  petalLayer.appendChild(petal);
  setTimeout(() => petal.remove(), duration * 1000 + 500);
}

function spawnMiniHeart() {
  const heart = document.createElement("div");
  heart.className = "mini-heart";
  heart.textContent = "❤";
  const startX = Math.random() * 100;
  const drift = (Math.random() - 0.5) * 120;
  const duration = 7 + Math.random() * 6;
  const size = 12 + Math.random() * 10;

  heart.style.left = `${startX}vw`;
  heart.style.setProperty("--drift", `${drift}px`);
  heart.style.animationDuration = `${duration}s`;
  heart.style.fontSize = `${size}px`;

  heartLayer.appendChild(heart);
  setTimeout(() => heart.remove(), duration * 1000 + 500);
}

// Spawn particles at a gentle, performance-friendly interval
const petalInterval = setInterval(spawnPetal, 900);
const heartInterval = setInterval(spawnMiniHeart, 1500);

// Seed a few immediately so the screen isn't empty on load
for (let i = 0; i < 6; i++) setTimeout(spawnPetal, i * 250);
for (let i = 0; i < 3; i++) setTimeout(spawnMiniHeart, i * 500);

/* ============================================================
   LOCK SCREEN — password check + shake feedback
   ============================================================ */
lockForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const entered = passwordInput.value.trim().toLowerCase();

  if (
    entered === PASSWORD_1.toLowerCase() ||
    entered === PASSWORD_2.toLowerCase()
) {
    unlockSite();
  } else {
    triggerShake();
  }
});

function triggerShake() {
  lockError.classList.add("show");
  lockCard.classList.remove("shake");
  // Force reflow so the animation can be re-triggered
  void lockCard.offsetWidth;
  lockCard.classList.add("shake");
  passwordInput.value = "";
  passwordInput.focus();

  lockCard.addEventListener(
    "animationend",
    () => lockCard.classList.remove("shake"),
    { once: true }
  );
}

/* ============================================================
   🌸 UNLOCK SEQUENCE — cinematic button burst + soft fade
   Correct password triggers, in order:
     1) button shrink            (BURST_SHRINK_MS)
     2) button expand + glow  +  sakura/heart burst  +  music starts
     3) password screen fades out
     4) letter section (main content) fades in
   Every step below is labeled so you can retime or restyle it
   independently — durations live in the CONFIG block up top.
   ============================================================ */
function unlockSite() {
  unlockBtn.disabled = true; // avoid double-submits mid-animation

  // 🌸 STEP 1 — soft compress, like a little inhale before the reveal
  unlockBtn.classList.add("btn-shrink");

  setTimeout(() => {
    unlockBtn.classList.remove("btn-shrink");

    // 🌸 STEP 2 — gentle expand + soft glow bloom
    unlockBtn.classList.add("btn-expand-glow");

    // 🌸 STEP 2b — sakura petals + tiny hearts drift up from the button
    spawnBurstParticles();

    // 🎵 STEP 2c — music begins right as the burst starts.
    //    This still counts as a user gesture (it's inside the click
    //    handler's call chain), so browsers allow the autoplay.
    startMusic();

    // 🌙 STEP 3 — password screen fades out, timed just behind the
    //    burst so the magic moment reads before the screen changes
    setTimeout(() => {
      lockScreen.classList.add("lock-fade-out");

      setTimeout(() => {
        lockScreen.classList.add("hidden");

        // 💌 STEP 4 — letter section fades in (see .main-content's
        //    own fadeIn animation in style.css)
        mainContent.classList.remove("hidden");
        body.classList.remove("locked"); // allow scrolling now

        startTypewriter();
        observeGallery();
        observeFinalSection();
      }, LOCK_FADE_OUT_MS);
    }, 300); // small pause so the burst is visible before the fade begins
  }, BURST_SHRINK_MS);
}

/* ============================================================
   🌸 BURST PARTICLES — sakura petals + tiny hearts
   Spawned from the button's center and drift upward with gentle,
   randomized direction/rotation. Kept few in number and short-lived
   so it stays elegant and lightweight rather than a confetti blast.
   ============================================================ */
function spawnBurstParticles() {
  burstContainer.innerHTML = "";

  for (let i = 0; i < BURST_PARTICLE_COUNT; i++) {
    const isPetal = i % 2 === 0; // alternate sakura petal / tiny heart
    const particle = document.createElement("div");
    particle.className = isPetal ? "burst-petal" : "burst-heart-particle";
    if (!isPetal) particle.textContent = "💖";

    // Mostly-upward drift with gentle left/right spread (not explosive)
    const tx = (Math.random() - 0.5) * 110; // horizontal drift, px
    const ty = -(45 + Math.random() * 65);  // upward distance, px
    const rot = (Math.random() - 0.5) * 150; // gentle tumble, deg
    const delay = Math.random() * 160;       // stagger the burst slightly

    particle.style.setProperty("--tx", `${tx}px`);
    particle.style.setProperty("--ty", `${ty}px`);
    particle.style.setProperty("--rot", `${rot}deg`);
    particle.style.animationDelay = `${delay}ms`;

    burstContainer.appendChild(particle);
    setTimeout(() => particle.remove(), 1700);
  }
}

/* ============================================================
   BACKGROUND MUSIC
   Starts only after the unlock button (a user gesture), which
   keeps it compliant with browser autoplay policies.
   ============================================================ */
let isMuted = false;

function startMusic() {
    bgMusic.volume = 0.55;
    bgMusic.currentTime = 20; // <-- Change this number
    const playPromise = bgMusic.play();
  if (playPromise !== undefined) {
    playPromise.catch(() => {
      // Autoplay was blocked for some reason — user can still
      // tap the mute/play toggle to start it manually.
      muteIcon.textContent = "🔇";
    });
  }
}

muteToggle.addEventListener("click", () => {
  isMuted = !isMuted;
  bgMusic.muted = isMuted;
  muteIcon.textContent = isMuted ? "🔇" : "🔊";

  // If music never started (autoplay block), this click can start it
  if (bgMusic.paused && !isMuted) {
    bgMusic.play().catch(() => {});
  }
});

/* ============================================================
   TYPEWRITER EFFECT — letter section
   ============================================================ */
function startTypewriter() {
  let i = 0;
  letterText.textContent = "";
  letterText.classList.remove("done");

  function typeChar() {
    if (i < LETTER_TEXT.length) {
      letterText.textContent += LETTER_TEXT.charAt(i);
      i++;
      setTimeout(typeChar, TYPE_SPEED);
    } else {
      letterText.classList.add("done");
    }
  }
  typeChar();
}

/* Hide the scroll indicator once the user starts scrolling past the letter */
window.addEventListener("scroll", () => {
  if (window.scrollY > 120) {
    scrollIndicator.style.opacity = "0";
  } else {
    scrollIndicator.style.opacity = "1";
  }
});

/* ============================================================
   GALLERY — reveal cards on scroll + active nav dot tracking
   ============================================================ */
function observeGallery() {
  const galleryObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
        }
      });
    },
    { threshold: 0.2 }
  );
  galleryCards.forEach((card) => galleryObserver.observe(card));
}

/* Highlight the matching nav dot as each section scrolls into view */
const sections = ["letterSection", "gallerySection", "finalSection"].map((id) =>
  document.getElementById(id)
);

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const index = sections.indexOf(entry.target);
        navDots.forEach((dot) => dot.classList.remove("active"));
        if (navDots[index]) navDots[index].classList.add("active");
      }
    });
  },
  { threshold: 0.5 }
);
sections.forEach((section) => section && sectionObserver.observe(section));

/* ============================================================
   FINAL SECTION — floating heart burst
   ============================================================ */
function observeFinalSection() {
  const finalSection = document.getElementById("finalSection");
  const finalObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          burstHearts();
          finalObserver.disconnect(); // only need to trigger once per visit
        }
      });
    },
    { threshold: 0.4 }
  );
  finalObserver.observe(finalSection);
}

function burstHearts() {
  finalHearts.innerHTML = "";
  const heartCount = 22;
  for (let i = 0; i < heartCount; i++) {
    setTimeout(() => {
      const heart = document.createElement("div");
      heart.className = "final-burst-heart";
      heart.textContent = "❤";
      heart.style.left = `${Math.random() * 100}%`;
      heart.style.bottom = "-5%";
      heart.style.animationDelay = `${Math.random() * 0.6}s`;
      heart.style.fontSize = `${1 + Math.random() * 1.3}rem`;
      finalHearts.appendChild(heart);
      setTimeout(() => heart.remove(), 4200);
    }, i * 140);
  }
}

/* ============================================================
   REPLAY BUTTON — smoothly resets the experience to the top
   ============================================================ */
replayBtn.addEventListener("click", () => {
  document.getElementById("letterSection").scrollIntoView({ behavior: "smooth" });
  // Re-run the typewriter and gallery reveal for a fresh feel
  setTimeout(() => {
    startTypewriter();
    galleryCards.forEach((card) => card.classList.remove("in-view"));
    observeGallery();
  }, 600);
});