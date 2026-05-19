/* =====================================================
   MASTER TRANSPORT
   Global simulation control surface — sticky header
   Shared across all instrument rack panels.

   Modes:
     AUTHOR   — edits GenesisContainer spec (amber)
     LIVE     — monitors running sim via WebSocket (green)
     PLAYBACK — scrubs Chronicle log replay (blue)

   Sacred tempos (musical subdivisions of resonance Hz):
     432 Hz / 4 = 108 BPM  · FORGE · soul-weight zero
      88 Hz / 1 =  88 BPM  · HUM   · desperate equilibrium
     440 Hz / 4 = 110 BPM  · VORA  · void handshake
   ===================================================== */

const { useState: useMTS, useEffect: useMTE, useRef: useMTR, useCallback: useMTC } = React;

/* ── Tempo waveform — pulses at current BPM ── */
function TempoWave({ bpm, playing, paused, mode, width = 260, height = 28 }) {
  const ref = useMTR(null);
  const phaseRef = useMTR(0);

  useFrame((t) => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d");
    const W = c.width, H = c.height;
    ctx.clearRect(0, 0, W, H);

    const modeColor =
      mode === "live"     ? [60, 220, 100] :
      mode === "playback" ? [30, 140, 255] :
                            [255, 160, 30];

    const [r, g, b] = modeColor;

    // Advance phase only when playing + not paused
    if (playing && !paused) {
      phaseRef.current += (bpm / 60) * (1 / 60) * Math.PI * 2;
    }

    const phase = phaseRef.current;
    const pts = W;

    // Background grid lines
    ctx.strokeStyle = "rgba(255,255,255,0.04)";
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 4; i++) {
      const y = (i / 3) * H;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // Main wave
    ctx.beginPath();
    for (let i = 0; i <= pts; i++) {
      const u = i / pts;
      const freq = 2; // 2 cycles per view
      const wave =
        Math.sin(u * freq * Math.PI * 2 + phase) * 0.5 +
        Math.sin(u * freq * 3 * Math.PI * 2 + phase * 1.5) * 0.15 +
        Math.sin(u * freq * 5 * Math.PI * 2 - phase * 0.7) * 0.08;
      const y = H / 2 + wave * (H * 0.38);
      if (i === 0) ctx.moveTo(i, y); else ctx.lineTo(i, y);
    }

    const alpha = playing && !paused ? 0.85 : 0.25;
    ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
    ctx.lineWidth = 1.5;
    ctx.shadowColor = `rgba(${r},${g},${b},0.5)`;
    ctx.shadowBlur = playing && !paused ? 6 : 0;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Beat pulse markers
    const beatsVisible = freq * 2;
    for (let i = 0; i < beatsVisible; i++) {
      const beatPhaseOffset = (phase / (Math.PI * 2)) % 1;
      const bx = ((i / beatsVisible + 1 - beatPhaseOffset) % 1) * W;
      const pulseAlpha = playing && !paused ? 0.5 : 0.12;
      ctx.fillStyle = `rgba(${r},${g},${b},${pulseAlpha})`;
      ctx.fillRect(bx - 0.5, 0, 1, H);
    }
  }, [bpm, playing, paused, mode]);

  return (
    <canvas
      ref={ref}
      width={width * 2}
      height={height * 2}
      className="mt-wave-canvas"
      style={{ width, height }}
    />
  );
}

/* ── Master Transport component ── */
function MasterTransport({ moduleId = "atlas", moduleName = "ATLAS · TERRAIN", moduleColor = "var(--signal-cool)" }) {
  const [mode, setMode]         = useMTS("author");
  const [playing, setPlaying]   = useMTS(false);
  const [paused, setPaused]     = useMTS(false);
  const [recording, setRecording] = useMTS(false);
  const [bpm, setBpm]           = useMTS(120.0);
  const [bar, setBar]           = useMTS(1);
  const [beat, setBeat]         = useMTS(1);
  const [tick, setTick]         = useMTS(0);

  const BEATS_PER_BAR = 4;
  const TICKS_PER_BEAT = 4;

  // Advance bar/beat/tick counter
  useMTE(() => {
    if (!playing || paused) return;
    const msPerTick = (60000 / bpm) / TICKS_PER_BEAT;
    const id = setInterval(() => {
      setTick(t => {
        const next = t + 1;
        const totalTicks = next;
        const b = Math.floor(totalTicks / TICKS_PER_BEAT) % BEATS_PER_BAR;
        const br = Math.floor(totalTicks / (TICKS_PER_BEAT * BEATS_PER_BAR)) + 1;
        setBeat(b + 1);
        setBar(br);
        return next;
      });
    }, msPerTick);
    return () => clearInterval(id);
  }, [playing, paused, bpm]);

  const handlePlay = () => {
    if (paused) { setPaused(false); return; }
    setPlaying(true); setPaused(false);
  };
  const handlePause = () => {
    if (!playing) return;
    setPaused(p => !p);
  };
  const handleStop = () => {
    setPlaying(false); setPaused(false); setRecording(false);
    setBar(1); setBeat(1); setTick(0);
  };
  const handleRecord = () => {
    if (!playing) { setPlaying(true); setPaused(false); }
    setRecording(r => !r);
  };
  const handleRewind = () => {
    setBar(1); setBeat(1); setTick(0);
  };

  const hz = (bpm / 60).toFixed(3);

  // Sacred frequency snap tempos
  const SACRED = [
    { bpm: 108, label: "108 · FORGE", cls: "forge", title: "432Hz ÷ 4 · Soul-weight zero" },
    { bpm: 88,  label: "88 · HUM",   cls: "hum",   title: "88Hz · Desperate Equilibrium" },
    { bpm: 110, label: "110 · VORA", cls: "vora",  title: "440Hz ÷ 4 · Void handshake" },
  ];

  const modeLabel = { author: "AUTHOR", live: "LIVE", playback: "PLAYBACK" }[mode];

  const modColor =
    mode === "live"     ? "var(--signal-life)" :
    mode === "playback" ? "var(--signal-cool)" :
                          "var(--signal-amber)";

  // 16 module status indicators
  const MODULES = [
    { code: "TERR", on: true,  ch: "cool"  },
    { code: "ENVI", on: false, ch: "life"  },
    { code: "ARCH", on: false, ch: "cool"  },
    { code: "LITE", on: false, ch: "warm"  },
    { code: "MODL", on: false, ch: "myth"  },
    { code: "CHOR", on: false, ch: "cool"  },
    { code: "BEHV", on: false, ch: "rose"  },
    { code: "SOCY", on: false, ch: "amber" },
    { code: "SEQR", on: false, ch: "amber" },
    { code: "STOR", on: false, ch: "myth"  },
    { code: "MEMO", on: false, ch: "cool"  },
    { code: "SOND", on: false, ch: "warm"  },
    { code: "LOGC", on: false, ch: "life"  },
    { code: "SIML", on: false, ch: "amber" },
    { code: "FORG", on: false, ch: "hot"   },
    { code: "NETW", on: false, ch: "cool"  },
  ];

  return (
    <div className="mt-shell" style={{ position: "relative" }}>
      {/* Mode accent stripe */}
      <div className={`mt-mode-strip ${mode}`} />

      {/* ── TOP ROW ── */}
      <div className="mt-top">

        {/* Brand */}
        <div className="mt-brand">
          <div className="mt-brand-name">BioSpark Studios</div>
          <div className="mt-brand-sub">Quantum Atlas · Genesis Engine</div>
        </div>

        {/* Mode selector */}
        <div className="mt-mode-group">
          {["author", "live", "playback"].map(m => (
            <div
              key={m}
              className={`mt-mode-btn ${mode === m ? `active-${m}` : ""}`}
              onClick={() => setMode(m)}
            >
              {m.toUpperCase()}
            </div>
          ))}
        </div>

        {/* Transport */}
        <div className="mt-transport">
          <div className="mt-pad" onClick={handleRewind} title="Rewind to start">⏮</div>
          <div className="mt-pad" onClick={() => setTick(t => Math.max(0, t - TICKS_PER_BEAT * BEATS_PER_BAR))} title="Back one bar">◀</div>
          <div className="mt-transport-sep" />
          <div className={`mt-pad mt-play ${playing && !paused ? "lit" : ""}`} onClick={handlePlay} title="Play">▶</div>
          <div className={`mt-pad mt-pause ${paused ? "lit" : ""}`} onClick={handlePause} title="Pause">⏸</div>
          <div className={`mt-pad mt-stop`} onClick={handleStop} title="Stop">■</div>
          <div className="mt-transport-sep" />
          <div className={`mt-pad mt-record ${recording ? "lit" : ""}`} onClick={handleRecord} title="Record">●</div>
        </div>

        {/* Tempo */}
        <div className="mt-tempo">
          <div className="mt-tempo-knob-wrap">
            <div className="mt-tempo-label">Tempo</div>
            <Knob
              label=""
              channel="amber"
              variant="forge"
              size={52}
              ticks={13}
              defaultValue={(bpm - 40) / (280)}
              onChange={v => setBpm(Math.round(40 + v * 280))}
            />
          </div>
          <div className="mt-tempo-readouts">
            <Readout label="BPM"  value={bpm.toFixed(1)}     channel="amber" width={72} />
            <Readout label="Hz"   value={hz}                  channel="cool"  width={72} />
            <Readout label="TICK" value={String(tick).padStart(5, "0")} channel="myth" width={72} />
          </div>
        </div>

        {/* Sacred frequency locks */}
        <div className="mt-sacred">
          <span className="mt-sacred-label">Lock</span>
          {SACRED.map(s => (
            <div
              key={s.bpm}
              className={`mt-sacred-btn ${s.cls}`}
              onClick={() => setBpm(s.bpm)}
              title={s.title}
            >
              {s.label}
            </div>
          ))}
        </div>

        {/* Position + mode readouts */}
        <div className="mt-position">
          <Readout label="BAR"    value={String(bar).padStart(3, "0")}     channel="amber" width={52} />
          <Readout label="BEAT"   value={`${beat} / ${BEATS_PER_BAR}`}     channel="amber" width={52} />
          <Readout label="MODE"   value={modeLabel}                         channel={mode === "live" ? "life" : mode === "playback" ? "cool" : "amber"} width={80} />
          <Readout label="STATUS" value={playing ? (paused ? "PAUSED" : "RUNNING") : "STOPPED"} channel={playing ? (paused ? "amber" : "life") : "hot"} width={80} />
        </div>
      </div>

      {/* ── BOTTOM ROW — waveform + module status ── */}
      <div className="mt-bottom">
        <TempoWave bpm={bpm} playing={playing} paused={paused} mode={mode} width={220} height={26} />

        {/* Divider */}
        <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.06)", flexShrink: 0 }} />

        {/* Module indicators */}
        <div className="mt-module-status">
          {MODULES.map(m => (
            <div key={m.code} className="mt-mod-indicator" title={m.code}>
              <LED on={m.on && playing} channel={m.ch} size={5} />
              <span className="mt-mod-code">{m.code}</span>
            </div>
          ))}
        </div>

        {/* Active module tag */}
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
          <div style={{
            fontFamily: "var(--font-engrave)",
            fontSize: 8, letterSpacing: "0.18em",
            color: moduleColor, textShadow: `0 0 6px ${moduleColor}`,
            textTransform: "uppercase",
          }}>
            {moduleName}
          </div>
          <LED on channel="cool" size={6} />
        </div>
      </div>
    </div>
  );
}

/* expose */
Object.assign(window, { MasterTransport });
