<script>
  import {
    correoRecordado,
    guardarSesion,
    iniciarSesion,
  } from './auth.js'

  let { onExito, onCerrar } = $props()

  const emailGuardado = correoRecordado()
  let email = $state(emailGuardado)
  let password = $state('')
  let recordar = $state(Boolean(emailGuardado))
  let mostrar = $state(false)
  let cargando = $state(false)
  let error = $state('')
  const invalido = $derived(!email.trim() || !password)

  async function enviar(e) {
    e.preventDefault()
    error = ''
    if (invalido) {
      error = 'Ingrese correo y contraseña.'
      return
    }
    cargando = true
    try {
      const r = await iniciarSesion({ email, password })
      guardarSesion({ token: r.token, usuario: r.usuario, recordar })
      onExito(r.usuario)
    } catch (err) {
      error = err instanceof Error ? err.message : 'Error inesperado.'
    } finally {
      cargando = false
    }
  }
</script>

<div class="glass panel-enter w-full max-w-[400px] p-7">
  <div class="mb-6 flex items-start justify-between gap-4">
    <div>
      <p class="text-[11px] tracking-[0.28em] text-white/45 uppercase">Acceso</p>
      <h2 class="mt-1 font-serif text-3xl text-white">Bienvenido</h2>
    </div>
    {#if onCerrar}
      <button type="button" class="text-white/40 hover:text-white" onclick={onCerrar} aria-label="Cerrar">✕</button>
    {/if}
  </div>

  <form class="space-y-4" onsubmit={enviar} novalidate>
    {#if error}
      <p class="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200" role="alert">{error}</p>
    {/if}

    <label class="block">
      <span class="mb-1.5 block text-[11px] tracking-[0.16em] text-white/50 uppercase">Correo</span>
      <input
        type="email"
        autocomplete="email"
        bind:value={email}
        disabled={cargando}
        class="field"
        placeholder="nombre@solsafilms.com"
      />
    </label>

    <label class="block">
      <span class="mb-1.5 block text-[11px] tracking-[0.16em] text-white/50 uppercase">Contraseña</span>
      <div class="relative">
        <input
          type={mostrar ? 'text' : 'password'}
          autocomplete="current-password"
          bind:value={password}
          disabled={cargando}
          class="field pr-11"
        />
        <button
          type="button"
          class="absolute inset-y-0 right-0 w-11 text-white/40 hover:text-white"
          onclick={() => (mostrar = !mostrar)}
        >
          {mostrar ? 'Ocultar' : 'Ver'}
        </button>
      </div>
    </label>

    <label class="flex items-center gap-2 text-sm text-white/60">
      <input type="checkbox" bind:checked={recordar} class="accent-white" />
      Recordarme
    </label>

    <button type="submit" class="btn-solid w-full" disabled={cargando || invalido}>
      {cargando ? 'Verificando…' : 'Comience'}
    </button>
  </form>
</div>
