export const PERSONAJES = [
  {
    id: 'andres',
    nombre: 'Andrés Chiliquinga',
    rol: 'Protagonista',
    emoji: '🌾',
    color: '#6b3f2a',
    descripcionCorta: 'Indígena y jefe del huasipungo. Símbolo de resistencia y sufrimiento.',
    descripcionCompleta: `Andrés Chiliquinga es el protagonista central de la novela. Es un indígena que trabaja en la hacienda de Alfonso Pereira y vive en un pequeño terreno —el huasipungo— que le fue asignado por el patrón a cambio de su trabajo.

A lo largo de la obra, Andrés enfrenta la explotación extrema, la pobreza, la discriminación y el sufrimiento físico. Su esposa Cunshi es arrebatada por el patrón, y él debe soportar condiciones inhumanas de trabajo.

Al final, cuando los indígenas son despojados de sus huasipungos, Andrés lidera la resistencia: su célebre grito "¡Ñucanchic huasipungo!" (¡Nuestro huasipungo!) se convierte en el símbolo de la lucha desesperada de su pueblo.

Representa la dignidad aplastada pero nunca completamente destruida del pueblo indígena ecuatoriano.`,
    caracteristicas: ['Resistente', 'Sufrido', 'Leal a su tierra', 'Símbolo de dignidad'],
    relaciones: ['Cunshi (esposa)', 'Alfonso Pereira (patrón/opresor)', 'Comunidad indígena'],
  },
  {
    id: 'cunshi',
    nombre: 'Cunshi',
    rol: 'Esposa del protagonista',
    emoji: '🤱',
    color: '#4a7c59',
    descripcionCorta: 'Esposa de Andrés. Víctima de la explotación y el abuso del patrón.',
    descripcionCompleta: `Cunshi es la esposa de Andrés Chiliquinga y una de las figuras que más condensa el sufrimiento femenino indígena en la novela. Es madre y compañera, pero está completamente expuesta a los abusos del sistema de hacienda.

Alfonso Pereira abusa de ella sexualmente, representando la doble opresión que sufrían las mujeres indígenas: por su clase y por su género. Su sufrimiento y eventual muerte acentúan la tragedia de la familia Chiliquinga.

Su figura simboliza la vulnerabilidad extrema de las mujeres indígenas dentro de la estructura feudal de la hacienda ecuatoriana del siglo XX.`,
    caracteristicas: ['Resiliente', 'Maternal', 'Víctima de abuso', 'Símbolo del sufrimiento femenino'],
    relaciones: ['Andrés Chiliquinga (esposo)', 'Alfonso Pereira (abusador)'],
  },
  {
    id: 'alfonso',
    nombre: 'Alfonso Pereira',
    rol: 'Terrateniente',
    emoji: '🎩',
    color: '#1a1208',
    descripcionCorta: 'Dueño de las tierras. Representa el poder opresor y la ambición económica.',
    descripcionCompleta: `Alfonso Pereira es el terrateniente y dueño de la hacienda donde viven y trabajan los indígenas. Es el principal representante del poder opresor en la novela.

Motivado por deudas y ambición económica, Alfonso busca maximizar la explotación de los indígenas para desarrollar sus tierras y atraer inversión extranjera. Para lograrlo, utiliza el trabajo forzado, la violencia y el engaño.

Su personaje representa la clase terrateniente ecuatoriana de principios del siglo XX, que se beneficiaba del trabajo indígena en condiciones de semi-esclavitud. Al final, desaloja a los indígenas de sus huasipungos, desencadenando la rebelión.

Icaza lo usa como símbolo del sistema feudal y colonial que perpetuaba la injusticia social.`,
    caracteristicas: ['Autoritario', 'Calculador', 'Deudor', 'Representante del poder opresor'],
    relaciones: ['Andrés Chiliquinga (trabajador/víctima)', 'Julio Pereira (tío)', 'El cura (aliado)'],
  },
  {
    id: 'julio',
    nombre: 'Julio Pereira',
    rol: 'Tío del terrateniente',
    emoji: '📜',
    color: '#3a2810',
    descripcionCorta: 'Tío poderoso de Alfonso. Parte de la estructura de poder terrateniente.',
    descripcionCompleta: `Julio Pereira es el tío de Alfonso, un hombre poderoso e influyente que además es su acreedor. Es quien le propone asociarse con una compañía extranjera para explotar la madera de la zona, negocio que exige construir un camino.

Aunque su rol es secundario, su presencia ayuda a comprender la continuidad del sistema de opresión que los Pereira representan: una familia con dinero e influencias que ha acumulado tierras y poder a expensas del trabajo indígena.`,
    caracteristicas: ['Poderoso e influyente', 'Acreedor de Alfonso', 'Representante del poder heredado'],
    relaciones: ['Alfonso Pereira (sobrino)'],
  },
  {
    id: 'cura',
    nombre: 'El Cura',
    rol: 'Representante de la Iglesia',
    emoji: '✝️',
    color: '#2d2010',
    descripcionCorta: 'Aliado del poder terrateniente. Legitima la explotación desde la Iglesia.',
    descripcionCompleta: `El personaje del cura en Huasipungo representa la complicidad de la Iglesia Católica con el sistema de explotación. Lejos de defender a los indígenas, el cura actúa como aliado de los terratenientes, legitimando el orden social que los oprime.

Icaza usa este personaje para criticar la institución eclesiástica que, en lugar de ser voz de los marginados, respaldaba el status quo que permitía la explotación de los pueblos indígenas.

Su presencia subraya cómo las instituciones de poder —político, económico y religioso— funcionaban de manera coordinada para mantener la opresión.`,
    caracteristicas: ['Cómplice del poder', 'Hipócrita', 'Representante institucional'],
    relaciones: ['Alfonso Pereira (aliado)', 'Comunidad indígena (a quien debería servir)'],
  },
  {
    id: 'comunidad',
    nombre: 'La Comunidad Indígena',
    rol: 'Colectivo oprimido',
    emoji: '🏔️',
    color: '#2d5a3d',
    descripcionCorta: 'El pueblo indígena colectivo. Víctimas de la explotación que se unen en resistencia.',
    descripcionCompleta: `La comunidad indígena funciona en la novela casi como un personaje colectivo. No son individuos aislados sino un pueblo con historia, cultura y sufrimiento compartido.

Trabajan en condiciones inhumanas en la hacienda de los Pereira, sufren enfermedades, pobreza extrema y discriminación sistemática. Son tratados como instrumentos de trabajo, no como seres humanos.

Sin embargo, al final de la novela, esta comunidad se une en rebelión cuando son despojados de sus huasipungos. Aunque la rebelión es aplastada violentamente, representa un momento de dignidad colectiva y resistencia que Icaza quiso immortalizar como denuncia social.`,
    caracteristicas: ['Unidos en el sufrimiento', 'Capaces de resistencia', 'Portadores de cultura', 'Despojados de sus derechos'],
    relaciones: ['Andrés Chiliquinga (líder)', 'Alfonso Pereira (opresor)', 'El cura (opresor institucional)'],
  },
];

export const TIMELINE_EVENTS = [
  {
    id: 'e1',
    año: '1906',
    titulo: 'Nacimiento de Jorge Icaza',
    descripcion: 'Jorge Icaza Coronel nace el 10 de julio de 1906 en Quito, Ecuador. Crecería para convertirse en uno de los escritores más importantes de la literatura latinoamericana del siglo XX.',
    tipo: 'autor',
  },
  {
    id: 'e2',
    año: '1895-1920',
    titulo: 'Sistema de Hacienda en Ecuador',
    descripcion: 'El sistema de hacienda controlaba gran parte del Ecuador. Los indígenas vivían en huasipungos —pequeños terrenos cedidos por el patrón— a cambio de trabajo forzado. Era una forma de servidumbre feudal que persistió por décadas.',
    tipo: 'contexto',
  },
  {
    id: 'e3',
    año: '1928',
    titulo: 'Icaza comienza a escribir',
    descripcion: 'Jorge Icaza comienza su carrera literaria en el teatro con obras como "El intruso" (1928). La realidad social que observa —la explotación de los indígenas en las haciendas— lo marcará profundamente y se convertirá en el núcleo de su obra.',
    tipo: 'autor',
  },
  {
    id: 'e4',
    año: '1934',
    titulo: 'Publicación de Huasipungo',
    descripcion: 'Jorge Icaza publica Huasipungo en Quito. La novela causa un impacto inmediato por su crudo realismo y su denuncia directa de la explotación indígena. Se convierte en una obra clave del indigenismo latinoamericano.',
    tipo: 'obra',
  },
  {
    id: 'e5',
    año: '1962-1964',
    titulo: 'Traducciones al inglés',
    descripcion: 'Huasipungo se publica en inglés en 1962 (Inglaterra) y, en 1964, en una traducción autorizada titulada "The Villagers" (Estados Unidos). Así la denuncia de Icaza llega a lectores de todo el mundo; con el tiempo, la novela se traduciría a decenas de idiomas.',
    tipo: 'obra',
  },
  {
    id: 'e6',
    año: '1964',
    titulo: 'Reforma Agraria en Ecuador',
    descripcion: 'Ecuador promulga la Ley de Reforma Agraria, que pone fin legalmente al sistema de huasipungo. La novela de Icaza había contribuido a generar conciencia sobre la necesidad de esta reforma. La realidad que denunció finalmente cambió.',
    tipo: 'contexto',
  },
  {
    id: 'e7',
    año: '1978',
    titulo: 'Fallecimiento de Jorge Icaza',
    descripcion: 'Jorge Icaza fallece el 26 de mayo de 1978 en Quito. Deja un legado literario que transformó la forma en que Ecuador y América Latina se ven a sí mismos. Huasipungo sigue siendo su obra más reconocida.',
    tipo: 'autor',
  },
];

export const QUIZ_QUESTIONS = [
  {
    id: 0,
    categoria: 'Personajes',
    pregunta: '¿Quién es el protagonista de Huasipungo?',
    opciones: ['Alfonso Pereira', 'Andrés Chiliquinga', 'Julio Pereira', 'El cura'],
    correcta: 'Andrés Chiliquinga',
    explicacion: 'Andrés Chiliquinga es el protagonista de la novela. Es un indígena que vive y trabaja en la hacienda de Alfonso Pereira, y cuyo huasipungo es finalmente arrebatado.',
    tipo: 'multiple',
  },
  {
    id: 1,
    categoria: 'Autor',
    pregunta: '¿En qué año fue publicada la novela Huasipungo?',
    opciones: ['1920', '1934', '1945', '1960'],
    correcta: '1934',
    explicacion: 'Huasipungo fue publicada en 1934 en Quito, Ecuador, por Jorge Icaza.',
    tipo: 'multiple',
  },
  {
    id: 2,
    categoria: 'Argumento',
    pregunta: 'El término "huasipungo" hace referencia a:',
    opciones: [
      'Una ciudad ecuatoriana',
      'Un tipo de música andina',
      'Un terreno asignado al indígena por el patrón a cambio de trabajo',
      'Una festividad indígena',
    ],
    correcta: 'Un terreno asignado al indígena por el patrón a cambio de trabajo',
    explicacion: 'El huasipungo era el pequeño terreno que el terrateniente cedía al indígena para que viviera y cultivara, a cambio de trabajo forzado. Era una forma de servidumbre.',
    tipo: 'multiple',
  },
  {
    id: 3,
    categoria: 'Personajes',
    pregunta: '¿Cómo se llama la esposa de Andrés Chiliquinga?',
    opciones: ['María', 'Cunshi', 'Rosa', 'Dolores'],
    correcta: 'Cunshi',
    explicacion: 'Cunshi es la esposa de Andrés Chiliquinga. Su figura representa el sufrimiento de las mujeres indígenas que enfrentaban doble opresión: por su clase social y por su género.',
    tipo: 'multiple',
  },
  {
    id: 4,
    categoria: 'Temas',
    pregunta: 'Huasipungo es principalmente una novela de:',
    opciones: ['Amor y aventura', 'Denuncia social e indigenismo', 'Ciencia ficción', 'Historia colonial'],
    correcta: 'Denuncia social e indigenismo',
    explicacion: 'Huasipungo pertenece al movimiento indigenista latinoamericano y es fundamentalmente una denuncia de las condiciones de explotación que vivían los indígenas en las haciendas ecuatorianas.',
    tipo: 'multiple',
  },
  {
    id: 5,
    categoria: 'Personajes',
    pregunta: '¿Qué papel cumple Alfonso Pereira en la novela?',
    opciones: ['Es el protagonista indígena', 'Es el terrateniente opresor', 'Es el cura del pueblo', 'Es el padre de Andrés'],
    correcta: 'Es el terrateniente opresor',
    explicacion: 'Alfonso Pereira es el dueño de las tierras y principal representante del poder opresor. Sus decisiones económicas conducen a la explotación extrema de los indígenas y finalmente al despojo de sus huasipungos.',
    tipo: 'multiple',
  },
  {
    id: 6,
    categoria: 'Verdadero/Falso',
    pregunta: '¿Es verdad que la novela tiene un final feliz donde los indígenas recuperan sus tierras?',
    opciones: ['Verdadero', 'Falso'],
    correcta: 'Falso',
    explicacion: 'La novela tiene un final trágico. Los indígenas son despojados de sus huasipungos, se rebelan, pero la rebelión es aplastada violentamente. Es una novela de denuncia, no de solución.',
    tipo: 'verdadero-falso',
  },
  {
    id: 7,
    categoria: 'Contexto',
    pregunta: '¿En qué país se desarrolla la historia de Huasipungo?',
    opciones: ['Perú', 'Bolivia', 'Ecuador', 'Colombia'],
    correcta: 'Ecuador',
    explicacion: 'La novela se desarrolla en Ecuador, específicamente en el sistema de haciendas de los Andes ecuatorianos de principios del siglo XX.',
    tipo: 'multiple',
  },
  {
    id: 8,
    categoria: 'Análisis',
    pregunta: '¿Qué institución representa el cura en la novela?',
    opciones: [
      'El gobierno republicano',
      'El ejército',
      'La Iglesia Católica como aliada del poder terrateniente',
      'Las organizaciones indígenas',
    ],
    correcta: 'La Iglesia Católica como aliada del poder terrateniente',
    explicacion: 'Icaza usa al cura para criticar la complicidad de la Iglesia con el sistema de explotación. En lugar de defender a los marginados, la institución eclesiástica legitimaba el orden opresor.',
    tipo: 'multiple',
  },
  {
    id: 9,
    categoria: 'Argumento',
    pregunta: '¿Cuál es el grito de resistencia de Andrés al final de la novela?',
    opciones: [
      '"¡Libertad o muerte!"',
      '"¡Ñucanchic huasipungo!" (¡Nuestro huasipungo!)',
      '"¡Viva el Ecuador!"',
      '"¡Fuera los patrones!"',
    ],
    correcta: '"¡Ñucanchic huasipungo!" (¡Nuestro huasipungo!)',
    explicacion: 'El grito "¡Ñucanchic huasipungo!" en kichwa significa "¡Nuestro huasipungo!" y se convierte en el símbolo de la resistencia indígena en la novela.',
    tipo: 'multiple',
  },
  {
    id: 10,
    categoria: 'Verdadero/Falso',
    pregunta: '¿Es verdad que Jorge Icaza nació en Ecuador?',
    opciones: ['Verdadero', 'Falso'],
    correcta: 'Verdadero',
    explicacion: 'Jorge Icaza Coronel nació el 10 de julio de 1906 en Quito, Ecuador.',
    tipo: 'verdadero-falso',
  },
  {
    id: 11,
    categoria: 'Temas',
    pregunta: '¿Cuál de estos NO es un tema central de Huasipungo?',
    opciones: ['La explotación laboral', 'El amor romántico idealizado', 'La discriminación racial', 'El despojo de tierras'],
    correcta: 'El amor romántico idealizado',
    explicacion: 'Huasipungo no es una novela romántica. Sus temas centrales son la explotación, la discriminación, la pobreza, el despojo y la resistencia. El amor que aparece es duro y está condicionado por la miseria.',
    tipo: 'multiple',
  },
  {
    id: 12,
    categoria: 'Análisis',
    pregunta: 'La Reforma Agraria en Ecuador que eliminó el sistema de huasipungo se promulgó en:',
    opciones: ['1934', '1945', '1964', '1978'],
    correcta: '1964',
    explicacion: 'Ecuador promulgó la Ley de Reforma Agraria en 1964, treinta años después de la publicación de Huasipungo. La novela de Icaza contribuyó a generar conciencia sobre la necesidad de este cambio.',
    tipo: 'multiple',
  },
  {
    id: 13,
    categoria: 'Personajes',
    pregunta: '¿Qué le hace Alfonso Pereira a Cunshi, la esposa de Andrés?',
    opciones: [
      'La contrata como cocinera con buen salario',
      'La ayuda a escapar de la hacienda',
      'Abusa de ella sexualmente',
      'La nombra maestra de la comunidad',
    ],
    correcta: 'Abusa de ella sexualmente',
    explicacion: 'Alfonso Pereira abusa sexualmente de Cunshi, lo que representa la doble opresión que sufrían las mujeres indígenas: explotación económica y violencia de género.',
    tipo: 'multiple',
  },
  {
    id: 14,
    categoria: 'Contexto',
    pregunta: '¿A qué movimiento literario pertenece Huasipungo?',
    opciones: ['Romanticismo', 'Modernismo', 'Indigenismo', 'Realismo mágico'],
    correcta: 'Indigenismo',
    explicacion: 'Huasipungo es una obra del indigenismo latinoamericano, movimiento literario que denunciaba las condiciones de vida de los pueblos indígenas y buscaba visibilizar su situación de explotación y marginación.',
    tipo: 'multiple',
  },
];

export const MISIONES = [
  {
    id: 'mision1',
    numero: '01',
    titulo: 'Conoce la novela',
    descripcion: 'Lee el libro de Icaza y descubre toda la información sobre Huasipungo.',
    instruccion: 'Lee el libro de Icaza (Zona de Aprendizaje)',
    seccionRequerida: 'novela',
    xpRecompensa: 100,
    desbloqueada: true,
  },
  {
    id: 'mision2',
    numero: '02',
    titulo: 'Conoce a los personajes',
    descripcion: 'Entra a la Casa de los personajes y abre las fichas de quienes viven la historia.',
    instruccion: 'Entra a la Casa de los personajes',
    seccionRequerida: 'personajes',
    xpRecompensa: 200,
    desbloqueada: false,
    requiere: 'mision1',
  },
  {
    id: 'mision3',
    numero: '03',
    titulo: 'Construye el conocimiento',
    descripcion: 'Estudia en la pizarra el mentefacto nocional y el mentefacto clasal de la obra.',
    instruccion: 'Estudia la pizarra (Zona de Aprendizaje)',
    seccionRequerida: 'mentefacto',
    xpRecompensa: 300,
    desbloqueada: false,
    requiere: 'mision2',
  },
  {
    id: 'mision4',
    numero: '04',
    titulo: 'Viaja por el tiempo',
    descripcion: 'Sube al Mirador del tiempo y recorre la línea del tiempo de la obra y su contexto histórico.',
    instruccion: 'Sube al Mirador del tiempo (Las Montañas)',
    seccionRequerida: 'timeline',
    xpRecompensa: 200,
    desbloqueada: false,
    requiere: 'mision3',
  },
  {
    id: 'mision5',
    numero: '05',
    titulo: 'Explora el territorio',
    descripcion: 'Consulta el mapa del territorio en la hacienda y conoce los espacios de la novela.',
    instruccion: 'Consulta el mapa de la Hacienda',
    seccionRequerida: 'mapa',
    xpRecompensa: 200,
    desbloqueada: false,
    requiere: 'mision4',
  },
  {
    id: 'mision6',
    numero: '06',
    titulo: 'Demuestra lo aprendido',
    descripcion: 'Completa el gran examen de 15 preguntas sobre Huasipungo.',
    instruccion: 'Responde el gran examen (Zona de Aprendizaje)',
    seccionRequerida: 'quiz',
    xpRecompensa: 500,
    desbloqueada: false,
    requiere: 'mision5',
  },
];

/** Datos extra que usan los logros de los juegos */
export interface LogroExtra {
  memoryWins: number;
  memoryHardWins: number;
  memoryPerfect: number;
  whoAmISolved: number;
  whoAmIBestStreak: number;
  charactersViewed: number;
  /** Datos de la aventura en el mapa */
  zonesVisited: number;
  charactersTalked: number;
  pagesCollected: number;
  questionsAnswered: number;
}

/** Zonas del mapa del videojuego y páginas coleccionables (ver src/game/world.ts). */
export const TOTAL_ZONAS = 7;
export const TOTAL_PAGINAS = 10;

export const LOGROS = [
  {
    id: 'explorador_andes',
    emoji: '🏔️',
    titulo: 'Explorador de los Andes',
    descripcion: 'Visitar todas las secciones de la experiencia.',
    condicion: (completedSections: string[]) =>
      ['novela', 'personajes', 'mentefacto', 'timeline', 'mapa', 'quiz'].every(s => completedSections.includes(s)),
  },
  {
    id: 'primer_conocimiento',
    emoji: '📚',
    titulo: 'Primer conocimiento',
    descripcion: 'Completar la sección La Novela.',
    condicion: (completedSections: string[]) => completedSections.includes('novela'),
  },
  {
    id: 'conocedor_personajes',
    emoji: '👥',
    titulo: 'Conocedor de personajes',
    descripcion: 'Revisar todos los personajes de la obra.',
    condicion: (completedSections: string[]) => completedSections.includes('personajes'),
  },
  {
    id: 'pensador',
    emoji: '🧠',
    titulo: 'Pensador',
    descripcion: 'Completar el mentefacto.',
    condicion: (completedSections: string[]) => completedSections.includes('mentefacto'),
  },
  {
    id: 'cronista',
    emoji: '⏳',
    titulo: 'Cronista andino',
    descripcion: 'Recorrer la línea del tiempo completa.',
    condicion: (completedSections: string[]) => completedSections.includes('timeline'),
  },
  {
    id: 'cartografo',
    emoji: '🗺️',
    titulo: 'Cartógrafo',
    descripcion: 'Explorar el mapa interactivo.',
    condicion: (completedSections: string[]) => completedSections.includes('mapa'),
  },
  {
    id: 'quiz_maestro',
    emoji: '🎯',
    titulo: 'Respuesta perfecta',
    descripcion: 'Conseguir 100% en el quiz.',
    condicion: (_: string[], quizCompleted?: boolean, score?: number, total?: number) =>
      !!quizCompleted && score === total,
  },
  {
    id: 'maestro_huasipungo',
    emoji: '🏆',
    titulo: 'Maestro de Huasipungo',
    descripcion: 'Completar todas las misiones.',
    condicion: (_: string[], __?: boolean, ___?: number, ____?: number, completedMissions?: string[]) =>
      MISIONES.every(m => completedMissions?.includes(m.id)),
  },
  {
    id: 'buena_memoria',
    emoji: '🃏',
    titulo: 'Buena memoria',
    descripcion: 'Ganar una partida del Juego de memoria.',
    condicion: (_s: string[], _q?: boolean, _sc?: number, _t?: number, _m?: string[], x?: LogroExtra) =>
      (x?.memoryWins ?? 0) >= 1,
  },
  {
    id: 'memoria_piedra',
    emoji: '🗿',
    titulo: 'Memoria de piedra',
    descripcion: 'Ganar el Juego de memoria en dificultad difícil.',
    condicion: (_s: string[], _q?: boolean, _sc?: number, _t?: number, _m?: string[], x?: LogroExtra) =>
      (x?.memoryHardWins ?? 0) >= 1,
  },
  {
    id: 'sin_errores',
    emoji: '✨',
    titulo: 'Sin un solo error',
    descripcion: 'Ganar una partida de memoria sin equivocarte.',
    condicion: (_s: string[], _q?: boolean, _sc?: number, _t?: number, _m?: string[], x?: LogroExtra) =>
      (x?.memoryPerfect ?? 0) >= 1,
  },
  {
    id: 'curioso',
    emoji: '🔍',
    titulo: 'Curioso de almas',
    descripcion: 'Abrir la ficha de todos los personajes.',
    condicion: (_s: string[], _q?: boolean, _sc?: number, _t?: number, _m?: string[], x?: LogroExtra) =>
      (x?.charactersViewed ?? 0) >= PERSONAJES.length,
  },
  {
    id: 'detective',
    emoji: '🕵️',
    titulo: 'Detective literario',
    descripcion: 'Acertar "¿Quién soy?" con todos los personajes.',
    condicion: (_s: string[], _q?: boolean, _sc?: number, _t?: number, _m?: string[], x?: LogroExtra) =>
      (x?.whoAmISolved ?? 0) >= PERSONAJES.length,
  },
  {
    id: 'racha_3',
    emoji: '🔥',
    titulo: 'En racha',
    descripcion: 'Acertar 3 veces seguidas en "¿Quién soy?".',
    condicion: (_s: string[], _q?: boolean, _sc?: number, _t?: number, _m?: string[], x?: LogroExtra) =>
      (x?.whoAmIBestStreak ?? 0) >= 3,
  },
  {
    id: 'caminante',
    emoji: '🥾',
    titulo: 'Caminante de los Andes',
    descripcion: 'Visitar todas las zonas del mapa.',
    condicion: (_s: string[], _q?: boolean, _sc?: number, _t?: number, _m?: string[], x?: LogroExtra) =>
      (x?.zonesVisited ?? 0) >= TOTAL_ZONAS,
  },
  {
    id: 'conversador',
    emoji: '💬',
    titulo: 'Buen conversador',
    descripcion: 'Hablar con todos los personajes en el mapa.',
    condicion: (_s: string[], _q?: boolean, _sc?: number, _t?: number, _m?: string[], x?: LogroExtra) =>
      (x?.charactersTalked ?? 0) >= PERSONAJES.length,
  },
  {
    id: 'coleccionista',
    emoji: '📜',
    titulo: 'Guardián de las páginas',
    descripcion: 'Recoger las páginas perdidas de Huasipungo.',
    condicion: (_s: string[], _q?: boolean, _sc?: number, _t?: number, _m?: string[], x?: LogroExtra) =>
      (x?.pagesCollected ?? 0) >= TOTAL_PAGINAS,
  },
  {
    id: 'voz_comunidad',
    emoji: '🌟',
    titulo: 'Voz de la comunidad',
    descripcion: 'Responder bien la pregunta de cada personaje.',
    condicion: (_s: string[], _q?: boolean, _sc?: number, _t?: number, _m?: string[], x?: LogroExtra) =>
      (x?.questionsAnswered ?? 0) >= PERSONAJES.length,
  },
];

export const MAPA_ZONAS = [
  {
    id: 'hacienda',
    nombre: 'La Hacienda',
    emoji: '🏚️',
    x: 55, y: 30,
    color: '#6b3f2a',
    descripcion: 'Centro del poder terrateniente. La hacienda de los Pereira es el eje de la historia. Desde aquí, Alfonso Pereira controla la vida y el trabajo de los indígenas. Representa el sistema feudal que oprime a la comunidad.',
    detalle: 'Los indígenas deben trabajar para el patrón en condiciones de servidumbre, sin recibir salario justo y sujetos a castigos físicos.',
  },
  {
    id: 'huasipungos',
    nombre: 'Los Huasipungos',
    emoji: '🌾',
    x: 30, y: 55,
    color: '#4a7c59',
    descripcion: 'Pequeños terrenos asignados a los indígenas por el patrón a cambio de trabajo. Aquí viven Andrés, Cunshi y otros. Los huasipungos son tanto hogar como cadena: sin tierra propia, los indígenas dependen del patrón.',
    detalle: 'El despojo final de los huasipungos desencadena la rebelión. Para Andrés, su huasipungo es todo lo que tiene: identidad, sustento y dignidad.',
  },
  {
    id: 'comunidad',
    nombre: 'Comunidad Indígena',
    emoji: '👥',
    x: 20, y: 35,
    color: '#2d5a3d',
    descripcion: 'El espacio donde vive y se organiza la comunidad indígena. Aunque están fragmentados por el miedo y la opresión, la comunidad mantiene lazos culturales y finalmente se une en resistencia.',
    detalle: 'La comunidad habla kichwa, mantiene tradiciones propias y sufre colectivamente. Su unidad al final de la novela representa la dignidad colectiva ante la opresión.',
  },
  {
    id: 'tierras',
    nombre: 'Tierras de Cultivo',
    emoji: '🌱',
    x: 45, y: 65,
    color: '#3a6b2a',
    descripcion: 'Los campos donde los indígenas trabajan bajo condiciones de explotación extrema. El trabajo agrícola forzado es el mecanismo central de la opresión en la novela.',
    detalle: 'Los indígenas trabajan largas jornadas sin descanso adecuado ni alimentación suficiente, en un ciclo de pobreza del que no pueden escapar.',
  },
  {
    id: 'camino',
    nombre: 'El Camino / Carretera',
    emoji: '🛤️',
    x: 70, y: 50,
    color: '#7a6118',
    descripcion: 'La construcción de la carretera es uno de los episodios más brutales de la novela. Alfonso Pereira fuerza a los indígenas a construirla sin compensación, llevando a muchos a la muerte por agotamiento y enfermedad.',
    detalle: 'La carretera simboliza el progreso que beneficia al terrateniente pero destruye a los trabajadores indígenas. Andrés pierde su salud construyéndola.',
  },
  {
    id: 'montanas',
    nombre: 'Las Montañas',
    emoji: '⛰️',
    x: 15, y: 18,
    color: '#4a6b7a',
    descripcion: 'Los Andes ecuatorianos forman el telón de fondo de toda la historia. Las montañas son testigos silenciosos de la opresión y representan la tierra ancestral de los pueblos indígenas.',
    detalle: 'Icaza evoca el paisaje andino para contrastar la belleza de la naturaleza con la miseria humana creada por el sistema de hacienda.',
  },
];
