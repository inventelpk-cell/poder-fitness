(function () {
  const RANKS = [{"id": "chispa", "orden": 1, "nombre": "Chispa", "display": "CHISPA", "fase": "tenue", "color": "#9FD4FF", "color2": "#EAF6FF", "linea": "Una chispa basta para empezar.", "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\" fill=\"none\" role=\"img\">\n  <title>Emblema Chispa</title><desc>Emblema del rango Chispa: una estrella pequeña y pálida, casi en calma.</desc>\n  <circle cx=\"32\" cy=\"32\" r=\"29.75\" fill=\"#10131A\"/>\n  <circle cx=\"32\" cy=\"32\" r=\"29.75\" stroke=\"#9FD4FF\" stroke-width=\"1.5\"/>\n  <circle cx=\"32\" cy=\"32\" r=\"25\" stroke=\"#9FD4FF\" stroke-opacity=\"0.24\"/>\n  <path d=\"M18.5 23.5a15.5 15.5 0 0 1 27 0\" stroke=\"#fff\" stroke-opacity=\"0.14\" stroke-linecap=\"round\"/>\n  <path fill=\"#EAF6FF\" d=\"M 32.00 23.50 L 33.48 30.52 L 40.50 32.00 L 33.48 33.48 L 32.00 40.50 L 30.52 33.48 L 23.50 32.00 L 30.52 30.52 Z\"/>\n  <path fill=\"#9FD4FF\" d=\"M 44.00 16.90 L 44.64 19.36 L 47.10 20.00 L 44.64 20.64 L 44.00 23.10 L 43.36 20.64 L 40.90 20.00 L 43.36 19.36 Z\"/>\n  <path fill=\"#9FD4FF\" opacity=\"0.75\" d=\"M 20.00 40.70 L 20.49 42.51 L 22.30 43.00 L 20.49 43.49 L 20.00 45.30 L 19.51 43.49 L 17.70 43.00 L 19.51 42.51 Z\"/>\n</svg>\n"}, {"id": "brasa", "orden": 2, "nombre": "Brasa", "display": "BRASA", "fase": "estable", "color": "#FF6A1A", "color2": "#FFB088", "linea": "El calor ya se sostiene solo.", "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\" fill=\"none\" role=\"img\">\n  <title>Emblema Brasa</title><desc>Emblema del rango Brasa: un diamante de brasa naranja con núcleo dorado.</desc>\n  <circle cx=\"32\" cy=\"32\" r=\"29.75\" fill=\"#10131A\"/>\n  <circle cx=\"32\" cy=\"32\" r=\"29.75\" stroke=\"#FF6A1A\" stroke-width=\"1.5\"/>\n  <circle cx=\"32\" cy=\"32\" r=\"25\" stroke=\"#FF6A1A\" stroke-opacity=\"0.24\"/>\n  <path d=\"M18.5 23.5a15.5 15.5 0 0 1 27 0\" stroke=\"#fff\" stroke-opacity=\"0.14\" stroke-linecap=\"round\"/>\n  <path fill=\"#FF6A1A\" d=\"M32.00 16.00 L48.00 32.00 L32.00 48.00 L16.00 32.00 Z\"/>\n  <path fill=\"#FFC53D\" d=\"M32.00 25.80 L38.20 32.00 L32.00 38.20 L25.80 32.00 Z\"/>\n  <circle cx=\"32\" cy=\"32\" r=\"1.7\" fill=\"#FFF6D8\"/>\n</svg>\n"}, {"id": "llama", "orden": 3, "nombre": "Llama", "display": "LLAMA", "fase": "ardiente", "color": "#FF4D00", "color2": "#FFC53D", "linea": "La llama responde a la constancia.", "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\" fill=\"none\" role=\"img\">\n  <title>Emblema Llama</title><desc>Emblema del rango Llama: una lengua de fuego naranja con corazón dorado.</desc>\n  <circle cx=\"32\" cy=\"32\" r=\"29.75\" fill=\"#10131A\"/>\n  <circle cx=\"32\" cy=\"32\" r=\"29.75\" stroke=\"#FF4D00\" stroke-width=\"1.5\"/>\n  <circle cx=\"32\" cy=\"32\" r=\"25\" stroke=\"#FF4D00\" stroke-opacity=\"0.24\"/>\n  <path d=\"M18.5 23.5a15.5 15.5 0 0 1 27 0\" stroke=\"#fff\" stroke-opacity=\"0.14\" stroke-linecap=\"round\"/>\n  <path fill=\"#FF4D00\" d=\"M32 15 C33.2 22 39.2 24.2 41.2 31.2 C43.5 39 38.6 45.2 35 48.6 C34 50 33.1 51.6 32 53.2 C30.9 51.6 30 50 29 48.6 C25.4 45.2 20.5 39 22.8 31.2 C24.8 24.2 30.8 22 32 15 Z\"/>\n  <path fill=\"#FFC53D\" d=\"M32 29 C32.6 32.6 35.6 33.8 36.6 37.4 C37.7 41.2 35.6 44.4 33.9 46.6 C33.3 47.6 32.7 48.5 32 49.4 C31.3 48.5 30.7 47.6 30.1 46.6 C28.4 44.4 26.3 41.2 27.4 37.4 C28.4 33.8 31.4 32.6 32 29 Z\"/>\n</svg>\n"}, {"id": "incendio", "orden": 4, "nombre": "Incendio", "display": "INCENDIO", "fase": "ardiente", "color": "#FF2D00", "color2": "#FFC53D", "linea": "El fuego ocupa el cuerpo entero.", "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\" fill=\"none\" role=\"img\">\n  <title>Emblema Incendio</title><desc>Emblema del rango Incendio: dos llamas abiertas y ascuas alrededor.</desc>\n  <circle cx=\"32\" cy=\"32\" r=\"29.75\" fill=\"#10131A\"/>\n  <circle cx=\"32\" cy=\"32\" r=\"29.75\" stroke=\"#FF2D00\" stroke-width=\"1.5\"/>\n  <circle cx=\"32\" cy=\"32\" r=\"25\" stroke=\"#FF2D00\" stroke-opacity=\"0.24\"/>\n  <path d=\"M18.5 23.5a15.5 15.5 0 0 1 27 0\" stroke=\"#fff\" stroke-opacity=\"0.14\" stroke-linecap=\"round\"/>\n  <g transform=\"translate(27 34) scale(0.78) translate(-32 -34)\">\n    <path fill=\"#FF2D00\" d=\"M32 15 C33.2 22 39.2 24.2 41.2 31.2 C43.5 39 38.6 45.2 35 48.6 C34 50 33.1 51.6 32 53.2 C30.9 51.6 30 50 29 48.6 C25.4 45.2 20.5 39 22.8 31.2 C24.8 24.2 30.8 22 32 15 Z\"/>\n    <path fill=\"#FFC53D\" d=\"M32 29 C32.6 32.6 35.6 33.8 36.6 37.4 C37.7 41.2 35.6 44.4 33.9 46.6 C33.3 47.6 32.7 48.5 32 49.4 C31.3 48.5 30.7 47.6 30.1 46.6 C28.4 44.4 26.3 41.2 27.4 37.4 C28.4 33.8 31.4 32.6 32 29 Z\"/>\n  </g>\n  <g transform=\"translate(43 28) scale(0.48) translate(-32 -34)\">\n    <path fill=\"#FF6A1A\" d=\"M32 15 C33.2 22 39.2 24.2 41.2 31.2 C43.5 39 38.6 45.2 35 48.6 C34 50 33.1 51.6 32 53.2 C30.9 51.6 30 50 29 48.6 C25.4 45.2 20.5 39 22.8 31.2 C24.8 24.2 30.8 22 32 15 Z\"/>\n  </g>\n  <circle cx=\"16\" cy=\"30\" r=\"1.7\" fill=\"#FFC53D\"/>\n  <circle cx=\"22\" cy=\"20\" r=\"1.15\" fill=\"#FF8A3D\"/>\n  <circle cx=\"48\" cy=\"44\" r=\"1.35\" fill=\"#FFC53D\"/>\n</svg>\n"}, {"id": "tormenta", "orden": 5, "nombre": "Tormenta", "display": "TORMENTA", "fase": "relampago", "color": "#7AA2FF", "color2": "#D6E4FF", "linea": "El aire cambia antes del trueno.", "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\" fill=\"none\" role=\"img\">\n  <title>Emblema Tormenta</title><desc>Emblema del rango Tormenta: tres arcos de viento alrededor de un núcleo.</desc>\n  <circle cx=\"32\" cy=\"32\" r=\"29.75\" fill=\"#10131A\"/>\n  <circle cx=\"32\" cy=\"32\" r=\"29.75\" stroke=\"#7AA2FF\" stroke-width=\"1.5\"/>\n  <circle cx=\"32\" cy=\"32\" r=\"25\" stroke=\"#7AA2FF\" stroke-opacity=\"0.24\"/>\n  <path d=\"M18.5 23.5a15.5 15.5 0 0 1 27 0\" stroke=\"#fff\" stroke-opacity=\"0.14\" stroke-linecap=\"round\"/>\n  <g stroke=\"#9EBEFF\" stroke-width=\"2.5\" stroke-linecap=\"round\" fill=\"none\">\n    <path d=\"M24.5 24.5a9 9 0 0 1 12-1\"/>\n    <path d=\"M18 36.5a15 15 0 0 1 24-8\"/>\n    <path d=\"M22 43a12 12 0 0 0 18 2\"/>\n  </g>\n  <circle cx=\"32\" cy=\"32\" r=\"2.5\" fill=\"#EAF1FF\"/>\n</svg>\n"}, {"id": "relampago", "orden": 6, "nombre": "Relámpago", "display": "RELÁMPAGO", "fase": "relampago", "color": "#5CE1FF", "color2": "#F3FCFF", "linea": "El instante se parte en dos.", "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\" fill=\"none\" role=\"img\">\n  <title>Emblema Relámpago</title><desc>Emblema del rango Relámpago: un rayo cian geométrico.</desc>\n  <circle cx=\"32\" cy=\"32\" r=\"29.75\" fill=\"#10131A\"/>\n  <circle cx=\"32\" cy=\"32\" r=\"29.75\" stroke=\"#5CE1FF\" stroke-width=\"1.5\"/>\n  <circle cx=\"32\" cy=\"32\" r=\"25\" stroke=\"#5CE1FF\" stroke-opacity=\"0.24\"/>\n  <path d=\"M18.5 23.5a15.5 15.5 0 0 1 27 0\" stroke=\"#fff\" stroke-opacity=\"0.14\" stroke-linecap=\"round\"/>\n  <path fill=\"url(#relampago-bolt)\" d=\"M37 12.5 L26 31 H33.2 L29 51.5 L46 28.5 H37.2 L41.2 12.5 Z\"/>\n  <defs>\n    <linearGradient id=\"relampago-bolt\" x1=\"26\" y1=\"51\" x2=\"46\" y2=\"12\" gradientUnits=\"userSpaceOnUse\">\n      <stop offset=\"0\" stop-color=\"#2EC8FF\"/>\n      <stop offset=\"1\" stop-color=\"#F3FCFF\"/>\n    </linearGradient>\n  </defs>\n</svg>\n"}, {"id": "nova", "orden": 7, "nombre": "Nova", "display": "NOVA", "fase": "relampago", "color": "#FFC53D", "color2": "#FFF6D8", "linea": "Un núcleo nuevo abre el paso.", "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\" fill=\"none\" role=\"img\">\n  <title>Emblema Nova</title><desc>Emblema del rango Nova: un estallido de ocho puntas doradas.</desc>\n  <circle cx=\"32\" cy=\"32\" r=\"29.75\" fill=\"#10131A\"/>\n  <circle cx=\"32\" cy=\"32\" r=\"29.75\" stroke=\"#FFC53D\" stroke-width=\"1.5\"/>\n  <circle cx=\"32\" cy=\"32\" r=\"25\" stroke=\"#FFC53D\" stroke-opacity=\"0.24\"/>\n  <path d=\"M18.5 23.5a15.5 15.5 0 0 1 27 0\" stroke=\"#fff\" stroke-opacity=\"0.14\" stroke-linecap=\"round\"/>\n  <path fill=\"#FFC53D\" d=\"M 32.00 15.50 L 34.37 26.27 L 43.67 20.33 L 37.73 29.63 L 48.50 32.00 L 37.73 34.37 L 43.67 43.67 L 34.37 37.73 L 32.00 48.50 L 29.63 37.73 L 20.33 43.67 L 26.27 34.37 L 15.50 32.00 L 26.27 29.63 L 20.33 20.33 L 29.63 26.27 Z\"/>\n  <circle cx=\"32\" cy=\"32\" r=\"3.6\" fill=\"#FFF6D8\"/>\n</svg>\n"}, {"id": "eclipse", "orden": 8, "nombre": "Eclipse", "display": "ECLIPSE", "fase": "soberana", "color": "#FFC53D", "color2": "#F4F1EA", "linea": "La luz se aprieta detrás del disco.", "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\" fill=\"none\" role=\"img\">\n  <title>Emblema Eclipse</title><desc>Emblema del rango Eclipse: un creciente dorado con corona de muescas.</desc>\n  <circle cx=\"32\" cy=\"32\" r=\"29.75\" fill=\"#10131A\"/>\n  <circle cx=\"32\" cy=\"32\" r=\"29.75\" stroke=\"#FFC53D\" stroke-width=\"1.5\"/>\n  <circle cx=\"32\" cy=\"32\" r=\"25\" stroke=\"#FFC53D\" stroke-opacity=\"0.24\"/>\n  <path d=\"M18.5 23.5a15.5 15.5 0 0 1 27 0\" stroke=\"#fff\" stroke-opacity=\"0.14\" stroke-linecap=\"round\"/>\n  <defs>\n    <mask id=\"eclipse-cut\" maskUnits=\"userSpaceOnUse\">\n      <rect width=\"64\" height=\"64\" fill=\"#fff\"/>\n      <circle cx=\"38.2\" cy=\"31.2\" r=\"11.2\" fill=\"#000\"/>\n    </mask>\n  </defs>\n  <circle cx=\"31\" cy=\"33\" r=\"13.2\" fill=\"#FFC53D\" mask=\"url(#eclipse-cut)\"/>\n  <line x1=\"32.00\" y1=\"11.80\" x2=\"32.00\" y2=\"8.60\" stroke=\"#FFC53D\" stroke-opacity=\"0.8\" stroke-width=\"1.5\" stroke-linecap=\"round\"/><line x1=\"42.10\" y1=\"14.51\" x2=\"43.70\" y2=\"11.74\" stroke=\"#FFC53D\" stroke-opacity=\"0.8\" stroke-width=\"1.5\" stroke-linecap=\"round\"/><line x1=\"49.49\" y1=\"21.90\" x2=\"52.26\" y2=\"20.30\" stroke=\"#FFC53D\" stroke-opacity=\"0.8\" stroke-width=\"1.5\" stroke-linecap=\"round\"/><line x1=\"52.20\" y1=\"32.00\" x2=\"55.40\" y2=\"32.00\" stroke=\"#FFC53D\" stroke-opacity=\"0.8\" stroke-width=\"1.5\" stroke-linecap=\"round\"/><line x1=\"49.49\" y1=\"42.10\" x2=\"52.26\" y2=\"43.70\" stroke=\"#FFC53D\" stroke-opacity=\"0.8\" stroke-width=\"1.5\" stroke-linecap=\"round\"/><line x1=\"42.10\" y1=\"49.49\" x2=\"43.70\" y2=\"52.26\" stroke=\"#FFC53D\" stroke-opacity=\"0.8\" stroke-width=\"1.5\" stroke-linecap=\"round\"/><line x1=\"32.00\" y1=\"52.20\" x2=\"32.00\" y2=\"55.40\" stroke=\"#FFC53D\" stroke-opacity=\"0.8\" stroke-width=\"1.5\" stroke-linecap=\"round\"/><line x1=\"21.90\" y1=\"49.49\" x2=\"20.30\" y2=\"52.26\" stroke=\"#FFC53D\" stroke-opacity=\"0.8\" stroke-width=\"1.5\" stroke-linecap=\"round\"/><line x1=\"14.51\" y1=\"42.10\" x2=\"11.74\" y2=\"43.70\" stroke=\"#FFC53D\" stroke-opacity=\"0.8\" stroke-width=\"1.5\" stroke-linecap=\"round\"/><line x1=\"11.80\" y1=\"32.00\" x2=\"8.60\" y2=\"32.00\" stroke=\"#FFC53D\" stroke-opacity=\"0.8\" stroke-width=\"1.5\" stroke-linecap=\"round\"/><line x1=\"14.51\" y1=\"21.90\" x2=\"11.74\" y2=\"20.30\" stroke=\"#FFC53D\" stroke-opacity=\"0.8\" stroke-width=\"1.5\" stroke-linecap=\"round\"/><line x1=\"21.90\" y1=\"14.51\" x2=\"20.30\" y2=\"11.74\" stroke=\"#FFC53D\" stroke-opacity=\"0.8\" stroke-width=\"1.5\" stroke-linecap=\"round\"/>\n</svg>\n"}, {"id": "mitico", "orden": 9, "nombre": "Mítico", "display": "MÍTICO", "fase": "soberana", "color": "#FFC53D", "color2": "#9EBEFF", "linea": "El aura ya tiene nombre.", "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\" fill=\"none\" role=\"img\">\n  <title>Emblema Mítico</title><desc>Emblema del rango Mítico: un hexágono partido en azul, oro y naranja.</desc>\n  <circle cx=\"32\" cy=\"32\" r=\"29.75\" fill=\"#10131A\"/>\n  <circle cx=\"32\" cy=\"32\" r=\"29.75\" stroke=\"#FFC53D\" stroke-width=\"1.5\"/>\n  <circle cx=\"32\" cy=\"32\" r=\"25\" stroke=\"#FFC53D\" stroke-opacity=\"0.24\"/>\n  <path d=\"M18.5 23.5a15.5 15.5 0 0 1 27 0\" stroke=\"#fff\" stroke-opacity=\"0.14\" stroke-linecap=\"round\"/>\n  <defs>\n    <linearGradient id=\"mitico-split\" x1=\"0\" y1=\"0.5\" x2=\"1\" y2=\"0.5\">\n      <stop offset=\"0\" stop-color=\"#3B82FF\"/>\n      <stop offset=\"0.5\" stop-color=\"#FFC53D\"/>\n      <stop offset=\"1\" stop-color=\"#FF6A1A\"/>\n    </linearGradient>\n  </defs>\n  <polygon points=\"32.00,17.00 44.99,24.50 44.99,39.50 32.00,47.00 19.01,39.50 19.01,24.50\" fill=\"none\" stroke=\"url(#mitico-split)\" stroke-width=\"2.4\" stroke-linejoin=\"round\"/>\n  <path fill=\"#FFC53D\" d=\"M 32.00 26.60 L 33.27 31.73 L 38.40 33.00 L 33.27 34.27 L 32.00 39.40 L 30.73 34.27 L 25.60 33.00 L 30.73 31.73 Z\"/>\n</svg>\n"}, {"id": "absoluto", "orden": 10, "nombre": "Absoluto", "display": "ABSOLUTO", "fase": "soberana", "color": "#FFF8E8", "color2": "#FFC53D", "linea": "Nada queda fuera del círculo.", "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\" fill=\"none\" role=\"img\">\n  <title>Emblema Absoluto</title><desc>Emblema del rango Absoluto: un halo dorado, estrella blanca y cuatro señales.</desc>\n  <circle cx=\"32\" cy=\"32\" r=\"29.75\" fill=\"#10131A\"/>\n  <circle cx=\"32\" cy=\"32\" r=\"29.75\" stroke=\"#FFF8E8\" stroke-width=\"1.5\"/>\n  <circle cx=\"32\" cy=\"32\" r=\"25\" stroke=\"#FFF8E8\" stroke-opacity=\"0.24\"/>\n  <path d=\"M18.5 23.5a15.5 15.5 0 0 1 27 0\" stroke=\"#fff\" stroke-opacity=\"0.14\" stroke-linecap=\"round\"/>\n  <circle cx=\"32\" cy=\"32\" r=\"18.2\" stroke=\"#FFC53D\" stroke-width=\"1.6\"/>\n  <path fill=\"#FFF8E8\" d=\"M 32.00 21.50 L 34.19 29.81 L 42.50 32.00 L 34.19 34.19 L 32.00 42.50 L 29.81 34.19 L 21.50 32.00 L 29.81 29.81 Z\"/>\n  <path fill=\"#FFC53D\" d=\"M32.00 11.20 L34.30 13.50 L32.00 15.80 L29.70 13.50 Z\"/><path fill=\"#FFC53D\" d=\"M50.50 29.70 L52.80 32.00 L50.50 34.30 L48.20 32.00 Z\"/><path fill=\"#FFC53D\" d=\"M32.00 48.20 L34.30 50.50 L32.00 52.80 L29.70 50.50 Z\"/><path fill=\"#FFC53D\" d=\"M13.50 29.70 L15.80 32.00 L13.50 34.30 L11.20 32.00 Z\"/>\n  <circle cx=\"32\" cy=\"32\" r=\"2\" fill=\"#FFC53D\"/>\n</svg>\n"}];
  const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

  function byId(id) {
    const rank = RANKS.find(function (item) { return item.id === id; });
    if (!rank) throw new Error("Rango desconocido: " + id);
    return rank;
  }

  function catalog() {
    return RANKS.map(function (rank) {
      return {
        id: rank.id,
        orden: rank.orden,
        nombre: rank.nombre,
        fase: rank.fase,
        color: rank.color,
        color2: rank.color2,
        linea: rank.linea
      };
    });
  }

  function iniciar(root, opciones) {
    opciones = opciones || {};
    const params = new URLSearchParams(window.location.search);
    const queryDesde = params.get("desde") || params.get("from");
    const queryHacia = params.get("hacia") || params.get("to");
    let desde = opciones.desde || queryDesde || "chispa";
    let hacia = opciones.hacia || queryHacia || "brasa";
    const bucle = opciones.bucle === true || params.get("bucle") === "1" || params.get("loop") === "1";
    const auto = opciones.auto !== false && params.get("autoplay") !== "0";
    const freeze = params.get("freeze") || params.get("poster");
    const controles = opciones.controles === true || params.get("controles") === "1" || params.get("controls") === "1";
    const reducido = opciones.reducido === true || params.get("motion") === "reduce" || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const onDone = opciones.alTerminar;

    const speed = root.querySelector(".speed");
    const aura = root.querySelector(".aura");
    const shock = root.querySelector(".shock");
    const sparks = root.querySelector(".sparks");
    const emblem = root.querySelector(".emblem");
    const nameEl = root.querySelector(".rank-name");
    const flavorEl = root.querySelector(".flavor");
    const kicker = root.querySelector(".kicker");
    const frame = root.querySelector(".frame");
    const flash = root.querySelector(".flash");
    const dock = root.querySelector(".dock");
    let token = 0;
    let playing = false;
    let breath = null;

    if (!sparks.childElementCount) {
      for (let index = 0; index < 10; index += 1) {
        const bit = document.createElement("i");
        bit.dataset.a = String(index * 36);
        sparks.appendChild(bit);
      }
    }

    function clearAnims() {
      if (breath) {
        breath.cancel();
        breath = null;
      }
      [root, speed, aura, shock, emblem, nameEl, flavorEl, frame, flash].forEach(function (el) {
        el.getAnimations().forEach(function (anim) { anim.cancel(); });
      });
      sparks.querySelectorAll("i").forEach(function (el) {
        el.getAnimations().forEach(function (anim) { anim.cancel(); });
      });
      frame.style.opacity = "0";
      flash.style.opacity = "0";
      speed.style.opacity = "0";
    }

    function apply(id, etiqueta) {
      const rank = byId(id);
      root.dataset.rank = rank.id;
      root.style.setProperty("--aura", rank.color);
      root.style.setProperty("--aura2", rank.color2);
      emblem.innerHTML = rank.svg;
      nameEl.textContent = rank.display;
      nameEl.setAttribute("aria-label", rank.nombre);
      flavorEl.textContent = rank.linea;
      if (etiqueta) kicker.textContent = etiqueta;
      return rank;
    }

    function wait(ms) {
      return new Promise(function (resolve) { window.setTimeout(resolve, ms); });
    }

    function done(fromId, toId) {
      const message = { type: "poder:transformacion-completa", desde: fromId, hacia: toId };
      if (typeof onDone === "function") onDone(message);
      if (window.parent && window.parent !== window) window.parent.postMessage(message, "*");
    }

    function holdBreath() {
      breath = aura.animate([
        { transform: "translate(-50%, -50%) scale(1)", opacity: 0.62 },
        { transform: "translate(-50%, -50%) scale(1.08)", opacity: 0.86 },
        { transform: "translate(-50%, -50%) scale(1)", opacity: 0.62 }
      ], { duration: 3400, iterations: Infinity, easing: "ease-in-out" });
    }

    async function reproducir(fromId, toId) {
      const mine = ++token;
      playing = true;
      clearAnims();
      apply(fromId, "Rango actual");
      if (reducido) {
        apply(toId, "Nuevo rango");
        playing = false;
        done(fromId, toId);
        return;
      }
      await wait(880);
      if (mine !== token) return;

      aura.animate([
        { transform: "translate(-50%, -50%) scale(1)", opacity: 0.7 },
        { transform: "translate(-50%, -50%) scale(0.7)", opacity: 0.95 }
      ], { duration: 460, easing: EASE, fill: "forwards" });
      emblem.animate([
        { transform: "scale(1)", filter: "brightness(1)" },
        { transform: "scale(0.84)", filter: "brightness(1.8)" }
      ], { duration: 460, easing: EASE, fill: "forwards" });
      await wait(420);
      if (mine !== token) return;

      speed.animate([
        { opacity: 0, transform: "scale(1.28) rotate(0deg)" },
        { opacity: 1, offset: 0.28 },
        { opacity: 0, transform: "scale(0.58) rotate(-18deg)" }
      ], { duration: 540, easing: "ease-out", fill: "forwards" });
      await wait(250);
      if (mine !== token) return;

      flash.animate([
        { opacity: 0 },
        { opacity: 0.92, offset: 0.16 },
        { opacity: 0 }
      ], { duration: 480, easing: "ease-out" });
      frame.animate([
        { opacity: 0, transform: "scale(1.06)" },
        { opacity: 1, transform: "scale(1)", offset: 0.32 },
        { opacity: 0.9, transform: "scale(1)" }
      ], { duration: 720, easing: EASE, fill: "forwards" });
      shock.animate([
        { opacity: 0.95, transform: "scale(0.3)" },
        { opacity: 0, transform: "scale(2.5)" }
      ], { duration: 700, easing: EASE });
      root.animate([
        { transform: "translate(0, 0)" },
        { transform: "translate(5px, -2px)", offset: 0.25 },
        { transform: "translate(-4px, 2px)", offset: 0.55 },
        { transform: "translate(0, 0)" }
      ], { duration: 260, easing: "linear" });
      sparks.querySelectorAll("i").forEach(function (el) {
        const angle = el.dataset.a;
        el.animate([
          { opacity: 1, transform: "rotate(" + angle + "deg) translateY(34px) scaleY(0.7)" },
          { opacity: 0, transform: "rotate(" + angle + "deg) translateY(96px) scaleY(1.15)" }
        ], { duration: 660, easing: EASE });
      });

      emblem.getAnimations().forEach(function (anim) { anim.cancel(); });
      aura.getAnimations().forEach(function (anim) { anim.cancel(); });
      apply(toId, "Nuevo rango");
      emblem.animate([
        { opacity: 0, transform: "scale(0.46)", filter: "brightness(2.8)" },
        { opacity: 1, transform: "scale(1.07)", filter: "brightness(1.25)", offset: 0.58 },
        { opacity: 1, transform: "scale(1)", filter: "brightness(1)" }
      ], { duration: 780, easing: EASE, fill: "forwards" });
      aura.animate([
        { transform: "translate(-50%, -50%) scale(0.62)", opacity: 0.35 },
        { transform: "translate(-50%, -50%) scale(1.16)", opacity: 0.9, offset: 0.48 },
        { transform: "translate(-50%, -50%) scale(1)", opacity: 0.68 }
      ], { duration: 820, easing: EASE, fill: "forwards" });
      nameEl.animate([
        { opacity: 0, transform: "translateY(18px)", letterSpacing: "0.2em" },
        { opacity: 1, transform: "translateY(0)", letterSpacing: "0.045em" }
      ], { duration: 540, easing: EASE, fill: "forwards" });
      flavorEl.animate([
        { opacity: 0, transform: "translateY(10px)" },
        { opacity: 1, transform: "translateY(0)" }
      ], { duration: 620, delay: 90, easing: EASE, fill: "forwards" });

      await wait(820);
      if (mine !== token) return;
      aura.getAnimations().forEach(function (anim) { anim.cancel(); });
      holdBreath();
      playing = false;
      done(fromId, toId);
      if (bucle) {
        await wait(1700);
        if (mine !== token) return;
        reproducir(fromId, toId);
      }
    }

    function poster(mode) {
      clearAnims();
      if (mode === "from" || mode === "desde") {
        apply(desde, "Rango actual");
        return;
      }
      apply(hacia, "Nuevo rango");
      if (mode === "impact" || mode === "impacto") {
        flash.style.opacity = "0.55";
        frame.style.opacity = "1";
        shock.style.opacity = "0.45";
        return;
      }
      frame.style.opacity = "0.9";
      holdBreath();
    }

    function onClick() {
      if (!playing) reproducir(desde, hacia);
    }

    function onKey(event) {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      onClick();
    }

    root.addEventListener("click", onClick);
    window.addEventListener("keydown", onKey);

    if (dock && controles) {
      dock.hidden = false;
      const fromSel = dock.querySelector("#fromSel");
      const toSel = dock.querySelector("#toSel");
      RANKS.forEach(function (rank) {
        fromSel.add(new Option(rank.nombre, rank.id));
        toSel.add(new Option(rank.nombre, rank.id));
      });
      fromSel.value = desde;
      toSel.value = hacia;
      fromSel.addEventListener("change", function () { desde = fromSel.value; });
      toSel.addEventListener("change", function () { hacia = toSel.value; });
      dock.querySelector("#replay").addEventListener("click", function (event) {
        event.stopPropagation();
        reproducir(desde, hacia);
      });
      dock.addEventListener("click", function (event) { event.stopPropagation(); });
    }

    if (freeze) poster(freeze);
    else if (auto) reproducir(desde, hacia);
    else apply(desde, "Rango actual");

    return {
      reproducir: reproducir,
      mostrar: apply,
      destruir: function () {
        token += 1;
        clearAnims();
        root.removeEventListener("click", onClick);
        window.removeEventListener("keydown", onKey);
      }
    };
  }

  window.PoderTransformacion = {
    rangos: catalog(),
    iniciar: iniciar
  };

  const root = document.getElementById("root");
  if (root && root.classList.contains("pf-transform")) {
    const api = iniciar(root);
    window.PoderTransformacion.reproducir = function (desde, hacia) { return api.reproducir(desde, hacia); };
    window.PoderTransformacion.mostrar = api.mostrar;
    window.PoderTransformacion.destruir = api.destruir;
  }
})();
