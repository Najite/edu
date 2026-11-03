# Agent Operating Instructions & Architectural Mandate

> **CRITICAL DIRECTIVE FOR ALL AI AGENTS & CODING ASSISTANTS:**  
> This project is executing a complete, uncompromising clean-room reverse engineering of the **PraxiLabs virtual science laboratory platform** for browser runtimes.
>
> You MUST read and strictly adhere to the master specification file before proposing, designing, or implementing any features:
> **[`PRAXILABS_REVERSE_ENGINEERING_SPECIFICATION.md`](file:///home/gamp/Desktop/edu/PRAXILABS_REVERSE_ENGINEERING_SPECIFICATION.md)**

---

## Non-Negotiable Architectural Rules

### 1. No Cosmetic Shortcuts or Fake Triggers
* **Never fake an interaction**: Do not use automatic timers or invisible telepathic clicks where real laboratory methodology requires a physical manipulation tool (e.g., volumetric pipettes must be aspirating/draining; indicator bottles must be held and squeezed; burettes must be conditioned and read without parallax).
* **No toy gamification**: The platform is an analytical science engine for university-level curricula, not an arcade clicker.

### 2. Complete Pedagogical Workflows
* Every laboratory protocol must support the full end-to-end scientific arc:
  1. Personal Protective Equipment (PPE) inspection and GHS safety datasheets.
  2. Glassware washing, deionized water rinsing, and reagent conditioning.
  3. Precision volumetric transfer (pipetting, meniscus alignment).
  4. Titration scouting runs followed by **3 concordant trials** ($\pm 0.10\text{ mL}$).
  5. Student lab notebook data entry ($V_1, V_2, \Delta V$), significant figures validation, and stoichiometry calculations.

### 3. Physical & Fluid Dynamics Rigor
* **Variable Stopcock Flow**: The burette stopcock must support continuous flow regimes (closed, micro-drop, dropwise at $0.05\text{ mL/drop}$, and continuous laminar stream).
* **Constrained Kinematic Interaction**: Use spatial constraint sockets and raycast-guided plane dragging. Do not introduce chaotic unconstrained rigid-body ragdoll physics.
* **Liquid Lathe & Meniscus Shaders**: Fluid surfaces must exhibit realistic concave meniscus curves with contact angles and capillary highlights, never flat circular disks.
* **Schellbach Refraction**: Preserve the rear-wall Schellbach optical stripe and authentic refraction through borosilicate glass.

### 4. Camera Freedom & Unrestricted Interaction
* Do not lock camera controls in continuous per-frame `damp` loops. Preset animations must auto-yield immediately the instant a user touches, drags, or scrolls the camera.
* Maintain full 360° orbit rotation, screen-space panning (right-click / 2-finger drag), and unrestricted zoom ($0.08\text{ m}$ to $6.0\text{ m}$).

### 5. Multi-Sensory Realism (Web Audio API)
* Every mechanical and fluid interaction must produce synchronized spatialized audio: liquid streams, droplet plops, glass-on-glass resonant clinks, stopcock friction, motor hums, and verbal pedagogical guidance.

### 6. Phase Roadmap Adherence
Always consult Section 10 of `PRAXILABS_REVERSE_ENGINEERING_SPECIFICATION.md` to identify the current milestone:
* **Phase 1**: Granular Apparatus Manipulation & Flow Control (Variable stopcock, volumetric pipetting, wash bottles).
* **Phase 2**: Web Audio API Spatial Sound Engine.
* **Phase 3**: Generalized Chemical Equilibrium Engine (Quartic solver, multi-indicator Beer-Lambert absorption).
* **Phase 4**: Multi-Trial Concordancy Protocol & Digital Notebook Validation.
* **Phase 5**: Enterprise LMS Standards (LTI 1.3 AGS Grade Passback, IEEE P9274.1 xAPI, SCORM 2004).

### 7. Code Quality & Document Integrity
* Maintain 100% TypeScript type safety.
* Ensure `npm run build` (`tsc && vite build`) executes cleanly with zero compilation errors after every turn.
* Preserve existing comments, docstrings, and PBR material configurations.

