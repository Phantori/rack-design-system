/* =====================================================
   LOOM · Module 06 · Choreography
   Department II — Character
   BSQM Genesis Package · bsqm-modules-001
   16 Standard Components · 4 Layers

   Layer I   — Sequence : KFR · CRV · TRK · TML
   Layer II  — Motion   : MCP · BLD · STM · RTP
   Layer III — Gesture  : GST · EMO · PRX · SYN
   Layer IV  — Path     : PTH · AGN · FRM · CRD

   IN  : AnimationRig(spatial/Animus) ·
         NarrativeMood(narrative/Story) ·
         FactionState(social) ·
         SimTick(temporal)
   OUT : AnimationClip(spatial/→*) ·
         MotionPath(spatial/→Behavior) ·
         GesturePacket(social/→Society) ·
         PoseState(spatial/→Behavior)
   ===================================================== */

const { useState: useLmS, useEffect: useLmE, useRef: useLmR } = React;

const LOOM_COLOR = "var(--ch06-loom)";
const LOOM_HEX   = "#dc3c78";
const LOOM_RGB   = "220,60,120";

/* =====================================================
   TIMELINE VISUALIZER — multi-track keyframe editor (KFR / TRK)
   ===================================================== */
function TimelineViz({ width = 440, height = 100 }) {
  const ref = useLmR(null);
  const dataRef = useLmR(null);

  useLmE(() => {
    const W = width * 2, H = height * 2;
    const tracks = [
      { name: "ROOT",   keys: [0.04, 0.2, 0.45, 0.72, 0.9],  color: [220, 60, 120] },
      { name: "SPINE",  keys: [0.08, 0.28, 0.5,  0.68],       color: [255, 100, 60]  },
      { name: "LARM",   keys: [0.12, 0.35, 0.55, 0.8],        color: [80,  200, 255] },
      { name: "RARM",   keys: [0.1,  0.32, 0.6,  0.78],       color: [80,  200, 255] },
      { name: "LLEG",   keys: [0.15, 0.38, 0.62, 0.85],       color: [120, 255, 160] },
      { name: "RLEG",   keys: [0.18, 0.42, 0.65, 0.88],       color: [120, 255, 160] },
      { name: "FACE",   keys: [0.05, 0.25, 0.52, 0.75, 0.92], color: [220, 60, 120]  },
    ];
    dataRef.current = { tracks, W, H, playhead: 0 };
  }, []);

  useFrame((t) => {
    const c = ref.current; if (!c) return;
    const d = dataRef.current; if (!d) return;
    const ctx = c.getContext("2d");
    const { W, H, tracks } = d;
    ctx.clearRect(0, 0, W, H);

    ctx.fillStyle = "#040208";
    ctx.fillRect(0, 0, W, H);

    const labelW = 56;
    const timeW  = W - labelW - 10;
    const trackH = (H - 16) / tracks.length;
    const barStart = 8;

    // Beat grid
    const beats = 16;
    for (let b = 0; b <= beats; b++) {
      const bx = labelW + (b / beats) * timeW;
      const isMeasure = b % 4 === 0;
      ctx.strokeStyle = isMeasure
        ? `rgba(${LOOM_RGB},0.12)`
        : `rgba(${LOOM_RGB},0.04)`;
      ctx.lineWidth = isMeasure ? 1 : 0.5;
      ctx.beginPath(); ctx.moveTo(bx, barStart); ctx.lineTo(bx, H - barStart); ctx.stroke();
      if (isMeasure) {
        ctx.fillStyle = `rgba(${LOOM_RGB},0.2)`;
        ctx.font = "7px 'JetBrains Mono'";
        ctx.textAlign = "center";
        ctx.fillText(`${b / 4 + 1}`, bx, barStart - 1);
      }
    }
    ctx.textAlign = "left";

    // Tracks
    tracks.forEach((tr, ti) => {
      const ty = barStart + ti * trackH;
      const [r, g, b2] = tr.color;

      // Track lane bg
      ctx.fillStyle = ti % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent";
      ctx.fillRect(labelW, ty, timeW, trackH);

      // Track label
      ctx.fillStyle = `rgba(${r},${g},${b2},0.55)`;
      ctx.font = "8px 'JetBrains Mono'";
      ctx.fillText(tr.name, 4, ty + trackH * 0.62);

      // Curve baseline
      ctx.strokeStyle = `rgba(${r},${g},${b2},0.1)`;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(labelW, ty + trackH * 0.5);
      ctx.lineTo(labelW + timeW, ty + trackH * 0.5);
      ctx.stroke();

      // Curve between keyframes
      ctx.strokeStyle = `rgba(${r},${g},${b2},0.25)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      tr.keys.forEach((k, ki) => {
        const kx = labelW + k * timeW;
        const ky = ty + trackH * 0.5;
        if (ki === 0) ctx.moveTo(kx, ky);
        else {
          const prev = labelW + tr.keys[ki-1] * timeW;
          ctx.bezierCurveTo(
            prev + (kx - prev) * 0.5, ty + trackH * 0.15,
            prev + (kx - prev) * 0.5, ty + trackH * 0.85,
            kx, ky
          );
        }
      });
      ctx.stroke();

      // Keyframe diamonds
      tr.keys.forEach(k => {
        const kx = labelW + k * timeW;
        const ky = ty + trackH * 0.5;
        const sz = 4;
        ctx.save();
        ctx.translate(kx, ky);
        ctx.rotate(Math.PI / 4);
        ctx.fillStyle = `rgba(${r},${g},${b2},0.85)`;
        ctx.shadowColor = `rgba(${r},${g},${b2},0.6)`;
        ctx.shadowBlur = 5;
        ctx.fillRect(-sz / 2, -sz / 2, sz, sz);
        ctx.restore();
      });
    });

    // Playhead
    const ph = (t * 0.12) % 1;
    d.playhead = ph;
    const phX = labelW + ph * timeW;
    ctx.strokeStyle = `rgba(${LOOM_RGB},0.8)`;
    ctx.lineWidth = 1.5;
    ctx.shadowColor = `rgba(${LOOM_RGB},0.5)`;
    ctx.shadowBlur = 6;
    ctx.beginPath(); ctx.moveTo(phX, barStart); ctx.lineTo(phX, H - barStart); ctx.stroke();
    ctx.shadowBlur = 0;
    // Playhead triangle
    ctx.fillStyle = `rgba(${LOOM_RGB},0.9)`;
    ctx.beginPath();
    ctx.moveTo(phX - 5, barStart);
    ctx.lineTo(phX + 5, barStart);
    ctx.lineTo(phX, barStart + 8);
    ctx.fill();

    // Time readout
    const frameNum = Math.floor(ph * 120);
    ctx.fillStyle = `rgba(${LOOM_RGB},0.4)`;
    ctx.font = "8px 'JetBrains Mono'";
    ctx.fillText(`${Math.floor(frameNum / 30).toString().padStart(2,"0")}:${(frameNum % 30).toString().padStart(2,"0")}`, W - 50, H - 2);
  }, []);

  return (
    <div className="viz mat-screen" style={{ width, height, flexShrink: 0 }}>
      <canvas ref={ref} width={width * 2} height={height * 2}
              style={{ width: "100%", height: "100%" }} />
      <div className="viz-label engrave">TIMELINE · 7 TRACKS · 16 BEATS</div>
    </div>
  );
}

/* =====================================================
   BLEND TREE VISUALIZER — animation state graph (BLD / STM)
   ===================================================== */
function BlendTreeViz({ width = 280, height = 180 }) {
  const ref = useLmR(null);
  const dataRef = useLmR(null);

  useLmE(() => {
    const W = width * 2, H = height * 2;
    const nodes = [
      { id: "IDLE",  x: W*0.15, y: H*0.5,  label: "IDLE",   color: [120,255,160], weight: 0.0 },
      { id: "WALK",  x: W*0.42, y: H*0.28, label: "WALK",   color: [80, 200,255], weight: 0.0 },
      { id: "RUN",   x: W*0.68, y: H*0.18, label: "RUN",    color: [255,160,40],  weight: 0.0 },
      { id: "CROUCH",x: W*0.42, y: H*0.72, label: "CROUCH", color: [220,60, 120], weight: 0.0 },
      { id: "JUMP",  x: W*0.72, y: H*0.55, label: "JUMP",   color: [255,220,60],  weight: 0.0 },
      { id: "ATTACK",x: W*0.85, y: H*0.82, label: "ATCK",   color: [255,80, 60],  weight: 0.0 },
      // Blend node
      { id: "BLEND", x: W*0.5,  y: H*0.5,  label: "BLEND",  color: [220,60, 120], isBlend: true },
    ];
    const edges = [
      ["IDLE","BLEND"], ["WALK","BLEND"], ["RUN","WALK"],
      ["CROUCH","BLEND"], ["JUMP","BLEND"], ["ATTACK","JUMP"],
    ];
    dataRef.current = { nodes, edges, W, H, activeIdx: 0 };
  }, []);

  useFrame((t) => {
    const c = ref.current; if (!c) return;
    const d = dataRef.current; if (!d) return;
    const ctx = c.getContext("2d");
    const { W, H, nodes, edges } = d;
    ctx.clearRect(0, 0, W, H);

    ctx.fillStyle = "#040208";
    ctx.fillRect(0, 0, W, H);

    // Animated blend weights cycling
    const cycle = (t * 0.15) % nodes.length;
    nodes.forEach((n, i) => {
      const dist = Math.abs(((cycle - i) + nodes.length) % nodes.length);
      n.weight = Math.max(0, 1 - dist * 0.6);
    });
    const blendNode = nodes.find(n => n.id === "BLEND");
    if (blendNode) blendNode.weight = 1.0;

    // Edges
    edges.forEach(([fromId, toId]) => {
      const from = nodes.find(n => n.id === fromId);
      const to   = nodes.find(n => n.id === toId);
      if (!from || !to) return;
      const flow = (from.weight + to.weight) * 0.5;
      ctx.strokeStyle = `rgba(${LOOM_RGB},${0.1 + flow * 0.4})`;
      ctx.lineWidth = 0.8 + flow * 1.5;
      ctx.shadowColor = `rgba(${LOOM_RGB},${flow * 0.4})`;
      ctx.shadowBlur = flow * 6;
      ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(to.x, to.y); ctx.stroke();
      ctx.shadowBlur = 0;

      // Arrow head
      if (flow > 0.2) {
        const angle = Math.atan2(to.y - from.y, to.x - from.x);
        const mx = (from.x + to.x) * 0.5, my = (from.y + to.y) * 0.5;
        ctx.fillStyle = `rgba(${LOOM_RGB},${flow * 0.6})`;
        ctx.save();
        ctx.translate(mx, my);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(5, 0); ctx.lineTo(-4, -3); ctx.lineTo(-4, 3);
        ctx.closePath(); ctx.fill();
        ctx.restore();
      }
    });

    // Nodes
    nodes.forEach(n => {
      const [r, g, b2] = n.color;
      const w = n.weight || 0;
      const nodeR = n.isBlend ? 18 : 12;

      ctx.beginPath(); ctx.arc(n.x, n.y, nodeR + w * 4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b2},${0.08 + w * 0.15})`;
      ctx.fill();

      ctx.beginPath(); ctx.arc(n.x, n.y, nodeR, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${r},${g},${b2},${0.4 + w * 0.5})`;
      ctx.lineWidth = n.isBlend ? 2 : 1.2;
      ctx.shadowColor = `rgba(${r},${g},${b2},${w * 0.5})`;
      ctx.shadowBlur = w * 10;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Weight fill
      if (w > 0.05) {
        ctx.beginPath(); ctx.arc(n.x, n.y, nodeR * w, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b2},${w * 0.5})`;
        ctx.fill();
      }

      ctx.fillStyle = `rgba(${r},${g},${b2},${0.6 + w * 0.4})`;
      ctx.font = `${n.isBlend ? 9 : 8}px 'JetBrains Mono'`;
      ctx.textAlign = "center";
      ctx.fillText(n.label, n.x, n.y + nodeR + 10);
      if (w > 0.1) {
        ctx.fillStyle = `rgba(${r},${g},${b2},0.5)`;
        ctx.font = "7px 'JetBrains Mono'";
        ctx.fillText(`${Math.round(w * 100)}%`, n.x, n.y + 4);
      }
    });
    ctx.textAlign = "left";
  }, []);

  return (
    <div className="viz mat-screen" style={{ width, height, flexShrink: 0 }}>
      <canvas ref={ref} width={width * 2} height={height * 2}
              style={{ width: "100%", height: "100%" }} />
      <div className="viz-label engrave">BLEND TREE · STATE GRAPH</div>
    </div>
  );
}

/* =====================================================
   EMOTION WHEEL VISUALIZER — affect driver (EMO / GST)
   ===================================================== */
function EmotionWheelViz({ width = 180, height = 180 }) {
  const ref = useLmR(null);
  const dataRef = useLmR(null);

  useLmE(() => {
    const emotions = [
      { name: "JOY",      color: [255, 220, 40],  angle: 0 },
      { name: "TRUST",    color: [120, 255, 160],  angle: Math.PI / 3 },
      { name: "FEAR",     color: [100, 180, 255],  angle: Math.PI * 2 / 3 },
      { name: "SURPRISE", color: [220, 60, 120],   angle: Math.PI },
      { name: "SADNESS",  color: [60, 120, 220],   angle: Math.PI * 4 / 3 },
      { name: "DISGUST",  color: [140, 220, 60],   angle: Math.PI * 5 / 3 },
      { name: "ANGER",    color: [255, 60, 60],    angle: Math.PI * 7 / 6 },
      { name: "ANTICIP",  color: [255, 140, 40],   angle: Math.PI / 6 },
    ];
    dataRef.current = { emotions, activeIdx: 0 };
  }, []);

  useFrame((t) => {
    const c = ref.current; if (!c) return;
    const d = dataRef.current; if (!d) return;
    const ctx = c.getContext("2d");
    const W = c.width, H = c.height;
    ctx.clearRect(0, 0, W, H);

    ctx.fillStyle = "#030208";
    ctx.fillRect(0, 0, W, H);

    const { emotions } = d;
    const cx = W / 2, cy = H / 2;
    const outerR = Math.min(W, H) * 0.42;
    const innerR = outerR * 0.28;

    // Active emotion cycles
    const activeIdx = Math.floor((t * 0.25) % emotions.length);

    // Spoke rings
    [0.28, 0.55, 0.85].forEach(rf => {
      ctx.beginPath();
      ctx.arc(cx, cy, outerR * rf, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${LOOM_RGB},0.07)`;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    });

    // Spokes
    emotions.forEach(em => {
      ctx.strokeStyle = `rgba(${LOOM_RGB},0.06)`;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(em.angle) * outerR, cy + Math.sin(em.angle) * outerR);
      ctx.stroke();
    });

    // Emotion segments
    emotions.forEach((em, i) => {
      const isActive = i === activeIdx;
      const nextAngle = emotions[(i + 1) % emotions.length].angle;
      const [r, g, b2] = em.color;
      const pulse = isActive ? 1 : 0.25 + Math.sin(t * 0.3 + i) * 0.1;

      // Filled arc segment
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, outerR * (isActive ? 0.92 : 0.78), em.angle, nextAngle > em.angle ? nextAngle : nextAngle + Math.PI * 2 / emotions.length);
      ctx.closePath();
      ctx.fillStyle = `rgba(${r},${g},${b2},${0.06 + pulse * 0.12})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(${r},${g},${b2},${0.25 + pulse * 0.4})`;
      ctx.lineWidth = isActive ? 1.5 : 0.8;
      if (isActive) { ctx.shadowColor = `rgba(${r},${g},${b2},0.5)`; ctx.shadowBlur = 8; }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Dot at rim
      const dotR = isActive ? outerR * 0.88 : outerR * 0.75;
      const dotAngle = em.angle + Math.PI / emotions.length;
      const dx = cx + Math.cos(dotAngle) * dotR;
      const dy = cy + Math.sin(dotAngle) * dotR;
      ctx.beginPath(); ctx.arc(dx, dy, isActive ? 6 : 3.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b2},${0.5 + pulse * 0.5})`;
      ctx.shadowColor = `rgba(${r},${g},${b2},${pulse * 0.6})`;
      ctx.shadowBlur = isActive ? 10 : 4;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Label
      const labelR = outerR * 1.05;
      const lx = cx + Math.cos(dotAngle) * labelR;
      const ly = cy + Math.sin(dotAngle) * labelR;
      ctx.fillStyle = `rgba(${r},${g},${b2},${isActive ? 0.9 : 0.35})`;
      ctx.font = `${isActive ? 9 : 7}px 'JetBrains Mono'`;
      ctx.textAlign = "center";
      ctx.fillText(em.name.slice(0, 5), lx, ly + 3);
    });

    // Inner core
    const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, innerR);
    const [ar, ag, ab] = emotions[activeIdx].color;
    coreGrad.addColorStop(0, `rgba(${ar},${ag},${ab},0.3)`);
    coreGrad.addColorStop(1, `rgba(${ar},${ag},${ab},0.05)`);
    ctx.fillStyle = coreGrad;
    ctx.beginPath(); ctx.arc(cx, cy, innerR, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = `rgba(${ar},${ag},${ab},0.8)`;
    ctx.font = "9px 'JetBrains Mono'";
    ctx.textAlign = "center";
    ctx.fillText(emotions[activeIdx].name.slice(0, 5), cx, cy + 4);
    ctx.textAlign = "left";
  }, []);

  return (
    <div className="viz mat-screen" style={{ width, height, flexShrink: 0 }}>
      <canvas ref={ref} width={width * 2} height={height * 2}
              style={{ width: "100%", height: "100%" }} />
      <div className="viz-label engrave">EMOTION WHEEL · AFFECT</div>
    </div>
  );
}

/* =====================================================
   MOTION PATH VISUALIZER — agent navigation (PTH / AGN)
   ===================================================== */
function MotionPathViz({ width = 320, height = 180 }) {
  const ref = useLmR(null);
  const dataRef = useLmR(null);

  useLmE(() => {
    const W = width * 2, H = height * 2;
    // Bezier control points for path
    const pathPts = [
      { x: W*0.08, y: H*0.5  },
      { x: W*0.22, y: H*0.2  },
      { x: W*0.42, y: H*0.75 },
      { x: W*0.58, y: H*0.25 },
      { x: W*0.75, y: H*0.6  },
      { x: W*0.92, y: H*0.4  },
    ];
    // Waypoint markers
    const waypoints = pathPts.map((p, i) => ({
      ...p,
      label: `WP${i + 1}`,
      action: ["START","TURN","PAUSE","TURN","ARRIVE","END"][i] || "PASS",
    }));
    // Formation agents
    const agents = Array.from({ length: 5 }, (_, i) => ({
      offset: i * 0.08,
      color: [
        [220, 60, 120],
        [255, 140, 40],
        [120, 255, 160],
        [80,  200, 255],
        [255, 220, 60],
      ][i],
      formation: i,
    }));
    dataRef.current = { pathPts, waypoints, agents, W, H };
  }, []);

  useFrame((t) => {
    const c = ref.current; if (!c) return;
    const d = dataRef.current; if (!d) return;
    const ctx = c.getContext("2d");
    const { W, H, pathPts, waypoints, agents } = d;
    ctx.clearRect(0, 0, W, H);

    ctx.fillStyle = "#030508";
    ctx.fillRect(0, 0, W, H);

    // Ground grid
    ctx.strokeStyle = `rgba(${LOOM_RGB},0.04)`;
    ctx.lineWidth = 0.5;
    for (let gx = 0; gx < W; gx += W / 12) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();
    }
    for (let gy = 0; gy < H; gy += H / 8) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();
    }

    // Bezier path helper
    const getPathPos = (u) => {
      const n = pathPts.length - 1;
      const seg = Math.min(Math.floor(u * n), n - 1);
      const t2 = (u * n) - seg;
      const p0 = pathPts[seg], p1 = pathPts[seg + 1];
      return {
        x: p0.x + (p1.x - p0.x) * t2,
        y: p0.y + (p1.y - p0.y) * t2,
      };
    };

    // Draw path curve
    ctx.beginPath();
    for (let i = 0; i <= 120; i++) {
      const pos = getPathPos(i / 120);
      if (i === 0) ctx.moveTo(pos.x, pos.y);
      else ctx.lineTo(pos.x, pos.y);
    }
    ctx.strokeStyle = `rgba(${LOOM_RGB},0.25)`;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Path glow
    ctx.beginPath();
    for (let i = 0; i <= 120; i++) {
      const pos = getPathPos(i / 120);
      if (i === 0) ctx.moveTo(pos.x, pos.y);
      else ctx.lineTo(pos.x, pos.y);
    }
    ctx.strokeStyle = `rgba(${LOOM_RGB},0.06)`;
    ctx.lineWidth = 8;
    ctx.stroke();

    // Waypoints
    waypoints.forEach((wp, i) => {
      ctx.beginPath(); ctx.arc(wp.x, wp.y, 7, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${LOOM_RGB},0.6)`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = `rgba(${LOOM_RGB},0.1)`;
      ctx.fill();
      ctx.fillStyle = `rgba(${LOOM_RGB},0.5)`;
      ctx.font = "7px 'JetBrains Mono'";
      ctx.textAlign = "center";
      ctx.fillText(wp.label, wp.x, wp.y - 11);
      ctx.fillStyle = `rgba(${LOOM_RGB},0.3)`;
      ctx.fillText(wp.action, wp.x, wp.y + 18);
    });

    // Agents moving along path
    const speed = t * 0.1;
    agents.forEach(ag => {
      const u = ((speed + ag.offset) % 1);
      const pos = getPathPos(u);
      const ahead = getPathPos(Math.min(1, u + 0.02));

      // Formation spread perpendicular to path direction
      const dx = ahead.x - pos.x, dy = ahead.y - pos.y;
      const len = Math.hypot(dx, dy) || 1;
      const perp = { x: -dy / len, y: dx / len };
      const spread = (ag.formation - 2) * 16;

      const ax = pos.x + perp.x * spread;
      const ay = pos.y + perp.y * spread;

      const [r, g2, b2] = ag.color;

      // Trail
      for (let tr = 1; tr <= 5; tr++) {
        const tu = Math.max(0, u - tr * 0.012);
        const tp = getPathPos(tu);
        const trx = tp.x + perp.x * spread;
        const try2 = tp.y + perp.y * spread;
        ctx.beginPath(); ctx.arc(trx, try2, 2.5 - tr * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g2},${b2},${0.3 - tr * 0.05})`;
        ctx.fill();
      }

      // Agent circle
      ctx.beginPath(); ctx.arc(ax, ay, 5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g2},${b2},0.85)`;
      ctx.shadowColor = `rgba(${r},${g2},${b2},0.6)`;
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Direction arrow
      const headingAngle = Math.atan2(dy, dx);
      ctx.save();
      ctx.translate(ax, ay);
      ctx.rotate(headingAngle);
      ctx.fillStyle = `rgba(${r},${g2},${b2},0.7)`;
      ctx.beginPath();
      ctx.moveTo(8, 0); ctx.lineTo(3, -3); ctx.lineTo(3, 3);
      ctx.closePath(); ctx.fill();
      ctx.restore();
    });
    ctx.textAlign = "left";
  }, []);

  return (
    <div className="viz mat-screen" style={{ width, height, flexShrink: 0 }}>
      <canvas ref={ref} width={width * 2} height={height * 2}
              style={{ width: "100%", height: "100%" }} />
      <div className="viz-label engrave">MOTION PATH · 5 AGENTS · FORMATION</div>
    </div>
  );
}

/* =====================================================
   CROWD DIRECTOR VISUALIZER — formation / swarm (FRM / CRD)
   ===================================================== */
function CrowdViz({ width = 360, height = 80 }) {
  const ref = useLmR(null);
  const dataRef = useLmR(null);

  useLmE(() => {
    const W = width * 2, H = height * 2;
    const agents = Array.from({ length: 40 }, (_, i) => {
      const col = i % 8, row = Math.floor(i / 8);
      return {
        id: i,
        x: W * 0.08 + col * W * 0.11,
        y: H * 0.18 + row * H * 0.18,
        vx: 0, vy: 0,
        phase: Math.random() * Math.PI * 2,
        color: i % 5 === 0 ? [220, 60, 120] : [LOOM_RGB.split(",").map(Number)][0],
        role: i < 8 ? "lead" : i < 24 ? "follow" : "crowd",
      };
    });
    dataRef.current = { agents, W, H, formation: "GRID" };
  }, []);

  useFrame((t) => {
    const c = ref.current; if (!c) return;
    const d = dataRef.current; if (!d) return;
    const ctx = c.getContext("2d");
    const { W, H, agents } = d;
    ctx.clearRect(0, 0, W, H);

    ctx.fillStyle = "#030208";
    ctx.fillRect(0, 0, W, H);

    // Formation cycle: GRID → CIRCLE → WEDGE → SCATTER
    const formPhase = Math.floor(t * 0.08) % 4;
    const formNames = ["GRID", "CIRCLE", "WEDGE", "SCATTER"];
    const formT = (t * 0.08) % 1;

    agents.forEach((ag, i) => {
      let tx, ty;
      const col = i % 8, row = Math.floor(i / 8);

      if (formPhase === 0) {
        // Grid
        tx = W * 0.08 + col * W * 0.115;
        ty = H * 0.2  + row * H * 0.18;
      } else if (formPhase === 1) {
        // Circle
        const angle = (i / agents.length) * Math.PI * 2;
        const r = Math.min(W, H) * 0.36;
        tx = W * 0.5 + Math.cos(angle) * r;
        ty = H * 0.5 + Math.sin(angle) * r * 0.6;
      } else if (formPhase === 2) {
        // Wedge
        tx = W * 0.1 + row * W * 0.22 + col * W * 0.012;
        ty = H * 0.5 + (col - 4) * H * 0.12 * (1 - row * 0.18);
      } else {
        // Scatter
        tx = W * 0.1 + (Math.sin(i * 3.7 + t * 0.05) * 0.5 + 0.5) * W * 0.8;
        ty = H * 0.1 + (Math.cos(i * 2.3 + t * 0.07) * 0.5 + 0.5) * H * 0.8;
      }

      // Lerp towards target
      ag.x += (tx - ag.x) * 0.04;
      ag.y += (ty - ag.y) * 0.04;

      const isLead = ag.role === "lead";
      const r2 = isLead ? 220 : 120;
      const g2 = isLead ? 60 : 160;
      const b2 = isLead ? 120 : 220;

      // Agent dot
      const pulse = 0.7 + Math.sin(t * 0.8 + ag.phase) * 0.3;
      ctx.beginPath(); ctx.arc(ag.x, ag.y, isLead ? 4.5 : 2.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r2},${g2},${b2},${0.7 * pulse})`;
      if (isLead) {
        ctx.shadowColor = `rgba(${LOOM_RGB},0.5)`;
        ctx.shadowBlur = 6;
      }
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // Formation label
    ctx.fillStyle = `rgba(${LOOM_RGB},0.35)`;
    ctx.font = "9px 'JetBrains Mono'";
    ctx.fillText(`FRM · ${formNames[formPhase]}`, 6, H - 4);
    // Agent count
    ctx.fillStyle = `rgba(${LOOM_RGB},0.2)`;
    ctx.fillText(`${agents.length} AGENTS`, W - 80, H - 4);
  }, []);

  return (
    <div className="viz mat-screen" style={{ width, height, flexShrink: 0 }}>
      <canvas ref={ref} width={width * 2} height={height * 2}
              style={{ width: "100%", height: "100%" }} />
      <div className="viz-label engrave">CROWD DIRECTOR · FORMATION ENGINE</div>
    </div>
  );
}

/* =====================================================
   LAYER I — SEQUENCE
   KFR · CRV · TRK · TML
   ===================================================== */
function LayerSequence() {
  return (
    <div className="axiom-module" style={{ "--axiom-ch": LOOM_HEX }}>
      <div className="loom-layer-header">
        <span className="loom-layer-num">LAYER I</span>
        <span className="loom-layer-name">Sequence — Keyframe, Curves, Tracks, Timeline</span>
        <span className="loom-layer-wire">SPA · TMP</span>
        <LED on channel="rose" size={6} /><LED on channel="rose" size={6} />
        <LED on channel="cool" size={6} /><LED channel="rose"   size={6} />
      </div>

      <div className="loom-viz-strip" style={{ paddingTop: 10 }}>
        <TimelineViz width={440} height={100} />

        <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
          <div style={{ fontFamily: "var(--font-engrave)", fontSize: 8, letterSpacing: "0.2em", color: "var(--ink-dim)" }}>CLIP CURVE</div>
          <CurveEditor width={160} height={60} channel="rose" label="" />
          <div style={{ display: "flex", gap: 6, marginTop: 2 }}>
            <Readout label="FRAMES" value="120"    channel="rose" width={66} />
            <Readout label="FPS"    value="30"     channel="cool" width={52} />
            <Readout label="BPM"    value="120"    channel="myth" width={56} />
          </div>
          <VU width={168} height={10} channel="rose" label="CLIP DENSITY" />
        </div>
      </div>

      <div className="loom-component-row">
        <div className="loom-component">
          <div className="loom-comp-id">
            <span className="loom-comp-code">KFR</span>
            <span className="loom-comp-name">Keyframe Engine</span>
            <LED on channel="rose" size={5} />
          </div>
          <div className="loom-comp-controls">
            <Knob label="INTERP"  channel="rose"  variant="forge" size={40} ticks={9} defaultValue={0.5} />
            <Knob label="EASE"    channel="cool"  variant="arc"   size={40} defaultValue={0.65} />
            <Knob label="SNAP"    channel="myth"  variant="pip"   size={40} defaultValue={0.3} />
          </div>
          <div className="loom-comp-jacks">
            <Jack label="KEY" channel="rose" active /><Jack label="CRV" channel="cool" />
          </div>
        </div>

        <div className="loom-component">
          <div className="loom-comp-id">
            <span className="loom-comp-code">CRV</span>
            <span className="loom-comp-name">Curve Editor</span>
            <LED on channel="rose" size={5} />
          </div>
          <div className="loom-comp-controls">
            <Knob label="TENSION"  channel="rose"  variant="arc"    size={40} defaultValue={0.55} />
            <Knob label="BIAS"     channel="cool"  variant="dotted" ticks={7} size={40} defaultValue={0.5} />
            <Switch positions={3} labels={["BEZ","LIN","STP"]} channel="rose" />
          </div>
          <div className="loom-comp-jacks">
            <Jack label="CRV" channel="rose" active /><Jack label="OUT" channel="cool" />
          </div>
        </div>

        <div className="loom-component">
          <div className="loom-comp-id">
            <span className="loom-comp-code">TRK</span>
            <span className="loom-comp-name">Track Mixer</span>
            <LED on channel="cool" size={5} />
          </div>
          <div className="loom-comp-controls">
            <Knob label="MIX"     channel="rose"  variant="arc" size={40} defaultValue={0.75} />
            <Knob label="OFFSET"  channel="cool"  variant="arc" size={40} defaultValue={0.0} />
            <GateBtn label="SOLO" channel="rose" lit />
          </div>
          <div className="loom-comp-jacks">
            <Jack label="TRK" channel="cool" active /><Jack label="MXD" channel="rose" />
          </div>
        </div>

        <div className="loom-component">
          <div className="loom-comp-id">
            <span className="loom-comp-code">TML</span>
            <span className="loom-comp-name">Timeline Mapper</span>
            <LED on channel="myth" size={5} />
          </div>
          <div className="loom-comp-controls">
            <Knob label="SPEED"   channel="rose"  variant="arc"  size={40} defaultValue={0.5} />
            <Knob label="LOOP"    channel="cool"  variant="pip"  size={40} defaultValue={0.8} />
            <GateBtn label="LOCK"  channel="myth" lit />
          </div>
          <div className="loom-comp-jacks">
            <Jack label="TML" channel="myth" active /><Jack label="TMP" channel="rose" active />
          </div>
        </div>
      </div>

      <div className="axiom-module-patch">
        <div className="patch-group">
          <div className="patch-group-label">CLIP OUT</div>
          <div className="patch-group-jacks">
            <Jack label="KEY" channel="rose" active /><Jack label="CRV" channel="rose" active />
            <Jack label="TML" channel="myth" active />
          </div>
        </div>
        <div className="patch-group">
          <div className="patch-group-label">TEMPO IN</div>
          <div className="patch-group-jacks">
            <Jack label="BPM" channel="cool" /><Jack label="TMP" channel="rose" active />
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <Readout label="FRAMES" value="120"  channel="rose" width={70} />
          <Readout label="TRACKS" value="7"    channel="cool" width={58} />
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   LAYER II — MOTION
   MCP · BLD · STM · RTP
   ===================================================== */
function LayerMotion() {
  return (
    <div className="axiom-module" style={{ "--axiom-ch": LOOM_HEX }}>
      <div className="loom-layer-header">
        <span className="loom-layer-num">LAYER II</span>
        <span className="loom-layer-name">Motion — MoCap, Blend Tree, State Machine, Retarget</span>
        <span className="loom-layer-wire">SPA · VIS</span>
        <LED on channel="rose" size={6} /><LED on channel="rose" size={6} />
        <LED on channel="rose" size={6} /><LED on channel="rose" size={6} />
      </div>

      <div className="loom-viz-strip" style={{ paddingTop: 10 }}>
        <BlendTreeViz width={280} height={180} />

        <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
          <div style={{ fontFamily: "var(--font-engrave)", fontSize: 8, letterSpacing: "0.2em", color: "var(--ink-dim)" }}>MOCAP STREAM</div>
          <Scope width={280} height={52} channel="rose" label="" />
          <div style={{ display: "flex", gap: 6 }}>
            <Readout label="CLIP"   value="WALK-A01" channel="rose" width={88} />
            <Readout label="FRAME"  value="042/120"  channel="cool" width={80} />
          </div>

          <div style={{ fontFamily: "var(--font-engrave)", fontSize: 8, letterSpacing: "0.2em", color: "var(--ink-dim)", marginTop: 4 }}>STATE MACHINE</div>
          <Spectrum width={280} height={36} bands={14} channel="rose" label="" />
          <div style={{ display: "flex", gap: 6 }}>
            <Readout label="STATE"  value="WALK"     channel="rose" width={72} />
            <Readout label="NEXT"   value="RUN"      channel="cool" width={64} />
            <Readout label="BLEND"  value="0.32"     channel="myth" width={64} />
          </div>
        </div>
      </div>

      <div className="loom-component-row">
        <div className="loom-component">
          <div className="loom-comp-id">
            <span className="loom-comp-code">MCP</span>
            <span className="loom-comp-name">Motion Capture</span>
            <LED on channel="rose" size={5} />
          </div>
          <div className="loom-comp-controls">
            <Knob label="CLEAN"   channel="rose"  variant="forge" size={40} ticks={9} defaultValue={0.7} />
            <Knob label="REDUCE"  channel="cool"  variant="arc"   size={40} defaultValue={0.45} />
            <Knob label="OFFSET"  channel="myth"  variant="pip"   size={40} defaultValue={0.0} />
          </div>
          <div className="loom-comp-jacks">
            <Jack label="MCP" channel="rose" active /><Jack label="RIG" channel="cool" />
          </div>
        </div>

        <div className="loom-component">
          <div className="loom-comp-id">
            <span className="loom-comp-code">BLD</span>
            <span className="loom-comp-name">Blend Tree</span>
            <LED on channel="rose" size={5} />
          </div>
          <div className="loom-comp-controls">
            <Knob label="PARAM-X"  channel="rose"  variant="arc"    size={40} defaultValue={0.32} />
            <Knob label="PARAM-Y"  channel="cool"  variant="dotted" ticks={7} size={40} defaultValue={0.5} />
            <Switch positions={3} labels={["1D","2D","DIR"]} channel="rose" />
          </div>
          <div className="loom-comp-jacks">
            <Jack label="BLD" channel="rose" active /><Jack label="WGT" channel="cool" active />
          </div>
        </div>

        <div className="loom-component">
          <div className="loom-comp-id">
            <span className="loom-comp-code">STM</span>
            <span className="loom-comp-name">State Machine</span>
            <LED on channel="cool" size={5} />
          </div>
          <div className="loom-comp-controls">
            <Knob label="TRANS"   channel="rose"  variant="arc" size={40} defaultValue={0.22} />
            <Knob label="BLEND"   channel="cool"  variant="arc" size={40} defaultValue={0.5} />
            <GateBtn label="TRIGGER" channel="rose" lit />
          </div>
          <div className="loom-comp-jacks">
            <Jack label="STM" channel="cool" active /><Jack label="TRG" channel="rose" />
          </div>
        </div>

        <div className="loom-component">
          <div className="loom-comp-id">
            <span className="loom-comp-code">RTP</span>
            <span className="loom-comp-name">Retarget Engine</span>
            <LED on channel="myth" size={5} />
          </div>
          <div className="loom-comp-controls">
            <Knob label="SCALE"   channel="rose"  variant="arc"  size={40} defaultValue={0.5} />
            <Knob label="MAP"     channel="cool"  variant="pip"  size={40} defaultValue={0.6} />
            <GateBtn label="APPLY" channel="myth" lit />
          </div>
          <div className="loom-comp-jacks">
            <Jack label="RTP" channel="myth" active /><Jack label="OUT" channel="rose" active />
          </div>
        </div>
      </div>

      <div className="axiom-module-patch">
        <div className="patch-group">
          <div className="patch-group-label">MOTION OUT</div>
          <div className="patch-group-jacks">
            <Jack label="MCP" channel="rose"  active /><Jack label="BLD" channel="rose"  active />
            <Jack label="STM" channel="cool"  active /><Jack label="RTP" channel="myth"  active />
          </div>
        </div>
        <div className="patch-group">
          <div className="patch-group-label">RIG IN</div>
          <div className="patch-group-jacks">
            <Jack label="RIG" channel="cool" /><Jack label="WGT" channel="cool" active />
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <Readout label="STATE"  value="WALK"  channel="rose" width={72} />
          <Readout label="CLIPS"  value="6"     channel="cool" width={58} />
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   LAYER III — GESTURE
   GST · EMO · PRX · SYN
   ===================================================== */
function LayerGesture() {
  return (
    <div className="axiom-module" style={{ "--axiom-ch": LOOM_HEX }}>
      <div className="loom-layer-header">
        <span className="loom-layer-num">LAYER III</span>
        <span className="loom-layer-name">Gesture — Library, Emotion Driver, Proximity, Sync</span>
        <span className="loom-layer-wire">SOC · NAR</span>
        <LED on channel="rose" size={6} /><LED on channel="rose" size={6} />
        <LED on channel="cool" size={6} /><LED channel="rose"   size={6} />
      </div>

      <div className="loom-viz-strip" style={{ paddingTop: 10 }}>
        <EmotionWheelViz width={180} height={180} />

        <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
          <div style={{ fontFamily: "var(--font-engrave)", fontSize: 8, letterSpacing: "0.2em", color: "var(--ink-dim)" }}>PROXIMITY FIELD</div>
          <XYPad size={100} channel="rose" label="" />
          <div style={{ display: "flex", gap: 6 }}>
            <Readout label="RANGE"  value="4.2m"  channel="rose" width={66} />
            <Readout label="AGENTS" value="3"     channel="cool" width={56} />
          </div>

          <div style={{ fontFamily: "var(--font-engrave)", fontSize: 8, letterSpacing: "0.2em", color: "var(--ink-dim)", marginTop: 4 }}>SYNC GATE</div>
          <Scope width={248} height={44} channel="rose" label="" />
          <div style={{ display: "flex", gap: 6 }}>
            <Readout label="AFFECT"  value="JOY"     channel="rose" width={72} />
            <Readout label="VALENCE" value="+0.72"   channel="cool" width={72} />
            <Readout label="AROUSAL" value="+0.55"   channel="myth" width={72} />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
          <div style={{ fontFamily: "var(--font-engrave)", fontSize: 8, letterSpacing: "0.2em", color: "var(--ink-dim)" }}>GESTURE BANK</div>
          <Spectrum width={160} height={54} bands={10} channel="rose" label="" />
          <VU width={160} height={10} channel="rose" label="GESTURE DENSITY" />
          <Readout label="LIBRARY" value="48 CLIPS" channel="myth" width={140} />
        </div>
      </div>

      <div className="loom-component-row">
        <div className="loom-component">
          <div className="loom-comp-id">
            <span className="loom-comp-code">GST</span>
            <span className="loom-comp-name">Gesture Library</span>
            <LED on channel="rose" size={5} />
          </div>
          <div className="loom-comp-controls">
            <Knob label="SELECT"  channel="rose"  variant="forge" size={40} ticks={9} defaultValue={0.3} />
            <Knob label="BLEND"   channel="cool"  variant="arc"   size={40} defaultValue={0.6} />
            <Knob label="WEIGHT"  channel="myth"  variant="pip"   size={40} defaultValue={0.8} />
          </div>
          <div className="loom-comp-jacks">
            <Jack label="GST" channel="rose" active /><Jack label="ANM" channel="cool" />
          </div>
        </div>

        <div className="loom-component">
          <div className="loom-comp-id">
            <span className="loom-comp-code">EMO</span>
            <span className="loom-comp-name">Emotion Driver</span>
            <LED on channel="rose" size={5} />
          </div>
          <div className="loom-comp-controls">
            <Knob label="VALENCE"  channel="rose"  variant="arc"    size={40} defaultValue={0.72} />
            <Knob label="AROUSAL"  channel="cool"  variant="dotted" ticks={7} size={40} defaultValue={0.55} />
            <Switch positions={3} labels={["PLT","NAR","INT"]} channel="rose" />
          </div>
          <div className="loom-comp-jacks">
            <Jack label="EMO" channel="rose" active /><Jack label="NAR" channel="myth" />
          </div>
        </div>

        <div className="loom-component">
          <div className="loom-comp-id">
            <span className="loom-comp-code">PRX</span>
            <span className="loom-comp-name">Proximity Trigger</span>
            <LED on channel="cool" size={5} />
          </div>
          <div className="loom-comp-controls">
            <Knob label="RANGE"   channel="rose"  variant="arc" size={40} defaultValue={0.4} />
            <Knob label="REACT"   channel="cool"  variant="arc" size={40} defaultValue={0.7} />
            <GateBtn label="ARM"  channel="rose" lit />
          </div>
          <div className="loom-comp-jacks">
            <Jack label="PRX" channel="cool" active /><Jack label="TRG" channel="rose" active />
          </div>
        </div>

        <div className="loom-component">
          <div className="loom-comp-id">
            <span className="loom-comp-code">SYN</span>
            <span className="loom-comp-name">Sync Gate</span>
            <LED on channel="myth" size={5} />
          </div>
          <div className="loom-comp-controls">
            <Knob label="PHASE"   channel="rose"  variant="arc"  size={40} defaultValue={0.0} />
            <Knob label="LOCK"    channel="cool"  variant="pip"  size={40} defaultValue={0.5} />
            <GateBtn label="SYNC"  channel="myth" lit />
          </div>
          <div className="loom-comp-jacks">
            <Jack label="SYN" channel="myth" active /><Jack label="BPM" channel="rose" />
          </div>
        </div>
      </div>

      <div className="axiom-module-patch">
        <div className="patch-group">
          <div className="patch-group-label">GESTURE OUT</div>
          <div className="patch-group-jacks">
            <Jack label="GST" channel="rose"  active /><Jack label="EMO" channel="rose"  active />
            <Jack label="PRX" channel="cool"  active />
          </div>
        </div>
        <div className="patch-group">
          <div className="patch-group-label">SOCIAL SEND</div>
          <div className="patch-group-jacks">
            <Jack label="SOC" channel="myth" /><Jack label="SYN" channel="myth" active />
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <Readout label="AFFECT"  value="JOY"    channel="rose" width={72} />
          <Readout label="GESTURES" value="48"    channel="cool" width={72} />
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   LAYER IV — PATH
   PTH · AGN · FRM · CRD
   ===================================================== */
function LayerPath() {
  return (
    <div className="axiom-module" style={{ "--axiom-ch": LOOM_HEX }}>
      <div className="loom-layer-header">
        <span className="loom-layer-num">LAYER IV</span>
        <span className="loom-layer-name">Path — Motion Path, Agent Nav, Formation, Crowd Director</span>
        <span className="loom-layer-wire">SPA · SOC</span>
        <LED on channel="rose" size={6} /><LED on channel="rose" size={6} />
        <LED on channel="rose" size={6} /><LED on channel="warm" size={6} />
      </div>

      <div className="loom-viz-strip" style={{ paddingTop: 10 }}>
        <MotionPathViz width={320} height={180} />

        <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
          <div style={{ fontFamily: "var(--font-engrave)", fontSize: 8, letterSpacing: "0.2em", color: "var(--ink-dim)" }}>CROWD FIELD</div>
          <CrowdViz width={300} height={70} />
          <div style={{ display: "flex", gap: 6 }}>
            <Readout label="AGENTS"  value="40"       channel="rose" width={66} />
            <Readout label="FORM"    value="GRID"     channel="cool" width={66} />
            <Readout label="SPEED"   value="2.4m/s"  channel="myth" width={74} />
          </div>

          <div style={{ fontFamily: "var(--font-engrave)", fontSize: 8, letterSpacing: "0.2em", color: "var(--ink-dim)", marginTop: 4 }}>NAV STATS</div>
          <VU width={300} height={10} channel="rose" label="PATH LOAD" />
          <div style={{ display: "flex", gap: 6, marginTop: 2 }}>
            <Readout label="WP"    value="6"      channel="rose" width={50} />
            <Readout label="SEG"   value="5"      channel="cool" width={50} />
            <Readout label="DIST"  value="84m"    channel="myth" width={62} />
          </div>
        </div>
      </div>

      <div className="loom-component-row">
        <div className="loom-component">
          <div className="loom-comp-id">
            <span className="loom-comp-code">PTH</span>
            <span className="loom-comp-name">Motion Path</span>
            <LED on channel="rose" size={5} />
          </div>
          <div className="loom-comp-controls">
            <Knob label="SPEED"   channel="rose"  variant="forge" size={40} ticks={9} defaultValue={0.4} />
            <Knob label="EASE"    channel="cool"  variant="arc"   size={40} defaultValue={0.65} />
            <Knob label="LOOP"    channel="myth"  variant="pip"   size={40} defaultValue={0.8} />
          </div>
          <div className="loom-comp-jacks">
            <Jack label="PTH" channel="rose" active /><Jack label="SPA" channel="cool" active />
          </div>
        </div>

        <div className="loom-component">
          <div className="loom-comp-id">
            <span className="loom-comp-code">AGN</span>
            <span className="loom-comp-name">Agent Navigator</span>
            <LED on channel="rose" size={5} />
          </div>
          <div className="loom-comp-controls">
            <Knob label="RADIUS"  channel="rose"  variant="arc"    size={40} defaultValue={0.3} />
            <Knob label="AVOID"   channel="cool"  variant="dotted" ticks={7} size={40} defaultValue={0.7} />
            <Switch positions={3} labels={["A*","RVO","FLW"]} channel="rose" />
          </div>
          <div className="loom-comp-jacks">
            <Jack label="AGN" channel="rose" active /><Jack label="NAV" channel="cool" />
          </div>
        </div>

        <div className="loom-component">
          <div className="loom-comp-id">
            <span className="loom-comp-code">FRM</span>
            <span className="loom-comp-name">Formation Engine</span>
            <LED on channel="cool" size={5} />
          </div>
          <div className="loom-comp-controls">
            <Knob label="SPREAD"  channel="rose"  variant="arc" size={40} defaultValue={0.5} />
            <Knob label="LOCK"    channel="cool"  variant="arc" size={40} defaultValue={0.8} />
            <GateBtn label="HOLD" channel="rose" lit />
          </div>
          <div className="loom-comp-jacks">
            <Jack label="FRM" channel="cool" active /><Jack label="SOC" channel="rose" />
          </div>
        </div>

        <div className="loom-component">
          <div className="loom-comp-id">
            <span className="loom-comp-code">CRD</span>
            <span className="loom-comp-name">Crowd Director</span>
            <LED on channel="warm" size={5} />
          </div>
          <div className="loom-comp-controls">
            <Knob label="DENSITY"  channel="rose"  variant="arc"  size={40} defaultValue={0.6} />
            <Knob label="COHESION" channel="cool"  variant="pip"  size={40} defaultValue={0.7} />
            <GateBtn label="DIRECT" channel="warm" lit />
          </div>
          <div className="loom-comp-jacks">
            <Jack label="CRD" channel="warm" active /><Jack label="SOC" channel="rose" active />
          </div>
        </div>
      </div>

      <div className="loom-status-bar">
        <LED on channel="rose" size={6} />
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: LOOM_HEX, letterSpacing: "0.12em" }}>
          LOOM · CHOREO ACTIVE
        </span>
        <Readout label="CLIPS"    value="6"           channel="rose" width={60} />
        <Readout label="AGENTS"   value="40"          channel="rose" width={64} />
        <Readout label="AFFECT"   value="JOY·+0.72"  channel="myth" width={96} />
        <Readout label="FORMATION" value="GRID"       channel="cool" width={80} />
        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          <span style={{ fontFamily: "var(--font-engrave)", fontSize: 8, color: "var(--ink-dim)", letterSpacing: "0.15em" }}>WIRE ·</span>
          {["SPA","SOC","NAR","TMP","MOT"].map(w => (
            <span key={w} style={{
              fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: "0.1em",
              color: `rgba(${LOOM_RGB},0.55)`,
              border: `1px solid rgba(${LOOM_RGB},0.18)`,
              borderRadius: 2, padding: "1px 4px"
            }}>{w}</span>
          ))}
        </div>
      </div>

      <div className="axiom-module-patch">
        <div className="patch-group">
          <div className="patch-group-label">PATH OUT</div>
          <div className="patch-group-jacks">
            <Jack label="PTH" channel="rose"  active /><Jack label="AGN" channel="rose"  active />
            <Jack label="FRM" channel="cool"  active /><Jack label="CRD" channel="warm"  active />
          </div>
        </div>
        <div className="patch-group">
          <div className="patch-group-label">BEHAVIOR SEND</div>
          <div className="patch-group-jacks">
            <Jack label="BHV" channel="myth" /><Jack label="SOC" channel="rose" active />
            <Jack label="MOT" channel="cool" active />
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <Readout label="WAYPOINTS" value="6"    channel="rose" width={80} />
          <Readout label="AGENTS"    value="40"   channel="cool" width={64} />
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   ROOT — LOOM INSTRUMENT
   ===================================================== */
function LoomInstrument() {
  return (
    <div className="axiom-rack">
      <MasterTransport
        moduleId="choreography"
        moduleName="LOOM · CHOREOGRAPHY"
        moduleColor={LOOM_HEX}
      />

      <div className="axiom-rack-header">
        <div className="axiom-rack-crest">
          {Crests.loom}
        </div>
        <div className="axiom-rack-title-block">
          <div className="axiom-rack-title" style={{ color: LOOM_HEX, textShadow: `0 0 18px rgba(${LOOM_RGB},0.5)` }}>
            LOOM
          </div>
          <div className="axiom-rack-subtitle">Module 06 · Choreography · Department II — Character</div>
        </div>
        <div className="axiom-rack-meta">
          <Readout label="MODULE"  value="06 / LOOM"        channel="rose" width={120} />
          <Readout label="CHANNEL" value="06 · CHOREOGRAPHY" channel="rose" width={150} />
          <Readout label="DEPT"    value="II · CHARACTER"   channel="cool" width={120} />
          <Readout label="VERSION" value="V1.0"             channel="myth" width={80}  />
        </div>
      </div>

      <div className="axiom-rack-body">
        <LayerSequence />
        <LayerMotion />
        <LayerGesture />
        <LayerPath />
      </div>

      <div className="axiom-rack-footer">
        <span>BSQM·MODULES·GENESIS·V1.0</span>
        <span>Package bsqm-modules-001</span>
        <span>06/16 Mythos Containers</span>
        <span style={{ color: `rgba(${LOOM_RGB},0.5)` }}>
          IN: AnimationRig · NarrativeMood · FactionState · SimTick
        </span>
        <span style={{ color: `rgba(${LOOM_RGB},0.5)` }}>
          OUT: AnimationClip · MotionPath · GesturePacket · PoseState
        </span>
      </div>
    </div>
  );
}

const { createRoot: loomCreateRoot } = ReactDOM;
loomCreateRoot(document.getElementById("root")).render(<LoomInstrument />);
