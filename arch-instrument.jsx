/* =====================================================
   ARCHITECT · Module 03 · Structure
   Department I — WorldConstruction
   Layer I   — Blueprint  : PSG · BPL · GRM · WFR
   Layer II  — Structural : FND · WLS · RFG · OPN
   Layer III — Layout     : DST · STR · PLZ · DNS
   Layer IV  — Cultural   : STL · ARC · DCY · PRG

   IN  : WorldMap(spatial) · FactionState(social) ·
         SettlementData(social) · GenesisLaws(physics)
   OUT : ArchitectureKit(visual) · LayoutPlan(spatial) ·
         StructuralSpec(data) · ProceduralSeed(data)
   ===================================================== */

const { useState: useArS, useEffect: useArE, useRef: useArR } = React;
const ARCH_AMBER = "var(--signal-amber)";
const ARCH_HEX   = "#ffae00";

/* =====================================================
   BLUEPRINT VISUALIZER — animated drafting (PSG / BPL)
   ===================================================== */
function BlueprintViz({ width = 300, height = 120 }) {
  const ref = useArR(null);
  const dataRef = useArR(null);

  useArE(() => {
    const W = width * 2, H = height * 2;
    // Floor plan segments to draw progressively
    const plan = [
      // outer walls
      { x1:40,  y1:30,  x2:W-40, y2:30  },
      { x1:W-40,y1:30,  x2:W-40, y2:H-30},
      { x1:W-40,y1:H-30,x2:40,  y2:H-30},
      { x1:40,  y1:H-30,x2:40,  y2:30  },
      // interior walls
      { x1:40,  y1:H/2, x2:W*0.55,y2:H/2},
      { x1:W*0.55,y1:30,x2:W*0.55,y2:H-30},
      { x1:40,  y1:H*0.35,x2:W*0.55,y2:H*0.35},
      { x1:W*0.55,y1:H*0.6,x2:W-40,y2:H*0.6},
      // doors (small gaps)
      { x1:W*0.55,y1:H*0.4,x2:W*0.55,y2:H*0.5},
    ];
    dataRef.current = { plan, progress: 0, drawSpeed: 0.008 };
  }, []);

  useFrame((t) => {
    const c = ref.current; if (!c) return;
    const d = dataRef.current; if (!d) return;
    const ctx = c.getContext("2d");
    const W = c.width, H = c.height;
    ctx.clearRect(0, 0, W, H);

    // Blueprint background
    ctx.fillStyle = "#050a14";
    ctx.fillRect(0, 0, W, H);

    // Grid paper
    const gridSz = 20;
    ctx.strokeStyle = "rgba(30,120,255,0.07)";
    ctx.lineWidth = 0.5;
    for (let x = 0; x < W; x += gridSz) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += gridSz) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
    // Major grid every 4
    ctx.strokeStyle = "rgba(30,120,255,0.13)";
    ctx.lineWidth = 0.8;
    for (let x = 0; x < W; x += gridSz * 4) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += gridSz * 4) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // Advance drawing progress
    d.progress = (d.progress + d.drawSpeed) % (d.plan.length + 2);
    const totalSegs = d.plan.length;
    const fullSegs  = Math.floor(d.progress);

    // Completed segments
    ctx.strokeStyle = "rgba(255,174,0,0.85)";
    ctx.lineWidth = 2;
    ctx.shadowColor = "rgba(255,174,0,0.5)";
    ctx.shadowBlur = 4;
    for (let i = 0; i < Math.min(fullSegs, totalSegs); i++) {
      const s = d.plan[i];
      ctx.beginPath(); ctx.moveTo(s.x1, s.y1); ctx.lineTo(s.x2, s.y2); ctx.stroke();
    }

    // Currently drawing segment
    if (fullSegs < totalSegs) {
      const s = d.plan[fullSegs];
      const frac = d.progress - fullSegs;
      ctx.beginPath();
      ctx.moveTo(s.x1, s.y1);
      ctx.lineTo(s.x1 + (s.x2 - s.x1) * frac, s.y1 + (s.y2 - s.y1) * frac);
      ctx.strokeStyle = "rgba(255,230,80,0.95)";
      ctx.stroke();

      // Cursor dot
      const cx2 = s.x1 + (s.x2 - s.x1) * frac;
      const cy2 = s.y1 + (s.y2 - s.y1) * frac;
      ctx.beginPath(); ctx.arc(cx2, cy2, 4, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,230,80,1)";
      ctx.shadowBlur = 10;
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    // Dimension annotations
    ctx.strokeStyle = "rgba(100,180,255,0.35)";
    ctx.lineWidth = 0.8;
    ctx.setLineDash([3, 5]);
    ctx.beginPath(); ctx.moveTo(40, 16); ctx.lineTo(W-40, 16); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "rgba(100,180,255,0.6)";
    ctx.font = `${H * 0.07}px 'JetBrains Mono'`;
    ctx.textAlign = "center";
    ctx.fillText("64m", W / 2, 12);

    // Room labels
    if (fullSegs >= 6) {
      ctx.fillStyle = "rgba(255,174,0,0.4)";
      ctx.font = `${H * 0.065}px 'JetBrains Mono'`;
      ctx.fillText("HALL", W * 0.28, H * 0.42);
      ctx.fillText("CHMB", W * 0.28, H * 0.72);
    }
    if (fullSegs >= 8) {
      ctx.fillText("WING A", W * 0.75, H * 0.35);
      ctx.fillText("WING B", W * 0.75, H * 0.78);
    }
    ctx.textAlign = "left";
  }, []);

  return (
    <div className="viz mat-screen" style={{ width, height, flexShrink: 0 }}>
      <canvas ref={ref} width={width * 2} height={height * 2}
              style={{ width: "100%", height: "100%" }} />
      <div className="viz-label engrave">BLUEPRINT DRAFT · FLOOR PLAN</div>
    </div>
  );
}

/* =====================================================
   CITY GRID VISUALIZER — procedural layout (DST / STR)
   ===================================================== */
function CityGridViz({ width = 200, height = 200 }) {
  const ref = useArR(null);
  const dataRef = useArR(null);

  useArE(() => {
    const W = width * 2, H = height * 2;
    const blockW = 44, blockH = 36, gap = 10;
    const cols = Math.floor(W / (blockW + gap));
    const rows = Math.floor(H / (blockH + gap));
    const blocks = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const roll = Math.random();
        blocks.push({
          x: c * (blockW + gap) + gap,
          y: r * (blockH + gap) + gap,
          w: blockW - 4 + Math.random() * 8,
          h: blockH - 4 + Math.random() * 8,
          type: roll < 0.15 ? "plaza" : roll < 0.35 ? "civic" : "residential",
          height: 1 + Math.floor(Math.random() * 8),
          phase: Math.random() * Math.PI * 2,
        });
      }
    }
    dataRef.current = { blocks, cols, rows, blockW, blockH, gap };
  }, []);

  useFrame((t) => {
    const c = ref.current; if (!c) return;
    const d = dataRef.current; if (!d) return;
    const ctx = c.getContext("2d");
    const W = c.width, H = c.height;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#050a0e";
    ctx.fillRect(0, 0, W, H);

    const { blocks, blockW, blockH, gap } = d;

    // Street grid background
    ctx.strokeStyle = "rgba(255,174,0,0.08)";
    ctx.lineWidth = gap;
    ctx.strokeRect(0, 0, W, H);

    blocks.forEach(bl => {
      const pulse = 0.7 + Math.sin(t * 0.5 + bl.phase) * 0.3;
      let [r, g, b] = [60, 40, 10];
      if (bl.type === "plaza") [r, g, b] = [20, 100, 40];
      else if (bl.type === "civic") [r, g, b] = [40, 60, 140];

      // Block fill
      ctx.fillStyle = `rgba(${r},${g},${b},${0.5 * pulse})`;
      ctx.fillRect(bl.x, bl.y, bl.w, bl.h);

      // Block outline
      ctx.strokeStyle = `rgba(255,174,0,${0.2 + bl.height * 0.04})`;
      ctx.lineWidth = 0.8;
      ctx.strokeRect(bl.x, bl.y, bl.w, bl.h);

      // Height indication — taller = brighter top edge
      ctx.strokeStyle = `rgba(255,220,100,${bl.height * 0.06 * pulse})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(bl.x, bl.y); ctx.lineTo(bl.x + bl.w, bl.y);
      ctx.stroke();
    });

    // Scan overlay
    const scanY = ((t * 0.1) % 1) * H;
    ctx.fillStyle = "rgba(255,174,0,0.04)";
    ctx.fillRect(0, scanY - 2, W, 4);
  }, []);

  return (
    <div className="viz mat-screen" style={{ width, height, flexShrink: 0 }}>
      <canvas ref={ref} width={width * 2} height={height * 2}
              style={{ width: "100%", height: "100%" }} />
      <div className="viz-label engrave">CITY GRID · TOP-DOWN</div>
    </div>
  );
}

/* =====================================================
   FACADE VISUALIZER — building elevation (WLS / RFG)
   ===================================================== */
function FacadeViz({ width = 260, height = 100 }) {
  const ref = useArR(null);
  const dataRef = useArR(null);

  useArE(() => {
    const W = width * 2, H = height * 2;
    const floors = 5;
    const floorH = Math.floor((H * 0.7) / floors);
    const windows = [];
    for (let f = 0; f < floors; f++) {
      for (let w = 0; w < 6; w++) {
        windows.push({
          x: W * 0.1 + w * (W * 0.13) + 8,
          y: H * 0.08 + f * floorH + 6,
          w: W * 0.09,
          h: floorH - 12,
          lit: Math.random() > 0.4,
          phase: Math.random() * Math.PI * 2,
        });
      }
    }
    dataRef.current = { floors, floorH, windows };
  }, []);

  useFrame((t) => {
    const c = ref.current; if (!c) return;
    const d = dataRef.current; if (!d) return;
    const ctx = c.getContext("2d");
    const W = c.width, H = c.height;
    ctx.clearRect(0, 0, W, H);

    ctx.fillStyle = "#040810";
    ctx.fillRect(0, 0, W, H);

    const bx = W * 0.08, bw = W * 0.84;
    const by = H * 0.08, bh = H * 0.78;

    // Building body
    const bodyGrad = ctx.createLinearGradient(bx, by, bx + bw, by);
    bodyGrad.addColorStop(0, "rgba(30,25,15,0.9)");
    bodyGrad.addColorStop(0.5, "rgba(50,40,20,0.9)");
    bodyGrad.addColorStop(1, "rgba(30,25,15,0.9)");
    ctx.fillStyle = bodyGrad;
    ctx.fillRect(bx, by, bw, bh);

    // Floor lines
    ctx.strokeStyle = "rgba(255,174,0,0.15)";
    ctx.lineWidth = 0.8;
    for (let f = 0; f <= d.floors; f++) {
      const fy = by + f * d.floorH;
      ctx.beginPath(); ctx.moveTo(bx, fy); ctx.lineTo(bx + bw, fy); ctx.stroke();
    }

    // Outline
    ctx.strokeStyle = "rgba(255,174,0,0.5)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(bx, by, bw, bh);

    // Roof detail
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx + bw / 2, by - H * 0.06);
    ctx.lineTo(bx + bw, by);
    ctx.strokeStyle = "rgba(255,200,60,0.6)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Windows
    d.windows.forEach(w => {
      const flicker = w.lit ? 0.7 + Math.sin(t * 1.2 + w.phase) * 0.2 : 0.05;
      const color = w.lit ? `rgba(255,220,100,${flicker})` : "rgba(20,30,50,0.6)";
      ctx.fillStyle = color;
      ctx.fillRect(w.x, w.y, w.w, w.h);
      if (w.lit) {
        ctx.shadowColor = "rgba(255,200,60,0.4)";
        ctx.shadowBlur = 6;
        ctx.fillRect(w.x, w.y, w.w, w.h);
        ctx.shadowBlur = 0;
      }
      ctx.strokeStyle = "rgba(255,174,0,0.25)";
      ctx.lineWidth = 0.6;
      ctx.strokeRect(w.x, w.y, w.w, w.h);
    });

    // Ground line
    ctx.strokeStyle = "rgba(255,174,0,0.3)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, by + bh); ctx.lineTo(W, by + bh); ctx.stroke();

    // Floor labels
    ctx.fillStyle = "rgba(255,174,0,0.35)";
    ctx.font = `${H * 0.08}px 'JetBrains Mono'`;
    ctx.textAlign = "right";
    for (let f = 0; f < d.floors; f++) {
      ctx.fillText(`L${d.floors - f}`, bx - 4, by + f * d.floorH + d.floorH * 0.6);
    }
    ctx.textAlign = "left";
  }, []);

  return (
    <div className="viz mat-screen" style={{ width, height, flexShrink: 0 }}>
      <canvas ref={ref} width={width * 2} height={height * 2}
              style={{ width: "100%", height: "100%" }} />
      <div className="viz-label engrave">FACADE ELEVATION · STRUCTURAL</div>
    </div>
  );
}

/* =====================================================
   STYLE DNA VISUALIZER — cultural palette (STL / ARC)
   ===================================================== */
function StyleDNAViz({ width = 280, height = 80 }) {
  const ref = useArR(null);
  const STYLES = [
    { name: "NOMAD",    colors: [[180,120,50],[140,90,30],[200,160,80]] },
    { name: "IMPERIAL", colors: [[200,180,140],[160,140,100],[220,200,160]] },
    { name: "ORGANIC",  colors: [[80,140,60],[60,120,40],[100,160,80]] },
    { name: "ARCANE",   colors: [[100,40,180],[80,20,160],[140,80,220]] },
    { name: "RUIN",     colors: [[100,90,80],[80,70,60],[130,120,110]] },
  ];

  useFrame((t) => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d");
    const W = c.width, H = c.height;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#040810";
    ctx.fillRect(0, 0, W, H);

    const slotW = W / STYLES.length;

    STYLES.forEach((style, si) => {
      const active = (Math.floor(t * 0.25) % STYLES.length) === si;
      const pulse = active ? 1 : 0.5 + Math.sin(t * 0.3 + si) * 0.1;

      // Swatch stack
      style.colors.forEach(([r, g, b], ci) => {
        const swH = H / style.colors.length;
        const y = ci * swH;
        ctx.fillStyle = `rgba(${r},${g},${b},${0.6 * pulse})`;
        ctx.fillRect(si * slotW + 4, y, slotW - 8, swH - 2);
      });

      // Border
      ctx.strokeStyle = active
        ? `rgba(255,220,80,0.8)` : `rgba(255,174,0,0.2)`;
      ctx.lineWidth = active ? 1.5 : 0.8;
      if (active) {
        ctx.shadowColor = "rgba(255,220,80,0.5)";
        ctx.shadowBlur = 8;
      }
      ctx.strokeRect(si * slotW + 4, 0, slotW - 8, H);
      ctx.shadowBlur = 0;

      // Label
      ctx.fillStyle = active ? "rgba(255,220,80,0.9)" : "rgba(255,174,0,0.4)";
      ctx.font = `${H * 0.14}px 'JetBrains Mono'`;
      ctx.textAlign = "center";
      ctx.fillText(style.name.slice(0, 3), si * slotW + slotW / 2, H - 4);
    });
    ctx.textAlign = "left";
  }, []);

  return (
    <div className="viz mat-screen" style={{ width, height, flexShrink: 0 }}>
      <canvas ref={ref} width={width * 2} height={height * 2}
              style={{ width: "100%", height: "100%" }} />
      <div className="viz-label engrave">STYLE DNA · CULTURAL PALETTE</div>
    </div>
  );
}

/* =====================================================
   DECAY VISUALIZER — structural aging (DCY)
   ===================================================== */
function DecayViz({ width = 200, height = 80 }) {
  const ref = useArR(null);
  const dataRef = useArR(null);

  useArE(() => {
    const W = width * 2, H = height * 2;
    dataRef.current = {
      cracks: Array.from({ length: 8 }, () => {
        const sx = 20 + Math.random() * (W - 40);
        const sy = 20 + Math.random() * (H - 40);
        const segs = Array.from({ length: 6 }, (_, i) => ({
          dx: (Math.random() - 0.5) * 30,
          dy: (Math.random() - 0.5) * 20,
        }));
        return { sx, sy, segs, phase: Math.random() * Math.PI * 2, age: Math.random() };
      }),
    };
  }, []);

  useFrame((t) => {
    const c = ref.current; if (!c) return;
    const d = dataRef.current; if (!d) return;
    const ctx = c.getContext("2d");
    const W = c.width, H = c.height;
    ctx.clearRect(0, 0, W, H);

    ctx.fillStyle = "#090608";
    ctx.fillRect(0, 0, W, H);

    // Stone texture
    ctx.fillStyle = "rgba(80,65,50,0.15)";
    for (let i = 0; i < 40; i++) {
      ctx.fillRect(
        Math.sin(i * 7.3) * W / 2 + W / 2,
        Math.cos(i * 5.1) * H / 2 + H / 2,
        8 + Math.sin(i) * 6, 5 + Math.cos(i * 1.3) * 3
      );
    }

    // Cracks
    d.cracks.forEach(cr => {
      const progress = (t * 0.08 + cr.phase) % (Math.PI * 2);
      const visible = (Math.sin(progress * 0.5) + 1) * 0.5;
      ctx.beginPath();
      let cx = cr.sx, cy = cr.sy;
      ctx.moveTo(cx, cy);
      cr.segs.forEach(seg => {
        cx += seg.dx; cy += seg.dy;
        ctx.lineTo(cx, cy);
      });
      ctx.strokeStyle = `rgba(200,150,80,${0.4 * visible * cr.age})`;
      ctx.lineWidth = 0.8 + cr.age;
      ctx.stroke();

      // Dust particles at crack tips
      const alpha = 0.3 * visible * cr.age;
      ctx.fillStyle = `rgba(180,140,70,${alpha})`;
      ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2); ctx.fill();
    });

    // Age overlay
    const ageGrad = ctx.createLinearGradient(0, H * 0.6, 0, H);
    ageGrad.addColorStop(0, "transparent");
    ageGrad.addColorStop(1, "rgba(80,60,30,0.3)");
    ctx.fillStyle = ageGrad;
    ctx.fillRect(0, 0, W, H);
  }, []);

  return (
    <div className="viz mat-screen" style={{ width, height, flexShrink: 0 }}>
      <canvas ref={ref} width={width * 2} height={height * 2}
              style={{ width: "100%", height: "100%" }} />
      <div className="viz-label engrave">STRUCTURAL DECAY · AGING</div>
    </div>
  );
}

/* =====================================================
   LAYER I — BLUEPRINT
   PSG · BPL · GRM · WFR
   ===================================================== */
function LayerBlueprint() {
  return (
    <div className="axiom-module" style={{ "--axiom-ch": ARCH_AMBER }}>
      <div className="arch-layer-header">
        <span className="arch-layer-num">LAYER I</span>
        <span className="arch-layer-name">Blueprint — Structure Generator, Layout, Grid, Wireframe</span>
        <span className="arch-layer-wire">SPA · VIS</span>
        <LED on channel="amber" size={6} /><LED on channel="amber" size={6} />
        <LED on channel="cool"  size={6} /><LED channel="amber"  size={6} />
      </div>

      <div className="arch-viz-strip" style={{ paddingTop: 10 }}>
        <BlueprintViz width={300} height={120} />

        <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
          <div style={{ fontFamily: "var(--font-engrave)", fontSize: 8, letterSpacing: "0.2em", color: "var(--ink-dim)" }}>ORIGIN PLACEMENT</div>
          <XYPad size={100} channel="amber" label="" />
          <div style={{ display: "flex", gap: 6 }}>
            <Readout label="X"    value="128m"  channel="amber" width={60} />
            <Readout label="Y"    value="64m"   channel="amber" width={60} />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
          <div style={{ fontFamily: "var(--font-engrave)", fontSize: 8, letterSpacing: "0.2em", color: "var(--ink-dim)" }}>STRUCTURE PROFILE</div>
          <Scope width={210} height={60} channel="amber" label="" />
          <div style={{ display: "flex", gap: 6 }}>
            <Readout label="STRUCTS" value="248"     channel="amber" width={72} />
            <Readout label="FLOORS"  value="1–12"    channel="cool"  width={64} />
            <Readout label="SEED"    value="0xA3F2"  channel="myth"  width={72} />
          </div>
        </div>
      </div>

      <div className="arch-component-row">
        <div className="arch-component">
          <div className="arch-comp-id">
            <span className="arch-comp-code">PSG</span>
            <span className="arch-comp-name">Procedural Structure Generator</span>
            <LED on channel="amber" size={5} />
          </div>
          <div className="arch-comp-controls">
            <Knob label="VARIETY" channel="amber" variant="forge" size={40} ticks={9}  defaultValue={0.68} />
            <Knob label="COMPLEX" channel="cool"  variant="arc"   size={40} defaultValue={0.55} />
            <Knob label="SEED"    channel="myth"  variant="pip"   size={40} defaultValue={0.42} />
          </div>
          <div className="arch-comp-jacks">
            <Jack label="OUT" channel="amber" active /><Jack label="MAP" channel="cool" />
          </div>
        </div>

        <div className="arch-component">
          <div className="arch-comp-id">
            <span className="arch-comp-code">BPL</span>
            <span className="arch-comp-name">Blueprint Layout Engine</span>
            <LED on channel="amber" size={5} />
          </div>
          <div className="arch-comp-controls">
            <Knob label="RATIO"  channel="amber" variant="arc"    size={40} defaultValue={0.62} />
            <Knob label="DEPTH"  channel="cool"  variant="dotted" ticks={7} size={40} defaultValue={0.45} />
            <Switch positions={3} labels={["SYM","FREE","GRID"]} channel="amber" />
          </div>
          <div className="arch-comp-jacks">
            <Jack label="PLN" channel="amber" active /><Jack label="SPA" channel="cool" active />
          </div>
        </div>

        <div className="arch-component">
          <div className="arch-comp-id">
            <span className="arch-comp-code">GRM</span>
            <span className="arch-comp-name">Grid Reference Mapper</span>
            <LED on channel="cool" size={5} />
          </div>
          <div className="arch-comp-controls">
            <Knob label="SCALE"  channel="cool"  variant="arc" size={40} defaultValue={0.5} />
            <Knob label="ALIGN"  channel="amber" variant="arc" size={40} defaultValue={0.7} />
            <GateBtn label="LOCK" channel="amber" lit />
          </div>
          <div className="arch-comp-jacks">
            <Jack label="REF" channel="cool" active /><Jack label="MOD" channel="amber" />
          </div>
        </div>

        <div className="arch-component">
          <div className="arch-comp-id">
            <span className="arch-comp-code">WFR</span>
            <span className="arch-comp-name">Wireframe Renderer</span>
            <LED on channel="myth" size={5} />
          </div>
          <div className="arch-comp-controls">
            <Knob label="DETAIL" channel="myth"  variant="arc"  size={40} defaultValue={0.8} />
            <Knob label="LODS"   channel="amber" variant="pip"  size={40} defaultValue={0.6} />
            <GateBtn label="RENDER" channel="myth" lit />
          </div>
          <div className="arch-comp-jacks">
            <Jack label="VIS" channel="myth" active /><Jack label="LOD" channel="amber" />
          </div>
        </div>
      </div>

      <div className="axiom-module-patch">
        <div className="patch-group">
          <div className="patch-group-label">SPA OUT</div>
          <div className="patch-group-jacks">
            <Jack label="PLN" channel="amber" active /><Jack label="REF" channel="cool" active />
            <Jack label="SPA" channel="cool"  active />
          </div>
        </div>
        <div className="patch-group">
          <div className="patch-group-label">VIS OUT</div>
          <div className="patch-group-jacks">
            <Jack label="WFR" channel="myth" active /><Jack label="LOD" channel="amber" />
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <Readout label="STRUCTS"  value="248"    channel="amber" width={72} />
          <Readout label="SEED"     value="0xA3F2" channel="myth"  width={80} />
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   LAYER II — STRUCTURAL
   FND · WLS · RFG · OPN
   ===================================================== */
function LayerStructural() {
  return (
    <div className="axiom-module" style={{ "--axiom-ch": ARCH_AMBER }}>
      <div className="arch-layer-header">
        <span className="arch-layer-num">LAYER II</span>
        <span className="arch-layer-name">Structural — Foundation, Walls, Roof, Openings</span>
        <span className="arch-layer-wire">SPA · VIS</span>
        <LED on channel="amber" size={6} /><LED on channel="amber" size={6} />
        <LED on channel="amber" size={6} /><LED on channel="amber" size={6} />
      </div>

      <div className="arch-viz-strip" style={{ paddingTop: 10 }}>
        <FacadeViz width={260} height={110} />

        <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
          <div style={{ fontFamily: "var(--font-engrave)", fontSize: 8, letterSpacing: "0.2em", color: "var(--ink-dim)" }}>MATERIAL COMPOSITION</div>
          <Spectrum width={290} height={54} bands={20} channel="amber" label="" />
          <div style={{ display: "flex", gap: 6 }}>
            <VU width={290} height={10} channel="amber" label="STRUCTURAL LOAD" />
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 2 }}>
            <Readout label="INTEGRITY" value="94%"     channel="life"  width={80} />
            <Readout label="MATERIAL"  value="STONE"   channel="amber" width={80} />
            <Readout label="FLOORS"    value="5"       channel="cool"  width={56} />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
          <div style={{ fontFamily: "var(--font-engrave)", fontSize: 8, letterSpacing: "0.2em", color: "var(--ink-dim)" }}>STRUCTURAL SPEC</div>
          <CurveEditor width={140} height={70} channel="amber" label="" />
          <Readout label="SPEC" value="ARCH-V·B4" channel="amber" width={110} />
        </div>
      </div>

      <div className="arch-component-row">
        <div className="arch-component">
          <div className="arch-comp-id">
            <span className="arch-comp-code">FND</span>
            <span className="arch-comp-name">Foundation Placer</span>
            <LED on channel="amber" size={5} />
          </div>
          <div className="arch-comp-controls">
            <Knob label="DEPTH"  channel="amber" variant="forge" size={40} ticks={9} defaultValue={0.7} />
            <Knob label="WIDTH"  channel="cool"  variant="arc"   size={40} defaultValue={0.55} />
            <GateBtn label="PLACE" channel="amber" lit />
          </div>
          <div className="arch-comp-jacks">
            <Jack label="OUT" channel="amber" active /><Jack label="TRN" channel="cool" />
          </div>
        </div>

        <div className="arch-component">
          <div className="arch-comp-id">
            <span className="arch-comp-code">WLS</span>
            <span className="arch-comp-name">Wall System Builder</span>
            <LED on channel="amber" size={5} />
          </div>
          <div className="arch-comp-controls">
            <Knob label="THICK"  channel="amber" variant="arc"    size={40} defaultValue={0.4} />
            <Knob label="HEIGHT" channel="cool"  variant="arc"    size={40} defaultValue={0.65} />
            <Knob label="MATER"  channel="warm"  variant="dotted" ticks={5} size={40} defaultValue={0.5} />
          </div>
          <div className="arch-comp-jacks">
            <Jack label="WLS" channel="amber" active /><Jack label="VIS" channel="myth" active />
          </div>
        </div>

        <div className="arch-component">
          <div className="arch-comp-id">
            <span className="arch-comp-code">RFG</span>
            <span className="arch-comp-name">Roof Generation Engine</span>
            <LED on channel="amber" size={5} />
          </div>
          <div className="arch-comp-controls">
            <Knob label="PITCH"  channel="amber" variant="arc"  size={40} defaultValue={0.6} />
            <Knob label="STYLE"  channel="warm"  variant="pip"  size={40} defaultValue={0.35} />
            <Switch positions={3} labels={["FLAT","PEAK","DOME"]} channel="amber" />
          </div>
          <div className="arch-comp-jacks">
            <Jack label="RFG" channel="amber" active /><Jack label="VIS" channel="myth" />
          </div>
        </div>

        <div className="arch-component">
          <div className="arch-comp-id">
            <span className="arch-comp-code">OPN</span>
            <span className="arch-comp-name">Opening Placer</span>
            <LED on channel="cool" size={5} />
          </div>
          <div className="arch-comp-controls">
            <Knob label="DENS"  channel="amber" variant="arc"    size={40} defaultValue={0.5} />
            <Knob label="SIZE"  channel="cool"  variant="dotted" ticks={7} size={40} defaultValue={0.45} />
            <GateBtn label="AUTO" channel="life" lit />
          </div>
          <div className="arch-comp-jacks">
            <Jack label="OPN" channel="cool" active /><Jack label="NAV" channel="amber" active />
          </div>
        </div>
      </div>

      <div className="axiom-module-patch">
        <div className="patch-group">
          <div className="patch-group-label">STRUCT SPEC OUT</div>
          <div className="patch-group-jacks">
            <Jack label="FND" channel="amber" active /><Jack label="WLS" channel="amber" active />
            <Jack label="SPC" channel="myth"  active />
          </div>
        </div>
        <div className="patch-group">
          <div className="patch-group-label">VIS PIPELINE</div>
          <div className="patch-group-jacks">
            <Jack label="KIT" channel="myth" active /><Jack label="MDL" channel="amber" />
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <Readout label="INTEGRITY" value="94%"   channel="life"  width={88} />
          <Readout label="MATERIAL"  value="STONE" channel="amber" width={80} />
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   LAYER III — LAYOUT
   DST · STR · PLZ · DNS
   ===================================================== */
function LayerLayout() {
  return (
    <div className="axiom-module" style={{ "--axiom-ch": ARCH_AMBER }}>
      <div className="arch-layer-header">
        <span className="arch-layer-num">LAYER III</span>
        <span className="arch-layer-name">Layout — Districts, Streets, Plazas, Density</span>
        <span className="arch-layer-wire">SPA · DAT</span>
        <LED on channel="amber" size={6} /><LED on channel="amber" size={6} />
        <LED on channel="life"  size={6} /><LED on channel="cool"  size={6} />
      </div>

      <div className="arch-viz-strip" style={{ paddingTop: 10 }}>
        <CityGridViz width={180} height={180} />

        <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
          <div style={{ fontFamily: "var(--font-engrave)", fontSize: 8, letterSpacing: "0.2em", color: "var(--ink-dim)" }}>DISTRICT DISTRIBUTION</div>
          <Polar size={110} channel="amber" label="" />
          <div style={{ display: "flex", gap: 6 }}>
            <Readout label="DISTRICTS" value="8"      channel="amber" width={80} />
            <Readout label="STREETS"   value="124"    channel="cool"  width={72} />
            <Readout label="PLAZAS"    value="14"     channel="life"  width={64} />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
          <div style={{ fontFamily: "var(--font-engrave)", fontSize: 8, letterSpacing: "0.2em", color: "var(--ink-dim)" }}>DENSITY FIELD</div>
          <Waveform width={200} height={60} channel="amber" label="" />
          <div style={{ display: "flex", gap: 6 }}>
            <VU width={200} height={10} channel="amber" label="RESIDENTIAL" />
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <VU width={200} height={10} channel="cool"  label="CIVIC" />
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <VU width={200} height={10} channel="life"  label="GREEN" />
          </div>
        </div>
      </div>

      <div className="arch-component-row">
        <div className="arch-component">
          <div className="arch-comp-id">
            <span className="arch-comp-code">DST</span>
            <span className="arch-comp-name">District Zoning Planner</span>
            <LED on channel="amber" size={5} />
          </div>
          <div className="arch-comp-controls">
            <Knob label="ZONES"  channel="amber" variant="forge" size={40} ticks={9} defaultValue={0.5} />
            <Knob label="BLEND"  channel="cool"  variant="arc"   size={40} defaultValue={0.4} />
            <Knob label="SEED"   channel="myth"  variant="pip"   size={40} defaultValue={0.6} />
          </div>
          <div className="arch-comp-jacks">
            <Jack label="ZON" channel="amber" active /><Jack label="SPA" channel="cool" active />
          </div>
        </div>

        <div className="arch-component">
          <div className="arch-comp-id">
            <span className="arch-comp-code">STR</span>
            <span className="arch-comp-name">Street Network Generator</span>
            <LED on channel="cool" size={5} />
          </div>
          <div className="arch-comp-controls">
            <Knob label="GRID"  channel="cool"  variant="arc"    size={40} defaultValue={0.7} />
            <Knob label="WIDTH" channel="amber" variant="dotted" ticks={5} size={40} defaultValue={0.45} />
            <Switch positions={3} labels={["GRID","ORG","RAD"]} channel="cool" />
          </div>
          <div className="arch-comp-jacks">
            <Jack label="NET" channel="cool" active /><Jack label="NAV" channel="amber" active />
          </div>
        </div>

        <div className="arch-component">
          <div className="arch-comp-id">
            <span className="arch-comp-code">PLZ</span>
            <span className="arch-comp-name">Plaza / Public Space Placer</span>
            <LED on channel="life" size={5} />
          </div>
          <div className="arch-comp-controls">
            <Knob label="COUNT" channel="life"  variant="arc" size={40} defaultValue={0.45} />
            <Knob label="SIZE"  channel="amber" variant="arc" size={40} defaultValue={0.55} />
            <Knob label="CIVIC" channel="cool"  variant="pip" size={40} defaultValue={0.7} />
          </div>
          <div className="arch-comp-jacks">
            <Jack label="SPA" channel="life" active /><Jack label="SOC" channel="rose" />
          </div>
        </div>

        <div className="arch-component">
          <div className="arch-comp-id">
            <span className="arch-comp-code">DNS</span>
            <span className="arch-comp-name">Density Distribution Field</span>
            <LED on channel="amber" size={5} />
          </div>
          <div className="arch-comp-controls">
            <Knob label="PEAK"  channel="amber" variant="arc"    size={40} defaultValue={0.8} />
            <Knob label="EDGE"  channel="cool"  variant="dotted" ticks={7} size={40} defaultValue={0.25} />
            <GateBtn label="APPLY" channel="amber" lit />
          </div>
          <div className="arch-comp-jacks">
            <Jack label="DNS" channel="amber" active /><Jack label="DAT" channel="myth" active />
          </div>
        </div>
      </div>

      <div className="axiom-module-patch">
        <div className="patch-group">
          <div className="patch-group-label">LAYOUT PLAN OUT</div>
          <div className="patch-group-jacks">
            <Jack label="DST" channel="amber" active /><Jack label="STR" channel="cool" active />
            <Jack label="PLZ" channel="life"  active /><Jack label="SPA" channel="cool" />
          </div>
        </div>
        <div className="patch-group">
          <div className="patch-group-label">SPA IN</div>
          <div className="patch-group-jacks">
            <Jack label="MAP" channel="cool" /><Jack label="SET" channel="rose" />
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <Readout label="DISTRICTS" value="8"   channel="amber" width={84} />
          <Readout label="STREETS"   value="124" channel="cool"  width={80} />
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   LAYER IV — CULTURAL
   STL · ARC · DCY · PRG
   ===================================================== */
function LayerCultural() {
  return (
    <div className="axiom-module" style={{ "--axiom-ch": ARCH_AMBER }}>
      <div className="arch-layer-header">
        <span className="arch-layer-num">LAYER IV</span>
        <span className="arch-layer-name">Cultural — Style DNA, Archetype Catalog, Decay, Proc Seed</span>
        <span className="arch-layer-wire">DAT · SOC</span>
        <LED on channel="rose"  size={6} /><LED on channel="amber" size={6} />
        <LED on channel="warm"  size={6} /><LED on channel="myth"  size={6} />
      </div>

      <div className="arch-viz-strip" style={{ paddingTop: 10 }}>
        <StyleDNAViz width={280} height={90} />
        <DecayViz    width={200} height={90} />

        <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
          <div style={{ fontFamily: "var(--font-engrave)", fontSize: 8, letterSpacing: "0.2em", color: "var(--ink-dim)" }}>ARCHETYPE CATALOG</div>
          {["FORTRESS","MARKET","TEMPLE","KEEP","GUILD HALL"].map((type, i) => (
            <div key={type} style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <LED on={i < 3} channel={["amber","cool","warm","myth","rose"][i]} size={5} />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: i < 3 ? "var(--ink)" : "var(--ink-dim)", letterSpacing: "0.08em" }}>{type}</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 7, color: "var(--ink-dim)", marginLeft: "auto" }}>
                {[18, 24, 6, 3, 11][i]}
              </span>
            </div>
          ))}
          <Readout label="TOTAL" value="62 types" channel="amber" width={100} />
        </div>
      </div>

      <div className="arch-component-row">
        <div className="arch-component">
          <div className="arch-comp-id">
            <span className="arch-comp-code">STL</span>
            <span className="arch-comp-name">Style DNA Interpreter</span>
            <LED on channel="rose" size={5} />
          </div>
          <div className="arch-comp-controls">
            <Knob label="FRACT" channel="rose"  variant="arc"  size={40} defaultValue={0.65} />
            <Knob label="BLEND" channel="amber" variant="arc"  size={40} defaultValue={0.5} />
            <Knob label="ERA"   channel="warm"  variant="pip"  size={40} defaultValue={0.4} />
          </div>
          <div className="arch-comp-jacks">
            <Jack label="STL" channel="rose"  active /><Jack label="SOC" channel="rose" />
          </div>
        </div>

        <div className="arch-component">
          <div className="arch-comp-id">
            <span className="arch-comp-code">ARC</span>
            <span className="arch-comp-name">Archetype Catalog</span>
            <LED on channel="amber" size={5} />
          </div>
          <div className="arch-comp-controls">
            <Knob label="TYPE"  channel="amber" variant="forge" size={40} ticks={9} defaultValue={0.33} />
            <Knob label="RARE"  channel="myth"  variant="dotted" ticks={5} size={40} defaultValue={0.2} />
            <GateBtn label="INDEX" channel="amber" lit />
          </div>
          <div className="arch-comp-jacks">
            <Jack label="ARC" channel="amber" active /><Jack label="DAT" channel="myth" active />
          </div>
        </div>

        <div className="arch-component">
          <div className="arch-comp-id">
            <span className="arch-comp-code">DCY</span>
            <span className="arch-comp-name">Structural Decay Simulator</span>
            <LED on channel="warm" size={5} />
          </div>
          <div className="arch-comp-controls">
            <Knob label="RATE"  channel="warm"  variant="arc"    size={40} defaultValue={0.3} />
            <Knob label="AGE"   channel="amber" variant="ringed" size={40} defaultValue={0.45} />
            <Knob label="TYPE"  channel="hot"   variant="pip"    size={40} defaultValue={0.25} />
          </div>
          <div className="arch-comp-jacks">
            <Jack label="DCY" channel="warm" active /><Jack label="VIS" channel="myth" />
          </div>
        </div>

        <div className="arch-component">
          <div className="arch-comp-id">
            <span className="arch-comp-code">PRG</span>
            <span className="arch-comp-name">Procedural Seed Generator</span>
            <LED on channel="myth" size={5} />
          </div>
          <div className="arch-comp-controls">
            <Knob label="ENTROPY" channel="myth" variant="forge" size={40} ticks={13} defaultValue={0.72} />
            <Knob label="BIAS"    channel="amber" variant="arc"  size={40} defaultValue={0.5} />
            <GateBtn label="EMIT" channel="myth" lit />
          </div>
          <div className="arch-comp-jacks">
            <Jack label="SED" channel="myth" active /><Jack label="SIM" channel="amber" active />
          </div>
        </div>
      </div>

      <div className="axiom-module-patch">
        <div className="patch-group">
          <div className="patch-group-label">KIT + SPEC OUT</div>
          <div className="patch-group-jacks">
            <Jack label="KIT" channel="myth"  active /><Jack label="SPC" channel="amber" active />
            <Jack label="SED" channel="myth"  active /><Jack label="STL" channel="rose" />
          </div>
        </div>
        <div className="patch-group">
          <div className="patch-group-label">SOC · FACTION IN</div>
          <div className="patch-group-jacks">
            <Jack label="FCT" channel="rose" /><Jack label="LAW" channel="myth" />
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <Readout label="STYLE"   value="IMPERIAL" channel="amber" width={88} />
          <Readout label="DECAY"   value="12%"      channel="warm"  width={64} />
          <Readout label="SEED"    value="0x9C4A"   channel="myth"  width={80} />
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   ARCHITECT MASTER INSTRUMENT PANEL
   ===================================================== */
function ArchitectInstrument() {
  const Rail = () => (
    <div className="axiom-rail">
      {Array.from({ length: 20 }).map((_, i) => <div key={i} className="screw" />)}
    </div>
  );

  return (
    <div className="axiom-page">
      <div style={{ width: "100%", maxWidth: 1060 }}>

        <div style={{
          marginBottom: 20,
          display: "flex", alignItems: "baseline", gap: 20,
          borderBottom: `1px solid ${ARCH_HEX}22`,
          paddingBottom: 16,
        }}>
          <div style={{
            fontFamily: "var(--font-display)", fontSize: 26, letterSpacing: "0.1em",
            fontWeight: 700, textTransform: "uppercase", color: "var(--ink)",
          }}>ARCHITECT · Structure</div>
          <div style={{
            fontFamily: "var(--font-engrave)", fontSize: 10, letterSpacing: "0.22em",
            color: ARCH_AMBER, textShadow: `0 0 8px ${ARCH_AMBER}`,
          }}>
            Module 03 · Department I — WorldConstruction · BSQM Genesis
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 12, alignItems: "center" }}>
            <Readout label="PKG"  value="BSQM-001"               channel="amber" width={90} />
            <Readout label="WIRE" value="SPA · VIS · DAT · SOC"  channel="amber" width={160} />
            <LED on channel="amber" size={8} />
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--signal-amber)", textShadow: "0 0 6px var(--signal-amber)" }}>
              ● STRUCTURE LIVE
            </div>
          </div>
        </div>

        <div className="axiom-rack">
          <Rail />
          <div className="axiom-rack-body">

            <MasterTransport
              moduleId="architect"
              moduleName="ARCHITECT · STRUCTURE"
              moduleColor={ARCH_AMBER}
            />

            <div className="axiom-rack-title" style={{ "--axiom-ch": ARCH_AMBER }}>
              <div style={{ color: ARCH_AMBER, width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {Crests.architect}
              </div>
              <div className="axiom-rack-title-name" style={{ color: ARCH_AMBER, textShadow: `0 0 10px ${ARCH_AMBER}` }}>
                ARCHITECT Signal Chain
              </div>
              <div className="axiom-rack-title-sub">
                WorldConstruction · 16 Standard Components · 4 Layers · Procedural Build Pipeline
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Readout label="MODULE" value="03 · ARCHITECT"    channel="amber" width={120} />
                <Readout label="STATUS" value="ONLINE"            channel="life"  width={70} />
              </div>
              <LED on channel="life" size={8} />
            </div>

            <div className="arch-status-bar">
              <Readout label="STRUCTS"  value="248"       channel="amber" width={72} />
              <Readout label="STYLE"    value="IMPERIAL"  channel="amber" width={88} />
              <Readout label="FLOORS"   value="1–12"      channel="cool"  width={64} />
              <Readout label="DISTRICTS" value="8"        channel="amber" width={80} />
              <Readout label="STREETS"  value="124"       channel="cool"  width={72} />
              <Readout label="SEED"     value="0xA3F2"    channel="myth"  width={80} />
              <Readout label="DECAY"    value="12%"       channel="warm"  width={64} />
              <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
                {["PSG","BPL","GRM","WFR","FND","WLS","RFG","OPN","DST","STR","PLZ","DNS","STL","ARC","DCY","PRG"].map((code, i) => (
                  <div key={code} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                    <LED on={i < 12} channel={["amber","amber","cool","myth","amber","amber","amber","cool","amber","cool","life","amber","rose","amber","warm","myth"][i]} size={5} />
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 6, color: "var(--ink-dim)", letterSpacing: "0.06em" }}>{code}</span>
                  </div>
                ))}
              </div>
            </div>

            <LayerBlueprint />
            <LayerStructural />
            <LayerLayout />
            <LayerCultural />

          </div>
          <Rail />
        </div>

        <div style={{
          marginTop: 16, display: "flex", gap: 24, flexWrap: "wrap",
          fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-mid)", letterSpacing: "0.08em",
        }}>
          {[
            { color: ARCH_AMBER,                label: "SPA · Spatial layout + placement" },
            { color: "var(--signal-myth)",       label: "VIS · Visual kit → Lighting/Modeling" },
            { color: "var(--signal-cool)",       label: "DAT · StructuralSpec → Forge" },
            { color: "var(--signal-rose)",       label: "SOC · FactionState cultural input" },
            { color: "var(--signal-warm)",       label: "DCY · Structural decay output" },
          ].map(({ color, label }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ color, textShadow: `0 0 4px ${color}`, fontSize: 16 }}>━</span>
              {label}
            </div>
          ))}
          <div style={{ marginLeft: "auto", fontFamily: "var(--font-engrave)", fontSize: 9, letterSpacing: "0.18em", color: "var(--ink-dim)" }}>
            BSQM·MODULES·GENESIS·V1.0 · Package bsqm-modules-001 · 03/16 Mythos Containers
          </div>
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<ArchitectInstrument />);
