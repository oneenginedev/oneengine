// OneEngine Static Website Interactivity
;(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  const PLAY_PATH = 'M8 5v14l11-7z'
  const PAUSE_PATH = 'M6 19h4V5H6v14zm8-14v14h4V5h-4z'

  // Hero background motion (video + fire). Reduced-motion visitors start paused.
  let heroMotionPaused = reduced
  let syncFire = () => {}
  // CSS loops in the hero (logo ping, capture dot) read this class
  const paintMotionClass = () => document.documentElement.classList.toggle('motion-paused', heroMotionPaused)

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

    // Pre-render one flame sprite. Drawing it scaled with globalAlpha is much cheaper
    // than building a radial gradient (and five colour strings) per particle per frame.
    const SPRITE = 64
    const sprite = document.createElement('canvas')
    sprite.width = sprite.height = SPRITE
    {
      const sctx = sprite.getContext('2d')
      const r = SPRITE / 2
      const grad = sctx.createRadialGradient(r, r, 0, r, r, r)
      grad.addColorStop(0,    'rgba(255,255,220,0.95)') // white-yellow core
      grad.addColorStop(0.25, 'rgba(255,200, 50,0.85)')
      grad.addColorStop(0.55, 'rgba(255, 80, 10,0.65)')
      grad.addColorStop(0.80, 'rgba(180, 20,  0,0.35)')
      grad.addColorStop(1,    'rgba( 80,  0,  0,0)')
      sctx.fillStyle = grad
      sctx.fillRect(0, 0, SPRITE, SPRITE)
    }

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
        ctx.globalAlpha = Math.max(0, this.life)
        const d = this.radius * 2
        ctx.drawImage(sprite, this.x - this.radius, this.y - this.radius, d, d)
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
        // Specks are under 2.5px wide, so a square is indistinguishable from a circle
        ctx.globalAlpha = Math.max(0, this.life) * 0.9
        const d = this.radius * 2
        ctx.fillRect(this.x - this.radius, this.y - this.radius, d, d)
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
      ctx.fillStyle = 'rgb(255,220,80)'
      for (const e of embers) { e.update(); e.draw(ctx) }
      ctx.globalAlpha = 1
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

    // Resizing a canvas clears it, so redraw straight away when the loop isn't running
    new ResizeObserver(() => {
      w = fireCanvas.width = fireCanvas.offsetWidth
      h = fireCanvas.height = fireCanvas.offsetHeight
      if (!fireRaf) drawFire()
    }).observe(fireCanvas)
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
      paintMotionClass()
    })
    paintHeroToggle()
    paintMotionClass()
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

  // ---------------------------------------------------------------- Smooth scrolling (Lenis)
  // Skipped for reduced-motion visitors, and if the CDN script didn't load: native scrolling still works.
  if (!reduced && window.Lenis) {
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true })
    const lenisFrame = (time) => {
      lenis.raf(time)
      requestAnimationFrame(lenisFrame)
    }
    requestAnimationFrame(lenisFrame)

    // In-page links glide too, landing below the fixed nav like scroll-padding-top does natively
    const NAV_OFFSET = -90
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]')
      if (!link || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const id = decodeURIComponent(link.hash.slice(1))
      const target = id && document.getElementById(id)
      if (!target) return
      e.preventDefault()
      const isMain = target.id === 'main'
      lenis.scrollTo(isMain ? 0 : target, {
        offset: isMain ? 0 : NAV_OFFSET,
        // The skip link must also move keyboard focus, not just the viewport
        onComplete: () => { if (isMain) target.focus({ preventScroll: true }) }
      })
      history.pushState(null, '', `#${id}`)
    })
  }

  // ---------------------------------------------------------------- Current section in the nav
  // Marks the link whose section crosses the middle of the screen, so readers know where they are.
  const sectionLinks = [...document.querySelectorAll('#siteNav a[href^="#"]')]
    .map((a) => [a, document.getElementById(a.hash.slice(1))])
    .filter(([, section]) => section)
  if (sectionLinks.length) {
    const markCurrent = (id) => {
      for (const [a, section] of sectionLinks) {
        if (section.id === id) a.setAttribute('aria-current', 'true')
        else a.removeAttribute('aria-current')
      }
    }
    const spy = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) markCurrent(entry.target.id)
        // Above the first linked section (the hero), nothing is current
        else if (entry.target === sectionLinks[0][1] && entry.boundingClientRect.top > 0) markCurrent(null)
      }
    }, { rootMargin: '-45% 0px -50% 0px' })
    for (const [, section] of sectionLinks) spy.observe(section)
  }

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

  // ---------------------------------------------------------------- Reveal on scroll
  // Blocks marked data-reveal fade and rise into place once. They are only hidden after this
  // runs (html.js-reveal), so the page never loses content without script.
  const revealEls = document.querySelectorAll('[data-reveal]')
  if (revealEls.length && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('js-reveal')
    const revealObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        entry.target.classList.add('is-in')
        revealObserver.unobserve(entry.target)
      }
    }, { rootMargin: '0px 0px -8% 0px' })
    revealEls.forEach((el) => revealObserver.observe(el))
  }

  // ---------------------------------------------------------------- Nav over dark bands
  // While a dark band passes under the floating nav, the pill switches to dark glass.
  const navBar = document.querySelector('.nav')
  const darkBands = [...document.querySelectorAll('[data-nav-dark]')]
  if (navBar && darkBands.length) {
    const checkNavTone = () => {
      const r = navBar.getBoundingClientRect()
      const y = r.top + r.height / 2
      const over = darkBands.some((band) => {
        const b = band.getBoundingClientRect()
        return b.top <= y && b.bottom >= y
      })
      navBar.classList.toggle('nav--dark', over)
    }
    let toneQueued = false
    addEventListener('scroll', () => {
      if (toneQueued) return
      toneQueued = true
      requestAnimationFrame(() => {
        toneQueued = false
        checkNavTone()
      })
    }, { passive: true })
    addEventListener('resize', checkNavTone)
    checkNavTone()
  }

  // ---------------------------------------------------------------- Live GitHub activity card
  // Real data only: commits to the repository over the last 12 weeks, one bar per week.
  const ghCount = document.querySelector('[data-gh-count]')
  if (ghCount) {
    const WEEKS = 12
    const WEEK_MS = 7 * 24 * 60 * 60 * 1000
    const ghBars = [...document.querySelectorAll('[data-gh-bars] li')]
    const ghLive = document.querySelector('[data-gh-live]')
    const ghNote = document.querySelector('[data-gh-note]')
    const since = new Date(Date.now() - WEEKS * WEEK_MS)

    const loadCommitDates = async () => {
      const key = 'oe-commits'
      try {
        const cached = JSON.parse(sessionStorage.getItem(key))
        if (cached && Date.now() - cached.t < 10 * 60 * 1000) return cached.data
      } catch {}
      const res = await fetch(`https://api.github.com/repos/${REPO}/commits?since=${since.toISOString()}&per_page=100`, {
        headers: { Accept: 'application/vnd.github+json' }
      })
      if (!res.ok) throw new Error(`GitHub API ${res.status}`)
      const data = (await res.json()).map((c) => c.commit.author.date)
      try { sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), data })) } catch {}
      return data
    }

    const countUp = (to, suffix) => {
      if (reduced) { ghCount.textContent = `${to}${suffix}`; return }
      const start = performance.now()
      const tick = (now) => {
        const t = Math.min(1, (now - start) / 1200)
        ghCount.textContent = `${Math.round(to * (1 - Math.pow(1 - t, 3)))}${suffix}`
        if (t < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }

    loadCommitDates().then((dates) => {
      const perWeek = new Array(WEEKS).fill(0)
      for (const d of dates) {
        const age = Math.floor((Date.now() - new Date(d).getTime()) / WEEK_MS)
        if (age >= 0 && age < WEEKS) perWeek[WEEKS - 1 - age]++ // oldest week first
      }
      const peak = Math.max(1, ...perWeek)
      ghBars.forEach((bar, i) => {
        const n = perWeek[i] || 0
        bar.style.setProperty('--h', n ? `${Math.max(12, Math.round((n / peak) * 100))}%` : '4px')
        bar.classList.toggle('has-commits', n > 0)
        bar.title = `${n} commit${n === 1 ? '' : 's'}`
      })
      countUp(dates.length, dates.length >= 100 ? '+' : '')
      if (ghLive) ghLive.hidden = false
    }).catch(() => {
      // Leave the dash: never show a number that was not fetched
      if (ghNote) ghNote.prepend('Could not reach GitHub right now. ')
    })
  }
})()
