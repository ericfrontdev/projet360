import { useEffect, useState } from "react";

/**
 * Détecte si l'appareil est un écran tactile (mobile/tablette).
 * Utilise `pointer: coarse` — vrai sur tous les appareils touch.
 * Retourne `false` côté serveur (SSR-safe).
 */
export function useTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  return isTouch;
}
