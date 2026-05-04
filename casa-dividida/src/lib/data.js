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
  ],
};
