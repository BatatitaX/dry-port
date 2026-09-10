export type GameLang = "pt" | "en" | "es";
export type Point = { x: number; y: number };
export type CastId = "dry" | "child" | "teen" | "jao" | "nilo" | "python" | "baby" | "artist";
export type NpcId = "nilo" | "luna" | "python" | "jao";
export type AgeStage = "baby" | "teen" | "adult";

export const PORTRAIT_INDEX: Record<CastId, number> = {
  dry: 0, child: 1, teen: 2, jao: 3, nilo: 4, python: 5, baby: 6, artist: 7,
};

export const NPCS: Array<{ id: NpcId; name: string; role: Record<GameLang, string>; x: number; y: number; secret?: boolean }> = [
  { id: "nilo", name: "Nilo", role: { pt: "Guia no fim da jornada", en: "Guide at journey's end", es: "Guía al final del viaje" }, x: 5680, y: 548 },
  { id: "luna", name: "Luna", role: { pt: "Guardião das artes", en: "Keeper of the arts", es: "Guardiana de las artes" }, x: 1455, y: 590 },
  { id: "python", name: "Python", role: { pt: "O erro que bloqueia o caminho", en: "The bug blocking the path", es: "El error que bloquea el camino" }, x: 3360, y: 550 },
  { id: "jao", name: "Jão", role: { pt: "Cantor e compositor · caminho das artes", en: "Singer-songwriter · arts trail", es: "Cantante y compositor · camino del arte" }, x: 2080, y: 826, secret: true },
];

export const RIVER = { x: 1786, y: 680, width: 92, height: 344 };
export const BRIDGE = { x: 1776, y: 792, width: 112, height: 74 };
export const COMPUTER = { x: 3950, y: 835 };

export const PATH_ZONES = [
  { id: "main", x: 0, y: 420, width: 5920, height: 236 },
  { id: "art-north", x: 1450, y: 610, width: 108, height: 246 },
  { id: "art-east", x: 1450, y: 790, width: 695, height: 80 },
  { id: "tech-north", x: 3690, y: 615, width: 108, height: 248 },
  { id: "tech-east", x: 3690, y: 798, width: 590, height: 84 },
] as const;

export type Poem = {
  id: string;
  x: number;
  y: number;
  title: Record<GameLang, string>;
  body: Record<GameLang, string>;
};

export const POEMS: Poem[] = [
  {
    id: "constellations", x: 525, y: 585,
    title: { pt: "Antes do mapa", en: "Before the map", es: "Antes del mapa" },
    body: {
      pt: "Antes de entender o mundo,\neu já colecionava estrelas.\nCada pergunta era um caminho;\ncada caminho, uma janela.",
      en: "Before I understood the world,\nI was already collecting stars.\nEvery question was a pathway;\nevery pathway, a window.",
      es: "Antes de entender el mundo,\nya coleccionaba estrellas.\nCada pregunta era un camino;\ncada camino, una ventana.",
    },
  },
  {
    id: "classroom", x: 1245, y: 570,
    title: { pt: "Caderno de órbitas", en: "Notebook of orbits", es: "Cuaderno de órbitas" },
    body: {
      pt: "A sala tinha paredes,\nmas o pensamento, não.\nEntre números e planetas,\naprendi a mirar a imensidão.",
      en: "The classroom had walls,\nbut thought had none.\nBetween numbers and planets,\nI learned to aim beyond.",
      es: "El aula tenía paredes,\npero el pensamiento, no.\nEntre números y planetas,\naprendí a mirar más allá.",
    },
  },
  {
    id: "grove", x: 1510, y: 822,
    title: { pt: "O bosque escuta", en: "The grove listens", es: "El bosque escucha" },
    body: {
      pt: "Há versos presos nas folhas,\ncores dormindo no chão.\nQuem segue o caminho da arte\nencontra outra direção.",
      en: "There are verses caught in leaves,\nand colors sleeping on the ground.\nWhoever follows the art trail\nfinds another way around.",
      es: "Hay versos entre las hojas\ny colores dormidos en el suelo.\nQuien sigue el camino del arte\nencuentra un nuevo sendero.",
    },
  },
  {
    id: "bridge", x: 1950, y: 824,
    title: { pt: "Depois da ponte", en: "After the bridge", es: "Después del puente" },
    body: {
      pt: "Nem toda travessia faz barulho.\nAlgumas cabem numa canção;\noutras, no silêncio de alguém\nescondido ao fim da estação.",
      en: "Not every crossing makes a sound.\nSome fit inside a song;\nothers, inside someone's silence\nat the end of the road.",
      es: "No todo cruce hace ruido.\nAlgunos caben en una canción;\notros, en el silencio de alguien\nal final de la estación.",
    },
  },
  {
    id: "syntax", x: 2430, y: 565,
    title: { pt: "Sintaxe do afeto", en: "Syntax of affection", es: "Sintaxis del afecto" },
    body: {
      pt: "Se o erro pede paciência,\na vida pede também.\nCorrigir não é apagar:\né descobrir o que vem.",
      en: "If mistakes ask for patience,\nlife does too.\nTo fix is not to erase:\nit is to discover what is new.",
      es: "Si el error pide paciencia,\nla vida también.\nCorregir no es borrar:\nes descubrir lo que viene.",
    },
  },
  {
    id: "roots", x: 2930, y: 590,
    title: { pt: "Raízes em código", en: "Roots in code", es: "Raíces en código" },
    body: {
      pt: "Cresci entre telas e dúvidas,\nprojetos, amigos e nós.\nA versão que sigo construindo\ncarrega um pouco de todos nós.",
      en: "I grew among screens and questions,\nprojects, friends and ties.\nThe version I keep building\ncarries pieces of all our lives.",
      es: "Crecí entre pantallas y dudas,\nproyectos, amistades y lazos.\nLa versión que sigo creando\nlleva un poco de nuestros pasos.",
    },
  },
  {
    id: "archive", x: 4110, y: 837,
    title: { pt: "O arquivo das coisas vivas", en: "The archive of living things", es: "El archivo de las cosas vivas" },
    body: {
      pt: "Guardei lembranças em versos,\nnão por medo de esquecer:\nalgumas histórias precisam\nde outro jeito para viver.",
      en: "I kept memories in verses,\nnot because I feared forgetting:\nsome stories simply need\na different way of living.",
      es: "Guardé recuerdos en versos,\nno por miedo a olvidar:\nalgunas historias necesitan\notra manera de continuar.",
    },
  },
  {
    id: "universes", x: 4540, y: 568,
    title: { pt: "Universos portáteis", en: "Pocket universes", es: "Universos portátiles" },
    body: {
      pt: "Inventei mundos para entender\na coragem de começar.\nQuem cria uma porta nova\ntambém aprende a atravessar.",
      en: "I invented worlds to understand\nthe courage it takes to begin.\nWhoever builds a brand-new door\nlearns how to walk right in.",
      es: "Inventé mundos para entender\nel valor de comenzar.\nQuien crea una puerta nueva\ntambién aprende a cruzar.",
    },
  },
  {
    id: "tomorrow", x: 5170, y: 592,
    title: { pt: "Quase amanhã", en: "Almost tomorrow", es: "Casi mañana" },
    body: {
      pt: "O futuro não chega pronto;\nchega pedindo atenção.\nUm passo, um sonho, um estágio:\ne o resto vira continuação.",
      en: "The future never arrives finished;\nit arrives asking to be seen.\nOne step, one dream, one internship:\nand the rest becomes the in-between.",
      es: "El futuro no llega listo;\nllega pidiendo atención.\nUn paso, un sueño, unas prácticas:\ny el resto es continuación.",
    },
  },
];

type DialogueLine = { speaker: string; cast: CastId; text: Record<GameLang, string> };

export const DIALOGUES: Record<NpcId, DialogueLine[]> = {
  nilo: [
    { speaker: "Nilo", cast: "nilo", text: { pt: "Você chegou. Cada casa guarda um pedaço da sua história; aproxime-se da entrada e aperte E.", en: "You made it. Every house keeps part of your story; approach its entrance and press E.", es: "Llegaste. Cada casa guarda una parte de tu historia; acércate a la entrada y pulsa E." } },
    { speaker: "Nilo", cast: "nilo", text: { pt: "Tem uma trilha escondida no Bosque das Artes. Nem tudo que importa aparece no mapa.", en: "There is a hidden trail in the Arts Grove. Not everything important shows up on the map.", es: "Hay un sendero oculto en el Bosque de las Artes. No todo lo importante aparece en el mapa." } },
    { speaker: "Dry", cast: "dry", text: { pt: "Então vou prestar atenção no que está fora da estrada também.", en: "Then I will pay attention to what lies beyond the road, too.", es: "Entonces también prestaré atención a lo que queda fuera del camino." } },
  ],
  luna: [
    { speaker: "Luna", cast: "artist", text: { pt: "A arte não termina na placa. Desça pelo caminho entre as flores e atravesse a ponte.", en: "Art does not end at the sign. Follow the flower-lined trail and cross the bridge.", es: "El arte no termina en el cartel. Baja por el sendero entre flores y cruza el puente." } },
    { speaker: "Luna", cast: "artist", text: { pt: "Se ouvir uma música baixinha no fim do bosque, chegou ao lugar certo.", en: "If you hear a quiet song at the end of the grove, you are in the right place.", es: "Si oyes una canción suave al final del bosque, llegaste al lugar correcto." } },
  ],
  python: [
    { speaker: "Python", cast: "python", text: { pt: "Um erro no caminho não é o fim. É só uma pergunta que ainda não encontrou resposta.", en: "A bug in the road is not the end. It is just a question that has not found an answer yet.", es: "Un error en el camino no es el final. Es solo una pregunta sin respuesta todavía." } },
    { speaker: "Python", cast: "python", text: { pt: "Observe, corrija e execute. Se conseguir, os versos esquecidos voltarão a aparecer.", en: "Inspect, fix and execute. If you succeed, the forgotten verses will appear again.", es: "Observa, corrige y ejecuta. Si lo consigues, los versos olvidados volverán a aparecer." } },
  ],
  jao: [
    { speaker: "Jão", cast: "jao", text: { pt: "De Lobos até Memórias Póstumas, cada disco guarda uma versão de quem eu fui.", en: "From Lobos to Memórias Póstumas, every album keeps a version of who I used to be.", es: "De Lobos a Memórias Póstumas, cada álbum guarda una versión de quien fui." } },
    { speaker: "Dry", cast: "dry", text: { pt: "Suas músicas sempre encontraram um jeito de virar parte da minha história.", en: "Your songs always found a way to become part of my own story.", es: "Tus canciones siempre encontraron la forma de volverse parte de mi historia." } },
    { speaker: "Jão", cast: "jao", text: { pt: "Então continua: o que te atravessa também merece um lugar nesse mapa.", en: "Then keep going: everything that moves you deserves a place on this map, too.", es: "Entonces sigue: todo lo que te atraviesa también merece un lugar en este mapa." } },
  ],
};
