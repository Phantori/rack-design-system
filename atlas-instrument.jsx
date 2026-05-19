/* =====================================================
   ATLAS · Module 01 · Terrain
   Department I — WorldConstruction
   BSQM Genesis Package · bsqm-modules-001
   16 Standard Components · 4 Layers
   ===================================================== */

const { useState: useAtS, useEffect: useAtE, useRef: useAtR, useMemo: useAtM } = React;

/* ─── ATLAS CHANNEL COLOR ─────────────────────────── */
const ATLAS_COOL = "#1e8cff";
const ATLAS_CH   = `var(--signal-cool)`;

/* =====================================================
   HEX GRID VISUALIZER — biome hex map (WOA / HGM)
   ===================================================== */
function HexGridViz({ width = 220, height = 110, animated = true }) {
  const ref = useAtR(null);
  const dataRef = useAtR(null);

  useAtE(() => {
    const cols = 14, rows = 7;
    const biomes = [
      [0, 140, 255, 0.7],   // ocean
      [0, 200, 180, 0.7],   // shallow
      [80, 200, 80, 0.65],  // lowland
      [60, 160, 60, 0.7],   // forest
      [160, 130, 80, 0.7],  // highland
      [200, 180, 160, 0.6], // mountain
      [230, 230, 255, 0.5], // snow
    ];
    const cells = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const noise = Math.sin(col * 0.8 + row * 0.6) * 0.5 +
                      Math.sin(col * 0.3 - row * 1.1) * 0.3 +
                      Math.sin((col + row) * 0.5) * 0.2;
        const idx = Math.min(6, Math.max(0, Math.floor((noise + 1) * 3.5)));
        cells.push({ row, col, biomeIdx: idx, phase: Math.random() * Math.PI * 2 });
      }
    }
    dataRef.current = { cells, biomes, cols, rows };
  }, []);

  useFrame((t) => {
    const c = ref.current; if (!c) return;
    const d = dataRef.current; if (!d) return;
    const ctx = c.getContext("2d");
    const W = c.width, H = c.height;
    ctx.clearRect(0, 0, W, H);

    const { cells, biomes, cols, rows } = d;
    const hexW = W / (cols + 0.5);
    const hexH = H / (rows + 0.3);
    const r = Math.min(hexW, hexH) * 0.52;

    cells.forEach(({ row, col, biomeIdx, phase }) => {
      const offsetX = row % 2 === 1 ? hexW * 0.5 : 0;
      const cx = (col + 0.5) * hexW + offsetX;
      const cy = (row + 0.5) * hexH;
      const [br, bg, bb, ba] = biomes[biomeIdx];
      const pulse = animated ? 0.85 + Math.sin(t * 0.6 + phase) * 0.15 : 1;

      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3 - Math.PI / 6;
        const x = cx + r * Math.cos(a);
        const y = cy + r * Math.sin(a);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fillStyle = `rgba(${br},${bg},${bb},${ba * pulse})`;
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.45)";
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // highlight edge glow for water
      if (biomeIdx === 0 || biomeIdx === 1) {
        ctx.strokeStyle = `rgba(30,140,255,${0.3 * pulse})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
    });

    // Grid overlay scan line
    if (animated) {
      const scanX = ((t * 0.15) % 1) * W;
      ctx.fillStyle = "rgba(30,140,255,0.06)";
      ctx.fillRect(scanX - 2, 0, 4, H);
    }
  }, [animated]);

  return (
    <div className="viz mat-screen" style={{ width, height, flexShrink: 0, position: "relative" }}>
      <canvas ref={ref} width={width * 2} height={height * 2}
              style={{ width: "100%", height: "100%" }} />
      <div className="viz-label engrave">HEX GRID · BIOME MAP</div>
    </div>
  );
}

/* =====================================================
   HEIGHTMAP VISUALIZER — strata + elevation (SDC / HMG)
   ===================================================== */
function HeightmapViz({ width = 280, height = 90 }) {
  const ref = useAtR(null);

  useFrame((t) => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d");
    const W = c.width, H = c.height;
    ctx.clearRect(0, 0, W, H);

    // Background
    ctx.fillStyle = "#040810";
    ctx.fillRect(0, 0, W, H);

    // Strata layers (5 elevation bands)
    const bands = [
      { color: [0,100,200], label: "DEEP",  alt: 0.0 },
      { color: [0,160,100], label: "COAST", alt: 0.22 },
      { color: [60,160,60], label: "LOW",   alt: 0.40 },
      { color: [140,100,50],label: "MID",   alt: 0.62 },
      { color: [200,200,220],label: "PEAK", alt: 0.82 },
    ];

    const pts = 180;
    for (let bi = 4; bi >= 0; bi--) {
      const { color: [r,g,b], alt } = bands[bi];
      ctx.beginPath();
      ctx.moveTo(0, H);
      for (let i = 0; i <= pts; i++) {
        const x = (i / pts) * W;
        const u = i / pts;
        const baseH = alt * H * 0.9;
        const wave =
          Math.sin(u * 6.28 + t * 0.4 + bi * 0.8) * H * 0.04 +
          Math.sin(u * 12.5 - t * 0.25 + bi * 1.4) * H * 0.025 +
          Math.sin(u * 3.1 + t * 0.15) * H * 0.03;
        const y = H - baseH - wave;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.lineTo(W, H);
      ctx.closePath();
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, `rgba(${r},${g},${b},0.75)`);
      grad.addColorStop(1, `rgba(${r},${g},${b},0.35)`);
      ctx.fillStyle = grad;
      ctx.fill();

      // Contour line
      ctx.beginPath();
      for (let i = 0; i <= pts; i++) {
        const x = (i / pts) * W;
        const u = i / pts;
        const baseH = alt * H * 0.9;
        const wave =
          Math.sin(u * 6.28 + t * 0.4 + bi * 0.8) * H * 0.04 +
          Math.sin(u * 12.5 - t * 0.25 + bi * 1.4) * H * 0.025 +
          Math.sin(u * 3.1 + t * 0.15) * H * 0.03;
        const y = H - baseH - wave;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `rgba(${r},${g},${b},0.9)`;
      ctx.lineWidth = 1.0;
      ctx.stroke();
    }

    // Elevation cursor
    const cursorX = ((t * 0.12) % 1) * W;
    ctx.strokeStyle = "rgba(30,140,255,0.8)";
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 4]);
    ctx.beginPath(); ctx.moveTo(cursorX, 0); ctx.lineTo(cursorX, H); ctx.stroke();
    ctx.setLineDash([]);

    // Altitude label
    const altPct = Math.round(((H - 40) / H) * 100);
    ctx.fillStyle = "rgba(30,140,255,0.9)";
    ctx.font = `${Math.round(H * 0.14)}px 'JetBrains Mono'`;
    ctx.fillText(`ALT ${altPct}%`, cursorX + 4, 16 * (H / 90));
  }, []);

  return (
    <div className="viz mat-screen" style={{ width, height, flexShrink: 0 }}>
      <canvas ref={ref} width={width * 2} height={height * 2}
              style={{ width: "100%", height: "100%" }} />
      <div className="viz-label engrave">STRATA PROFILE · ELEVATION</div>
    </div>
  );
}

/* =====================================================
   WATERSHED VISUALIZER — flow tracing (WST / BBP)
   ===================================================== */
function WatershedViz({ width = 260, height = 80 }) {
  const ref = useAtR(null);
  const dataRef = useAtR(null);

  useAtE(() => {
    const streams = Array.from({ length: 8 }, (_, i) => ({
      startX: (i / 7) * width * 2,
      pts: Array.from({ length: 24 }, (_, j) => ({
        x: (i / 7 + Math.sin(j * 0.6 + i) * 0.06) * width * 2,
        y: (j / 23) * height * 2,
      })),
      color: i % 3 === 0 ? [0,180,255] : i % 3 === 1 ? [0,140,200] : [30,100,180],
      speed: 0.6 + Math.random() * 0.8,
      phase: Math.random() * Math.PI * 2,
    }));
    dataRef.current = { streams };
  }, []);

  useFrame((t) => {
    const c = ref.current; if (!c) return;
    const d = dataRef.current; if (!d) return;
    const ctx = c.getContext("2d");
    const W = c.width, H = c.height;
    ctx.clearRect(0, 0, W, H);

    ctx.fillStyle = "#030508";
    ctx.fillRect(0, 0, W, H);

    // Terrain mesh lines
    ctx.strokeStyle = "rgba(30,140,255,0.06)";
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 8; i++) {
      const y = (i / 7) * H;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    d.streams.forEach((s) => {
      const offset = (t * s.speed * 0.3 + s.phase) % 1;
      const [r, g, b] = s.color;

      ctx.beginPath();
      s.pts.forEach((p, i) => {
        const jitter = Math.sin(t * 1.2 + i * 0.9 + s.phase) * W * 0.018;
        if (i === 0) ctx.moveTo(p.x + jitter, p.y);
        else ctx.lineTo(p.x + jitter, p.y);
      });
      ctx.strokeStyle = `rgba(${r},${g},${b},0.35)`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Traveling droplet
      const dropIdx = Math.floor(offset * (s.pts.length - 1));
      const dropPt = s.pts[Math.min(dropIdx, s.pts.length - 1)];
      const jitter = Math.sin(t * 1.2 + dropIdx * 0.9 + s.phase) * W * 0.018;
      const grd = ctx.createRadialGradient(
        dropPt.x + jitter, dropPt.y, 0,
        dropPt.x + jitter, dropPt.y, W * 0.04
      );
      grd.addColorStop(0, `rgba(${r},${g},${b},0.9)`);
      grd.addColorStop(1, "transparent");
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(dropPt.x + jitter, dropPt.y, W * 0.04, 0, Math.PI * 2);
      ctx.fill();
    });
  }, []);

  return (
    <div className="viz mat-screen" style={{ width, height, flexShrink: 0 }}>
      <canvas ref={ref} width={width * 2} height={height * 2}
              style={{ width: "100%", height: "100%" }} />
      <div className="viz-label engrave">WATERSHED · FLOW TRACE</div>
    </div>
  );
}

/* =====================================================
   PATHFINDER VISUALIZER — nav mesh + route (PFS / ERP)
   ===================================================== */
function PathfinderViz({ width = 260, height = 90 }) {
  const ref = useAtR(null);
  const dataRef = useAtR(null);

  useAtE(() => {
    const W2 = width * 2, H2 = height * 2;
    const nodes = Array.from({ length: 18 }, (_, i) => ({
      x: 30 + Math.random() * (W2 - 60),
      y: 20 + Math.random() * (H2 - 40),
      id: i,
    }));
    // Build a rough path through nodes sorted by x
    const sorted = [...nodes].sort((a, b) => a.x - b.x);
    const path = sorted.slice(0, 8);
    dataRef.current = { nodes, path };
  }, []);

  useFrame((t) => {
    const c = ref.current; if (!c) return;
    const d = dataRef.current; if (!d) return;
    const ctx = c.getContext("2d");
    const W = c.width, H = c.height;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#040810";
    ctx.fillRect(0, 0, W, H);

    // Nav mesh triangles (background)
    const { nodes, path } = d;
    for (let i = 0; i < nodes.length - 2; i++) {
      const a = nodes[i], b = nodes[i + 1], c2 = nodes[Math.min(i + 3, nodes.length - 1)];
      ctx.beginPath();
      ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.lineTo(c2.x, c2.y);
      ctx.closePath();
      ctx.strokeStyle = "rgba(30,100,200,0.12)";
      ctx.lineWidth = 0.6;
      ctx.stroke();
      ctx.fillStyle = "rgba(30,80,160,0.04)";
      ctx.fill();
    }

    // All nodes
    nodes.forEach((n) => {
      ctx.beginPath(); ctx.arc(n.x, n.y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(30,140,255,0.35)";
      ctx.fill();
    });

    // Active path
    ctx.beginPath();
    path.forEach((n, i) => {
      if (i === 0) ctx.moveTo(n.x, n.y); else ctx.lineTo(n.x, n.y);
    });
    ctx.strokeStyle = "rgba(30,200,255,0.7)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Path nodes highlighted
    path.forEach((n) => {
      const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, 8);
      grd.addColorStop(0, "rgba(30,200,255,0.9)");
      grd.addColorStop(1, "transparent");
      ctx.fillStyle = grd;
      ctx.beginPath(); ctx.arc(n.x, n.y, 8, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(n.x, n.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = "#1ec8ff";
      ctx.fill();
    });

    // Traveling agent along path
    const progress = (t * 0.25) % 1;
    const segIdx = Math.floor(progress * (path.length - 1));
    const segT   = (progress * (path.length - 1)) % 1;
    if (path[segIdx] && path[segIdx + 1]) {
      const ax = path[segIdx].x + (path[segIdx + 1].x - path[segIdx].x) * segT;
      const ay = path[segIdx].y + (path[segIdx + 1].y - path[segIdx].y) * segT;
      const aGrd = ctx.createRadialGradient(ax, ay, 0, ax, ay, 14);
      aGrd.addColorStop(0, "rgba(255,200,30,1)");
      aGrd.addColorStop(1, "transparent");
      ctx.fillStyle = aGrd;
      ctx.beginPath(); ctx.arc(ax, ay, 14, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(ax, ay, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#ffc81e";
      ctx.fill();

      // Encounter radius circle
      ctx.beginPath(); ctx.arc(ax, ay, 28, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255,180,30,0.25)";
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, []);

  return (
    <div className="viz mat-screen" style={{ width, height, flexShrink: 0 }}>
      <canvas ref={ref} width={width * 2} height={height * 2}
              style={{ width: "100%", height: "100%" }} />
      <div className="viz-label engrave">NAV MESH · PATHFINDER</div>
    </div>
  );
}

/* =====================================================
   FAULT SEEDER VISUALIZER — geological faults (GFS)
   ===================================================== */
function FaultSeederViz({ width = 200, height = 80 }) {
  const ref = useAtR(null);
  const dataRef = useAtR(null);

  useAtE(() => {
    const W2 = width * 2, H2 = height * 2;
    const faults = Array.from({ length: 5 }, (_, i) => {
      const x1 = Math.random() * W2;
      const y1 = Math.random() * H2;
      const angle = Math.random() * Math.PI;
      const len = 0.3 + Math.random() * 0.5;
      return {
        x1, y1,
        x2: x1 + Math.cos(angle) * W2 * len,
        y2: y1 + Math.sin(angle) * H2 * len,
        stress: 0.4 + Math.random() * 0.6,
        phase: Math.random() * Math.PI * 2,
      };
    });
    dataRef.current = { faults };
  }, []);

  useFrame((t) => {
    const c = ref.current; if (!c) return;
    const d = dataRef.current; if (!d) return;
    const ctx = c.getContext("2d");
    const W = c.width, H = c.height;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#050408";
    ctx.fillRect(0, 0, W, H);

    d.faults.forEach((f) => {
      const pulse = 0.7 + Math.sin(t * 1.1 + f.phase) * 0.3;
      const stress = f.stress * pulse;

      // Fault zone glow
      const grd = ctx.createLinearGradient(f.x1, f.y1, f.x2, f.y2);
      grd.addColorStop(0, `rgba(255,80,30,${stress * 0.2})`);
      grd.addColorStop(0.5, `rgba(255,140,30,${stress * 0.5})`);
      grd.addColorStop(1, `rgba(200,60,20,${stress * 0.2})`);
      ctx.strokeStyle = grd;
      ctx.lineWidth = 6 * stress;
      ctx.shadowColor = `rgba(255,100,20,${stress * 0.4})`;
      ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.moveTo(f.x1, f.y1); ctx.lineTo(f.x2, f.y2); ctx.stroke();
      ctx.shadowBlur = 0;

      // Core fault line
      ctx.strokeStyle = `rgba(255,160,60,${stress * 0.9})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(f.x1, f.y1); ctx.lineTo(f.x2, f.y2); ctx.stroke();

      // Seismic particles
      for (let i = 0; i < 3; i++) {
        const u = ((t * 0.3 + f.phase + i * 0.33) % 1);
        const px = f.x1 + (f.x2 - f.x1) * u + (Math.random() - 0.5) * 10;
        const py = f.y1 + (f.y2 - f.y1) * u + (Math.random() - 0.5) * 10;
        ctx.fillStyle = `rgba(255,200,60,${stress * 0.7})`;
        ctx.beginPath(); ctx.arc(px, py, 2, 0, Math.PI * 2); ctx.fill();
      }
    });
  }, []);

  return (
    <div className="viz mat-screen" style={{ width, height, flexShrink: 0 }}>
      <canvas ref={ref} width={width * 2} height={height * 2}
              style={{ width: "100%", height: "100%" }} />
      <div className="viz-label engrave">FAULT SEEDER · GEO STRESS</div>
    </div>
  );
}

/* =====================================================
   REGION ORACLE VIZ — data lattice (RGO / RNS)
   ===================================================== */
function RegionOracleViz({ width = 320, height = 90 }) {
  const ref = useAtR(null);
  const dataRef = useAtR(null);

  useAtE(() => {
    const W2 = width * 2, H2 = height * 2;
    const regions = Array.from({ length: 6 }, (_, i) => ({
      x: (i / 5) * W2 * 0.85 + W2 * 0.07,
      y: H2 * 0.5 + Math.sin(i * 1.1) * H2 * 0.25,
      r: 18 + Math.random() * 16,
      color: [[0,140,255],[0,200,180],[80,200,80],[160,120,50],[200,80,200],[255,140,30]][i],
      name: ["TUNDRA","COAST","FOREST","DESERT","MARSH","PEAK"][i],
      hazard: Math.random(),
      resource: Math.random(),
    }));
    dataRef.current = { regions };
  }, []);

  useFrame((t) => {
    const c = ref.current; if (!c) return;
    const d = dataRef.current; if (!d) return;
    const ctx = c.getContext("2d");
    const W = c.width, H = c.height;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#030608";
    ctx.fillRect(0, 0, W, H);

    // Connection lattice
    const { regions } = d;
    for (let i = 0; i < regions.length - 1; i++) {
      const a = regions[i], b = regions[i + 1];
      const flow = (Math.sin(t * 0.5 + i) + 1) * 0.5;
      ctx.strokeStyle = `rgba(30,140,255,${0.1 + flow * 0.15})`;
      ctx.lineWidth = 0.8;
      ctx.setLineDash([4, 6]);
      ctx.dashOffset = -t * 8;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      ctx.setLineDash([]);
    }

    // Regions
    regions.forEach((rg, i) => {
      const pulse = 0.8 + Math.sin(t * 0.7 + i * 1.3) * 0.2;
      const [r, g, b] = rg.color;

      const grd = ctx.createRadialGradient(rg.x, rg.y, 0, rg.x, rg.y, rg.r * 2.5);
      grd.addColorStop(0, `rgba(${r},${g},${b},${0.25 * pulse})`);
      grd.addColorStop(1, "transparent");
      ctx.fillStyle = grd;
      ctx.beginPath(); ctx.arc(rg.x, rg.y, rg.r * 2.5, 0, Math.PI * 2); ctx.fill();

      ctx.beginPath(); ctx.arc(rg.x, rg.y, rg.r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${r},${g},${b},${0.7 * pulse})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = `rgba(${r},${g},${b},${0.15})`;
      ctx.fill();

      // Hazard arc
      const hazardArc = rg.hazard * Math.PI * 2;
      ctx.beginPath(); ctx.arc(rg.x, rg.y, rg.r + 6, -Math.PI / 2, -Math.PI / 2 + hazardArc);
      ctx.strokeStyle = `rgba(255,80,30,0.7)`;
      ctx.lineWidth = 2; ctx.stroke();

      // Resource arc
      const rsrcArc = rg.resource * Math.PI * 2;
      ctx.beginPath(); ctx.arc(rg.x, rg.y, rg.r + 10, -Math.PI / 2, -Math.PI / 2 + rsrcArc);
      ctx.strokeStyle = `rgba(60,255,140,0.7)`;
      ctx.lineWidth = 2; ctx.stroke();

      // Label
      ctx.fillStyle = `rgba(${r},${g},${b},0.9)`;
      ctx.font = `${H * 0.13}px 'JetBrains Mono'`;
      ctx.textAlign = "center";
      ctx.fillText(rg.name, rg.x, rg.y + rg.r + 20);
    });
    ctx.textAlign = "left";
  }, []);

  return (
    <div className="viz mat-screen" style={{ width, height, flexShrink: 0 }}>
      <canvas ref={ref} width={width * 2} height={height * 2}
              style={{ width: "100%", height: "100%" }} />
      <div className="viz-label engrave">REGION ORACLE · RESOURCE LATTICE</div>
    </div>
  );
}

/* =====================================================
   LAYER I — COORDINATE
   WOA · HGM · SDC · CTE
   ===================================================== */
function LayerCoordinate() {
  return (
    <div className="axiom-module" style={{ "--axiom-ch": ATLAS_COOL }}>
      <div className="atlas-layer-header">
        <span className="atlas-layer-num">LAYER I</span>
        <span className="atlas-layer-name">Coordinate — Origin, Grid, Depth, Transform</span>
        <span className="atlas-layer-wire">SPA</span>
        <LED on channel="cool" size={6} />
        <LED on channel="cool" size={6} />
        <LED channel="cool" size={6} />
        <LED channel="cool" size={6} />
      </div>

      {/* Top row: HexGrid + XY Pad + Readouts */}
      <div className="atlas-viz-strip" style={{ paddingTop: 10 }}>
        <HexGridViz width={200} height={100} />
        <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
          <div style={{ fontFamily: "var(--font-engrave)", fontSize: 8, letterSpacing: "0.2em", color: "var(--ink-dim)" }}>COORDINATE ORIGIN</div>
          <XYPad size={100} channel="cool" label="" />
          <div className="atlas-coord-cluster">
            <Readout label="LAT" value="38.42°N" channel="cool" width={72} />
            <span className="atlas-coord-sep">·</span>
            <Readout label="LON" value="12.08°W" channel="cool" width={72} />
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
          <div style={{ fontFamily: "var(--font-engrave)", fontSize: 8, letterSpacing: "0.2em", color: "var(--ink-dim)" }}>DEPTH STRATA</div>
          <Scope width={220} height={60} channel="cool" label="" />
          <div style={{ display: "flex", gap: 6 }}>
            <Readout label="DEPTH" value="-842m" channel="myth" width={68} />
            <Readout label="STRATA" value="7" channel="cool" width={56} />
            <Readout label="PRESS" value="84.2 atm" channel="amber" width={80} />
          </div>
        </div>
      </div>

      {/* Component controls row */}
      <div className="atlas-component-row">
        {/* WOA — World Origin Anchor */}
        <div className="atlas-component">
          <div className="atlas-comp-id">
            <span className="atlas-comp-code">WOA</span>
            <span className="atlas-comp-name">World Origin Anchor</span>
            <LED on channel="cool" size={5} />
          </div>
          <div className="atlas-comp-controls">
            <Knob label="LAT" channel="cool" variant="arc" size={40} defaultValue={0.54} />
            <Knob label="LON" channel="cool" variant="arc" size={40} defaultValue={0.32} />
            <Knob label="ALT" channel="myth" variant="dotted" ticks={7} size={40} bipolar defaultValue={0.5} />
          </div>
          <div className="atlas-comp-jacks">
            <Jack label="OUT" channel="cool" active /><Jack label="REF" channel="cool" />
          </div>
        </div>

        {/* HGM — Hex Grid Mapper */}
        <div className="atlas-component">
          <div className="atlas-comp-id">
            <span className="atlas-comp-code">HGM</span>
            <span className="atlas-comp-name">Hex Grid Mapper</span>
            <LED on channel="cool" size={5} />
          </div>
          <div className="atlas-comp-controls">
            <Knob label="SCALE" channel="cool" variant="arc" size={40} defaultValue={0.65} />
            <Knob label="OFFSET" channel="life" variant="arc" size={40} defaultValue={0.42} />
            <Switch positions={3} labels={["HEX","SQR","TRI"]} channel="cool" />
          </div>
          <div className="atlas-comp-jacks">
            <Jack label="MAP" channel="cool" active /><Jack label="CLK" channel="amber" />
          </div>
        </div>

        {/* SDC — Strata Depth Calculator */}
        <div className="atlas-component">
          <div className="atlas-comp-id">
            <span className="atlas-comp-code">SDC</span>
            <span className="atlas-comp-name">Strata Depth Calculator</span>
            <LED on channel="myth" size={5} />
          </div>
          <div className="atlas-comp-controls">
            <Knob label="DEPTH" channel="myth" variant="forge" size={40} ticks={9} defaultValue={0.78} />
            <Knob label="BANDS" channel="cool" variant="pip" size={40} defaultValue={0.44} />
            <GateBtn label="LOCK" channel="myth" lit />
          </div>
          <div className="atlas-comp-jacks">
            <Jack label="CV" channel="myth" active /><Jack label="GATE" channel="amber" active />
          </div>
        </div>

        {/* CTE — Coordinate Transform Engine */}
        <div className="atlas-component">
          <div className="atlas-comp-id">
            <span className="atlas-comp-code">CTE</span>
            <span className="atlas-comp-name">Coordinate Transform Engine</span>
            <LED channel="cool" size={5} />
          </div>
          <div className="atlas-comp-controls">
            <Knob label="ROT" channel="cool" variant="arc" size={40} bipolar defaultValue={0.5} />
            <Knob label="SCALE" channel="cool" variant="arc" size={40} defaultValue={0.6} />
            <Knob label="PROJ" channel="amber" variant="dotted" ticks={5} size={40} defaultValue={0.2} />
          </div>
          <div className="atlas-comp-jacks">
            <Jack label="IN" channel="cool" /><Jack label="OUT" channel="cool" active /><Jack label="MOD" channel="myth" />
          </div>
        </div>
      </div>

      <div className="axiom-module-patch">
        <div className="patch-group">
          <div className="patch-group-label">SPA OUT · COORD</div>
          <div className="patch-group-jacks">
            <Jack label="X" channel="cool" active /><Jack label="Y" channel="cool" active />
            <Jack label="Z" channel="myth" active /><Jack label="W" channel="cool" />
          </div>
        </div>
        <div className="patch-group">
          <div className="patch-group-label">GRID BUS</div>
          <div className="patch-group-jacks">
            <Jack label="HEX" channel="cool" active /><Jack label="REF" channel="life" />
            <Jack label="CLK" channel="amber" />
          </div>
        </div>
        <div className="patch-group">
          <div className="patch-group-label">TRANSFORM</div>
          <div className="patch-group-jacks">
            <Jack label="↗" channel="cool" /><Jack label="↘" channel="myth" active />
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "flex-end" }}>
          <Readout label="ORIGIN" value="§ 38N·12W" channel="cool" width={100} />
          <Readout label="GRID" value="HEX·7" channel="cool" width={72} />
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   LAYER II — CARTOGRAPHIC
   HMG · WST · BBP · GFS
   ===================================================== */
function LayerCartographic() {
  return (
    <div className="axiom-module" style={{ "--axiom-ch": ATLAS_COOL }}>
      <div className="atlas-layer-header">
        <span className="atlas-layer-num">LAYER II</span>
        <span className="atlas-layer-name">Cartographic — Heightmap, Watershed, Biome, Fault</span>
        <span className="atlas-layer-wire">SPA</span>
        <LED on channel="life" size={6} />
        <LED on channel="life" size={6} />
        <LED on channel="life" size={6} />
        <LED channel="life" size={6} />
      </div>

      {/* Viz strip */}
      <div className="atlas-viz-strip" style={{ paddingTop: 10 }}>
        <HeightmapViz width={250} height={90} />
        <WatershedViz width={220} height={90} />
        <FaultSeederViz width={190} height={90} />
        <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1, minWidth: 100 }}>
          <div style={{ fontFamily: "var(--font-engrave)", fontSize: 8, letterSpacing: "0.2em", color: "var(--ink-dim)" }}>ELEVATION CURVE</div>
          <CurveEditor width={150} height={65} channel="life" label="" />
          <div style={{ display: "flex", gap: 4 }}>
            <LED on channel="life" size={5} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--ink-dim)" }}>CURVE LOCK</span>
          </div>
        </div>
      </div>

      {/* Component controls */}
      <div className="atlas-component-row">
        {/* HMG — Heightmap Generator */}
        <div className="atlas-component">
          <div className="atlas-comp-id">
            <span className="atlas-comp-code">HMG</span>
            <span className="atlas-comp-name">Heightmap Generator</span>
            <LED on channel="life" size={5} />
          </div>
          <div className="atlas-comp-controls">
            <Knob label="SCALE" channel="life" variant="arc" size={40} defaultValue={0.55} />
            <Knob label="ROUGH" channel="cool" variant="arc" size={40} defaultValue={0.72} />
            <Knob label="SEED" channel="amber" variant="pip" size={40} defaultValue={0.33} />
          </div>
          <div className="atlas-comp-jacks">
            <Jack label="MAP" channel="life" active /><Jack label="MOD" channel="cool" />
          </div>
        </div>

        {/* WST — Watershed Tracer */}
        <div className="atlas-component">
          <div className="atlas-comp-id">
            <span className="atlas-comp-code">WST</span>
            <span className="atlas-comp-name">Watershed Tracer</span>
            <LED on channel="cool" size={5} />
          </div>
          <div className="atlas-comp-controls">
            <Knob label="FLOW" channel="cool" variant="arc" size={40} defaultValue={0.68} />
            <Knob label="BASIN" channel="life" variant="dotted" ticks={7} size={40} defaultValue={0.5} />
            <GateBtn label="TRACE" channel="cool" lit />
          </div>
          <div className="atlas-comp-jacks">
            <Jack label="OUT" channel="cool" active /><Jack label="TRIG" channel="amber" />
          </div>
        </div>

        {/* BBP — Biome Boundary Painter */}
        <div className="atlas-component">
          <div className="atlas-comp-id">
            <span className="atlas-comp-code">BBP</span>
            <span className="atlas-comp-name">Biome Boundary Painter</span>
            <LED on channel="life" size={5} />
          </div>
          <div className="atlas-comp-controls">
            <Knob label="TEMP" channel="warm" variant="arc" size={40} defaultValue={0.6} />
            <Knob label="HUMID" channel="cool" variant="arc" size={40} defaultValue={0.45} />
            <Knob label="BLEND" channel="life" variant="ringed" size={40} defaultValue={0.3} />
          </div>
          <div className="atlas-comp-jacks">
            <Jack label="BMAP" channel="life" active /><Jack label="RGB" channel="warm" active />
          </div>
        </div>

        {/* GFS — Geological Fault Seeder */}
        <div className="atlas-component">
          <div className="atlas-comp-id">
            <span className="atlas-comp-code">GFS</span>
            <span className="atlas-comp-name">Geological Fault Seeder</span>
            <LED on channel="hot" size={5} />
          </div>
          <div className="atlas-comp-controls">
            <Knob label="STRESS" channel="hot" variant="forge" size={40} ticks={9} defaultValue={0.82} />
            <Knob label="DEPTH" channel="amber" variant="arc" size={40} defaultValue={0.58} />
            <GateBtn label="QUAKE" channel="hot" />
          </div>
          <div className="atlas-comp-jacks">
            <Jack label="FAULT" channel="hot" active /><Jack label="GATE" channel="amber" active />
          </div>
        </div>
      </div>

      <div className="axiom-module-patch">
        <div className="patch-group">
          <div className="patch-group-label">HEIGHTMAP BUS</div>
          <div className="patch-group-jacks">
            <Jack label="HM" channel="life" active /><Jack label="NRM" channel="cool" active />
            <Jack label="CV" channel="myth" />
          </div>
        </div>
        <div className="patch-group">
          <div className="patch-group-label">BIOME DATA</div>
          <div className="patch-group-jacks">
            <Jack label="BIO" channel="life" active /><Jack label="TMP" channel="warm" />
            <Jack label="WET" channel="cool" active />
          </div>
        </div>
        <div className="patch-group">
          <div className="patch-group-label">GEO EVENT</div>
          <div className="patch-group-jacks">
            <Jack label="FLT" channel="hot" /><Jack label="TRG" channel="amber" active />
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <Readout label="ELEV" value="2,847m" channel="life" width={80} />
          <Readout label="BIOMES" value="7" channel="life" width={64} />
          <Readout label="FAULTS" value="5" channel="hot" width={64} />
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   LAYER III — NAVIGATION
   PFS · ZTG · TCC · ERP
   ===================================================== */
function LayerNavigation() {
  const [zone, setZone] = useAtS(0);
  useAtE(() => {
    const id = setInterval(() => setZone(z => (z + 1) % 8), 800);
    return () => clearInterval(id);
  }, []);

  const zones = ["α-FOREST","β-TUNDRA","γ-COAST","δ-PEAK","ε-MARSH","ζ-DESERT","η-RIFT","θ-VOID"];
  const zoneChs = ["life","cool","cool","warm","life","amber","hot","myth"];

  return (
    <div className="axiom-module" style={{ "--axiom-ch": ATLAS_COOL }}>
      <div className="atlas-layer-header">
        <span className="atlas-layer-num">LAYER III</span>
        <span className="atlas-layer-name">Navigation — Pathfinding, Zones, Travel Cost, Encounter</span>
        <span className="atlas-layer-wire">SPA · CTL</span>
        <LED on channel="amber" size={6} />
        <LED on channel="amber" size={6} />
        <LED on channel="cool" size={6} />
        <LED channel="hot" size={6} />
      </div>

      {/* Viz strip */}
      <div className="atlas-viz-strip" style={{ paddingTop: 10 }}>
        <PathfinderViz width={260} height={100} />

        {/* Zone sequencer */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
          <div style={{ fontFamily: "var(--font-engrave)", fontSize: 8, letterSpacing: "0.2em", color: "var(--ink-dim)" }}>ZONE TRANSITION GATE</div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", maxWidth: 180 }}>
            {zones.map((z, i) => (
              <Pad key={z} label={z.slice(0,2)} channel={zoneChs[i]} size={22} lit={i === zone} />
            ))}
          </div>
          <Readout label="ZONE" value={zones[zone]} channel={zoneChs[zone]} width={130} />
          <div style={{ display: "flex", gap: 6 }}>
            <GateBtn label="LOCK" channel="amber" lit />
            <GateBtn label="CLEAR" channel="hot" />
          </div>
        </div>

        {/* Travel cost / encounter */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
          <div style={{ fontFamily: "var(--font-engrave)", fontSize: 8, letterSpacing: "0.2em", color: "var(--ink-dim)" }}>TRAVEL COST · ENCOUNTER RADIUS</div>
          <Spectrum width={240} height={54} bands={20} channel="amber" label="" />
          <div style={{ display: "flex", gap: 6 }}>
            <Readout label="COST" value="3.4×" channel="amber" width={64} />
            <Readout label="RADIUS" value="48m" channel="hot" width={64} />
            <Readout label="AGENTS" value="7" channel="cool" width={56} />
          </div>
        </div>
      </div>

      {/* Component controls */}
      <div className="atlas-component-row">
        {/* PFS — Pathfinding Solver */}
        <div className="atlas-component">
          <div className="atlas-comp-id">
            <span className="atlas-comp-code">PFS</span>
            <span className="atlas-comp-name">Pathfinding Solver</span>
            <LED on channel="cool" size={5} />
          </div>
          <div className="atlas-comp-controls">
            <Knob label="HEUR" channel="cool" variant="arc" size={40} defaultValue={0.6} />
            <Knob label="ITER" channel="amber" variant="dotted" ticks={7} size={40} defaultValue={0.8} />
            <Switch positions={3} labels={["A*","DFS","BFS"]} channel="cool" />
          </div>
          <div className="atlas-comp-jacks">
            <Jack label="PATH" channel="cool" active /><Jack label="COST" channel="amber" active />
          </div>
        </div>

        {/* ZTG — Zone Transition Gate */}
        <div className="atlas-component">
          <div className="atlas-comp-id">
            <span className="atlas-comp-code">ZTG</span>
            <span className="atlas-comp-name">Zone Transition Gate</span>
            <LED on={zone % 2 === 0} channel="amber" size={5} />
          </div>
          <div className="atlas-comp-controls">
            <Knob label="THRESH" channel="amber" variant="arc" size={40} defaultValue={0.5} />
            <Knob label="FADE" channel="cool" variant="ringed" size={40} defaultValue={0.35} />
            <GateBtn label="GATE" channel="amber" lit={zone % 3 === 0} />
          </div>
          <div className="atlas-comp-jacks">
            <Jack label="IN" channel="amber" /><Jack label="GATE" channel="amber" active={zone % 2 === 0} />
            <Jack label="CTL" channel="cool" />
          </div>
        </div>

        {/* TCC — Travel Cost Calculator */}
        <div className="atlas-component">
          <div className="atlas-comp-id">
            <span className="atlas-comp-code">TCC</span>
            <span className="atlas-comp-name">Travel Cost Calculator</span>
            <LED on channel="amber" size={5} />
          </div>
          <div className="atlas-comp-controls">
            <Knob label="BASE" channel="amber" variant="arc" size={40} defaultValue={0.42} />
            <Knob label="MULT" channel="warm" variant="arc" size={40} defaultValue={0.64} />
            <Knob label="FATIGUE" channel="hot" variant="pip" size={40} defaultValue={0.28} />
          </div>
          <div className="atlas-comp-jacks">
            <Jack label="CV" channel="amber" active /><Jack label="MOD" channel="cool" />
          </div>
        </div>

        {/* ERP — Encounter Radius Probe */}
        <div className="atlas-component">
          <div className="atlas-comp-id">
            <span className="atlas-comp-code">ERP</span>
            <span className="atlas-comp-name">Encounter Radius Probe</span>
            <LED on channel="hot" size={5} />
          </div>
          <div className="atlas-comp-controls">
            <Knob label="RADIUS" channel="hot" variant="forge" size={40} ticks={9} defaultValue={0.7} />
            <Knob label="DENSITY" channel="rose" variant="arc" size={40} defaultValue={0.55} />
            <GateBtn label="SCAN" channel="hot" />
          </div>
          <div className="atlas-comp-jacks">
            <Jack label="TRIG" channel="hot" active /><Jack label="CNT" channel="amber" active />
          </div>
        </div>
      </div>

      <div className="axiom-module-patch">
        <div className="patch-group">
          <div className="patch-group-label">PATH OUT</div>
          <div className="patch-group-jacks">
            <Jack label="A→B" channel="cool" active /><Jack label="COST" channel="amber" active />
            <Jack label="GATE" channel="amber" active={zone % 2 === 0} />
          </div>
        </div>
        <div className="patch-group">
          <div className="patch-group-label">CTL BUS</div>
          <div className="patch-group-jacks">
            <Jack label="ZN" channel="amber" /><Jack label="TR" channel="cool" active />
            <Jack label="BLK" channel="hot" />
          </div>
        </div>
        <div className="patch-group">
          <div className="patch-group-label">ENCOUNTER</div>
          <div className="patch-group-jacks">
            <Jack label="RAD" channel="hot" active /><Jack label="ENT" channel="rose" />
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <Readout label="PATH LEN" value="2.4km" channel="cool" width={80} />
          <Readout label="ZONE" value={zones[zone].slice(2)} channel={zoneChs[zone]} width={80} />
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   LAYER IV — INTELLIGENCE
   RGO · THE · RNS · GMC
   ===================================================== */
function LayerIntelligence() {
  const [mem, setMem] = useAtS(0);
  useAtE(() => {
    const id = setInterval(() => setMem(m => (m + 1) % 100), 120);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="axiom-module" style={{ "--axiom-ch": ATLAS_COOL }}>
      <div className="atlas-layer-header">
        <span className="atlas-layer-num">LAYER IV</span>
        <span className="atlas-layer-name">Intelligence — Oracle, Hazard, Resource Scanner, Memory Cache</span>
        <span className="atlas-layer-wire">DAT · ENR</span>
        <LED on channel="myth" size={6} />
        <LED on channel="hot" size={6} />
        <LED on channel="life" size={6} />
        <LED on channel="cool" size={6} />
      </div>

      {/* Viz strip */}
      <div className="atlas-viz-strip" style={{ paddingTop: 10 }}>
        <RegionOracleViz width={310} height={95} />

        <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
          <div style={{ fontFamily: "var(--font-engrave)", fontSize: 8, letterSpacing: "0.2em", color: "var(--ink-dim)" }}>HAZARD · RESOURCE SPECTRUM</div>
          <Spectrum width={260} height={52} bands={24} channel="hot" label="" />
          <div style={{ display: "flex", gap: 6 }}>
            <VU width={260} height={10} channel="hot" label="HAZARD INDEX" />
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <VU width={260} height={10} channel="life" label="RESOURCE DENSITY" />
          </div>
        </div>

        {/* Memory cache status */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0, width: 130 }}>
          <div style={{ fontFamily: "var(--font-engrave)", fontSize: 8, letterSpacing: "0.2em", color: "var(--ink-dim)" }}>GEO MEMORY CACHE</div>
          <StepRow steps={16} current={mem % 16} channel="cool" label="" />
          <StepRow steps={16} current={(mem + 5) % 16} channel="myth" label="" />
          <div style={{ display: "flex", gap: 6, marginTop: 2 }}>
            <Readout label="CACHE" value={`${Math.round(mem * 0.84)}%`} channel="cool" width={70} />
            <LED on={mem > 80} channel="hot" size={8} />
          </div>
          <Readout label="RECALL" value="2.1ms" channel="myth" width={90} />
        </div>
      </div>

      {/* Component controls */}
      <div className="atlas-component-row">
        {/* RGO — Region Oracle */}
        <div className="atlas-component">
          <div className="atlas-comp-id">
            <span className="atlas-comp-code">RGO</span>
            <span className="atlas-comp-name">Region Oracle</span>
            <LED on channel="myth" size={5} />
          </div>
          <div className="atlas-comp-controls">
            <Knob label="QUERY" channel="myth" variant="arc" size={40} defaultValue={0.7} />
            <Knob label="SCOPE" channel="cool" variant="arc" size={40} defaultValue={0.5} />
            <Knob label="CONF" channel="life" variant="dotted" ticks={7} size={40} defaultValue={0.88} />
          </div>
          <div className="atlas-comp-jacks">
            <Jack label="DAT" channel="myth" active /><Jack label="QRY" channel="cool" />
          </div>
        </div>

        {/* THE — Terrain Hazard Evaluator */}
        <div className="atlas-component">
          <div className="atlas-comp-id">
            <span className="atlas-comp-code">THE</span>
            <span className="atlas-comp-name">Terrain Hazard Evaluator</span>
            <LED on channel="hot" size={5} />
          </div>
          <div className="atlas-comp-controls">
            <Knob label="THRESH" channel="hot" variant="forge" size={40} ticks={9} defaultValue={0.65} />
            <Knob label="DECAY" channel="amber" variant="arc" size={40} defaultValue={0.4} />
            <GateBtn label="ALERT" channel="hot" />
          </div>
          <div className="atlas-comp-jacks">
            <Jack label="ENR" channel="hot" active /><Jack label="WARN" channel="amber" active />
          </div>
        </div>

        {/* RNS — Resource Node Scanner */}
        <div className="atlas-component">
          <div className="atlas-comp-id">
            <span className="atlas-comp-code">RNS</span>
            <span className="atlas-comp-name">Resource Node Scanner</span>
            <LED on channel="life" size={5} />
          </div>
          <div className="atlas-comp-controls">
            <Knob label="RANGE" channel="life" variant="arc" size={40} defaultValue={0.72} />
            <Knob label="RES" channel="cool" variant="arc" size={40} defaultValue={0.58} />
            <Knob label="FILTER" channel="amber" variant="pip" size={40} defaultValue={0.35} />
          </div>
          <div className="atlas-comp-jacks">
            <Jack label="DAT" channel="life" active /><Jack label="TRIG" channel="amber" />
            <Jack label="MAP" channel="cool" active />
          </div>
        </div>

        {/* GMC — Geographic Memory Cache */}
        <div className="atlas-component">
          <div className="atlas-comp-id">
            <span className="atlas-comp-code">GMC</span>
            <span className="atlas-comp-name">Geographic Memory Cache</span>
            <LED on={mem < 90} channel="cool" size={5} />
          </div>
          <div className="atlas-comp-controls">
            <Knob label="CAP" channel="cool" variant="arc" size={40} defaultValue={0.9} />
            <Knob label="TTL" channel="myth" variant="ringed" size={40} defaultValue={0.6} />
            <GateBtn label="FLUSH" channel="hot" />
          </div>
          <div className="atlas-comp-jacks">
            <Jack label="R/W" channel="cool" active /><Jack label="DAT" channel="myth" active />
            <Jack label="INV" channel="hot" />
          </div>
        </div>
      </div>

      <div className="axiom-module-patch">
        <div className="patch-group">
          <div className="patch-group-label">DAT BUS OUT</div>
          <div className="patch-group-jacks">
            <Jack label="ORQ" channel="myth" active /><Jack label="RSC" channel="life" active />
            <Jack label="HZD" channel="hot" active /><Jack label="MEM" channel="cool" />
          </div>
        </div>
        <div className="patch-group">
          <div className="patch-group-label">ENR OUT</div>
          <div className="patch-group-jacks">
            <Jack label="HAZ" channel="hot" /><Jack label="FLD" channel="amber" active />
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Readout label="ORACLE" value="ONLINE" channel="myth" width={80} />
          <Readout label="HAZARD" value="LOW" channel="life" width={64} />
          <Readout label="RSRC" value="14 nodes" channel="life" width={88} />
          <Readout label="MEM" value={`${Math.round(mem * 0.84)}%`} channel="cool" width={56} />
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   ATLAS MASTER INSTRUMENT PANEL
   Full 16-component rack instrument
   ===================================================== */
function AtlasInstrument() {
  const SCREWS = 20;
  const Rail = () => (
    <div className="axiom-rail">
      {Array.from({ length: SCREWS }).map((_, i) => (
        <div key={i} className="screw" />
      ))}
    </div>
  );

  return (
    <div className="axiom-page">
      <div style={{ width: "100%", maxWidth: 1060 }}>

        {/* Page header */}
        <div style={{
          marginBottom: 20,
          display: "flex", alignItems: "baseline", gap: 20,
          borderBottom: `1px solid ${ATLAS_COOL}22`,
          paddingBottom: 16,
        }}>
          <div style={{
            fontFamily: "var(--font-display)", fontSize: 26, letterSpacing: "0.1em",
            fontWeight: 700, textTransform: "uppercase", color: "var(--ink)",
          }}>ATLAS · Terrain</div>
          <div style={{
            fontFamily: "var(--font-engrave)", fontSize: 10, letterSpacing: "0.22em",
            color: ATLAS_COOL, textShadow: `0 0 8px ${ATLAS_COOL}`,
          }}>
            Module 01 · Department I — WorldConstruction · BSQM Genesis
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 12, alignItems: "center" }}>
            <Readout label="PKG" value="BSQM-001" channel="cool" width={90} />
            <Readout label="WIRE" value="SPA · DAT · ENR · CTL" channel="cool" width={150} />
            <LED on channel="cool" size={8} />
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--signal-life)", textShadow: "0 0 6px var(--signal-life)" }}>
              ● TERRAIN LIVE
            </div>
          </div>
        </div>

        {/* Rack shell */}
        <div className="axiom-rack">
          <Rail />
          <div className="axiom-rack-body">

            {/* Rack nameplate */}
            <div className="axiom-rack-title">
              <div style={{ color: ATLAS_COOL, width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {Crests.atlas}
              </div>
              <div className="axiom-rack-title-name" style={{ color: ATLAS_COOL, textShadow: `0 0 10px ${ATLAS_COOL}` }}>
                ATLAS Signal Chain
              </div>
              <div className="axiom-rack-title-sub">
                WorldConstruction · 16 Standard Components · 4 Layers · 16 Capsules each
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Readout label="MODULE" value="01 · ATLAS" channel="cool" width={90} />
                <Readout label="DEPT" value="WORLD·CONSTRUCTION" channel="cool" width={130} />
                <Readout label="STATUS" value="ONLINE" channel="life" width={70} />
              </div>
              <LED on channel="life" size={8} />
            </div>

            {/* Status bar */}
            <div className="atlas-status-bar">
              <Readout label="LAT" value="38.42°N" channel="cool" width={80} />
              <Readout label="LON" value="12.08°W" channel="cool" width={80} />
              <Readout label="ALT" value="2,847m" channel="myth" width={72} />
              <Readout label="BIOME" value="HIGHLAND" channel="life" width={88} />
              <Readout label="HAZARD" value="LOW" channel="life" width={64} />
              <Readout label="EPOCH" value="§ GENESIS·01" channel="amber" width={110} />
              <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
                {["WOA","HGM","SDC","CTE","HMG","WST","BBP","GFS","PFS","ZTG","TCC","ERP","RGO","THE","RNS","GMC"].map((code, i) => (
                  <div key={code} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                    <LED on={i < 12} channel={["cool","cool","myth","cool","life","cool","life","hot","cool","amber","amber","hot","myth","hot","life","cool"][i]} size={5} />
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 6, color: "var(--ink-dim)", letterSpacing: "0.06em" }}>{code}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* All 4 layers */}
            <LayerCoordinate />
            <LayerCartographic />
            <LayerNavigation />
            <LayerIntelligence />

          </div>
          <Rail />
        </div>

        {/* Wire legend */}
        <div style={{
          marginTop: 16, display: "flex", gap: 24, flexWrap: "wrap",
          fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-mid)", letterSpacing: "0.08em",
        }}>
          {[
            { color: ATLAS_COOL,              label: "SPA · Spatial coordinate data" },
            { color: "var(--signal-myth)",    label: "DAT · Region / oracle output" },
            { color: "var(--signal-amber)",   label: "CTL · Zone gate control" },
            { color: "var(--signal-hot)",     label: "ENR · Hazard / fault energy" },
            { color: "var(--signal-life)",    label: "Resource / biome bus" },
          ].map(({ color, label }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ color, textShadow: `0 0 4px ${color}`, fontSize: 16 }}>━</span>
              {label}
            </div>
          ))}
          <div style={{ marginLeft: "auto", fontFamily: "var(--font-engrave)", fontSize: 9, letterSpacing: "0.18em", color: "var(--ink-dim)" }}>
            BSQM·MODULES·GENESIS·V1.0 · Package bsqm-modules-001 · 01/16 Mythos Containers
          </div>
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<AtlasInstrument />);
