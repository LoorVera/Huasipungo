// Contenido educativo adicional para las funciones interactivas
// (modal de personajes, "¿Quién soy?" y Juego de memoria).

export interface PersonajeExtra {
  quienEs: string;
  importancia: string;
  historia: string;
  relacionesDetalle: { con: string; texto: string }[];
  representa: string;
  /** Pistas para "¿Quién soy?", de la más difícil a la más fácil */
  pistas: [string, string, string];
}

export const PERSONAJES_EXTRA: Record<string, PersonajeExtra> = {
  andres: {
    quienEs: 'Indígena que vive en un huasipungo de la hacienda de los Pereira. Es el protagonista de la novela.',
    importancia: 'Es el centro emocional de la obra: a través de su vida Icaza muestra la explotación del indígena y su rebelión final.',
    historia:
      'Andrés trabaja para el patrón a cambio de su pequeño huasipungo. Ve morir a su esposa Cunshi, soporta el trabajo forzado en la construcción del camino y, cuando los indígenas son despojados de sus tierras, se enfrenta a los soldados gritando "¡Ñucanchic huasipungo!".',
    relacionesDetalle: [
      { con: 'Cunshi', texto: 'Es su esposa y su familia; su sufrimiento agudiza la tragedia de Andrés.' },
      { con: 'Alfonso Pereira', texto: 'Es su patrón. Lo explota y lo despoja de la tierra que le daba sustento.' },
      { con: 'Comunidad indígena', texto: 'Es parte de ella y termina liderando la resistencia colectiva.' },
    ],
    representa: 'La dignidad del pueblo indígena: golpeada y explotada, pero que aún defiende lo suyo.',
    pistas: [
      'Vivo en un pequeño terreno que no es realmente mío.',
      'Mi patrón me obliga a trabajar sin pago justo.',
      'Mi último grito fue: "¡Ñucanchic huasipungo!"',
    ],
  },
  cunshi: {
    quienEs: 'Esposa de Andrés Chiliquinga, madre y compañera del protagonista.',
    importancia: 'Encarna la doble opresión de la mujer indígena: por su clase social y por su género.',
    historia:
      'Cunshi cuida de su familia en medio de la miseria. Sufre el abuso del patrón y las duras condiciones de vida de la hacienda, hasta su muerte, que marca profundamente a Andrés.',
    relacionesDetalle: [
      { con: 'Andrés Chiliquinga', texto: 'Es su esposo; comparten la pobreza y el dolor.' },
      { con: 'Alfonso Pereira', texto: 'Es su abusador; ejerce poder sobre ella por ser patrón.' },
    ],
    representa: 'La vulnerabilidad de las mujeres indígenas dentro del sistema de hacienda.',
    pistas: [
      'Soy madre y mi cuerpo no me pertenece ante el patrón.',
      'Mi esposo se llama Andrés.',
      'Soy la esposa del protagonista.',
    ],
  },
  alfonso: {
    quienEs: 'Terrateniente dueño de la hacienda donde trabajan los indígenas.',
    importancia: 'Es el principal antagonista: su ambición desencadena el despojo y la rebelión final.',
    historia:
      'Endeudado, Alfonso busca hacer negocios con una compañía extranjera para construir un camino y explotar la región. Para lograrlo, obliga a los indígenas a trabajar y finalmente los desaloja de sus huasipungos.',
    relacionesDetalle: [
      { con: 'Andrés Chiliquinga', texto: 'Es su trabajador; lo explota y lo despoja.' },
      { con: 'Julio Pereira', texto: 'Es su tío y acreedor; lo empuja al negocio con los extranjeros.' },
      { con: 'El cura', texto: 'Es su aliado; la Iglesia respalda el orden que lo beneficia.' },
    ],
    representa: 'La clase terrateniente y el sistema feudal que mantenía a los indígenas en semi-esclavitud.',
    pistas: [
      'Tengo deudas y quiero dinero a toda costa.',
      'Soy dueño de la hacienda y de las tierras.',
      'Desalojé a los indígenas de sus huasipungos.',
    ],
  },
  julio: {
    quienEs: 'Tío de Alfonso Pereira: un hombre poderoso e influyente que además es su acreedor.',
    importancia: 'Su presencia muestra que la explotación es un sistema sostenido por familias con poder, dinero e influencias.',
    historia:
      'Julio propone a su sobrino Alfonso asociarse con una compañía extranjera para explotar la madera de la zona. Ese negocio exige construir un camino y despejar los huasipungos, lo que desencadena la tragedia.',
    relacionesDetalle: [
      { con: 'Alfonso Pereira', texto: 'Es su sobrino y deudor; lo impulsa a hacer negocios con los extranjeros.' },
    ],
    representa: 'El poder heredado y la continuidad de los privilegios de los terratenientes.',
    pistas: [
      'Mi papel es secundario, pero mi apellido pesa.',
      'Propuse un negocio con extranjeros que exigía construir un camino.',
      'Soy el tío de Alfonso.',
    ],
  },
  cura: {
    quienEs: 'Representante de la Iglesia en la zona de la hacienda.',
    importancia: 'Icaza lo usa para criticar a la institución religiosa que se alía con los poderosos.',
    historia:
      'En lugar de defender a los indígenas, el cura respalda a los terratenientes y bendice el orden que los oprime. Su discurso justifica la sumisión y el sufrimiento como algo natural.',
    relacionesDetalle: [
      { con: 'Alfonso Pereira', texto: 'Es su aliado; legitima su poder desde la religión.' },
      { con: 'Comunidad indígena', texto: 'Debería servirla, pero la deja desprotegida.' },
    ],
    representa: 'La complicidad de la Iglesia con el poder económico y político.',
    pistas: [
      'Hablo de Dios, pero convengo con el poderoso.',
      'Represento a la Iglesia en la novela.',
      'Soy aliado del patrón y me visto con sotana.',
    ],
  },
  comunidad: {
    quienEs: 'El pueblo indígena de la hacienda, visto como un personaje colectivo.',
    importancia: 'Muestra que la injusticia no afecta a un individuo, sino a todo un pueblo.',
    historia:
      'Trabajan sin descanso, sufren enfermedades y hambre, y son tratados como instrumentos. Al final se unen para defender sus huasipungos, aunque la rebelión es reprimida con violencia.',
    relacionesDetalle: [
      { con: 'Andrés Chiliquinga', texto: 'Es uno de los suyos y su líder en la rebelión.' },
      { con: 'Alfonso Pereira', texto: 'Es su opresor y quien los despoja.' },
      { con: 'El cura', texto: 'Es la institución que debía protegerlos y no lo hace.' },
    ],
    representa: 'La resistencia colectiva y la dignidad de los pueblos indígenas.',
    pistas: [
      'No soy una sola persona, somos muchos.',
      'Trabajamos en la hacienda bajo condiciones inhumanas.',
      'Nos rebelamos al perder nuestros huasipungos.',
    ],
  },
};

/** Textos para las cartas de descripción del Juego de memoria */
export const MEMORIA_PARES = [
  {
    id: 'andres',
    facil: 'Indígena protagonista que grita "¡Ñucanchic huasipungo!"',
    dificil: 'Símbolo de la dignidad que resiste hasta el final',
  },
  {
    id: 'cunshi',
    facil: 'Esposa de Andrés, víctima del abuso del patrón',
    dificil: 'Encarna la doble opresión de la mujer indígena',
  },
  {
    id: 'alfonso',
    facil: 'Terrateniente endeudado dueño de la hacienda',
    dificil: 'Ambición económica que desencadena el despojo',
  },
  {
    id: 'julio',
    facil: 'Tío poderoso de Alfonso, que le propone el negocio',
    dificil: 'El poder que pasa de generación en generación',
  },
  {
    id: 'cura',
    facil: 'Representante de la Iglesia, aliado del patrón',
    dificil: 'La fe puesta al servicio de los poderosos',
  },
];

export const MEMORIA_IDS = MEMORIA_PARES.map(p => p.id);
