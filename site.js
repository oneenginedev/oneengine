// OneEngine Static Website Interactivity
;(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches

  // ---------------------------------------------------------------- Fire Particle Canvas Overlay
  const fireCanvas = document.getElementById('fireCanvas')
  if (fireCanvas) {
    const ctx = fireCanvas.getContext('2d')
    let w = (fireCanvas.width = fireCanvas.offsetWidth || 500)
    let h = (fireCanvas.height = fireCanvas.offsetHeight || 310)

    const resize = () => {
      w = fireCanvas.width = fireCanvas.offsetWidth
      h = fireCanvas.height = fireCanvas.offsetHeight
    }
    window.addEventListener('resize', resize)

    // Fire particle class
    class FireParticle {
      constructor() { this.reset(true) }
      reset(init = false) {
        // Spawn from bottom strip of the screen
        this.x = Math.random() * w
        this.y = init ? Math.random() * h : h + 10
        this.vx = (Math.random() - 0.5) * 0.3
        this.vy = -(Math.random() * 0.6 + 0.3)
        this.life = 1
        this.decay = Math.random() * 0.004 + 0.002
        this.radius = Math.random() * 5 + 2.5
        this.wobble = Math.random() * Math.PI * 2
        this.wobbleSpeed = (Math.random() - 0.5) * 0.02
      }
      update() {
        this.wobble += this.wobbleSpeed
        this.x += this.vx + Math.sin(this.wobble) * 0.15
        this.y += this.vy
        this.vy *= 0.998          // slight drag
        this.radius *= 0.997      // shrink as it rises
        this.life -= this.decay
        if (this.life <= 0 || this.y < -20) this.reset()
      }
      draw(ctx) {
        const alpha = Math.max(0, this.life)
        // Inner core: bright white-yellow
        const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius)
        grad.addColorStop(0,   `rgba(255,255,220,${alpha * 0.95})`)
        grad.addColorStop(0.25,`rgba(255,200, 50,${alpha * 0.85})`)
        grad.addColorStop(0.55,`rgba(255, 80, 10,${alpha * 0.65})`)
        grad.addColorStop(0.80,`rgba(180, 20,  0,${alpha * 0.35})`)
        grad.addColorStop(1,   `rgba( 80,  0,  0,0)`)
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()
      }
    }

    // Ember spark class — tiny bright specks
    class Ember {
      constructor() { this.reset(true) }
      reset(init = false) {
        this.x = Math.random() * w
        this.y = init ? Math.random() * h : h + 5
        this.vx = (Math.random() - 0.5) * 0.5
        this.vy = -(Math.random() * 0.9 + 0.4)
        this.life = 1
        this.decay = Math.random() * 0.005 + 0.002
        this.radius = Math.random() * 0.8 + 0.4
      }
      update() {
        this.x += this.vx
        this.vx *= 0.98
        this.y += this.vy
        this.vy *= 0.97
        this.life -= this.decay
        if (this.life <= 0 || this.y < -20) this.reset()
      }
      draw(ctx) {
        const alpha = Math.max(0, this.life)
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,220,80,${alpha * 0.9})`
        ctx.fill()
      }
    }

    const FIRE_COUNT = 120
    const EMBER_COUNT = 60
    const fireParticles = Array.from({ length: FIRE_COUNT }, () => new FireParticle())
    const embers = Array.from({ length: EMBER_COUNT }, () => new Ember())

    const render = () => {
      ctx.clearRect(0, 0, w, h)

      // Composite: 'lighter' adds colours so overlapping flames glow brighter
      ctx.globalCompositeOperation = 'lighter'
      for (const p of fireParticles) { p.update(); p.draw(ctx) }
      for (const e of embers) { e.update(); e.draw(ctx) }
      ctx.globalCompositeOperation = 'source-over'

      if (!reduced) requestAnimationFrame(render)
    }
    render()
  }

  // ---------------------------------------------------------------- shootPower Canvas Preview
  const spCanvas = document.getElementById('shootPowerCanvas')
  if (spCanvas) {
    const ctx2 = spCanvas.getContext('2d')
    let sw = (spCanvas.width = spCanvas.offsetWidth || 400)
    let sh = (spCanvas.height = spCanvas.offsetHeight || 240)
    window.addEventListener('resize', () => {
      sw = spCanvas.width = spCanvas.offsetWidth
      sh = spCanvas.height = spCanvas.offsetHeight
    })

    // Tiled ground platform
    const TILE = 18
    const groundY = sh * 0.72

    // Bullet pool
    const bullets = []

    // Particle pool (muzzle flash / hit sparks)
    const spParticles = []

    // Simple soldier state
    const soldier = { x: sw * 0.18, y: groundY - TILE * 2.2, vy: 0, frame: 0, frameTimer: 0, shooting: false, shootTimer: 0 }
    const GRAVITY = 0.38
    const JUMP_V = -7.2
    let jumpTimer = 0

    // Enemies
    const enemies = [
      { x: sw * 0.62, y: groundY - TILE * 2.2, alive: true, flash: 0 },
      { x: sw * 0.82, y: groundY - TILE * 2.2, alive: true, flash: 0 },
    ]

    let spFrame = 0

    const drawPixelFigure = (ctx, x, y, color, headColor, w, h, flip) => {
      ctx.save()
      if (flip) { ctx.translate(x + w / 2, y); ctx.scale(-1, 1); ctx.translate(-w / 2, 0) }
      else ctx.translate(x, y)
      // body
      ctx.fillStyle = color
      ctx.fillRect(w * 0.25, h * 0.35, w * 0.5, h * 0.42)
      // head
      ctx.fillStyle = headColor
      ctx.fillRect(w * 0.28, 0, w * 0.44, h * 0.32)
      // legs
      ctx.fillStyle = color
      const legPhase = Math.sin(spFrame * 0.22) * (h * 0.12)
      ctx.fillRect(w * 0.25, h * 0.77, w * 0.2, h * 0.23 + legPhase)
      ctx.fillRect(w * 0.55, h * 0.77, w * 0.2, h * 0.23 - legPhase)
      // arm / gun
      ctx.fillStyle = '#888'
      ctx.fillRect(w * 0.68, h * 0.4, w * 0.38, h * 0.1)
      ctx.restore()
    }

    const spRender = () => {
      ctx2.clearRect(0, 0, sw, sh)

      // Sky gradient
      const sky = ctx2.createLinearGradient(0, 0, 0, sh)
      sky.addColorStop(0, '#0d0b1a')
      sky.addColorStop(1, '#1a1030')
      ctx2.fillStyle = sky
      ctx2.fillRect(0, 0, sw, sh)

      // Stars
      ctx2.fillStyle = 'rgba(255,255,255,0.55)'
      for (let i = 0; i < 30; i++) {
        const sx = ((i * 137 + spFrame * 0.18) % sw)
        const sy = (i * 53) % (groundY * 0.85)
        ctx2.fillRect(sx, sy, 1.5, 1.5)
      }

      // Ground tiles
      for (let tx = 0; tx < sw; tx += TILE) {
        ctx2.fillStyle = '#2a3a5c'
        ctx2.fillRect(tx, groundY, TILE - 1, sh - groundY)
        ctx2.fillStyle = '#3a5280'
        ctx2.fillRect(tx, groundY, TILE - 1, 4)
      }

      // Platform block
      const platX = sw * 0.44, platW = sw * 0.22
      ctx2.fillStyle = '#2a3a5c'
      ctx2.fillRect(platX, groundY - TILE * 2.8, platW, TILE * 0.6)
      ctx2.fillStyle = '#3a5280'
      ctx2.fillRect(platX, groundY - TILE * 2.8, platW, 3)

      // Soldier physics
      soldier.shootTimer++
      jumpTimer++
      if (jumpTimer > 90) { soldier.vy = JUMP_V; jumpTimer = 0 }
      soldier.vy += GRAVITY
      soldier.y += soldier.vy
      if (soldier.y >= groundY - TILE * 2.2) { soldier.y = groundY - TILE * 2.2; soldier.vy = 0 }

      // Shoot
      if (soldier.shootTimer % 28 === 0) {
        bullets.push({ x: soldier.x + TILE * 1.5, y: soldier.y + TILE, vx: 5.5, life: 1 })
        spParticles.push({ x: soldier.x + TILE * 1.6, y: soldier.y + TILE, vx: 2, vy: -1, r: 4, life: 1, color: '#ffdd44' })
      }

      // Draw soldier
      drawPixelFigure(ctx2, soldier.x, soldier.y, '#4a6fa5', '#c8a97a', TILE * 1.4, TILE * 2.2, false)

      // Bullets
      ctx2.fillStyle = '#ffdd44'
      for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i]
        b.x += b.vx
        b.life -= 0.018
        if (b.x > sw || b.life <= 0) { bullets.splice(i, 1); continue }
        // hit check
        for (const en of enemies) {
          if (en.alive && Math.abs(b.x - en.x - TILE * 0.7) < TILE && Math.abs(b.y - en.y - TILE) < TILE * 2) {
            en.flash = 8
            spParticles.push({ x: en.x + TILE * 0.7, y: en.y + TILE * 0.8, vx: -1.5, vy: -2, r: 6, life: 1, color: '#ff4422' })
            bullets.splice(i, 1)
            break
          }
        }
        if (bullets[i]) ctx2.fillRect(b.x, b.y, 6, 3)
      }

      // Enemies
      for (const en of enemies) {
        if (!en.alive) continue
        if (en.flash > 0) { en.flash--; ctx2.globalAlpha = 0.4 }
        drawPixelFigure(ctx2, en.x, en.y, '#8b2222', '#c85a5a', TILE * 1.4, TILE * 2.2, true)
        ctx2.globalAlpha = 1
      }

      // Particles
      for (let i = spParticles.length - 1; i >= 0; i--) {
        const p = spParticles[i]
        p.x += p.vx; p.y += p.vy; p.vy += 0.12; p.life -= 0.05; p.r *= 0.93
        if (p.life <= 0) { spParticles.splice(i, 1); continue }
        ctx2.globalAlpha = p.life
        ctx2.fillStyle = p.color
        ctx2.beginPath(); ctx2.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx2.fill()
        ctx2.globalAlpha = 1
      }

      // HUD
      ctx2.fillStyle = 'rgba(0,0,0,0.45)'
      ctx2.fillRect(8, 8, 100, 18)
      ctx2.fillStyle = '#2fd3e6'
      ctx2.font = '10px "JetBrains Mono", monospace'
      ctx2.fillText('HP ████████  AMO 30', 12, 21)

      spFrame++
      if (!reduced) requestAnimationFrame(spRender)
    }
    spRender()
  }

  // ---------------------------------------------------------------- Live Numbers / Stats Count Up
  const countUp = (el, to, suffix = '') => {
    if (reduced) {
      el.textContent = to.toLocaleString('en-US') + suffix
      return
    }
    const start = performance.now()
    const tick = (now) => {
      const t = Math.min(1, (now - start) / 1400)
      const val = Math.round(to * (1 - Math.pow(1 - t, 3)))
      el.textContent = val.toLocaleString('en-US') + suffix
      if (t < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }

  const statEls = document.querySelectorAll('[data-count]')
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const target = Number(entry.target.dataset.count)
        const suffix = entry.target.dataset.suffix || ''
        countUp(entry.target, target, suffix)
        observer.unobserve(entry.target)
      }
    })
  }, { threshold: 0.2 })

  statEls.forEach((el) => observer.observe(el))

  // ---------------------------------------------------------------- System Showcase Stage
  const systemsData = {
    ecs: {
      color: '#7c5cfa',
      title: 'ECS Core Architecture',
      desc: 'Sparse set archetypes arranged for contiguous CPU cache lines. Execute 100,000+ dynamic entities with zero garbage collector pauses.',
      stat1Val: '100k+',
      stat1Lbl: 'Active Entities',
      stat2Val: '0.8ms',
      stat2Lbl: 'Dispatch Frame',
      code: `<span class="cm">// Cache-friendly ECS iteration</span>
<span class="kw">auto</span> view = registry.<span class="fn">view</span>&lt;<span class="kw">Transform</span>, <span class="kw">Velocity</span>&gt;();
<span class="kw">for</span> (<span class="kw">auto</span> [entity, pos, vel] : view.<span class="fn">each</span>()) {
    pos.xyz += vel.xyz * dt;
}`
    },
    netcode: {
      color: '#2fd3e6',
      title: 'Rollback & Prediction Netcode',
      desc: 'Synchronize 64 players at 128Hz tick rates with integrated client prediction, server authoritative snapshots, and delta compression.',
      stat1Val: '128Hz',
      stat1Lbl: 'Server Tickrate',
      stat2Val: '&lt;35ms',
      stat2Lbl: 'Reconciliation',
      code: `<span class="cm">// Authoritative state reconciliation</span>
<span class="kw">void</span> <span class="fn">ReconcileClient</span>(Tick serverTick, <span class="kw">const</span> State& state) {
    history.<span class="fn">RewindTo</span>(serverTick, state);
    <span class="kw">for</span> (Tick t = serverTick + <span class="num">1</span>; t &lt;= localTick; ++t) {
        <span class="fn">SimulateTick</span>(t, inputBuffer[t]);
    }
}`
    },
    hotreload: {
      color: '#ff7a2f',
      title: 'Instant Hot Reload',
      desc: 'Modify Lua gameplay logic, C++ DLL systems, or shader pipelines on the fly while connected to active game sessions. Zero recompiles.',
      stat1Val: '14ms',
      stat1Lbl: 'Reload Delay',
      stat2Val: '100%',
      stat2Lbl: 'State Preserved',
      code: `<span class="cm">-- Live gameplay hot reload</span>
<span class="kw">function</span> Player:<span class="fn">OnDash</span>(direction)
    self.velocity = direction * <span class="num">24.0</span>
    self.trail:emit(<span class="str">"particle_burst"</span>, <span class="num">16</span>)
    AudioManager:<span class="fn">play</span>(<span class="str">"dash_whoosh.wav"</span>)
<span class="kw">end</span>`
    },
    editor: {
      color: '#3fe3a0',
      title: 'In-Situ World Editor',
      desc: 'Sculpt terrain, tweak physics collisions, and inspect live runtime entities within the very binary your players launch. No separate editor tax.',
      stat1Val: '0ms',
      stat1Lbl: 'Editor Sync Lag',
      stat2Val: '60 FPS',
      stat2Lbl: 'Editor Overhead',
      code: `<span class="cm">// Direct in-game gizmo & trigger hook</span>
<span class="kw">void</span> <span class="fn">RenderGizmos</span>(World& world) {
    <span class="kw">if</span> (!Editor::IsActive()) <span class="kw">return</span>;
    Gizmo::<span class="fn">DrawNavMesh</span>(world.navmesh);
    Gizmo::<span class="fn">InspectSelected</span>(world.selection);
}`
    },
    replays: {
      color: '#e2435a',
      title: 'Deterministic Replays',
      desc: 'Record entire matches with compact 60KB input journals. Re-simulate exact physics frames for frame-perfect desync debugging.',
      stat1Val: '60KB',
      stat1Lbl: 'Replay File Size',
      stat2Val: 'Bit-Exact',
      stat2Lbl: 'Determinism',
      code: `<span class="cm">// Deterministic input playback</span>
ReplayRecorder <span class="fn">recorder</span>(<span class="str">"match_04.rec"</span>);
recorder.<span class="fn">RecordInputPacket</span>(localTick, playerInput);
<span class="cm">// Debug desync at exact tick 4,812</span>
ReplayEngine::<span class="fn">StepToTick</span>(<span class="num">4812</span>);`
    },
    pipeline: {
      color: '#8a6cff',
      title: 'Single-Binary Windows Pipeline',
      desc: 'Compile your entire title into a standalone, portable Windows .exe in seconds. Zero runtime dependencies, no installers required.',
      stat1Val: '12MB',
      stat1Lbl: 'Engine Footprint',
      stat2Val: '&lt;4s',
      stat2Lbl: 'Release Build',
      code: `<span class="cm"># One-command release packaging</span>
$ oneengine build --target=windows-x64 --release
[INFO] Bundling assets into monolithic blob...
[INFO] Static link DirectX 12 &amp; Vulkan backend...
[SUCCESS] Generated dist/game.exe (12.4 MB)`
    }
  }

  const stageSection = document.querySelector('.styles')
  const styleTabs = [...document.querySelectorAll('.style-picker button')]
  const stageTitle = document.getElementById('stageTitle')
  const stageDesc = document.getElementById('stageDesc')
  const stageStat1Val = document.getElementById('stageStat1Val')
  const stageStat1Lbl = document.getElementById('stageStat1Lbl')
  const stageStat2Val = document.getElementById('stageStat2Val')
  const stageStat2Lbl = document.getElementById('stageStat2Lbl')
  const stageCode = document.getElementById('stageCode')

  let curSysIndex = 0
  let sysTimer = null

  const switchSystem = (id, btn) => {
    const data = systemsData[id]
    if (!data) return

    styleTabs.forEach((b) => b.setAttribute('aria-selected', String(b === btn)))
    if (stageSection) stageSection.style.setProperty('--style-accent', data.color)

    if (stageTitle) stageTitle.textContent = data.title
    if (stageDesc) stageDesc.textContent = data.desc
    if (stageStat1Val) stageStat1Val.innerHTML = data.stat1Val
    if (stageStat1Lbl) stageStat1Lbl.textContent = data.stat1Lbl
    if (stageStat2Val) stageStat2Val.innerHTML = data.stat2Val
    if (stageStat2Lbl) stageStat2Lbl.textContent = data.stat2Lbl
    if (stageCode) stageCode.innerHTML = data.code
  }

  styleTabs.forEach((tab, i) => {
    tab.addEventListener('click', () => {
      curSysIndex = i
      switchSystem(tab.dataset.id, tab)
      clearInterval(sysTimer)
    })
  })

  const autoSwitch = () => {
    clearInterval(sysTimer)
    if (!reduced) {
      sysTimer = setInterval(() => {
        curSysIndex = (curSysIndex + 1) % styleTabs.length
        const nextTab = styleTabs[curSysIndex]
        if (nextTab) switchSystem(nextTab.dataset.id, nextTab)
      }, 5000)
    }
  }

  stageSection?.addEventListener('pointerenter', () => clearInterval(sysTimer))
  stageSection?.addEventListener('pointerleave', autoSwitch)
  autoSwitch()

  // ---------------------------------------------------------------- Engine Tuner / Telemetry Bars
  const telemetryPresets = {
    competitive: [94, 90, 96, 78, 60, 82, 88, 92],
    cinematic:   [82, 70, 75, 96, 94, 90, 85, 78],
    balanced:    [75, 75, 75, 75, 75, 75, 75, 75],
    lowpower:    [45, 40, 50, 48, 35, 50, 40, 55],
    benchmark:   [98, 96, 92, 95, 90, 88, 94, 97]
  }

  const bars = [...document.querySelectorAll('.eq span')]
  const setTelemetry = (levels) => {
    levels.forEach((val, i) => {
      if (bars[i]) bars[i].style.height = `${val}%`
    })
  }

  document.querySelectorAll('.presets button').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.presets button').forEach((b) => b.setAttribute('aria-checked', 'false'))
      btn.setAttribute('aria-checked', 'true')
      const presetKey = btn.dataset.preset
      if (telemetryPresets[presetKey]) {
        setTelemetry(telemetryPresets[presetKey])
      }
    })
  })
  setTelemetry(telemetryPresets.competitive)

  // ---------------------------------------------------------------- Terminal typing demo
  const typedEl = document.querySelector('[data-typed]')
  if (typedEl) {
    const commands = [
      'oneengine new my-game --template=arena',
      'oneengine build --release --profile=win64',
      'oneengine replay desync-match-42.rec',
      'oneengine serve --port=7777 --tick=128Hz'
    ]
    let cmdIdx = 0
    let charIdx = 0
    let isDeleting = false

    const typeLoop = () => {
      const current = commands[cmdIdx]
      if (isDeleting) {
        typedEl.textContent = current.slice(0, charIdx--)
      } else {
        typedEl.textContent = current.slice(0, charIdx++)
      }

      let speed = isDeleting ? 30 : 65
      if (!isDeleting && charIdx > current.length) {
        speed = 2000
        isDeleting = true
      } else if (isDeleting && charIdx < 0) {
        isDeleting = false
        cmdIdx = (cmdIdx + 1) % commands.length
        speed = 500
      }
      setTimeout(typeLoop, speed)
    }
    typeLoop()
  }

  // ---------------------------------------------------------------- Author toggle
  const whoBtn = document.querySelector('[data-who]')
  if (whoBtn) {
    whoBtn.addEventListener('click', () => whoBtn.classList.toggle('full'))
  }
})()
