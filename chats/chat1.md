# Procedural Performance System

_Started 2026-04-26 16:38 UTC_

---

## User

Create a design system for all things procedural and animated.  A mix of Autodesk Maya & Houdini with a quantum-mythic-futurist style, lots of unique controls like in the pictures.  We use a large amount of audio/video/midi types of controls and visualizers.  Our main product is a narrative engine where anything can be turned into a performable instrument.  Tornadoes, People, Cities, etc.  It's all performable and we need a design system that can handle an infinite amount of VCV style rack interfaces.

## Assistant

I'll create a procedural/animated design system for BioSpark Studios — a Houdini × Maya × VCV Rack hybrid with the quantum-mythic-futurist aesthetic. Let me start by understanding the brief and asking the right questions.

_[tool: questions_v2]_

## User

Master Registry
#ModuleDeptLawCrestColorEmblemSplash01TerrainISpaceAtlas#1e8cff Electric BlueGlobe + Compass✓02EnvironmentIWorldMythos#8050e0 Deep IndigoArmillary Sphere✓03ArchitectIStructureArchitect#64b4ff Blueprint BlueCompass & Square✓04LightingILightPrism#e0d8ff Spectrum WhitePrism Triangle✓05ModelingIICharacterAnimus#f4c025 Zenith GoldAsterisk/Snowflake✓06ChoreographyIIConnectionLoom#dc3c78 Crimson RoseHex Node Web✓07BehaviorIIReasonInstinct#9030d0 Neural PurpleSpiral Synapse✓*08SocietyIIAuthorityOrder#c8a860 Imperial GoldCrown-Seal✓09SequencerIIITimeChronicle#b08030 Antique BrassClockwork Spiral✓10StoryIIINarrativeQuill#8c50ff VioletHexfeather✓11MemoryIIIKnowledgeCodex#00c060 EmeraldPentagon Book✓12SoundIIIAudioComposer#dc8c1e Copper AmberSpinning Vinyl✓13LogicIVRulesAxiom#20c8d0 Logic TealHex Logic Gate✓*14SimulationIVOperationContinuum#30e060 Matrix GreenRecursive Loop✓*15ForgeIVCreationForge#ff6400 Fire OrangeCounter-rotating Gears✓16NetworkIVBridgeNexus#ffffff Iridescent PearlInfinity Node✓

## Assistant

I have a registry of 16 departments now. The user wants a procedural/animated design system with VCV-rack patterns, audio/video/midi controls, and a quantum-mythic-futurist style. Let me proceed with strong defaults given the rich registry context they just provided.

I'll build a comprehensive design system showcase organized as a multi-section page with: tokens (color channels mapped to the 16 departments), control library (knobs/sliders/jacks/pads), visualizer library (scopes/spectrum/XY/curves), a Houdini-style node graph mini, a Maya-style timeline, and a live demo rack performing a "Tornado" instrument.

Let me check the project structure first.

_[tool: list_files]_

_[tool: list_files]_

Let me look at the reference images to understand the visual language.

_[tool: view_image]_

_[tool: view_image]_

_[tool: view_image]_

_[tool: view_image]_

_[tool: view_image]_

_[tool: view_image]_

_[tool: view_image]_

_[tool: view_image]_

_[tool: snip]_

_[tool: view_image]_

_[tool: view_image]_

_[tool: view_image]_

_[tool: snip]_

I have a strong picture now. The aesthetic is: dark recessed chassis, beveled metallic bezels, neon channel glows (cyan/magenta/orange/violet/green), tiny tick-mark scales, glass screen visualizers, mechanical knurled edges, and a "studio rack" feel. Let me lay out my plan and start building.

**Plan:**
1. Build a `tokens.css` with the 16-department color channels, type scale, spacing, glows, materials
2. Build component files (knobs, sliders, jacks, pads, switches, displays, visualizers) as JSX
3. Build the main showcase page with sections: Identity → Tokens → Materials → Controls → Visualizers → Modules → Rack (Tornado patch) → Node Graph → Timeline
4. Add live animation (running scopes, drifting needles, pulsing meters, animated patch cables)
5. Make the rack actually playable — drag knobs, click jacks light up, output visualizers respond

Let me start with the core file structure.

_[tool: update_todos]_

_[tool: write_file]_

Now let me build the control library. I'll split into focused JSX files: `controls.jsx` (knobs/sliders/jacks/switches/pads), `viz.jsx` (visualizers), `modules.jsx` (rack modules), and `app.jsx` (the showcase page).

_[tool: write_file]_

_[tool: write_file]_

_[tool: snip]_

_[tool: update_todos]_

Now I'll build the visualizers — these are the heart of the system.

_[tool: write_file]_

_[tool: write_file]_

_[tool: snip]_

_[tool: update_todos]_

Now I'll build the modules, rack, and the showcase page. This is the heart of the deliverable.

_[tool: write_file]_

_[tool: snip]_

_[tool: update_todos]_

Now I'll build the rack patch (Tornado), Houdini node graph, Maya timeline, iconography, and the main showcase page that ties everything together.

_[tool: write_file]_

_[tool: snip]_

_[tool: write_file]_

_[tool: snip]_

Now I'll build the main showcase page that ties everything together.

_[tool: write_file]_

_[tool: write_file]_

_[tool: snip]_

_[tool: show_html]_

_[tool: snip]_

_[tool: done]_

_[tool: snip]_

_[tool: fork_verifier_agent]_

_[tool: snip]_

I've delivered **Timeline · Procedural Rack Design System** — a full design system for your performable narrative engine.

**What's inside:**

1. **Identity** — hexagonal mark with quantum-mythic glyph, hero with system stats
2. **16-Department Registry** — every law from Atlas → Nexus with channel hue, crest, emblem
3. **Signal Colors** — 8 functional channels (cool/life/myth/warm/amber/rose/hot/forge) with glowing discs
4. **Typography** — Orbitron display, Eurostile engrave, JetBrains Mono readouts
5. **Materials** — cavity / panel / screen / knurl primitives
6. **Controls** — 5 knob variants (classic/arc/dotted/ringed/forge) all draggable, plus faders, jacks, switches, pads, gate buttons, LEDs, readouts, XY pad, step sequencer rows
7. **Visualizers** — live oscilloscope, 32-band spectrum, scrolling spectrogram, Lissajous phase scope, polar radar with sweeping arm, curl-noise particle field, draggable curve editor, piano roll, waveform, node minimap, VU stack
8. **Module Grammar** — head/body/patch chassis with channel-stripe headers and glowing crests
9. **TORNADO Patch** — live 7-module rack: Atlas → Continuum → Instinct → Chronicle → Composer → Quill → Forge, with animated patch cables that glow by signal type and pulse with traveling-dash flow
10. **Houdini Node Graph** — same patch unrolled, with display/render/lock flags
11. **Maya Timeline** — automation tracks per channel, animated playhead, transport
12. **Iconography** — 16 crests + 16 transport/signal glyphs
13. **Spec table** — HP units, knob/jack/fader sizes, cable thickness

**Drag any knob vertically. Drag curve-editor points. Drag XY pad. Click jacks.** Everything inherits its parent module's channel color, so dropping a new module type just means picking a channel.

**Caveats / next steps:** the rack currently shows one chassis row — for "infinite" scaling you'd add chassis stacking + a viewport pan/zoom layer. Module catalog is 7 archetypes; the registry has 16 — happy to expand each into its own module class. Cable routing is curve-only; could add right-angle ortho mode for dense patches.

## User

That looks fantastic!  let's incorporate these source materials into the designs "pasted"

## Assistant

