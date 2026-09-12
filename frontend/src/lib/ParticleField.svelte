<script>
  import { onMount } from 'svelte'

  let { looking = true } = $props()
  let host = $state()
  const flags = { looking: true }
  $effect(() => {
    flags.looking = looking
  })

  onMount(() => {
    let disposed = false
    let cleanup = () => {}

    ;(async () => {
      const THREE = await import('three')
      if (disposed || !host) return

      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const scene = new THREE.Scene()
      scene.fog = new THREE.FogExp2(0x050505, 0.042)

      const camera = new THREE.PerspectiveCamera(62, 1, 0.1, 120)
      camera.position.set(0, 0, 16)

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6))
      renderer.setClearColor(0x000000, 0)
      host.appendChild(renderer.domElement)

      const disposables = []
      const add = (obj) => {
        scene.add(obj)
        if (obj.geometry) disposables.push(obj.geometry)
        if (obj.material) disposables.push(obj.material)
        return obj
      }

      const cloud = (n, radius, size, color, opacity) => {
        const pos = new Float32Array(n * 3)
        for (let i = 0; i < n; i++) {
          const r = Math.cbrt(Math.random()) * radius
          const t = Math.random() * Math.PI * 2
          const p = Math.acos(2 * Math.random() - 1)
          pos[i * 3] = r * Math.sin(p) * Math.cos(t)
          pos[i * 3 + 1] = r * Math.sin(p) * Math.sin(t) * 0.7
          pos[i * 3 + 2] = r * Math.cos(p)
        }
        const geo = new THREE.BufferGeometry()
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
        return add(
          new THREE.Points(
            geo,
            new THREE.PointsMaterial({
              size,
              color,
              transparent: true,
              opacity,
              blending: THREE.AdditiveBlending,
              depthWrite: false,
              sizeAttenuation: true,
            }),
          ),
        )
      }

      const inner = cloud(reduce ? 700 : 3200, 7.2, 0.045, 0xf2eee6, 0.9)
      const mid = cloud(reduce ? 400 : 1800, 14, 0.06, 0x9aa7c7, 0.45)
      const far = cloud(reduce ? 300 : 1400, 28, 0.08, 0xffffff, 0.28)

      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.12,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
      disposables.push(ringMat)
      const rings = [4.2, 6.1, 8.4].map((r, i) => {
        const mesh = new THREE.Mesh(new THREE.TorusGeometry(r, 0.008, 8, 180), ringMat)
        mesh.rotation.set(0.4 + i * 0.35, 0.2 * i, 0.15 * i)
        return add(mesh)
      })

      const glow = add(
        new THREE.Mesh(
          new THREE.SphereGeometry(1.15, 24, 24),
          new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.07,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          }),
        ),
      )

      const mouse = { x: 0, y: 0 }
      const onMove = (e) => {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1
      }
      window.addEventListener('pointermove', onMove, { passive: true })

      const fit = () => {
        const { clientWidth: w, clientHeight: h } = host
        camera.aspect = w / h || 1
        camera.updateProjectionMatrix()
        renderer.setSize(w, h)
      }
      fit()
      const ro = new ResizeObserver(fit)
      ro.observe(host)

      const clock = new THREE.Clock()
      let id
      const tick = () => {
        id = requestAnimationFrame(tick)
        const t = clock.getElapsedTime()
        if (!reduce) {
          inner.rotation.y = t * 0.07
          inner.rotation.x = Math.sin(t * 0.12) * 0.12
          mid.rotation.y = -t * 0.03
          far.rotation.y = t * 0.012
          glow.scale.setScalar(1 + Math.sin(t * 1.4) * 0.08)
          rings.forEach((ring, i) => {
            ring.rotation.x += 0.0012 * (i + 1)
            ring.rotation.y += 0.0008 * (3 - i)
            ring.rotation.z += 0.0005
          })
          const aimX = flags.looking ? mouse.x * 2.4 : 0
          const aimY = flags.looking ? mouse.y * 1.4 : 0
          camera.position.x += (aimX - camera.position.x) * 0.045
          camera.position.y += (aimY - camera.position.y) * 0.045
          camera.position.z = 16 + Math.sin(t * 0.35) * 0.55
          camera.lookAt(aimX * 0.35, aimY * 0.25, 0)
        }
        renderer.render(scene, camera)
      }
      tick()

      cleanup = () => {
        cancelAnimationFrame(id)
        ro.disconnect()
        window.removeEventListener('pointermove', onMove)
        disposables.forEach((d) => d.dispose())
        renderer.dispose()
        renderer.domElement.remove()
      }
    })()

    return () => {
      disposed = true
      cleanup()
    }
  })
</script>

<div bind:this={host} class="pointer-events-none absolute inset-0" aria-hidden="true"></div>
