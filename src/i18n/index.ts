// Idiomas del juego. El contenido se escribe en español y la traducción al
// inglés vive en ./en.ts (diccionario indexado por el texto en español).
import { EN } from './en';

export type Lang = 'es' | 'en';

let lang: Lang = 'es';

export function setLang(l: Lang) {
  lang = l;
  if (typeof document !== 'undefined') {
    document.documentElement.lang = l;
    document.title = l === 'en' ? 'Huasipungo · Educational video game' : 'Huasipungo · Videojuego educativo';
  }
}

export function getLang(): Lang {
  return lang;
}

/**
 * Devuelve el texto en el idioma activo.
 * - tr('Hola', 'Hello'): traducción escrita en el mismo lugar.
 * - tr(texto): busca la traducción en el diccionario (contenido de src/data).
 */
export function tr(es: string, en?: string): string {
  if (lang === 'es') return es;
  return en ?? EN[es] ?? es;
}
