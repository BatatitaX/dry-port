"use client";

/* eslint-disable @next/next/no-img-element -- The RPG composes pre-rendered pixel-art scenery without resampling. */

import { useState, type CSSProperties, type FormEvent } from "react";
import { UiIcon, type UiIconName } from "./ui-icon";

export type GameLang = "pt" | "en" | "es";
export type Point = { x: number; y: number };
export type CastId = "dry" | "child" | "teen" | "jao" | "nilo" | "python" | "baby" | "artist";
export type NpcId = "nilo" | "luna" | "python" | "jao";
export type AgeStage = "baby" | "teen" | "adult";

export const PORTRAIT_INDEX: Record<CastId, number> = {
  dry: 0, child: 1, teen: 2, jao: 3, nilo: 4, python: 5, baby: 6, artist: 7,
};

export const NPCS: Array<{ id: NpcId; name: string; role: Record<GameLang, string>; x: number; y: number; secret?: boolean }> = [
  { id: "nilo", name: "Nilo", role: { pt: "Guia da jornada", en: "Journey guide", es: "Guía del viaje" }, x: 1090, y: 545 },
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

export function HudIcon({ name }: { name: "portfolio" | "map" | "memory" | "sound" | "muted" | "computer" | "paper" | "close" }) {
  const icons: Record<typeof name, UiIconName> = {
    portfolio: "portfolio", map: "map", memory: "inventory", sound: "sound-on",
    muted: "sound-off", computer: "pc", paper: "paper", close: "close",
  };
  return <UiIcon name={icons[name]} size={18} />;
}

export function Portrait({ cast, className = "" }: { cast: CastId; className?: string }) {
  const index = PORTRAIT_INDEX[cast];
  const customPortrait = cast === "dry" ? "dry" : cast === "jao" ? "jao" : cast === "nilo" ? "nilo" : null;
  const style: CSSProperties = customPortrait
    ? { backgroundImage: `url('/characters/${customPortrait}-portrait.png')`, backgroundPosition: "center", backgroundSize: "cover" }
    : { backgroundPosition: `${(index % 4) * (100 / 3)}% ${Math.floor(index / 4) * 100}%` };
  return <span className={`portrait-frame portrait-${cast} ${className}`} style={style} role="img" aria-label={cast} />;
}

export function NpcSprite({ id, x, y, defeated = false }: { id: NpcId; x: number; y: number; defeated?: boolean }) {
  const npc = NPCS.find((item) => item.id === id)!;
  return <div className={`world-npc npc-${id} ${defeated ? "npc-defeated" : ""}`} style={{ left: x, top: y, zIndex: Math.round(y) }} role="img" aria-label={npc.name}>
    <span className="npc-ground-shadow" />
    <span className="npc-character-sprite" />
    {id === "jao" && <span className="npc-music-notes" aria-hidden="true">♪</span>}
    {!npc.secret && <span className="npc-nameplate">{npc.name}</span>}
    <span className="npc-interaction-cue" aria-hidden="true">E</span>
  </div>;
}

export function SceneStage({ npc, structure, cast = "dry" }: { npc?: NpcId; structure?: string; cast?: CastId }) {
  const illustratedScene = npc === "jao" || npc === "nilo" ? `/world/interiors/dialogue-${npc}.png` : null;
  return <div className={`conversation-scene ${npc ? `scene-${npc}` : "scene-memory"}`} aria-label="Cena vista por trás do personagem">
    {illustratedScene ? <img className="scene-illustration" src={illustratedScene} alt="" decoding="async" /> : <>
      <img className="scene-ground" src="/world/terrain/world-base.png" alt="" decoding="async" />
      <img className="scene-tree scene-tree-left" src="/world/scenery/tree.png" alt="" decoding="async" />
      <img className="scene-tree scene-tree-right" src="/world/scenery/bush.png" alt="" decoding="async" />
      {structure && <img className="scene-building" src={`/world/structures/${structure}.png`} alt="" decoding="async" />}
      {npc && <span className={`scene-far-person scene-person-${npc}`} />}
      <span className={`scene-player-back scene-player-${cast}`} />
    </>}
    <span className="scene-caption">DRY // POV</span>
  </div>;
}

export function DialogueModal({ npc, lang, index, onAdvance, onClose }: { npc: NpcId; lang: GameLang; index: number; onAdvance: () => void; onClose: () => void }) {
  const lines = DIALOGUES[npc];
  const line = lines[index];
  if (!line) return null;
  return <div className="story-backdrop" role="dialog" aria-modal="true" aria-labelledby="dialogue-speaker">
    <article className={`story-window story-${npc}`}>
      <button className="story-close" onClick={onClose} aria-label={lang === "en" ? "Close" : lang === "es" ? "Cerrar" : "Fechar"}><HudIcon name="close" /></button>
      <SceneStage npc={npc} />
      <div className="story-bottom">
        <Portrait cast={line.cast} />
        <div className="story-copy"><span>{NPCS.find((item) => item.id === npc)?.role[lang]}</span><h2 id="dialogue-speaker">{line.speaker}</h2><p>{line.text[lang]}</p></div>
        <button className="story-next" onClick={onAdvance}>{index === lines.length - 1 ? (lang === "en" ? "Finish" : lang === "es" ? "Terminar" : "Concluir") : (lang === "en" ? "Next" : lang === "es" ? "Siguiente" : "Continuar")} →</button>
      </div>
      <div className="story-progress">{lines.map((_, position) => <span key={position} className={position <= index ? "active" : ""} />)}</div>
    </article>
  </div>;
}

export function BattleModal({ lang, hp, playerHp, round, onAction, onClose }: { lang: GameLang; hp: number; playerHp: number; round: number; onAction: (move: "inspect" | "fix" | "run") => void; onClose: () => void }) {
  const copy = lang === "en" ? { title: "PYTHON // FINAL ERROR", hint: "Inspect the failure, correct the logic and execute the solution.", inspect: "01 · INSPECT", fix: "02 · CORRECT", run: "03 · EXECUTE", player: "DRY", enemy: "ERROR" } : lang === "es" ? { title: "PYTHON // ERROR FINAL", hint: "Observa el fallo, corrige la lógica y ejecuta la solución.", inspect: "01 · OBSERVAR", fix: "02 · CORREGIR", run: "03 · EJECUTAR", player: "DRY", enemy: "ERROR" } : { title: "PYTHON // ERRO FINAL", hint: "Observe a falha, corrija a lógica e execute a solução.", inspect: "01 · OBSERVAR", fix: "02 · CORRIGIR", run: "03 · EXECUTAR", player: "DRY", enemy: "ERRO" };
  return <div className="story-backdrop battle-backdrop" role="dialog" aria-modal="true" aria-labelledby="battle-title"><article className="battle-window">
    <button className="story-close" onClick={onClose} aria-label={lang === "en" ? "Close" : lang === "es" ? "Cerrar" : "Fechar"}><HudIcon name="close" /></button>
    <header><small>BOSS ENCOUNTER</small><h2 id="battle-title">{copy.title}</h2><p>{copy.hint}</p></header>
    <div className="battle-arena"><Portrait cast="dry" className="battle-portrait" /><span className="battle-versus">VS</span><span className="battle-enemy"><Portrait cast="python" className="battle-portrait" /><img className="battle-python-logo" src="/python-logo.svg" alt="" decoding="async" /></span></div>
    <div className="battle-health"><div><strong>{copy.player}</strong><span role="progressbar" aria-label={copy.player} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.max(playerHp, 0)}><i style={{ width: `${Math.max(playerHp, 0)}%` }} /></span><b>{Math.max(playerHp, 0)}</b></div><div><strong>{copy.enemy}</strong><span role="progressbar" aria-label={copy.enemy} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.max(hp, 0)}><i className="enemy-health" style={{ width: `${Math.max(hp, 0)}%` }} /></span><b>{Math.max(hp, 0)}</b></div></div>
    <div className="battle-actions"><button className={round === 0 ? "suggested" : ""} onClick={() => onAction("inspect")}>{copy.inspect}</button><button className={round === 1 ? "suggested" : ""} onClick={() => onAction("fix")}>{copy.fix}</button><button className={round >= 2 ? "suggested" : ""} onClick={() => onAction("run")}>{copy.run}</button></div>
  </article></div>;
}

export function PoemModal({ poem, lang, onClose }: { poem: Poem; lang: GameLang; onClose: () => void }) {
  return <div className="story-backdrop" role="dialog" aria-modal="true" aria-labelledby="poem-title"><article className="poem-window"><button className="story-close" onClick={onClose} aria-label={lang === "en" ? "Close" : lang === "es" ? "Cerrar" : "Fechar"}><HudIcon name="close" /></button><small>{lang === "en" ? "RECOVERED MEMORY" : lang === "es" ? "MEMORIA RECUPERADA" : "MEMÓRIA RECUPERADA"}</small><h2 id="poem-title">{poem.title[lang]}</h2><div className="poem-rule" /><p>{poem.body[lang]}</p><button className="primary small" onClick={onClose}>{lang === "en" ? "Save to archive" : lang === "es" ? "Guardar en archivo" : "Guardar no arquivo"}</button></article></div>;
}

export function EvolutionModal({ stage, lang, onClose }: { stage: Exclude<AgeStage, "baby">; lang: GameLang; onClose: () => void }) {
  const copy = lang === "en"
    ? { eyebrow: "QUEST COMPLETED", unlocked: "NEW PHASE UNLOCKED", teen: "Adolescence", adult: "Adulthood", teenText: "Curiosity turned into discoveries. New paths are waiting for you.", adultText: "Learning became purpose. Your story is ready for the next chapter.", action: "CONTINUE JOURNEY" }
    : lang === "es"
      ? { eyebrow: "MISIÓN COMPLETADA", unlocked: "NUEVA ETAPA DESBLOQUEADA", teen: "Adolescencia", adult: "Vida adulta", teenText: "La curiosidad se convirtió en descubrimientos. Nuevos caminos te esperan.", adultText: "El aprendizaje se convirtió en propósito. Tu historia está lista para el siguiente capítulo.", action: "CONTINUAR VIAJE" }
      : { eyebrow: "MISSÃO CONCLUÍDA", unlocked: "NOVA FASE DESBLOQUEADA", teen: "Adolescência", adult: "Vida adulta", teenText: "A curiosidade virou descoberta. Novos caminhos estão esperando por você.", adultText: "O aprendizado virou propósito. Sua história está pronta para o próximo capítulo.", action: "CONTINUAR JORNADA" };

  return <div className="story-backdrop evolution-backdrop" role="dialog" aria-modal="true" aria-labelledby="evolution-title">
    <article className={`evolution-window evolution-${stage}`}>
      <div className="evolution-kicker"><UiIcon name="quest" size={17} /> {copy.eyebrow}</div>
      <div className="evolution-stage" aria-hidden="true"><span className="evolution-radiance" /><span className={`evolution-sprite evolution-sprite-${stage}`} /></div>
      <small>{copy.unlocked}</small>
      <h2 id="evolution-title">{stage === "teen" ? copy.teen : copy.adult}</h2>
      <p>{stage === "teen" ? copy.teenText : copy.adultText}</p>
      <button className="primary" onClick={onClose}>{copy.action} →</button>
    </article>
  </div>;
}

type ComputerApp = "desktop" | "files" | "terminal" | "jao" | "about";

const JAO_ALBUMS = [
  { title: "LOBOS", year: "2018", color: "#98a971" },
  { title: "ANTI-HERÓI", year: "2019", color: "#e6a5a3" },
  { title: "PIRATA", year: "2021", color: "#72b8cf" },
  { title: "SUPER", year: "2023", color: "#ed845d" },
  { title: "SUPERNOVA", year: "2024", color: "#e6c36e" },
  { title: "MEMÓRIAS PÓSTUMAS", year: "2026", color: "#c5b5ec" },
] as const;

export function ComputerModal({ lang, poems, collected, jaoUnlocked, bossDefeated, onRead, onClose }: { lang: GameLang; poems: Poem[]; collected: string[]; jaoUnlocked: boolean; bossDefeated: boolean; onRead: (poem: Poem) => void; onClose: () => void }) {
  const [activeApp, setActiveApp] = useState<ComputerApp>("desktop");
  const [terminalInput, setTerminalInput] = useState("");
  const [terminalLines, setTerminalLines] = useState<string[]>(["DRY OS [build 2026]", "Digite help para listar os comandos."]);
  const [playing, setPlaying] = useState(false);
  const copy = lang === "en"
    ? { title: "DRY OS", files: "Poem archive", terminal: "Terminal", music: "Jão · Music", about: "About Dry", empty: "Defeat Python to reveal forgotten pages across the map.", missing: "Explore the world to recover new poems.", status: "SYNCED LOCALLY", progress: "recovered", desktop: "Desktop", open: "OPEN APP", albums: "ALBUMS & ERAS", listen: "Open on Spotify", close: "Close", folder: "MEMORIES / POEMS", playlist: "The songs that became part of the journey.", terminalHint: "Try: help, whoami, ls, music or python", nowPlaying: "PLAYING", paused: "PAUSED" }
    : lang === "es"
      ? { title: "DRY OS", files: "Archivo de poemas", terminal: "Terminal", music: "Jão · Música", about: "Sobre Dry", empty: "Derrota a Python para revelar las páginas olvidadas.", missing: "Explora el mundo para recuperar nuevos poemas.", status: "SINCRONIZADO LOCALMENTE", progress: "recuperados", desktop: "Escritorio", open: "ABRIR APP", albums: "ÁLBUMES Y ERAS", listen: "Abrir en Spotify", close: "Cerrar", folder: "MEMORIAS / POEMAS", playlist: "Las canciones que se volvieron parte del viaje.", terminalHint: "Prueba: help, whoami, ls, music o python", nowPlaying: "REPRODUCIENDO", paused: "EN PAUSA" }
      : { title: "DRY OS", files: "Arquivo de poemas", terminal: "Terminal", music: "Jão · Músicas", about: "Sobre o Dry", empty: "Derrote Python para revelar os papéis esquecidos pelo mapa.", missing: "Explore o mundo para recuperar novos poemas.", status: "SINCRONIZADO LOCALMENTE", progress: "recuperados", desktop: "Área de trabalho", open: "ABRIR APLICATIVO", albums: "ÁLBUNS & ERAS", listen: "Abrir no Spotify", close: "Fechar", folder: "MEMÓRIAS / POEMAS", playlist: "As músicas que viraram parte da jornada.", terminalHint: "Experimente: help, whoami, ls, music ou python", nowPlaying: "TOCANDO", paused: "PAUSADO" };

  const submitTerminal = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const command = terminalInput.trim().toLowerCase();
    if (!command) return;
    if (command === "clear") { setTerminalLines([]); setTerminalInput(""); return; }
    const response = command === "help" ? "help · whoami · ls · music · python · clear"
      : command === "whoami" ? "Adryel Luís Rodrigues // ADS // Full Stack"
        : command === "ls" ? `poemas/  projetos/  ${jaoUnlocked ? "jao/  " : ""}README.md`
          : command === "music" ? (jaoUnlocked ? "Jão — Lobos · Anti-Herói · Pirata · Super · Memórias Póstumas" : "Biblioteca musical bloqueada: encontre Jão.")
            : command === "python" ? (bossDefeated ? "Python executado com sucesso. Nenhum erro encontrado." : "SyntaxError: o caminho precisa ser depurado.")
              : `comando não encontrado: ${command}`;
    setTerminalLines((lines) => [...lines.slice(-10), `dry@portfolio:~$ ${command}`, response]);
    setTerminalInput("");
  };

  const shortcut = (app: Exclude<ComputerApp, "desktop">, icon: UiIconName, title: string) => <button className={`desktop-shortcut shortcut-${app}`} onClick={() => setActiveApp(app)}><span><UiIcon name={icon} size={30} /></span><strong>{title}</strong></button>;
  const appTitle = activeApp === "files" ? copy.files : activeApp === "terminal" ? copy.terminal : activeApp === "jao" ? copy.music : copy.about;

  return <div className="story-backdrop computer-backdrop" role="dialog" aria-modal="true" aria-labelledby="computer-title">
    <article className="computer-window desktop-computer">
      <header className="desktop-titlebar"><div className="desktop-window-lights" aria-hidden="true"><i /><i /><i /></div><div><small>ADRYEL.LUIS // PORTFOLIO COMPUTER</small><h2 id="computer-title">{copy.title}</h2></div><button className="computer-close" onClick={onClose} aria-label={copy.close}><HudIcon name="close" /></button></header>
      <div className="desktop-screen">
        <div className="desktop-wallpaper"><img className="desktop-room-art" src="/world/interiors/memory-room.png" alt="" decoding="async" /><span className="desktop-wallpaper-mark">DRY<span>_</span></span><small>EST. 2007 // VALE DO PARAÍBA</small></div>
        <nav className="desktop-shortcuts" aria-label={copy.open}>
          {shortcut("files", "database", copy.files)}
          {shortcut("terminal", "pc", copy.terminal)}
          {shortcut("about", "portfolio", copy.about)}
          {jaoUnlocked && shortcut("jao", "jao", copy.music)}
        </nav>
        {activeApp !== "desktop" && <section className={`desktop-app app-${activeApp}`} aria-label={appTitle}>
          <header><div><UiIcon name={activeApp === "files" ? "database" : activeApp === "terminal" ? "pc" : activeApp === "jao" ? "jao" : "portfolio"} size={16} /><strong>{appTitle}</strong></div><button onClick={() => setActiveApp("desktop")} aria-label={copy.close}><UiIcon name="close" size={15} /></button></header>
          {activeApp === "files" && <div className="desktop-app-body"><div className="computer-status"><span />{copy.status}<b>{collected.length}/{poems.length} {copy.progress}</b></div><h3>{copy.folder}</h3>{!collected.length && <p className="computer-empty">{bossDefeated ? copy.missing : copy.empty}</p>}<div className="computer-files">{poems.filter((poem) => collected.includes(poem.id)).map((poem, index) => <button key={poem.id} onClick={() => onRead(poem)}><UiIcon name="paper" size={19} /><span><small>POEMA_{String(index + 1).padStart(2, "0")}.TXT</small><strong>{poem.title[lang]}</strong></span><b>↗</b></button>)}</div></div>}
          {activeApp === "terminal" && <div className="desktop-app-body terminal-body"><div className="terminal-output" aria-live="polite">{terminalLines.map((line, index) => <p key={`${index}-${line}`}>{line}</p>)}</div><form className="terminal-prompt" onSubmit={submitTerminal}><label htmlFor="dry-terminal">dry@portfolio:~$</label><input id="dry-terminal" value={terminalInput} onChange={(event) => setTerminalInput(event.target.value)} autoComplete="off" spellCheck={false} placeholder={copy.terminalHint} /></form></div>}
          {activeApp === "about" && <div className="desktop-app-body desktop-about"><Portrait cast="dry" /><div><small>USUÁRIO // 2007—2026</small><h3>Adryel Luís Rodrigues</h3><p>Análise e Desenvolvimento de Sistemas</p><span>Full Stack · Design · Suporte de TI</span></div></div>}
          {activeApp === "jao" && <div className="desktop-app-body music-library"><div className="music-artist"><Portrait cast="jao" /><div><small>ARTISTA // POP BRASILEIRO</small><h3>Jão</h3><p>{copy.playlist}</p></div></div><div className="music-status"><button onClick={() => setPlaying((value) => !value)} aria-label={playing ? "Pausar" : "Reproduzir"}>{playing ? "Ⅱ" : "▶"}</button><span>{playing ? copy.nowPlaying : copy.paused}</span><b>MEMÓRIAS PÓSTUMAS</b></div><h4>{copy.albums}</h4><div className="album-grid">{JAO_ALBUMS.map((album) => <article key={album.title} style={{ "--album-color": album.color } as CSSProperties}><span>{album.title.slice(0, 1)}</span><div><strong>{album.title}</strong><small>{album.year}</small></div></article>)}</div><a className="music-external" href="https://open.spotify.com/intl-pt/artist/59FrDXDVJz0EKqYg39dnT2" target="_blank" rel="noopener noreferrer">{copy.listen} ↗</a></div>}
        </section>}
      </div>
      <footer className="desktop-taskbar"><button onClick={() => setActiveApp("desktop")}><UiIcon name="home" size={16} /><span>{copy.desktop}</span></button><div className="taskbar-open-apps"><button onClick={() => setActiveApp("files")} aria-label={copy.files}><UiIcon name="database" size={16} /></button><button onClick={() => setActiveApp("terminal")} aria-label={copy.terminal}><UiIcon name="pc" size={16} /></button>{jaoUnlocked && <button onClick={() => setActiveApp("jao")} aria-label={copy.music}><UiIcon name="jao" size={16} /></button>}</div><span className="taskbar-clock">2007 — 2026</span></footer>
    </article>
  </div>;
}
