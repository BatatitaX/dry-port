"use client";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { act, DEFAULTS, fresh, KEY, LAB_KEY, nearestClock, restore, serialize, type Phase, type State } from "./model";
import type { Bridge } from "./scene";
import "./style.css";
const TEXT = {
  pt: { titles: ["Primeiro, encontre seu ritmo.", "Agora, acerte os relógios.", "Hora de desviar.", "Você pegou o jeito."],
    notes: ["Caminhe nas quatro direções. O resto vem depois.", "Aproxime-se e ajuste cada relógio para o horário indicado.", "Espaço atravessa os pulsos. Você também pode contornar por cima ou por baixo.", "Movimento, interação e esquiva. Um passo de cada vez."],
    names: ["Movimento", "Relógios", "Desvio", "Concluído"], pause: "Pausa", resume: "Continuar", portfolio: "Portfólio", lab: "Testes", enter: "Entrar no laboratório", leave: "Voltar à partida", labInfo: "O laboratório usa um progresso separado. Escolha a etapa que quer testar.", move: "Mover", adjust: "Ajustar", observe: "Ver pista", dodge: "Esquiva", space: "Espaço", reduced: "Reduzir animações", assist: "Treino sem dano", speed: "Velocidade", reset: "Recomeçar", close: "Fechar", load: "Preparando seu espaço…", error: "Não foi possível carregar o jogo.", retry: "Tentar novamente", saved: "Seu navegador não conseguiu salvar o progresso.", keys: "Use WASD ou as setas", touch: "Mova o direcional nas quatro direções", ready: "Pronta", wait: "Recuperando", settings: "Seu jeito de jogar" },
  en: { titles: ["First, find your rhythm.", "Now, set the clocks.", "Time to dodge.", "You've got this."], notes: ["Walk in all four directions. Everything else comes later.", "Walk up to each clock and set it to the time shown.", "Space dashes through pulses. You can also take the upper or lower route.", "Movement, interaction and dodging. One step at a time."], names: ["Movement", "Clocks", "Dodge", "Complete"], pause: "Pause", resume: "Resume", portfolio: "Portfolio", lab: "Test lab", enter: "Enter test lab", leave: "Back to game", labInfo: "The lab uses separate progress. Choose a step to test.", move: "Move", adjust: "Adjust", observe: "Show hint", dodge: "Dodge", space: "Space", reduced: "Reduce animation", assist: "Training without damage", speed: "Speed", reset: "Start again", close: "Close", load: "Preparing your space…", error: "The game could not load.", retry: "Try again", saved: "Your browser could not save progress.", keys: "Use WASD or arrow keys", touch: "Move the stick in all four directions", ready: "Ready", wait: "Recovering", settings: "Your way to play" },
  es: { titles: ["Primero, encuentra tu ritmo.", "Ahora, ajusta los relojes.", "Hora de esquivar.", "Ya lo tienes."], notes: ["Camina en las cuatro direcciones. Lo demás viene después.", "Acércate a cada reloj y ajústalo a la hora indicada.", "Espacio atraviesa los pulsos. También puedes rodearlos por arriba o abajo.", "Movimiento, interacción y esquiva. Un paso a la vez."], names: ["Movimiento", "Relojes", "Esquiva", "Completado"], pause: "Pausa", resume: "Continuar", portfolio: "Portafolio", lab: "Pruebas", enter: "Entrar al laboratorio", leave: "Volver a la partida", labInfo: "El laboratorio tiene progreso separado. Elige una etapa para probar.", move: "Mover", adjust: "Ajustar", observe: "Ver pista", dodge: "Esquiva", space: "Espacio", reduced: "Reducir animaciones", assist: "Práctica sin daño", speed: "Velocidad", reset: "Recomenzar", close: "Cerrar", load: "Preparando tu espacio…", error: "No se pudo cargar el juego.", retry: "Reintentar", saved: "El navegador no pudo guardar.", keys: "Usa WASD o las flechas", touch: "Mueve el control en las cuatro direcciones", ready: "Lista", wait: "Recuperando", settings: "Tu forma de jugar" },
};
type Lang = keyof typeof TEXT;
function snapshot(s: State, fps = 0) { return { phase: s.phase, directions: s.directions, clocks: [...s.clocks], near: nearestClock(s), cooldown: s.cooldown, observing: s.observing, fps: Math.round(fps), x: Math.round(s.pos.x), y: Math.round(s.pos.y) }; }
export default function GuidedTutorial() {
  const b = useRef<Bridge>({ state: fresh(), settings: { ...DEFAULTS }, input: { x: 0, y: 0 }, paused: true, lang: "pt", publish: () => {} });
  const [hud, setHud] = useState(() => snapshot(fresh()));
  const [lang, setLang] = useState<Lang>("pt");
  const [settings, setSettings] = useState({ ...DEFAULTS });
  const [modal, setModal] = useState<"pause" | "lab" | null>(null);
  const [lab, setLab] = useState(false), [loaded, setLoaded] = useState(false), [error, setError] = useState(false), [saveError, setSaveError] = useState(false);
  const [stick, setStick] = useState({ x: 0, y: 0 });
  const parent = useRef<HTMLDivElement>(null), dialog = useRef<HTMLDialogElement>(null);
  const keys = useRef(new Set<string>()), mode = useRef(false), activeModal = useRef<typeof modal>(null), ready = useRef(false);
  const finger = useRef<number | null>(null), save = useRef(() => {});
  const t = TEXT[lang];
  function clear() { keys.current.clear(); b.current.input = { x: 0, y: 0 }; b.current.state.velocity = { x: 0, y: 0 }; finger.current = null; setStick({ x: 0, y: 0 }); }
  function open(value: typeof modal) { clear(); activeModal.current = value; b.current.paused = !!value || !ready.current; setModal(value); }
  function action(name: "interact" | "observe" | "dodge") { if (!b.current.paused) { act(b.current.state, name); setHud(snapshot(b.current.state)); save.current(); } }
  useEffect(() => {
    let cancelled = false, dispose: (() => void) | undefined;
    try { b.current.state = restore(localStorage.getItem(KEY)); } catch { /* Save reports storage errors. */ }
    save.current = () => { try { localStorage.setItem(mode.current ? LAB_KEY : KEY, serialize(b.current.state)); setSaveError(false); } catch { setSaveError(true); } };
    b.current.publish = fps => setHud(snapshot(b.current.state, fps));
    const updateInput = () => { if (finger.current === null) b.current.input = {
      x: Number(keys.current.has("d") || keys.current.has("arrowright")) - Number(keys.current.has("a") || keys.current.has("arrowleft")),
      y: Number(keys.current.has("s") || keys.current.has("arrowdown")) - Number(keys.current.has("w") || keys.current.has("arrowup")),
    }; };
    const down = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === "escape") { e.preventDefault(); open(activeModal.current ? null : "pause"); return; }
      if (activeModal.current || e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;
      if (e.target instanceof HTMLElement && e.target.closest("button,a") && [" ", "enter"].includes(key)) return;
      if (["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(key)) { e.preventDefault(); keys.current.add(key); updateInput(); }
      if (e.repeat) return;
      if (key === "t") open("lab");
      if (["e", "q", " "].includes(key)) { e.preventDefault(); action(key === "e" ? "interact" : key === "q" ? "observe" : "dodge"); }
    };
    const up = (e: KeyboardEvent) => { keys.current.delete(e.key.toLowerCase()); updateInput(); };
    const blur = () => { clear(); if (ready.current && !activeModal.current) open("pause"); save.current(); };
    const hidden = () => { if (document.hidden) blur(); };
    window.addEventListener("keydown", down); window.addEventListener("keyup", up); window.addEventListener("blur", blur);
    document.addEventListener("visibilitychange", hidden); const persist = () => save.current(); window.addEventListener("pagehide", persist);
    const timer = setInterval(persist, 1200);
    import("./scene").then(({ start }) => {
      if (cancelled || !parent.current) return;
      const language = new URLSearchParams(location.search).get("lang"); if (language === "en" || language === "es") { b.current.lang = language; setLang(language); }
      b.current.settings.reduced = matchMedia("(prefers-reduced-motion: reduce)").matches; setSettings({ ...b.current.settings });
      dispose = start(parent.current, b.current, () => { ready.current = true; b.current.paused = !!activeModal.current; setLoaded(true); persist(); }, () => { b.current.paused = true; setError(true); });
    }).catch(() => { if (!cancelled) setError(true); });
    return () => { cancelled = true; ready.current = false; persist(); clearInterval(timer); dispose?.(); window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); window.removeEventListener("blur", blur); window.removeEventListener("pagehide", persist); document.removeEventListener("visibilitychange", hidden); };
    // External engine and input callbacks read the current bridge, never render snapshots.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { b.current.lang = lang; document.documentElement.lang = lang === "pt" ? "pt-BR" : lang; }, [lang]);
  useEffect(() => { if (modal && !dialog.current?.open) dialog.current?.showModal(); else if (!modal && dialog.current?.open) dialog.current.close(); }, [modal]);
  function switchMode() {
    save.current(); mode.current = !mode.current; setLab(mode.current);
    try { b.current.state = restore(localStorage.getItem(mode.current ? LAB_KEY : KEY)); } catch { b.current.state = fresh(); }
    b.current.settings = { ...DEFAULTS, reduced: b.current.settings.reduced }; setSettings({ ...b.current.settings });
    setHud(snapshot(b.current.state)); open(null); save.current();
  }
  function restart(phase: Phase) { b.current.state = fresh(phase); clear(); setHud(snapshot(b.current.state)); open(null); save.current(); }
  function joystick(e: PointerEvent<HTMLDivElement>) {
    if (b.current.paused) return;
    if (e.type === "pointerdown") { finger.current = e.pointerId; e.currentTarget.setPointerCapture(e.pointerId); }
    if (finger.current !== e.pointerId) return;
    const rect = e.currentTarget.getBoundingClientRect(), x = (e.clientX - rect.left - rect.width / 2) / 34, y = (e.clientY - rect.top - rect.height / 2) / 34;
    const length = Math.max(1, Math.hypot(x, y)); const input = { x: x / length, y: y / length }; b.current.input = input; setStick(input);
  }
  return <main className={`guided ${settings.reduced ? "guided-reduced" : ""}`}>
    <div className="guided-world" ref={parent} role="img" aria-label="DRY · tutorial" aria-busy={!loaded} />
    <header className="guided-nav"><button onClick={() => open("lab")} aria-label={t.lab}><strong>DRY</strong><span>{lab ? t.lab : "TUTORIAL"}</span><kbd>T</kbd></button><div><a href={`/portfolio?lang=${lang}`}>{t.portfolio} ↗</a><button onClick={() => open("pause")} aria-label={t.pause}>Ⅱ</button></div></header>
    <section className="guided-instruction" key={hud.phase} aria-live="polite"><small>{Math.min(3, hud.phase + 1).toString().padStart(2, "0")} / 03 · {t.names[hud.phase]}</small><h1>{t.titles[hud.phase]}</h1><p>{t.notes[hud.phase]}</p></section>
    <div className="guided-controls">
      <div className="guided-stick" role="group" aria-label={t.move} onPointerDown={joystick} onPointerMove={joystick} onPointerUp={clear} onPointerCancel={clear} onLostPointerCapture={clear}><span style={{ transform: `translate(${stick.x * 29}px,${stick.y * 29}px)` }} /></div>
      <div className="guided-step-controls">
        {hud.phase === 0 && <div className="guided-wasd"><div className="guided-key-row">{[["W", 1], ["A", 2], ["S", 4], ["D", 8]].map(([key, bit]) => <kbd className={hud.directions & Number(bit) ? "done" : ""} key={key}>{key}<span>{hud.directions & Number(bit) ? "✓" : ""}</span></kbd>)}</div><p className="guided-desktop-label">{t.keys}</p><p className="guided-touch-label">{t.touch}</p></div>}
        {hud.phase === 1 && <><button className="guided-action" disabled={!loaded || hud.near < 0} onClick={() => action("interact")}><kbd>E</kbd>{t.adjust}</button><button className="guided-secondary" aria-pressed={hud.observing} onClick={() => action("observe")}><kbd>Q</kbd>{t.observe}</button></>}
        {hud.phase === 2 && <button className="guided-action guided-dodge" disabled={!loaded || hud.cooldown > 0} onClick={() => action("dodge")}><kbd>{t.space}</kbd><span>{t.dodge}<small>{hud.cooldown > 0 ? t.wait : t.ready}</small></span><progress aria-label={t.dodge} max=".9" value={.9 - hud.cooldown} /></button>}
        {hud.phase === 3 && <button className="guided-action" onClick={() => restart(0)}>{t.reset} ↺</button>}
      </div>
    </div>
    {saveError && <p className="guided-save" role="alert">{t.saved}</p>}
    {!loaded && <div className="guided-loading"><p>{error ? t.error : t.load}</p>{error && <><button onClick={() => location.reload()}>{t.retry}</button><a href="/portfolio">{t.portfolio}</a></>}</div>}
    <dialog ref={dialog} className="guided-dialog" aria-labelledby="guided-dialog-title" onCancel={e => { e.preventDefault(); open(null); }}><button className="guided-close" onClick={() => open(null)} aria-label={t.close}>×</button><h2 id="guided-dialog-title">{modal === "lab" ? t.lab : t.settings}</h2>
      {modal === "lab" ? <><p>{t.labInfo}</p>{lab ? <><p className="guided-metrics">{hud.fps} FPS · {hud.x}, {hud.y}</p><div className="guided-stages">{([0, 1, 2] as Phase[]).map(phase => <button key={phase} onClick={() => restart(phase)}>{phase + 1}. {t.names[phase]}</button>)}</div><label>{t.speed}<input type="range" min="160" max="280" step="10" value={settings.speed} onChange={e => { b.current.settings.speed = Number(e.target.value); setSettings({ ...b.current.settings }); }} /></label><button className="guided-action" onClick={switchMode}>{t.leave}</button></> : <button className="guided-action" onClick={switchMode}>{t.enter}</button>}</> : <><div className="guided-languages">{(["pt", "en", "es"] as Lang[]).map(l => <button key={l} aria-pressed={l === lang} onClick={() => { setLang(l); const url = new URL(location.href); url.searchParams.set("lang", l); history.replaceState(null, "", url); }}>{({ pt: "Português", en: "English", es: "Español" })[l]}</button>)}</div>{(["reduced", "assist"] as const).map(key => <label key={key}>{t[key]}<input type="checkbox" checked={settings[key]} onChange={e => { b.current.settings[key] = e.target.checked; setSettings({ ...b.current.settings }); }} /></label>)}<button className="guided-action" onClick={() => open(null)}>{t.resume}</button></>}
    </dialog>
  </main>;
}
