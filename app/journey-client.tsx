"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  BattleModal,
  BRIDGE,
  COMPUTER,
  ComputerModal,
  DIALOGUES,
  DialogueModal,
  EvolutionModal,
  HudIcon,
  NPCS,
  PATH_ZONES,
  POEMS,
  PoemModal,
  Portrait,
  RIVER,
  SceneStage,
  type AgeStage,
  type CastId,
  type NpcId,
  type Poem,
} from "./game-extras";
import { type MovementKey } from "./movement";
import dynamic from "next/dynamic";
import { takeBattleTurn } from "./game/battle";
import { parseSave, writeSave, SAVE_KEY, type Save } from "./game/save";
import type { GameBridge } from "./game/bridge";
const PhaserView = dynamic(() => import("./game/phaser-view"), { ssr: false, loading: () => <p role="status">Carregando / Loading / Cargando…</p> });

import { ui, memories, posthumousText, type Lang, type Memory } from "./content/portfolio";

import { WORLD, START_POS, FOG_COLS, FOG_ROWS, WORLD_MEMORIES, LANDMARKS, EVOLUTION_QUESTS, fogKey, clamp } from "./game/world";

const spriteStyle = (index: number): React.CSSProperties => ({
  backgroundImage: "url('/memory-icons.png')",
  backgroundSize: "400% 300%",
  backgroundPosition: `${(index % 4) * 33.333}% ${Math.floor(index / 4) * 50}%`,
  backgroundRepeat: "no-repeat",
});

export default function Home() {
  const [lang, setLang] = useState<Lang>("pt");
  const [phase, setPhase] = useState<"intro" | "game">("intro");
  const [sound, setSound] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [hasSave, setHasSave] = useState(false);
  const [pos, setPos] = useState(START_POS);
  const [ageStage, setAgeStage] = useState<AgeStage>("baby");
  const [evolutionNotice, setEvolutionNotice] = useState<Exclude<AgeStage, "baby"> | null>(null);
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
  const [storageFailed, setStorageFailed] = useState(false);
  const saveSnapshot = useRef<Save | null>(null);
  const pressedKeys = useRef(new Set<string>());
  const directionalKeyOrder = useRef<MovementKey[]>([]);
  const livePosition = useRef(START_POS);
  const hydrated = useRef(false);
  const t = ui[lang];
  const modalOpen = Boolean(openMemory || inventoryOpen || mapOpen || openDialogue || battleOpen || computerOpen || openPoem || evolutionNotice);

  const audioContext = useRef<AudioContext | null>(null);
  useEffect(() => () => { void audioContext.current?.close(); }, []);

  const ping = useCallback(() => {
    if (!sound || typeof window === "undefined") return;
    const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = audioContext.current ??= new AudioCtx();
    if (ctx.state === "suspended") void ctx.resume();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(520, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.18);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    oscillator.connect(gain).connect(ctx.destination);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
    oscillator.start(); oscillator.stop(ctx.currentTime + 0.26);
  }, [sound]);

  useEffect(() => {
    document.documentElement.lang = lang === "pt" ? "pt-BR" : lang;
  }, [lang]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const preferredMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        setReducedMotion(preferredMotion);
        const raw = localStorage.getItem(SAVE_KEY) || localStorage.getItem("dry-portfolio-save-v3") || localStorage.getItem("dry-portfolio-save-v2");
        const saved = parseSave(raw, preferredMotion);
        if (saved) {
          setHasSave(true); setLang(saved.lang); setSound(saved.sound); setReducedMotion(saved.reducedMotion);
          livePosition.current = saved.pos; setPos(saved.pos); setUnlocked(saved.unlocked); setAgeStage(saved.ageStage);
          setFavorites(saved.favorites); setHidden(saved.hidden); setOrder(saved.order); setExplored(saved.explored);
          setJaoUnlocked(saved.jaoUnlocked); setSpokenNpcs(saved.spokenNpcs); setBossDefeated(saved.bossDefeated); setCollectedPoems(saved.collectedPoems);
        }
        const requestedLanguage = new URLSearchParams(location.search).get("lang");
        if (requestedLanguage === "en" || requestedLanguage === "es" || requestedLanguage === "pt") setLang(requestedLanguage);
        const shared = new URLSearchParams(location.search).get("mem");
        if (shared) { const ids = shared.split(",").filter((id) => memories.some((m) => m.id === id)); setUnlocked(ids); setFavorites(ids); setInventoryOpen(true); setPhase("game"); }
      } catch { setStorageFailed(true); }
      hydrated.current = true;
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  // Position stays in the scene. Persist it once per second and when leaving the page.
  useEffect(() => {
    saveSnapshot.current = { version: 4, lang, sound, reducedMotion, pos: livePosition.current, unlocked, favorites, hidden, order, explored, jaoUnlocked, spokenNpcs, bossDefeated, collectedPoems, ageStage };
    if (!hydrated.current) return;
    try { setStorageFailed(!writeSave(localStorage, saveSnapshot.current)); } catch { setStorageFailed(true); }
  }, [lang, sound, reducedMotion, unlocked, favorites, hidden, order, explored, jaoUnlocked, spokenNpcs, bossDefeated, collectedPoems, ageStage]);

  useEffect(() => {
    let lastPosition = "";
    const flush = () => {
      if (!hydrated.current || !saveSnapshot.current) return;
      const key = `${livePosition.current.x}:${livePosition.current.y}`;
      if (key === lastPosition) return;
      const save = { ...saveSnapshot.current, pos: livePosition.current };
      try {
        const ok = writeSave(localStorage, save); setStorageFailed(!ok); if (ok) lastPosition = key;
      } catch { setStorageFailed(true); }
    };
    const timer = window.setInterval(flush, 1000);
    const onHidden = () => { if (document.hidden) flush(); };
    window.addEventListener("pagehide", flush); document.addEventListener("visibilitychange", onHidden);
    return () => { flush(); clearInterval(timer); window.removeEventListener("pagehide", flush); document.removeEventListener("visibilitychange", onHidden); };
  }, []);

  useEffect(() => {
    if (!hydrated.current || phase !== "game" || ageStage === "adult") return;
    const mission = EVOLUTION_QUESTS[ageStage];
    if (!mission.memories.every((memoryId) => unlocked.includes(memoryId)) || (mission.guide && !spokenNpcs.includes(mission.guide))) return;
    const nextStage: Exclude<AgeStage, "baby"> = ageStage === "baby" ? "teen" : "adult";
    const frame = window.requestAnimationFrame(() => {
      setAgeStage(nextStage);
      setEvolutionNotice(nextStage);
      ping();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [ageStage, phase, ping, spokenNpcs, unlocked]);

  const reveal = useCallback((memory: Memory) => {
    setUnlocked((items) => items.includes(memory.id) ? items : [...items, memory.id]);
    setInventoryOpen(false); setOpenMemory(memory); setToast(`${memory.year} • ${memory.title[lang]}`); ping();
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
    const position = livePosition.current;
    const nearest = WORLD_MEMORIES.map(m => ({ m, d: Math.hypot(m.x-position.x,m.y-position.y) })).sort((a,b) => a.d-b.d)[0];
    const nearestNpc = NPCS.filter(npc => !(npc.id === "python" && bossDefeated)).map(npc => ({ npc, d: Math.hypot(npc.x-position.x,npc.y-position.y) })).sort((a,b) => a.d-b.d)[0];
    const nearestPoem = bossDefeated ? POEMS.filter(poem => !collectedPoems.includes(poem.id)).map(poem => ({ poem, d: Math.hypot(poem.x-position.x,poem.y-position.y) })).sort((a,b) => a.d-b.d)[0] : undefined;
    const nearComputer = Math.hypot(position.x-COMPUTER.x,position.y-COMPUTER.y) < 92;
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
  }, [bossDefeated, collectedPoems, ping, reveal]);

  useEffect(() => { interactionRef.current = interact; }, [interact]);

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

  const resetGame = () => {
    livePosition.current = START_POS; setPos(START_POS); setExplored([fogKey(START_POS.x, START_POS.y)]); setUnlocked([]); setFavorites([]); setHidden([]); setOrder(memories.map((m) => m.id)); setJaoUnlocked(false);
    setSpokenNpcs([]); setBossDefeated(false); setCollectedPoems([]); setBossHp(100); setPlayerHp(100); setBattleRound(0); setAgeStage("baby"); setEvolutionNotice(null);
    try {
      localStorage.removeItem(SAVE_KEY);
      localStorage.removeItem("dry-portfolio-save-v2");
      localStorage.removeItem("dry-portfolio-save-v3");
    } catch {
      // A blocked storage API must not prevent the player from starting over.
    }
    setHasSave(false); setPhase("game");
  };

  const startTouchMovement = (event: React.PointerEvent<HTMLButtonElement>, key: string) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    pressedKeys.current.add(key);
    const order = directionalKeyOrder.current;
    const previous = order.indexOf(key as MovementKey);
    if (previous >= 0) order.splice(previous, 1);
    order.push(key as MovementKey);
  };

  const stopTouchMovement = (event: React.PointerEvent<HTMLButtonElement>, key: string) => {
    pressedKeys.current.delete(key);
    const index = directionalKeyOrder.current.indexOf(key as MovementKey);
    if (index >= 0) directionalKeyOrder.current.splice(index, 1);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const evolutionQuest = ageStage === "adult" ? null : EVOLUTION_QUESTS[ageStage];
  const evolutionProgress = evolutionQuest
    ? evolutionQuest.memories.filter((memoryId) => unlocked.includes(memoryId)).length + Number(Boolean(evolutionQuest.guide && spokenNpcs.includes(evolutionQuest.guide)))
    : 0;
  const evolutionTotal = evolutionQuest ? evolutionQuest.memories.length + Number(Boolean(evolutionQuest.guide)) : 0;
  const questTitle = evolutionQuest
    ? evolutionQuest.title[lang]
    : bossDefeated
    ? collectedPoems.length === POEMS.length
      ? (lang === "en" ? "Every verse recovered" : lang === "es" ? "Todos los versos recuperados" : "Todos os versos recuperados")
      : (lang === "en" ? "Recover forgotten poems" : lang === "es" ? "Recupera los poemas olvidados" : "Recupere os poemas perdidos")
    : (lang === "en" ? "Find and defeat Python" : lang === "es" ? "Encuentra y derrota a Python" : "Encontre e derrote Python");

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
    const url = `${location.origin}/jornada?mem=${ids.join(",")}&lang=${lang}`;
    try {
      if (navigator.share) await navigator.share({ title: "DRY // Portfolio", text: lang === "en" ? "Selected memories from Adryel’s journey" : lang === "es" ? "Recuerdos seleccionados del viaje de Adryel" : "Meu recorte da jornada de Adryel Luís Rodrigues", url });
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
    const next = takeBattleTurn({ bossHp, playerHp, round: battleRound }, move);
    setBossHp(next.bossHp); setPlayerHp(next.playerHp); setBattleRound(next.round);
    if (next.won) {
      setBossDefeated(true);
      setBattleOpen(false);
      setToast(lang === "en" ? "PYTHON DEFEATED • Forgotten poems appeared across the map" : lang === "es" ? "PYTHON DERROTADO • Aparecieron poemas por el mapa" : "PYTHON DERROTADO • Os poemas apareceram pelo mapa");
      ping();
      window.setTimeout(() => setToast(""), 4600);
      return;
    }
    if (next.retry) {
      setToast(lang === "en" ? "Try again: inspect, correct, execute." : lang === "es" ? "Inténtalo de nuevo: observar, corregir, ejecutar." : "Tente novamente: observar, corrigir, executar.");
      window.setTimeout(() => setToast(""), 2400);
    }
  };

  useEffect(() => {
    if (!openMemory && !inventoryOpen && !mapOpen && !openDialogue && !battleOpen && !computerOpen && !openPoem && !evolutionNotice) return;

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
        if (evolutionNotice) setEvolutionNotice(null);
        else if (openPoem) setOpenPoem(null);
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
      if (!getDialog()?.contains(document.activeElement)) { event.preventDefault(); focusable[0].focus(); return; }
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
  }, [openMemory, inventoryOpen, mapOpen, openDialogue, battleOpen, computerOpen, openPoem, evolutionNotice]);

  const bridge = useRef<GameBridge | null>(null);
  useLayoutEffect(() => { bridge.current = {
    position: livePosition,
    keys: pressedKeys.current,
    keyOrder: directionalKeyOrder.current,
    paused: modalOpen,
    ageStage, lang, bossDefeated, collectedPoems, unlocked, reducedMotion,
    onPosition: setPos,
    onInteract: () => interactionRef.current(),
    onMap: () => setMapOpen(true),
  }; }, [modalOpen, ageStage, lang, bossDefeated, collectedPoems, unlocked, reducedMotion]);

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
          <button className="ghost" onClick={() => window.location.assign(`/portfolio?lang=${lang}`) }><span>▤</span>{t.quick}</button>
        </div>
        <div className="intro-preferences">
          <label><input type="checkbox" checked={sound} onChange={(e) => setSound(e.target.checked)} /><span className="switch" />{t.sound}</label>
          <label><input type="checkbox" checked={reducedMotion} onChange={(e) => setReducedMotion(e.target.checked)} /><span className="switch" />{t.motion}</label>
        </div>
        <p className="save-note">◇ {storageFailed ? (lang === "en" ? "Progress cannot be saved in this browser." : lang === "es" ? "No se puede guardar el progreso en este navegador." : "Não é possível salvar o progresso neste navegador.") : t.saveNote}</p>
      </section>
      <div className="intro-world" aria-hidden="true"><span className="castle">♜</span><span className="dry-mini" /></div>
    </main>
  );


  return (
    <main className={`game-shell ${reducedMotion ? "reduced" : ""}`}>
      {storageFailed && <p className="storage-note" role="status">{lang === "en" ? "Progress is not being saved." : lang === "es" ? "El progreso no se está guardando." : "O progresso não está sendo salvo."}</p>}
      <header className="game-hud" inert={modalOpen}>
        <div className="quest-box" title={evolutionQuest?.hint[lang]}><span className="quest-gem"><HudIcon name={bossDefeated ? "paper" : "memory"} /></span><div><small>{t.mission}</small><strong>{questTitle}</strong><em>{evolutionQuest ? `${evolutionProgress}/${evolutionTotal} ${lang === "en" ? "objectives completed" : lang === "es" ? "objetivos completados" : "objetivos concluídos"}` : bossDefeated ? `${collectedPoems.length}/${POEMS.length} ${lang === "en" ? "poems recovered" : lang === "es" ? "poemas recuperados" : "poemas recuperados"}` : `${unlocked.length}/${memories.length} ${t.discovered}`}</em></div></div>
        <div className="hud-actions">
          <button onClick={() => window.location.assign(`/portfolio?lang=${lang}`) } aria-label={t.portfolio}><HudIcon name="portfolio" /> <span>{t.portfolio}</span></button>
          <button onClick={() => setMapOpen(true)} aria-label={t.openMap}><HudIcon name="map" /> <span>{t.openMap}</span></button>
          <button onClick={() => setInventoryOpen(true)} aria-label={t.inventory}><HudIcon name="memory" /> <span>{t.inventory}</span><b>{unlocked.length}</b></button>
          <button onClick={() => setComputerOpen(true)} aria-label={lang === "en" ? "Memory archive" : lang === "es" ? "Banco de recuerdos" : "Banco de memórias"}><HudIcon name="computer" /><span>PC</span></button>
          <button onClick={() => setSound((v) => !v)} aria-label={t.sound} aria-pressed={sound}><HudIcon name={sound ? "sound" : "muted"} /></button>
          <button onClick={() => setReducedMotion(value => !value)} aria-pressed={reducedMotion}>{t.motion}</button>
          <div className="language-switch compact">{(["pt", "en", "es"] as Lang[]).map((code) => <button key={code} className={lang === code ? "active" : ""} aria-pressed={lang === code} aria-label={code === "pt" ? "Português" : code === "en" ? "English" : "Español"} onClick={() => setLang(code)}>{code.toUpperCase()}</button>)}</div>
        </div>
      </header>

      <section className="map-wrap" inert={modalOpen} aria-label={lang === "en" ? "Explorable map" : lang === "es" ? "Mapa explorable" : "Mapa explorável"}>
        <div className="map-stage">
          <PhaserView bridge={bridge} />
          <div className="map-vignette" />
          {(nearest?.d < 145 || (nearestNpc && nearestNpc.d < 92) || (nearestPoem && nearestPoem.d < 68) || nearComputer) && <button className="nearby" onClick={interact}>E <span>{nearestPoem && nearestPoem.d < 68 ? (lang === "en" ? "Collect poem" : lang === "es" ? "Recoger poema" : "Recolher poema") : nearestNpc && nearestNpc.d < 92 ? (lang === "en" ? "Talk" : lang === "es" ? "Hablar" : "Conversar") : nearComputer ? (lang === "en" ? "Open archive" : lang === "es" ? "Abrir archivo" : "Abrir arquivo") : t.interact}</span></button>}
        </div>
        <div className="map-caption"><button onClick={() => setMapOpen(true)}><HudIcon name="map" /> {t.openMap}</button><span>{t.controls}</span><span>{bossDefeated ? `${collectedPoems.length}/${POEMS.length}` : `${Math.round((pos.x / WORLD.width) * 100)}%`}</span></div>
      </section>

      <div className="dpad" inert={modalOpen} aria-label={lang === "en" ? "Touch controls" : lang === "es" ? "Controles táctiles" : "Controles por toque"}>
        <button className="up" aria-label={lang === "en" ? "Move up" : lang === "es" ? "Mover arriba" : "Mover para cima"} onPointerDown={(event) => startTouchMovement(event, "w")} onPointerUp={(event) => stopTouchMovement(event, "w")} onPointerCancel={(event) => stopTouchMovement(event, "w")} onLostPointerCapture={(event) => stopTouchMovement(event, "w")}>▲</button>
        <button className="left" aria-label={lang === "en" ? "Move left" : lang === "es" ? "Mover a la izquierda" : "Mover para a esquerda"} onPointerDown={(event) => startTouchMovement(event, "a")} onPointerUp={(event) => stopTouchMovement(event, "a")} onPointerCancel={(event) => stopTouchMovement(event, "a")} onLostPointerCapture={(event) => stopTouchMovement(event, "a")}>◀</button>
        <button className="center" aria-label={t.interact} onClick={interact}>E</button>
        <button className="right" aria-label={lang === "en" ? "Move right" : lang === "es" ? "Mover a la derecha" : "Mover para a direita"} onPointerDown={(event) => startTouchMovement(event, "d")} onPointerUp={(event) => stopTouchMovement(event, "d")} onPointerCancel={(event) => stopTouchMovement(event, "d")} onLostPointerCapture={(event) => stopTouchMovement(event, "d")}>▶</button>
        <button className="down" aria-label={lang === "en" ? "Move down" : lang === "es" ? "Mover abajo" : "Mover para baixo"} onPointerDown={(event) => startTouchMovement(event, "s")} onPointerUp={(event) => stopTouchMovement(event, "s")} onPointerCancel={(event) => stopTouchMovement(event, "s")} onLostPointerCapture={(event) => stopTouchMovement(event, "s")}>▼</button>
      </div>

      {openMemory && <MemoryModal memory={openMemory} lang={lang} age={ageStage} unlocked={unlocked.includes(openMemory.id)} onClose={() => setOpenMemory(null)} onFavorite={() => toggle(openMemory.id, setFavorites)} favorite={favorites.includes(openMemory.id)} t={t} />}
      {inventoryOpen && <Inventory lang={lang} t={t} memories={orderedMemories} unlocked={unlocked} favorites={favorites} hidden={hidden} jaoUnlocked={jaoUnlocked} onClose={() => setInventoryOpen(false)} onOpen={(memory) => { setInventoryOpen(false); reveal(memory); }} onFavorite={(id) => toggle(id, setFavorites)} onHide={(id) => toggle(id, setHidden)} onMove={reorder} onPrint={() => window.print()} onShare={share} onRevealAll={revealAll} />}
      {mapOpen && <WorldMap lang={lang} t={t} explored={explored} pos={pos} unlocked={unlocked} bossDefeated={bossDefeated} collectedPoems={collectedPoems} onClose={() => setMapOpen(false)} />}
      {openDialogue && <DialogueModal npc={openDialogue} age={ageStage} lang={lang} index={dialogueIndex} onAdvance={advanceDialogue} onClose={() => { setOpenDialogue(null); setDialogueIndex(0); }} />}
      {battleOpen && <BattleModal age={ageStage} lang={lang} hp={bossHp} playerHp={playerHp} round={battleRound} onAction={battleAction} onAssist={() => { setBossDefeated(true); setBattleOpen(false); }} onClose={() => setBattleOpen(false)} />}
      {computerOpen && <ComputerModal lang={lang} poems={POEMS} collected={collectedPoems} jaoUnlocked={jaoUnlocked} bossDefeated={bossDefeated} onRead={(poem) => { setComputerOpen(false); setOpenPoem(poem); }} onClose={() => setComputerOpen(false)} />}
      {openPoem && <PoemModal poem={openPoem} age={ageStage} lang={lang} onClose={() => setOpenPoem(null)} />}
      {evolutionNotice && <EvolutionModal stage={evolutionNotice} lang={lang} onClose={() => setEvolutionNotice(null)} />}
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

function MemoryModal({ memory, lang, age, onClose, onFavorite, favorite, t }: { memory: Memory; lang: Lang; age: AgeStage; unlocked: boolean; onClose: () => void; onFavorite: () => void; favorite: boolean; t: Record<string, string> }) {
  const landmark = LANDMARKS.find((item) => item.memoryId === memory.id);
  const portraitCast: CastId = age === "adult" ? "dry" : age;
  return <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="memory-title" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
    <article className="memory-modal enhanced-memory-modal">
      <button className="modal-close" onClick={onClose} aria-label={t.close}>×</button>
      <SceneStage structure={landmark?.id} age={age} />
      <div className="memory-scene-bottom"><Portrait cast={portraitCast} /><div className="memory-scene-copy"><div className="memory-year">MEMORY // {memory.id === "future" ? t.current : memory.year}</div><p className="memory-category">{({ pt: { origem: "ORIGEM", formacao: "FORMAÇÃO", projeto: "PROJETO", competencia: "COMPETÊNCIA", interesse: "INTERESSE", futuro: "FUTURO" }, en: { origem: "ORIGINS", formacao: "EDUCATION", projeto: "PROJECT", competencia: "SKILL", interesse: "INTEREST", futuro: "FUTURE" }, es: { origem: "ORIGEN", formacao: "FORMACIÓN", projeto: "PROYECTO", competencia: "COMPETENCIA", interesse: "INTERÉS", futuro: "FUTURO" } })[lang][memory.category]}</p><h2 id="memory-title">{memory.title[lang]}</h2><h3>{memory.subtitle[lang]}</h3><p>{memory.body[lang]}</p><div className="modal-actions"><button className={favorite ? "fav active" : "fav"} onClick={onFavorite} aria-pressed={favorite}>★ {t.favorite}</button>{memory.link && <a href={memory.link} target="_blank" rel="noopener noreferrer">↗ {lang === "en" ? "Open project" : lang === "es" ? "Abrir proyecto" : memory.linkLabel}</a>}</div></div></div>
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

function PrintSheet({ lang, items }: { lang: Lang; items: Memory[] }) {
  return <section className="print-sheet"><header><p>DRY // PORTFOLIO SELECTION</p><h1>Adryel Luís Rodrigues</h1><h2>{lang === "en" ? "Full Stack Development or IT Support Internship" : lang === "es" ? "Prácticas en desarrollo Full Stack o soporte de TI" : "Estágio em Desenvolvimento Full Stack ou Suporte de TI"}</h2></header>{items.length ? items.map((m) => <article key={m.id}><time>{m.year}</time><div><h3>{m.title[lang]}</h3><p>{m.body[lang]}</p></div></article>) : <p>{lang === "en" ? "Explore the map and select memories for this document." : lang === "es" ? "Explora el mapa y selecciona recuerdos para este documento." : "Explore o mapa e selecione memórias para montar este documento."}</p>}<footer>adryel.luis.r@gmail.com • +55 (12) 98703-7110 • Roseira, SP</footer></section>;
}
