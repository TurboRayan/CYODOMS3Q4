export const REVOLUCIONARIOS = {
  id: 'revolucionarios',
  name: 'Los Revolucionarios',
  emoji: '⭐',
  bgClass: 'from-red-950',
  accentClass: 'bg-red-600 hover:bg-red-500',
  borderClass: 'border-red-500',
  textAccent: 'text-red-400',
  badgeBg: 'bg-red-600',
  ropeDirection: 1, // positive delta moves rope toward their side (higher = they win)
  winCondition: (pos) => pos >= 75,
  powerups: [
    {
      id: 'alfabetizacion',
      name: 'Campaña de Alfabetización',
      description: 'Elimina la respuesta incorrecta — ¡solo queda la correcta!',
      emoji: '📚',
    },
    {
      id: 'nacionalizacion',
      name: 'Nacionalización',
      description: 'Roba 2 puntos de Los Exiliados instantáneamente',
      emoji: '🏭',
    },
    {
      id: 'guerrilla',
      name: 'Táctica de Guerrilla',
      description: 'Tu próxima respuesta correcta vale 3 puntos en vez de 1',
      emoji: '⚔️',
    },
  ],
  questions: [
    {
      question: '¿En qué trabajaban los campesinos antes de la revolución?',
      correct: 'Cortando caña de azúcar',
      incorrect: 'En fábricas de tabaco',
    },
    {
      question: '¿Por qué murió Lolita, la hermana de Luisa?',
      correct: 'Por falta de medicina y pobreza extrema',
      incorrect: 'En un accidente de coche',
    },
    {
      question: '¿Qué prometió hacer Fidel Castro por los campesinos?',
      correct: 'Construir escuelas y hospitales gratuitos',
      incorrect: 'Darles viajes a Miami',
    },
    {
      question: '¿Qué campaña ayudó a Luisa a aprender a leer?',
      correct: 'La campaña de alfabetización',
      incorrect: 'La campaña militar',
    },
    {
      question: '¿A quién admira mucho Luisa por sus discursos sobre la revolución?',
      correct: 'Al Che Guevara',
      incorrect: 'A Fulgencio Batista',
    },
    {
      question: '¿Qué significa la revolución para Manuel (el padre de Luisa)?',
      correct: 'Justicia e igualdad',
      incorrect: 'Pérdida de propiedad',
    },
    {
      question: '¿Qué pasó con el dictador Fulgencio Batista el 1 de enero de 1959?',
      correct: 'Huyó de Cuba porque la revolución triunfó',
      incorrect: 'Ganó las elecciones presidenciales',
    },
    {
      question: '¿Qué estudió Luisa en la universidad gracias a la educación gratis?',
      correct: 'Medicina',
      incorrect: 'Negocios internacionales',
    },
    {
      question: '¿Quién le enseñó a leer a Carlos en las montañas de la Sierra Maestra?',
      correct: 'El comandante Che Guevara',
      incorrect: 'Su maestro de La Habana',
    },
    {
      question: '¿Por qué el gobierno censuró las canciones de Rolando?',
      correct: 'Porque las consideraban contrarrevolucionarias',
      incorrect: 'Porque cantaba muy mal en inglés',
    },
    {
      question: '¿Por qué Carlos tuvo que trabajar el triple (tres veces más) para su jefe?',
      correct: 'Porque su hermanita murió y su familia no fue a trabajar, así que el jefe lo castigó',
      incorrect: 'Para ganar más dinero',
    },
    {
      question: 'Después de salir de la cárcel, ¿qué dijo Rolando sobre los rebeldes?',
      correct: 'Que querían terminar con el dictador y tener libertad',
      incorrect: 'Que eran criminales',
    },
    {
      question: '¿Qué hicieron Carlos y Rolando para atrapar a dos soldados sin disparar?',
      correct: 'Se acercaron en silencio y les gritaron que bajaran las armas',
      incorrect: 'Tiraron una bomba',
    },
    {
      question: '¿Cómo le salvó la vida Antony a Carlos en la batalla?',
      correct: 'Lo empujó detrás de un árbol antes de una explosión',
      incorrect: 'Recibió una bala por él',
    },
    {
      question: '¿Qué trabajo hacía la joven Paula en el pueblo de Luisa?',
      correct: 'Enseñar a leer y escribir a la gente del campo',
      incorrect: 'Buscar soldados',
    },
    {
      question: 'Al ver que Luisa era muy inteligente, ¿qué le recomendó Paula a la mamá?',
      correct: 'Que Luisa debía ir a la ciudad para estudiar en una escuela',
      incorrect: 'Que Luisa debía ser maestra allí mismo',
    },
    {
      question: '¿Qué noticia leyó Luisa en el periódico que la hizo viajar a Nicaragua para ayudar?',
      correct: '¡VICTORIA EN NICARAGUA!',
      incorrect: '¡EL BLOQUEO DE ESTADOS UNIDOS TERMINÓ!',
    },
    {
      question: 'En el avión, ¿qué le dijo Rolando a Luisa?',
      correct: 'Que quería irse a vivir a Estados Unidos porque en Cuba no era libre de hacer su música',
      incorrect: 'Que iba a ser soldado',
    },
    {
      question: '¿Qué le respondió Luisa a Rolando cuando él le dijo que quería ir a Estados Unidos?',
      correct: 'Se enojó muchísimo y le dijo que ella iba a volver a Cuba sola',
      incorrect: 'Le dijo que sí, llorando de alegría',
    },
    {
      question: 'Cuando Luisa vio el pueblo pobre en Nicaragua, ¿qué pensó?',
      correct: 'Le recordó a su propia vida cuando era pobre, antes de la revolución',
      incorrect: 'Que hablaban igual que en Cuba',
    },
    {
      question: '¿Qué pasó de repente mientras el doctor Juan tocaba la guitarra en el campamento?',
      correct: 'Llegó un soldado gritando que había heridos porque los enemigos atacaron',
      incorrect: 'Hubo un terremoto muy fuerte',
    },
    {
      question: 'En el camino en coche para ayudar a los heridos, ¿qué pasó?',
      correct: 'El coche pasó por una bomba escondida en la calle (mina) y explotó',
      incorrect: 'El motor del coche se rompió',
    },
    {
      question: 'Mientras Luisa curaba a la niña herida, ¿qué sintió?',
      correct: 'Sintió que la niña herida era igual a su hermanita muerta, y la curó con mucho amor',
      incorrect: 'Tuvo mucho miedo y no sabía qué hacer',
    },
    {
      question: '¿Qué promesa le había hecho Luisa a su hermanita muerta hace años?',
      correct: 'Que sería doctora para ayudar a otras niñas como ella',
      incorrect: 'Que sería rica',
    },
    {
      question: 'Según un discurso del Che Guevara, si un niño no tiene medicinas, ¿qué es eso?',
      correct: 'Una violencia horrible que un buen revolucionario debe solucionar con amor',
      incorrect: 'Un simple problema de dinero',
    },
  ],
};

export const EXILIADOS = {
  id: 'exiliados',
  name: 'Los Exiliados',
  emoji: '🗽',
  bgClass: 'from-blue-950',
  accentClass: 'bg-blue-600 hover:bg-blue-500',
  borderClass: 'border-blue-500',
  textAccent: 'text-blue-400',
  badgeBg: 'bg-blue-600',
  ropeDirection: -1, // negative delta moves rope toward their side (lower = they win)
  winCondition: (pos) => pos <= 25,
  powerups: [
    {
      id: 'cia',
      name: 'Apoyo de la CIA',
      description: 'La pregunta actual se responde correctamente de forma automática',
      emoji: '🕵️',
    },
    {
      id: 'mercado',
      name: 'El Mercado Libre',
      description: 'Tu próxima respuesta correcta vale 2 puntos en vez de 1',
      emoji: '💰',
    },
    {
      id: 'miami',
      name: 'Vuelo a Miami',
      description: 'Escudo: si fallas la próxima pregunta, no pierdes los -0.5 puntos',
      emoji: '✈️',
    },
  ],
  questions: [
    {
      question: '¿Qué tipo de negocio tenía la familia de José en La Habana?',
      correct: 'Una exitosa compañía de tabaco',
      incorrect: 'Una plantación de caña de azúcar',
    },
    {
      question: '¿Qué significa "nacionalizar" la industria para Martín Santos?',
      correct: 'El gobierno roba la propiedad privada y las fábricas',
      incorrect: 'El gobierno ayuda a las empresas a ganar dinero',
    },
    {
      question: '¿Qué le dijo el Che Guevara a Martín cuando cenó en su casa?',
      correct: 'Que el objetivo era eliminar a la clase social rica',
      incorrect: 'Que le iban a dar más dinero para su negocio',
    },
    {
      question: '¿A dónde tuvo que huir José para escapar del régimen comunista?',
      correct: 'A Miami, Estados Unidos',
      incorrect: 'A las montañas de la Sierra Maestra',
    },
    {
      question: '¿Cómo fue el primer día de José en la Universidad de Miami?',
      correct: 'Difícil, no tenía comida ni sabía hablar inglés',
      incorrect: 'Fácil y divertido con muchos lujos',
    },
    {
      question: '¿Qué creían José y su familia cuando salieron de Cuba en 1960?',
      correct: 'Que iban a volver pronto para la Navidad',
      incorrect: 'Que nunca regresarían a su país',
    },
    {
      question: '¿Qué fue la invasión de la Bahía de Cochinos (Playa Girón)?',
      correct: 'Un ataque militar fallido apoyado por la CIA',
      incorrect: 'Una victoria militar de los exiliados cubanos',
    },
    {
      question: '¿Qué hizo Antony Santos, el tío de José, en Cuba?',
      correct: 'Se infiltró en la CIA',
      incorrect: 'Apoyó a Fidel Castro y al comunismo',
    },
    {
      question: '¿Por qué el tío Francisco le dijo a Fidel Castro "que se vaya al diablo" en Navidad?',
      correct: 'Porque odiaba el comunismo y la pérdida de libertad',
      incorrect: 'Porque la comida en la cena estaba fría',
    },
    {
      question: '¿Cómo cambiaron las vidas de los cubanos ricos después de la revolución?',
      correct: 'Perdieron sus negocios y fueron forzados al exilio',
      incorrect: 'Ganaron más dinero trabajando para el gobierno',
    },
    {
      question: '¿Qué hizo Martín cuando su hermano Antony dijo que iba a pelear a las montañas?',
      correct: 'Le dio su apoyo total porque eran familia',
      incorrect: 'Llamó a la policía',
    },
    {
      question: '¿Cómo fue la cena entre el Che Guevara y el padre de José?',
      correct: 'Tensa, porque el Che dijo que querían eliminar a los ricos, pero necesitaba sus contactos para vender tabaco',
      incorrect: 'Muy amigable, eran buenos amigos',
    },
    {
      question: 'En la fiesta de Navidad, ¿por qué pelearon los tíos de José?',
      correct: 'Por política: uno apoyaba a Fidel y el otro decía que era un mal presidente (dictador)',
      incorrect: 'Por dinero',
    },
    {
      question: '¿Qué hacía el padre de José en secreto?',
      correct: 'Escribía mensajes secretos a Estados Unidos (la CIA) con tinta invisible',
      incorrect: 'Ayudaba a familias a escapar',
    },
    {
      question: 'Según la carta secreta, ¿cómo murió realmente el tío Antony?',
      correct: 'La policía secreta de Cuba lo mató antes de que pudiera escapar en submarino',
      incorrect: 'Murió luchando como un héroe en la guerra',
    },
    {
      question: '¿Qué historia contó la radio del gobierno de Cuba sobre la muerte de Antony?',
      correct: 'Que murió como un héroe en una misión muy importante',
      incorrect: 'Que era un traidor',
    },
    {
      question: '¿Por qué el gobierno de Cuba dejó que el padre de José siguiera trabajando en su empresa?',
      correct: 'Porque necesitaban que él siguiera vendiendo tabaco a otros países para ganar dinero',
      incorrect: 'Porque les dio mucho dinero en secreto',
    },
  ],
};
