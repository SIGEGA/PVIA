// Roles del sistema en orden de jerarquía
export const ROLES = {
  VENDEDOR: 'vendedor',
  GERENTE: 'gerente',
  ADMINISTRADOR: 'administrador',
};

// Verifica si el rol tiene acceso mínimo requerido
const hierarchy = [ROLES.VENDEDOR, ROLES.GERENTE, ROLES.ADMINISTRADOR];

export const hasMinRole = (userRole, minRole) => {
  const userLevel = hierarchy.indexOf(userRole);
  const minLevel = hierarchy.indexOf(minRole);
  return userLevel >= minLevel;
};
