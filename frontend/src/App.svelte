<script>
  import ParticleField from './lib/ParticleField.svelte'
  import LoginPanel from './lib/LoginPanel.svelte'
  import { cerrarSesion, sesionActual } from './lib/auth.js'

  let sesion = $state(sesionActual())
  let loginAbierto = $state(false)
  let menu = $state(false)
  let rx = $state(0)
  let ry = $state(0)
  let mx = $state(50)
  let my = $state(50)

  const anio = new Date().getFullYear()
  const paneles = [
    ['Catálogo', 'Películas y existencias', -40],
    ['Clientes', 'Directorio operativo', 0],
    ['Rentas', 'Ciclo de préstamo', 40],
  ]

  function mirar(e) {
    if (loginAbierto) return
    const w = window.innerWidth
    const h = window.innerHeight
    ry = (e.clientX / w - 0.5) * 14
    rx = -(e.clientY / h - 0.5) * 9
    mx = (e.clientX / w) * 100
    my = (e.clientY / h) * 100
  }

  function abrirLogin() {
    loginAbierto = true
    rx = 0
    ry = 0
  }
</script>

<svelte:window onpointermove={mirar} />

<div
  class="stage visor"
  style="--rx:{rx}deg; --ry:{ry}deg; --mx:{mx}%; --my:{my}%"
>
  <ParticleField looking={!loginAbierto} />
  <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_8%,#050505_82%)]"></div>
  <div class="gaze" aria-hidden="true"></div>

  <div class="world">
    <header class="relative z-20 flex items-center justify-between gap-4 px-5 py-5 md:px-10 hud-in">
      <a href="#inicio" class="flex items-center gap-2 text-[15px] font-medium tracking-[0.12em]">
        <span class="logo-orb">S</span>
        SOLSAFILMS
      </a>

      <nav class="hidden items-center gap-8 text-[12px] tracking-[0.18em] text-white/70 uppercase md:flex">
        <a href="#catalogo" class="nav-link">Catálogo</a>
        <a href="#rentas" class="nav-link">Rentas</a>
        <a href="#recursos" class="nav-link">Recursos</a>
      </nav>

      <div class="flex items-center gap-2">
        {#if sesion}
          <span class="hidden text-sm text-white/60 sm:inline">{sesion.nombre}</span>
          <button type="button" class="btn-ghost" onclick={() => { cerrarSesion(); sesion = null }}>Salir</button>
        {:else}
          <button type="button" class="btn-ghost hidden sm:inline-flex" onclick={abrirLogin}>Acceso</button>
          <button type="button" class="btn-solid pulse-btn" onclick={abrirLogin}>Comience</button>
        {/if}
        <button type="button" class="btn-ghost md:hidden" onclick={() => (menu = !menu)} aria-label="Menú">☰</button>
      </div>
    </header>

    {#if menu}
      <div class="relative z-20 mx-5 mb-2 flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/70 p-4 text-sm uppercase tracking-[0.16em] md:hidden">
        <a href="#catalogo" onclick={() => (menu = false)}>Catálogo</a>
        <a href="#rentas" onclick={() => (menu = false)}>Rentas</a>
        <a href="#recursos" onclick={() => (menu = false)}>Recursos</a>
      </div>
    {/if}

    <main id="inicio" class="relative z-10 mx-auto flex min-h-[calc(100svh-88px)] max-w-6xl flex-col items-center justify-center px-5 pb-16 text-center">
      {#if sesion}
        <p class="float-copy text-[11px] tracking-[0.32em] text-white/45 uppercase">Sesión activa · {sesion.rol}</p>
        <h1 class="hero-copy mt-4 max-w-3xl font-serif text-4xl leading-tight sm:text-6xl">Consola de administración</h1>
        <p class="float-copy mt-4 max-w-lg text-white/60">{sesion.email}</p>
        <div id="catalogo" class="mt-12 grid w-full max-w-3xl gap-4 sm:grid-cols-3" style="transform-style: preserve-3d">
          {#each paneles as [t, d, z], i}
            <article class="glass depth-card p-5 text-left" style="--delay:{i * 0.12}s; --z:{z}px">
              <h2 class="font-medium">{t}</h2>
              <p class="mt-1 text-sm text-white/50">{d}</p>
            </article>
          {/each}
        </div>
      {:else}
        <aside class="card-float bob" style="--x:6%; --y:22%; --r:-10deg; --z:80px; --delay:0s">
          <p class="text-[10px] tracking-[0.2em] text-white/40 uppercase">Acervo</p>
          <p class="mt-2 font-serif text-2xl">Heading</p>
          <p class="mt-1 text-xs text-white/45">Tipografía de consola</p>
        </aside>
        <aside class="card-float bob" style="--x:78%; --y:16%; --r:9deg; --z:110px; --delay:0.4s">
          <div class="mb-3 h-16 rounded-lg bg-gradient-to-br from-amber-200/80 to-stone-700 shimmer"></div>
          <p class="text-sm">Faun</p>
        </aside>
        <aside class="card-float bob" style="--x:8%; --y:68%; --r:7deg; --z:60px; --delay:0.8s">
          <p class="text-[10px] text-white/40 uppercase">Fonts</p>
          <p class="mt-2 font-serif text-xl italic">Ethereal</p>
        </aside>
        <aside class="card-float bob" style="--x:76%; --y:70%; --r:-6deg; --z:90px; --delay:1.1s">
          <p class="text-[10px] text-white/40 uppercase">Palette</p>
          <div class="mt-3 flex gap-2">
            <span class="h-7 w-7 rounded-full bg-white"></span>
            <span class="h-7 w-7 rounded-full bg-zinc-500"></span>
            <span class="h-7 w-7 rounded-full bg-zinc-800 ring-1 ring-white/20"></span>
          </div>
        </aside>

        <h1 class="hero-copy max-w-3xl font-serif text-[1.85rem] leading-[1.25] text-balance sm:text-5xl">
          Combinamos la precisión de un acervo cinematográfico con una consola diseñada para que cada operación deje huella.
        </h1>
        <button type="button" class="cta-orbit mt-8 inline-flex items-center gap-2 text-sm tracking-[0.22em] uppercase" onclick={abrirLogin}>
          Comience <span class="arrow" aria-hidden="true">→</span>
        </button>
      {/if}
    </main>

    <footer id="recursos" class="relative z-10 px-5 py-6 text-center text-xs text-white/30">
      © {anio} SolsaFilms · entorno inmersivo
    </footer>
  </div>

  {#if loginAbierto && !sesion}
    <div class="portal" role="dialog" aria-modal="true">
      <LoginPanel
        onExito={(u) => { sesion = u; loginAbierto = false }}
        onCerrar={() => (loginAbierto = false)}
      />
    </div>
  {/if}
</div>
