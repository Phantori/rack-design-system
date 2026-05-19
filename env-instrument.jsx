/* =====================================================
   ENVIRONMENT · Module 02 · Atmosphere
   Department I — WorldConstruction
   BSQM Genesis Package · bsqm-modules-001
   16 Standard Components · 4 Layers

   Layer I   — Atmospheric  : APE · CFS · PRC · WVF
   Layer II  — Ecological   : BHM · FGS · FPT · ESE
   Layer III — Seasonal     : SCM · DNT · CSP · TGF
   Layer IV  — Events       : DTS · FEM · MPO · ECD

   IN  : GenesisPhysics(physics) · WorldMap(spatial) ·
         FactionState(social) · SimTick(temporal)
   OUT : WeatherState(ecological) · EcologicalBalance(ecological) ·
         PressureEvent(ecological) · AmbientData(ecological)
   ===================================================== */

const { useState: useEnS, useEffect: useEnE, useRef: useEnR } = React;

const ENV_LIFE  = "var(--signal-life)";
const ENV_HEX   = "#3cdc64";

/* =====================================================
   WEATHER SYSTEM VISUALIZER — APE / CFS / PRC / WVF
   ===================================================== */
function WeatherSystemViz({ width = 340, height = 110 }) {
  const ref = useEnR(null);
  const dataRef = useEnR(null);

  useEnE(() => {
    const W = width * 2, H = height * 2;
    dataRef.current = {
      clouds: Array.from({ length: 12 }, (_, i) => ({
        x: Math.random() * W,
        y: 10 + Math.random() * H * 0.45,
        w: 60 + Math.random() * 120,
        h: 20 + Math.random() * 40,
        speed: 0.2 + Math.random() * 0.5,
        alpha: 0.25 + Math.random() * 0.35,
        storm: Math.random() > 0.7,
      })),
      rain: Array.from({ length: 60 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        len: 6 + Math.random() * 14,
        speed: 4 + Math.random() * 6,
        alpha: 0.2 + Math.random() * 0.5,
      })),
      lightning: { active: false, x: 0, pts: [], timer: 0 },
    };
  }, []);

  useFrame((t) => {
    const c = ref.current; if (!c) return;
    const d = dataRef.current; if (!d) return;
    const ctx = c.getContext("2d");
    const W = c.width, H = c.height;
    ctx.clearRect(0, 0, W, H);

    // Sky gradient
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, "rgba(10,18,30,1)");
    sky.addColorStop(0.6, "rgba(15,28,40,1)");
    sky.addColorStop(1, "rgba(8,14,20,1)");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    // Wind lines
    for (let i = 0; i < 6; i++) {
      const y = (i / 5) * H * 0.6 + H * 0.1;
      const offset = (t * (0.8 + i * 0.15)) % 1;
      ctx.beginPath();
      ctx.moveTo((offset * W * 1.5 - W * 0.25) % W, y);
      ctx.lineTo(((offset * W * 1.5 - W * 0.25) % W) + W * 0.18, y);
      ctx.strokeStyle = `rgba(60,180,255,${0.06 + Math.sin(t + i) * 0.03})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Clouds
    d.clouds.forEach(cl => {
      cl.x += cl.speed;
      if (cl.x > W + cl.w) cl.x = -cl.w;

      const grad = ctx.createRadialGradient(cl.x, cl.y, 0, cl.x, cl.y, cl.w * 0.7);
      if (cl.storm) {
        grad.addColorStop(0, `rgba(40,60,80,${cl.alpha * 1.4})`);
        grad.addColorStop(1, "transparent");
      } else {
        grad.addColorStop(0, `rgba(80,120,160,${cl.alpha})`);
        grad.addColorStop(1, "transparent");
      }
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(cl.x, cl.y, cl.w * 0.7, cl.h * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    // Rain
    d.rain.forEach(r => {
      r.y += r.speed;
      if (r.y > H) { r.y = -r.len; r.x = Math.random() * W; }
      ctx.strokeStyle = `rgba(120,200,255,${r.alpha})`;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(r.x, r.y);
      ctx.lineTo(r.x - 2, r.y + r.len);
      ctx.stroke();
    });

    // Lightning
    const lt = d.lightning;
    lt.timer--;
    if (lt.timer <= 0) {
      lt.timer = 80 + Math.random() * 120;
      lt.active = true;
      lt.x = W * 0.2 + Math.random() * W * 0.6;
      lt.pts = [{ x: lt.x, y: 0 }];
      let cy = 0;
      while (cy < H * 0.7) {
        cy += 10 + Math.random() * 20;
        lt.pts.push({ x: lt.x + (Math.random() - 0.5) * 60, y: cy });
      }
    }
    if (lt.active && lt.timer > lt.timer - 8) {
      ctx.beginPath();
      lt.pts.forEach((p, i) => { if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); });
      ctx.strokeStyle = "rgba(200,220,255,0.9)";
      ctx.lineWidth = 1.5;
      ctx.shadowColor = "rgba(180,200,255,1)";
      ctx.shadowBlur = 12;
      ctx.stroke();
      ctx.shadowBlur = 0;
      lt.active = false;
    }

    // Pressure gradient overlay
    const press = ctx.createLinearGradient(0, H * 0.6, 0, H);
    press.addColorStop(0, "transparent");
    press.addColorStop(1, "rgba(60,220,100,0.06)");
    ctx.fillStyle = press;
    ctx.fillRect(0, H * 0.6, W, H * 0.4);
  }, []);

  return (
    <div className="viz mat-screen" style={{ width, height, flexShrink: 0 }}>
      <canvas ref={ref} width={width * 2} height={height * 2}
              style={{ width: "100%", height: "100%" }} />
      <div className="viz-label engrave">WEATHER SYSTEM · ATMOSPHERIC ENGINE</div>
    </div>
  );
}

/* =====================================================
   ECOSYSTEM WEB VISUALIZER — BHM / ESE
   ===================================================== */
function EcoWebViz({ size = 140 }) {
  const ref = useEnR(null);
  const dataRef = useEnR(null);

  useEnE(() => {
    const axes = ["FLORA", "FAUNA", "WATER", "SOIL", "AIR", "ENERGY"];
    dataRef.current = {
      axes,
      values: axes.map(() => 0.4 + Math.random() * 0.5),
      targets: axes.map(() => 0.4 + Math.random() * 0.5),
    };
  }, []);

  useFrame((t) => {
    const c = ref.current; if (!c) return;
    const d = dataRef.current; if (!d) return;
    const ctx = c.getContext("2d");
    const W = c.width, H = c.height;
    const cx = W / 2, cy = H / 2;
    const R = Math.min(W, H) * 0.38;
    ctx.clearRect(0, 0, W, H);

    const N = d.axes.length;
    d.values = d.values.map((v, i) => {
      if (Math.abs(v - d.targets[i]) < 0.005) d.targets[i] = 0.35 + Math.random() * 0.55;
      return v + (d.targets[i] - v) * 0.008;
    });

    // Concentric guide rings
    [0.25, 0.5, 0.75, 1.0].forEach(r => {
      ctx.beginPath();
      for (let i = 0; i < N; i++) {
        const a = (i / N) * Math.PI * 2 - Math.PI / 2;
        const x = cx + Math.cos(a) * R * r;
        const y = cy + Math.sin(a) * R * r;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = `rgba(60,220,100,${0.06 + r * 0.04})`;
      ctx.lineWidth = 0.6;
      ctx.stroke();
    });

    // Axis spokes
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2 - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
      ctx.strokeStyle = "rgba(60,220,100,0.12)";
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    // Data polygon fill
    ctx.beginPath();
    d.values.forEach((v, i) => {
      const a = (i / N) * Math.PI * 2 - Math.PI / 2;
      const x = cx + Math.cos(a) * R * v;
      const y = cy + Math.sin(a) * R * v;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = "rgba(60,220,100,0.1)";
    ctx.fill();
    ctx.strokeStyle = `rgba(60,220,100,0.7)`;
    ctx.lineWidth = 1.5;
    ctx.shadowColor = "rgba(60,220,100,0.4)";
    ctx.shadowBlur = 6;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Data points + labels
    d.values.forEach((v, i) => {
      const a = (i / N) * Math.PI * 2 - Math.PI / 2;
      const x = cx + Math.cos(a) * R * v;
      const y = cy + Math.sin(a) * R * v;
      ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(60,220,100,0.9)";
      ctx.fill();

      const lx = cx + Math.cos(a) * (R + 18);
      const ly = cy + Math.sin(a) * (R + 18);
      ctx.fillStyle = "rgba(180,220,200,0.7)";
      ctx.font = `${W * 0.055}px 'JetBrains Mono'`;
      ctx.textAlign = "center";
      ctx.fillText(d.axes[i].slice(0, 3), lx, ly + 3);
    });
    ctx.textAlign = "left";
  }, []);

  return (
    <div className="viz mat-screen" style={{ width: size, height: size, flexShrink: 0, borderRadius: "50%", overflow: "hidden" }}>
      <canvas ref={ref} width={size * 2} height={size * 2} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}

/* =====================================================
   SEASON WHEEL VISUALIZER — SCM / DNT
   ===================================================== */
function SeasonWheelViz({ size = 130 }) {
  const ref = useEnR(null);

  useFrame((t) => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d");
    const W = c.width, H = c.height;
    const cx = W / 2, cy = H / 2;
    const R = Math.min(W, H) * 0.42;
    ctx.clearRect(0, 0, W, H);

    const seasons = [
      { name: "SPRING", color: [80,200,80],   start: 0 },
      { name: "SUMMER", color: [255,200,30],  start: 0.25 },
      { name: "AUTUMN", color: [220,100,30],  start: 0.5 },
      { name: "WINTER", color: [80,160,255],  start: 0.75 },
    ];

    // Season arcs
    seasons.forEach(({ color: [r, g, b], start }) => {
      ctx.beginPath();
      const startA = start * Math.PI * 2 - Math.PI / 2;
      const endA   = startA + Math.PI / 2;
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, R, startA, endA);
      ctx.closePath();
      ctx.fillStyle = `rgba(${r},${g},${b},0.12)`;
      ctx.fill();
      ctx.strokeStyle = `rgba(${r},${g},${b},0.3)`;
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Season label
      const midA = startA + Math.PI / 4;
      const lx = cx + Math.cos(midA) * R * 0.65;
      const ly = cy + Math.sin(midA) * R * 0.65;
      ctx.fillStyle = `rgba(${r},${g},${b},0.8)`;
      ctx.font = `${W * 0.05}px 'JetBrains Mono'`;
      ctx.textAlign = "center";
      ctx.fillText(seasons.find(s => s.color[0] === r)?.name.slice(0, 3) ?? "", lx, ly + 3);
    });

    // Outer ring
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(60,220,100,0.2)";
    ctx.lineWidth = 1.5; ctx.stroke();

    // Inner ring
    ctx.beginPath(); ctx.arc(cx, cy, R * 0.35, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(60,220,100,0.15)";
    ctx.lineWidth = 1; ctx.stroke();

    // Slow year hand — one rotation per 60s
    const yearA = (t * 0.017) % (Math.PI * 2) - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(yearA) * R * 0.9, cy + Math.sin(yearA) * R * 0.9);
    ctx.strokeStyle = "rgba(60,220,100,0.85)";
    ctx.lineWidth = 2;
    ctx.shadowColor = "rgba(60,220,100,0.6)";
    ctx.shadowBlur = 6;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Day/night inner hand — faster
    const dayA = (t * 0.18) % (Math.PI * 2) - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(dayA) * R * 0.3, cy + Math.sin(dayA) * R * 0.3);
    ctx.strokeStyle = "rgba(255,200,30,0.7)";
    ctx.lineWidth = 1.5; ctx.stroke();

    // Center hub
    ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(60,220,100,0.9)";
    ctx.shadowColor = "rgba(60,220,100,0.6)";
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.textAlign = "left";
  }, []);

  return (
    <div className="viz mat-screen" style={{ width: size, height: size, flexShrink: 0, borderRadius: "50%", overflow: "hidden" }}>
      <canvas ref={ref} width={size * 2} height={size * 2} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}

/* =====================================================
   CLIMATE FIELD VISUALIZER — CSP / TGF
   ===================================================== */
function ClimateFieldViz({ width = 240, height = 80 }) {
  const ref = useEnR(null);

  useFrame((t) => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d");
    const W = c.width, H = c.height;
    ctx.clearRect(0, 0, W, H);

    // Temperature field — warm to cold gradient with isobars
    const imgData = ctx.createImageData(W, H);
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const u = x / W, v = y / H;
        const temp =
          Math.sin(u * 4.2 + t * 0.3) * 0.3 +
          Math.sin(v * 3.1 - t * 0.2) * 0.3 +
          Math.sin((u + v) * 2.8 + t * 0.15) * 0.2 +
          (1 - v) * 0.5; // warmer at top
        const n = Math.max(0, Math.min(1, (temp + 0.5) / 1.4));

        // hot=red, mid=green, cold=blue
        const r = n > 0.5 ? Math.round((n - 0.5) * 2 * 200) : 0;
        const g = Math.round(Math.sin(n * Math.PI) * 180);
        const b = n < 0.5 ? Math.round((0.5 - n) * 2 * 220) : 0;
        const idx = (y * W + x) * 4;
        imgData.data[idx]     = r;
        imgData.data[idx + 1] = g;
        imgData.data[idx + 2] = b;
        imgData.data[idx + 3] = 140;
      }
    }
    ctx.putImageData(imgData, 0, 0);

    // Isobar lines
    const levels = [0.25, 0.5, 0.75];
    levels.forEach(lv => {
      ctx.beginPath();
      for (let x = 0; x < W; x++) {
        const u = x / W;
        const temp =
          Math.sin(u * 4.2 + t * 0.3) * 0.3 +
          Math.sin(lv * 3.1 - t * 0.2) * 0.3 +
          Math.sin((u + lv) * 2.8 + t * 0.15) * 0.2 +
          (1 - lv) * 0.5;
        const yn = Math.max(0, Math.min(1, (temp + 0.5) / 1.4));
        const y = yn * H;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = "rgba(255,255,255,0.25)";
      ctx.lineWidth = 0.8;
      ctx.setLineDash([4, 6]);
      ctx.stroke();
      ctx.setLineDash([]);
    });
  }, []);

  return (
    <div className="viz mat-screen" style={{ width, height, flexShrink: 0 }}>
      <canvas ref={ref} width={width * 2} height={height * 2}
              style={{ width: "100%", height: "100%" }} />
      <div className="viz-label engrave">CLIMATE FIELD · THERMAL GRADIENT</div>
    </div>
  );
}

/* =====================================================
   PRESSURE EVENT VISUALIZER — DTS / FEM / ECD
   ===================================================== */
function PressureEventViz({ width = 300, height = 80 }) {
  const ref = useEnR(null);
  const dataRef = useEnR(null);

  useEnE(() => {
    dataRef.current = {
      events: [
        { label: "DROUGHT",   color: [255,140,30],  phase: 0.1 },
        { label: "FLOOD",     color: [30,140,255],  phase: 1.2 },
        { label: "MIGRATION", color: [60,220,100],  phase: 2.4 },
        { label: "WILDFIRE",  color: [255,60,20],   phase: 0.7 },
        { label: "BLIGHT",    color: [180,60,255],  phase: 1.9 },
      ],
    };
  }, []);

  useFrame((t) => {
    const c = ref.current; if (!c) return;
    const d = dataRef.current; if (!d) return;
    const ctx = c.getContext("2d");
    const W = c.width, H = c.height;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#030608";
    ctx.fillRect(0, 0, W, H);

    const N = d.events.length;
    const slotW = W / N;

    d.events.forEach(({ label, color: [r, g, b], phase }, i) => {
      const pressure = (Math.sin(t * 0.4 + phase) + 1) * 0.5;
      const barH = pressure * H * 0.8;
      const x = i * slotW;

      // Bar
      const grad = ctx.createLinearGradient(0, H - barH, 0, H);
      grad.addColorStop(0, `rgba(${r},${g},${b},0.85)`);
      grad.addColorStop(1, `rgba(${r},${g},${b},0.25)`);
      ctx.fillStyle = grad;
      ctx.fillRect(x + 4, H - barH, slotW - 8, barH);

      // Glow top
      ctx.shadowColor = `rgba(${r},${g},${b},0.7)`;
      ctx.shadowBlur = 8;
      ctx.fillStyle = `rgba(${r},${g},${b},0.9)`;
      ctx.fillRect(x + 4, H - barH - 2, slotW - 8, 2);
      ctx.shadowBlur = 0;

      // Label
      ctx.fillStyle = `rgba(${r},${g},${b},0.8)`;
      ctx.font = `${H * 0.14}px 'JetBrains Mono'`;
      ctx.textAlign = "center";
      ctx.fillText(label.slice(0, 4), x + slotW / 2, H - barH - 8);

      // Threshold line at 75%
      if (pressure > 0.75) {
        ctx.strokeStyle = `rgba(255,255,255,0.4)`;
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 3]);
        ctx.beginPath();
        ctx.moveTo(x + 4, H - H * 0.8 * 0.75);
        ctx.lineTo(x + slotW - 4, H - H * 0.8 * 0.75);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });
    ctx.textAlign = "left";
  }, []);

  return (
    <div className="viz mat-screen" style={{ width, height, flexShrink: 0 }}>
      <canvas ref={ref} width={width * 2} height={height * 2}
              style={{ width: "100%", height: "100%" }} />
      <div className="viz-label engrave">PRESSURE EVENTS · TRIGGER THRESHOLD</div>
    </div>
  );
}

/* =====================================================
   LAYER I — ATMOSPHERIC
   APE · CFS · PRC · WVF
   ===================================================== */
function LayerAtmospheric() {
  return (
    <div className="axiom-module" style={{ "--axiom-ch": ENV_LIFE }}>
      <div className="env-layer-header">
        <span className="env-layer-num">LAYER I</span>
        <span className="env-layer-name">Atmospheric — Pressure, Clouds, Precipitation, Wind</span>
        <span className="env-layer-wire">ECO · SPA</span>
        <LED on channel="life" size={6} /><LED on channel="life" size={6} />
        <LED on channel="cool" size={6} /><LED channel="life" size={6} />
      </div>

      <div className="env-viz-strip" style={{ paddingTop: 10 }}>
        <WeatherSystemViz width={320} height={110} />

        <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
          <div style={{ fontFamily: "var(--font-engrave)", fontSize: 8, letterSpacing: "0.2em", color: "var(--ink-dim)" }}>WIND VECTOR</div>
          <XYPad size={100} channel="cool" label="" />
          <div style={{ display: "flex", gap: 6 }}>
            <Readout label="DIR" value="248°NW" channel="cool"  width={68} />
            <Readout label="SPD" value="34 kts" channel="life"  width={68} />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
          <div style={{ fontFamily: "var(--font-engrave)", fontSize: 8, letterSpacing: "0.2em", color: "var(--ink-dim)" }}>PRESSURE PROFILE</div>
          <Scope width={200} height={60} channel="life" label="" />
          <div style={{ display: "flex", gap: 6 }}>
            <Readout label="PRESS"  value="1013 hPa" channel="life"  width={80} />
            <Readout label="PRECIP" value="72%"       channel="cool"  width={60} />
            <Readout label="HUMID"  value="88%"       channel="cool"  width={60} />
          </div>
        </div>
      </div>

      <div className="env-component-row">
        <div className="env-component">
          <div className="env-comp-id">
            <span className="env-comp-code">APE</span>
            <span className="env-comp-name">Atmospheric Pressure Engine</span>
            <LED on channel="life" size={5} />
          </div>
          <div className="env-comp-controls">
            <Knob label="BASE" channel="life" variant="forge" size={40} ticks={9} defaultValue={0.62} />
            <Knob label="DELTA" channel="cool" variant="arc" size={40} bipolar defaultValue={0.5} />
            <GateBtn label="LOCK" channel="life" lit />
          </div>
          <div className="env-comp-jacks">
            <Jack label="OUT" channel="life" active /><Jack label="MOD" channel="cool" />
          </div>
        </div>

        <div className="env-component">
          <div className="env-comp-id">
            <span className="env-comp-code">CFS</span>
            <span className="env-comp-name">Cloud Formation Synthesizer</span>
            <LED on channel="cool" size={5} />
          </div>
          <div className="env-comp-controls">
            <Knob label="COVER" channel="cool" variant="arc" size={40} defaultValue={0.7} />
            <Knob label="ALT"   channel="myth" variant="arc" size={40} defaultValue={0.55} />
            <Knob label="TYPE"  channel="cool" variant="dotted" ticks={5} size={40} defaultValue={0.4} />
          </div>
          <div className="env-comp-jacks">
            <Jack label="CLR" channel="cool" active /><Jack label="STM" channel="myth" active />
          </div>
        </div>

        <div className="env-component">
          <div className="env-comp-id">
            <span className="env-comp-code">PRC</span>
            <span className="env-comp-name">Precipitation Calculator</span>
            <LED on channel="cool" size={5} />
          </div>
          <div className="env-comp-controls">
            <Knob label="RATE"  channel="cool" variant="arc" size={40} defaultValue={0.72} />
            <Knob label="TYPE"  channel="life" variant="pip" size={40} defaultValue={0.35} />
            <Switch positions={3} labels={["RAIN","SNOW","HAIL"]} channel="cool" />
          </div>
          <div className="env-comp-jacks">
            <Jack label="ECO" channel="life" active /><Jack label="CV" channel="cool" />
          </div>
        </div>

        <div className="env-component">
          <div className="env-comp-id">
            <span className="env-comp-code">WVF</span>
            <span className="env-comp-name">Wind Vector Field</span>
            <LED on channel="life" size={5} />
          </div>
          <div className="env-comp-controls">
            <Knob label="SPEED" channel="life" variant="arc" size={40} defaultValue={0.45} />
            <Knob label="GUST"  channel="amber" variant="arc" size={40} defaultValue={0.3} />
            <Knob label="SHEAR" channel="hot" variant="dotted" ticks={7} size={40} defaultValue={0.2} />
          </div>
          <div className="env-comp-jacks">
            <Jack label="DIR" channel="cool" active /><Jack label="SPD" channel="life" active />
            <Jack label="TRG" channel="amber" />
          </div>
        </div>
      </div>

      <div className="axiom-module-patch">
        <div className="patch-group">
          <div className="patch-group-label">WEATHER OUT</div>
          <div className="patch-group-jacks">
            <Jack label="WX" channel="life" active /><Jack label="WIND" channel="cool" active />
            <Jack label="RAIN" channel="cool" active /><Jack label="PRESS" channel="life" />
          </div>
        </div>
        <div className="patch-group">
          <div className="patch-group-label">SPA IN</div>
          <div className="patch-group-jacks">
            <Jack label="MAP" channel="cool" /><Jack label="PHY" channel="myth" />
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <Readout label="WEATHER" value="STORM" channel="cool" width={80} />
          <Readout label="WIND"    value="34 kts NW" channel="life" width={96} />
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   LAYER II — ECOLOGICAL
   BHM · FGS · FPT · ESE
   ===================================================== */
function LayerEcological() {
  return (
    <div className="axiom-module" style={{ "--axiom-ch": ENV_LIFE }}>
      <div className="env-layer-header">
        <span className="env-layer-num">LAYER II</span>
        <span className="env-layer-name">Ecological — Biome Health, Flora, Fauna, Stress</span>
        <span className="env-layer-wire">ECO · SOC</span>
        <LED on channel="life" size={6} /><LED on channel="life" size={6} />
        <LED on channel="life" size={6} /><LED on channel="hot"  size={6} />
      </div>

      <div className="env-viz-strip" style={{ paddingTop: 10 }}>
        <EcoWebViz size={140} />

        <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
          <div style={{ fontFamily: "var(--font-engrave)", fontSize: 8, letterSpacing: "0.2em", color: "var(--ink-dim)" }}>BIOME HEALTH SPECTRUM</div>
          <Spectrum width={280} height={54} bands={22} channel="life" label="" />
          <div style={{ display: "flex", gap: 6 }}>
            <VU width={280} height={10} channel="life"  label="FLORA DENSITY" />
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <VU width={280} height={10} channel="amber" label="FAUNA ACTIVITY" />
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <VU width={280} height={10} channel="hot"   label="STRESS INDEX" />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
          <div style={{ fontFamily: "var(--font-engrave)", fontSize: 8, letterSpacing: "0.2em", color: "var(--ink-dim)" }}>ECO BALANCE</div>
          <div style={{ display: "flex", gap: 6 }}>
            <Readout label="FLORA"  value="74%"    channel="life"  width={64} />
            <Readout label="FAUNA"  value="61%"    channel="amber" width={64} />
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <Readout label="WATER"  value="88%"    channel="cool"  width={64} />
            <Readout label="STRESS" value="LOW"    channel="life"  width={64} />
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <GateBtn label="BALANCE" channel="life" lit />
            <GateBtn label="PURGE"   channel="hot" />
          </div>
        </div>
      </div>

      <div className="env-component-row">
        <div className="env-component">
          <div className="env-comp-id">
            <span className="env-comp-code">BHM</span>
            <span className="env-comp-name">Biome Health Monitor</span>
            <LED on channel="life" size={5} />
          </div>
          <div className="env-comp-controls">
            <Knob label="THRESH" channel="life"  variant="arc"    size={40} defaultValue={0.65} />
            <Knob label="DECAY"  channel="amber" variant="dotted" ticks={7} size={40} defaultValue={0.3} />
            <GateBtn label="ALERT" channel="hot" />
          </div>
          <div className="env-comp-jacks">
            <Jack label="ECO" channel="life" active /><Jack label="WARN" channel="hot" />
          </div>
        </div>

        <div className="env-component">
          <div className="env-comp-id">
            <span className="env-comp-code">FGS</span>
            <span className="env-comp-name">Flora Growth Simulator</span>
            <LED on channel="life" size={5} />
          </div>
          <div className="env-comp-controls">
            <Knob label="RATE"  channel="life" variant="arc"  size={40} defaultValue={0.58} />
            <Knob label="DENSE" channel="life" variant="arc"  size={40} defaultValue={0.72} />
            <Knob label="SEED"  channel="amber" variant="pip" size={40} defaultValue={0.44} />
          </div>
          <div className="env-comp-jacks">
            <Jack label="OUT" channel="life" active /><Jack label="MOD" channel="cool" />
          </div>
        </div>

        <div className="env-component">
          <div className="env-comp-id">
            <span className="env-comp-code">FPT</span>
            <span className="env-comp-name">Fauna Population Tracker</span>
            <LED on channel="amber" size={5} />
          </div>
          <div className="env-comp-controls">
            <Knob label="POP"   channel="amber" variant="arc"    size={40} defaultValue={0.55} />
            <Knob label="MIGR"  channel="life"  variant="ringed" size={40} defaultValue={0.4} />
            <Knob label="PRED"  channel="hot"   variant="dotted" ticks={5} size={40} defaultValue={0.28} />
          </div>
          <div className="env-comp-jacks">
            <Jack label="CNT" channel="amber" active /><Jack label="ZONE" channel="life" />
            <Jack label="TRG" channel="hot" />
          </div>
        </div>

        <div className="env-component">
          <div className="env-comp-id">
            <span className="env-comp-code">ESE</span>
            <span className="env-comp-name">Ecosystem Stress Evaluator</span>
            <LED on channel="hot" size={5} />
          </div>
          <div className="env-comp-controls">
            <Knob label="LOAD"  channel="hot"   variant="forge" size={40} ticks={9} defaultValue={0.35} />
            <Knob label="RESIL" channel="life"  variant="arc"   size={40} defaultValue={0.7} />
            <GateBtn label="CRISIS" channel="hot" />
          </div>
          <div className="env-comp-jacks">
            <Jack label="STR" channel="hot" active /><Jack label="ECO" channel="life" active />
          </div>
        </div>
      </div>

      <div className="axiom-module-patch">
        <div className="patch-group">
          <div className="patch-group-label">ECO BAL OUT</div>
          <div className="patch-group-jacks">
            <Jack label="BAL" channel="life" active /><Jack label="STR" channel="hot" active />
            <Jack label="SOC" channel="rose" />
          </div>
        </div>
        <div className="patch-group">
          <div className="patch-group-label">SOC IN</div>
          <div className="patch-group-jacks">
            <Jack label="FCT" channel="rose" /><Jack label="SIM" channel="amber" />
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <Readout label="BIOME HEALTH" value="74%"  channel="life" width={100} />
          <Readout label="STRESS"       value="LOW"  channel="life" width={72} />
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   LAYER III — SEASONAL
   SCM · DNT · CSP · TGF
   ===================================================== */
function LayerSeasonal() {
  const [season, setSeason] = useEnS(0);
  const SEASONS = ["SPRING", "SUMMER", "AUTUMN", "WINTER"];
  const SEASON_CH = ["life", "amber", "warm", "cool"];

  useEnE(() => {
    const id = setInterval(() => setSeason(s => (s + 1) % 4), 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="axiom-module" style={{ "--axiom-ch": ENV_LIFE }}>
      <div className="env-layer-header">
        <span className="env-layer-num">LAYER III</span>
        <span className="env-layer-name">Seasonal — Cycles, Day/Night, Climate Shift, Temperature</span>
        <span className="env-layer-wire">ECO · TMP</span>
        <LED on channel="life"  size={6} /><LED on channel="amber" size={6} />
        <LED on channel="cool"  size={6} /><LED on channel="warm"  size={6} />
      </div>

      <div className="env-viz-strip" style={{ paddingTop: 10 }}>
        <SeasonWheelViz size={130} />

        <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
          <div style={{ fontFamily: "var(--font-engrave)", fontSize: 8, letterSpacing: "0.2em", color: "var(--ink-dim)" }}>CURRENT SEASON</div>
          <div style={{ display: "flex", gap: 4 }}>
            {SEASONS.map((s, i) => (
              <Pad key={s} label={s.slice(0,3)} channel={SEASON_CH[i]} size={26} lit={i === season} />
            ))}
          </div>
          <Readout label="SEASON" value={SEASONS[season]} channel={SEASON_CH[season]} width={110} />
          <Readout label="DAY"    value="142 / 365"        channel="amber"             width={110} />
          <Readout label="TIME"   value="14:32:07"         channel="amber"             width={110} />
        </div>

        <ClimateFieldViz width={240} height={100} />

        <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
          <div style={{ fontFamily: "var(--font-engrave)", fontSize: 8, letterSpacing: "0.2em", color: "var(--ink-dim)" }}>TEMPERATURE TIMELINE</div>
          <Waveform width={180} height={56} channel="amber" label="" />
          <div style={{ display: "flex", gap: 6 }}>
            <Readout label="TEMP" value="22.4°C" channel="amber" width={72} />
            <Readout label="LAPSE" value="-0.5°/10m" channel="cool" width={88} />
          </div>
        </div>
      </div>

      <div className="env-component-row">
        <div className="env-component">
          <div className="env-comp-id">
            <span className="env-comp-code">SCM</span>
            <span className="env-comp-name">Seasonal Cycle Manager</span>
            <LED on channel="life" size={5} />
          </div>
          <div className="env-comp-controls">
            <Knob label="CYCLE"  channel="life"  variant="forge" size={40} ticks={13} defaultValue={0.38} />
            <Knob label="DRIFT"  channel="amber" variant="arc"   size={40} bipolar defaultValue={0.5} />
            <GateBtn label="LOCK" channel="amber" lit />
          </div>
          <div className="env-comp-jacks">
            <Jack label="TMP" channel="amber" active /><Jack label="ECO" channel="life" active />
          </div>
        </div>

        <div className="env-component">
          <div className="env-comp-id">
            <span className="env-comp-code">DNT</span>
            <span className="env-comp-name">Day/Night Transition</span>
            <LED on channel="amber" size={5} />
          </div>
          <div className="env-comp-controls">
            <Knob label="PHASE"  channel="amber" variant="arc" size={40} defaultValue={0.6} />
            <Knob label="DUR"    channel="warm"  variant="arc" size={40} defaultValue={0.5} />
            <Switch positions={3} labels={["DAWN","NOON","DUSK"]} channel="amber" />
          </div>
          <div className="env-comp-jacks">
            <Jack label="LT"  channel="warm"  active /><Jack label="CLK" channel="amber" />
          </div>
        </div>

        <div className="env-component">
          <div className="env-comp-id">
            <span className="env-comp-code">CSP</span>
            <span className="env-comp-name">Climate Shift Predictor</span>
            <LED on channel="cool" size={5} />
          </div>
          <div className="env-comp-controls">
            <Knob label="RATE"  channel="cool"  variant="arc"    size={40} defaultValue={0.22} />
            <Knob label="SCOPE" channel="life"  variant="dotted" ticks={7} size={40} defaultValue={0.6} />
            <Knob label="CONF"  channel="myth"  variant="pip"    size={40} defaultValue={0.85} />
          </div>
          <div className="env-comp-jacks">
            <Jack label="PRD" channel="cool" active /><Jack label="DAT" channel="myth" />
          </div>
        </div>

        <div className="env-component">
          <div className="env-comp-id">
            <span className="env-comp-code">TGF</span>
            <span className="env-comp-name">Temperature Gradient Field</span>
            <LED on channel="amber" size={5} />
          </div>
          <div className="env-comp-controls">
            <Knob label="BASE"  channel="amber" variant="arc"  size={40} defaultValue={0.55} />
            <Knob label="LAPSE" channel="cool"  variant="arc"  size={40} defaultValue={0.4} />
            <Knob label="EQUAT" channel="warm"  variant="ringed" size={40} defaultValue={0.7} />
          </div>
          <div className="env-comp-jacks">
            <Jack label="TMP" channel="amber" active /><Jack label="MOD" channel="cool" />
          </div>
        </div>
      </div>

      <div className="axiom-module-patch">
        <div className="patch-group">
          <div className="patch-group-label">TEMPORAL OUT</div>
          <div className="patch-group-jacks">
            <Jack label="SSN" channel="life"  active /><Jack label="DAY" channel="amber" active />
            <Jack label="TMP" channel="amber" active />
          </div>
        </div>
        <div className="patch-group">
          <div className="patch-group-label">TMP IN</div>
          <div className="patch-group-jacks">
            <Jack label="TICK" channel="amber" /><Jack label="GEN" channel="myth" />
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <Readout label="SEASON" value={SEASONS[season]} channel={SEASON_CH[season]} width={80} />
          <Readout label="TEMP"   value="22.4°C"          channel="amber"             width={72} />
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   LAYER IV — EVENTS
   DTS · FEM · MPO · ECD
   ===================================================== */
function LayerEvents() {
  const [alert, setAlert] = useEnS(false);
  useEnE(() => {
    const id = setInterval(() => setAlert(a => !a), 2800);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="axiom-module" style={{ "--axiom-ch": ENV_LIFE }}>
      <div className="env-layer-header">
        <span className="env-layer-num">LAYER IV</span>
        <span className="env-layer-name">Events — Drought, Flood, Migration, Crisis Detection</span>
        <span className="env-layer-wire">ECO · SEQ</span>
        <LED on={alert} channel="hot"  size={6} />
        <LED on channel="cool"  size={6} />
        <LED on channel="life"  size={6} />
        <LED on={alert} channel="amber" size={6} />
      </div>

      <div className="env-viz-strip" style={{ paddingTop: 10 }}>
        <PressureEventViz width={300} height={100} />

        <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
          <div style={{ fontFamily: "var(--font-engrave)", fontSize: 8, letterSpacing: "0.2em", color: "var(--ink-dim)" }}>MIGRATION PATTERN</div>
          <ParticleField width={220} height={68} channel="life" label="" />
          <div style={{ display: "flex", gap: 6 }}>
            <Readout label="ROUTES" value="7 active" channel="life"  width={88} />
            <Readout label="AGENTS" value="2,480"    channel="amber" width={72} />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
          <div style={{ fontFamily: "var(--font-engrave)", fontSize: 8, letterSpacing: "0.2em", color: "var(--ink-dim)" }}>EVENT LOG</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {[
              { ev: "FLOOD WARNING",  ch: "cool",  on: true  },
              { ev: "DROUGHT RISK",   ch: "amber", on: false },
              { ev: "MIGRATION PEAK", ch: "life",  on: true  },
              { ev: "BLIGHT DETECT",  ch: "hot",   on: alert },
            ].map(({ ev, ch, on }) => (
              <div key={ev} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <LED on={on} channel={ch} size={5} />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: on ? `var(--signal-${ch})` : "var(--ink-dim)", letterSpacing: "0.08em" }}>{ev}</span>
              </div>
            ))}
          </div>
          <GateBtn label="SEQUENCER ▶" channel="life" lit />
        </div>
      </div>

      <div className="env-component-row">
        <div className="env-component">
          <div className="env-comp-id">
            <span className="env-comp-code">DTS</span>
            <span className="env-comp-name">Drought Trigger System</span>
            <LED on={!alert} channel="amber" size={5} />
          </div>
          <div className="env-comp-controls">
            <Knob label="THRESH" channel="amber" variant="forge" size={40} ticks={9} defaultValue={0.75} />
            <Knob label="DUR"    channel="hot"   variant="arc"   size={40} defaultValue={0.4} />
            <GateBtn label="FIRE" channel="amber" />
          </div>
          <div className="env-comp-jacks">
            <Jack label="ECO" channel="amber" active /><Jack label="SEQ" channel="life" active />
          </div>
        </div>

        <div className="env-component">
          <div className="env-comp-id">
            <span className="env-comp-code">FEM</span>
            <span className="env-comp-name">Flood Event Manager</span>
            <LED on channel="cool" size={5} />
          </div>
          <div className="env-comp-controls">
            <Knob label="LEVEL" channel="cool" variant="arc"    size={40} defaultValue={0.6} />
            <Knob label="AREA"  channel="life" variant="arc"    size={40} defaultValue={0.5} />
            <Knob label="DRAIN" channel="cool" variant="dotted" ticks={7} size={40} defaultValue={0.35} />
          </div>
          <div className="env-comp-jacks">
            <Jack label="FLD" channel="cool" active /><Jack label="TRG" channel="amber" active />
          </div>
        </div>

        <div className="env-component">
          <div className="env-comp-id">
            <span className="env-comp-code">MPO</span>
            <span className="env-comp-name">Migration Pattern Oracle</span>
            <LED on channel="life" size={5} />
          </div>
          <div className="env-comp-controls">
            <Knob label="PULL"  channel="life"  variant="arc"  size={40} defaultValue={0.68} />
            <Knob label="PUSH"  channel="amber" variant="arc"  size={40} defaultValue={0.55} />
            <Knob label="SCOPE" channel="cool"  variant="pip"  size={40} defaultValue={0.8} />
          </div>
          <div className="env-comp-jacks">
            <Jack label="PTH" channel="life" active /><Jack label="AGT" channel="amber" active />
          </div>
        </div>

        <div className="env-component">
          <div className="env-comp-id">
            <span className="env-comp-code">ECD</span>
            <span className="env-comp-name">Ecological Crisis Detector</span>
            <LED on={alert} channel="hot" size={5} />
          </div>
          <div className="env-comp-controls">
            <Knob label="SENS"  channel="hot"  variant="forge" size={40} ticks={9} defaultValue={0.8} />
            <Knob label="RESP"  channel="life" variant="arc"   size={40} defaultValue={0.6} />
            <GateBtn label="ALERT" channel="hot" lit={alert} />
          </div>
          <div className="env-comp-jacks">
            <Jack label="CRS" channel="hot"   active={alert} />
            <Jack label="SEQ" channel="amber" active />
          </div>
        </div>
      </div>

      <div className="axiom-module-patch">
        <div className="patch-group">
          <div className="patch-group-label">PRESSURE EVENT OUT</div>
          <div className="patch-group-jacks">
            <Jack label="DRT" channel="amber" /><Jack label="FLD" channel="cool" active />
            <Jack label="MGR" channel="life" active /><Jack label="CRS" channel="hot" active={alert} />
          </div>
        </div>
        <div className="patch-group">
          <div className="patch-group-label">AMBIENT DATA</div>
          <div className="patch-group-jacks">
            <Jack label="AMB" channel="life" active /><Jack label="SND" channel="warm" />
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <Readout label="EVENTS"  value="3 active"          channel="life"  width={84} />
          <Readout label="CRISIS"  value={alert ? "HIGH" : "NOMINAL"} channel={alert ? "hot" : "life"} width={80} />
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   ENVIRONMENT MASTER INSTRUMENT PANEL
   ===================================================== */
function EnvironmentInstrument() {
  const SCREWS = 20;
  const Rail = () => (
    <div className="axiom-rail">
      {Array.from({ length: SCREWS }).map((_, i) => <div key={i} className="screw" />)}
    </div>
  );

  return (
    <div className="axiom-page">
      <div style={{ width: "100%", maxWidth: 1060 }}>

        <div style={{
          marginBottom: 20,
          display: "flex", alignItems: "baseline", gap: 20,
          borderBottom: `1px solid ${ENV_HEX}22`,
          paddingBottom: 16,
        }}>
          <div style={{
            fontFamily: "var(--font-display)", fontSize: 26, letterSpacing: "0.1em",
            fontWeight: 700, textTransform: "uppercase", color: "var(--ink)",
          }}>ENVIRONMENT · Atmosphere</div>
          <div style={{
            fontFamily: "var(--font-engrave)", fontSize: 10, letterSpacing: "0.22em",
            color: ENV_LIFE, textShadow: `0 0 8px ${ENV_LIFE}`,
          }}>
            Module 02 · Department I — WorldConstruction · BSQM Genesis
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 12, alignItems: "center" }}>
            <Readout label="PKG"  value="BSQM-001"              channel="life" width={90} />
            <Readout label="WIRE" value="ECO · TMP · SPA · SOC" channel="life" width={164} />
            <LED on channel="life" size={8} />
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--signal-life)", textShadow: "0 0 6px var(--signal-life)" }}>
              ● ATMOSPHERE LIVE
            </div>
          </div>
        </div>

        <div className="axiom-rack">
          <Rail />
          <div className="axiom-rack-body">

            <MasterTransport
              moduleId="environment"
              moduleName="ENVIRONMENT · ATMOSPHERE"
              moduleColor={ENV_LIFE}
            />

            <div className="axiom-rack-title" style={{ "--axiom-ch": ENV_LIFE }}>
              <div style={{ color: ENV_LIFE, width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {Crests.continuum}
              </div>
              <div className="axiom-rack-title-name" style={{ color: ENV_LIFE, textShadow: `0 0 10px ${ENV_LIFE}` }}>
                ENVIRONMENT Signal Chain
              </div>
              <div className="axiom-rack-title-sub">
                WorldConstruction · 16 Standard Components · 4 Layers · Ecological Output Bus
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Readout label="MODULE" value="02 · ENVIRONMENT" channel="life" width={130} />
                <Readout label="STATUS" value="ONLINE"           channel="life" width={70} />
              </div>
              <LED on channel="life" size={8} />
            </div>

            {/* Status bar */}
            <div className="env-status-bar">
              <Readout label="WEATHER"  value="STORM"       channel="cool"  width={80} />
              <Readout label="TEMP"     value="22.4°C"      channel="amber" width={72} />
              <Readout label="HUMID"    value="88%"         channel="cool"  width={64} />
              <Readout label="WIND"     value="34 kts NW"   channel="life"  width={96} />
              <Readout label="SEASON"   value="AUTUMN"      channel="warm"  width={80} />
              <Readout label="ECO"      value="74% HEALTH"  channel="life"  width={100} />
              <Readout label="CRISIS"   value="NOMINAL"     channel="life"  width={72} />
              <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
                {["APE","CFS","PRC","WVF","BHM","FGS","FPT","ESE","SCM","DNT","CSP","TGF","DTS","FEM","MPO","ECD"].map((code, i) => (
                  <div key={code} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                    <LED on={i < 10} channel={["life","cool","cool","life","life","life","amber","hot","life","amber","cool","amber","amber","cool","life","hot"][i]} size={5} />
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 6, color: "var(--ink-dim)", letterSpacing: "0.06em" }}>{code}</span>
                  </div>
                ))}
              </div>
            </div>

            <LayerAtmospheric />
            <LayerEcological />
            <LayerSeasonal />
            <LayerEvents />

          </div>
          <Rail />
        </div>

        <div style={{
          marginTop: 16, display: "flex", gap: 24, flexWrap: "wrap",
          fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-mid)", letterSpacing: "0.08em",
        }}>
          {[
            { color: ENV_LIFE,                  label: "ECO · Ecological state output" },
            { color: "var(--signal-amber)",      label: "TMP · Temporal / seasonal tick" },
            { color: "var(--signal-cool)",       label: "SPA · WorldMap spatial input" },
            { color: "var(--signal-rose)",       label: "SOC · FactionState social input" },
            { color: "var(--signal-hot)",        label: "CRISIS · Pressure event triggers" },
          ].map(({ color, label }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ color, textShadow: `0 0 4px ${color}`, fontSize: 16 }}>━</span>
              {label}
            </div>
          ))}
          <div style={{ marginLeft: "auto", fontFamily: "var(--font-engrave)", fontSize: 9, letterSpacing: "0.18em", color: "var(--ink-dim)" }}>
            BSQM·MODULES·GENESIS·V1.0 · Package bsqm-modules-001 · 02/16 Mythos Containers
          </div>
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<EnvironmentInstrument />);
