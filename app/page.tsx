"use client";

/* eslint-disable @next/next/no-img-element -- Pixel-art assets must remain unoptimized and preserve their original pixels. */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BattleModal,
  BRIDGE,
  COMPUTER,
  ComputerModal,
  DIALOGUES,
  DialogueModal,
  HudIcon,
  NPCS,
  NpcSprite,
  PATH_ZONES,
  POEMS,
  PoemModal,
  Portrait,
  RIVER,
  SceneStage,
  type CastId,
  type NpcId,
  type Poem,
} from "./game-extras";

type Lang = "pt" | "en" | "es";
type Direction = "down" | "left" | "right" | "up";
type Multi = Record<Lang, string>;
type Memory = {
  id: string;
  year: string;
  icon: string;
  assetIndex: number;
  category: "origem" | "formacao" | "projeto" | "competencia" | "interesse" | "futuro";
  title: Multi;
  subtitle: Multi;
  body: Multi;
  x: number;
  y: number;
  link?: string;
  linkLabel?: string;
};

const ui: Record<Lang, Record<string, string>> = {
  pt: {
    eyebrow: "UM PORTFÓLIO JOGÁVEL • 2007—2026",
    intro: "Uma jornada por código, jogos e curiosidade.",
    start: "COMEÇAR JORNADA",
    resume: "RETOMAR SAVE",
    restart: "NOVO JOGO",
    quick: "VER PORTFÓLIO RÁPIDO",
    sound: "Som",
    motion: "Movimento reduzido",
    controls: "WASD ou setas movimentam • Shift corre • E interage • M abre o mapa",
    mission: "MISSÃO ATIVA",
    missionName: "Descobrindo o passado",
    inventory: "Memórias",
    map: "Mapa",
    openMap: "Abrir mapa",
    mapTitle: "Mapa da jornada",
    mapHint: "O caminho aparece conforme você explora. Áreas ainda não visitadas permanecem escuras.",
    all: "Revelar tudo",
    settings: "Ajustes",
    interact: "Explorar memória",
    close: "Fechar",
    discovered: "memórias descobertas",
    portfolio: "Portfólio rápido",
    journey: "Voltar à jornada",
    print: "Baixar recorte em PDF",
    share: "Compartilhar recorte",
    favorite: "Favoritar",
    hide: "Ocultar",
    show: "Exibir",
    up: "Subir",
    down: "Descer",
    profile: "Perfil",
    timeline: "Trajetória",
    projects: "Projetos em destaque",
    skills: "Competências técnicas",
    education: "Formação & disponibilidade",
    certificates: "Diplomas & certificados",
    contact: "Vamos conversar?",
    locked: "EM ATUALIZAÇÃO",
    current: "Agora",
    saveNote: "Seu progresso fica salvo neste dispositivo.",
  },
  en: {
    eyebrow: "A PLAYABLE PORTFOLIO • 2007—2026",
    intro: "A journey through code, games and curiosity.",
    start: "START JOURNEY",
    resume: "RESUME SAVE",
    restart: "NEW GAME",
    quick: "OPEN QUICK PORTFOLIO",
    sound: "Sound",
    motion: "Reduced motion",
    controls: "WASD or arrows move • Shift runs • E interacts • M opens the map",
    mission: "ACTIVE QUEST",
    missionName: "Discovering the past",
    inventory: "Memories",
    map: "Map",
    openMap: "Open map",
    mapTitle: "Journey map",
    mapHint: "The path is revealed as you explore. Unvisited areas remain dark.",
    all: "Reveal all",
    settings: "Settings",
    interact: "Explore memory",
    close: "Close",
    discovered: "memories discovered",
    portfolio: "Quick portfolio",
    journey: "Back to journey",
    print: "Download selection as PDF",
    share: "Share selection",
    favorite: "Favorite",
    hide: "Hide",
    show: "Show",
    up: "Move up",
    down: "Move down",
    profile: "Profile",
    timeline: "Timeline",
    projects: "Featured projects",
    skills: "Technical skills",
    education: "Education & availability",
    certificates: "Diplomas & certificates",
    contact: "Let’s talk?",
    locked: "COMING SOON",
    current: "Now",
    saveNote: "Progress is saved on this device.",
  },
  es: {
    eyebrow: "UN PORTAFOLIO JUGABLE • 2007—2026",
    intro: "Un viaje por código, juegos y curiosidad.",
    start: "INICIAR VIAJE",
    resume: "CONTINUAR PARTIDA",
    restart: "NUEVA PARTIDA",
    quick: "VER PORTAFOLIO RÁPIDO",
    sound: "Sonido",
    motion: "Movimiento reducido",
    controls: "WASD o flechas mueven • Shift corre • E interactúa • M abre el mapa",
    mission: "MISIÓN ACTIVA",
    missionName: "Descubriendo el pasado",
    inventory: "Memorias",
    map: "Mapa",
    openMap: "Abrir mapa",
    mapTitle: "Mapa del viaje",
    mapHint: "El camino aparece a medida que exploras. Las áreas no visitadas permanecen oscuras.",
    all: "Revelar todo",
    settings: "Ajustes",
    interact: "Explorar memoria",
    close: "Cerrar",
    discovered: "memorias descubiertas",
    portfolio: "Portafolio rápido",
    journey: "Volver al viaje",
    print: "Descargar selección en PDF",
    share: "Compartir selección",
    favorite: "Favorito",
    hide: "Ocultar",
    show: "Mostrar",
    up: "Subir",
    down: "Bajar",
    profile: "Perfil",
    timeline: "Trayectoria",
    projects: "Proyectos destacados",
    skills: "Competencias técnicas",
    education: "Formación y disponibilidad",
    certificates: "Diplomas y certificados",
    contact: "¿Hablamos?",
    locked: "EN ACTUALIZACIÓN",
    current: "Ahora",
    saveNote: "Tu progreso se guarda en este dispositivo.",
  },
};

const quickText = {
  pt: {
    kicker: "FULL STACK • SUPORTE DE TI • VALE DO PARAÍBA", heroTop: "Curioso por", heroEm: "natureza.",
    bio: "Sou Adryel Luís Rodrigues, estudante de Análise e Desenvolvimento de Sistemas. Transformo curiosidade em código, sistemas e experiências — e estou em busca da minha próxima grande missão: um estágio em tecnologia.",
    cv: "BAIXAR CV", viewProjects: "VER PROJETOS", status: "DISPONÍVEL • TARDE & NOITE",
    stats: ["início da jornada", "projetos principais", "idiomas", "curiosidade"],
    timelineA: "Da astronomia", timelineB: "ao software.", projectsA: "Ideias que", projectsB: "viraram sistemas.", skillsA: "Ferramentas", skillsB: "da jornada.", educationA: "Aprendendo.", educationB: "Construindo.", certificatesA: "Novos itens", certificatesB: "em breve.",
    etec: "Técnico integrado ao Ensino Médio em Análise e Desenvolvimento de Sistemas.", fatec: "AMS em Análise e Desenvolvimento de Sistemas. Conclusão prevista para 2027.", completed: "CONCLUÍDO", inProgress: "EM CURSO", availabilityTitle: "Disponível para oportunidades", availability: "Estágio em Full Stack ou Suporte • presencial, híbrido ou remoto • Vale do Paraíba • tarde e noite.",
    contactA: "Uma boa equipe também", contactB: "começa com", contactEm: "curiosidade.", email: "ENVIAR E-MAIL", explore: "EXPLORAR PROJETO",
  },
  en: {
    kicker: "FULL STACK • IT SUPPORT • VALE DO PARAÍBA", heroTop: "Curious by", heroEm: "nature.",
    bio: "I’m Adryel Luís Rodrigues, a Software Analysis and Development student. I turn curiosity into code, systems and experiences — and I’m looking for my next major quest: a technology internship.",
    cv: "DOWNLOAD CV", viewProjects: "VIEW PROJECTS", status: "AVAILABLE • AFTERNOONS & EVENINGS",
    stats: ["journey started", "main projects", "languages", "curiosity"],
    timelineA: "From astronomy", timelineB: "to software.", projectsA: "Ideas turned", projectsB: "into systems.", skillsA: "Tools for", skillsB: "the journey.", educationA: "Learning.", educationB: "Building.", certificatesA: "New items", certificatesB: "coming soon.",
    etec: "Integrated high-school technical diploma in Software Analysis and Development.", fatec: "Software Analysis and Development degree. Expected graduation in 2027.", completed: "COMPLETED", inProgress: "IN PROGRESS", availabilityTitle: "Open to opportunities", availability: "Internship in Full Stack or IT Support • on-site, hybrid or remote • Vale do Paraíba • afternoons and evenings.",
    contactA: "A great team can also", contactB: "begin with", contactEm: "curiosity.", email: "SEND AN EMAIL", explore: "EXPLORE PROJECT",
  },
  es: {
    kicker: "FULL STACK • SOPORTE DE TI • VALE DO PARAÍBA", heroTop: "Curioso por", heroEm: "naturaleza.",
    bio: "Soy Adryel Luís Rodrigues, estudiante de Análisis y Desarrollo de Sistemas. Transformo curiosidad en código, sistemas y experiencias — y busco mi próxima gran misión: unas prácticas en tecnología.",
    cv: "DESCARGAR CV", viewProjects: "VER PROYECTOS", status: "DISPONIBLE • TARDE Y NOCHE",
    stats: ["inicio del viaje", "proyectos principales", "idiomas", "curiosidad"],
    timelineA: "De la astronomía", timelineB: "al software.", projectsA: "Ideas que se", projectsB: "volvieron sistemas.", skillsA: "Herramientas", skillsB: "del viaje.", educationA: "Aprendiendo.", educationB: "Construyendo.", certificatesA: "Nuevos objetos", certificatesB: "muy pronto.",
    etec: "Formación técnica integrada al bachillerato en Análisis y Desarrollo de Sistemas.", fatec: "Grado en Análisis y Desarrollo de Sistemas. Finalización prevista para 2027.", completed: "CONCLUIDO", inProgress: "EN CURSO", availabilityTitle: "Disponible para oportunidades", availability: "Prácticas en Full Stack o Soporte • presencial, híbrido o remoto • Vale do Paraíba • tarde y noche.",
    contactA: "Un buen equipo también", contactB: "puede empezar con", contactEm: "curiosidad.", email: "ENVIAR E-MAIL", explore: "EXPLORAR PROYECTO",
  },
} satisfies Record<Lang, Record<string, string | string[]>>;

const memories: Memory[] = [
  {
    id: "origins", year: "2007", icon: "✦", assetIndex: 0, category: "origem", x: 252, y: 1795,
    title: { pt: "Observatório das Origens", en: "Observatory of Origins", es: "Observatorio de los Orígenes" },
    subtitle: { pt: "Curiosidade antes de qualquer código", en: "Curiosity before any code", es: "Curiosidad antes de cualquier código" },
    body: { pt: "Adryel nasceu em Guaratinguetá em 20 de dezembro de 2007. Desde criança, jogos e astronomia alimentam a mesma vontade: explorar sistemas, entender regras e descobrir o que existe além do mapa.", en: "Adryel was born in Guaratinguetá on December 20, 2007. Since childhood, games and astronomy have fueled the same drive: exploring systems, understanding rules and discovering what lies beyond the map.", es: "Adryel nació en Guaratinguetá el 20 de diciembre de 2007. Desde niño, los juegos y la astronomía alimentan el mismo impulso: explorar sistemas, comprender reglas y descubrir qué hay más allá del mapa." },
  },
  {
    id: "art", year: "SEMPRE", icon: "✧", assetIndex: 1, category: "interesse", x: 790, y: 640,
    title: { pt: "Bosque das Artes", en: "Arts Grove", es: "Bosque de las Artes" },
    subtitle: { pt: "Repertório visual também alimenta o código", en: "Visual culture also fuels the code", es: "La cultura visual también alimenta el código" },
    body: { pt: "Adryel ama arte e usa esse interesse como fonte de repertório, criatividade e novas formas de observar problemas. No portfólio, o bosque representa a curiosidade que existe além da tecnologia.", en: "Adryel loves art and draws on it for visual references, creativity and new ways of looking at problems. In this portfolio, the grove represents curiosity beyond technology.", es: "Adryel ama el arte y lo usa como fuente de referencias visuales, creatividad y nuevas formas de observar problemas. En el portafolio, el bosque representa la curiosidad más allá de la tecnología." },
  },
  {
    id: "design", year: "SEMPRE", icon: "◫", assetIndex: 3, category: "interesse", x: 455, y: 1065,
    title: { pt: "Ateliê de Design", en: "Design Studio", es: "Taller de Diseño" },
    subtitle: { pt: "Clareza, hierarquia e acabamento", en: "Clarity, hierarchy and polish", es: "Claridad, jerarquía y acabado" },
    body: { pt: "O interesse por design aparece na atenção à organização, à leitura das interfaces e ao acabamento visual. Para Adryel, um sistema bem construído também precisa ser claro e agradável de usar.", en: "An interest in design appears through attention to organization, interface readability and visual polish. For Adryel, a well-built system should also be clear and pleasant to use.", es: "El interés por el diseño aparece en la atención a la organización, la lectura de interfaces y el acabado visual. Para Adryel, un sistema bien construido también debe ser claro y agradable de usar." },
  },
  {
    id: "joaquim", year: "2019—2022", icon: "⌁", assetIndex: 2, category: "formacao", x: 785, y: 1565,
    title: { pt: "Vila Joaquim de Campos", en: "Joaquim de Campos Village", es: "Villa Joaquim de Campos" },
    subtitle: { pt: "Matemática, olimpíadas e uma medalha", en: "Math, olympiads and a medal", es: "Matemáticas, olimpiadas y una medalla" },
    body: { pt: "Do 6º ao 9º ano, em Roseira, participou de aulas extras de matemática e do projeto TEEMO, criado para aproximar estudantes de olimpíadas científicas. No 9º ano, conquistou bronze na OBA — Olimpíada Brasileira de Astronomia e Astronáutica.", en: "From 6th through 9th grade in Roseira, he joined extra math classes and TEEMO, a project connecting students with academic olympiads. In 9th grade, he earned bronze at the Brazilian Astronomy and Astronautics Olympiad.", es: "Del sexto al noveno año en Roseira, participó en clases extra de matemáticas y en TEEMO, un proyecto de acceso a olimpiadas académicas. En noveno obtuvo bronce en la Olimpiada Brasileña de Astronomía y Astronáutica." },
  },
  {
    id: "etec", year: "2023—2025", icon: "⌘", assetIndex: 4, category: "formacao", x: 1970, y: 1415,
    title: { pt: "Academia ETEC", en: "ETEC Academy", es: "Academia ETEC" },
    subtitle: { pt: "ADS, 30/40 no vestibulinho e transformação", en: "Software studies, 30/40 admission and growth", es: "ADS, 30/40 en el ingreso y transformación" },
    body: { pt: "A ETEC João Gomes de Araújo transformou Adryel como pessoa e profissional. Entre 2023 e 2025, concluiu o ensino técnico integrado em Análise e Desenvolvimento de Sistemas, criou conexões importantes e aprofundou a área com que sempre sonhou.", en: "ETEC João Gomes de Araújo transformed Adryel personally and professionally. From 2023 to 2025, he completed the integrated technical program in Software Analysis and Development, built meaningful connections and deepened the field he had always dreamed about.", es: "La ETEC João Gomes de Araújo transformó a Adryel personal y profesionalmente. Entre 2023 y 2025 concluyó la formación técnica integrada en Análisis y Desarrollo de Sistemas, creó conexiones y profundizó en el área que siempre soñó." },
  },
  {
    id: "mente", year: "2025", icon: "▤", assetIndex: 9, category: "projeto", x: 1600, y: 1210,
    title: { pt: "Mente Inabalável", en: "Unshakable Mind", es: "Mente Inquebrantable" },
    subtitle: { pt: "Publicação acadêmica colaborativa • MB", en: "Collaborative academic publication • top grade", es: "Publicación académica colaborativa • MB" },
    body: { pt: "TCC colaborativo sobre a escassez de divulgação de serviços de saúde mental. O sistema digital facilita o acesso a apoio especializado. Tecnologias: HTML, CSS, PHP, JavaScript, Firebase, MySQL e Apache/XAMPP.", en: "A collaborative capstone about the lack of visibility for mental-health services. The digital system helps people reach specialized support. Stack: HTML, CSS, PHP, JavaScript, Firebase, MySQL and Apache/XAMPP.", es: "Proyecto final colaborativo sobre la falta de divulgación de servicios de salud mental. El sistema facilita el acceso a apoyo especializado. Tecnologías: HTML, CSS, PHP, JavaScript, Firebase, MySQL y Apache/XAMPP." },
    link: "https://ric.cps.sp.gov.br/handle/123456789/39708", linkLabel: "RIC — Centro Paula Souza",
  },
  {
    id: "prever", year: "2026", icon: "◈", assetIndex: 5, category: "projeto", x: 2340, y: 990,
    title: { pt: "PREVER • antigo SMDN", en: "PREVER • formerly SMDN", es: "PREVER • antes SMDN" },
    subtitle: { pt: "Plataforma de gestão de desastres", en: "Disaster management platform", es: "Plataforma de gestión de desastres" },
    body: { pt: "Projeto acadêmico voltado a agências como SAMU, Defesa Civil e Bombeiros. Adryel assumiu praticamente todo o desenvolvimento web front-end e back-end. O app móvel em Flutter será a interface da população; o Visualizer apresenta o ecossistema.", en: "Academic project for agencies such as emergency medical services, Civil Defense and Fire Departments. Adryel handled nearly all web front-end and back-end development. A Flutter mobile app will serve the public; Visualizer presents the ecosystem.", es: "Proyecto académico para agencias como emergencias, Defensa Civil y Bomberos. Adryel realizó casi todo el desarrollo web front-end y back-end. Una app Flutter será la interfaz pública; Visualizer presenta el ecosistema." },
    link: "https://smdnpi.vercel.app/", linkLabel: "Abrir PREVER",
  },
  {
    id: "runiverse", year: "2026", icon: "◆", assetIndex: 7, category: "projeto", x: 2715, y: 760,
    title: { pt: "R-Universe", en: "R-Universe", es: "R-Universe" },
    subtitle: { pt: "Projeto solo para RPGs de mesa", en: "Solo project for tabletop RPGs", es: "Proyecto individual para RPG de mesa" },
    body: { pt: "Projeto particular criado e desenvolvido sozinho por Adryel. A proposta é generalizar sistemas de RPG de mesa em uma experiência on-line flexível para diferentes regras, universos e grupos.", en: "A personal project designed and developed by Adryel alone. Its purpose is to generalize tabletop RPG systems into a flexible online experience for different rules, worlds and groups.", es: "Proyecto personal diseñado y desarrollado únicamente por Adryel. Busca generalizar sistemas de RPG de mesa en una experiencia en línea flexible para distintas reglas, universos y grupos." },
    link: "https://projectr-weld.vercel.app/", linkLabel: "Abrir R-Universe",
  },
  {
    id: "fatec", year: "2026—2027", icon: "△", assetIndex: 10, category: "formacao", x: 2220, y: 760,
    title: { pt: "Cidadela FATEC", en: "FATEC Citadel", es: "Ciudadela FATEC" },
    subtitle: { pt: "AMS ADS em Taubaté", en: "Software degree in Taubaté", es: "Grado de ADS en Taubaté" },
    body: { pt: "Em 2026, Adryel segue a formação na FATEC Taubaté pelo programa AMS em Análise e Desenvolvimento de Sistemas, com conclusão prevista para 2027. Faculdade pela manhã; disponibilidade profissional à tarde e à noite.", en: "In 2026, Adryel continues his education at FATEC Taubaté through the Software Analysis and Development program, graduating in 2027. Morning classes; professionally available in the afternoon and evening.", es: "En 2026, Adryel continúa su formación en FATEC Taubaté en Análisis y Desarrollo de Sistemas, con conclusión prevista en 2027. Clases por la mañana; disponibilidad profesional por la tarde y noche." },
  },
  {
    id: "future", year: "AGORA", icon: "⬡", assetIndex: 11, category: "futuro", x: 3090, y: 495,
    title: { pt: "Portal do Futuro", en: "Future Portal", es: "Portal del Futuro" },
    subtitle: { pt: "Próxima missão: estágio", en: "Next quest: an internship", es: "Próxima misión: prácticas" },
    body: { pt: "Objetivo principal: estágio em desenvolvimento full stack ou suporte de TI. Aberto a oportunidades presenciais, híbridas ou remotas no Vale do Paraíba, sempre no período da tarde ou noite.", en: "Main goal: an internship in full-stack development or IT support. Open to on-site, hybrid or remote opportunities across Vale do Paraíba, during afternoon or evening hours.", es: "Objetivo principal: prácticas en desarrollo full stack o soporte de TI. Abierto a oportunidades presenciales, híbridas o remotas en Vale do Paraíba, por la tarde o noche." },
  },
];

const projects = [
  { name: "PREVER", role: { pt: "Full stack • projeto acadêmico", en: "Full stack • academic project", es: "Full stack • proyecto académico" }, stack: "React · JavaScript · Tailwind · Supabase · Leaflet · Firebase AI", href: "https://smdnpi.vercel.app/", mark: "01" },
  { name: "SMDN Visualizer", role: { pt: "Marketing do ecossistema PREVER", en: "PREVER ecosystem showcase", es: "Presentación del ecosistema PREVER" }, stack: "React · CSS · Vite · Flutter · PostGIS · Vertex AI", href: "https://visualizersmdn.vercel.app/", mark: "02" },
  { name: "R-Universe", role: { pt: "Produto pessoal • projeto solo", en: "Personal product • solo project", es: "Producto personal • proyecto individual" }, stack: "React · Supabase Auth · RPC · PWA · Service Worker", href: "https://projectr-weld.vercel.app/", mark: "03" },
  { name: "Mente Inabalável", role: { pt: "TCC colaborativo • publicação acadêmica", en: "Collaborative capstone • academic publication", es: "Proyecto final colaborativo • publicación académica" }, stack: "HTML · CSS · PHP · JavaScript · Firebase · MySQL", href: "https://ric.cps.sp.gov.br/handle/123456789/39708", mark: "04" },
];

const skills = {
  "Avançado": ["C", "HTML", "CSS", "PHP", "IA generativa", "APIs & automações"],
  "Intermediário": ["Python", "Java", "JavaScript", "React", "SQL"],
  "Básico / prático": ["Dart", "Flutter", "Node.js", "Supabase", "Firebase", "MySQL", "PostgreSQL/PostGIS", "Git/GitHub", "UX", "Vite"],
};
const skillLevelNames: Record<Lang, Record<string, string>> = {
  pt: { "Avançado": "Avançado", "Intermediário": "Intermediário", "Básico / prático": "Básico / prático" },
  en: { "Avançado": "Advanced", "Intermediário": "Intermediate", "Básico / prático": "Basic / practical" },
  es: { "Avançado": "Avanzado", "Intermediário": "Intermedio", "Básico / prático": "Básico / práctico" },
};
const skillNames: Record<Lang, Record<string, string>> = {
  pt: {},
  en: { "IA generativa": "Generative AI", "APIs & automações": "APIs & automation" },
  es: { "IA generativa": "IA generativa", "APIs & automações": "APIs y automatización" },
};

const posthumousText: Record<Lang, { unlocked: string; title: string; body: string; badge: string }> = {
  pt: {
    unlocked: "CONQUISTA DESBLOQUEADA",
    title: "Memórias Póstumas",
    body: "Um encontro secreto com Jão no fim do caminho das artes. Esta descoberta representa curiosidade cultural e atenção constante às novidades.",
    badge: "Cultura, arte e novidades",
  },
  en: {
    unlocked: "ACHIEVEMENT UNLOCKED",
    title: "Posthumous Memories",
    body: "A secret encounter with Jão at the end of the arts trail. This discovery represents cultural curiosity and staying connected to what is new.",
    badge: "Culture, art and what’s new",
  },
  es: {
    unlocked: "LOGRO DESBLOQUEADO",
    title: "Memorias Póstumas",
    body: "Un encuentro secreto con Jão al final del camino del arte. Este hallazgo representa curiosidad cultural y atención constante a las novedades.",
    badge: "Cultura, arte y novedades",
  },
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const WORLD = { width: 5920, height: 1024 };
const PATH_Y = 548;
const PATH_TOP = 420;
const PATH_BOTTOM = 656;
const START_POS = { x: 150, y: PATH_Y };
const FOG_COLS = 20;
const FOG_ROWS = 4;
const WALK_SPEED = 128;
const PLAYER_RADIUS = 12;

type Landmark = { id: string; memoryId: string; x: number; kind: string; glyph: string; width: number };

const LANDMARKS: Landmark[] = [
  { id: "observatory", memoryId: "origins", x: 360, kind: "observatory", glyph: "✦", width: 286 },
  { id: "village-school", memoryId: "joaquim", x: 920, kind: "school", glyph: "⌁", width: 330 },
  { id: "art-pavilion", memoryId: "art", x: 1480, kind: "art", glyph: "✧", width: 310 },
  { id: "design-studio", memoryId: "design", x: 2040, kind: "design", glyph: "◫", width: 292 },
  { id: "etec-academy", memoryId: "etec", x: 2600, kind: "academy", glyph: "⌘", width: 306 },
  { id: "mente-conservatory", memoryId: "mente", x: 3160, kind: "mente", glyph: "▤", width: 290 },
  { id: "prever-station", memoryId: "prever", x: 3720, kind: "prever", glyph: "◈", width: 330 },
  { id: "runiverse-guild", memoryId: "runiverse", x: 4280, kind: "runiverse", glyph: "◆", width: 306 },
  { id: "fatec-citadel", memoryId: "fatec", x: 4840, kind: "fatec", glyph: "△", width: 316 },
  { id: "future-portal", memoryId: "future", x: 5520, kind: "future", glyph: "⬡", width: 286 },
];

const WORLD_MEMORIES: Memory[] = LANDMARKS.map((landmark) => {
  const memory = memories.find((item) => item.id === landmark.memoryId)!;
  return { ...memory, x: landmark.x, y: PATH_TOP + 18 };
});

type SceneryKind = "tree" | "purple-tree" | "bush" | "flowers" | "rocks" | "fence" | "sign" | "lamp";
type SceneryItem = { x: number; y: number; kind: SceneryKind; width: number; label?: string };

const SCENERY: SceneryItem[] = [
  { x: 90, y: 602, kind: "tree", width: 112 }, { x: 610, y: 625, kind: "bush", width: 86 },
  { x: 665, y: 642, kind: "flowers", width: 94 }, { x: 740, y: 632, kind: "fence", width: 132 },
  { x: 1160, y: 612, kind: "tree", width: 104 }, { x: 1260, y: 638, kind: "sign", width: 68, label: "ARTE" },
  { x: 1338, y: 632, kind: "purple-tree", width: 112 }, { x: 1650, y: 638, kind: "flowers", width: 92 },
  { x: 1780, y: 625, kind: "purple-tree", width: 118 }, { x: 1870, y: 642, kind: "bush", width: 82 },
  { x: 2200, y: 638, kind: "sign", width: 68, label: "DESIGN" }, { x: 2310, y: 642, kind: "rocks", width: 82 },
  { x: 2380, y: 632, kind: "bush", width: 88 }, { x: 2815, y: 620, kind: "tree", width: 112 },
  { x: 2910, y: 642, kind: "fence", width: 136 }, { x: 3000, y: 640, kind: "flowers", width: 92 },
  { x: 3385, y: 635, kind: "flowers", width: 94 }, { x: 3460, y: 626, kind: "bush", width: 86 },
  { x: 3518, y: 631, kind: "lamp", width: 58 }, { x: 3935, y: 630, kind: "lamp", width: 58 },
  { x: 4000, y: 640, kind: "rocks", width: 84 }, { x: 4068, y: 620, kind: "purple-tree", width: 116 },
  { x: 4490, y: 635, kind: "purple-tree", width: 112 }, { x: 4585, y: 640, kind: "flowers", width: 90 },
  { x: 4650, y: 640, kind: "fence", width: 132 }, { x: 5160, y: 622, kind: "tree", width: 112 },
  { x: 5260, y: 640, kind: "rocks", width: 82 }, { x: 5325, y: 630, kind: "lamp", width: 58 },
  { x: 5740, y: 630, kind: "purple-tree", width: 116 }, { x: 5830, y: 640, kind: "flowers", width: 92 },
  { x: 420, y: 1020, kind: "flowers", width: 88 }, { x: 980, y: 1018, kind: "rocks", width: 78 },
  { x: 1540, y: 1024, kind: "flowers", width: 92 }, { x: 2100, y: 1018, kind: "bush", width: 82 },
  { x: 2660, y: 1023, kind: "rocks", width: 82 }, { x: 3220, y: 1018, kind: "flowers", width: 90 },
  { x: 3780, y: 1018, kind: "bush", width: 82 }, { x: 4340, y: 1022, kind: "rocks", width: 82 },
  { x: 4900, y: 1018, kind: "flowers", width: 90 }, { x: 5460, y: 1020, kind: "bush", width: 84 },
];

const inRect = (p: { x: number; y: number }, rect: { x: number; y: number; width: number; height: number }, padding = 0) =>
  p.x >= rect.x + padding && p.x <= rect.x + rect.width - padding &&
  p.y >= rect.y + padding && p.y <= rect.y + rect.height - padding;

const isWalkable = (p: { x: number; y: number }, bossDefeated = false) => {
  if (p.x < PLAYER_RADIUS || p.x > WORLD.width - PLAYER_RADIUS || p.y < PLAYER_RADIUS || p.y > WORLD.height - PLAYER_RADIUS) return false;
  const onPath = PATH_ZONES.some((zone) => inRect(p, zone, zone.id === "main" ? PLAYER_RADIUS : 5));
  const onEntrance = LANDMARKS.some((landmark) => Math.abs(p.x - landmark.x) <= 40 && p.y >= 395 && p.y <= PATH_TOP + 24);
  if (!onPath && !onEntrance) return false;
  if (inRect(p, RIVER) && !inRect(p, BRIDGE, 2)) return false;
  if (!bossDefeated && p.x > 3475 && p.y < 700) return false;
  return !NPCS.some((npc) => !(npc.id === "python" && bossDefeated) && Math.hypot(p.x - npc.x, p.y - npc.y) < 17);
};

const fogKey = (x: number, y: number) => {
  const col = clamp(Math.floor(x / (WORLD.width / FOG_COLS)), 0, FOG_COLS - 1);
  const row = clamp(Math.floor(y / (WORLD.height / FOG_ROWS)), 0, FOG_ROWS - 1);
  return `${col}:${row}`;
};

const spriteStyle = (index: number): React.CSSProperties => ({
  backgroundImage: "url('/memory-icons.png')",
  backgroundSize: "400% 300%",
  backgroundPosition: `${(index % 4) * 33.333}% ${Math.floor(index / 4) * 50}%`,
  backgroundRepeat: "no-repeat",
});

function PixelLandmark({ landmark, memory, lang }: { landmark: Landmark; memory: Memory; lang: Lang }) {
  return <div className={`pixel-landmark landmark-${landmark.kind}`} style={{ left: landmark.x }} aria-hidden="true">
    <img className="landmark-asset" src={`/world/structures/${landmark.id}.png`} alt="" decoding="async" style={{ width: landmark.width }} />
    <span className="building-glyph">{landmark.glyph}</span>
    <div className="location-plaque"><small>{memory.year}</small><strong>{memory.title[lang]}</strong></div>
  </div>;
}

export default function Home() {
  const [lang, setLang] = useState<Lang>("pt");
  const [phase, setPhase] = useState<"intro" | "game" | "quick">("intro");
  const [sound, setSound] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [hasSave, setHasSave] = useState(false);
  const [pos, setPos] = useState(START_POS);
  const [direction, setDirection] = useState<Direction>("down");
  const [moving, setMoving] = useState(false);
  const [running, setRunning] = useState(false);
  const [walkFrame, setWalkFrame] = useState(0);
  const [viewport, setViewport] = useState({ width: 1280, height: 720 });
  const [explored, setExplored] = useState<string[]>([fogKey(START_POS.x, START_POS.y)]);
  const [mapOpen, setMapOpen] = useState(false);
  const [unlocked, setUnlocked] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [hidden, setHidden] = useState<string[]>([]);
  const [order, setOrder] = useState(memories.map((m) => m.id));
  const [openMemory, setOpenMemory] = useState<Memory | null>(null);
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [jaoUnlocked, setJaoUnlocked] = useState(false);
  const [spokenNpcs, setSpokenNpcs] = useState<NpcId[]>([]);
  const [bossDefeated, setBossDefeated] = useState(false);
  const [collectedPoems, setCollectedPoems] = useState<string[]>([]);
  const [openDialogue, setOpenDialogue] = useState<NpcId | null>(null);
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [battleOpen, setBattleOpen] = useState(false);
  const [bossHp, setBossHp] = useState(100);
  const [playerHp, setPlayerHp] = useState(100);
  const [battleRound, setBattleRound] = useState(0);
  const [computerOpen, setComputerOpen] = useState(false);
  const [openPoem, setOpenPoem] = useState<Poem | null>(null);
  const [toast, setToast] = useState("");
  const mapRef = useRef<HTMLDivElement>(null);
  const pressedKeys = useRef(new Set<string>());
  const hydrated = useRef(false);
  const t = ui[lang];

  const ping = useCallback(() => {
    if (!sound || typeof window === "undefined") return;
    const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(520, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.18);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    oscillator.connect(gain).connect(ctx.destination);
    oscillator.onended = () => { void ctx.close(); };
    oscillator.start(); oscillator.stop(ctx.currentTime + 0.26);
  }, [sound]);

  useEffect(() => {
    document.documentElement.lang = lang === "pt" ? "pt-BR" : lang;
  }, [lang]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const raw = localStorage.getItem("dry-portfolio-save-v3") || localStorage.getItem("dry-portfolio-save-v2");
        if (raw) {
          const saved = JSON.parse(raw);
          const memoryIds = new Set(memories.map((memory) => memory.id));
          const savedIds = (value: unknown) => Array.isArray(value)
            ? value.filter((item: unknown): item is string => typeof item === "string" && memoryIds.has(item))
            : [];
          setHasSave(true);
          setLang(saved.lang === "en" || saved.lang === "es" ? saved.lang : "pt");
          setSound(Boolean(saved.sound));
          setReducedMotion(Boolean(saved.reducedMotion));
          const savedPosition = saved.pos && typeof saved.pos.x === "number" && typeof saved.pos.y === "number" &&
            Number.isFinite(saved.pos.x) && Number.isFinite(saved.pos.y) &&
            isWalkable(saved.pos, Boolean(saved.bossDefeated)) ? saved.pos : START_POS;
          setPos(savedPosition);
          setUnlocked(savedIds(saved.unlocked));
          setFavorites(savedIds(saved.favorites));
          setHidden(savedIds(saved.hidden));
          setOrder(Array.from(new Set([...savedIds(saved.order), ...memories.map((memory) => memory.id)])));
          const savedCells = Array.isArray(saved.explored) ? saved.explored : [fogKey(START_POS.x, START_POS.y)];
          setExplored(savedCells.filter((cell: unknown): cell is string => {
            if (typeof cell !== "string") return false;
            const [col, row] = cell.split(":").map(Number);
            return Number.isInteger(col) && Number.isInteger(row) && col >= 0 && col < FOG_COLS && row >= 0 && row < FOG_ROWS;
          }));
          setJaoUnlocked(Boolean(saved.jaoUnlocked));
          setSpokenNpcs(Array.isArray(saved.spokenNpcs)
            ? saved.spokenNpcs.filter((id: unknown): id is NpcId => typeof id === "string" && NPCS.some((npc) => npc.id === id))
            : []);
          setBossDefeated(Boolean(saved.bossDefeated));
          setCollectedPoems(Array.isArray(saved.collectedPoems)
            ? saved.collectedPoems.filter((id: unknown): id is string => typeof id === "string" && POEMS.some((poem) => poem.id === id))
            : []);
        } else {
          setReducedMotion(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false);
        }
        const shared = new URLSearchParams(location.search).get("mem");
        if (shared) { const ids = shared.split(",").filter((id) => memories.some((m) => m.id === id)); setUnlocked(ids); setFavorites(ids); }
      } catch { /* a corrupted save simply starts fresh */ }
      hydrated.current = true;
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    const timeout = window.setTimeout(() => {
      try {
        localStorage.setItem("dry-portfolio-save-v3", JSON.stringify({ lang, sound, reducedMotion, pos, unlocked, favorites, hidden, order, explored, jaoUnlocked, spokenNpcs, bossDefeated, collectedPoems }));
      } catch {
        // Browsers can block local storage or exhaust its quota; gameplay remains usable.
      }
    }, 220);
    return () => window.clearTimeout(timeout);
  }, [lang, sound, reducedMotion, pos, unlocked, favorites, hidden, order, explored, jaoUnlocked, spokenNpcs, bossDefeated, collectedPoems]);

  const reveal = useCallback((memory: Memory) => {
    setUnlocked((items) => items.includes(memory.id) ? items : [...items, memory.id]);
    setOpenMemory(memory); setToast(`${memory.year} • ${memory.title[lang]}`); ping();
    window.setTimeout(() => setToast(""), 2200);
  }, [lang, ping]);

  const nearest = useMemo(() => WORLD_MEMORIES
    .map((m) => ({ m, d: Math.hypot(m.x - pos.x, m.y - pos.y) }))
    .sort((a, b) => a.d - b.d)[0], [pos]);
  const nearestNpc = useMemo(() => NPCS
    .filter((npc) => !(npc.id === "python" && bossDefeated))
    .map((npc) => ({ npc, d: Math.hypot(npc.x - pos.x, npc.y - pos.y) }))
    .sort((a, b) => a.d - b.d)[0], [bossDefeated, pos]);
  const nearestPoem = useMemo(() => bossDefeated ? POEMS
    .filter((poem) => !collectedPoems.includes(poem.id))
    .map((poem) => ({ poem, d: Math.hypot(poem.x - pos.x, poem.y - pos.y) }))
    .sort((a, b) => a.d - b.d)[0] : undefined, [bossDefeated, collectedPoems, pos]);
  const nearComputer = Math.hypot(pos.x - COMPUTER.x, pos.y - COMPUTER.y) < 92;
  const interactionRef = useRef<() => void>(() => undefined);

  const interact = useCallback(() => {
    if (nearestPoem && nearestPoem.d < 68) {
      setCollectedPoems((items) => items.includes(nearestPoem.poem.id) ? items : [...items, nearestPoem.poem.id]);
      setOpenPoem(nearestPoem.poem);
      ping();
      return;
    }
    if (nearestNpc && nearestNpc.d < 92) {
      setOpenDialogue(nearestNpc.npc.id);
      setDialogueIndex(0);
      return;
    }
    if (nearComputer) {
      setComputerOpen(true);
      return;
    }
    if (nearest && nearest.d < 145) reveal(nearest.m);
  }, [nearestPoem, nearestNpc, nearComputer, nearest, ping, reveal]);

  useEffect(() => { interactionRef.current = interact; }, [interact]);

  useEffect(() => {
    const updateViewport = () => {
      const rect = mapRef.current?.getBoundingClientRect();
      if (rect) setViewport({ width: rect.width, height: rect.height });
    };
    updateViewport(); window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, [phase]);

  useEffect(() => {
    const [col, row] = fogKey(pos.x, pos.y).split(":").map(Number);
    const nearbyCells: string[] = [];
    for (let y = -1; y <= 1; y += 1) for (let x = -1; x <= 1; x += 1) {
      if (Math.abs(x) + Math.abs(y) > 1) continue;
      const nextCol = col + x; const nextRow = row + y;
      if (nextCol >= 0 && nextRow >= 0 && nextCol < FOG_COLS && nextRow < FOG_ROWS) nearbyCells.push(`${nextCol}:${nextRow}`);
    }
    const frame = requestAnimationFrame(() => setExplored((items) => nearbyCells.every((cell) => items.includes(cell)) ? items : Array.from(new Set([...items, ...nearbyCells]))));
    return () => cancelAnimationFrame(frame);
  }, [pos]);

  useEffect(() => {
    if (phase !== "game" || openMemory || inventoryOpen || mapOpen || openDialogue || battleOpen || computerOpen || openPoem) return;
    const keysForEffect = pressedKeys.current;
    const arrowKeys: Record<string, string> = { arrowup: "w", arrowleft: "a", arrowdown: "s", arrowright: "d" };
    const movementKey = (key: string) => arrowKeys[key] ?? key;
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const mappedKey = movementKey(key);
      if (["w", "a", "s", "d"].includes(mappedKey)) { event.preventDefault(); keysForEffect.add(mappedKey); }
      if (key === "shift") { event.preventDefault(); keysForEffect.add(key); }
      if ((key === "e" || key === "enter") && !event.repeat) {
        if (key === "enter" && event.target instanceof HTMLElement && event.target.closest("button, a, input, select, textarea")) return;
        event.preventDefault(); interactionRef.current();
      }
      if (key === "m") { event.preventDefault(); setMapOpen(true); }
    };
    const onKeyUp = (event: KeyboardEvent) => keysForEffect.delete(movementKey(event.key.toLowerCase()));
    const onWindowBlur = () => keysForEffect.clear();
    window.addEventListener("keydown", onKeyDown); window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onWindowBlur);
    let frameId = 0; let previous = performance.now();
    const animate = (now: number) => {
      const delta = Math.min((now - previous) / 1000, 0.035); previous = now;
      const keys = keysForEffect;
      let dx = (keys.has("d") ? 1 : 0) - (keys.has("a") ? 1 : 0);
      let dy = (keys.has("s") ? 1 : 0) - (keys.has("w") ? 1 : 0);
      const active = dx !== 0 || dy !== 0;
      const sprinting = active && keys.has("shift");
      if (active) {
        const length = Math.hypot(dx, dy); dx /= length; dy /= length;
        if (Math.abs(dx) > Math.abs(dy)) setDirection(dx > 0 ? "right" : "left"); else setDirection(dy > 0 ? "down" : "up");
        setWalkFrame(Math.floor(now / (sprinting ? 88 : 180)) % 3);
        setPos((current) => {
          const step = WALK_SPEED * (sprinting ? 2 : 1) * delta;
          let next = current;
          const nextX = { x: current.x + dx * step, y: current.y };
          if (isWalkable(nextX, bossDefeated)) next = nextX;
          const nextY = { x: next.x, y: current.y + dy * step };
          if (isWalkable(nextY, bossDefeated)) next = { x: next.x, y: nextY.y };
          return next;
        });
      } else setWalkFrame(0);
      setMoving(active); setRunning(sprinting); frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onWindowBlur);
      keysForEffect.clear(); cancelAnimationFrame(frameId); setMoving(false); setRunning(false);
    };
  }, [phase, openMemory, inventoryOpen, mapOpen, openDialogue, battleOpen, computerOpen, openPoem, bossDefeated]);

  const resetGame = () => {
    setPos(START_POS); setExplored([fogKey(START_POS.x, START_POS.y)]); setUnlocked([]); setFavorites([]); setHidden([]); setOrder(memories.map((m) => m.id)); setJaoUnlocked(false);
    setSpokenNpcs([]); setBossDefeated(false); setCollectedPoems([]); setBossHp(100); setPlayerHp(100); setBattleRound(0);
    try {
      localStorage.removeItem("dry-portfolio-save-v2");
      localStorage.removeItem("dry-portfolio-save-v3");
    } catch {
      // A blocked storage API must not prevent the player from starting over.
    }
    setHasSave(false); setPhase("game");
  };

  const movePlayer = (dx: number, dy: number, nextDirection: Direction) => {
    setDirection(nextDirection); setMoving(true); setWalkFrame((value) => (value + 1) % 3);
    setPos((current) => { const next = { x: current.x + dx, y: current.y + dy }; return isWalkable(next, bossDefeated) ? next : current; });
    window.setTimeout(() => setMoving(false), 140);
  };

  const startTouchMovement = (event: React.PointerEvent<HTMLButtonElement>, key: string) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    pressedKeys.current.add(key);
  };

  const stopTouchMovement = (event: React.PointerEvent<HTMLButtonElement>, key: string) => {
    pressedKeys.current.delete(key);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const cameraX = Math.round(clamp(pos.x - viewport.width * 0.38, 0, Math.max(0, WORLD.width - viewport.width)));
  const cameraY = Math.round(clamp(pos.y - viewport.height * 0.57, 0, Math.max(0, WORLD.height - viewport.height)));
  const directionRow: Record<Direction, number> = { down: 0, left: 1, right: 2, up: 3 };
  const playerSprite: React.CSSProperties = {
    backgroundPosition: `${(moving ? walkFrame : 0) * 50}% ${directionRow[direction] * 33.333}%`,
  };
  const ageStage: CastId = unlocked.includes("etec") ? "dry" : unlocked.includes("joaquim") ? "teen" : unlocked.includes("origins") ? "child" : "baby";
  const questTitle = bossDefeated
    ? collectedPoems.length === POEMS.length
      ? (lang === "en" ? "Every verse recovered" : lang === "es" ? "Todos los versos recuperados" : "Todos os versos recuperados")
      : (lang === "en" ? "Recover forgotten poems" : lang === "es" ? "Recupera los poemas olvidados" : "Recupere os poemas perdidos")
    : spokenNpcs.includes("nilo")
      ? (lang === "en" ? "Find and defeat Python" : lang === "es" ? "Encuentra y derrota a Python" : "Encontre e derrote Python")
      : t.missionName;

  const orderedMemories = order.map((id) => memories.find((m) => m.id === id)).filter(Boolean) as Memory[];
  const selectedForPrint = orderedMemories.filter((m) => unlocked.includes(m.id) && !hidden.includes(m.id));
  const reorder = (id: string, dir: -1 | 1) => setOrder((items) => {
    const next = [...items]; const at = next.indexOf(id); const target = clamp(at + dir, 0, next.length - 1);
    [next[at], next[target]] = [next[target], next[at]]; return next;
  });
  const toggle = (id: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => setter((items) => items.includes(id) ? items.filter((x) => x !== id) : [...items, id]);
  const revealAll = () => { setUnlocked(memories.map((m) => m.id)); setToast(t.all); ping(); window.setTimeout(() => setToast(""), 1800); };
  const share = async () => {
    const ids = selectedForPrint.map((m) => m.id);
    const url = `${location.origin}${location.pathname}?mem=${ids.join(",")}`;
    try {
      if (navigator.share) await navigator.share({ title: "DRY // Portfolio", text: "Meu recorte da jornada de Adryel Luís Rodrigues", url });
      else {
        await navigator.clipboard.writeText(url);
        setToast(lang === "en" ? "Link copied!" : lang === "es" ? "¡Enlace copiado!" : "Link copiado!");
        window.setTimeout(() => setToast(""), 2200);
      }
    } catch { /* share dismissed */ }
  };

  const advanceDialogue = () => {
    if (!openDialogue) return;
    if (dialogueIndex < DIALOGUES[openDialogue].length - 1) {
      setDialogueIndex((value) => value + 1);
      return;
    }
    const finishedNpc = openDialogue;
    setSpokenNpcs((items) => items.includes(finishedNpc) ? items : [...items, finishedNpc]);
    setOpenDialogue(null);
    setDialogueIndex(0);
    if (finishedNpc === "python" && !bossDefeated) {
      setBossHp(100); setPlayerHp(100); setBattleRound(0); setBattleOpen(true);
    }
    if (finishedNpc === "jao" && !jaoUnlocked) {
      const copy = posthumousText[lang];
      setJaoUnlocked(true);
      setToast(`${copy.unlocked} • ${copy.title}`);
      ping();
      window.setTimeout(() => setToast(""), 3600);
    }
  };

  const battleAction = (move: "inspect" | "fix" | "run") => {
    const expected = battleRound === 0 ? "inspect" : battleRound === 1 ? "fix" : "run";
    const damage = move === expected ? (move === "run" ? 44 : 32) : 15;
    const nextBossHp = Math.max(0, bossHp - damage);
    setBossHp(nextBossHp);
    if (nextBossHp === 0) {
      setBossDefeated(true);
      setBattleOpen(false);
      setToast(lang === "en" ? "PYTHON DEFEATED • Forgotten poems appeared across the map" : lang === "es" ? "PYTHON DERROTADO • Aparecieron poemas por el mapa" : "PYTHON DERROTADO • Os poemas apareceram pelo mapa");
      ping();
      window.setTimeout(() => setToast(""), 4600);
      return;
    }
    const nextPlayerHp = Math.max(0, playerHp - (move === expected ? 11 : 23));
    if (nextPlayerHp === 0) {
      setPlayerHp(100); setBossHp(100); setBattleRound(0);
      setToast(lang === "en" ? "Try again: inspect, correct, execute." : "Tente novamente: observar, corrigir, executar.");
      window.setTimeout(() => setToast(""), 2400);
      return;
    }
    setPlayerHp(nextPlayerHp);
    setBattleRound((value) => value + 1);
  };

  useEffect(() => {
    if (!openMemory && !inventoryOpen && !mapOpen && !openDialogue && !battleOpen && !computerOpen && !openPoem) return;

    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const focusableSelector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const getDialog = () => {
      const dialogs = document.querySelectorAll<HTMLElement>('[role="dialog"][aria-modal="true"]');
      return dialogs[dialogs.length - 1] ?? null;
    };

    const frame = window.requestAnimationFrame(() => {
      const dialog = getDialog();
      const preferredFocus = dialog?.querySelector<HTMLElement>(".story-next, .battle-actions .suggested");
      (preferredFocus ?? dialog?.querySelector<HTMLElement>(focusableSelector))?.focus();
    });

    const handleDialogKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        if (openPoem) setOpenPoem(null);
        else if (mapOpen) setMapOpen(false);
        else if (computerOpen) setComputerOpen(false);
        else if (battleOpen) setBattleOpen(false);
        else if (openDialogue) { setOpenDialogue(null); setDialogueIndex(0); }
        else if (openMemory) setOpenMemory(null);
        else if (inventoryOpen) setInventoryOpen(false);
        return;
      }

      if (event.key !== "Tab") return;
      const focusable = Array.from(getDialog()?.querySelectorAll<HTMLElement>(focusableSelector) ?? []);
      if (!focusable.length) { event.preventDefault(); return; }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };

    window.addEventListener("keydown", handleDialogKey);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("keydown", handleDialogKey);
      if (previousFocus && document.contains(previousFocus)) previousFocus.focus();
    };
  }, [openMemory, inventoryOpen, mapOpen, openDialogue, battleOpen, computerOpen, openPoem]);

  if (phase === "intro") return (
    <main className={`intro ${reducedMotion ? "reduced" : ""}`}>
      <div className="intro-stars" aria-hidden="true" />
      <nav className="intro-nav" aria-label={lang === "en" ? "Language" : "Idioma"}>
        <div className="brand"><span className="brand-rune">D</span><span>DRY</span></div>
        <div className="language-switch">{(["pt", "en", "es"] as Lang[]).map((code) => <button key={code} className={lang === code ? "active" : ""} aria-pressed={lang === code} aria-label={code === "pt" ? "Português" : code === "en" ? "English" : "Español"} onClick={() => setLang(code)}>{code.toUpperCase()}</button>)}</div>
      </nav>
      <section className="intro-card">
        <p className="kicker">{t.eyebrow}</p>
        <h1><span>ADRYEL LUÍS</span><strong>RODRIGUES</strong></h1>
        <p className="intro-copy"><i>{lang === "en" ? "“Curious.”" : "“Curioso.”"}</i> {t.intro}</p>
        <div className="intro-actions">
          {hasSave && <button className="primary" onClick={() => setPhase("game")}><span>▶</span>{t.resume}</button>}
          <button className={hasSave ? "secondary" : "primary"} onClick={hasSave ? resetGame : () => setPhase("game")}><span>{hasSave ? "↻" : "▶"}</span>{hasSave ? t.restart : t.start}</button>
          <button className="ghost" onClick={() => setPhase("quick")}><span>▤</span>{t.quick}</button>
        </div>
        <div className="intro-preferences">
          <label><input type="checkbox" checked={sound} onChange={(e) => setSound(e.target.checked)} /><span className="switch" />{t.sound}</label>
          <label><input type="checkbox" checked={reducedMotion} onChange={(e) => setReducedMotion(e.target.checked)} /><span className="switch" />{t.motion}</label>
        </div>
        <p className="save-note">◇ {t.saveNote}</p>
      </section>
      <div className="intro-world" aria-hidden="true"><span className="castle">♜</span><span className="dry-mini" /></div>
    </main>
  );

  if (phase === "quick") return <QuickPortfolio lang={lang} setLang={setLang} onJourney={() => setPhase("game")} t={t} jaoUnlocked={jaoUnlocked} reducedMotion={reducedMotion} />;

  return (
    <main className={`game-shell ${reducedMotion ? "reduced" : ""}`}>
      <header className="game-hud">
        <div className="quest-box"><span className="quest-gem"><HudIcon name={bossDefeated ? "paper" : "memory"} /></span><div><small>{t.mission}</small><strong>{questTitle}</strong><em>{bossDefeated ? `${collectedPoems.length}/${POEMS.length} ${lang === "en" ? "poems recovered" : lang === "es" ? "poemas recuperados" : "poemas recuperados"}` : `${unlocked.length}/${memories.length} ${t.discovered}`}</em></div></div>
        <div className="hud-actions">
          <button onClick={() => setPhase("quick")} aria-label={t.portfolio}><HudIcon name="portfolio" /> <span>{t.portfolio}</span></button>
          <button onClick={() => setMapOpen(true)} aria-label={t.openMap}><HudIcon name="map" /> <span>{t.openMap}</span></button>
          <button onClick={() => setInventoryOpen(true)} aria-label={t.inventory}><HudIcon name="memory" /> <span>{t.inventory}</span><b>{unlocked.length}</b></button>
          <button onClick={() => setComputerOpen(true)} aria-label={lang === "en" ? "Memory archive" : lang === "es" ? "Banco de recuerdos" : "Banco de memórias"}><HudIcon name="computer" /><span>PC</span></button>
          <button onClick={() => setSound((v) => !v)} aria-label={t.sound} aria-pressed={sound}><HudIcon name={sound ? "sound" : "muted"} /></button>
          <div className="language-switch compact">{(["pt", "en", "es"] as Lang[]).map((code) => <button key={code} className={lang === code ? "active" : ""} aria-pressed={lang === code} aria-label={code === "pt" ? "Português" : code === "en" ? "English" : "Español"} onClick={() => setLang(code)}>{code.toUpperCase()}</button>)}</div>
        </div>
      </header>

      <section className="map-wrap" aria-label="Mapa explorável">
        <div className="map-stage" ref={mapRef}>
          <div className="map-world" style={{ width: WORLD.width, height: WORLD.height, transform: `translate3d(${-cameraX}px, ${-cameraY}px, 0)` }}>
            <img className="world-base-asset" src="/world/terrain/world-base.png" alt="" aria-hidden="true" decoding="async" fetchPriority="high" />
            <div className="river-water" style={{ left: RIVER.x, top: RIVER.y, width: RIVER.width, height: RIVER.height }} aria-hidden="true"><span className="river-lily river-lily-one" /><span className="river-lily river-lily-two" /></div>
            {PATH_ZONES.filter((zone) => zone.id !== "main").map((zone) => <div key={zone.id} className={`branch-path branch-${zone.id}`} style={{ left: zone.x, top: zone.y, width: zone.width, height: zone.height }} aria-hidden="true" />)}
            {LANDMARKS.map((landmark) => <div key={`door-${landmark.id}`} className="building-door-path" style={{ left: landmark.x - 28 }} aria-hidden="true" />)}
            <div className="single-wooden-bridge" style={{ left: BRIDGE.x, top: BRIDGE.y, width: BRIDGE.width, height: BRIDGE.height }} aria-label="Ponte do caminho das artes" />
            <div className="path-arrow start-arrow">INÍCIO <span>→</span></div>
            <div className="path-arrow end-arrow"><span>→</span> PRÓXIMA MISSÃO</div>
            {SCENERY.map((item, index) => <div key={`${item.x}-${item.y}-${index}`} className={`scenery scenery-${item.kind}`} style={{ left: item.x, top: item.y - 220, width: item.width, zIndex: Math.round(item.y - 220) }} aria-hidden="true">
              <img src={`/world/scenery/${item.kind}.png`} alt="" decoding="async" />
              {item.label && <span>{item.label}</span>}
            </div>)}
            {LANDMARKS.map((landmark) => {
              const memory = WORLD_MEMORIES.find((item) => item.id === landmark.memoryId)!;
              return <PixelLandmark key={landmark.id} landmark={landmark} memory={memory} lang={lang} />;
            })}
            {WORLD_MEMORIES.map((memory) => (
              <div key={memory.id} className={`hotspot ${unlocked.includes(memory.id) ? "found" : ""}`} style={{ left: memory.x, top: memory.y, zIndex: PATH_TOP + 20 }} aria-label={`${memory.title[lang]}`}>
                <span className="hotspot-ring" /><span className="hotspot-icon icon-sprite" style={spriteStyle(memory.assetIndex)}><i>{memory.icon}</i></span>
              </div>
            ))}
            {!bossDefeated && <div className="python-barrier" style={{ left: 3478, top: PATH_TOP + 8, height: PATH_BOTTOM - PATH_TOP - 16 }} aria-hidden="true" />}
            {NPCS.map((npc) => <NpcSprite key={npc.id} id={npc.id} x={npc.x} y={npc.y} defeated={npc.id === "python" && bossDefeated} />)}
            {bossDefeated && POEMS.filter((poem) => !collectedPoems.includes(poem.id)).map((poem) => <div key={poem.id} className="world-poem-paper" style={{ left: poem.x, top: poem.y, zIndex: Math.round(poem.y) }} aria-label={poem.title[lang]}><HudIcon name="paper" /><span /></div>)}
            <div className="world-computer" style={{ left: COMPUTER.x, top: COMPUTER.y, zIndex: Math.round(COMPUTER.y) }} aria-label="Banco de memórias"><HudIcon name="computer" /><span>ARQUIVO</span></div>
            <div className={`player age-${ageStage} facing-${direction} ${moving ? "is-moving" : ""} ${running ? "is-running" : ""}`} style={{ left: pos.x, top: pos.y, zIndex: Math.round(pos.y) }} aria-label="Dry"><span className="player-shadow" /><span className="player-sprite" style={playerSprite} /><b>DRY</b></div>
          </div>
          <div className="map-vignette" />
          {(nearest?.d < 145 || (nearestNpc && nearestNpc.d < 92) || (nearestPoem && nearestPoem.d < 68) || nearComputer) && <button className="nearby" onClick={interact}>E <span>{nearestPoem && nearestPoem.d < 68 ? (lang === "en" ? "Collect poem" : lang === "es" ? "Recoger poema" : "Recolher poema") : nearestNpc && nearestNpc.d < 92 ? (lang === "en" ? "Talk" : lang === "es" ? "Hablar" : "Conversar") : nearComputer ? (lang === "en" ? "Open archive" : lang === "es" ? "Abrir archivo" : "Abrir arquivo") : t.interact}</span></button>}
        </div>
        <div className="map-caption"><button onClick={() => setMapOpen(true)}><HudIcon name="map" /> {t.openMap}</button><span>{t.controls}</span><span>{bossDefeated ? `${collectedPoems.length}/${POEMS.length}` : `${Math.round((pos.x / WORLD.width) * 100)}%`}</span></div>
      </section>

      <div className="dpad" aria-label={lang === "en" ? "Touch controls" : lang === "es" ? "Controles táctiles" : "Controles por toque"}>
        <button className="up" aria-label={lang === "en" ? "Move up" : lang === "es" ? "Mover arriba" : "Mover para cima"} onPointerDown={(event) => startTouchMovement(event, "w")} onPointerUp={(event) => stopTouchMovement(event, "w")} onPointerCancel={(event) => stopTouchMovement(event, "w")} onClick={() => movePlayer(0, -24, "up")}>▲</button>
        <button className="left" aria-label={lang === "en" ? "Move left" : lang === "es" ? "Mover a la izquierda" : "Mover para a esquerda"} onPointerDown={(event) => startTouchMovement(event, "a")} onPointerUp={(event) => stopTouchMovement(event, "a")} onPointerCancel={(event) => stopTouchMovement(event, "a")} onClick={() => movePlayer(-24, 0, "left")}>◀</button>
        <button className="center" aria-label={t.interact} onClick={interact}>E</button>
        <button className="right" aria-label={lang === "en" ? "Move right" : lang === "es" ? "Mover a la derecha" : "Mover para a direita"} onPointerDown={(event) => startTouchMovement(event, "d")} onPointerUp={(event) => stopTouchMovement(event, "d")} onPointerCancel={(event) => stopTouchMovement(event, "d")} onClick={() => movePlayer(24, 0, "right")}>▶</button>
        <button className="down" aria-label={lang === "en" ? "Move down" : lang === "es" ? "Mover abajo" : "Mover para baixo"} onPointerDown={(event) => startTouchMovement(event, "s")} onPointerUp={(event) => stopTouchMovement(event, "s")} onPointerCancel={(event) => stopTouchMovement(event, "s")} onClick={() => movePlayer(0, 24, "down")}>▼</button>
      </div>

      {openMemory && <MemoryModal memory={openMemory} lang={lang} age={ageStage} unlocked={unlocked.includes(openMemory.id)} onClose={() => setOpenMemory(null)} onFavorite={() => toggle(openMemory.id, setFavorites)} favorite={favorites.includes(openMemory.id)} t={t} />}
      {inventoryOpen && <Inventory lang={lang} t={t} memories={orderedMemories} unlocked={unlocked} favorites={favorites} hidden={hidden} jaoUnlocked={jaoUnlocked} onClose={() => setInventoryOpen(false)} onOpen={(memory) => { setInventoryOpen(false); reveal(memory); }} onFavorite={(id) => toggle(id, setFavorites)} onHide={(id) => toggle(id, setHidden)} onMove={reorder} onPrint={() => window.print()} onShare={share} onRevealAll={revealAll} />}
      {mapOpen && <WorldMap lang={lang} t={t} explored={explored} pos={pos} unlocked={unlocked} bossDefeated={bossDefeated} collectedPoems={collectedPoems} onClose={() => setMapOpen(false)} />}
      {openDialogue && <DialogueModal npc={openDialogue} lang={lang} index={dialogueIndex} onAdvance={advanceDialogue} onClose={() => { setOpenDialogue(null); setDialogueIndex(0); }} />}
      {battleOpen && <BattleModal lang={lang} hp={bossHp} playerHp={playerHp} round={battleRound} onAction={battleAction} onClose={() => setBattleOpen(false)} />}
      {computerOpen && <ComputerModal lang={lang} poems={POEMS} collected={collectedPoems} jaoUnlocked={jaoUnlocked} bossDefeated={bossDefeated} onRead={(poem) => { setComputerOpen(false); setOpenPoem(poem); }} onClose={() => setComputerOpen(false)} />}
      {openPoem && <PoemModal poem={openPoem} lang={lang} onClose={() => setOpenPoem(null)} />}
      {toast && <div className="toast" role="status" aria-live="polite">✦ {toast}</div>}

      <PrintSheet lang={lang} items={selectedForPrint} />
    </main>
  );
}

function WorldMap({ lang, t, explored, pos, unlocked, bossDefeated, collectedPoems, onClose }: { lang: Lang; t: Record<string, string>; explored: string[]; pos: { x: number; y: number }; unlocked: string[]; bossDefeated: boolean; collectedPoems: string[]; onClose: () => void }) {
  const cells = Array.from({ length: FOG_COLS * FOG_ROWS }, (_, index) => {
    const col = index % FOG_COLS; const row = Math.floor(index / FOG_COLS);
    return { id: `${col}:${row}`, col, row };
  });
  return <div className="modal-backdrop map-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="world-map-title" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <article className="world-map-modal">
      <header><div><small>DRY // WORLD MAP</small><h2 id="world-map-title">{t.mapTitle}</h2></div><button onClick={onClose} aria-label={t.close}>×</button></header>
      <div className="global-map-canvas" aria-label={t.mapHint}>
        <span className="global-road" />
        {PATH_ZONES.filter((zone) => zone.id !== "main").map((zone) => <span key={zone.id} className="global-branch" style={{ left: `${zone.x / WORLD.width * 100}%`, top: `${zone.y / WORLD.height * 100}%`, width: `${zone.width / WORLD.width * 100}%`, height: `${zone.height / WORLD.height * 100}%` }} />)}
        <span className="global-river" style={{ left: `${RIVER.x / WORLD.width * 100}%`, top: `${RIVER.y / WORLD.height * 100}%`, width: `${RIVER.width / WORLD.width * 100}%`, height: `${RIVER.height / WORLD.height * 100}%` }} />
        <span className="global-bridge" style={{ left: `${BRIDGE.x / WORLD.width * 100}%`, top: `${BRIDGE.y / WORLD.height * 100}%`, width: `${BRIDGE.width / WORLD.width * 100}%`, height: `${BRIDGE.height / WORLD.height * 100}%` }} />
        {LANDMARKS.map((landmark, index) => <span key={landmark.id} className="global-stop" style={{ left: `${(landmark.x / WORLD.width) * 100}%` }}><i>{index + 1}</i></span>)}
        <div className="fog-grid" aria-hidden="true">{cells.map((cell) => <span key={cell.id} className={explored.includes(cell.id) ? "explored" : ""} />)}</div>
        {WORLD_MEMORIES.map((memory) => {
          const visible = explored.includes(fogKey(memory.x, memory.y));
          return visible ? <span key={memory.id} className={`global-marker ${unlocked.includes(memory.id) ? "found" : ""}`} style={{ left: `${(memory.x / WORLD.width) * 100}%`, top: `${memory.y / WORLD.height * 100}%` }} title={memory.title[lang]} /> : null;
        })}
        {bossDefeated && POEMS.filter((poem) => !collectedPoems.includes(poem.id) && explored.includes(fogKey(poem.x, poem.y))).map((poem) => <span key={poem.id} className="global-poem-marker" style={{ left: `${poem.x / WORLD.width * 100}%`, top: `${poem.y / WORLD.height * 100}%` }} title={poem.title[lang]} />)}
        <span className="global-player" style={{ left: `${(pos.x / WORLD.width) * 100}%`, top: `${pos.y / WORLD.height * 100}%` }}><i>DRY</i></span>
      </div>
      <p>◐ {t.mapHint}</p>
    </article>
  </div>;
}

function MemoryModal({ memory, lang, age, onClose, onFavorite, favorite, t }: { memory: Memory; lang: Lang; age: CastId; unlocked: boolean; onClose: () => void; onFavorite: () => void; favorite: boolean; t: Record<string, string> }) {
  const landmark = LANDMARKS.find((item) => item.memoryId === memory.id);
  return <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="memory-title" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
    <article className="memory-modal enhanced-memory-modal">
      <button className="modal-close" onClick={onClose} aria-label={t.close}>×</button>
      <SceneStage structure={landmark?.id} cast={age} />
      <div className="memory-scene-bottom"><Portrait cast={age} /><div className="memory-scene-copy"><div className="memory-year">MEMORY // {memory.id === "future" ? t.current : memory.year}</div><p className="memory-category">{memory.category.toUpperCase()}</p><h2 id="memory-title">{memory.title[lang]}</h2><h3>{memory.subtitle[lang]}</h3><p>{memory.body[lang]}</p><div className="modal-actions"><button className={favorite ? "fav active" : "fav"} onClick={onFavorite} aria-pressed={favorite}>★ {t.favorite}</button>{memory.link && <a href={memory.link} target="_blank" rel="noopener noreferrer">↗ {memory.linkLabel}</a>}</div></div></div>
    </article>
  </div>;
}

function Inventory({ lang, t, memories, unlocked, favorites, hidden, jaoUnlocked, onClose, onOpen, onFavorite, onHide, onMove, onPrint, onShare, onRevealAll }: { lang: Lang; t: Record<string, string>; memories: Memory[]; unlocked: string[]; favorites: string[]; hidden: string[]; jaoUnlocked: boolean; onClose: () => void; onOpen: (m: Memory) => void; onFavorite: (id: string) => void; onHide: (id: string) => void; onMove: (id: string, d: -1 | 1) => void; onPrint: () => void; onShare: () => void; onRevealAll: () => void }) {
  return <div className="inventory-backdrop" role="dialog" aria-modal="true" aria-labelledby="inventory-title" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><aside className="inventory-panel">
    <header><div><small>PORTFOLIO BUILDER</small><h2 id="inventory-title">{t.inventory}</h2><p>{unlocked.length}/{memories.length} {t.discovered}</p></div><button onClick={onClose} aria-label={t.close}>×</button></header>
    <div className="inventory-list">
      {jaoUnlocked && <article className="achievement-row"><span className="achievement-token">♫</span><span><small>{posthumousText[lang].unlocked}</small><strong>{posthumousText[lang].title}</strong><em>{posthumousText[lang].badge}</em></span></article>}
      {memories.map((m, index) => unlocked.includes(m.id) ? <article key={m.id} className={hidden.includes(m.id) ? "memory-row is-hidden" : "memory-row"}>
        <button className="row-main" onClick={() => onOpen(m)}><span className="row-icon" style={spriteStyle(m.assetIndex)}><i>{m.icon}</i></span><span><small>{m.year}</small><strong>{m.title[lang]}</strong></span></button>
        <div className="row-tools"><button className={favorites.includes(m.id) ? "active" : ""} onClick={() => onFavorite(m.id)} title={t.favorite} aria-label={t.favorite} aria-pressed={favorites.includes(m.id)}>★</button><button onClick={() => onHide(m.id)} title={hidden.includes(m.id) ? t.show : t.hide} aria-label={hidden.includes(m.id) ? t.show : t.hide} aria-pressed={hidden.includes(m.id)}>{hidden.includes(m.id) ? "◉" : "⊘"}</button><button onClick={() => onMove(m.id, -1)} disabled={index === 0} title={t.up} aria-label={t.up}>↑</button><button onClick={() => onMove(m.id, 1)} disabled={index === memories.length - 1} title={t.down} aria-label={t.down}>↓</button></div>
      </article> : <article key={m.id} className="memory-row locked-row"><span className="row-icon">?</span><span><small>????</small><strong>{lang === "en" ? "Undiscovered memory" : lang === "es" ? "Memoria no descubierta" : "Memória não descoberta"}</strong></span></article>)}
    </div>
    <footer><button className="subtle" onClick={onRevealAll}>{t.all}</button><button className="subtle" onClick={onShare}>↗ {t.share}</button><button className="primary small" onClick={onPrint}>▤ {t.print}</button></footer>
  </aside></div>;
}

function QuickPortfolio({ lang, setLang, onJourney, t, jaoUnlocked, reducedMotion }: { lang: Lang; setLang: (l: Lang) => void; onJourney: () => void; t: Record<string, string>; jaoUnlocked: boolean; reducedMotion: boolean }) {
  const qt = quickText[lang];
  return <main className={`quick-page ${reducedMotion ? "reduced" : ""}`}>
    <nav className="quick-nav" aria-label={lang === "en" ? "Main navigation" : lang === "es" ? "Navegación principal" : "Navegação principal"}><div className="brand"><span className="brand-rune">D</span><span>ADRYEL.LUIS</span></div><div className="quick-links"><a href="#profile">{t.profile}</a><a href="#projects">{t.projects}</a><a href="#skills">{t.skills}</a><a href="#contact">{t.contact}</a></div><div className="language-switch compact">{(["pt", "en", "es"] as Lang[]).map((code) => <button key={code} className={lang === code ? "active" : ""} aria-pressed={lang === code} aria-label={code === "pt" ? "Português" : code === "en" ? "English" : "Español"} onClick={() => setLang(code)}>{code.toUpperCase()}</button>)}</div></nav>
    <section className="quick-hero" id="profile"><div><p className="kicker">{qt.kicker}</p><h1>{qt.heroTop}<br /><em>{qt.heroEm}</em></h1><p>{qt.bio}</p><div className="hero-actions"><a className="primary" href="/Curriculo_Adryel_Luis_Rodrigues.pdf" download>↓ {qt.cv}</a><a className="ghost" href="#projects">{qt.viewProjects}</a><button className="ghost" onClick={onJourney}>◈ {t.journey}</button></div></div><div className="hero-console"><div className="console-top"><span /><span /><span /><b>dry.profile</b></div><pre><i>const</i> dry = {'{'}{`\n`}  focus: <q>&quot;internship&quot;</q>,{`\n`}  areas: [<q>&quot;full stack&quot;</q>, <q>&quot;support&quot;</q>],{`\n`}  traits: [<q>&quot;curious&quot;</q>, <q>&quot;explorer&quot;</q>],{`\n`}  status: <strong>&quot;ready_to_build&quot;</strong>{`\n`}{'}'};</pre><div className="console-status"><span /> {qt.status}</div></div></section>
    <section className="quick-stats"><div><strong>2007</strong><span>{qt.stats[0]}</span></div><div><strong>4</strong><span>{qt.stats[1]}</span></div><div><strong>3</strong><span>{qt.stats[2]}</span></div><div><strong>∞</strong><span>{qt.stats[3]}</span></div></section>
    {jaoUnlocked && <aside className="quick-achievement"><span>♫</span><div><small>{posthumousText[lang].unlocked}</small><strong>{posthumousText[lang].title}</strong><p>{posthumousText[lang].body}</p></div></aside>}

    <section className="quick-section journey-section"><div className="section-heading"><span>01</span><div><p>{t.timeline}</p><h2>{qt.timelineA}<br />{qt.timelineB}</h2></div></div><div className="timeline-list">{memories.filter((m) => ["origins", "joaquim", "etec", "fatec", "future"].includes(m.id)).map((m) => <article key={m.id}><time>{m.id === "future" ? t.current : m.year}</time><div><h3>{m.title[lang]}</h3><p>{m.subtitle[lang]}</p></div></article>)}</div></section>

    <section className="quick-section projects-section" id="projects"><div className="section-heading"><span>02</span><div><p>{t.projects}</p><h2>{qt.projectsA}<br />{qt.projectsB}</h2></div></div><div className="project-grid">{projects.map((p) => <a key={p.name} href={p.href} target="_blank" rel="noopener noreferrer" className="project-card"><span className="project-number">{p.mark}</span><div className="project-orb">{p.name.slice(0, 1)}</div><p>{p.role[lang]}</p><h3>{p.name}</h3><small>{p.stack}</small><b>{qt.explore} ↗</b></a>)}</div></section>

    <section className="quick-section skills-section" id="skills"><div className="section-heading"><span>03</span><div><p>{t.skills}</p><h2>{qt.skillsA}<br />{qt.skillsB}</h2></div></div><div className="skill-columns">{Object.entries(skills).map(([level, items]) => <article key={level}><h3>{skillLevelNames[lang][level]}</h3><div>{items.map((skill) => <span key={skill}>{skillNames[lang][skill] || skill}</span>)}</div></article>)}</div><div className="languages"><b>{lang === "en" ? "LANGUAGES" : "IDIOMAS"}</b><span>Português <i>{lang === "en" ? "Fluent" : lang === "es" ? "Fluido" : "Fluente"}</i></span><span>English <i>{lang === "en" ? "Advanced" : lang === "es" ? "Avanzado" : "Avançado"}</i></span><span>Español <i>{lang === "en" ? "Basic" : "Básico"}</i></span></div></section>

    <section className="quick-section education-section"><div className="section-heading"><span>04</span><div><p>{t.education}</p><h2>{qt.educationA}<br />{qt.educationB}</h2></div></div><div className="education-grid"><article><time>2023—2025</time><h3>ETEC João Gomes de Araújo</h3><p>{qt.etec}</p><b>{qt.completed}</b></article><article><time>2026—2027</time><h3>FATEC Taubaté</h3><p>{qt.fatec}</p><b>{qt.inProgress}</b></article><article className="availability"><span className="pulse" /><h3>{qt.availabilityTitle}</h3><p>{qt.availability}</p></article></div></section>

    <section className="quick-section certificate-section"><div className="section-heading"><span>05</span><div><p>{t.certificates}</p><h2>{qt.certificatesA}<br />{qt.certificatesB}</h2></div></div><div className="locked-grid">{[1, 2, 3].map((n) => <article key={n}><span>▣</span><b>{t.locked}</b><small>SLOT {String(n).padStart(2, "0")}</small></article>)}</div></section>

    <footer className="contact-section" id="contact"><p className="kicker">{t.contact.toUpperCase()}</p><h2>{qt.contactA}<br />{qt.contactB} <em>{qt.contactEm}</em></h2><div className="contact-actions"><a className="primary" href="mailto:adryel.luis.r@gmail.com">✉ {qt.email}</a><a className="ghost" href="https://wa.me/5512987037110" target="_blank" rel="noopener noreferrer">◉ WHATSAPP</a></div><div className="contact-meta"><a href="mailto:adryel.luis.r@gmail.com">adryel.luis.r@gmail.com</a><a href="tel:+5512987037110">+55 (12) 98703-7110</a><a href="https://github.com/BatatitaX" target="_blank" rel="noopener noreferrer">GitHub ↗</a><a href="https://www.instagram.com/adryel.leo.r/" target="_blank" rel="noopener noreferrer">@adryel.leo.r ↗</a></div><small>ADRYEL LUÍS RODRIGUES • ROSEIRA, SP • 2026</small></footer>
  </main>;
}

function PrintSheet({ lang, items }: { lang: Lang; items: Memory[] }) {
  return <section className="print-sheet"><header><p>DRY // PORTFOLIO SELECTION</p><h1>Adryel Luís Rodrigues</h1><h2>Estágio em Desenvolvimento Full Stack ou Suporte de TI</h2></header>{items.length ? items.map((m) => <article key={m.id}><time>{m.year}</time><div><h3>{m.title[lang]}</h3><p>{m.body[lang]}</p></div></article>) : <p>Explore o mapa e selecione memórias para montar este documento.</p>}<footer>adryel.luis.r@gmail.com • +55 (12) 98703-7110 • Roseira, SP</footer></section>;
}
