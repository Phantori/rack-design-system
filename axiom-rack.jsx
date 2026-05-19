/* =====================================================
   AXIOM SIGNAL CHAIN RACK
   The Axiom Signal Chain Rack — rebuilt on the
   Timeline · BioSpark Procedural Rack Design System.
   Modules: Concordance · Axiom Carver · Persona Forger
            ChronoFlow · Nebula Monitor · Nexus Patch Bay
   ===================================================== */

const { useState: useAxS, useEffect: useAxE, useRef: useAxR, useMemo: useAxM } = React;

/* =====================================================
   VORTEX VISUALIZER — Concordance portal display
   ===================================================== */
function VortexViz({ size = 160 }) {
  const ref = useAxR(null);
  useFrame((t) => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d");
    const w = c.width, h = c.height;
    ctx.clearRect(0, 0, w, h);
    const cx = w / 2, cy = h / 2, R = w / 2 - 6;

    // Background void
    const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
    bg.addColorStop(0, "rgba(10,5,25,1)");
    bg.addColorStop(1, "rgba(5,4,15,1)");
    ctx.fillStyle = bg;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();

    // Galaxy spiral arms
    for (let arm = 0; arm < 3; arm++) {
      const armAngle = (arm / 3) * Math.PI * 2 + t * 0.35;
      ctx.beginPath();
      const colors = [
        [0, 191, 255],
        [148, 0, 211],
        [255, 20, 147],
      ];
      const [r, g, b] = colors[arm];
      for (let i = 0; i < 180; i++) {
        const u = i / 180;
        const a = u * Math.PI * 5 + armAngle;
        const rad = u * R * 0.88;
        const x = cx + Math.cos(a) * rad;
        const y = cy + Math.sin(a) * rad;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `rgba(${r},${g},${b},0.35)`;
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    // Rotating particle ring
    for (let i = 0; i < 36; i++) {
      const a = (i / 36) * Math.PI * 2 + t * 0.6;
      const rr = R * 0.48 + Math.sin(t * 1.8 + i * 0.5) * R * 0.12;
      const x = cx + Math.cos(a) * rr;
      const y = cy + Math.sin(a) * rr;
      const alpha = 0.5 + Math.sin(t * 2 + i) * 0.3;
      ctx.fillStyle = `rgba(0,191,255,${alpha})`;
      ctx.shadowColor = "rgba(0,191,255,1)";
      ctx.shadowBlur = 5;
      ctx.beginPath(); ctx.arc(x, y, 1.8, 0, Math.PI * 2); ctx.fill();
    }
    ctx.shadowBlur = 0;

    // Inner glow (accent core)
    const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.32);
    coreGrad.addColorStop(0, "rgba(255,20,147,0.95)");
    coreGrad.addColorStop(0.35, "rgba(148,0,211,0.55)");
    coreGrad.addColorStop(1, "transparent");
    ctx.fillStyle = coreGrad;
    ctx.beginPath(); ctx.arc(cx, cy, R * 0.32, 0, Math.PI * 2); ctx.fill();

    // Outer rim glow
    ctx.strokeStyle = "rgba(0,191,255,0.22)";
    ctx.lineWidth = 2;
    ctx.shadowColor = "rgba(0,191,255,0.6)";
    ctx.shadowBlur = 12;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
    ctx.shadowBlur = 0;
  }, []);

  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", overflow: "hidden",
      boxShadow: "0 0 24px rgba(0,191,255,0.25), 0 0 60px rgba(148,0,211,0.15), inset 0 0 0 1px rgba(0,191,255,0.2)",
      flexShrink: 0,
    }}>
      <canvas ref={ref} width={size * 2} height={size * 2} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}

/* =====================================================
   NEBULA VISUALIZER — constellation + nebula field
   ===================================================== */
function NebulaViz({ width = 700, height = 130, label = "NEBULA SYSTEMS" }) {
  const ref = useAxR(null);
  const dataRef = useAxR(null);

  useAxE(() => {
    const W = width, H = height;
    const clusters = [
      { cx: W * 0.12, cy: H * 0.45, color: [0, 191, 255] },
      { cx: W * 0.38, cy: H * 0.3,  color: [148, 0, 211] },
      { cx: W * 0.62, cy: H * 0.55, color: [255, 20, 147] },
      { cx: W * 0.86, cy: H * 0.4,  color: [0, 191, 255] },
    ];
    dataRef.current = {
      stars: Array.from({ length: 48 }, (_, i) => {
        const cluster = clusters[i % clusters.length];
        const spread = W * 0.1;
        return {
          x: cluster.cx + (Math.random() - 0.5) * spread,
          y: cluster.cy + (Math.random() - 0.5) * spread,
          r: 0.8 + Math.random() * 2.2,
          alpha: 0.4 + Math.random() * 0.6,
          pulse: Math.random() * Math.PI * 2,
          color: cluster.color,
          cluster: i % clusters.length,
        };
      }),
      clusters,
    };
  }, [width, height]);

  useFrame((t) => {
    const c = ref.current; if (!c) return;
    const d = dataRef.current; if (!d) return;
    const ctx = c.getContext("2d");
    const W = c.width, H = c.height;
    const scaleX = W / width, scaleY = H / height;
    ctx.clearRect(0, 0, W, H);

    // Nebula glows
    d.clusters.forEach((cl, ci) => {
      const pulse = 0.12 + Math.sin(t * 0.4 + ci * 1.3) * 0.04;
      const [r, g, b] = cl.color;
      const grad = ctx.createRadialGradient(
        cl.cx * scaleX, cl.cy * scaleY, 0,
        cl.cx * scaleX, cl.cy * scaleY, width * 0.14 * scaleX
      );
      grad.addColorStop(0, `rgba(${r},${g},${b},${pulse})`);
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cl.cx * scaleX, cl.cy * scaleY, width * 0.14 * scaleX, 0, Math.PI * 2);
      ctx.fill();
    });

    // Constellation lines
    ctx.lineWidth = 0.9;
    for (let i = 0; i < d.stars.length; i++) {
      for (let j = i + 1; j < d.stars.length; j++) {
        if (d.stars[i].cluster !== d.stars[j].cluster) continue;
        const dx = d.stars[i].x - d.stars[j].x;
        const dy = d.stars[i].y - d.stars[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > width * 0.14) continue;
        const [r, g, b] = d.stars[i].color;
        const fade = (1 - dist / (width * 0.14)) * 0.5;
        ctx.strokeStyle = `rgba(${r},${g},${b},${fade})`;
        ctx.beginPath();
        ctx.moveTo(d.stars[i].x * scaleX, d.stars[i].y * scaleY);
        ctx.lineTo(d.stars[j].x * scaleX, d.stars[j].y * scaleY);
        ctx.stroke();
      }
    }

    // Stars
    d.stars.forEach((s) => {
      const pulse = Math.sin(t * 1.8 + s.pulse) * 0.3 + 0.7;
      const alpha = s.alpha * pulse;
      const [r, g, b] = s.color;
      const sx = s.x * scaleX, sy = s.y * scaleY;
      // glow halo
      const gGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, s.r * 5);
      gGrad.addColorStop(0, `rgba(${r},${g},${b},${alpha * 0.6})`);
      gGrad.addColorStop(1, "transparent");
      ctx.fillStyle = gGrad;
      ctx.beginPath(); ctx.arc(sx, sy, s.r * 5, 0, Math.PI * 2); ctx.fill();
      // star core
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.beginPath(); ctx.arc(sx, sy, s.r, 0, Math.PI * 2); ctx.fill();
    });
  }, []);

  return (
    <div className="viz mat-screen" style={{ width, height, flex: 1 }}>
      <canvas ref={ref} width={width * 2} height={height * 2}
              style={{ width: "100%", height: "100%" }} />
      {label && <div className="viz-label engrave">{label}</div>}
    </div>
  );
}

/* =====================================================
   MODULE 00 — CONCORDANCE · Global Master Output
   ===================================================== */
function ModuleConcordance() {
  return (
    <div className="axiom-module" style={{ "--axiom-ch": "var(--signal-cool)" }}>
      <div className="axiom-module-head">
        <div className="axiom-module-crest" style={{ color: "var(--signal-cool)" }}>{Crests.nexus}</div>
        <div className="axiom-module-name">CONCORDANCE</div>
        <div className="axiom-module-sub">GLOBAL HARMONICS · SYSTEM MASTER OUTPUT</div>
        <div style={{ display: "flex", gap: 6 }}>
          <LED on channel="cool" size={7} /><LED on channel="myth" size={7} /><LED on channel="rose" size={7} />
        </div>
        <div className="axiom-module-num">00</div>
        <div className="screw" /><div className="screw" />
      </div>
      <div className="axiom-module-body">
        {/* Left — Resonance scope */}
        <div className="axiom-section" style={{ alignItems: "center", flexShrink: 0 }}>
          <div className="axiom-section-label">RESONANCE</div>
          <PhaseScope size={118} channel="rose" label="" />
          <div className="readout" style={{ fontSize: 9 }}>ω 3.14 · Φ 0.618</div>
        </div>

        {/* Center — Vortex portal */}
        <div className="axiom-section" style={{ alignItems: "center", flex: 1, gap: 10 }}>
          <VortexViz size={168} />
          <div style={{
            fontFamily: "var(--font-engrave)", fontSize: 9, letterSpacing: "0.24em",
            color: "var(--signal-cool)", textShadow: "0 0 8px var(--signal-cool)",
            textTransform: "uppercase",
          }}>Astral Gateway · Live</div>
        </div>

        {/* Right — Harmonics controls */}
        <div className="axiom-section" style={{ flexShrink: 0, gap: 10 }}>
          <div className="axiom-section-label">RESONANCE</div>
          <div style={{ display: "flex", gap: 10 }}>
            <Knob label="ILLUMINATE" channel="cool" variant="arc" size={52} defaultValue={0.72} />
            <Knob label="DETACHMENT" channel="rose" variant="arc" size={52} defaultValue={0.45} />
          </div>
          <div className="axiom-section-label" style={{ marginTop: 4 }}>HARMONICS</div>
          <div style={{ display: "flex", gap: 8 }}>
            <Knob label="PHASE" channel="myth" variant="dotted" ticks={9} size={44} defaultValue={0.6} />
            <Knob label="WAVE" channel="cool" variant="ringed" size={44} defaultValue={0.38} />
            <Knob label="SYNC" channel="rose" variant="pip" size={44} defaultValue={0.55} />
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
            <GateBtn label="SEAL" channel="life" lit />
            <GateBtn label="BROADCAST" channel="cool" />
          </div>
        </div>
      </div>
      <div className="axiom-module-patch">
        <div className="patch-group">
          <div className="patch-group-label">MAIN OUT</div>
          <div className="patch-group-jacks">
            <Jack label="L" channel="cool" active /><Jack label="R" channel="cool" active />
            <Jack label="Σ" channel="myth" active /><Jack label="⊕" channel="rose" />
          </div>
        </div>
        <div className="patch-group">
          <div className="patch-group-label">HARMONICS</div>
          <div className="patch-group-jacks">
            <Jack label="H1" channel="cool" active /><Jack label="H2" channel="myth" /><Jack label="H3" channel="rose" />
          </div>
        </div>
        <div className="patch-group">
          <div className="patch-group-label">RESONANCE</div>
          <div className="patch-group-jacks">
            <Jack label="◍" channel="cool" active /><Jack label="↺" channel="myth" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   MODULE 01 — AXIOM CARVER · Universal Law Engine
   ===================================================== */
function ModuleAxiomCarver() {
  return (
    <div className="axiom-module" style={{ "--axiom-ch": "var(--signal-myth)" }}>
      <div className="axiom-module-head">
        <div className="axiom-module-crest" style={{ color: "var(--signal-myth)" }}>{Crests.axiom}</div>
        <div className="axiom-module-name">AXIOM CARVER</div>
        <div className="axiom-module-sub">FUNDAMENTAL LAW ENGINE · CAUSAL FIDELITY · ENTROPIC DECAY</div>
        <div className="axiom-module-num">01</div>
        <div className="screw" /><div className="screw" />
      </div>
      <div className="axiom-module-body">
        {/* Law Knobs */}
        <div className="axiom-section" style={{ flex: 1 }}>
          <div className="axiom-section-label">Universal Constants</div>
          <div style={{ display: "flex", gap: 20, alignItems: "flex-end" }}>
            <div style={{ textAlign: "center" }}>
              <Knob label="ANCHOR" channel="myth" variant="forge" size={68} ticks={13} defaultValue={0.62} />
              <div style={{ fontFamily: "var(--font-engrave)", fontSize: 7, color: "var(--ink-dim)", letterSpacing: "0.12em", marginTop: 2 }}>TEMPORAL FOCUS</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <Knob label="DIMENSION" channel="myth" variant="arc" size={68} ticks={13} defaultValue={0.44} />
              <div style={{ fontFamily: "var(--font-engrave)", fontSize: 7, color: "var(--ink-dim)", letterSpacing: "0.12em", marginTop: 2 }}>CAUSAL DENSITY</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <Knob label="HEIGHT" channel="cool" variant="arc" size={68} ticks={13} bipolar defaultValue={0.5} />
              <div style={{ fontFamily: "var(--font-engrave)", fontSize: 7, color: "var(--ink-dim)", letterSpacing: "0.12em", marginTop: 2 }}>PHASIC SHIFT</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <Knob label="DECAY" channel="rose" variant="dotted" size={68} ticks={9} defaultValue={0.3} />
              <div style={{ fontFamily: "var(--font-engrave)", fontSize: 7, color: "var(--ink-dim)", letterSpacing: "0.12em", marginTop: 2 }}>ENTROPIC FADE</div>
            </div>
          </div>
        </div>

        {/* Axiom Waveform */}
        <div className="axiom-section" style={{ flex: 1.4, gap: 8 }}>
          <div className="axiom-section-label">Axiom Waveform · Consequence Chain</div>
          <PhaseScope size={130} channel="myth" label="LISSAJOUS · CAUSAL FIDELITY" />
          <CurveEditor width={260} height={58} channel="myth" label="CONSEQUENCE OUTPUT CURVE" />
        </div>
      </div>
      <div className="axiom-module-patch">
        <div className="patch-group">
          <div className="patch-group-label">AXIOM IN</div>
          <div className="patch-group-jacks">
            <Jack label="C" channel="myth" /><Jack label="G" channel="cool" /><Jack label="E" channel="rose" />
          </div>
        </div>
        <div className="patch-group">
          <div className="patch-group-label">CONSEQUENCE OUT</div>
          <div className="patch-group-jacks">
            <Jack label="↗" channel="myth" active /><Jack label="↘" channel="cool" active />
            <Jack label="∿" channel="rose" active /><Jack label="⊗" channel="myth" />
          </div>
        </div>
        <div className="patch-group">
          <div className="patch-group-label">MODULATE</div>
          <div className="patch-group-jacks">
            <Jack label="D" channel="rose" /><Jack label="T" channel="amber" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   MODULE 02 — PERSONA FORGER · Entity Creation (Animus)
   ===================================================== */
function ModulePersonaForger() {
  const archetypes = ["HERO", "SAGE", "TRICK", "ANIMA", "SHADE"];
  const channels = ["cool", "life", "myth", "rose", "warm"];

  return (
    <div className="axiom-module" style={{ "--axiom-ch": "var(--signal-amber)" }}>
      <div className="axiom-module-head">
        <div className="axiom-module-crest" style={{ color: "var(--signal-amber)" }}>{Crests.animus}</div>
        <div className="axiom-module-name">PERSONA FORGER</div>
        <div className="axiom-module-sub">ENTITY CREATION · ARCHETYPE FADERS · PSYCHE SPECTRUM · ANIMUS</div>
        <div className="axiom-module-num">02</div>
        <div className="screw" /><div className="screw" />
      </div>
      <div className="axiom-module-body">
        {/* Archetype Faders */}
        <div className="axiom-section" style={{ flexShrink: 0 }}>
          <div className="axiom-section-label">Archetype Mix</div>
          <div className="axiom-fader-group">
            {archetypes.map((a, i) => (
              <div key={a} className="axiom-fader-cell">
                <div className="axiom-fader-label" style={{ color: `var(--signal-${channels[i]})`, textShadow: `0 0 6px var(--signal-${channels[i]})` }}>{a}</div>
                <Fader channel={channels[i]} height={120} width={22} label="" showScale={false}
                       defaultValue={[0.72, 0.45, 0.38, 0.6, 0.25][i]} />
                <LED on={i < 3} channel={channels[i]} size={6} />
              </div>
            ))}
          </div>
        </div>

        {/* Motive LFOs */}
        <div className="axiom-section" style={{ flexShrink: 0, gap: 10 }}>
          <div className="axiom-section-label">Motive LFOs</div>
          <Knob label="AMBITION" channel="cool" variant="arc" size={44} defaultValue={0.68} />
          <Knob label="SURVIVAL" channel="rose" variant="arc" size={44} defaultValue={0.82} />
          <Knob label="EMPATHY" channel="life" variant="dotted" ticks={7} size={44} defaultValue={0.5} />
          <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
            <Switch positions={3} labels={["LOW", "MED", "HI"]} channel="amber" />
          </div>
        </div>

        {/* Psyche Spectrum */}
        <div className="axiom-section" style={{ flex: 1, gap: 8 }}>
          <div className="axiom-section-label">Psyche Spectrum · Emotional State</div>
          <Spectrum width={280} height={90} bands={28} channel="rose" label="PSYCHE SPECTRUM" />
          <Waveform width={280} height={52} channel="myth" label="ANIMA WAVEFORM" />
        </div>
      </div>
      <div className="axiom-module-patch">
        <div className="patch-group">
          <div className="patch-group-label">ARCHETYPE IN</div>
          <div className="patch-group-jacks">
            <Jack label="H" channel="cool" /><Jack label="S" channel="life" /><Jack label="T" channel="myth" />
          </div>
        </div>
        <div className="patch-group">
          <div className="patch-group-label">ANIMA OUT</div>
          <div className="patch-group-jacks">
            <Jack label="A" channel="rose" active /><Jack label="V" channel="myth" active /><Jack label="Ψ" channel="amber" active />
          </div>
        </div>
        <div className="patch-group">
          <div className="patch-group-label">VOCALIC</div>
          <div className="patch-group-jacks">
            <Jack label="F" channel="warm" /><Jack label="R" channel="warm" active />
          </div>
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   MODULE 03 — CHRONOFLOW SEQUENCER · Time & Narrative
   ===================================================== */
function ModuleChronoflow() {
  const [step, setStep] = useAxS(0);
  useAxE(() => {
    const id = setInterval(() => setStep(s => (s + 1) % 8), 220);
    return () => clearInterval(id);
  }, []);

  const events = ["GENESIS", "RISING", "PIVOT", "APEX", "TURN", "FALL", "CRISIS", "RESOLVE"];
  const eventChs = ["cool", "life", "myth", "rose", "amber", "warm", "hot", "life"];

  return (
    <div className="axiom-module" style={{ "--axiom-ch": "var(--signal-amber)" }}>
      <div className="axiom-module-head">
        <div className="axiom-module-crest" style={{ color: "var(--signal-amber)" }}>{Crests.chronicle}</div>
        <div className="axiom-module-name">CHRONOFLOW SEQUENCER</div>
        <div className="axiom-module-sub">TEMPORAL DRIFT · NEXUS EVENTS · EPOCH SCRUBBER · PROBABILITY AMPLITUDE</div>
        <div className="axiom-module-num">03</div>
        <div className="screw" /><div className="screw" />
      </div>
      <div className="axiom-module-body" style={{ alignItems: "center" }}>
        {/* Epoch Scrubber */}
        <div className="axiom-epoch" style={{ flexShrink: 0 }}>
          <div className="axiom-section-label">Epoch Scrubber</div>
          <Knob label="EPOCH" channel="amber" variant="forge" size={100} ticks={21} defaultValue={0.42} />
          <div className="readout" style={{ fontSize: 9 }}>NEXUS · ACT II</div>
        </div>

        {/* Nexus Events */}
        <div className="axiom-section" style={{ flex: 1 }}>
          <div className="axiom-section-label">Nexus Events · 8 Steps</div>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
            {events.map((ev, i) => (
              <div key={ev} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                <Knob channel={eventChs[i]} variant="arc" size={38}
                      defaultValue={[0.7, 0.5, 0.85, 0.4, 0.6, 0.3, 0.75, 0.9][i]} showValue={false} />
                <Pad label={i === step ? "●" : String(i + 1)}
                     channel={eventChs[i]} size={26} lit={i === step} />
                <div style={{ fontFamily: "var(--font-engrave)", fontSize: 6, color: "var(--ink-dim)", letterSpacing: "0.1em", textAlign: "center" }}>{ev}</div>
              </div>
            ))}
          </div>

          {/* Timeline display */}
          <div style={{ marginTop: 8 }}>
            <PianoRoll width={540} height={52} channel="amber" label="NEXUS TIMELINE" />
          </div>

          {/* Transport + readouts */}
          <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center" }}>
            <Pad label="◀◀" channel="cool" size={24} /><Pad label="◀" channel="cool" size={24} />
            <Pad label="▶" channel="life" size={24} lit /><Pad label="■" channel="hot" size={24} />
            <Pad label="●" channel="hot" size={24} />
            <div style={{ marginLeft: 8, display: "flex", gap: 6 }}>
              <Readout label="EPOCH" value="II.04" channel="amber" width={64} />
              <Readout label="DRIFT" value={`+${(step * 0.17).toFixed(2)}`} channel="cool" width={64} />
              <Readout label="PROB" value="0.847" channel="myth" width={64} />
            </div>
          </div>
        </div>
      </div>
      <div className="axiom-module-patch">
        <div className="patch-group">
          <div className="patch-group-label">CLOCK IN</div>
          <div className="patch-group-jacks">
            <Jack label="◍" channel="amber" active={step % 4 === 0} /><Jack label="↺" channel="amber" />
          </div>
        </div>
        <div className="patch-group">
          <div className="patch-group-label">NEXUS GATES</div>
          <div className="patch-group-jacks">
            {["G1","G2","G3","G4"].map((g, i) => (
              <Jack key={g} label={g} channel="life" active={step === i} />
            ))}
          </div>
        </div>
        <div className="patch-group">
          <div className="patch-group-label">TEMPORAL CV</div>
          <div className="patch-group-jacks">
            <Jack label="T" channel="cool" active /><Jack label="D" channel="myth" />
            <Jack label="P" channel="rose" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   MODULE 04 — NEBULA SYSTEMS MONITOR · Infrastructure
   ===================================================== */
function ModuleNebula() {
  return (
    <div className="axiom-module" style={{ "--axiom-ch": "var(--signal-cool)" }}>
      <div className="axiom-module-head">
        <div className="axiom-module-crest" style={{ color: "var(--signal-cool)" }}>{Crests.continuum}</div>
        <div className="axiom-module-name">NEBULA SYSTEMS MONITOR</div>
        <div className="axiom-module-sub">STELLAR CLUSTER ARCHITECTURE · VOID LATTICE INTEGRITY · QUANTUM FIELD STATUS</div>
        <div className="axiom-module-num">04</div>
        <div className="screw" /><div className="screw" />
      </div>
      <div className="axiom-module-body" style={{ alignItems: "center", gap: 16 }}>
        {/* Main constellation display */}
        <NebulaViz width={560} height={130} label="STELLAR CLUSTER MAP · SYSTEM LOAD" />

        {/* Side status */}
        <div className="axiom-section" style={{ flexShrink: 0, gap: 10 }}>
          <div className="axiom-section-label">Void Lattice</div>
          <Polar size={110} channel="cool" label="GRID INTEGRITY" />
          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 4 }}>
            <VU width={120} height={12} channel="life" label="CLUSTER A" />
            <VU width={120} height={12} channel="cool" label="CLUSTER B" />
            <VU width={120} height={12} channel="amber" label="CLUSTER C" />
            <VU width={120} height={12} channel="hot" label="STRESS" />
          </div>
        </div>
      </div>
      <div className="axiom-module-patch">
        <div className="patch-group">
          <div className="patch-group-label">TELEMETRY IN</div>
          <div className="patch-group-jacks">
            <Jack label="α" channel="cool" active /><Jack label="β" channel="life" active /><Jack label="γ" channel="myth" />
          </div>
        </div>
        <div className="patch-group">
          <div className="patch-group-label">ALERT OUT</div>
          <div className="patch-group-jacks">
            <Jack label="!" channel="hot" /><Jack label="◐" channel="amber" active /><Jack label="◑" channel="life" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   MODULE 05 — NEXUS PATCH BAY · Signal Routing
   ===================================================== */
function ModuleNexusPatchBay() {
  const rackRef = useAxR(null);
  const [paths, setPaths] = useAxS([]);

  // Jack grid: 4 rows × 16 cols
  const ROWS = [
    { label: "AXIOM", ch: "myth" },
    { label: "NARR",  ch: "cool" },
    { label: "AUDIO", ch: "warm" },
    { label: "CV",    ch: "rose" },
  ];

  // pre-wired cable connections (row-col pairs)
  const CABLES = [
    { fromRow: 0, fromCol: 2,  toRow: 1, toCol: 7,  color: "var(--signal-myth)" },
    { fromRow: 1, fromCol: 4,  toRow: 2, toCol: 9,  color: "var(--signal-cool)" },
    { fromRow: 2, fromCol: 1,  toRow: 3, toCol: 5,  color: "var(--signal-warm)" },
    { fromRow: 0, fromCol: 10, toRow: 2, toCol: 14, color: "var(--signal-myth)" },
    { fromRow: 1, fromCol: 12, toRow: 3, toCol: 3,  color: "var(--signal-rose)" },
    { fromRow: 3, fromCol: 8,  toRow: 0, toCol: 15, color: "var(--signal-rose)" },
    { fromRow: 2, fromCol: 6,  toRow: 1, toCol: 0,  color: "var(--signal-warm)" },
  ];

  const COLS = 16;
  const JACK_SIZE = 22;
  const JACK_GAP = 4;

  useAxE(() => {
    if (!rackRef.current) return;
    const compute = () => {
      const container = rackRef.current;
      const rect = container.getBoundingClientRect();
      const jacks = container.querySelectorAll(".jack");
      const jackArray = Array.from(jacks);
      const found = CABLES.map(({ fromRow, fromCol, toRow, toCol, color }) => {
        const fromIdx = fromRow * COLS + fromCol;
        const toIdx = toRow * COLS + toCol;
        const a = jackArray[fromIdx];
        const b = jackArray[toIdx];
        if (!a || !b) return null;
        const ar = a.getBoundingClientRect();
        const br = b.getBoundingClientRect();
        return {
          x1: ar.left - rect.left + ar.width / 2,
          y1: ar.top - rect.top + ar.height / 2,
          x2: br.left - rect.left + br.width / 2,
          y2: br.top - rect.top + br.height / 2,
          color,
        };
      }).filter(Boolean);
      setPaths(found);
    };
    const t1 = setTimeout(compute, 100);
    const t2 = setTimeout(compute, 400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className="axiom-module" style={{ "--axiom-ch": "var(--signal-bone)" }}>
      <div className="axiom-module-head">
        <div className="axiom-module-crest" style={{ color: "var(--signal-bone)" }}>{Crests.nexus}</div>
        <div className="axiom-module-name">NEXUS PATCH BAY</div>
        <div className="axiom-module-sub">BIOLUMINESCENT SIGNAL ROUTING · 4 × 16 MATRIX · CORE CONCEPT PATCHING</div>
        <div className="axiom-module-num">05</div>
        <div className="screw" /><div className="screw" />
      </div>
      <div className="axiom-module-body" style={{ flexDirection: "column", gap: 8, position: "relative" }}
           ref={rackRef}>
        {/* Jack matrix */}
        {ROWS.map((row) => (
          <div key={row.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              fontFamily: "var(--font-engrave)", fontSize: 8, letterSpacing: "0.16em",
              color: `var(--signal-${row.ch})`, textShadow: `0 0 4px var(--signal-${row.ch})`,
              width: 44, textAlign: "right", flexShrink: 0,
            }}>{row.label}</div>
            <div style={{ display: "flex", gap: JACK_GAP }}>
              {Array.from({ length: COLS }).map((_, ci) => (
                <Jack key={ci} channel={row.ch} active={ci % 5 === 2} />
              ))}
            </div>
          </div>
        ))}

        {/* SVG cable overlay */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 5 }}>
          <defs>
            <filter id="nexus-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          {paths.map((p, i) => {
            const sag = 20 + Math.abs(p.x2 - p.x1) * 0.1 + Math.abs(p.y2 - p.y1) * 0.4;
            const mx = (p.x1 + p.x2) / 2;
            const my = Math.max(p.y1, p.y2) + sag;
            const d = `M ${p.x1} ${p.y1} Q ${mx} ${my} ${p.x2} ${p.y2}`;
            return (
              <g key={i}>
                <path d={d} stroke={p.color} strokeWidth="4" fill="none" opacity="0.3" filter="url(#nexus-glow)" />
                <path d={d} stroke={p.color} strokeWidth="2.2" fill="none" strokeLinecap="round" opacity="0.9" />
                <path d={d} stroke="rgba(255,255,255,0.5)" strokeWidth="0.6" fill="none" strokeDasharray="2 8" opacity="0.6">
                  <animate attributeName="stroke-dashoffset" from="0" to="-20" dur="1s" repeatCount="indefinite" />
                </path>
                <circle cx={p.x1} cy={p.y1} r="3.5" fill={p.color} opacity="0.9" />
                <circle cx={p.x2} cy={p.y2} r="3.5" fill={p.color} opacity="0.9" />
              </g>
            );
          })}
        </svg>
      </div>
      <div className="axiom-module-patch">
        <div className="patch-group">
          <div className="patch-group-label">THROUGHPUT</div>
          <div className="patch-group-jacks">
            <Jack label="IN" channel="cool" active /><Jack label="OUT" channel="cool" active />
            <Jack label="THR" channel="myth" /><Jack label="MIX" channel="rose" active />
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "flex-end" }}>
          <GateBtn label="LOCK" channel="amber" />
          <GateBtn label="CLEAR" channel="hot" />
          <GateBtn label="SAVE" channel="life" lit />
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   AXIOM RACK — full vertical assembly
   ===================================================== */
function AxiomRack() {
  const SCREWS = 14;
  const Rail = () => (
    <div className="axiom-rail">
      {Array.from({ length: SCREWS }).map((_, i) => <div key={i} className="screw" />)}
    </div>
  );

  return (
    <div className="axiom-page">
      <div style={{ width: "100%", maxWidth: 1020 }}>
        {/* Page header */}
        <div style={{
          marginBottom: 20,
          display: "flex", alignItems: "baseline", gap: 20,
          borderBottom: "1px solid rgba(0,191,255,0.12)",
          paddingBottom: 16,
        }}>
          <div style={{
            fontFamily: "var(--font-display)", fontSize: 28, letterSpacing: "0.1em",
            fontWeight: 700, textTransform: "uppercase", color: "var(--ink)",
          }}>The Axiom Signal Chain</div>
          <div style={{ fontFamily: "var(--font-engrave)", fontSize: 10, letterSpacing: "0.22em", color: "var(--signal-cool)", textShadow: "0 0 6px var(--signal-cool)" }}>
            Timeline · BioSpark Studios · Rack v0.7
          </div>
          <div style={{ marginLeft: "auto", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--signal-life)", textShadow: "0 0 6px var(--signal-life)" }}>
            ● ALL SYSTEMS LIVE
          </div>
        </div>

        {/* The rack */}
        <div className="axiom-rack">
          <Rail />
          <div className="axiom-rack-body">
            {/* Rack nameplate */}
            <div className="axiom-rack-title">
              <div style={{ color: "var(--signal-cool)", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {Crests.nexus}
              </div>
              <div className="axiom-rack-title-name">Axiom Signal Chain Rack</div>
              <div className="axiom-rack-title-sub">World Weaver · Logic Scribe · Ontological Sound Design</div>
              <div style={{ display: "flex", gap: 8 }}>
                <Readout label="UNIT" value="ASC-01" channel="cool" width={70} />
                <Readout label="STATUS" value="ONLINE" channel="life" width={70} />
              </div>
              <LED on channel="life" size={8} />
            </div>

            <ModuleConcordance />
            <ModuleAxiomCarver />
            <ModulePersonaForger />
            <ModuleChronoflow />
            <ModuleNebula />
            <ModuleNexusPatchBay />
          </div>
          <Rail />
        </div>

        {/* Cable legend */}
        <div style={{
          marginTop: 16, display: "flex", gap: 24,
          fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-mid)", letterSpacing: "0.08em",
        }}>
          {[
            { color: "var(--signal-myth)", label: "Axiom · consequence" },
            { color: "var(--signal-cool)", label: "Narrative · data" },
            { color: "var(--signal-warm)", label: "Audio · voice" },
            { color: "var(--signal-rose)", label: "Resonance · affect" },
            { color: "var(--signal-amber)", label: "Temporal · clock" },
          ].map(({ color, label }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ color, textShadow: `0 0 4px ${color}`, fontSize: 16 }}>━</span>
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<AxiomRack />);
