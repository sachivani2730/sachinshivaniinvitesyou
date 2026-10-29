(() => {
  const scene = document.querySelector('#fort-scene')
  const entryButton = document.querySelector('#enter-invitation')
  const entryControl = document.querySelector('#entry-control')
  const scrollCue = document.querySelector('#scroll-cue')
  const audio = document.querySelector('#wedding-audio')
  const audioNote = document.querySelector('#audio-note')
  if (!scene || !entryButton || !entryControl || !scrollCue) return

  const root = document.documentElement
  const body = document.body
  const previousRootOverflow = root.style.overflow
  const previousBodyOverflow = body.style.overflow
  const leftGate = scene.querySelector('.gate-panel-left')
  const rightGate = scene.querySelector('.gate-panel-right')
  const gatePair = scene.querySelector('.gate-pair')
  const glow = scene.querySelector('.scene-glow')
  const progress = scene.querySelector('.scroll-progress')
  const gsapReady = Boolean(window.gsap && window.ScrollTrigger)
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  let invitationStarted = false
  let gatesOpened = false
  let openingTimeline = null

  root.style.overflow = 'hidden'
  body.style.overflow = 'hidden'

  if (gsapReady) {
    window.gsap.registerPlugin(window.ScrollTrigger)
    window.gsap.set([leftGate, rightGate], { transformPerspective: 1500, force3D: true })
    if (!reduceMotion) {
      openingTimeline = window.gsap.timeline({ paused: true })
        .to(leftGate, { rotateY: -102, xPercent: -8, duration: 1.35, ease: 'power3.inOut' }, 0)
        .to(rightGate, { rotateY: 102, xPercent: 8, duration: 1.35, ease: 'power3.inOut' }, 0)
        .to(glow, { opacity: 0.78, duration: 1.1, ease: 'power2.out' }, 0.22)
        .to(progress, { scaleX: 1, duration: 1.1, ease: 'power2.out' }, 0)
    }
  }

  function openGates() {
    if (!invitationStarted || gatesOpened) return
    gatesOpened = true
    if (openingTimeline) openingTimeline.play(0)
    else gatePair?.classList.add('is-open')
  }

  function unlockInvitation() {
    if (invitationStarted) return
    invitationStarted = true
    root.style.overflow = previousRootOverflow
    body.style.overflow = previousBodyOverflow
    entryControl.hidden = true
    scrollCue.hidden = false

    if (audio) {
      audio.volume = 1
      audio.muted = false
      void audio.play().catch(() => {
        if (audioNote) audioNote.textContent = 'Tap once more to allow the wedding music to play.'
      })
    }

    if (gsapReady && !reduceMotion) {
      window.ScrollTrigger.create({
        trigger: scene,
        start: 'top top',
        end: 'bottom top',
        onUpdate: self => {
          window.gsap.set(progress, { scaleX: self.progress })
          if (self.progress > 0) openGates()
        },
      })
      window.ScrollTrigger.refresh()
    }
  }

  function openFromGesture() {
    if (invitationStarted) openGates()
  }

  entryButton.addEventListener('click', unlockInvitation)
  window.addEventListener('scroll', openFromGesture, { passive: true })
  window.addEventListener('wheel', openFromGesture, { passive: true })
  document.addEventListener('touchstart', openFromGesture, { passive: true })
  document.addEventListener('pointerdown', openFromGesture, { passive: true })
  audio?.addEventListener('playing', () => { if (audioNote) audioNote.textContent = '' })
  audio?.addEventListener('error', () => { if (audioNote) audioNote.textContent = 'Wedding music could not be loaded.' })
})()
