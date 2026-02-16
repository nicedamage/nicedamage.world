// =========================
// MESSAGE BOARD + MEDIA PLAYER + SPARKLE CURSOR
// =========================

window.addEventListener("DOMContentLoaded", () => {
/* -------------------------
   MESSAGE BOARD (DESKTOP + MOBILE UI ONLY)
   NO STORAGE / NO FIREBASE
------------------------- */

const msgBoard = document.getElementById("message-board");
const msgMini  = document.getElementById("message-board-mini");
const mbMin    = document.getElementById("mb-minimize");
const mbClose  = document.getElementById("mb-close");
const mbOpen   = document.getElementById("mb-open"); // "leave a comment"

const isMobile = () => window.matchMedia("(max-width: 1024px)").matches;

if (msgBoard) {

  // ---------- INITIAL STATE ----------
  if (isMobile()) {
    msgBoard.classList.add("closed");
    msgBoard.classList.remove("minimized", "full");
  } else {
    msgBoard.classList.add("minimized");
    msgBoard.classList.remove("closed", "full");
  }

  // ---------- OPEN FULL ----------
  if (mbOpen) {
    mbOpen.addEventListener("click", () => {
      msgBoard.classList.remove("minimized", "closed");
      msgBoard.classList.add("full");
      if (mbMin) mbMin.textContent = "_";
    });
  }

  // ---------- MINIMIZE / MAXIMIZE (DESKTOP ONLY) ----------
  if (mbMin) {
    mbMin.addEventListener("click", () => {
      if (msgBoard.classList.contains("minimized")) {
        msgBoard.classList.remove("minimized");
        msgBoard.classList.add("full");
        mbMin.textContent = "_";
      } else {
        msgBoard.classList.remove("full");
        msgBoard.classList.add("minimized");
        mbMin.textContent = "▢";
      }
    });
  }

  // ---------- CLOSE ----------
  if (mbClose) {
    mbClose.addEventListener("click", () => {
      msgBoard.classList.add("closed");
      msgBoard.classList.remove("minimized", "full");
    });
  }

  // ---------- MINI BUTTON ----------
  if (msgMini) {
    msgMini.addEventListener("click", () => {

      // MOBILE → open full
      if (isMobile()) {
        msgBoard.classList.remove("closed");
        msgBoard.classList.add("full");
        if (mbMin) mbMin.textContent = "_";
        return;
      }

      // DESKTOP → minimized
      msgBoard.classList.remove("closed", "full");
      msgBoard.classList.add("minimized");
      if (mbMin) mbMin.textContent = "▢";
    });
  }
}





  /* -------------------------
     MEDIA PLAYER CODE
  ------------------------- */

  const player = document.getElementById("music-player");
  const audio = document.getElementById("audio");
  const playBtn = document.getElementById("play");
  const nextBtn = document.getElementById("next");
  const prevBtn = document.getElementById("prev");
  const volume = document.getElementById("volume");
  const trackTitle = document.getElementById("track-title");

  const canvas = document.getElementById("visualizer-canvas");
  const ctx = canvas.getContext("2d");

  if (canvas) {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  const playlist = [
    { title: "Aphex Twin – Windowlicker", src: "windowlicker.mp3" },
    { title: "Plush Managements Inc. - Mr. Mailman feat. Bea", src: "mr-mailman-feat-bea.mp3" }
  ];

  let currentTrack = 0;

  function loadTrack(index) {
    audio.src = playlist[index].src;
    trackTitle.textContent = playlist[index].title;
  }

  loadTrack(currentTrack);

  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const audioCtx = new AudioContext();
  const source = audioCtx.createMediaElementSource(audio);
  const analyser = audioCtx.createAnalyser();

  analyser.fftSize = 128;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  source.connect(analyser);
  analyser.connect(audioCtx.destination);

  playBtn.addEventListener("click", () => {
    if (audio.paused) {
      audioCtx.resume();
      audio.play();
      playBtn.textContent = "❚❚";
      renderVisualizer();
    } else {
      audio.pause();
      playBtn.textContent = "▶";
    }
  });

  nextBtn.addEventListener("click", () => {
    currentTrack = (currentTrack + 1) % playlist.length;
    loadTrack(currentTrack);
    audio.play();
  });

  prevBtn.addEventListener("click", () => {
    currentTrack = (currentTrack - 1 + playlist.length) % playlist.length;
    loadTrack(currentTrack);
    audio.play();
  });

  volume.addEventListener("input", () => {
    audio.volume = volume.value;
  });

  audio.addEventListener("ended", () => {
    currentTrack = (currentTrack + 1) % playlist.length;
    loadTrack(currentTrack);
    audio.play();
  });

  let time = 0;
  let energySmoothed = 0;

  function renderVisualizer() {
    requestAnimationFrame(renderVisualizer);
    analyser.getByteFrequencyData(dataArray);

    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    let low = 0, mid = 0, high = 0;

    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i];
      if (i < bufferLength * 0.25) low += v;
      else if (i < bufferLength * 0.6) mid += v;
      else high += v;
    }

    low /= bufferLength * 0.25;
    mid /= bufferLength * 0.35;
    high /= bufferLength * 0.4;

    const energy = (low * 0.5 + mid * 0.35 + high * 0.15) / 255;
    energySmoothed = energySmoothed * 0.9 + energy * 0.1;

    if (energySmoothed < 0.015) return;

    const turbulence = low * 0.004;
    const flowSpeed = mid * 0.0008;
    const shimmer = high * 0.002;

    time += 0.6 + flowSpeed * 120;

    const pointCount = 70;
    const baseRadius = Math.min(canvas.width, canvas.height) * 0.18;

    ctx.beginPath();

    for (let i = 0; i <= pointCount; i++) {
      const a = (i / pointCount) * Math.PI * 2;
      const field =
        Math.sin(a * 3 + time * 0.01) +
        Math.sin(a * 7 - time * 0.008) * 0.6 +
        Math.sin(time * 0.04 + i) * turbulence * 100;

      const r = baseRadius + field * 1 * energySmoothed;
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    const hue = 220 + Math.sin(time * 0.0008) * 15;
    ctx.strokeStyle = `hsla(${hue}, 60%, 60%, ${0.35 + energySmoothed * 0.2})`;
    ctx.lineWidth = 1.6 + energySmoothed * 2;
    ctx.shadowColor = `hsla(${hue}, 70%, 65%, 0.6)`;
    ctx.stroke();

    const thickness = 1.4 + energySmoothed * 2.2;
    ctx.strokeStyle = `hsla(${hue}, 80%, 60%, ${0.35 + energySmoothed * 0.25})`;
    ctx.lineWidth = thickness;
    ctx.shadowColor = `hsla(${hue}, 80%, 60%, 0.5)`;
    ctx.stroke();
  }

  // Dragging
  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  player.style.position = "fixed";
  player.style.cursor = "grab";

  player.addEventListener("mousedown", (e) => {
    isDragging = true;
    offsetX = e.clientX - player.offsetLeft;
    offsetY = e.clientY - player.offsetTop;
    player.style.cursor = "grabbing";
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    player.style.left = e.clientX - offsetX + "px";
    player.style.top = e.clientY - offsetY + "px";
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
    player.style.cursor = "grab";
  });

  // Minimize/close
  const mini = document.getElementById("music-player-mini");
  const minimizeBtn = document.getElementById("wmp-minimize");
  const closeBtn = document.getElementById("wmp-close");

  minimizeBtn.addEventListener("click", () => {
    const isMinimized = player.classList.toggle("minimized");
    minimizeBtn.textContent = isMinimized ? "▢" : "_";
  });

  closeBtn.addEventListener("click", () => {
    player.classList.add("closed");
  });

  mini.addEventListener("click", () => {
    player.classList.remove("closed");
    player.classList.remove("minimized");
    minimizeBtn.textContent = "_";
  });


function adjustLayoutForPlayer() {
  const player = document.getElementById("music-player");
  const pageLayout = document.querySelector(".page-layout");
  const textBlock = document.querySelector(".text-block");
  const header = document.querySelector("header");
  const messageMini = document.getElementById("message-board-mini");

  if (window.matchMedia("(max-width: 1024px)").matches) {

    // ---- Measure top ----
    const headerHeight = header.offsetHeight;
    textBlock.style.top = headerHeight + -7 + "px";

    const textBlockHeight = textBlock.offsetHeight;
    const totalTopHeight = headerHeight + textBlockHeight;

    // ---- Measure bottom ----
    const playerHeight = player.offsetHeight;
    const miniHeight = messageMini.offsetHeight;

        // Apply dynamic padding
    pageLayout.style.paddingTop = totalTopHeight + "px";
    pageLayout.style.paddingBottom =
      playerHeight + miniHeight + "px";

    // Position mini above player
    messageMini.style.bottom =
      playerHeight + "px";
    } else {
      pageLayout.style.paddingTop = "";
      pageLayout.style.paddingBottom = "";
      messageMini.style.bottom = "";
      textBlock.style.top = "";
    }
  }
  
  window.addEventListener("load", adjustLayoutForPlayer);
  window.addEventListener("resize", adjustLayoutForPlayer);

  /* -------------------------
     SPARKLE CURSOR CODE
  ------------------------- */

  var colour = "white";
  var sparkles = 120;

  var x = ox = 400;
  var y = oy = 300;
  var swide = 800;
  var shigh = 600;
  var sleft = sdown = 0;
  var tiny = [];
  var star = [];
  var starv = [];
  var starx = [];
  var stary = [];
  var tinyx = [];
  var tinyy = [];
  var tinyv = [];

  function createDiv(height, width) {
    var div = document.createElement("div");
    div.style.position = "absolute";
    div.style.height = height + "px";
    div.style.width = width + "px";
    div.style.overflow = "hidden";
    div.style.backgroundColor = colour;
    div.style.zIndex = 100000;
    div.style.pointerEvents = "none";
    return div;
  }

  function set_width() {
    if (typeof (self.innerWidth) == "number") {
      swide = self.innerWidth;
      shigh = self.innerHeight;
    }
    else if (document.documentElement && document.documentElement.clientWidth) {
      swide = document.documentElement.clientWidth;
      shigh = document.documentElement.clientHeight;
    }
    else if (document.body.clientWidth) {
      swide = document.body.clientWidth;
      shigh = document.body.clientHeight;
    }
  }

  function set_scroll() {
    if (typeof (self.pageYOffset) == "number") {
      sdown = self.pageYOffset;
      sleft = self.pageXOffset;
    }
    else if (document.body.scrollTop || document.body.scrollLeft) {
      sdown = document.body.scrollTop;
      sleft = document.body.scrollLeft;
    }
    else if (document.documentElement && (document.documentElement.scrollTop || document.documentElement.scrollLeft)) {
      sleft = document.documentElement.scrollLeft;
      sdown = document.documentElement.scrollTop;
    }
    else {
      sdown = 0;
      sleft = 0;
    }
  }

  function mouse(e) {
    set_scroll();
    y = (e) ? e.pageY : event.y + sdown;
    x = (e) ? e.pageX : event.x + sleft;
  }

  function sparkle() {
    var c;
    if (x != ox || y != oy) {
      ox = x;
      oy = y;
      for (c = 0; c < sparkles; c++) if (!starv[c]) {
        star[c].style.left = (starx[c] = x) + "px";
        star[c].style.top = (stary[c] = y) + "px";
        star[c].style.clip = "rect(0px, 5px, 5px, 0px)";
        star[c].style.visibility = "visible";
        starv[c] = 50;
        break;
      }
    }
    for (c = 0; c < sparkles; c++) {
      if (starv[c]) update_star(c);
      if (tinyv[c]) update_tiny(c);
    }
    setTimeout(sparkle, 40);
  }

  function update_star(i) {
    if (--starv[i] == 25) star[i].style.clip = "rect(1px, 4px, 4px, 1px)";
    if (starv[i]) {
      stary[i] += 1 + Math.random() * 3;
      if (stary[i] < shigh + sdown) {
        star[i].style.top = stary[i] + "px";
        starx[i] += (i % 5 - 2) / 5;
        star[i].style.left = starx[i] + "px";
      } else {
        star[i].style.visibility = "hidden";
        starv[i] = 0;
        return;
      }
    } else {
      tinyv[i] = 50;
      tiny[i].style.top = (tinyy[i] = stary[i]) + "px";
      tiny[i].style.left = (tinyx[i] = starx[i]) + "px";
      tiny[i].style.width = "2px";
      tiny[i].style.height = "2px";
      star[i].style.visibility = "hidden";
      tiny[i].style.visibility = "visible";
    }
  }

  function update_tiny(i) {
    if (--tinyv[i] == 25) {
      tiny[i].style.width = "1px";
      tiny[i].style.height = "1px";
    }
    if (tinyv[i]) {
      tinyy[i] += 1 + Math.random() * 3;
      if (tinyy[i] < shigh + sdown) {
        tiny[i].style.top = tinyy[i] + "px";
        tinyx[i] += (i % 5 - 2) / 5;
        tiny[i].style.left = tinyx[i] + "px";
      } else {
        tiny[i].style.visibility = "hidden";
        tinyv[i] = 0;
        return;
      }
    } else tiny[i].style.visibility = "hidden";
  }

  // INIT sparkle
  for (let i = 0; i < sparkles; i++) {
    let t = createDiv(3, 3);
    t.style.visibility = "hidden";
    document.body.appendChild(tiny[i] = t);
    starv[i] = 0;
    tinyv[i] = 0;

    let s = createDiv(5, 5);
    s.style.backgroundColor = "transparent";
    s.style.visibility = "hidden";

    let rlef = createDiv(1, 5);
    let rdow = createDiv(5, 1);

    s.appendChild(rlef);
    s.appendChild(rdow);

    rlef.style.top = "2px";
    rlef.style.left = "0px";
    rdow.style.top = "0px";
    rdow.style.left = "2px";

    document.body.appendChild(star[i] = s);
  }

  set_width();
  sparkle();

  document.onmousemove = mouse;
  window.onresize = set_width;

});


