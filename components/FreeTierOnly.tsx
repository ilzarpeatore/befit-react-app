import React from "react";
import { useAuth } from "../store/AuthContext";

interface Props {
  children: React.ReactNode;
}

/**
 * Envuelve cualquier contenido de venta (banners, tarjetas bloqueadas,
 * la sección "Programas", avisos de oferta) — un cliente de entrenamiento
 * personal (is_personal_client) nunca lo ve. Punto único de control: se
 * envuelve una vez cada pieza de contenido de venta, en vez de repetir el
 * chequeo en cada pantalla nueva (fácil de olvidar en algún sitio y dejar
 * que se cuele una oferta).
 *
 * No es un control de acceso — PackageAccessService ya le da acceso total
 * al contenido igualmente. Esto es solo para no mostrarle publicidad.
 */
function FreeTierOnly({ children }: Props) {
  const { state } = useAuth();

  if (state.user?.is_personal_client) {
    return null;
  }

  return <>{children}</>;
}

export const FreeTierOnlyMem = React.memo(FreeTierOnly);
export default FreeTierOnly;
