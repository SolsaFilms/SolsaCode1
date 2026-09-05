function sinPassword(usuario) {
  if (!usuario) return usuario;
  const { password_hash, ...resto } = usuario;
  return resto;
}

function requerido(campos, body) {
  const faltantes = campos.filter((campo) => {
    const valor = body[campo];
    return valor === undefined || valor === null || String(valor).trim() === '';
  });
  return faltantes;
}

module.exports = { sinPassword, requerido };
