(function () {
  var RANGOS = {
    chispa: { nombre: "CHISPA", frase: "Una chispa basta para empezar.", color: "#9FD4FF" },
    brasa: { nombre: "BRASA", frase: "El calor ya se sostiene solo.", color: "#FF6A1A" },
    llama: { nombre: "LLAMA", frase: "La llama responde a la constancia.", color: "#FF4D00" },
    incendio: { nombre: "INCENDIO", frase: "El fuego ocupa el cuerpo entero.", color: "#FF2D00" },
    tormenta: { nombre: "TORMENTA", frase: "El aire cambia antes del trueno.", color: "#7AA2FF" },
    relampago: { nombre: "RELÁMPAGO", frase: "El instante se parte en dos.", color: "#5CE1FF" },
    nova: { nombre: "NOVA", frase: "Un núcleo nuevo abre el paso.", color: "#FFC53D" },
    eclipse: { nombre: "ECLIPSE", frase: "La luz se aprieta detrás del disco.", color: "#FFC53D" },
    mitico: { nombre: "MÍTICO", frase: "El aura ya tiene nombre.", color: "#FFC53D" },
    absoluto: { nombre: "ABSOLUTO", frase: "Nada queda fuera del círculo.", color: "#FFF8E8" }
  };

  var ALT = {
    chispa: "Emblema del rango Chispa: estrella pequeña, un corte en el anillo y aura cian pálida.",
    brasa: "Emblema del rango Brasa: diamante de fuego, doble corte y aura naranja.",
    llama: "Emblema del rango Llama: una llama, esquinas de marco y aura naranja intensa.",
    incendio: "Emblema del rango Incendio: dos llamas, esquinas, brillo y aura roja.",
    tormenta: "Emblema del rango Tormenta: tres arcos de viento, arco exterior y aura azul.",
    relampago: "Emblema del rango Relámpago: un rayo, arco, chispa y aura cian.",
    nova: "Emblema del rango Nova: estrella de ocho puntas y doble borde dorado.",
    eclipse: "Emblema del rango Eclipse: creciente, disco y corona dorada.",
    mitico: "Emblema del rango Mítico: hexágono partido, doble anillo, oro y azul.",
    absoluto: "Emblema del rango Absoluto: halo, estrella blanca y rayos de oro."
  };

  var BEATS = ["origen", "oscuro", "carga", "rayos", "flash", "golpe", "nombre", "particulas", "hold"];
  var CUANDO = [0, 420, 700, 1200, 1700, 1900, 2200, 2500, 3100];

  var escena = document.getElementById("escena");
  var emblema = document.getElementById("emblema");
  var nombre = document.getElementById("nombre");
  var frase = document.getElementById("frase");
  var timers = [];
  var ocupado = false;
  var avisoDado = false;
  var audioCtx = null;

  function leer() {
    var q = new URLSearchParams(location.search);
    var demo = q.get("demo") === "1";
    var desde = (demo ? "chispa" : (q.get("desde") || q.get("from") || "chispa")).toLowerCase();
    var hacia = (demo ? "brasa" : (q.get("hacia") || q.get("to") || "brasa")).toLowerCase();
    if (!RANGOS[desde]) desde = "chispa";
    if (!RANGOS[hacia]) hacia = "brasa";
    var reduce = q.get("motion") === "reduce" || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var bucle = q.get("bucle") === "1" || q.get("loop") === "1";
    var auto = q.get("autoplay") !== "0";
    return { desde: desde, hacia: hacia, reduce: reduce, bucle: bucle, auto: auto };
  }

  var cfg = leer();

  function pintar(id) {
    var rango = RANGOS[id];
    emblema.src = "../emblemas/" + id + ".svg";
    emblema.alt = ALT[id];
    nombre.textContent = rango.nombre;
    frase.textContent = rango.frase;
    escena.style.setProperty("--pf-aura", rango.color);
  }

  function limpiar() {
    timers.forEach(clearTimeout);
    timers = [];
    BEATS.forEach(function (b) { escena.classList.remove("fase-" + b); });
  }

  function audio() {
    var Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    if (!audioCtx) audioCtx = new Ctx();
    if (audioCtx.state === "suspended") audioCtx.resume();
    return audioCtx;
  }

  function tono(tipo, f0, f1, cuando, dur, vol) {
    var ctx = audio();
    if (!ctx) return;
    var t0 = ctx.currentTime + cuando;
    var osc = ctx.createOscillator();
    var g = ctx.createGain();
    osc.type = tipo;
    osc.frequency.setValueAtTime(f0, t0);
    osc.frequency.exponentialRampToValueAtTime(Math.max(40, f1), t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.03);
  }

  function avisar() {
    if (avisoDado) return;
    avisoDado = true;
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: "poder:transformacion-completa",
        desde: cfg.desde,
        hacia: cfg.hacia
      }, "*");
    }
  }

  function quieto() {
    limpiar();
    escena.classList.add("is-reducido", "fase-hold");
    pintar(cfg.hacia);
    ocupado = false;
    avisar();
  }

  function sostener() {
    limpiar();
    escena.classList.add("fase-hold", "fase-golpe", "fase-nombre", "fase-particulas");
    pintar(cfg.hacia);
    ocupado = false;
    avisar();
    if (cfg.bucle && !cfg.reduce) {
      timers.push(setTimeout(reproducir, 1500));
    }
  }

  function precargar(id) {
    var img = new Image();
    img.src = "../emblemas/" + id + ".svg";
  }

  function reproducir() {
    cfg = leer();
    avisoDado = false;
    if (cfg.reduce) {
      quieto();
      return;
    }
    limpiar();
    ocupado = true;
    precargar(cfg.desde);
    precargar(cfg.hacia);
    pintar(cfg.desde);
    escena.classList.add("fase-origen");
    CUANDO.forEach(function (ms, i) {
      timers.push(setTimeout(function () {
        escena.classList.add("fase-" + BEATS[i]);
        if (BEATS[i] === "golpe") pintar(cfg.hacia);
        if (BEATS[i] === "hold") {
          ocupado = false;
          avisar();
          if (cfg.bucle) timers.push(setTimeout(reproducir, 1500));
        }
      }, ms));
    });
    tono("sawtooth", 90, 380, 0.7, 0.5, 0.05);
    tono("square", 196, 62, 1.9, 0.18, 0.09);
    tono("sine", 740, 320, 2.05, 0.12, 0.04);
  }

  function alToque(evento) {
    if (evento.type === "keydown" && evento.key !== "Enter" && evento.key !== " ") return;
    if (evento.key === " ") evento.preventDefault();
    audio();
    if (ocupado) {
      sostener();
      return;
    }
    reproducir();
  }

  escena.addEventListener("click", alToque);
  window.addEventListener("keydown", alToque);

  if (cfg.auto) reproducir();
  else pintar(cfg.desde);
})();
