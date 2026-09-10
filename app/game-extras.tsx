"use client";

/* eslint-disable @next/next/no-img-element -- The RPG composes pre-rendered pixel-art scenery without resampling. */

import { useState, type CSSProperties, type FormEvent } from "react";
import { terminalCopy, terminalResponse } from "./game/terminal";
import { UiIcon, type UiIconName } from "./ui-icon";

import { NPCS, DIALOGUES, PORTRAIT_INDEX, type GameLang, type CastId, type NpcId, type AgeStage, type Poem } from "./game/data";
export * from "./game/data";

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

export function SceneStage({ npc, structure, age = "adult" }: { npc?: NpcId; structure?: string; age?: AgeStage }) {
  const illustratedScene = npc === "jao" || npc === "nilo" ? `/world/interiors/dialogue-${npc}.png` : null;
  return <div className={`conversation-scene ${npc ? `scene-${npc}` : "scene-memory"}`} aria-label="Cena vista por trás do personagem">
    {illustratedScene ? <img className="scene-illustration" src={illustratedScene} alt="" decoding="async" /> : <>
      <img className="scene-ground" src="/world/terrain/world-base.png" alt="" decoding="async" />
      <img className="scene-tree scene-tree-left" src="/world/scenery/tree.png" alt="" decoding="async" />
      <img className="scene-tree scene-tree-right" src="/world/scenery/bush.png" alt="" decoding="async" />
    </>}
    {structure && <img className="scene-building" src={`/world/structures/${structure}.png`} alt="" decoding="async" />}
    {npc && <span className={`scene-far-person scene-person-${npc}`} />}
    <span className={`scene-player-back scene-age-${age}`} />
    <span className="scene-caption">DRY // POV</span>
  </div>;
}

export function DialogueModal({ npc, age, lang, index, onAdvance, onClose }: { npc: NpcId; age: AgeStage; lang: GameLang; index: number; onAdvance: () => void; onClose: () => void }) {
  const lines = DIALOGUES[npc];
  const line = lines[index];
  const portraitCast: CastId = line?.cast === "dry" ? (age === "adult" ? "dry" : age) : line?.cast;
  if (!line) return null;
  return <div className="story-backdrop" role="dialog" aria-modal="true" aria-labelledby="dialogue-speaker">
    <article className={`story-window story-${npc}`}>
      <button className="story-close" onClick={onClose} aria-label={lang === "en" ? "Close" : lang === "es" ? "Cerrar" : "Fechar"}><HudIcon name="close" /></button>
      <SceneStage npc={npc} age={age} />
      <div className="story-bottom">
        <Portrait cast={portraitCast} />
        <div className="story-copy"><span>{NPCS.find((item) => item.id === npc)?.role[lang]}</span><h2 id="dialogue-speaker">{line.speaker}</h2><p>{line.text[lang]}</p></div>
        <button className="story-next" onClick={onAdvance}>{index === lines.length - 1 ? (lang === "en" ? "Finish" : lang === "es" ? "Terminar" : "Concluir") : (lang === "en" ? "Next" : lang === "es" ? "Siguiente" : "Continuar")} →</button>
      </div>
      <div className="story-progress">{lines.map((_, position) => <span key={position} className={position <= index ? "active" : ""} />)}</div>
    </article>
  </div>;
}

export function BattleModal({ age, lang, hp, playerHp, round, onAction, onAssist, onClose }: { age: AgeStage; lang: GameLang; hp: number; playerHp: number; round: number; onAction: (move: "inspect" | "fix" | "run") => void; onAssist: () => void; onClose: () => void }) {
  const copy = lang === "en" ? { title: "PYTHON // FINAL ERROR", hint: "Inspect the failure, correct the logic and execute the solution.", inspect: "01 · INSPECT", fix: "02 · CORRECT", run: "03 · EXECUTE", player: "DRY", enemy: "ERROR" } : lang === "es" ? { title: "PYTHON // ERROR FINAL", hint: "Observa el fallo, corrige la lógica y ejecuta la solución.", inspect: "01 · OBSERVAR", fix: "02 · CORREGIR", run: "03 · EJECUTAR", player: "DRY", enemy: "ERROR" } : { title: "PYTHON // ERRO FINAL", hint: "Observe a falha, corrija a lógica e execute a solução.", inspect: "01 · OBSERVAR", fix: "02 · CORRIGIR", run: "03 · EXECUTAR", player: "DRY", enemy: "ERRO" };
  return <div className="story-backdrop battle-backdrop" role="dialog" aria-modal="true" aria-labelledby="battle-title"><article className="battle-window">
    <button className="story-close" onClick={onClose} aria-label={lang === "en" ? "Close" : lang === "es" ? "Cerrar" : "Fechar"}><HudIcon name="close" /></button>
    <header><small>BOSS ENCOUNTER</small><h2 id="battle-title">{copy.title}</h2><p>{copy.hint}</p></header>
    <div className="battle-arena"><Portrait cast={age === "adult" ? "dry" : age} className="battle-portrait" /><span className="battle-versus">VS</span><span className="battle-enemy"><Portrait cast="python" className="battle-portrait" /><img className="battle-python-logo" src="/python-logo.svg" alt="" decoding="async" /></span></div>
    <div className="battle-health"><div><strong>{copy.player}</strong><span role="progressbar" aria-label={copy.player} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.max(playerHp, 0)}><i style={{ width: `${Math.max(playerHp, 0)}%` }} /></span><b>{Math.max(playerHp, 0)}</b></div><div><strong>{copy.enemy}</strong><span role="progressbar" aria-label={copy.enemy} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.max(hp, 0)}><i className="enemy-health" style={{ width: `${Math.max(hp, 0)}%` }} /></span><b>{Math.max(hp, 0)}</b></div></div>
    <div className="battle-actions"><button className={round % 3 === 0 ? "suggested" : ""} onClick={() => onAction("inspect")}>{copy.inspect}</button><button className={round % 3 === 1 ? "suggested" : ""} onClick={() => onAction("fix")}>{copy.fix}</button><button className={round % 3 === 2 ? "suggested" : ""} onClick={() => onAction("run")}>{copy.run}</button></div>
  <button className="battle-assist" onClick={onAssist}>{lang === "en" ? "Assisted mode: continue the journey" : lang === "es" ? "Modo asistido: continuar el viaje" : "Modo assistido: continuar a jornada"}</button></article></div>;
}

export function PoemModal({ poem, age, lang, onClose }: { poem: Poem; age: AgeStage; lang: GameLang; onClose: () => void }) {
  return <div className="story-backdrop" role="dialog" aria-modal="true" aria-labelledby="poem-title"><article className="poem-window"><button className="story-close" onClick={onClose} aria-label={lang === "en" ? "Close" : lang === "es" ? "Cerrar" : "Fechar"}><HudIcon name="close" /></button><SceneStage age={age} /><div className="poem-page"><small>{lang === "en" ? "RECOVERED MEMORY" : lang === "es" ? "MEMORIA RECUPERADA" : "MEMÓRIA RECUPERADA"}</small><h2 id="poem-title">{poem.title[lang]}</h2><div className="poem-rule" /><p>{poem.body[lang]}</p><button className="primary small" onClick={onClose}>{lang === "en" ? "Save to archive" : lang === "es" ? "Guardar en archivo" : "Guardar no arquivo"}</button></div></article></div>;
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
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const copy = lang === "en"
    ? { title: "DRY OS", files: "Poem archive", terminal: "Terminal", music: "Jão · Music", about: "About Dry", empty: "Defeat Python to reveal forgotten pages across the map.", missing: "Explore the world to recover new poems.", status: "ARCHIVE ON THIS DEVICE", progress: "recovered", desktop: "Desktop", open: "OPEN APP", albums: "ALBUMS & ERAS", listen: "Open on Spotify", close: "Close", folder: "MEMORIES / POEMS", playlist: "The songs that became part of the journey.", terminalHint: "Try: help, whoami, ls, music or python", nowPlaying: "PLAYING", paused: "PAUSED" }
    : lang === "es"
      ? { title: "DRY OS", files: "Archivo de poemas", terminal: "Terminal", music: "Jão · Música", about: "Sobre Dry", empty: "Derrota a Python para revelar las páginas olvidadas.", missing: "Explora el mundo para recuperar nuevos poemas.", status: "ARCHIVO EN ESTE DISPOSITIVO", progress: "recuperados", desktop: "Escritorio", open: "ABRIR APP", albums: "ÁLBUMES Y ERAS", listen: "Abrir en Spotify", close: "Cerrar", folder: "MEMORIAS / POEMAS", playlist: "Las canciones que se volvieron parte del viaje.", terminalHint: "Prueba: help, whoami, ls, music o python", nowPlaying: "REPRODUCIENDO", paused: "EN PAUSA" }
      : { title: "DRY OS", files: "Arquivo de poemas", terminal: "Terminal", music: "Jão · Músicas", about: "Sobre o Dry", empty: "Derrote Python para revelar os papéis esquecidos pelo mapa.", missing: "Explore o mundo para recuperar novos poemas.", status: "ARCHIVO EN ESTE DISPOSITIVO", progress: "recuperados", desktop: "Área de trabalho", open: "ABRIR APLICATIVO", albums: "ÁLBUNS & ERAS", listen: "Abrir no Spotify", close: "Fechar", folder: "MEMÓRIAS / POEMAS", playlist: "As músicas que viraram parte da jornada.", terminalHint: "Experimente: help, whoami, ls, music ou python", nowPlaying: "TOCANDO", paused: "PAUSADO" };

  const submitTerminal = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const command = terminalInput.trim().toLowerCase();
    if (!command) return;
    if (command === "clear") { setTerminalLines([]); setTerminalInput(""); return; }
    const response = terminalResponse(command, lang, jaoUnlocked, bossDefeated);
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
          {activeApp === "terminal" && <div className="desktop-app-body terminal-body"><div className="terminal-output" aria-live="polite"><p>DRY OS [build 2026]</p><p>{terminalCopy[lang].welcome}</p>{terminalLines.map((line, index) => <p key={`${index}-${line}`}>{line}</p>)}</div><form className="terminal-prompt" onSubmit={submitTerminal}><label htmlFor="dry-terminal">dry@portfolio:~$</label><input id="dry-terminal" value={terminalInput} onChange={(event) => setTerminalInput(event.target.value)} autoComplete="off" spellCheck={false} placeholder={copy.terminalHint} /></form></div>}
          {activeApp === "about" && <div className="desktop-app-body desktop-about"><Portrait cast="dry" /><div><small>{lang === "en" ? "USER" : lang === "es" ? "USUARIO" : "USUÁRIO"}{" // 2007—2026"}</small><h3>Adryel Luís Rodrigues</h3><p>{lang === "en" ? "Software Analysis and Development" : lang === "es" ? "Análisis y Desarrollo de Sistemas" : "Análise e Desenvolvimento de Sistemas"}</p><span>Full Stack · Design · {lang === "en" ? "IT Support" : lang === "es" ? "Soporte de TI" : "Suporte de TI"}</span></div></div>}
          {activeApp === "jao" && <div className="desktop-app-body music-library"><div className="music-artist"><Portrait cast="jao" /><div><small>{lang === "en" ? "ARTIST // BRAZILIAN POP" : lang === "es" ? "ARTISTA // POP BRASILEÑO" : "ARTISTA // POP BRASILEIRO"}</small><h3>Jão</h3><p>{copy.playlist}</p></div></div><h4>{copy.albums}</h4><div className="album-grid">{JAO_ALBUMS.map((album) => <article key={album.title} style={{ "--album-color": album.color } as CSSProperties}><span>{album.title.slice(0, 1)}</span><div><strong>{album.title}</strong><small>{album.year}</small></div></article>)}</div><a className="music-external" href="https://open.spotify.com/intl-pt/artist/59FrDXDVJz0EKqYg39dnT2" target="_blank" rel="noopener noreferrer">{copy.listen} ↗</a></div>}
        </section>}
      </div>
      <footer className="desktop-taskbar"><button onClick={() => setActiveApp("desktop")}><UiIcon name="home" size={16} /><span>{copy.desktop}</span></button><div className="taskbar-open-apps"><button onClick={() => setActiveApp("files")} aria-label={copy.files}><UiIcon name="database" size={16} /></button><button onClick={() => setActiveApp("terminal")} aria-label={copy.terminal}><UiIcon name="pc" size={16} /></button>{jaoUnlocked && <button onClick={() => setActiveApp("jao")} aria-label={copy.music}><UiIcon name="jao" size={16} /></button>}</div><span className="taskbar-clock">2007 — 2026</span></footer>
    </article>
  </div>;
}
