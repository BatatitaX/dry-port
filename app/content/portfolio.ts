export type Lang = "pt" | "en" | "es";
export type Direction = "down" | "left" | "right" | "up";
export type Multi = Record<Lang, string>;
export type Memory = {
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

export const ui = {
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
} satisfies Record<Lang, Record<string, string>>;
export type UiKey = keyof typeof ui.pt;
const _allUiKeys: Record<Lang, Record<UiKey, string>> = ui;
void _allUiKeys;


export const quickText = {
  pt: {
    kicker: "FULL STACK • SUPORTE DE TI • VALE DO PARAÍBA", heroTop: "Curioso por", heroEm: "natureza.",
    bio: "Sou Adryel Luís Rodrigues, estudante de Análise e Desenvolvimento de Sistemas. Desenvolvo interfaces web, sistemas e experiências interativas — e estou em busca da minha próxima grande missão: um estágio em tecnologia.",
    cv: "BAIXAR CV", viewProjects: "VER PROJETOS", status: "DISPONÍVEL • TARDE & NOITE",
    stats: ["início da jornada", "projetos principais", "idiomas", "curiosidade"],
    timelineA: "Da astronomia", timelineB: "ao software.", projectsA: "Ideias que", projectsB: "viraram sistemas.", skillsA: "Ferramentas", skillsB: "da jornada.", educationA: "Aprendendo.", educationB: "Construindo.", certificatesA: "Novos itens", certificatesB: "em breve.",
    etec: "Técnico integrado ao Ensino Médio em Análise e Desenvolvimento de Sistemas.", fatec: "AMS em Análise e Desenvolvimento de Sistemas. Conclusão prevista para 2027.", completed: "CONCLUÍDO", inProgress: "EM CURSO", availabilityTitle: "Disponível para oportunidades", availability: "Estágio em Full Stack ou Suporte • presencial, híbrido ou remoto • Vale do Paraíba • tarde e noite.",
    contactA: "Uma boa equipe também", contactB: "começa com", contactEm: "curiosidade.", email: "ENVIAR E-MAIL", explore: "EXPLORAR PROJETO",
  },
  en: {
    kicker: "FULL STACK • IT SUPPORT • VALE DO PARAÍBA", heroTop: "Curious by", heroEm: "nature.",
    bio: "I’m Adryel Luís Rodrigues, a Software Analysis and Development student. I build web interfaces, systems and interactive experiences — and I’m looking for my next major quest: a technology internship.",
    cv: "DOWNLOAD CV", viewProjects: "VIEW PROJECTS", status: "AVAILABLE • AFTERNOONS & EVENINGS",
    stats: ["journey started", "main projects", "languages", "curiosity"],
    timelineA: "From astronomy", timelineB: "to software.", projectsA: "Ideas turned", projectsB: "into systems.", skillsA: "Tools for", skillsB: "the journey.", educationA: "Learning.", educationB: "Building.", certificatesA: "New items", certificatesB: "coming soon.",
    etec: "Integrated high-school technical diploma in Software Analysis and Development.", fatec: "Software Analysis and Development degree. Expected graduation in 2027.", completed: "COMPLETED", inProgress: "IN PROGRESS", availabilityTitle: "Open to opportunities", availability: "Internship in Full Stack or IT Support • on-site, hybrid or remote • Vale do Paraíba • afternoons and evenings.",
    contactA: "A great team can also", contactB: "begin with", contactEm: "curiosity.", email: "SEND AN EMAIL", explore: "EXPLORE PROJECT",
  },
  es: {
    kicker: "FULL STACK • SOPORTE DE TI • VALE DO PARAÍBA", heroTop: "Curioso por", heroEm: "naturaleza.",
    bio: "Soy Adryel Luís Rodrigues, estudiante de Análisis y Desarrollo de Sistemas. Desarrollo interfaces web, sistemas y experiencias interactivas — y busco mi próxima gran misión: unas prácticas en tecnología.",
    cv: "DESCARGAR CV", viewProjects: "VER PROYECTOS", status: "DISPONIBLE • TARDE Y NOCHE",
    stats: ["inicio del viaje", "proyectos principales", "idiomas", "curiosidad"],
    timelineA: "De la astronomía", timelineB: "al software.", projectsA: "Ideas que se", projectsB: "volvieron sistemas.", skillsA: "Herramientas", skillsB: "del viaje.", educationA: "Aprendiendo.", educationB: "Construyendo.", certificatesA: "Nuevos objetos", certificatesB: "muy pronto.",
    etec: "Formación técnica integrada al bachillerato en Análisis y Desarrollo de Sistemas.", fatec: "Grado en Análisis y Desarrollo de Sistemas. Finalización prevista para 2027.", completed: "CONCLUIDO", inProgress: "EN CURSO", availabilityTitle: "Disponible para oportunidades", availability: "Prácticas en Full Stack o Soporte • presencial, híbrido o remoto • Vale do Paraíba • tarde y noche.",
    contactA: "Un buen equipo también", contactB: "puede empezar con", contactEm: "curiosidad.", email: "ENVIAR E-MAIL", explore: "EXPLORAR PROYECTO",
  },
} satisfies Record<Lang, Record<string, string | string[]>>;

export const memories: Memory[] = [
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
    subtitle: { pt: "TCC no repositório institucional • MB", en: "Institutional capstone repository • top grade", es: "Proyecto final en repositorio institucional • MB" },
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

export const projects = [
  { name: "PREVER", role: { pt: "Full stack • projeto acadêmico", en: "Full stack • academic project", es: "Full stack • proyecto académico" }, stack: "React · JavaScript · Tailwind · Supabase · Leaflet · Firebase AI", href: "https://smdnpi.vercel.app/", mark: "01" },
  { name: "SMDN Visualizer", role: { pt: "Marketing do ecossistema PREVER", en: "PREVER ecosystem showcase", es: "Presentación del ecosistema PREVER" }, stack: "React · CSS · Vite", href: "https://visualizersmdn.vercel.app/", mark: "02" },
  { name: "R-Universe", role: { pt: "Produto pessoal • projeto solo", en: "Personal product • solo project", es: "Producto personal • proyecto individual" }, stack: "React · Supabase Auth · RPC · PWA · Service Worker", href: "https://projectr-weld.vercel.app/", mark: "03" },
  { name: "Mente Inabalável", role: { pt: "TCC colaborativo • repositório institucional", en: "Collaborative capstone • institutional repository", es: "Proyecto final colaborativo • repositorio institucional" }, stack: "HTML · CSS · PHP · JavaScript · Firebase · MySQL", href: "https://ric.cps.sp.gov.br/handle/123456789/39708", mark: "04" },
];

export const skills = {
  "Interfaces web": ["HTML", "CSS", "JavaScript", "React"],
  "Sistemas e dados": ["PHP", "SQL", "MySQL", "Supabase", "Firebase"],
  "Jogo DRY": ["TypeScript", "Phaser", "Git/GitHub"],
};
export const skillLevelNames: Record<Lang, Record<string, string>> = {
  pt: { "Interfaces web": "Interfaces · PREVER / Visualizer", "Sistemas e dados": "Sistemas · Mente Inabalável / R-Universe", "Jogo DRY": "Jogo DRY · este portfólio" },
  en: { "Interfaces web": "Interfaces · PREVER / Visualizer", "Sistemas e dados": "Systems · Mente Inabalável / R-Universe", "Jogo DRY": "DRY game · this portfolio" },
  es: { "Interfaces web": "Interfaces · PREVER / Visualizer", "Sistemas e dados": "Sistemas · Mente Inabalável / R-Universe", "Jogo DRY": "Juego DRY · este portafolio" },
};
export const skillNames: Record<Lang, Record<string, string>> = {
  pt: {},
  en: { "IA generativa": "Generative AI", "APIs & automações": "APIs & automation" },
  es: { "IA generativa": "IA generativa", "APIs & automações": "APIs y automatización" },
};

export const posthumousText: Record<Lang, { unlocked: string; title: string; body: string; badge: string }> = {
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
