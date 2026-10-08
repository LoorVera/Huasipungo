// Contenido del videojuego: diálogos de los personajes, preguntas sobre la novela,
// carteles de cada zona, páginas coleccionables y nombres de las actividades.
import { MAPA_ZONAS } from './content';
import { tr } from '../i18n';

export interface DialogLine {
  /** Quién habla: id de personaje, 'narrador', 'cartel' o 'pagina'. */
  who: string;
  text: string;
  /** Nombre a mostrar en lugar del nombre por defecto del hablante. */
  name?: string;
}

export interface Pregunta {
  pregunta: string;
  opciones: string[];
  correcta: string;
  explicacion: string;
}

export interface Guion {
  primera: DialogLine[];
  otras: DialogLine[][];
  pregunta: Pregunta;
}

/** Nombre visible y retrato (id de Retrato) de cada hablante. */
export const HABLANTES: Record<string, { nombre: string; retrato?: string; color: string }> = {
  andres: { nombre: 'Andrés (pensando)', retrato: 'andres', color: '#6b3f2a' },
  cunshi: { nombre: 'Cunshi', retrato: 'cunshi', color: '#4a7c59' },
  alfonso: { nombre: 'Alfonso Pereira', retrato: 'alfonso', color: '#1a1208' },
  julio: { nombre: 'Julio Pereira', retrato: 'julio', color: '#3a2810' },
  cura: { nombre: 'El cura', retrato: 'cura', color: '#2d2010' },
  comunero: { nombre: 'Comunero', retrato: 'comunidad', color: '#2d5a3d' },
  comunera: { nombre: 'Comunera', retrato: 'comunidad', color: '#2d5a3d' },
  narrador: { nombre: 'Narrador', color: '#c9a227' },
  cartel: { nombre: 'Cartel', color: '#7a6118' },
  pagina: { nombre: 'Página de Huasipungo', color: '#e8c84a' },
};

export const GUIONES: Record<string, Guion> = {
  andres: {
    primera: [
      { who: 'andres', text: 'Mi choza de paja... Aquí vivimos Cunshi, nuestro guagua y yo.' },
      { who: 'andres', text: 'Soy Andrés Chiliquinga. Trabajo para don Alfonso Pereira a cambio de este pedazo de tierra: mi huasipungo.' },
      { who: 'andres', text: 'Si no trabajo para la hacienda, nos quitan la tierra. Si trabajo, nunca salimos de la deuda.' },
      { who: 'narrador', text: 'Andrés es el protagonista. A través de su vida, Jorge Icaza denuncia la explotación del indígena en las haciendas andinas.' },
      { who: 'narrador', text: 'Al final, cuando les arrebatan sus huasipungos, Andrés resiste con un grito: "¡Ñucanchic huasipungo!"' },
    ],
    otras: [
      [
        { who: 'andres', text: 'Trabajando para la hacienda, un hacha cayó sobre mi pie. Nadie me curó.' },
        { who: 'narrador', text: 'En la novela, Andrés queda herido y sin atención médica. Su dolor muestra el abandono que sufrían los trabajadores indígenas.' },
      ],
      [
        { who: 'andres', text: 'La tierra es nuestro hogar y nuestro sustento. Sin huasipungo no tenemos nada.' },
        { who: 'narrador', text: 'Para Andrés, el huasipungo es identidad, sustento y dignidad. Por eso su despojo desata la rebelión.' },
      ],
    ],
    pregunta: {
      pregunta: '¿Qué significa "¡Ñucanchic huasipungo!" en kichwa?',
      opciones: ['¡Nuestro huasipungo!', '¡Viva el patrón!', '¡Adiós, tierra mía!'],
      correcta: '¡Nuestro huasipungo!',
      explicacion: 'Es el grito de resistencia de Andrés: defiende la tierra que es su hogar, su sustento y su dignidad.',
    },
  },
  cunshi: {
    primera: [
      { who: 'cunshi', text: 'Andrés, ya volviste de la hacienda. El guagua duerme en mi espalda.' },
      { who: 'cunshi', text: 'Este huasipungo es nuestro hogar... aunque la tierra sea del patrón.' },
      { who: 'cunshi', text: 'Trabajamos para la hacienda a cambio de este pedazo de tierra. Si el patrón quiere, puede quitárnoslo.' },
      { who: 'narrador', text: 'Cunshi representa la doble opresión de la mujer indígena: por su clase social y por su género.' },
      { who: 'narrador', text: 'En la novela, el patrón la lleva a la casa de hacienda para cuidar a su nieto recién nacido, y allí sufre sus abusos.' },
    ],
    otras: [
      [
        { who: 'cunshi', text: 'Cuando llueve fuerte, el río crece y se lleva lo poco que tenemos.' },
        { who: 'narrador', text: 'En la novela, una crecida del río destruye huasipungos y trae hambre a la comunidad.' },
      ],
      [
        { who: 'cunshi', text: 'Junto al fogón, la comunidad se reúne y se cuentan historias. ¿Jugamos a "¿Quién soy?"?' },
        { who: 'narrador', text: 'Busca el fogón, a la derecha de la choza, para adivinar personajes con pistas.' },
      ],
      [
        { who: 'cunshi', text: 'El hambre llega cuando la cosecha es para el patrón y no para nosotros.' },
        { who: 'narrador', text: 'En tiempos de hambre, la familia come carne descompuesta. Cunshi enferma y muere: una de las escenas más duras de la novela.' },
      ],
    ],
    pregunta: {
      pregunta: '¿Por qué se dice que Cunshi sufre una "doble opresión"?',
      opciones: ['Por ser indígena pobre y por ser mujer', 'Porque trabaja en dos haciendas', 'Porque tiene dos huasipungos'],
      correcta: 'Por ser indígena pobre y por ser mujer',
      explicacion: 'Cunshi sufre la explotación del sistema de hacienda por ser indígena y pobre, y además la violencia por ser mujer.',
    },
  },
  alfonso: {
    primera: [
      { who: 'alfonso', text: '¿Qué haces lejos del trabajo? En esta hacienda se obedece al patrón.' },
      { who: 'alfonso', text: 'Soy Alfonso Pereira, dueño de Cuchitambo. Tengo deudas y necesito que estas tierras produzcan.' },
      { who: 'alfonso', text: 'Unos extranjeros quieren explotar la madera de la zona. Para eso necesito un camino... y brazos que lo construyan.' },
      { who: 'narrador', text: 'Alfonso representa a la clase terrateniente. Para pagar sus deudas obliga a los indígenas a trabajar sin pago y los despoja de sus huasipungos.' },
    ],
    otras: [
      [
        { who: 'alfonso', text: 'Los huasipungos junto al río estorban. Los necesito libres para el negocio.' },
        { who: 'narrador', text: 'El despojo de los huasipungos desencadena la rebelión final de la novela.' },
      ],
      [
        { who: 'alfonso', text: 'El cura y el teniente político están de mi lado. Aquí mando yo.' },
        { who: 'narrador', text: 'El poder económico, religioso y político se unen en la novela para mantener la opresión.' },
      ],
    ],
    pregunta: {
      pregunta: '¿Por qué Alfonso Pereira manda construir el camino?',
      opciones: [
        'Para hacer negocio con extranjeros y pagar sus deudas',
        'Para que los niños indígenas vayan a la escuela',
        'Para llevar médicos a la comunidad',
      ],
      correcta: 'Para hacer negocio con extranjeros y pagar sus deudas',
      explicacion: 'Endeudado, Alfonso se asocia con extranjeros para explotar la madera. El camino se construye con trabajo indígena forzado y sin pago.',
    },
  },
  julio: {
    primera: [
      { who: 'julio', text: 'Así que tú eres uno de los huasipungueros de mi sobrino...' },
      { who: 'julio', text: 'Soy Julio Pereira, tío de Alfonso. Él me debe dinero, y yo le propuse un buen negocio con los extranjeros.' },
      { who: 'julio', text: 'Con ese negocio, los Pereira seguiremos siendo poderosos, como siempre lo hemos sido.' },
      { who: 'narrador', text: 'Julio Pereira es el tío poderoso de Alfonso. Muestra que la explotación es un sistema sostenido por familias con poder e influencias.' },
    ],
    otras: [
      [
        { who: 'julio', text: 'El dinero y las influencias se heredan, sobrino... y también las tierras.' },
        { who: 'narrador', text: 'Su presencia ayuda a entender de dónde viene el poder de los Pereira.' },
      ],
      [
        { who: 'julio', text: 'En la capital conozco a la gente importante. Con un camino, la madera saldrá de estas montañas.' },
        { who: 'narrador', text: 'El "progreso" que buscan los Pereira beneficia al patrón y a los extranjeros, no a la comunidad.' },
      ],
    ],
    pregunta: {
      pregunta: '¿Qué relación tiene Julio Pereira con Alfonso?',
      opciones: ['Es su tío y le propone el negocio con los extranjeros', 'Es su trabajador indígena', 'Es el cura del pueblo'],
      correcta: 'Es su tío y le propone el negocio con los extranjeros',
      explicacion: 'Julio es el tío de Alfonso y también su acreedor. Lo impulsa a asociarse con una compañía extranjera.',
    },
  },
  cura: {
    primera: [
      { who: 'cura', text: 'Hijo, la misa del domingo cuesta. Y los entierros también, ¿eh?' },
      { who: 'cura', text: 'Trabaja duro para el patrón y no te quejes: esa es la voluntad de Dios.' },
      { who: 'narrador', text: 'Icaza usa al cura para criticar a la Iglesia de su tiempo, que se aliaba con los terratenientes en lugar de proteger a los indígenas.' },
      { who: 'narrador', text: 'Cuando muere Cunshi, el cura se niega a rebajar el costo del entierro.' },
    ],
    otras: [
      [
        { who: 'cura', text: 'Las limosnas mantienen la parroquia, hijo. Dios lo ve todo.' },
        { who: 'narrador', text: 'En la novela, el cura cobra a los más pobres en lugar de defenderlos.' },
      ],
      [
        { who: 'cura', text: 'Don Alfonso es un buen cristiano. Obedécele.' },
        { who: 'narrador', text: 'Religión, política y economía se unen para mantener la opresión de la comunidad.' },
      ],
    ],
    pregunta: {
      pregunta: '¿Qué critica Icaza a través del personaje del cura?',
      opciones: ['La complicidad de la Iglesia con los terratenientes', 'La falta de iglesias en el campo', 'La música de las fiestas del pueblo'],
      correcta: 'La complicidad de la Iglesia con los terratenientes',
      explicacion: 'El cura legitima la explotación desde la religión y cobra a los pobres, en vez de defenderlos.',
    },
  },
  comunidad: {
    primera: [
      { who: 'comunero', text: 'Alli chishi, Andrés. El trabajo en la hacienda no termina nunca.' },
      { who: 'comunera', text: 'Sembramos y cosechamos para el patrón. Para nosotros queda muy poco.' },
      { who: 'comunero', text: 'Nos llaman a la minga para construir el camino. Sin pago.' },
      { who: 'narrador', text: 'La comunidad indígena funciona como un personaje colectivo: sufre unida y, al final, se rebela unida.' },
      { who: 'narrador', text: 'La rebelión es aplastada con violencia, pero muestra la dignidad colectiva frente a la opresión.' },
    ],
    otras: [
      [
        { who: 'comunera', text: 'Entre nosotros hablamos kichwa. Es nuestra lengua.' },
        { who: 'narrador', text: 'Icaza incorporó voces del kichwa para retratar la realidad sin adornos.' },
      ],
      [
        { who: 'comunero', text: 'Cuando el río creció, perdimos las sementeras.' },
        { who: 'narrador', text: 'La crecida del río agrava el hambre y la pobreza de la comunidad.' },
      ],
    ],
    pregunta: {
      pregunta: '¿Cómo termina la rebelión de la comunidad en la novela?',
      opciones: ['Es reprimida violentamente por soldados', 'La comunidad recupera sus tierras para siempre', 'El patrón pide perdón y devuelve los huasipungos'],
      correcta: 'Es reprimida violentamente por soldados',
      explicacion: 'La novela tiene un final trágico: los soldados reprimen la rebelión. Es una obra de denuncia, no de solución.',
    },
  },
};

export const INTRO: DialogLine[] = [
  { who: 'narrador', text: 'Andes ecuatorianos, principios del siglo XX.' },
  { who: 'narrador', text: 'Eres Andrés Chiliquinga. Vives con Cunshi y tu hijo en un huasipungo de la hacienda Cuchitambo.' },
  { who: 'narrador', text: 'Recorre el mundo de la novela: habla con sus personajes, lee los carteles, recoge las páginas perdidas y completa las misiones.' },
];

export function finalLines(nombre: string): DialogLine[] {
  return [
    { who: 'narrador', text: 'Has recorrido el mundo de Huasipungo.' },
    { who: 'narrador', text: 'La novela termina con la rebelión aplastada, pero el grito de Andrés —"¡Ñucanchic huasipungo!"— quedó como símbolo de la lucha por la tierra y la dignidad.' },
    { who: 'narrador', text: 'Treinta años después de su publicación, la Reforma Agraria de 1964 abolió el huasipungo en Ecuador.' },
    {
      who: 'narrador',
      text: tr(
        `¡Felicidades, ${nombre}! Completaste todas las misiones: eres Maestro de Huasipungo.`,
        `Congratulations, ${nombre}! You completed all the missions: you are a Master of Huasipungo.`,
      ),
    },
  ];
}

// ── Carteles de cada zona ─────────────────────────────────────────────────
const zona = (id: string) => MAPA_ZONAS.find(z => z.id === id)!;

function cartelDeZona(id: string) {
  const z = zona(id);
  return { titulo: z.nombre, lineas: [z.descripcion, z.detalle] };
}

export const CARTELES: Record<string, { titulo: string; lineas: string[] }> = {
  montanas: cartelDeZona('montanas'),
  huasipungos: cartelDeZona('huasipungos'),
  tierras: cartelDeZona('tierras'),
  comunidad: cartelDeZona('comunidad'),
  hacienda: cartelDeZona('hacienda'),
  camino: cartelDeZona('camino'),
  pueblo: {
    titulo: 'El Pueblo',
    lineas: [
      'En el pueblo están la iglesia y las autoridades locales. En la novela, el cura y el teniente político se alían con el patrón.',
      'Así, el poder económico, religioso y político se une contra la comunidad indígena.',
    ],
  },
  aprendizaje: {
    titulo: 'Zona de Aprendizaje',
    lineas: [
      'Aquí estudias la novela: lee el libro de Icaza, analiza la pizarra del mentefacto y pon a prueba lo aprendido en el gran examen.',
      'En el cuadro de honor verás la tabla de posiciones.',
    ],
  },
  casa: {
    titulo: 'Casa de los Personajes',
    lineas: [
      'Galería con las fichas de todos los personajes de la novela: quiénes son, qué hacen y qué representan.',
      'Entra por la puerta principal para conocerlos.',
    ],
  },
};

// ── Páginas perdidas (datos breves para estudiar) ─────────────────────────
export const PAGINAS: Record<string, string> = {
  p1: 'Huasipungo fue escrita por Jorge Icaza y publicada en Quito en 1934.',
  p2: 'Jorge Icaza nació en Quito en 1906 y murió en la misma ciudad en 1978.',
  p3: 'En kichwa, "huasi" significa casa y "pungo", puerta. El huasipungo era el terreno que el patrón cedía al indígena a cambio de trabajo.',
  p4: 'La novela pertenece al indigenismo: un movimiento literario que denunció la explotación de los pueblos indígenas.',
  p5: 'Icaza usó un lenguaje crudo e incorporó voces del kichwa para retratar la realidad sin adornos.',
  p6: 'Los huasipungueros trabajaban para la hacienda sin salario justo: una forma de servidumbre.',
  p7: 'La novela denuncia a la vez al terrateniente, a la Iglesia y a las autoridades que se aliaban con él.',
  p8: 'La construcción del camino muestra un "progreso" que beneficia al patrón y destruye a los trabajadores.',
  p9: 'La Reforma Agraria de 1964 puso fin legalmente al sistema de huasipungo en Ecuador.',
  p10: 'Huasipungo ha sido traducida a decenas de idiomas y es la novela ecuatoriana más conocida en el mundo.',
};

// ── Actividades del mapa ──────────────────────────────────────────────────
export const ACTIVIDADES: Record<string, { titulo: string; lugar: string; icono: string }> = {
  novela: { titulo: 'El libro de Icaza', lugar: 'Zona de Aprendizaje', icono: '📖' },
  mentefacto: { titulo: 'La pizarra del mentefacto', lugar: 'Zona de Aprendizaje', icono: '🧠' },
  quiz: { titulo: 'El gran examen', lugar: 'Zona de Aprendizaje', icono: '🎯' },
  tabla: { titulo: 'Cuadro de honor', lugar: 'Zona de Aprendizaje', icono: '📊' },
  personajes: { titulo: 'Casa de los personajes', lugar: 'Casa de los Personajes', icono: '👥' },
  quiensoy: { titulo: 'Junto al fogón: ¿Quién soy?', lugar: 'El Huasipungo', icono: '🔥' },
  memoria: { titulo: 'El granero de la memoria', lugar: 'Zona de Cultivos', icono: '🃏' },
  timeline: { titulo: 'El mirador del tiempo', lugar: 'Las Montañas', icono: '⏳' },
  mapa: { titulo: 'Mapa del territorio', lugar: 'La Hacienda', icono: '🗺️' },
};
