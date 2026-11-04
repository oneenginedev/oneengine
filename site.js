// OneEngine Static Website Interactivity
;(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  const PLAY_PATH = 'M8 5v14l11-7z'
  const PAUSE_PATH = 'M6 19h4V5H6v14zm8-14v14h4V5h-4z'

  // Hero background motion (video + fire). Reduced-motion visitors start paused.
  let heroMotionPaused = reduced
  let syncFire = () => {}

  // Calls onChange(true|false) as an element enters/leaves the viewport or the tab is hidden/shown
  const watchVisibility = (el, onChange, threshold = 0.2) => {
    let inView = false
    const update = () => onChange(inView && !document.hidden)
    new IntersectionObserver((entries) => {
      inView = entries[entries.length - 1].isIntersecting
      update()
    }, { threshold }).observe(el)
    document.addEventListener('visibilitychange', update)
  }

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

    const drawFire = () => {
      ctx.clearRect(0, 0, w, h)

      // Composite: 'lighter' adds colours so overlapping flames glow brighter
      ctx.globalCompositeOperation = 'lighter'
      for (const p of fireParticles) { p.update(); p.draw(ctx) }
      for (const e of embers) { e.update(); e.draw(ctx) }
      ctx.globalCompositeOperation = 'source-over'
    }

    // Only animate while the canvas is on screen, the tab is visible and motion isn't paused
    let fireRaf = 0
    let fireVisible = false
    const fireLoop = () => {
      drawFire()
      fireRaf = requestAnimationFrame(fireLoop)
    }
    drawFire() // one static frame, which is all reduced-motion users get
    syncFire = () => {
      const run = fireVisible && !heroMotionPaused
      if (run && !fireRaf) fireRaf = requestAnimationFrame(fireLoop)
      else if (!run) { cancelAnimationFrame(fireRaf); fireRaf = 0 }
    }
    watchVisibility(fireCanvas, (on) => { fireVisible = on; syncFire() }, 0)
  }

  // ---------------------------------------------------------------- Videos: play only while visible
  const videoPlayers = [...document.querySelectorAll('video')].map((video) => {
    // Reduced-motion visitors start paused and can press Play themselves
    const state = { video, visible: false, userPaused: reduced }
    state.sync = () => {
      if (state.visible && !state.userPaused) video.play()?.catch?.(() => {})
      else video.pause()
    }
    watchVisibility(video, (on) => { state.visible = on; state.sync() }, 0.25)
    return state
  })

  // Hero pause button: WCAG 2.2.2 needs a way to stop the looping video and fire
  const heroState = videoPlayers.find((s) => s.video.id === 'heroVideo')
  const heroToggle = document.getElementById('heroMotionToggle')
  if (heroToggle) {
    const paintHeroToggle = () => {
      heroToggle.setAttribute('aria-label', heroMotionPaused ? 'Play background animation' : 'Pause background animation')
      heroToggle.querySelector('path').setAttribute('d', heroMotionPaused ? PLAY_PATH : PAUSE_PATH)
    }
    heroToggle.addEventListener('click', () => {
      heroMotionPaused = !heroMotionPaused
      if (heroState) { heroState.userPaused = heroMotionPaused; heroState.sync() }
      syncFire()
      paintHeroToggle()
    })
    paintHeroToggle()
  }

  const gameState = videoPlayers.find((s) => s.video.id === 'gameplayVideo')
  const playToggle = document.getElementById('videoPlayToggle')
  const muteToggle = document.getElementById('videoMuteToggle')

  const paintPlayToggle = () => {
    const paused = gameState.userPaused
    playToggle.querySelector('span').textContent = paused ? 'Play' : 'Pause'
    playToggle.querySelector('path').setAttribute('d', paused ? PLAY_PATH : PAUSE_PATH)
    playToggle.setAttribute('aria-label', paused ? 'Play gameplay video' : 'Pause gameplay video')
  }
  const paintMuteToggle = () => {
    const muted = gameState.video.muted
    muteToggle.querySelector('span').textContent = muted ? 'Unmute' : 'Mute'
    muteToggle.setAttribute('aria-label', muted ? 'Unmute gameplay video' : 'Mute gameplay video')
  }

  if (gameState && playToggle && muteToggle) {
    playToggle.addEventListener('click', () => {
      gameState.userPaused = !gameState.userPaused
      gameState.sync()
      paintPlayToggle()
    })
    muteToggle.addEventListener('click', () => {
      gameState.video.muted = !gameState.video.muted
      paintMuteToggle()
    })
    paintPlayToggle()
    paintMuteToggle()
  }

  // ---------------------------------------------------------------- Live Numbers / Stats Count Up
  const countUp = (el, to, suffix = '', prefix = '') => {
    if (reduced) {
      el.textContent = prefix + to.toLocaleString('en-US') + suffix
      return
    }
    const start = performance.now()
    const tick = (now) => {
      const t = Math.min(1, (now - start) / 1400)
      const val = Math.round(to * (1 - Math.pow(1 - t, 3)))
      el.textContent = prefix + val.toLocaleString('en-US') + suffix
      if (t < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }

  const statEls = document.querySelectorAll('[data-count]')
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const target = Number(entry.target.dataset.count)
        const { suffix = '', prefix = '' } = entry.target.dataset
        countUp(entry.target, target, suffix, prefix)
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
  const stagePanel = document.getElementById('stagePanel')

  let curSysIndex = 0
  let sysTimer = null

  const switchSystem = (id, btn) => {
    const data = systemsData[id]
    if (!data) return

    styleTabs.forEach((b) => {
      const on = b === btn
      b.setAttribute('aria-selected', String(on))
      b.tabIndex = on ? 0 : -1
    })
    curSysIndex = styleTabs.indexOf(btn)
    if (stagePanel) stagePanel.setAttribute('aria-labelledby', btn.id)
    if (stageSection) stageSection.style.setProperty('--style-accent', data.color)

    if (stageTitle) stageTitle.textContent = data.title
    if (stageDesc) stageDesc.textContent = data.desc
    if (stageStat1Val) stageStat1Val.innerHTML = data.stat1Val
    if (stageStat1Lbl) stageStat1Lbl.textContent = data.stat1Lbl
    if (stageStat2Val) stageStat2Val.innerHTML = data.stat2Val
    if (stageStat2Lbl) stageStat2Lbl.textContent = data.stat2Lbl
    if (stageCode) stageCode.innerHTML = data.code
  }

  // Auto-rotation: stops for good once the visitor picks a tab or presses Pause,
  // and pauses while the pointer or keyboard focus is inside the section
  const rotateToggle = document.getElementById('rotateToggle')
  let rotationStopped = reduced || styleTabs.length === 0
  let rotationHeld = false

  const syncRotation = () => {
    clearInterval(sysTimer)
    if (rotationStopped || rotationHeld) return
    sysTimer = setInterval(() => {
      curSysIndex = (curSysIndex + 1) % styleTabs.length
      switchSystem(styleTabs[curSysIndex].dataset.id, styleTabs[curSysIndex])
    }, 5000)
  }
  const paintRotateToggle = () => {
    if (!rotateToggle) return
    rotateToggle.querySelector('span').textContent = rotationStopped ? 'Resume auto-rotate' : 'Pause auto-rotate'
    rotateToggle.querySelector('path').setAttribute('d', rotationStopped ? PLAY_PATH : PAUSE_PATH)
  }
  const stopRotation = () => {
    rotationStopped = true
    syncRotation()
    paintRotateToggle()
  }

  if (rotateToggle && !reduced && styleTabs.length) {
    rotateToggle.hidden = false
    rotateToggle.addEventListener('click', () => {
      rotationStopped = !rotationStopped
      syncRotation()
      paintRotateToggle()
    })
  }

  styleTabs.forEach((tab, i) => {
    tab.addEventListener('click', () => {
      curSysIndex = i
      switchSystem(tab.dataset.id, tab)
      stopRotation()
    })
  })

  // Keyboard: Left/Right/Home/End move between tabs (automatic activation)
  document.querySelector('.style-picker')?.addEventListener('keydown', (e) => {
    const i = styleTabs.indexOf(document.activeElement)
    if (i < 0) return
    const last = styleTabs.length - 1
    let next = -1
    if (e.key === 'ArrowRight') next = i === last ? 0 : i + 1
    else if (e.key === 'ArrowLeft') next = i === 0 ? last : i - 1
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = last
    if (next < 0) return
    e.preventDefault()
    stopRotation()
    styleTabs[next].focus()
    switchSystem(styleTabs[next].dataset.id, styleTabs[next])
  })

  const hold = (on) => { rotationHeld = on; syncRotation() }
  stageSection?.addEventListener('pointerenter', () => hold(true))
  stageSection?.addEventListener('pointerleave', () => hold(false))
  stageSection?.addEventListener('focusin', () => hold(true))
  stageSection?.addEventListener('focusout', (e) => {
    if (!stageSection.contains(e.relatedTarget)) hold(false)
  })
  paintRotateToggle()
  syncRotation()

  // ---------------------------------------------------------------- Engine Tuner / Telemetry Bars
  const telemetryPresets = {
    competitive: [94, 90, 96, 78, 60, 82, 88, 92],
    cinematic:   [82, 70, 75, 96, 94, 90, 85, 78],
    balanced:    [75, 75, 75, 75, 75, 75, 75, 75],
    lowpower:    [45, 40, 50, 48, 35, 50, 40, 55],
    benchmark:   [98, 96, 92, 95, 90, 88, 94, 97]
  }

  const bars = [...document.querySelectorAll('.eq span')]
  const barNames = [...document.querySelectorAll('.eq-labels span')].map((el) => el.textContent)
  const eqCard = document.getElementById('eqCard')
  const setTelemetry = (levels, profileName) => {
    levels.forEach((val, i) => {
      if (bars[i]) bars[i].style.height = `${val}%`
    })
    // The chart is role="img", so its values live in the accessible name
    if (eqCard && profileName) {
      const values = levels.map((val, i) => `${barNames[i] || 'bar ' + (i + 1)} ${val}%`).join(', ')
      eqCard.setAttribute('aria-label', `Illustrative pipeline load for the ${profileName} profile: ${values}`)
    }
  }

  const presetBtns = [...document.querySelectorAll('.presets button')]
  const selectPreset = (btn) => {
    presetBtns.forEach((b) => {
      const on = b === btn
      b.setAttribute('aria-checked', String(on))
      b.tabIndex = on ? 0 : -1
    })
    const levels = telemetryPresets[btn.dataset.preset]
    if (levels) setTelemetry(levels, btn.textContent.trim())
  }
  presetBtns.forEach((btn) => btn.addEventListener('click', () => selectPreset(btn)))

  // Radio-group keyboard behaviour: arrows move and select, Home/End jump
  document.querySelector('.presets')?.addEventListener('keydown', (e) => {
    const i = presetBtns.indexOf(document.activeElement)
    if (i < 0) return
    const last = presetBtns.length - 1
    let next = -1
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = i === last ? 0 : i + 1
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = i === 0 ? last : i - 1
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = last
    if (next < 0) return
    e.preventDefault()
    presetBtns[next].focus()
    selectPreset(presetBtns[next])
  })
  const initialPreset = presetBtns.find((b) => b.getAttribute('aria-checked') === 'true')
  if (initialPreset) selectPreset(initialPreset)

  // ---------------------------------------------------------------- Mobile nav
  const siteNav = document.querySelector('.nav')
  const navToggle = document.querySelector('.nav-toggle')
  if (siteNav && navToggle) {
    const setNavOpen = (open) => {
      siteNav.classList.toggle('is-open', open)
      navToggle.setAttribute('aria-expanded', String(open))
      navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu')
    }
    navToggle.addEventListener('click', () => setNavOpen(!siteNav.classList.contains('is-open')))
    siteNav.querySelectorAll('nav a').forEach((a) => a.addEventListener('click', () => setNavOpen(false)))
    document.addEventListener('click', (e) => { if (!siteNav.contains(e.target)) setNavOpen(false) })
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && siteNav.classList.contains('is-open')) {
        setNavOpen(false)
        navToggle.focus()
      }
    })
    matchMedia('(min-width: 701px)').addEventListener('change', (e) => { if (e.matches) setNavOpen(false) })
  }

  // ---------------------------------------------------------------- GitHub releases
  // Versions, sizes and dates come from the GitHub API, so the site never states a build that doesn't exist
  const REPO = 'oneenginedev/oneengine'
  const REPO_URL = `https://github.com/${REPO}`
  const versionEls = document.querySelectorAll('[data-release-version]')
  const dlTitle = document.querySelector('[data-release-title]')
  const dlStatus = document.querySelector('[data-release-status]')
  const dlLink = document.querySelector('[data-release-link]')
  const releaseList = document.getElementById('releaseList')

  if (versionEls.length || dlStatus || releaseList) {
    const loadReleases = async () => {
      const key = 'oe-releases'
      try {
        const cached = JSON.parse(sessionStorage.getItem(key))
        if (cached && Date.now() - cached.t < 10 * 60 * 1000) return cached.data
      } catch {}
      const res = await fetch(`https://api.github.com/repos/${REPO}/releases?per_page=20`, {
        headers: { Accept: 'application/vnd.github+json' }
      })
      if (!res.ok) throw new Error(`GitHub API ${res.status}`)
      const data = (await res.json()).filter((r) => !r.draft)
      try { sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), data })) } catch {}
      return data
    }
    const fmtDate = (iso) => new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    const fmtSize = (bytes) => (bytes >= 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`)
    const el = (tag, cls, text) => {
      const node = document.createElement(tag)
      if (cls) node.className = cls
      if (text) node.textContent = text
      return node
    }

    const render = (releases) => {
      // releases === null means the API call failed: keep the static fallback copy
      if (!releases) {
        if (releaseList) {
          releaseList.replaceChildren(el('p', 'release-empty', 'Release notes could not be loaded right now. '))
          const a = el('a', 'text-link', 'See releases on GitHub')
          a.href = `${REPO_URL}/releases`
          releaseList.firstChild.append(a)
        }
        return
      }
      const latest = releases.find((r) => !r.prerelease) || releases[0]

      versionEls.forEach((node) => {
        node.textContent = latest ? `${latest.tag_name} · ${fmtDate(latest.published_at)}` : 'No public release yet'
      })

      if (dlStatus && dlLink) {
        if (latest) {
          const asset = latest.assets.find((a) => /\.(exe|zip|msi)$/i.test(a.name))
          if (dlTitle) dlTitle.textContent = `Download OneEngine ${latest.tag_name}`
          if (asset) {
            dlStatus.textContent = `${asset.name}, ${fmtSize(asset.size)}, published ${fmtDate(latest.published_at)}.`
            dlLink.href = asset.browser_download_url
            dlLink.querySelector('span').textContent = `Download ${asset.name}`
          } else {
            dlStatus.textContent = `Published ${fmtDate(latest.published_at)}. Pick a file from the release page.`
            dlLink.href = latest.html_url
            dlLink.querySelector('span').textContent = `Open ${latest.tag_name} on GitHub`
          }
        } else {
          if (dlTitle) dlTitle.textContent = 'No public build yet'
          dlStatus.textContent = 'OneEngine has not published a release on GitHub yet. Watch the repository to hear when the first build is out.'
          dlLink.href = REPO_URL
          dlLink.querySelector('span').textContent = 'Watch on GitHub'
        }
      }

      if (releaseList) {
        if (!releases.length) {
          releaseList.replaceChildren(el('p', 'release-empty', 'No releases have been published yet. The first build will appear here with its notes.'))
          return
        }
        releaseList.replaceChildren(...releases.map((r) => {
          const item = el('article', 'release')
          const head = el('header', 'release-head')
          const title = el('h2', '', r.name || r.tag_name)
          const meta = el('p', 'release-meta')
          const time = el('time', '', fmtDate(r.published_at))
          time.dateTime = r.published_at
          meta.append(`${r.tag_name} · `, time)
          if (r.prerelease) meta.append(' · ', el('span', 'release-pre', 'Pre-release'))
          head.append(title, meta)
          const body = el('p', 'release-body', (r.body || 'No notes for this release.').trim())
          const link = el('a', 'text-link', 'View on GitHub')
          link.href = r.html_url
          item.append(head, body, link)
          return item
        }))
      }
    }

    loadReleases().then(render).catch(() => render(null))
  }
})()
