const API_URL = import.meta.env.VITE_API_URL ?? ''
const TOKEN_KEY = 'solsa_token'
const USER_KEY = 'solsa_usuario'
const EMAIL_KEY = 'solsa_email_recordado'

export async function iniciarSesion({ email, password }) {
  const respuesta = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim(), password }),
  })

  const datos = await respuesta.json().catch(() => ({}))

  if (!respuesta.ok || !datos.ok) {
    throw new Error(datos.mensaje || 'No fue posible verificar las credenciales.')
  }

  return datos
}

export function guardarSesion({ token, usuario, recordar }) {
  const destino = recordar ? localStorage : sessionStorage
  const otro = recordar ? sessionStorage : localStorage

  otro.removeItem(TOKEN_KEY)
  otro.removeItem(USER_KEY)
  destino.setItem(TOKEN_KEY, token)
  destino.setItem(USER_KEY, JSON.stringify(usuario))

  if (recordar) {
    localStorage.setItem(EMAIL_KEY, usuario.email)
  } else {
    localStorage.removeItem(EMAIL_KEY)
  }
}

export function correoRecordado() {
  return localStorage.getItem(EMAIL_KEY) ?? ''
}

export function cerrarSesion() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(USER_KEY)
}
