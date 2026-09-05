<script>
  import {
    correoRecordado,
    cerrarSesion,
    guardarSesion,
    iniciarSesion,
  } from './lib/auth.js'

  const emailGuardado = correoRecordado()

  let email = $state(emailGuardado)
  let password = $state('')
  let recordar = $state(Boolean(emailGuardado))
  let mostrarPassword = $state(false)
  let cargando = $state(false)
  let error = $state('')
  let aviso = $state('')
  let sesion = $state(null)

  const formularioInvalido = $derived(!email.trim() || password.length < 1)

  async function enviar(evento) {
    evento.preventDefault()
    error = ''
    aviso = ''

    if (formularioInvalido) {
      error = 'Ingrese su correo electrónico y contraseña.'
      return
    }

    cargando = true

    try {
      const resultado = await iniciarSesion({ email, password })
      guardarSesion({
        token: resultado.token,
        usuario: resultado.usuario,
        recordar,
      })
      sesion = resultado.usuario
      password = ''
    } catch (err) {
      error = err instanceof Error ? err.message : 'Ocurrió un error inesperado.'
    } finally {
      cargando = false
    }
  }

  function salir() {
    cerrarSesion()
    sesion = null
  }

  function olvidaste(evento) {
    evento.preventDefault()
    error = ''
    aviso = 'La recuperación de acceso la gestiona el administrador del sistema.'
  }
</script>

<div class="min-h-svh lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
  <aside
    class="relative flex min-h-[34svh] flex-col justify-between overflow-hidden bg-navy px-8 py-10 text-paper panel-texture sm:px-12 lg:min-h-svh lg:px-16 lg:py-14"
  >
    <div class="pointer-events-none absolute inset-y-0 left-0 w-3 sprocket" aria-hidden="true"></div>
    <div class="pointer-events-none absolute inset-y-10 right-10 hidden w-px bg-white/10 lg:block" aria-hidden="true"></div>

    <header class="relative">
      <p class="text-[11px] font-medium tracking-[0.32em] text-gold-soft uppercase">SolsaFilms</p>
      <p class="mt-3 text-sm tracking-[0.08em] text-paper/55">Consola institucional</p>
    </header>

    <div class="relative max-w-md py-10 lg:py-0">
      <p class="font-serif text-[2.35rem] leading-[1.12] text-paper sm:text-5xl lg:text-[3.35rem]">
        Custodia del acervo.<br />
        <span class="italic text-gold-soft">Precisión operativa.</span>
      </p>
      <p class="mt-6 max-w-sm text-[15px] leading-relaxed text-paper/65">
        Plataforma de administración para el control de inventario cinematográfico, clientes y rentas.
      </p>

      <dl class="mt-10 grid grid-cols-3 gap-6 border-t border-white/10 pt-8 text-paper/80">
        <div>
          <dt class="text-[10px] tracking-[0.22em] text-paper/40 uppercase">Ámbito</dt>
          <dd class="mt-2 text-sm">Institucional</dd>
        </div>
        <div>
          <dt class="text-[10px] tracking-[0.22em] text-paper/40 uppercase">Acceso</dt>
          <dd class="mt-2 text-sm">Nominativo</dd>
        </div>
        <div>
          <dt class="text-[10px] tracking-[0.22em] text-paper/40 uppercase">Canal</dt>
          <dd class="mt-2 text-sm">Cifrado</dd>
        </div>
      </dl>
    </div>

    <footer class="relative text-[12px] tracking-wide text-paper/35">
      © {new Date().getFullYear()} SolsaFilms · Uso exclusivo autorizado
    </footer>
  </aside>

  <main class="flex items-center bg-paper px-6 py-12 sm:px-12 lg:px-16 xl:px-24">
    <div class="mx-auto w-full max-w-[420px]">
      <div class="mb-10 flex items-center gap-3">
        <span class="flex h-10 w-10 items-center justify-center border border-gold/70 text-[11px] tracking-[0.16em] text-navy" aria-hidden="true">
          SF
        </span>
        <div>
          <p class="text-[13px] font-medium tracking-[0.18em] text-navy uppercase">SolsaFilms</p>
          <p class="text-xs text-muted">Administración</p>
        </div>
      </div>

      {#if sesion}
        <section aria-live="polite">
          <p class="text-[11px] tracking-[0.28em] text-gold uppercase">Sesión activa</p>
          <h1 class="mt-3 font-serif text-4xl text-ink-text">Bienvenido</h1>
          <p class="mt-3 text-sm leading-relaxed text-muted">
            Identidad verificada. Las credenciales coinciden con un usuario autorizado del sistema.
          </p>
          <div class="mt-8 border border-line bg-white/60 px-5 py-4">
            <p class="text-sm font-medium text-ink-text">{sesion.nombre}</p>
            <p class="mt-1 text-sm text-muted">{sesion.email}</p>
            <p class="mt-3 text-[11px] tracking-[0.2em] text-gold uppercase">{sesion.rol}</p>
          </div>
          <button
            type="button"
            class="mt-8 w-full border border-navy/20 px-4 py-3 text-sm tracking-wide text-navy transition-colors duration-200 hover:border-navy hover:bg-navy hover:text-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            onclick={salir}
          >
            Cerrar sesión
          </button>
        </section>
      {:else}
        <p class="text-[11px] tracking-[0.28em] text-gold uppercase">Acceso seguro</p>
        <h1 class="mt-3 font-serif text-4xl text-ink-text sm:text-[2.6rem]">Bienvenido</h1>
        <p class="mt-3 text-sm leading-relaxed text-muted">
          Ingrese con las credenciales institucionales que le fueron asignadas para continuar.
        </p>

        <form class="mt-10 space-y-5" onsubmit={enviar} novalidate>
          {#if error}
            <div
              class="border border-danger/25 bg-danger-bg px-4 py-3 text-sm text-danger"
              role="alert"
            >
              {error}
            </div>
          {/if}

          {#if aviso}
            <div
              class="border border-navy/10 bg-white px-4 py-3 text-sm text-navy/80"
              role="status"
            >
              {aviso}
            </div>
          {/if}

          <div>
            <label for="email" class="mb-2 block text-[12px] font-medium tracking-[0.08em] text-navy uppercase">
              Correo electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autocomplete="email"
              inputmode="email"
              required
              aria-invalid={error ? 'true' : 'false'}
              bind:value={email}
              disabled={cargando}
              class="w-full border border-line bg-white px-3.5 py-3 text-[15px] text-ink-text outline-none transition-colors duration-200 placeholder:text-muted/50 hover:border-navy/30 focus:border-navy disabled:cursor-not-allowed disabled:bg-mist/40 disabled:text-muted"
              placeholder="nombre@institucion.mx"
            />
          </div>

          <div>
            <label for="password" class="mb-2 block text-[12px] font-medium tracking-[0.08em] text-navy uppercase">
              Contraseña
            </label>
            <div class="relative">
              <input
                id="password"
                name="password"
                type={mostrarPassword ? 'text' : 'password'}
                autocomplete="current-password"
                required
                bind:value={password}
                disabled={cargando}
                class="w-full border border-line bg-white py-3 pr-12 pl-3.5 text-[15px] text-ink-text outline-none transition-colors duration-200 placeholder:text-muted/50 hover:border-navy/30 focus:border-navy disabled:cursor-not-allowed disabled:bg-mist/40 disabled:text-muted"
                placeholder="••••••••"
              />
              <button
                type="button"
                class="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-muted transition-colors duration-200 hover:text-navy focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-gold disabled:opacity-40"
                aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                aria-pressed={mostrarPassword}
                disabled={cargando}
                onclick={() => (mostrarPassword = !mostrarPassword)}
              >
                {#if mostrarPassword}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" class="h-[18px] w-[18px]" aria-hidden="true">
                    <path d="M3 3l18 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                    <path d="M10.6 10.7a2.2 2.2 0 003.1 3.1M9.9 5.5A10 10 0 0121 12a10.4 10.4 0 01-2.1 3.1M6.2 6.4A10.3 10.3 0 003 12a10.2 10.2 0 0012.4 6.1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                  </svg>
                {:else}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" class="h-[18px] w-[18px]" aria-hidden="true">
                    <path d="M2.8 12S6.4 6.5 12 6.5 21.2 12 21.2 12 17.6 17.5 12 17.5 2.8 12 2.8 12z" stroke="currentColor" stroke-width="1.5" />
                    <circle cx="12" cy="12" r="2.4" stroke="currentColor" stroke-width="1.5" />
                  </svg>
                {/if}
              </button>
            </div>
          </div>

          <div class="flex items-center justify-between gap-4 pt-1">
            <label class="flex cursor-pointer items-center gap-2.5 text-sm text-navy/80">
              <input
                type="checkbox"
                class="h-4 w-4 appearance-none border border-line bg-white transition-colors duration-200 checked:border-navy checked:bg-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:cursor-not-allowed"
                bind:checked={recordar}
                disabled={cargando}
              />
              Recordarme
            </label>
            <a
              href="#recuperar"
              class="text-sm text-muted underline decoration-line underline-offset-4 transition-colors duration-200 hover:text-navy hover:decoration-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              onclick={olvidaste}
            >
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          <button
            type="submit"
            class="mt-2 flex w-full items-center justify-center gap-2 bg-navy px-4 py-3.5 text-sm tracking-[0.16em] text-paper uppercase transition-colors duration-200 hover:bg-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:cursor-not-allowed disabled:bg-navy/45"
            disabled={cargando || formularioInvalido}
          >
            {#if cargando}
              <span
                class="h-4 w-4 animate-spin rounded-full border border-paper/25 border-t-paper"
                aria-hidden="true"
              ></span>
              Verificando
            {:else}
              Iniciar sesión
            {/if}
          </button>
        </form>
      {/if}
    </div>
  </main>
</div>
