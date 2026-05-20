/* =====================================================
   ANIMUS · Module 05 · Modeling
   Department II — Character
   BSQM Genesis Package · bsqm-modules-001
   16 Standard Components · 4 Layers

   Layer I   — Mesh    : GEN · SUB · RET · UVW
   Layer II  — Rigging : SKL · IKS · WGT · CTR
   Layer III — Skin    : PRC · MAT · TEX · NRM
   Layer IV  — Physics : PHY · CLT · HRD · COL

   IN  : ArchitectureKit(visual/Architect) ·
         GenesisLaws(physics) ·
         FactionState(social) ·
         NarrativeMood(narrative/Story)
   OUT : CharacterMesh(visual/→*) ·
         AnimationRig(spatial/→Choreography) ·
         PhysicsBody(physics/→Behavior) ·
         ProceduralSkin(visual/→Network)
   ===================================================== */

const { useState: useAnS, useEffect: useAnE, useRef: useAnR } = React;

const ANIMUS_COLOR = "var(--ch05-animus)";
const ANIMUS_HEX   = "#f4c025";
const ANIMUS_RGB   = "244,192,37";

/* =====================================================
   MESH WIRE VISUALIZER — rotating 3D wireframe (GEN / SUB)
   ===================================================== */
function MeshWireViz({ width = 220, height = 200 }) {
  const ref = useAnR(null);
  const dataRef = useAnR(null);

  useAnE(() => {
    // Low-poly humanoid vertex cloud (normalized -1..1, Y-up)
    const verts = [
      // Head
      [0, 1.7, 0],
      [-0.18, 1.55, 0.1], [0.18, 1.55, 0.1],
      [-0.12, 1.45, 0.18], [0.12, 1.45, 0.18],
      [0, 1.4, 0.2],
      // Neck / shoulders
      [0, 1.35, 0],
      [-0.45, 1.25, 0], [0.45, 1.25, 0],
      // Torso
      [-0.38, 1.0, 0.05], [0.38, 1.0, 0.05],
      [-0.32, 0.55, 0.05], [0.32, 0.55, 0.05],
      [0, 0.55, 0],
      // Hips
      [-0.28, 0.35, 0], [0.28, 0.35, 0],
      // Left arm
      [-0.55, 1.05, 0], [-0.72, 0.7, 0], [-0.8, 0.35, 0], [-0.82, 0.1, 0],
      // Right arm
      [0.55, 1.05, 0], [0.72, 0.7, 0], [0.8, 0.35, 0], [0.82, 0.1, 0],
      // Left leg
      [-0.22, 0.2, 0], [-0.24, -0.25, 0], [-0.22, -0.75, 0], [-0.2, -1.1, 0.06],
      // Right leg
      [0.22, 0.2, 0], [0.24, -0.25, 0], [0.22, -0.75, 0], [0.2, -1.1, 0.06],
    ];

    const edges = [
      // Head outline
      [0,1],[0,2],[1,3],[2,4],[3,5],[4,5],[1,2],
      // Neck to shoulders
      [6,7],[6,8],[0,6],
      // Torso
      [7,9],[8,10],[9,11],[10,12],[11,13],[12,13],[9,10],[11,12],
      // Hips
      [13,14],[13,15],[14,15],
      // Left arm
      [7,16],[16,17],[17,18],[18,19],
      // Right arm
      [8,20],[20,21],[21,22],[22,23],
      // Left leg
      [14,24],[24,25],[25,26],[26,27],
      // Right leg
      [15,28],[28,29],[29,30],[30,31],
      // Cross ribs
      [9,6],[10,6],
    ];

    // Subdivided extra verts for detail overlay
    const extraEdges = [];
    for (let i = 0; i < 18; i++) {
      extraEdges.push([
        Math.floor(Math.random() * verts.length),
        Math.floor(Math.random() * verts.length),
      ]);
    }

    dataRef.current = { verts, edges, extraEdges, rot: 0 };
  }, []);

  useFrame((t) => {
    const c = ref.current; if (!c) return;
    const d = dataRef.current; if (!d) return;
    const ctx = c.getContext("2d");
    const W = c.width, H = c.height;
    ctx.clearRect(0, 0, W, H);

    ctx.fillStyle = "#030508";
    ctx.fillRect(0, 0, W, H);

    d.rot = t * 0.18;
    const { verts, edges, extraEdges, rot } = d;

    const scale = H * 0.42;
    const cx = W / 2, cy = H * 0.5;

    // Project 3D → 2D (simple perspective, Y-up, rotate around Y)
    const cosR = Math.cos(rot), sinR = Math.sin(rot);
    const project = ([x, y, z]) => {
      const rx = x * cosR + z * sinR;
      const rz = -x * sinR + z * cosR;
      const fov = 2.2 / (2.2 + rz * 0.3);
      return [cx + rx * scale * fov, cy - y * scale * fov, rz];
    };

    const proj = verts.map(project);

    // Grid floor
    ctx.strokeStyle = `rgba(${ANIMUS_RGB},0.04)`;
    ctx.lineWidth = 0.5;
    for (let i = -3; i <= 3; i++) {
      const [x0, y0] = project([i * 0.4, -1.15, -1.2]);
      const [x1, y1] = project([i * 0.4, -1.15,  1.2]);
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
      const [x2, y2] = project([-1.2, -1.15, i * 0.4]);
      const [x3, y3] = project([ 1.2, -1.15, i * 0.4]);
      ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x3, y3); ctx.stroke();
    }

    // Ghost back-face edges
    edges.forEach(([a, b]) => {
      const [ax, ay, az] = proj[a];
      const [bx, by, bz] = proj[b];
      const avgZ = (az + bz) / 2;
      if (avgZ < 0) {
        ctx.strokeStyle = `rgba(${ANIMUS_RGB},0.08)`;
        ctx.lineWidth = 0.6;
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
      }
    });

    // Front-face edges
    edges.forEach(([a, b]) => {
      const [ax, ay, az] = proj[a];
      const [bx, by, bz] = proj[b];
      const avgZ = (az + bz) / 2;
      if (avgZ >= 0) {
        const depth = 0.5 + avgZ * 0.4;
        ctx.strokeStyle = `rgba(${ANIMUS_RGB},${Math.min(0.9, depth * 0.8)})`;
        ctx.lineWidth = 1 + avgZ * 0.3;
        ctx.shadowColor = `rgba(${ANIMUS_RGB},0.4)`;
        ctx.shadowBlur = 2;
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
      }
    });
    ctx.shadowBlur = 0;

    // Vertices
    proj.forEach(([px, py, pz], i) => {
      const size = 1.5 + pz * 0.8;
      ctx.beginPath(); ctx.arc(px, py, Math.max(0.5, size), 0, Math.PI * 2);
      const alpha = 0.4 + pz * 0.4;
      ctx.fillStyle = `rgba(${ANIMUS_RGB},${Math.min(1, alpha)})`;
      ctx.fill();
    });

    // Poly count readout
    ctx.fillStyle = `rgba(${ANIMUS_RGB},0.25)`;
    ctx.font = "8px 'JetBrains Mono'";
    ctx.fillText(`${verts.length}V · ${edges.length}E`, 6, H - 4);
  }, []);

  return (
    <div className="viz mat-screen" style={{ width, height, flexShrink: 0 }}>
      <canvas ref={ref} width={width * 2} height={height * 2}
              style={{ width: "100%", height: "100%" }} />
      <div className="viz-label engrave">MESH WIRE · HUMANOID</div>
    </div>
  );
}

/* =====================================================
   SKELETON VISUALIZER — bone hierarchy + IK chains (SKL / IKS)
   ===================================================== */
function SkeletonViz({ width = 180, height = 200 }) {
  const ref = useAnR(null);
  const dataRef = useAnR(null);

  useAnE(() => {
    const W = width * 2, H = height * 2;
    const s = H * 0.38, ox = W * 0.5, oy = H * 0.08;
    const bones = [
      // [name, x, y, parent]
      ["ROOT",    ox,        oy + s * 2.6, -1],
      ["SPINE0",  ox,        oy + s * 2.2,  0],
      ["SPINE1",  ox,        oy + s * 1.7,  1],
      ["SPINE2",  ox,        oy + s * 1.2,  2],
      ["NECK",    ox,        oy + s * 0.85, 3],
      ["HEAD",    ox,        oy + s * 0.4,  4],
      // Left arm
      ["LSHLDR",  ox - s * 0.55, oy + s * 1.1, 3],
      ["LELBOW",  ox - s * 0.82, oy + s * 1.65, 6],
      ["LWRIST",  ox - s * 0.9,  oy + s * 2.1,  7],
      // Right arm
      ["RSHLDR",  ox + s * 0.55, oy + s * 1.1, 3],
      ["RELBOW",  ox + s * 0.82, oy + s * 1.65, 9],
      ["RWRIST",  ox + s * 0.9,  oy + s * 2.1,  10],
      // Left leg
      ["LHIP",   ox - s * 0.28, oy + s * 2.6,  0],
      ["LKNEE",  ox - s * 0.3,  oy + s * 3.3,  12],
      ["LANKL",  ox - s * 0.28, oy + s * 3.9,  13],
      // Right leg
      ["RHIP",   ox + s * 0.28, oy + s * 2.6,  0],
      ["RKNEE",  ox + s * 0.3,  oy + s * 3.3,  15],
      ["RANKL",  ox + s * 0.28, oy + s * 3.9,  16],
    ];
    dataRef.current = { bones, W, H, s, phase: 0 };
  }, []);

  useFrame((t) => {
    const c = ref.current; if (!c) return;
    const d = dataRef.current; if (!d) return;
    const ctx = c.getContext("2d");
    const { W, H, bones, s } = d;
    ctx.clearRect(0, 0, W, H);

    ctx.fillStyle = "#030407";
    ctx.fillRect(0, 0, W, H);

    // Animated IK pose — gentle breathing + arm sway
    const breathe = Math.sin(t * 0.8) * s * 0.04;
    const sway    = Math.sin(t * 0.4) * s * 0.06;

    const pos = bones.map(([name, bx, by]) => {
      let dx = 0, dy = 0;
      if (name.startsWith("SPINE") || name === "NECK" || name === "HEAD") dy = breathe * (name === "HEAD" ? 1.5 : 1);
      if (name.includes("LSHLDR") || name.includes("LELBOW") || name.includes("LWRIST")) { dx = sway; dy = breathe; }
      if (name.includes("RSHLDR") || name.includes("RELBOW") || name.includes("RWRIST")) { dx = -sway; dy = breathe; }
      if (name.includes("KNEE") || name.includes("ANKL")) dy = breathe * 0.5;
      return [bx + dx, by + dy];
    });

    // Bones
    bones.forEach(([name, , , parent], i) => {
      if (parent < 0) return;
      const [ax, ay] = pos[i];
      const [bx, by] = pos[parent];

      const isIK = name.includes("ELBOW") || name.includes("WRIST") || name.includes("KNEE") || name.includes("ANKL");
      ctx.strokeStyle = isIK
        ? `rgba(${ANIMUS_RGB},0.75)`
        : `rgba(${ANIMUS_RGB},0.45)`;
      ctx.lineWidth = isIK ? 2.5 : 1.8;
      ctx.shadowColor = `rgba(${ANIMUS_RGB},0.3)`;
      ctx.shadowBlur = isIK ? 6 : 3;
      ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
      ctx.shadowBlur = 0;
    });

    // Joints
    bones.forEach(([name], i) => {
      const [jx, jy] = pos[i];
      const isRoot = name === "ROOT";
      const isEnd  = name.includes("HEAD") || name.includes("WRIST") || name.includes("ANKL");
      const r = isRoot ? 6 : isEnd ? 3.5 : 4.5;
      ctx.beginPath(); ctx.arc(jx, jy, r, 0, Math.PI * 2);
      ctx.fillStyle = isRoot ? `rgba(${ANIMUS_RGB},1)` : `rgba(${ANIMUS_RGB},0.7)`;
      ctx.shadowColor = `rgba(${ANIMUS_RGB},0.6)`;
      ctx.shadowBlur = isRoot ? 10 : 5;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Label
      if (["ROOT","HEAD","LWRIST","RWRIST","LANKL","RANKL"].includes(name)) {
        ctx.fillStyle = `rgba(${ANIMUS_RGB},0.3)`;
        ctx.font = "8px 'JetBrains Mono'";
        ctx.fillText(name, jx + 6, jy + 3);
      }
    });

    // Bone count
    ctx.fillStyle = `rgba(${ANIMUS_RGB},0.2)`;
    ctx.font = "8px 'JetBrains Mono'";
    ctx.fillText(`${bones.length} BONES`, 4, H - 4);
  }, []);

  return (
    <div className="viz mat-screen" style={{ width, height, flexShrink: 0 }}>
      <canvas ref={ref} width={width * 2} height={height * 2}
              style={{ width: "100%", height: "100%" }} />
      <div className="viz-label engrave">SKELETON · IK CHAINS</div>
    </div>
  );
}

/* =====================================================
   SKIN WEIGHT VISUALIZER — heat map influence (WGT)
   ===================================================== */
function SkinWeightViz({ width = 300, height = 90 }) {
  const ref = useAnR(null);
  const dataRef = useAnR(null);

  useAnE(() => {
    const W = width * 2, H = height * 2;
    // Body segments with bone influence zones
    const zones = [
      { name: "HEAD",   cx: W*0.5,  cy: H*0.12, r: H*0.1,  color: [255,80,60],  weight: 1.0 },
      { name: "SPINE",  cx: W*0.5,  cy: H*0.38, r: H*0.08, color: [255,180,40], weight: 0.9 },
      { name: "LSHLDR", cx: W*0.3,  cy: H*0.3,  r: H*0.07, color: [80,200,255], weight: 0.85 },
      { name: "RSHLDR", cx: W*0.7,  cy: H*0.3,  r: H*0.07, color: [80,200,255], weight: 0.85 },
      { name: "LELBOW", cx: W*0.18, cy: H*0.52, r: H*0.06, color: [120,255,160],weight: 0.75 },
      { name: "RELBOW", cx: W*0.82, cy: H*0.52, r: H*0.06, color: [120,255,160],weight: 0.75 },
      { name: "HIPS",   cx: W*0.5,  cy: H*0.6,  r: H*0.09, color: [200,100,255],weight: 0.9 },
      { name: "LKNEE",  cx: W*0.38, cy: H*0.8,  r: H*0.07, color: [255,140,60], weight: 0.8 },
      { name: "RKNEE",  cx: W*0.62, cy: H*0.8,  r: H*0.07, color: [255,140,60], weight: 0.8 },
    ];
    dataRef.current = { zones, W, H };
  }, []);

  useFrame((t) => {
    const c = ref.current; if (!c) return;
    const d = dataRef.current; if (!d) return;
    const ctx = c.getContext("2d");
    const { W, H, zones } = d;
    ctx.clearRect(0, 0, W, H);

    ctx.fillStyle = "#050308";
    ctx.fillRect(0, 0, W, H);

    // Body silhouette
    ctx.fillStyle = "rgba(30,20,40,0.8)";
    ctx.beginPath();
    ctx.ellipse(W*0.5, H*0.12, W*0.09, H*0.1, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.fillRect(W*0.38, H*0.22, W*0.24, H*0.42);
    ctx.beginPath();
    ctx.ellipse(W*0.38, H*0.35, W*0.06, H*0.18, -0.2, 0, Math.PI*2); ctx.fill();
    ctx.beginPath();
    ctx.ellipse(W*0.62, H*0.35, W*0.06, H*0.18, 0.2, 0, Math.PI*2); ctx.fill();
    ctx.fillRect(W*0.38, H*0.64, W*0.1, H*0.34);
    ctx.fillRect(W*0.52, H*0.64, W*0.1, H*0.34);

    // Weight influence glows
    zones.forEach(z => {
      const pulse = z.weight * (0.85 + Math.sin(t * 0.6 + z.cx * 0.02) * 0.15);
      const [r, g, b] = z.color;
      const grad = ctx.createRadialGradient(z.cx, z.cy, 0, z.cx, z.cy, z.r * 1.6);
      grad.addColorStop(0, `rgba(${r},${g},${b},${0.55 * pulse})`);
      grad.addColorStop(0.5, `rgba(${r},${g},${b},${0.2 * pulse})`);
      grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(z.cx, z.cy, z.r * 1.6, 0, Math.PI * 2);
      ctx.fill();

      // Label
      ctx.fillStyle = `rgba(${r},${g},${b},0.5)`;
      ctx.font = "7px 'JetBrains Mono'";
      ctx.textAlign = "center";
      ctx.fillText(z.name, z.cx, z.cy + z.r * 1.8 + 6);
    });
    ctx.textAlign = "left";

    // Legend gradient bar
    const legX = W - 22, legY = H * 0.08, legH = H * 0.84;
    const legendGrad = ctx.createLinearGradient(0, legY, 0, legY + legH);
    legendGrad.addColorStop(0,   "rgba(255,80,60,0.8)");
    legendGrad.addColorStop(0.25,"rgba(255,220,40,0.8)");
    legendGrad.addColorStop(0.5, "rgba(80,200,255,0.8)");
    legendGrad.addColorStop(0.75,"rgba(120,255,160,0.8)");
    legendGrad.addColorStop(1,   "rgba(40,40,80,0.6)");
    ctx.fillStyle = legendGrad;
    ctx.fillRect(legX, legY, 10, legH);
    ctx.fillStyle = `rgba(${ANIMUS_RGB},0.3)`;
    ctx.font = "7px 'JetBrains Mono'";
    ctx.fillText("1.0", legX - 18, legY + 5);
    ctx.fillText("0.0", legX - 18, legY + legH);
  }, []);

  return (
    <div className="viz mat-screen" style={{ width, height, flexShrink: 0 }}>
      <canvas ref={ref} width={width * 2} height={height * 2}
              style={{ width: "100%", height: "100%" }} />
      <div className="viz-label engrave">SKIN WEIGHTS · INFLUENCE MAP</div>
    </div>
  );
}

/* =====================================================
   PROCEDURAL SKIN VISUALIZER — texture synthesis (PRC / TEX)
   ===================================================== */
function ProceduralSkinViz({ width = 340, height = 80 }) {
  const ref = useAnR(null);
  const dataRef = useAnR(null);

  useAnE(() => {
    const W = width * 2, H = height * 2;
    // 5 pattern swatches
    const patterns = [
      { name: "SCALE",  type: "scale"  },
      { name: "STRIPE", type: "stripe" },
      { name: "SPOT",   type: "spot"   },
      { name: "BARK",   type: "bark"   },
      { name: "PORE",   type: "pore"   },
    ];
    dataRef.current = { patterns, W, H };
  }, []);

  useFrame((t) => {
    const c = ref.current; if (!c) return;
    const d = dataRef.current; if (!d) return;
    const ctx = c.getContext("2d");
    const { W, H, patterns } = d;
    ctx.clearRect(0, 0, W, H);

    ctx.fillStyle = "#040308";
    ctx.fillRect(0, 0, W, H);

    const swatchW = (W - 20) / patterns.length;
    const swatchH = H * 0.72;
    const swatchY = H * 0.06;

    patterns.forEach((p, pi) => {
      const sx = 10 + pi * swatchW;
      const active = Math.floor(t * 0.3) % patterns.length === pi;
      const pulse = 0.7 + Math.sin(t * 0.5 + pi) * 0.3;

      ctx.save();
      ctx.beginPath();
      ctx.rect(sx + 2, swatchY, swatchW - 4, swatchH);
      ctx.clip();

      // Background
      ctx.fillStyle = `rgba(${ANIMUS_RGB},0.04)`;
      ctx.fillRect(sx + 2, swatchY, swatchW - 4, swatchH);

      const cx = sx + swatchW / 2;

      if (p.type === "scale") {
        // Hexagonal scales
        const scaleR = 10;
        for (let row = 0; row < 7; row++) {
          for (let col = 0; col < 5; col++) {
            const hx = sx + 2 + col * scaleR * 1.7 + (row % 2) * scaleR * 0.85;
            const hy = swatchY + row * scaleR * 1.1;
            const phaseV = Math.sin(t * 0.4 + row * 0.3 + col * 0.5) * 0.5 + 0.5;
            ctx.beginPath();
            for (let k = 0; k < 6; k++) {
              const a = (k / 6) * Math.PI * 2;
              const method = k === 0 ? "moveTo" : "lineTo";
              ctx[method](hx + Math.cos(a) * scaleR * 0.88, hy + Math.sin(a) * scaleR * 0.88);
            }
            ctx.closePath();
            ctx.fillStyle = `rgba(${ANIMUS_RGB},${0.1 + phaseV * 0.25})`;
            ctx.fill();
            ctx.strokeStyle = `rgba(${ANIMUS_RGB},${0.3 + phaseV * 0.3})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      } else if (p.type === "stripe") {
        // Animated diagonal stripes
        const stripeW = 8;
        const offset = (t * 12) % (stripeW * 2);
        for (let x = sx - stripeW * 2 + offset; x < sx + swatchW; x += stripeW * 2) {
          ctx.fillStyle = `rgba(${ANIMUS_RGB},0.22)`;
          ctx.fillRect(x, swatchY, stripeW, swatchH);
        }
        // Cross stripes
        for (let y = swatchY; y < swatchY + swatchH; y += 20) {
          ctx.strokeStyle = `rgba(${ANIMUS_RGB},0.1)`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(sx + 2, y); ctx.lineTo(sx + swatchW - 4, y); ctx.stroke();
        }
      } else if (p.type === "spot") {
        // Leopard-style spots
        const spots = Array.from({ length: 12 }, (_, i) => ({
          x: sx + 5 + (i % 4) * swatchW * 0.24,
          y: swatchY + 5 + Math.floor(i / 4) * swatchH * 0.3,
          r: 6 + Math.sin(i * 1.3) * 3,
          phase: i * 0.7,
        }));
        spots.forEach(sp => {
          const v = 0.5 + Math.sin(t * 0.3 + sp.phase) * 0.3;
          ctx.beginPath(); ctx.arc(sp.x, sp.y, sp.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${ANIMUS_RGB},${0.15 + v * 0.3})`;
          ctx.fill();
          ctx.strokeStyle = `rgba(${ANIMUS_RGB},${v * 0.5})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        });
      } else if (p.type === "bark") {
        // Bark-like horizontal ridges
        const ridges = 14;
        for (let ri = 0; ri < ridges; ri++) {
          const ry = swatchY + (ri / ridges) * swatchH;
          const noise = Math.sin(ri * 3.7 + t * 0.15) * 4;
          const alpha = 0.15 + Math.sin(ri * 0.8 + t * 0.1) * 0.1;
          ctx.strokeStyle = `rgba(${ANIMUS_RGB},${alpha + 0.1})`;
          ctx.lineWidth = 1 + Math.sin(ri * 1.3) * 0.5;
          ctx.beginPath();
          ctx.moveTo(sx + 2, ry + noise);
          for (let bx = sx + 2; bx < sx + swatchW - 4; bx += 6) {
            ctx.lineTo(bx, ry + Math.sin(bx * 0.4 + t * 0.2) * 3 + noise);
          }
          ctx.stroke();
        }
      } else if (p.type === "pore") {
        // Skin pore microstructure
        for (let py2 = swatchY + 4; py2 < swatchY + swatchH - 4; py2 += 9) {
          for (let px2 = sx + 4; px2 < sx + swatchW - 4; px2 += 9) {
            const v = 0.4 + Math.sin(px2 * 0.3 + py2 * 0.2 + t * 0.25) * 0.3;
            ctx.beginPath(); ctx.arc(px2, py2, 1.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${ANIMUS_RGB},${v * 0.4})`;
            ctx.fill();
          }
        }
      }

      ctx.restore();

      // Swatch border
      ctx.strokeStyle = active
        ? `rgba(${ANIMUS_RGB},0.7)`
        : `rgba(${ANIMUS_RGB},0.15)`;
      ctx.lineWidth = active ? 1.5 : 0.8;
      if (active) { ctx.shadowColor = `rgba(${ANIMUS_RGB},0.5)`; ctx.shadowBlur = 6; }
      ctx.strokeRect(sx + 2, swatchY, swatchW - 4, swatchH);
      ctx.shadowBlur = 0;

      // Label
      ctx.fillStyle = active ? `rgba(${ANIMUS_RGB},0.8)` : `rgba(${ANIMUS_RGB},0.3)`;
      ctx.font = "8px 'JetBrains Mono'";
      ctx.textAlign = "center";
      ctx.fillText(p.name, cx, swatchY + swatchH + 12);
    });
    ctx.textAlign = "left";
  }, []);

  return (
    <div className="viz mat-screen" style={{ width, height, flexShrink: 0 }}>
      <canvas ref={ref} width={width * 2} height={height * 2}
              style={{ width: "100%", height: "100%" }} />
      <div className="viz-label engrave">PROC SKIN · PATTERN SYNTHESIS</div>
    </div>
  );
}

/* =====================================================
   PHYSICS BODY VISUALIZER — collision / cloth / hair (PHY / CLT)
   ===================================================== */
function PhysicsBodyViz({ width = 320, height = 90 }) {
  const ref = useAnR(null);
  const dataRef = useAnR(null);

  useAnE(() => {
    const W = width * 2, H = height * 2;
    // Physics colliders (capsules / spheres)
    const colliders = [
      { type: "sphere",  cx: W*0.5,  cy: H*0.15, r: H*0.12, label: "HEAD" },
      { type: "capsule", cx: W*0.5,  cy: H*0.42, rx: H*0.12, ry: H*0.24, label: "TORSO" },
      { type: "capsule", cx: W*0.28, cy: H*0.45, rx: H*0.06, ry: H*0.18, label: "LARM" },
      { type: "capsule", cx: W*0.72, cy: H*0.45, rx: H*0.06, ry: H*0.18, label: "RARM" },
      { type: "capsule", cx: W*0.38, cy: H*0.76, rx: H*0.07, ry: H*0.2,  label: "LLEG" },
      { type: "capsule", cx: W*0.62, cy: H*0.76, rx: H*0.07, ry: H*0.2,  label: "RLEG" },
    ];
    // Cloth particles (hem of a cape)
    const cloth = Array.from({ length: 16 }, (_, i) => ({
      x: W * 0.2 + (i / 15) * W * 0.6,
      y: H * 0.32,
      vy: 0,
      phase: i * 0.4,
    }));
    // Hair strands
    const hair = Array.from({ length: 12 }, (_, i) => ({
      x: W * 0.38 + (i / 11) * W * 0.24,
      phase: i * 0.3,
    }));
    dataRef.current = { colliders, cloth, hair, W, H };
  }, []);

  useFrame((t) => {
    const c = ref.current; if (!c) return;
    const d = dataRef.current; if (!d) return;
    const ctx = c.getContext("2d");
    const { W, H, colliders, cloth, hair } = d;
    ctx.clearRect(0, 0, W, H);

    ctx.fillStyle = "#030508";
    ctx.fillRect(0, 0, W, H);

    // Hair physics strands
    hair.forEach(h => {
      const windX = Math.sin(t * 0.6 + h.phase) * 8;
      const windY = Math.cos(t * 0.4 + h.phase) * 4;
      ctx.strokeStyle = `rgba(${ANIMUS_RGB},0.35)`;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(h.x, H * 0.04);
      ctx.bezierCurveTo(
        h.x + windX * 0.3, H * 0.07 + windY,
        h.x + windX * 0.7, H * 0.1 + windY * 1.5,
        h.x + windX, H * 0.14 + windY * 2
      );
      ctx.stroke();
    });

    // Cloth hem
    const clothPts = cloth.map((p, i) => {
      const wave = Math.sin(t * 0.9 + p.phase) * H * 0.08;
      const gravity = H * 0.2;
      return { x: p.x, y: p.y + gravity + wave };
    });
    ctx.strokeStyle = `rgba(${ANIMUS_RGB},0.5)`;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    clothPts.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();
    // Cloth particles
    clothPts.forEach(p => {
      ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${ANIMUS_RGB},0.4)`;
      ctx.fill();
    });
    // Cloth anchor line
    ctx.strokeStyle = `rgba(${ANIMUS_RGB},0.15)`;
    ctx.setLineDash([3, 4]);
    ctx.beginPath();
    ctx.moveTo(cloth[0].x, cloth[0].y + H * 0.2);
    ctx.lineTo(cloth[cloth.length-1].x, cloth[cloth.length-1].y + H * 0.2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Collider shapes
    colliders.forEach(col => {
      const pulse = 0.4 + Math.sin(t * 0.5 + col.cx * 0.01) * 0.1;
      ctx.strokeStyle = `rgba(${ANIMUS_RGB},${pulse + 0.2})`;
      ctx.lineWidth = 1;
      ctx.shadowColor = `rgba(${ANIMUS_RGB},0.3)`;
      ctx.shadowBlur = 4;

      if (col.type === "sphere") {
        ctx.beginPath(); ctx.arc(col.cx, col.cy, col.r, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = `rgba(${ANIMUS_RGB},0.04)`;
        ctx.fill();
      } else {
        // Capsule = rect + two semicircles
        ctx.beginPath();
        ctx.ellipse(col.cx, col.cy - col.ry + col.rx, col.rx, col.rx, 0, Math.PI, 0);
        ctx.lineTo(col.cx + col.rx, col.cy + col.ry - col.rx);
        ctx.ellipse(col.cx, col.cy + col.ry - col.rx, col.rx, col.rx, 0, 0, Math.PI);
        ctx.closePath();
        ctx.stroke();
        ctx.fillStyle = `rgba(${ANIMUS_RGB},0.03)`;
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      // Label
      ctx.fillStyle = `rgba(${ANIMUS_RGB},0.3)`;
      ctx.font = "7px 'JetBrains Mono'";
      ctx.textAlign = "center";
      ctx.fillText(col.label, col.cx, col.cy + (col.ry || col.r) + 10);
    });
    ctx.textAlign = "left";
  }, []);

  return (
    <div className="viz mat-screen" style={{ width, height, flexShrink: 0 }}>
      <canvas ref={ref} width={width * 2} height={height * 2}
              style={{ width: "100%", height: "100%" }} />
      <div className="viz-label engrave">PHYSICS BODY · COLLIDERS + CLOTH</div>
    </div>
  );
}

/* =====================================================
   LAYER I — MESH
   GEN · SUB · RET · UVW
   ===================================================== */
function LayerMesh() {
  return (
    <div className="axiom-module" style={{ "--axiom-ch": ANIMUS_HEX }}>
      <div className="animus-layer-header">
        <span className="animus-layer-num">LAYER I</span>
        <span className="animus-layer-name">Mesh — Geometry Generator, Subdivision, Retopology, UV</span>
        <span className="animus-layer-wire">VIS · SPA</span>
        <LED on channel="warm" size={6} /><LED on channel="warm" size={6} />
        <LED on channel="cool" size={6} /><LED channel="warm" size={6} />
      </div>

      <div className="animus-viz-strip" style={{ paddingTop: 10 }}>
        <MeshWireViz width={220} height={200} />

        <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
          <div style={{ fontFamily: "var(--font-engrave)", fontSize: 8, letterSpacing: "0.2em", color: "var(--ink-dim)" }}>UV LAYOUT</div>
          <XYPad size={100} channel="warm" label="" />
          <div style={{ display: "flex", gap: 6 }}>
            <Readout label="U" value="0.62" channel="warm" width={56} />
            <Readout label="V" value="0.38" channel="warm" width={56} />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
          <div style={{ fontFamily: "var(--font-engrave)", fontSize: 8, letterSpacing: "0.2em", color: "var(--ink-dim)" }}>MESH PROFILE</div>
          <Scope width={220} height={60} channel="warm" label="" />
          <div style={{ display: "flex", gap: 6, marginTop: 2 }}>
            <Readout label="VERTS"  value="8,192"  channel="warm" width={72} />
            <Readout label="TRIS"   value="16,384" channel="cool" width={72} />
            <Readout label="SUBDIV" value="L3"     channel="myth" width={52} />
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <VU width={220} height={10} channel="warm" label="MESH DENSITY" />
          </div>
        </div>
      </div>

      <div className="animus-component-row">
        <div className="animus-component">
          <div className="animus-comp-id">
            <span className="animus-comp-code">GEN</span>
            <span className="animus-comp-name">Geometry Generator</span>
            <LED on channel="warm" size={5} />
          </div>
          <div className="animus-comp-controls">
            <Knob label="ARCHETYPE" channel="warm"  variant="forge" size={40} ticks={9}  defaultValue={0.5} />
            <Knob label="VARIETY"   channel="cool"  variant="arc"   size={40} defaultValue={0.65} />
            <Knob label="SEED"      channel="myth"  variant="pip"   size={40} defaultValue={0.3} />
          </div>
          <div className="animus-comp-jacks">
            <Jack label="MSH" channel="warm" active /><Jack label="ARC" channel="cool" />
          </div>
        </div>

        <div className="animus-component">
          <div className="animus-comp-id">
            <span className="animus-comp-code">SUB</span>
            <span className="animus-comp-name">Subdivision Engine</span>
            <LED on channel="warm" size={5} />
          </div>
          <div className="animus-comp-controls">
            <Knob label="LEVEL"   channel="warm"  variant="arc"    size={40} defaultValue={0.6} />
            <Knob label="CREASES" channel="cool"  variant="dotted" ticks={7} size={40} defaultValue={0.4} />
            <Switch positions={3} labels={["CAT","LIN","SUB"]} channel="warm" />
          </div>
          <div className="animus-comp-jacks">
            <Jack label="OUT" channel="warm" active /><Jack label="LOD" channel="cool" />
          </div>
        </div>

        <div className="animus-component">
          <div className="animus-comp-id">
            <span className="animus-comp-code">RET</span>
            <span className="animus-comp-name">Retopology Engine</span>
            <LED on channel="cool" size={5} />
          </div>
          <div className="animus-comp-controls">
            <Knob label="TARGET"  channel="warm"  variant="arc" size={40} defaultValue={0.45} />
            <Knob label="FLOW"    channel="cool"  variant="arc" size={40} defaultValue={0.7} />
            <GateBtn label="AUTO" channel="warm" lit />
          </div>
          <div className="animus-comp-jacks">
            <Jack label="RET" channel="cool" active /><Jack label="MAP" channel="warm" />
          </div>
        </div>

        <div className="animus-component">
          <div className="animus-comp-id">
            <span className="animus-comp-code">UVW</span>
            <span className="animus-comp-name">UV Unwrap Engine</span>
            <LED on channel="myth" size={5} />
          </div>
          <div className="animus-comp-controls">
            <Knob label="MARGIN"  channel="warm"  variant="arc"  size={40} defaultValue={0.08} />
            <Knob label="STRETCH" channel="cool"  variant="pip"  size={40} defaultValue={0.3} />
            <GateBtn label="PACK"  channel="myth" lit />
          </div>
          <div className="animus-comp-jacks">
            <Jack label="UVW" channel="myth" active /><Jack label="TEX" channel="warm" />
          </div>
        </div>
      </div>

      <div className="axiom-module-patch">
        <div className="patch-group">
          <div className="patch-group-label">MESH OUT</div>
          <div className="patch-group-jacks">
            <Jack label="MSH" channel="warm" active /><Jack label="LOD" channel="cool" active />
            <Jack label="UVW" channel="myth" active />
          </div>
        </div>
        <div className="patch-group">
          <div className="patch-group-label">VIS SEND</div>
          <div className="patch-group-jacks">
            <Jack label="RET" channel="cool" active /><Jack label="SUB" channel="warm" />
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <Readout label="VERTS"  value="8,192"  channel="warm" width={72} />
          <Readout label="SUBDIV" value="L3"     channel="myth" width={60} />
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   LAYER II — RIGGING
   SKL · IKS · WGT · CTR
   ===================================================== */
function LayerRigging() {
  return (
    <div className="axiom-module" style={{ "--axiom-ch": ANIMUS_HEX }}>
      <div className="animus-layer-header">
        <span className="animus-layer-num">LAYER II</span>
        <span className="animus-layer-name">Rigging — Skeleton, IK Solver, Weights, Control Rig</span>
        <span className="animus-layer-wire">SPA · VIS</span>
        <LED on channel="warm" size={6} /><LED on channel="warm" size={6} />
        <LED on channel="warm" size={6} /><LED on channel="warm" size={6} />
      </div>

      <div className="animus-viz-strip" style={{ paddingTop: 10 }}>
        <SkeletonViz width={180} height={200} />

        <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
          <div style={{ fontFamily: "var(--font-engrave)", fontSize: 8, letterSpacing: "0.2em", color: "var(--ink-dim)" }}>IK TARGETS</div>
          <div style={{ display: "flex", gap: 8 }}>
            <XYPad size={88} channel="warm" label="" />
            <XYPad size={88} channel="cool" label="" />
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <Readout label="LHAND" value="+0.4,+1.2" channel="warm" width={96} />
            <Readout label="RHAND" value="−0.4,+1.2" channel="cool" width={96} />
          </div>

          <div style={{ fontFamily: "var(--font-engrave)", fontSize: 8, letterSpacing: "0.2em", color: "var(--ink-dim)", marginTop: 4 }}>CONTROL RIG</div>
          <Scope width={248} height={44} channel="warm" label="" />
          <div style={{ display: "flex", gap: 6 }}>
            <Readout label="BONES"   value="18"    channel="warm" width={60} />
            <Readout label="IK-CHN"  value="4"     channel="cool" width={60} />
            <Readout label="CTRLS"   value="22"    channel="myth" width={60} />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
          <div style={{ fontFamily: "var(--font-engrave)", fontSize: 8, letterSpacing: "0.2em", color: "var(--ink-dim)" }}>WEIGHT PAINT</div>
          <SkinWeightViz width={160} height={110} />
        </div>
      </div>

      <div className="animus-component-row">
        <div className="animus-component">
          <div className="animus-comp-id">
            <span className="animus-comp-code">SKL</span>
            <span className="animus-comp-name">Skeleton Builder</span>
            <LED on channel="warm" size={5} />
          </div>
          <div className="animus-comp-controls">
            <Knob label="BONES"   channel="warm"  variant="forge" size={40} ticks={9} defaultValue={0.45} />
            <Knob label="SYMM"    channel="cool"  variant="arc"   size={40} defaultValue={0.8} />
            <Knob label="SCALE"   channel="myth"  variant="pip"   size={40} defaultValue={0.5} />
          </div>
          <div className="animus-comp-jacks">
            <Jack label="RIG" channel="warm" active /><Jack label="MSH" channel="cool" />
          </div>
        </div>

        <div className="animus-component">
          <div className="animus-comp-id">
            <span className="animus-comp-code">IKS</span>
            <span className="animus-comp-name">IK Solver</span>
            <LED on channel="warm" size={5} />
          </div>
          <div className="animus-comp-controls">
            <Knob label="ITER"    channel="warm"  variant="arc"    size={40} defaultValue={0.7} />
            <Knob label="DAMP"    channel="cool"  variant="dotted" ticks={7} size={40} defaultValue={0.45} />
            <Switch positions={3} labels={["CCD","FABR","JCB"]} channel="warm" />
          </div>
          <div className="animus-comp-jacks">
            <Jack label="IK"  channel="warm" active /><Jack label="TGT" channel="cool" active />
          </div>
        </div>

        <div className="animus-component">
          <div className="animus-comp-id">
            <span className="animus-comp-code">WGT</span>
            <span className="animus-comp-name">Weight Painter</span>
            <LED on channel="cool" size={5} />
          </div>
          <div className="animus-comp-controls">
            <Knob label="SMOOTH"  channel="warm"  variant="arc" size={40} defaultValue={0.6} />
            <Knob label="FALLOFF" channel="cool"  variant="arc" size={40} defaultValue={0.5} />
            <GateBtn label="NORM" channel="warm" lit />
          </div>
          <div className="animus-comp-jacks">
            <Jack label="WGT" channel="cool" active /><Jack label="MAP" channel="warm" />
          </div>
        </div>

        <div className="animus-component">
          <div className="animus-comp-id">
            <span className="animus-comp-code">CTR</span>
            <span className="animus-comp-name">Control Rig Engine</span>
            <LED on channel="myth" size={5} />
          </div>
          <div className="animus-comp-controls">
            <Knob label="CTRLS"   channel="warm"  variant="arc"  size={40} defaultValue={0.55} />
            <Knob label="SPACE"   channel="cool"  variant="pip"  size={40} defaultValue={0.5} />
            <GateBtn label="BAKE"  channel="myth" lit />
          </div>
          <div className="animus-comp-jacks">
            <Jack label="CTR" channel="myth" active /><Jack label="ANM" channel="warm" active />
          </div>
        </div>
      </div>

      <div className="axiom-module-patch">
        <div className="patch-group">
          <div className="patch-group-label">RIG OUT</div>
          <div className="patch-group-jacks">
            <Jack label="SKL" channel="warm"  active /><Jack label="IK"  channel="warm"  active />
            <Jack label="CTR" channel="myth"  active /><Jack label="ANM" channel="warm"  active />
          </div>
        </div>
        <div className="patch-group">
          <div className="patch-group-label">ANIM SEND</div>
          <div className="patch-group-jacks">
            <Jack label="CHO" channel="cool" /><Jack label="WGT" channel="cool" active />
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <Readout label="BONES"  value="18"   channel="warm" width={60} />
          <Readout label="CHAINS" value="4"    channel="cool" width={60} />
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   LAYER III — SKIN
   PRC · MAT · TEX · NRM
   ===================================================== */
function LayerSkin() {
  return (
    <div className="axiom-module" style={{ "--axiom-ch": ANIMUS_HEX }}>
      <div className="animus-layer-header">
        <span className="animus-layer-num">LAYER III</span>
        <span className="animus-layer-name">Skin — Proc Skin, Material, Texture, Normal Map</span>
        <span className="animus-layer-wire">VIS · DAT</span>
        <LED on channel="warm" size={6} /><LED on channel="warm" size={6} />
        <LED on channel="cool" size={6} /><LED channel="warm"   size={6} />
      </div>

      <div className="animus-viz-strip" style={{ paddingTop: 10 }}>
        <ProceduralSkinViz width={340} height={90} />

        <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
          <div style={{ fontFamily: "var(--font-engrave)", fontSize: 8, letterSpacing: "0.2em", color: "var(--ink-dim)" }}>MATERIAL CURVE</div>
          <CurveEditor width={180} height={70} channel="warm" label="" />
          <div style={{ display: "flex", gap: 6 }}>
            <Readout label="ROUGH"   value="0.42"  channel="warm" width={72} />
            <Readout label="METAL"   value="0.00"  channel="cool" width={72} />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
          <div style={{ fontFamily: "var(--font-engrave)", fontSize: 8, letterSpacing: "0.2em", color: "var(--ink-dim)" }}>TEX SPECTRUM</div>
          <Spectrum width={160} height={48} bands={12} channel="warm" label="" />
          <VU width={160} height={10} channel="warm" label="TEXEL DENSITY" />
          <Readout label="RES" value="4096²" channel="myth" width={120} />
        </div>
      </div>

      <div className="animus-component-row">
        <div className="animus-component">
          <div className="animus-comp-id">
            <span className="animus-comp-code">PRC</span>
            <span className="animus-comp-name">Procedural Skin</span>
            <LED on channel="warm" size={5} />
          </div>
          <div className="animus-comp-controls">
            <Knob label="PATTERN"  channel="warm"  variant="forge" size={40} ticks={9} defaultValue={0.3} />
            <Knob label="SCALE"    channel="cool"  variant="arc"   size={40} defaultValue={0.5} />
            <Knob label="BLEND"    channel="myth"  variant="pip"   size={40} defaultValue={0.65} />
          </div>
          <div className="animus-comp-jacks">
            <Jack label="SKN" channel="warm" active /><Jack label="UVW" channel="cool" />
          </div>
        </div>

        <div className="animus-component">
          <div className="animus-comp-id">
            <span className="animus-comp-code">MAT</span>
            <span className="animus-comp-name">Material Assembler</span>
            <LED on channel="warm" size={5} />
          </div>
          <div className="animus-comp-controls">
            <Knob label="BASE"    channel="warm"  variant="arc"    size={40} defaultValue={0.55} />
            <Knob label="ROUGH"   channel="cool"  variant="dotted" ticks={7} size={40} defaultValue={0.42} />
            <Switch positions={3} labels={["PBR","SKIN","STY"]} channel="warm" />
          </div>
          <div className="animus-comp-jacks">
            <Jack label="MAT" channel="warm" active /><Jack label="SHD" channel="myth" />
          </div>
        </div>

        <div className="animus-component">
          <div className="animus-comp-id">
            <span className="animus-comp-code">TEX</span>
            <span className="animus-comp-name">Texture Synthesizer</span>
            <LED on channel="cool" size={5} />
          </div>
          <div className="animus-comp-controls">
            <Knob label="FREQ"    channel="warm"  variant="arc" size={40} defaultValue={0.6} />
            <Knob label="OCTAVE"  channel="cool"  variant="arc" size={40} defaultValue={0.5} />
            <GateBtn label="SYNTH" channel="warm" lit />
          </div>
          <div className="animus-comp-jacks">
            <Jack label="TEX" channel="cool" active /><Jack label="NRM" channel="myth" />
          </div>
        </div>

        <div className="animus-component">
          <div className="animus-comp-id">
            <span className="animus-comp-code">NRM</span>
            <span className="animus-comp-name">Normal Map Engine</span>
            <LED on channel="myth" size={5} />
          </div>
          <div className="animus-comp-controls">
            <Knob label="DEPTH"   channel="warm"  variant="arc"  size={40} defaultValue={0.7} />
            <Knob label="BAKE"    channel="cool"  variant="pip"  size={40} defaultValue={0.55} />
            <GateBtn label="BAKE"  channel="myth" lit />
          </div>
          <div className="animus-comp-jacks">
            <Jack label="NRM" channel="myth" active /><Jack label="DSP" channel="warm" />
          </div>
        </div>
      </div>

      <div className="axiom-module-patch">
        <div className="patch-group">
          <div className="patch-group-label">SKIN OUT</div>
          <div className="patch-group-jacks">
            <Jack label="SKN" channel="warm"  active /><Jack label="MAT" channel="warm"  active />
            <Jack label="TEX" channel="cool"  active />
          </div>
        </div>
        <div className="patch-group">
          <div className="patch-group-label">VIS SEND</div>
          <div className="patch-group-jacks">
            <Jack label="NRM" channel="myth" active /><Jack label="DSP" channel="warm" />
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <Readout label="TEX-RES"  value="4096²"   channel="myth" width={72} />
          <Readout label="PATTERN"  value="SCALE"   channel="warm" width={80} />
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   LAYER IV — PHYSICS
   PHY · CLT · HRD · COL
   ===================================================== */
function LayerPhysics() {
  return (
    <div className="axiom-module" style={{ "--axiom-ch": ANIMUS_HEX }}>
      <div className="animus-layer-header">
        <span className="animus-layer-num">LAYER IV</span>
        <span className="animus-layer-name">Physics — Body, Cloth, Hair/Fur, Collision</span>
        <span className="animus-layer-wire">PHY · VIS</span>
        <LED on channel="warm" size={6} /><LED on channel="warm" size={6} />
        <LED on channel="warm" size={6} /><LED on channel="hot"  size={6} />
      </div>

      <div className="animus-viz-strip" style={{ paddingTop: 10 }}>
        <PhysicsBodyViz width={320} height={110} />

        <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
          <div style={{ fontFamily: "var(--font-engrave)", fontSize: 8, letterSpacing: "0.2em", color: "var(--ink-dim)" }}>CLOTH SIM</div>
          <Scope width={250} height={54} channel="warm" label="" />
          <div style={{ display: "flex", gap: 6 }}>
            <Readout label="STIFF"   value="0.72"  channel="warm" width={72} />
            <Readout label="DAMP"    value="0.18"  channel="cool" width={64} />
            <Readout label="MASS"    value="0.3kg" channel="myth" width={64} />
          </div>

          <div style={{ fontFamily: "var(--font-engrave)", fontSize: 8, letterSpacing: "0.2em", color: "var(--ink-dim)", marginTop: 4 }}>PHYSICS LOAD</div>
          <VU width={250} height={10} channel="hot" label="SIM COST" />
          <div style={{ display: "flex", gap: 6, marginTop: 2 }}>
            <Readout label="FPS"     value="60.0"  channel="life" width={60} />
            <Readout label="SUBST"   value="4"     channel="cool" width={52} />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
          <div style={{ fontFamily: "var(--font-engrave)", fontSize: 8, letterSpacing: "0.2em", color: "var(--ink-dim)" }}>COLLIDER MAP</div>
          <Polar width={120} height={120} channel="warm" label="" />
          <Readout label="COLLDRS" value="6" channel="hot" width={120} />
        </div>
      </div>

      <div className="animus-component-row">
        <div className="animus-component">
          <div className="animus-comp-id">
            <span className="animus-comp-code">PHY</span>
            <span className="animus-comp-name">Physics Body</span>
            <LED on channel="warm" size={5} />
          </div>
          <div className="animus-comp-controls">
            <Knob label="MASS"    channel="warm"  variant="forge" size={40} ticks={9} defaultValue={0.5} />
            <Knob label="DRAG"    channel="cool"  variant="arc"   size={40} defaultValue={0.3} />
            <Knob label="BOUNCE"  channel="hot"   variant="pip"   size={40} defaultValue={0.2} />
          </div>
          <div className="animus-comp-jacks">
            <Jack label="PHY" channel="warm" active /><Jack label="GRV" channel="cool" />
          </div>
        </div>

        <div className="animus-component">
          <div className="animus-comp-id">
            <span className="animus-comp-code">CLT</span>
            <span className="animus-comp-name">Cloth Simulator</span>
            <LED on channel="warm" size={5} />
          </div>
          <div className="animus-comp-controls">
            <Knob label="STIFF"   channel="warm"  variant="arc"    size={40} defaultValue={0.72} />
            <Knob label="DAMP"    channel="cool"  variant="dotted" ticks={7} size={40} defaultValue={0.18} />
            <Switch positions={3} labels={["PBD","SPH","FEM"]} channel="warm" />
          </div>
          <div className="animus-comp-jacks">
            <Jack label="CLT" channel="warm" active /><Jack label="WND" channel="cool" />
          </div>
        </div>

        <div className="animus-component">
          <div className="animus-comp-id">
            <span className="animus-comp-code">HRD</span>
            <span className="animus-comp-name">Hair / Fur Driver</span>
            <LED on channel="cool" size={5} />
          </div>
          <div className="animus-comp-controls">
            <Knob label="GUIDES"  channel="warm"  variant="arc" size={40} defaultValue={0.5} />
            <Knob label="STIFF"   channel="cool"  variant="arc" size={40} defaultValue={0.65} />
            <Knob label="WIND"    channel="myth"  variant="pip" size={40} defaultValue={0.35} />
          </div>
          <div className="animus-comp-jacks">
            <Jack label="HRD" channel="cool" active /><Jack label="VIS" channel="warm" />
          </div>
        </div>

        <div className="animus-component">
          <div className="animus-comp-id">
            <span className="animus-comp-code">COL</span>
            <span className="animus-comp-name">Collision Engine</span>
            <LED on channel="hot" size={5} />
          </div>
          <div className="animus-comp-controls">
            <Knob label="MARGIN"  channel="warm"  variant="arc"  size={40} defaultValue={0.05} />
            <Knob label="ITER"    channel="cool"  variant="pip"  size={40} defaultValue={0.6} />
            <GateBtn label="ENABLE" channel="hot" lit />
          </div>
          <div className="animus-comp-jacks">
            <Jack label="COL" channel="hot" active /><Jack label="PHY" channel="warm" active />
          </div>
        </div>
      </div>

      <div className="animus-status-bar">
        <LED on channel="warm" size={6} />
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: ANIMUS_HEX, letterSpacing: "0.12em" }}>
          ANIMUS · SIM ACTIVE
        </span>
        <Readout label="BODIES"    value="1"          channel="warm" width={64} />
        <Readout label="CLOTH-PTS" value="256"        channel="warm" width={80} />
        <Readout label="HAIR-STR"  value="512"        channel="cool" width={80} />
        <Readout label="COLLDRS"   value="6"          channel="hot"  width={64} />
        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          <span style={{ fontFamily: "var(--font-engrave)", fontSize: 8, color: "var(--ink-dim)", letterSpacing: "0.15em" }}>WIRE ·</span>
          {["VIS","SPA","PHY","ANM","COL"].map(w => (
            <span key={w} style={{
              fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: "0.1em",
              color: `rgba(${ANIMUS_RGB},0.55)`,
              border: `1px solid rgba(${ANIMUS_RGB},0.18)`,
              borderRadius: 2, padding: "1px 4px"
            }}>{w}</span>
          ))}
        </div>
      </div>

      <div className="axiom-module-patch">
        <div className="patch-group">
          <div className="patch-group-label">PHYS OUT</div>
          <div className="patch-group-jacks">
            <Jack label="PHY" channel="warm" active /><Jack label="CLT" channel="warm" active />
            <Jack label="HRD" channel="cool" active /><Jack label="COL" channel="hot"  active />
          </div>
        </div>
        <div className="patch-group">
          <div className="patch-group-label">BEHAVIOR SEND</div>
          <div className="patch-group-jacks">
            <Jack label="BHV" channel="myth" /><Jack label="SIM" channel="warm" active />
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <Readout label="SIM-FPS"  value="60.0"   channel="life" width={72} />
          <Readout label="SUBSTEPS" value="4"      channel="cool" width={64} />
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   ROOT — ANIMUS INSTRUMENT
   ===================================================== */
function AnimusInstrument() {
  return (
    <div className="axiom-rack">
      <MasterTransport
        moduleId="modeling"
        moduleName="ANIMUS · MODELING"
        moduleColor={ANIMUS_HEX}
      />

      <div className="axiom-rack-header">
        <div className="axiom-rack-crest">
          {Crests.animus}
        </div>
        <div className="axiom-rack-title-block">
          <div className="axiom-rack-title" style={{ color: ANIMUS_HEX, textShadow: `0 0 18px rgba(${ANIMUS_RGB},0.5)` }}>
            ANIMUS
          </div>
          <div className="axiom-rack-subtitle">Module 05 · Modeling · Department II — Character</div>
        </div>
        <div className="axiom-rack-meta">
          <Readout label="MODULE"  value="05 / ANIMUS"   channel="warm" width={120} />
          <Readout label="CHANNEL" value="05 · MODELING" channel="warm" width={130} />
          <Readout label="DEPT"    value="II · CHARACTER" channel="cool" width={120} />
          <Readout label="VERSION" value="V1.0"          channel="myth" width={80}  />
        </div>
      </div>

      <div className="axiom-rack-body">
        <LayerMesh />
        <LayerRigging />
        <LayerSkin />
        <LayerPhysics />
      </div>

      <div className="axiom-rack-footer">
        <span>BSQM·MODULES·GENESIS·V1.0</span>
        <span>Package bsqm-modules-001</span>
        <span>05/16 Mythos Containers</span>
        <span style={{ color: `rgba(${ANIMUS_RGB},0.5)` }}>
          IN: ArchitectureKit · GenesisLaws · FactionState · NarrativeMood
        </span>
        <span style={{ color: `rgba(${ANIMUS_RGB},0.5)` }}>
          OUT: CharacterMesh · AnimationRig · PhysicsBody · ProceduralSkin
        </span>
      </div>
    </div>
  );
}

const { createRoot: animusCreateRoot } = ReactDOM;
animusCreateRoot(document.getElementById("root")).render(<AnimusInstrument />);
