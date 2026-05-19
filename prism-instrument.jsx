/* =====================================================
   PRISM · Module 04 · Lighting
   Department I — WorldConstruction
   BSQM Genesis Package · bsqm-modules-001
   16 Standard Components · 4 Layers

   Layer I   — Rendering : RSE · SHD · PST · LUT
   Layer II  — Lighting  : SKL · AMB · PNT · VOL
   Layer III — Shadow    : CST · OCC · REF · CAS
   Layer IV  — DMX       : CHN · FIX · SCN · OSC

   IN  : WeatherState(ecological/Environment) ·
         SurfaceDefinition(visual/Architect) ·
         NarrativeMood(narrative/Story) ·
         ChunkData(spatial/Terrain)
   OUT : LightingRig(visual/→*) ·
         AtmosphereState(visual/→Sound) ·
         RenderFrame(visual/→Network) ·
         DMXPacket(control/→Network)
   ===================================================== */

const { useState: usePrS, useEffect: usePrE, useRef: usePrR } = React;

const PRISM_COLOR = "var(--ch04-prism)";
const PRISM_HEX   = "#e0d8ff";
const PRISM_RGB   = "224,216,255";

/* =====================================================
   RENDER PASS VISUALIZER — multi-pass pipeline (RSE / SHD)
   ===================================================== */
function RenderPassViz({ width = 340, height = 110 }) {
  const ref = usePrR(null);
  const dataRef = usePrR(null);

  usePrE(() => {
    const W = width * 2, H = height * 2;
    // Render pass layers: name, base color
    const passes = [
      { name: "DEPTH",   color: [80, 120, 180],  data: null },
      { name: "NORMAL",  color: [120, 200, 160],  data: null },
      { name: "ALBEDO",  color: [180, 140, 100],  data: null },
      { name: "SPECULAR",color: [220, 210, 255],  data: null },
      { name: "SHADOW",  color: [40,  40,  80],   data: null },
    ];
    // Generate noisy height data for each pass
    passes.forEach(p => {
      p.data = Array.from({ length: 60 }, (_, i) => {
        const base = 0.3 + Math.sin(i * 0.18) * 0.3 + Math.sin(i * 0.43) * 0.2;
        return Math.max(0.05, Math.min(1, base + (Math.random() - 0.5) * 0.15));
      });
    });
    dataRef.current = { passes, scanLine: 0 };
  }, []);

  useFrame((t) => {
    const c = ref.current; if (!c) return;
    const d = dataRef.current; if (!d) return;
    const ctx = c.getContext("2d");
    const W = c.width, H = c.height;
    ctx.clearRect(0, 0, W, H);

    ctx.fillStyle = "#050810";
    ctx.fillRect(0, 0, W, H);

    const { passes } = d;
    const passH = (H - 20) / passes.length;
    const passW = W - 100;

    passes.forEach((p, pi) => {
      const y0 = 10 + pi * passH;
      // Pass label
      ctx.fillStyle = `rgba(${PRISM_RGB},0.35)`;
      ctx.font = `${10}px 'JetBrains Mono'`;
      ctx.textAlign = "right";
      ctx.fillText(p.name, 90, y0 + passH * 0.62);

      // Pass lane background
      ctx.fillStyle = `rgba(${p.color.join(",")},0.05)`;
      ctx.fillRect(96, y0 + 2, passW, passH - 4);

      // Waveform bars
      const barW = passW / p.data.length;
      p.data.forEach((v, i) => {
        // Animate: bars shift slightly over time
        const phase = t * (0.3 + pi * 0.07) + i * 0.15;
        const animated = v * (0.85 + Math.sin(phase) * 0.15);
        const h = animated * (passH - 6);
        const alpha = 0.35 + animated * 0.55;
        ctx.fillStyle = `rgba(${p.color.join(",")},${alpha})`;
        ctx.fillRect(96 + i * barW, y0 + passH - 3 - h, barW - 1, h);
      });

      // Active pass highlight scan
      const activePass = Math.floor((t * 0.4) % passes.length);
      if (pi === activePass) {
        ctx.strokeStyle = `rgba(${PRISM_RGB},0.5)`;
        ctx.lineWidth = 1;
        ctx.strokeRect(96, y0 + 2, passW, passH - 4);
        ctx.fillStyle = `rgba(${p.color.join(",")},0.12)`;
        ctx.fillRect(96, y0 + 2, passW, passH - 4);
      }

      // Divider
      ctx.strokeStyle = "rgba(255,255,255,0.04)";
      ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(96, y0 + passH); ctx.lineTo(W, y0 + passH); ctx.stroke();
    });

    ctx.textAlign = "left";

    // Vertical scanline
    const scanX = 96 + ((t * 60) % passW);
    ctx.strokeStyle = `rgba(${PRISM_RGB},0.3)`;
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(scanX, 10); ctx.lineTo(scanX, H - 10); ctx.stroke();

    // Title
    ctx.fillStyle = `rgba(${PRISM_RGB},0.2)`;
    ctx.font = "9px 'JetBrains Mono'";
    ctx.fillText("RENDER PASSES", W - 120, 8);
  }, []);

  return (
    <div className="viz mat-screen" style={{ width, height, flexShrink: 0 }}>
      <canvas ref={ref} width={width * 2} height={height * 2}
              style={{ width: "100%", height: "100%" }} />
      <div className="viz-label engrave">RENDER PIPELINE · PASS STACK</div>
    </div>
  );
}

/* =====================================================
   LIGHT FIELD VISUALIZER — radiosity / cone spread (SKL / PNT)
   ===================================================== */
function LightFieldViz({ width = 260, height = 200 }) {
  const ref = usePrR(null);
  const dataRef = usePrR(null);

  usePrE(() => {
    const W = width * 2, H = height * 2;
    dataRef.current = {
      lights: [
        { x: W * 0.5,  y: H * 0.12, type: "sun",   intensity: 1.0,  angle: -0.5, spread: 0.6, color: [255, 240, 200] },
        { x: W * 0.15, y: H * 0.3,  type: "point",  intensity: 0.65, angle: 0,   spread: Math.PI * 2, color: [200, 180, 255] },
        { x: W * 0.82, y: H * 0.4,  type: "point",  intensity: 0.55, angle: 0,   spread: Math.PI * 2, color: [180, 230, 255] },
        { x: W * 0.35, y: H * 0.75, type: "spot",   intensity: 0.8,  angle: 1.2, spread: 0.4, color: [255, 200, 100] },
        { x: W * 0.7,  y: H * 0.8,  type: "spot",   intensity: 0.7,  angle: 1.8, spread: 0.4, color: [150, 255, 200] },
      ],
      // Floor tiles
      tiles: Array.from({ length: 12 * 10 }, (_, i) => ({
        col: i % 12, row: Math.floor(i / 12),
        base: 0.02 + Math.random() * 0.04,
      })),
    };
  }, []);

  useFrame((t) => {
    const c = ref.current; if (!c) return;
    const d = dataRef.current; if (!d) return;
    const ctx = c.getContext("2d");
    const W = c.width, H = c.height;
    ctx.clearRect(0, 0, W, H);

    ctx.fillStyle = "#030509";
    ctx.fillRect(0, 0, W, H);

    const { lights } = d;

    // Animated sun position
    const sunAngle = t * 0.05;
    lights[0].x = W * 0.5 + Math.cos(sunAngle) * W * 0.3;
    lights[0].y = H * 0.1 + Math.abs(Math.sin(sunAngle)) * H * 0.15;

    // Floor grid
    const tileW = W / 12, tileH = (H * 0.55) / 10;
    d.tiles.forEach(tile => {
      const tx = tile.col * tileW;
      const ty = H * 0.42 + tile.row * tileH;
      const tileCx = tx + tileW / 2, tileCy = ty + tileH / 2;

      let illumination = tile.base;
      lights.forEach(l => {
        const pulse = 1 + Math.sin(t * (0.3 + l.intensity) + l.x * 0.01) * 0.12;
        const dist = Math.hypot(tileCx - l.x, tileCy - l.y);
        const reach = W * (0.5 + l.intensity * 0.5) * pulse;
        const falloff = Math.max(0, 1 - dist / reach);
        illumination += falloff * l.intensity * 0.8;
      });
      illumination = Math.min(1, illumination);
      ctx.fillStyle = `rgba(${PRISM_RGB},${illumination * 0.25})`;
      ctx.fillRect(tx + 0.5, ty + 0.5, tileW - 1, tileH - 1);
    });

    // Floor grid lines
    ctx.strokeStyle = `rgba(${PRISM_RGB},0.06)`;
    ctx.lineWidth = 0.5;
    for (let col = 0; col <= 12; col++) {
      ctx.beginPath(); ctx.moveTo(col * tileW, H * 0.42); ctx.lineTo(col * tileW, H); ctx.stroke();
    }
    for (let row = 0; row <= 10; row++) {
      const ty = H * 0.42 + row * tileH;
      ctx.beginPath(); ctx.moveTo(0, ty); ctx.lineTo(W, ty); ctx.stroke();
    }

    // Light cones
    lights.forEach(l => {
      const pulse = 1 + Math.sin(t * (0.4 + l.intensity) + l.x * 0.01) * 0.1;
      const [lr, lg, lb] = l.color;

      if (l.type === "point") {
        const grad = ctx.createRadialGradient(l.x, l.y, 0, l.x, l.y, W * 0.35 * l.intensity * pulse);
        grad.addColorStop(0, `rgba(${lr},${lg},${lb},${0.25 * pulse})`);
        grad.addColorStop(0.4, `rgba(${lr},${lg},${lb},${0.07 * pulse})`);
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(l.x, l.y, W * 0.35 * l.intensity * pulse, 0, Math.PI * 2); ctx.fill();
      } else if (l.type === "spot" || l.type === "sun") {
        const reach = H * 0.7 * l.intensity * pulse;
        const half = l.spread / 2;
        ctx.save();
        ctx.globalAlpha = 0.18 * pulse;
        const grad = ctx.createConicalGradient
          ? ctx.createConicalGradient(l.x, l.y, l.angle - half, l.angle + half)
          : null;
        // Fallback triangle cone
        const cx1 = l.x + Math.cos(l.angle - half) * reach;
        const cy1 = l.y + Math.sin(l.angle - half) * reach;
        const cx2 = l.x + Math.cos(l.angle + half) * reach;
        const cy2 = l.y + Math.sin(l.angle + half) * reach;
        const coneGrad = ctx.createLinearGradient(l.x, l.y, l.x, l.y + reach);
        coneGrad.addColorStop(0, `rgba(${lr},${lg},${lb},0.35)`);
        coneGrad.addColorStop(1, `rgba(${lr},${lg},${lb},0)`);
        ctx.fillStyle = coneGrad;
        ctx.beginPath();
        ctx.moveTo(l.x, l.y);
        ctx.lineTo(cx1, cy1);
        ctx.quadraticCurveTo(
          l.x + Math.cos(l.angle) * reach * 1.1,
          l.y + Math.sin(l.angle) * reach * 1.1,
          cx2, cy2
        );
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      // Light source dot
      ctx.beginPath();
      ctx.arc(l.x, l.y, 4 + l.intensity * 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${lr},${lg},${lb},0.9)`;
      ctx.shadowColor = `rgba(${lr},${lg},${lb},0.8)`;
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Label
      ctx.fillStyle = `rgba(${PRISM_RGB},0.4)`;
      ctx.font = "8px 'JetBrains Mono'";
      ctx.textAlign = "center";
      ctx.fillText(l.type.toUpperCase(), l.x, l.y - 10);
    });
    ctx.textAlign = "left";
  }, []);

  return (
    <div className="viz mat-screen" style={{ width, height, flexShrink: 0 }}>
      <canvas ref={ref} width={width * 2} height={height * 2}
              style={{ width: "100%", height: "100%" }} />
      <div className="viz-label engrave">LIGHT FIELD · RADIOSITY MAP</div>
    </div>
  );
}

/* =====================================================
   SPECTRUM PRISM VISUALIZER — wavelength refraction (LUT / PST)
   ===================================================== */
function SpectrumPrismViz({ width = 380, height = 90 }) {
  const ref = usePrR(null);

  useFrame((t) => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d");
    const W = c.width, H = c.height;
    ctx.clearRect(0, 0, W, H);

    ctx.fillStyle = "#030409";
    ctx.fillRect(0, 0, W, H);

    // Prism triangle
    const px = W * 0.12, py = H * 0.75;
    const pSize = H * 0.55;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px + pSize, py);
    ctx.lineTo(px + pSize / 2, py - pSize * 0.87);
    ctx.closePath();
    ctx.strokeStyle = `rgba(${PRISM_RGB},0.4)`;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = `rgba(${PRISM_RGB},0.04)`;
    ctx.fill();

    // Incident ray
    const rayEntry = { x: px + pSize * 0.22, y: py - pSize * 0.38 };
    ctx.strokeStyle = `rgba(${PRISM_RGB},0.6)`;
    ctx.lineWidth = 1.5;
    ctx.shadowColor = `rgba(${PRISM_RGB},0.4)`;
    ctx.shadowBlur = 4;
    ctx.beginPath();
    ctx.moveTo(px - pSize * 0.4, py - pSize * 0.38);
    ctx.lineTo(rayEntry.x, rayEntry.y);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Refracted spectrum rays
    const specColors = [
      [148,  0, 211], // violet
      [ 75,  0, 130], // indigo
      [  0,  0, 255], // blue
      [  0, 128,   0], // green
      [255, 255,   0], // yellow
      [255, 165,   0], // orange
      [255,   0,   0], // red
    ];
    const exitX = px + pSize * 0.72;
    const exitY = py - pSize * 0.22;
    const fanStart = -0.15;
    const fanEnd   =  0.45;
    specColors.forEach((col, i) => {
      const angle = fanStart + (fanEnd - fanStart) * (i / (specColors.length - 1));
      const rayLen = W * 0.55;
      const ex = exitX + Math.cos(angle) * rayLen;
      const ey = exitY + Math.sin(angle) * rayLen;
      const [r, g, b] = col;
      const pulse = 0.6 + Math.sin(t * 0.8 + i * 0.5) * 0.3;
      ctx.strokeStyle = `rgba(${r},${g},${b},${0.65 * pulse})`;
      ctx.lineWidth = 1.5;
      ctx.shadowColor = `rgba(${r},${g},${b},0.5)`;
      ctx.shadowBlur = 5;
      ctx.beginPath();
      ctx.moveTo(exitX, exitY);
      ctx.lineTo(ex, ey);
      ctx.stroke();
      ctx.shadowBlur = 0;
    });

    // DMX channel bars along bottom
    const barZone = { x: W * 0.48, y: H * 0.55, w: W * 0.5, h: H * 0.38 };
    const numCh = 16;
    const bw = barZone.w / numCh;
    for (let i = 0; i < numCh; i++) {
      const phase = t * (0.5 + i * 0.07) + i * 0.4;
      const v = 0.2 + Math.abs(Math.sin(phase)) * 0.7;
      const bh = v * barZone.h;
      const fi = i / (numCh - 1);
      const r = Math.round(148 + (255 - 148) * fi);
      const g = Math.round(fi < 0.5 ? fi * 256 : 256 - (fi - 0.5) * 512);
      const b = Math.round(211 * (1 - fi));
      ctx.fillStyle = `rgba(${r},${g},${b},${0.6 + v * 0.3})`;
      ctx.fillRect(
        barZone.x + i * bw + 1,
        barZone.y + barZone.h - bh,
        bw - 2,
        bh
      );
      if (i % 4 === 0) {
        ctx.fillStyle = `rgba(${PRISM_RGB},0.25)`;
        ctx.font = "8px 'JetBrains Mono'";
        ctx.textAlign = "center";
        ctx.fillText(`${i + 1}`, barZone.x + i * bw + bw / 2, barZone.y + barZone.h + 10);
      }
    }
    ctx.textAlign = "left";

    // Labels
    ctx.fillStyle = `rgba(${PRISM_RGB},0.25)`;
    ctx.font = "8px 'JetBrains Mono'";
    ctx.fillText("DMX 1-16", barZone.x, barZone.y - 4);
  }, []);

  return (
    <div className="viz mat-screen" style={{ width, height, flexShrink: 0 }}>
      <canvas ref={ref} width={width * 2} height={height * 2}
              style={{ width: "100%", height: "100%" }} />
      <div className="viz-label engrave">SPECTRUM PRISM · WAVELENGTH + DMX</div>
    </div>
  );
}

/* =====================================================
   SHADOW MAP VISUALIZER — projection / sun arc (CST / OCC)
   ===================================================== */
function ShadowMapViz({ width = 300, height = 90 }) {
  const ref = usePrR(null);
  const dataRef = usePrR(null);

  usePrE(() => {
    const W = width * 2, H = height * 2;
    // Occluder objects on floor
    dataRef.current = {
      occluders: [
        { x: W * 0.28, y: H * 0.55, w: 28, h: 14, height: 60 },
        { x: W * 0.48, y: H * 0.5,  w: 18, h: 18, height: 90 },
        { x: W * 0.65, y: H * 0.58, w: 38, h: 12, height: 45 },
        { x: W * 0.18, y: H * 0.6,  w: 14, h: 22, height: 70 },
      ],
    };
  }, []);

  useFrame((t) => {
    const c = ref.current; if (!c) return;
    const d = dataRef.current; if (!d) return;
    const ctx = c.getContext("2d");
    const W = c.width, H = c.height;
    ctx.clearRect(0, 0, W, H);

    ctx.fillStyle = "#040508";
    ctx.fillRect(0, 0, W, H);

    // Ground plane
    const groundGrad = ctx.createLinearGradient(0, H * 0.4, 0, H);
    groundGrad.addColorStop(0, "rgba(20,18,30,0.8)");
    groundGrad.addColorStop(1, "rgba(10,8,16,0.4)");
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, H * 0.4, W, H * 0.6);

    // Sun arc
    const arcCx = W * 0.5, arcRx = W * 0.42, arcRy = H * 0.28;
    ctx.strokeStyle = `rgba(${PRISM_RGB},0.08)`;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 8]);
    ctx.beginPath();
    ctx.ellipse(arcCx, H * 0.85, arcRx, arcRy, 0, Math.PI, 0);
    ctx.stroke();
    ctx.setLineDash([]);

    // Sun position
    const sunT = (t * 0.06) % 1;
    const sunAngle = Math.PI - sunT * Math.PI;
    const sunX = arcCx + Math.cos(sunAngle) * arcRx;
    const sunY = H * 0.85 - Math.sin(sunAngle) * arcRy;

    // Sun glow
    const sunGrad = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 30);
    sunGrad.addColorStop(0, "rgba(255,240,180,0.9)");
    sunGrad.addColorStop(0.3, "rgba(255,210,100,0.4)");
    sunGrad.addColorStop(1, "transparent");
    ctx.fillStyle = sunGrad;
    ctx.beginPath(); ctx.arc(sunX, sunY, 30, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(sunX, sunY, 5, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,245,200,1)";
    ctx.shadowColor = "rgba(255,230,120,0.8)";
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Cast shadows from occluders
    const { occluders } = d;
    occluders.forEach(obj => {
      const objCx = obj.x, objCy = obj.y;
      const dx = objCx - sunX, dy = objCy - sunY;
      const dist = Math.hypot(dx, dy);
      const nx = dx / dist, ny = dy / dist;
      const shadowLen = obj.height * 1.8 * Math.max(0.2, Math.abs(Math.cos(sunAngle)));

      const sx1 = objCx - obj.w / 2;
      const sx2 = objCx + obj.w / 2;
      const shadowGrad = ctx.createLinearGradient(
        objCx, objCy,
        objCx + nx * shadowLen, objCy + ny * shadowLen
      );
      shadowGrad.addColorStop(0, "rgba(0,0,8,0.55)");
      shadowGrad.addColorStop(1, "rgba(0,0,8,0)");
      ctx.fillStyle = shadowGrad;
      ctx.beginPath();
      ctx.moveTo(sx1, objCy);
      ctx.lineTo(sx2, objCy);
      ctx.lineTo(objCx + obj.w / 2 + nx * shadowLen * 1.3, objCy + ny * shadowLen);
      ctx.lineTo(objCx - obj.w / 2 + nx * shadowLen * 1.3, objCy + ny * shadowLen);
      ctx.closePath();
      ctx.fill();

      // Occluder block
      ctx.fillStyle = `rgba(50,48,70,0.8)`;
      ctx.fillRect(objCx - obj.w / 2, objCy - obj.h / 2, obj.w, obj.h);
      ctx.strokeStyle = `rgba(${PRISM_RGB},0.2)`;
      ctx.lineWidth = 0.8;
      ctx.strokeRect(objCx - obj.w / 2, objCy - obj.h / 2, obj.w, obj.h);
    });

    // Time of day label
    const hour = Math.round(6 + sunT * 12);
    ctx.fillStyle = `rgba(${PRISM_RGB},0.3)`;
    ctx.font = "9px 'JetBrains Mono'";
    ctx.fillText(`${hour < 10 ? "0" : ""}${hour}:00`, W - 50, 14);
  }, []);

  return (
    <div className="viz mat-screen" style={{ width, height, flexShrink: 0 }}>
      <canvas ref={ref} width={width * 2} height={height * 2}
              style={{ width: "100%", height: "100%" }} />
      <div className="viz-label engrave">SHADOW MAP · SUN ARC + PROJECTION</div>
    </div>
  );
}

/* =====================================================
   DMX GRID VISUALIZER — fixture patch (CHN / FIX / SCN)
   ===================================================== */
function DMXGridViz({ width = 360, height = 80 }) {
  const ref = usePrR(null);
  const dataRef = usePrR(null);

  usePrE(() => {
    const fixtures = Array.from({ length: 16 }, (_, i) => ({
      id: i + 1,
      label: ["KEY", "FILL", "RIM", "AMB", "SPOT1", "SPOT2",
              "WASH1", "WASH2", "PAR1", "PAR2", "STROBE",
              "FOG", "GOBO1", "GOBO2", "CHASE", "MASTER"][i],
      channel: (i * 3) + 1,
      active: Math.random() > 0.35,
      intensity: 0.3 + Math.random() * 0.7,
      phase: Math.random() * Math.PI * 2,
      type: i < 4 ? "key" : i < 8 ? "wash" : i < 12 ? "spot" : "fx",
    }));
    dataRef.current = { fixtures };
  }, []);

  useFrame((t) => {
    const c = ref.current; if (!c) return;
    const d = dataRef.current; if (!d) return;
    const ctx = c.getContext("2d");
    const W = c.width, H = c.height;
    ctx.clearRect(0, 0, W, H);

    ctx.fillStyle = "#040308";
    ctx.fillRect(0, 0, W, H);

    const { fixtures } = d;
    const cellW = W / 16;
    const cellH = H;

    fixtures.forEach((fx, i) => {
      const cx = i * cellW;
      if (!fx.active) {
        ctx.fillStyle = "rgba(255,255,255,0.02)";
        ctx.fillRect(cx + 1, 4, cellW - 2, cellH - 8);
        return;
      }

      const pulse = fx.intensity * (0.8 + Math.sin(t * (0.5 + i * 0.04) + fx.phase) * 0.2);

      // Type color
      let [r, g, b] = {
        key:  [255, 230, 200],
        wash: [200, 216, 255],
        spot: [255, 200, 100],
        fx:   [200, 255, 220],
      }[fx.type];

      // Bar fill
      const bh = pulse * (cellH - 16);
      const barGrad = ctx.createLinearGradient(cx, cellH - 8 - bh, cx, cellH - 8);
      barGrad.addColorStop(0, `rgba(${r},${g},${b},${0.8 * pulse})`);
      barGrad.addColorStop(1, `rgba(${r},${g},${b},0.2)`);
      ctx.fillStyle = barGrad;
      ctx.fillRect(cx + 2, cellH - 8 - bh, cellW - 4, bh);

      // Top indicator dot
      ctx.beginPath();
      ctx.arc(cx + cellW / 2, cellH - 8 - bh, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${0.9 + pulse * 0.1})`;
      ctx.shadowColor = `rgba(${r},${g},${b},0.6)`;
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Channel number
      ctx.fillStyle = `rgba(${PRISM_RGB},0.3)`;
      ctx.font = "7px 'JetBrains Mono'";
      ctx.textAlign = "center";
      ctx.fillText(fx.channel, cx + cellW / 2, cellH - 1);

      // Label (every 4th)
      if (i % 4 === 0) {
        ctx.fillStyle = `rgba(${PRISM_RGB},0.2)`;
        ctx.fillText(fx.label.slice(0, 4), cx + cellW * 2, 8);
      }
    });
    ctx.textAlign = "left";

    // Bottom rule
    ctx.strokeStyle = `rgba(${PRISM_RGB},0.1)`;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, cellH - 10); ctx.lineTo(W, cellH - 10); ctx.stroke();
  }, []);

  return (
    <div className="viz mat-screen" style={{ width, height, flexShrink: 0 }}>
      <canvas ref={ref} width={width * 2} height={height * 2}
              style={{ width: "100%", height: "100%" }} />
      <div className="viz-label engrave">DMX GRID · 16 FIXTURES</div>
    </div>
  );
}

/* =====================================================
   LAYER I — RENDERING
   RSE · SHD · PST · LUT
   ===================================================== */
function LayerRendering() {
  return (
    <div className="axiom-module" style={{ "--axiom-ch": PRISM_HEX }}>
      <div className="prism-layer-header">
        <span className="prism-layer-num">LAYER I</span>
        <span className="prism-layer-name">Rendering — Scene Engine, Shaders, Post-Process, LUT</span>
        <span className="prism-layer-wire">VIS · DAT</span>
        <LED on channel="bone" size={6} /><LED on channel="bone" size={6} />
        <LED on channel="cool" size={6} /><LED channel="bone" size={6} />
      </div>

      <div className="prism-viz-strip" style={{ paddingTop: 10 }}>
        <RenderPassViz width={340} height={110} />

        <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
          <div style={{ fontFamily: "var(--font-engrave)", fontSize: 8, letterSpacing: "0.2em", color: "var(--ink-dim)" }}>COLOR GRADE</div>
          <CurveEditor width={120} height={80} channel="bone" label="" />
          <Readout label="LUT"   value="CINEMATIC-A"  channel="bone"  width={120} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
          <div style={{ fontFamily: "var(--font-engrave)", fontSize: 8, letterSpacing: "0.2em", color: "var(--ink-dim)" }}>RENDER OUTPUT</div>
          <VU width={220} height={10} channel="bone" label="GPU LOAD" />
          <Spectrum width={220} height={40} bands={16} channel="bone" label="" />
          <div style={{ display: "flex", gap: 6, marginTop: 2 }}>
            <Readout label="RES"   value="4096×4096" channel="bone"  width={90} />
            <Readout label="FPS"   value="60.0"      channel="life"  width={60} />
            <Readout label="MS"    value="16.7"      channel="cool"  width={60} />
          </div>
        </div>
      </div>

      <div className="prism-component-row">
        <div className="prism-component">
          <div className="prism-comp-id">
            <span className="prism-comp-code">RSE</span>
            <span className="prism-comp-name">Render Scene Engine</span>
            <LED on channel="bone" size={5} />
          </div>
          <div className="prism-comp-controls">
            <Knob label="QUALITY" channel="bone"  variant="forge" size={40} ticks={9} defaultValue={0.85} />
            <Knob label="SAMPLES" channel="cool"  variant="arc"   size={40} defaultValue={0.6} />
            <Knob label="RANGE"   channel="myth"  variant="pip"   size={40} defaultValue={0.7} />
          </div>
          <div className="prism-comp-jacks">
            <Jack label="OUT" channel="bone" active /><Jack label="CHK" channel="cool" />
          </div>
        </div>

        <div className="prism-component">
          <div className="prism-comp-id">
            <span className="prism-comp-code">SHD</span>
            <span className="prism-comp-name">Shader Driver</span>
            <LED on channel="bone" size={5} />
          </div>
          <div className="prism-comp-controls">
            <Knob label="COMPLEX" channel="bone"  variant="arc"    size={40} defaultValue={0.72} />
            <Knob label="ITER"    channel="myth"  variant="dotted" ticks={7} size={40} defaultValue={0.5} />
            <Switch positions={3} labels={["PBR","NPR","UNL"]} channel="bone" />
          </div>
          <div className="prism-comp-jacks">
            <Jack label="SHD" channel="bone" active /><Jack label="SRF" channel="cool" />
          </div>
        </div>

        <div className="prism-component">
          <div className="prism-comp-id">
            <span className="prism-comp-code">PST</span>
            <span className="prism-comp-name">Post-Process Stack</span>
            <LED on channel="cool" size={5} />
          </div>
          <div className="prism-comp-controls">
            <Knob label="BLOOM"  channel="bone"  variant="arc" size={40} defaultValue={0.45} />
            <Knob label="DOF"    channel="cool"  variant="arc" size={40} defaultValue={0.3} />
            <Knob label="VIGN"   channel="myth"  variant="pip" size={40} defaultValue={0.55} />
          </div>
          <div className="prism-comp-jacks">
            <Jack label="PST" channel="bone" active /><Jack label="FRM" channel="myth" />
          </div>
        </div>

        <div className="prism-component">
          <div className="prism-comp-id">
            <span className="prism-comp-code">LUT</span>
            <span className="prism-comp-name">LUT Processor</span>
            <LED on channel="myth" size={5} />
          </div>
          <div className="prism-comp-controls">
            <Knob label="MIX"    channel="bone"  variant="arc"  size={40} defaultValue={0.8} />
            <Knob label="GAMMA"  channel="cool"  variant="pip"  size={40} defaultValue={0.5} />
            <GateBtn label="APPLY" channel="bone" lit />
          </div>
          <div className="prism-comp-jacks">
            <Jack label="LUT" channel="bone" active /><Jack label="CLR" channel="myth" />
          </div>
        </div>
      </div>

      <div className="axiom-module-patch">
        <div className="patch-group">
          <div className="patch-group-label">RENDER OUT</div>
          <div className="patch-group-jacks">
            <Jack label="FRM" channel="bone" active /><Jack label="SHD" channel="bone" active />
            <Jack label="PST" channel="cool" active />
          </div>
        </div>
        <div className="patch-group">
          <div className="patch-group-label">VIS SEND</div>
          <div className="patch-group-jacks">
            <Jack label="LUT" channel="myth" active /><Jack label="CLR" channel="bone" />
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <Readout label="RES"   value="4096²"     channel="bone" width={72} />
          <Readout label="PASS"  value="5/5"        channel="cool" width={60} />
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   LAYER II — LIGHTING
   SKL · AMB · PNT · VOL
   ===================================================== */
function LayerLighting() {
  return (
    <div className="axiom-module" style={{ "--axiom-ch": PRISM_HEX }}>
      <div className="prism-layer-header">
        <span className="prism-layer-num">LAYER II</span>
        <span className="prism-layer-name">Lighting — Sky, Ambient, Point Array, Volumetric Fog</span>
        <span className="prism-layer-wire">VIS · ECO</span>
        <LED on channel="bone" size={6} /><LED on channel="bone" size={6} />
        <LED on channel="bone" size={6} /><LED on channel="warm" size={6} />
      </div>

      <div className="prism-viz-strip" style={{ paddingTop: 10 }}>
        <LightFieldViz width={260} height={200} />

        <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
          <div style={{ fontFamily: "var(--font-engrave)", fontSize: 8, letterSpacing: "0.2em", color: "var(--ink-dim)" }}>SKY PARAMETERS</div>
          <Scope width={270} height={60} channel="bone" label="" />
          <div style={{ display: "flex", gap: 6 }}>
            <Readout label="AZIMUTH"  value="148°"  channel="warm"  width={80} />
            <Readout label="ALTITUDE" value="42°"   channel="bone"  width={80} />
            <Readout label="TEMP"     value="5500K"  channel="cool"  width={72} />
          </div>

          <div style={{ fontFamily: "var(--font-engrave)", fontSize: 8, letterSpacing: "0.2em", color: "var(--ink-dim)", marginTop: 4 }}>VOLUMETRIC FOG</div>
          <Spectrum width={270} height={36} bands={18} channel="bone" label="" />
          <div style={{ display: "flex", gap: 6 }}>
            <Readout label="DENSITY"  value="0.42"  channel="bone"  width={72} />
            <Readout label="HEIGHT"   value="80m"   channel="cool"  width={64} />
            <Readout label="SCATTER"  value="0.68"  channel="myth"  width={72} />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
          <div style={{ fontFamily: "var(--font-engrave)", fontSize: 8, letterSpacing: "0.2em", color: "var(--ink-dim)" }}>LIGHT PLACEMENT</div>
          <XYPad size={100} channel="bone" label="" />
          <div style={{ display: "flex", gap: 6 }}>
            <Readout label="X"  value="−2.4" channel="bone" width={56} />
            <Readout label="Z"  value="+5.1" channel="bone" width={56} />
          </div>
        </div>
      </div>

      <div className="prism-component-row">
        <div className="prism-component">
          <div className="prism-comp-id">
            <span className="prism-comp-code">SKL</span>
            <span className="prism-comp-name">Sky Lighting Engine</span>
            <LED on channel="warm" size={5} />
          </div>
          <div className="prism-comp-controls">
            <Knob label="AZIMUTH" channel="warm"  variant="forge" size={40} ticks={12} defaultValue={0.41} />
            <Knob label="ALT"     channel="bone"  variant="arc"   size={40} defaultValue={0.5} />
            <Knob label="INTENS"  channel="cool"  variant="pip"   size={40} defaultValue={0.88} />
          </div>
          <div className="prism-comp-jacks">
            <Jack label="RIG" channel="bone" active /><Jack label="WTH" channel="life" />
          </div>
        </div>

        <div className="prism-component">
          <div className="prism-comp-id">
            <span className="prism-comp-code">AMB</span>
            <span className="prism-comp-name">Ambient Field</span>
            <LED on channel="bone" size={5} />
          </div>
          <div className="prism-comp-controls">
            <Knob label="LEVEL"  channel="bone"  variant="arc"    size={40} defaultValue={0.35} />
            <Knob label="COLOR"  channel="cool"  variant="dotted" ticks={7} size={40} defaultValue={0.6} />
            <Switch positions={3} labels={["SKY","FLAT","IBL"]} channel="bone" />
          </div>
          <div className="prism-comp-jacks">
            <Jack label="AMB" channel="bone" active /><Jack label="GI"  channel="myth" />
          </div>
        </div>

        <div className="prism-component">
          <div className="prism-comp-id">
            <span className="prism-comp-code">PNT</span>
            <span className="prism-comp-name">Point Light Array</span>
            <LED on channel="bone" size={5} />
          </div>
          <div className="prism-comp-controls">
            <Knob label="COUNT"  channel="bone"  variant="arc"  size={40} defaultValue={0.5} />
            <Knob label="RADIUS" channel="warm"  variant="arc"  size={40} defaultValue={0.6} />
            <Knob label="DECAY"  channel="cool"  variant="pip"  size={40} defaultValue={0.45} />
          </div>
          <div className="prism-comp-jacks">
            <Jack label="PNT" channel="bone" active /><Jack label="COL" channel="warm" />
          </div>
        </div>

        <div className="prism-component">
          <div className="prism-comp-id">
            <span className="prism-comp-code">VOL</span>
            <span className="prism-comp-name">Volumetric Fog Engine</span>
            <LED on channel="cool" size={5} />
          </div>
          <div className="prism-comp-controls">
            <Knob label="DENSE"   channel="bone"  variant="arc"  size={40} defaultValue={0.42} />
            <Knob label="HEIGHT"  channel="cool"  variant="pip"  size={40} defaultValue={0.55} />
            <GateBtn label="ENABLE" channel="bone" lit />
          </div>
          <div className="prism-comp-jacks">
            <Jack label="FOG" channel="bone" active /><Jack label="ATM" channel="cool" active />
          </div>
        </div>
      </div>

      <div className="axiom-module-patch">
        <div className="patch-group">
          <div className="patch-group-label">LIGHT RIG OUT</div>
          <div className="patch-group-jacks">
            <Jack label="SKL" channel="warm"  active /><Jack label="AMB" channel="bone"  active />
            <Jack label="PNT" channel="bone"  active /><Jack label="VOL" channel="cool"  active />
          </div>
        </div>
        <div className="patch-group">
          <div className="patch-group-label">ECO IN</div>
          <div className="patch-group-jacks">
            <Jack label="WTH" channel="life" /><Jack label="ATM" channel="cool" />
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <Readout label="LIGHTS" value="5"      channel="bone" width={64} />
          <Readout label="TEMP"   value="5500K"  channel="warm" width={72} />
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   LAYER III — SHADOW
   CST · OCC · REF · CAS
   ===================================================== */
function LayerShadow() {
  return (
    <div className="axiom-module" style={{ "--axiom-ch": PRISM_HEX }}>
      <div className="prism-layer-header">
        <span className="prism-layer-num">LAYER III</span>
        <span className="prism-layer-name">Shadow — Caster, Occlusion, Reflection, Caustics</span>
        <span className="prism-layer-wire">VIS · SPA</span>
        <LED on channel="bone" size={6} /><LED on channel="bone" size={6} />
        <LED on channel="cool" size={6} /><LED channel="bone"   size={6} />
      </div>

      <div className="prism-viz-strip" style={{ paddingTop: 10 }}>
        <ShadowMapViz width={300} height={100} />

        <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
          <div style={{ fontFamily: "var(--font-engrave)", fontSize: 8, letterSpacing: "0.2em", color: "var(--ink-dim)" }}>OCCLUSION FIELD</div>
          <Scope width={260} height={60} channel="bone" label="" />
          <div style={{ display: "flex", gap: 6 }}>
            <Readout label="BIAS"     value="0.002"  channel="bone"  width={72} />
            <Readout label="SAMPLES"  value="16"     channel="cool"  width={64} />
            <Readout label="RADIUS"   value="0.5m"   channel="myth"  width={72} />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
          <div style={{ fontFamily: "var(--font-engrave)", fontSize: 8, letterSpacing: "0.2em", color: "var(--ink-dim)" }}>CAUSTIC PATTERN</div>
          <PhaseScope width={120} height={80} channel="bone" label="" />
          <Readout label="CAUSTICS" value="ON" channel="cool" width={120} />
        </div>
      </div>

      <div className="prism-component-row">
        <div className="prism-component">
          <div className="prism-comp-id">
            <span className="prism-comp-code">CST</span>
            <span className="prism-comp-name">Shadow Caster</span>
            <LED on channel="bone" size={5} />
          </div>
          <div className="prism-comp-controls">
            <Knob label="SOFTNESS" channel="bone"  variant="forge" size={40} ticks={9} defaultValue={0.6} />
            <Knob label="DIST"     channel="cool"  variant="arc"   size={40} defaultValue={0.75} />
            <Knob label="BIAS"     channel="myth"  variant="pip"   size={40} defaultValue={0.25} />
          </div>
          <div className="prism-comp-jacks">
            <Jack label="SHD" channel="bone" active /><Jack label="MAP" channel="cool" active />
          </div>
        </div>

        <div className="prism-component">
          <div className="prism-comp-id">
            <span className="prism-comp-code">OCC</span>
            <span className="prism-comp-name">Occlusion Engine</span>
            <LED on channel="bone" size={5} />
          </div>
          <div className="prism-comp-controls">
            <Knob label="RADIUS"  channel="bone"  variant="arc"    size={40} defaultValue={0.5} />
            <Knob label="INTENS"  channel="cool"  variant="dotted" ticks={7} size={40} defaultValue={0.65} />
            <Switch positions={3} labels={["SSAO","GTAO","RAY"]} channel="bone" />
          </div>
          <div className="prism-comp-jacks">
            <Jack label="OCC" channel="bone" active /><Jack label="GI"  channel="myth" />
          </div>
        </div>

        <div className="prism-component">
          <div className="prism-comp-id">
            <span className="prism-comp-code">REF</span>
            <span className="prism-comp-name">Reflection Mapper</span>
            <LED on channel="cool" size={5} />
          </div>
          <div className="prism-comp-controls">
            <Knob label="ROUGH"   channel="bone"  variant="arc"  size={40} defaultValue={0.35} />
            <Knob label="DIST"    channel="cool"  variant="arc"  size={40} defaultValue={0.5} />
            <Knob label="INTENS"  channel="myth"  variant="pip"  size={40} defaultValue={0.7} />
          </div>
          <div className="prism-comp-jacks">
            <Jack label="REF" channel="cool" active /><Jack label="SRF" channel="bone" />
          </div>
        </div>

        <div className="prism-component">
          <div className="prism-comp-id">
            <span className="prism-comp-code">CAS</span>
            <span className="prism-comp-name">Caustic Simulator</span>
            <LED on channel="myth" size={5} />
          </div>
          <div className="prism-comp-controls">
            <Knob label="FREQ"    channel="bone"  variant="arc"  size={40} defaultValue={0.55} />
            <Knob label="DISPRS"  channel="cool"  variant="pip"  size={40} defaultValue={0.4} />
            <GateBtn label="ENABLE" channel="cool" lit />
          </div>
          <div className="prism-comp-jacks">
            <Jack label="CAS" channel="myth" active /><Jack label="VIS" channel="bone" />
          </div>
        </div>
      </div>

      <div className="axiom-module-patch">
        <div className="patch-group">
          <div className="patch-group-label">SHADOW OUT</div>
          <div className="patch-group-jacks">
            <Jack label="SHD" channel="bone" active /><Jack label="OCC" channel="bone" active />
            <Jack label="REF" channel="cool" active />
          </div>
        </div>
        <div className="patch-group">
          <div className="patch-group-label">CAUSTIC OUT</div>
          <div className="patch-group-jacks">
            <Jack label="CAS" channel="myth" active /><Jack label="VIS" channel="bone" />
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <Readout label="CASTERS" value="4"     channel="bone" width={64} />
          <Readout label="OCC-MAP" value="1024²" channel="cool" width={72} />
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   LAYER IV — DMX
   CHN · FIX · SCN · OSC
   ===================================================== */
function LayerDMX() {
  return (
    <div className="axiom-module" style={{ "--axiom-ch": PRISM_HEX }}>
      <div className="prism-layer-header">
        <span className="prism-layer-num">LAYER IV</span>
        <span className="prism-layer-name">DMX — Channel Router, Fixtures, Scene, OSC Bridge</span>
        <span className="prism-layer-wire">CTL · VIS</span>
        <LED on channel="bone" size={6} /><LED on channel="bone" size={6} />
        <LED on channel="bone" size={6} /><LED on channel="rose" size={6} />
      </div>

      <div className="prism-viz-strip" style={{ paddingTop: 10 }}>
        <SpectrumPrismViz width={380} height={90} />

        <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
          <div style={{ fontFamily: "var(--font-engrave)", fontSize: 8, letterSpacing: "0.2em", color: "var(--ink-dim)" }}>DMX MASTER</div>
          <DMXGridViz width={240} height={70} />
          <div style={{ display: "flex", gap: 6, marginTop: 2 }}>
            <Readout label="UNIVERSE"  value="01"       channel="bone"  width={72} />
            <Readout label="CHANNELS"  value="512"      channel="cool"  width={64} />
            <Readout label="HZ"        value="44"       channel="life"  width={52} />
          </div>
        </div>
      </div>

      <div className="prism-component-row">
        <div className="prism-component">
          <div className="prism-comp-id">
            <span className="prism-comp-code">CHN</span>
            <span className="prism-comp-name">DMX Channel Router</span>
            <LED on channel="bone" size={5} />
          </div>
          <div className="prism-comp-controls">
            <Knob label="MASTER"  channel="bone"  variant="forge" size={40} ticks={9} defaultValue={0.9} />
            <Knob label="SPEED"   channel="cool"  variant="arc"   size={40} defaultValue={0.5} />
            <Knob label="FADE"    channel="myth"  variant="pip"   size={40} defaultValue={0.35} />
          </div>
          <div className="prism-comp-jacks">
            <Jack label="DMX" channel="bone" active /><Jack label="CLK" channel="cool" active />
          </div>
        </div>

        <div className="prism-component">
          <div className="prism-comp-id">
            <span className="prism-comp-code">FIX</span>
            <span className="prism-comp-name">Fixture Library</span>
            <LED on channel="bone" size={5} />
          </div>
          <div className="prism-comp-controls">
            <Knob label="TYPE"   channel="bone"  variant="arc"    size={40} defaultValue={0.3} />
            <Knob label="COUNT"  channel="cool"  variant="dotted" ticks={7} size={40} defaultValue={0.5} />
            <Switch positions={3} labels={["PAR","LED","MOV"]} channel="bone" />
          </div>
          <div className="prism-comp-jacks">
            <Jack label="FIX" channel="bone" active /><Jack label="PAT" channel="cool" />
          </div>
        </div>

        <div className="prism-component">
          <div className="prism-comp-id">
            <span className="prism-comp-code">SCN</span>
            <span className="prism-comp-name">Scene Programmer</span>
            <LED on channel="bone" size={5} />
          </div>
          <div className="prism-comp-controls">
            <Knob label="SCENE"   channel="bone"  variant="arc"  size={40} defaultValue={0.2} />
            <Knob label="TRANS"   channel="cool"  variant="arc"  size={40} defaultValue={0.6} />
            <Knob label="CUE"     channel="myth"  variant="pip"  size={40} defaultValue={0.4} />
          </div>
          <div className="prism-comp-jacks">
            <Jack label="SCN" channel="bone" active /><Jack label="CUE" channel="myth" />
          </div>
        </div>

        <div className="prism-component">
          <div className="prism-comp-id">
            <span className="prism-comp-code">OSC</span>
            <span className="prism-comp-name">OSC / MIDI Bridge</span>
            <LED on channel="rose" size={5} />
          </div>
          <div className="prism-comp-controls">
            <Knob label="PORT"    channel="bone"  variant="arc"  size={40} defaultValue={0.5} />
            <Knob label="CHAN"    channel="cool"  variant="pip"  size={40} defaultValue={0.25} />
            <GateBtn label="BROADCAST" channel="rose" lit />
          </div>
          <div className="prism-comp-jacks">
            <Jack label="OSC" channel="rose" active /><Jack label="MDI" channel="bone" active />
          </div>
        </div>
      </div>

      <div className="prism-status-bar">
        <LED on channel="bone" size={6} />
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: PRISM_HEX, letterSpacing: "0.12em" }}>
          PRISM · DMX ACTIVE
        </span>
        <Readout label="UNIVERSE"  value="01"         channel="bone"  width={72} />
        <Readout label="FIXTURES"  value="16"         channel="bone"  width={64} />
        <Readout label="SCENE"     value="02·DUSK"    channel="myth"  width={90} />
        <Readout label="OSC/IP"    value="192.168.1.x" channel="rose" width={112} />
        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          <span style={{ fontFamily: "var(--font-engrave)", fontSize: 8, color: "var(--ink-dim)", letterSpacing: "0.15em" }}>
            WIRE ·
          </span>
          {["CTL","VIS","DMX","OSC","MDI"].map(w => (
            <span key={w} style={{
              fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: "0.1em",
              color: `rgba(${PRISM_RGB},0.55)`,
              border: `1px solid rgba(${PRISM_RGB},0.18)`,
              borderRadius: 2, padding: "1px 4px"
            }}>{w}</span>
          ))}
        </div>
      </div>

      <div className="axiom-module-patch">
        <div className="patch-group">
          <div className="patch-group-label">DMX OUT</div>
          <div className="patch-group-jacks">
            <Jack label="CH1"  channel="bone" active /><Jack label="CH2"  channel="bone" active />
            <Jack label="CH3"  channel="bone" active /><Jack label="CH4"  channel="bone" active />
          </div>
        </div>
        <div className="patch-group">
          <div className="patch-group-label">OSC / MIDI</div>
          <div className="patch-group-jacks">
            <Jack label="OSC" channel="rose" active /><Jack label="MDI" channel="bone" active />
            <Jack label="CLK" channel="cool" active />
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <Readout label="DMX-PKT"  value="44Hz"    channel="bone" width={72} />
          <Readout label="OSC-PORT" value="8000"    channel="rose" width={72} />
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   ROOT — PRISM INSTRUMENT
   ===================================================== */
function PrismInstrument() {
  return (
    <div className="axiom-rack">
      <MasterTransport
        moduleId="lighting"
        moduleName="PRISM · LIGHTING"
        moduleColor={PRISM_HEX}
      />

      <div className="axiom-rack-header">
        <div className="axiom-rack-crest">
          {Crests.prism}
        </div>
        <div className="axiom-rack-title-block">
          <div className="axiom-rack-title" style={{ color: PRISM_HEX, textShadow: `0 0 18px rgba(${PRISM_RGB},0.5)` }}>
            PRISM
          </div>
          <div className="axiom-rack-subtitle">Module 04 · Lighting · Department I — WorldConstruction</div>
        </div>
        <div className="axiom-rack-meta">
          <Readout label="MODULE"  value="04 / PRISM"    channel="bone"  width={120} />
          <Readout label="CHANNEL" value="04 · LIGHTING" channel="bone"  width={130} />
          <Readout label="DEPT"    value="I · WORLDCON"  channel="cool"  width={120} />
          <Readout label="VERSION" value="V1.0"          channel="myth"  width={80}  />
        </div>
      </div>

      <div className="axiom-rack-body">
        <LayerRendering />
        <LayerLighting />
        <LayerShadow />
        <LayerDMX />
      </div>

      <div className="axiom-rack-footer">
        <span>BSQM·MODULES·GENESIS·V1.0</span>
        <span>Package bsqm-modules-001</span>
        <span>04/16 Mythos Containers</span>
        <span style={{ color: `rgba(${PRISM_RGB},0.5)` }}>
          IN: WeatherState · SurfaceDefinition · NarrativeMood · ChunkData
        </span>
        <span style={{ color: `rgba(${PRISM_RGB},0.5)` }}>
          OUT: LightingRig · AtmosphereState · RenderFrame · DMXPacket
        </span>
      </div>
    </div>
  );
}

const { createRoot: prismCreateRoot } = ReactDOM;
prismCreateRoot(document.getElementById("root")).render(<PrismInstrument />);
