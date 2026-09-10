"use client";
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { copy, type Lang } from "./copy";
import { act, DEFAULT_SETTINGS, fresh, nearby, resetChallenge, restore, SAVE_KEY, serialize, stage, TEST_SAVE_KEY, type Action, type Point, type Settings, type State } from "./model";
import type { Bridge } from "./bridge";
import "./tutorial.css";

type Modal = "pause" | "lab" | "journal" | "complete" | null;
function Icon({ name }: { name: "observe" | "pulse" | "dodge" | "interact" | "pause" | "arrow" }) {
  const paths = { observe: <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>,
    pulse: <><circle cx="12" cy="12" r="3" /><path d="M7 5a8 8 0 0 0 0 14M17 5a8 8 0 0 1 0 14M4 2a13 13 0 0 0 0 20M20 2a13 13 0 0 1 0 20" /></>,
    dodge: <><path d="m11 4 9 8-9 8 3-8-3-8ZM3 6h5M1 12h8M3 18h5" /></>,
    interact: <><path d="M8 12V5a2 2 0 0 1 4 0v7-9a2 2 0 0 1 4 0v9-6a2 2 0 0 1 4 0v9c0 5-3 7-7 7-3 0-5-2-7-5l-3-4a2 2 0 0 1 3-3l2 2Z" /></>,
    pause: <><path d="M8 5v14M16 5v14" /></>, arrow: <><path d="M5 19 19 5M5 5h14v14" /></> };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
function snapshot(s: State, fps = 0) {
  return { hp: s.hp, energy: Math.round(s.energy), phase: stage(s), lens: s.lens, observing: s.observing,
    target: nearby(s), notice: s.time < s.noticeUntil ? s.notice : null, active: s.droneActive,
    vulnerable: s.droneClock % 3.8 > 1.75, secret: s.secret, mirrors: [...s.mirrors], fps: Math.round(fps),
    x: Math.round(s.pos.x), y: Math.round(s.pos.y), dodgeReady: s.dodgeCooldown <= 0 && s.energy >= 24, pulseReady: s.pulseCooldown <= 0 && s.energy >= 12 };
}
export default function Tutorial() {
  const bridge = useRef<Bridge>({ state: fresh(), settings: { ...DEFAULT_SETTINGS }, keys: new Set(), joystick: { x: 0, y: 0 }, paused: true, lang: "pt", act: () => {}, publish: () => {} });
  const [hud, setHud] = useState(() => snapshot(fresh()));
  const [lang, setLang] = useState<Lang>("pt");
  const [settings, setSettings] = useState<Settings>({ ...DEFAULT_SETTINGS });
  const [modal, setModal] = useState<Modal>(null);
  const [practice, setPractice] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [hint, setHint] = useState(false);
  const [stick, setStick] = useState<Point>({ x: 0, y: 0 });
  const host = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const activeMode = useRef(false);
  const activeModal = useRef<Modal>(null);
  const engineReady = useRef(false);
  const audio = useRef<AudioContext | null>(null);
  const stickPointer = useRef<number | null>(null);
  const saveRef = useRef(() => {});
  const t = copy[lang];

  function clearInput() { bridge.current.keys.clear(); bridge.current.joystick = { x: 0, y: 0 }; stickPointer.current = null; setStick({ x: 0, y: 0 }); }
  function openModal(value: Modal) {
    clearInput(); activeModal.current = value; bridge.current.paused = !!value || !engineReady.current; setModal(value);
  }
  function sound(action: Action) {
    if (!bridge.current.settings.sound) return;
    try {
      audio.current ??= new AudioContext();
      void audio.current.resume();
      const context = audio.current, oscillator = context.createOscillator(), volume = context.createGain();
      const s = bridge.current.state;
      const bellNote = [523.25, 659.25, 783.99][s.bells.at(-1) ?? 0];
      oscillator.type = "sine"; oscillator.frequency.value = action === "pulse" ? (s.notice === "bell" || s.notice === "secret" ? bellNote : 660) : action === "interact" ? 440 : 280;
      volume.gain.setValueAtTime(.045, context.currentTime); volume.gain.exponentialRampToValueAtTime(.001, context.currentTime + .16);
      oscillator.connect(volume); volume.connect(context.destination); oscillator.start(); oscillator.stop(context.currentTime + .17);
      oscillator.onended = () => { oscillator.disconnect(); volume.disconnect(); };
    } catch { /* Audio is optional; browsers may refuse to start it. */ }
  }
  function perform(action: Action, aim?: Point) {
    if (bridge.current.paused) return;
    const before = bridge.current.state.complete, target = nearby(bridge.current.state);
    act(bridge.current.state, action, bridge.current.settings, aim);
    sound(action);
    setHud(snapshot(bridge.current.state));
    if (action === "interact" && target === "journal") openModal("journal");
    if (!before && bridge.current.state.complete) openModal("complete");
    saveRef.current();
  }

  useEffect(() => {
    let cancelled = false;
    let dispose: (() => void) | undefined;
    // Restore synchronously before any timer or Strict Mode cleanup can write a fresh save.
    try { bridge.current.state = restore(localStorage.getItem(SAVE_KEY)); } catch { /* The save callback reports unavailable storage. */ }
    bridge.current.act = perform;
    bridge.current.publish = fps => setHud(snapshot(bridge.current.state, fps));
    const save = () => {
      try { localStorage.setItem(activeMode.current ? TEST_SAVE_KEY : SAVE_KEY, serialize(bridge.current.state)); setSaveFailed(false); }
      catch { setSaveFailed(true); }
    };
    saveRef.current = save;
    const keydown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (key === "escape") { event.preventDefault(); openModal(activeModal.current ? null : "pause"); return; }
      if (activeModal.current || event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement) return;
      if (event.target instanceof HTMLElement && event.target.closest("button,a") && (key === " " || key === "enter")) return;
      if (["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(key)) { event.preventDefault(); bridge.current.keys.add(key); }
      if (event.repeat) return;
      if (key === "t") { event.preventDefault(); openModal("lab"); }
      const action: Record<string, Action> = { e: "interact", q: "observe", " ": "dodge", f: "pulse" };
      if (action[key]) { event.preventDefault(); bridge.current.act(action[key]); }
    };
    const keyup = (event: KeyboardEvent) => bridge.current.keys.delete(event.key.toLowerCase());
    const blur = () => { clearInput(); if (engineReady.current && !activeModal.current) openModal("pause"); save(); };
    const visibility = () => { if (document.hidden) blur(); };
    window.addEventListener("keydown", keydown); window.addEventListener("keyup", keyup);
    window.addEventListener("blur", blur); document.addEventListener("visibilitychange", visibility);
    window.addEventListener("pagehide", save);
    const interval = setInterval(save, 2000);
    import("./scene").then(({ createTutorial }) => {
      if (cancelled || !host.current) return;
      const language = new URLSearchParams(location.search).get("lang");
      if (language === "en" || language === "es") { bridge.current.lang = language; setLang(language); }
      const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
      bridge.current.settings = { ...DEFAULT_SETTINGS, reduced }; setSettings({ ...bridge.current.settings });
      dispose = createTutorial(host.current, bridge.current, () => {
        engineReady.current = true; bridge.current.paused = !!activeModal.current; setReady(true); save();
      }, () => { bridge.current.paused = true; setFailed(true); });
    }).catch(() => { if (!cancelled) setFailed(true); });
    return () => {
      cancelled = true; engineReady.current = false; save(); clearInterval(interval); dispose?.(); void audio.current?.close(); audio.current = null;
      window.removeEventListener("keydown", keydown); window.removeEventListener("keyup", keyup); window.removeEventListener("blur", blur);
      document.removeEventListener("visibilitychange", visibility); window.removeEventListener("pagehide", save);
    };
    // The engine bridge intentionally outlives React renders; callbacks use bridge/ref state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bridge]);
  useEffect(() => { document.documentElement.lang = lang === "pt" ? "pt-BR" : lang; bridge.current.lang = lang; }, [bridge, lang]);
  useEffect(() => { if (modal && !dialog.current?.open) dialog.current?.showModal(); else if (!modal && dialog.current?.open) dialog.current.close(); }, [modal]);

  function setting<K extends keyof Settings>(key: K, value: Settings[K]) {
    bridge.current.settings = { ...bridge.current.settings, [key]: value }; setSettings({ ...bridge.current.settings });
    if (key === "sound" && value) { try { audio.current ??= new AudioContext(); void audio.current.resume(); } catch {} }
  }
  function switchMode() {
    saveRef.current(); activeMode.current = !activeMode.current; setPractice(activeMode.current);
    try { bridge.current.state = restore(localStorage.getItem(activeMode.current ? TEST_SAVE_KEY : SAVE_KEY)); } catch { bridge.current.state = fresh(); }
    bridge.current.settings = { ...DEFAULT_SETTINGS, reduced: bridge.current.settings.reduced, sound: bridge.current.settings.sound, overview: bridge.current.settings.overview };
    setSettings({ ...bridge.current.settings }); setHud(snapshot(bridge.current.state)); setHint(false); openModal(null); saveRef.current();
  }
  function reset(target: "puzzle" | "drone" | "all") {
    if (!activeMode.current) return;
    bridge.current.state = resetChallenge(bridge.current.state, target); setHud(snapshot(bridge.current.state)); setHint(false); saveRef.current(); openModal(null);
  }
  function joystick(event: ReactPointerEvent<HTMLDivElement>) {
    if (bridge.current.paused) return;
    if (event.type === "pointerdown") { stickPointer.current = event.pointerId; event.currentTarget.setPointerCapture(event.pointerId); }
    if (stickPointer.current !== event.pointerId) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left - rect.width / 2) / (rect.width * .32), y = (event.clientY - rect.top - rect.height / 2) / (rect.height * .32);
    const length = Math.max(1, Math.hypot(x, y));
    bridge.current.joystick = { x: x / length, y: y / length }; setStick(bridge.current.joystick);
  }
  const checkbox = (key: "assist" | "autoAim" | "reduced" | "overview" | "sound" | "debug" | "invincible") => <label className="ob-option" key={key}><span>{t[key]}</span><input type="checkbox" checked={settings[key]} onChange={e => setting(key, e.target.checked)} /></label>;
  return <main className={`observatory ${settings.reduced ? "ob-reduced" : ""}`} aria-label={t.title}>
    <div className="ob-world" ref={host} role="img" aria-label={`${t.title} · Phaser`} aria-busy={!ready} />
    <div className="ob-vignette" />
    <header className="ob-top">
      <div className="ob-player ob-glass"><div className="ob-portrait" role="img" aria-label="DRY" /><div className="ob-vitals"><strong>DRY <span>{practice ? t.practice : "01"}</span></strong><div className="ob-hearts" aria-label={`${t.health}: ${hud.hp}/3`}>{[0, 1, 2].map(i => <span key={i} className={i < hud.hp ? "" : "empty"}>♥</span>)}</div><progress max="100" value={hud.energy} aria-label={t.energy} /></div></div>
      <div className="ob-location"><span>{t.title}</span><small>{practice ? t.practice : t.tutorial}</small></div>
      <nav className="ob-nav" aria-label={t.settings}><a className="ob-glass" href={`/portfolio?lang=${lang}`}>{t.portfolio}<Icon name="arrow" /></a><button className="ob-glass" onClick={() => openModal("pause")} aria-label={t.pause}><Icon name="pause" /><span>{t.pause}</span><kbd>Esc</kbd></button></nav>
    </header>
    <section className="ob-objective ob-glass" aria-label={t.objectives[hud.phase]}><small>0{Math.min(5, hud.phase + 1)} / 05</small><h1>{t.objectives[hud.phase]}</h1><p>{hud.phase === 1 ? `${hud.mirrors.filter((v, i) => v === [1, 2][i]).length}/2 · ` : ""}{t.hints[hud.phase]}</p><button onClick={() => setHint(!hint)} aria-expanded={hint}>{t.hint} <span>?</span></button>{hint && <p className="ob-hint">{hud.phase === 1 ? t.notices.observe : t.hints[hud.phase]}</p>}</section>
    {hud.active && <div className={`ob-drone-status ob-glass ${hud.vulnerable ? "open" : ""}`}>{hud.vulnerable ? t.vulnerable : t.shield}</div>}
    {hud.notice && <div className="ob-notice ob-glass" role="status" aria-live="polite">{t.notices[hud.notice]}</div>}
    {saveFailed && <p className="ob-save-error" role="alert">{t.saveError}</p>}
    <footer className="ob-bottom">
      <div className="ob-bottom-left"><div className="ob-movement ob-glass"><div className="ob-keys"><kbd>W</kbd><div><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd></div></div><span>{t.move}</span><button onClick={() => openModal("lab")}><kbd>T</kbd>{t.tests}</button></div>
      <div className="ob-joystick" role="group" aria-label={t.move} onPointerDown={joystick} onPointerMove={joystick} onPointerUp={clearInput} onPointerCancel={clearInput} onLostPointerCapture={clearInput}><span style={{ transform: `translate(${stick.x * 30}px, ${stick.y * 30}px)` }} /></div>
      <button className="ob-mobile-lab ob-glass" onClick={() => openModal("lab")}>{t.tests}</button></div>
      <div className="ob-actions">{(["observe", "pulse", "dodge", "interact"] as Action[]).map((action, i) => <button key={action} className={`ob-action ob-glass ${action === "observe" && hud.observing ? "selected" : ""}`} aria-label={t.actions[i]} aria-pressed={action === "observe" ? hud.observing : undefined} disabled={!ready || (i < 2 && !hud.lens) || (i === 2 && !hud.dodgeReady) || (i === 1 && !hud.pulseReady)} onClick={() => perform(action)}><Icon name={action} /><kbd>{["Q", "F / ◉", t.space, "E"][i]}</kbd><span>{t.actions[i]}</span></button>)}</div>
    </footer>
    {hud.secret && <span className="ob-secret">✧ {t.secret}</span>}
    {!ready && <div className="ob-loading"><div className="ob-loader" /><h1>{failed ? t.error : t.loading}</h1>{failed && <><button className="ob-button" onClick={() => location.reload()}>{t.retry}</button><a href="/portfolio">{t.portfolio} ↗</a></>}</div>}
    <dialog className="ob-dialog" ref={dialog} onCancel={event => { event.preventDefault(); openModal(null); }} aria-labelledby="ob-dialog-title">
      <div className="ob-dialog-head"><small>DRY / {practice ? t.practice : t.tutorial}</small><button aria-label={t.close} onClick={() => openModal(null)}>×</button></div>
      <h2 id="ob-dialog-title">{modal === "lab" ? t.tests : modal === "journal" ? t.journal : modal === "complete" ? t.complete : t.settings}</h2>
      {modal === "pause" && <><div className="ob-languages">{(["pt", "en", "es"] as Lang[]).map(l => <button key={l} aria-pressed={lang === l} onClick={() => { setLang(l); const url = new URL(location.href); url.searchParams.set("lang", l); history.replaceState(null, "", url); }}>{({ pt: "Português", en: "English", es: "Español" })[l]}</button>)}</div>{checkbox("sound")}{checkbox("assist")}{checkbox("autoAim")}{checkbox("reduced")}{checkbox("overview")}<details><summary>{t.help}</summary><p>WASD / ↑ ↓ ← → · {t.move}<br />Q · {t.actions[0]}<br />F / {lang === "pt" ? "clique" : lang === "es" ? "clic" : "click"} · {t.actions[1]}<br />{t.space} · {t.actions[2]}<br />E · {t.actions[3]}</p><p>{t.hints[hud.phase]}</p></details><button className="ob-button" onClick={() => openModal(null)}>{t.resume}</button></>}
      {modal === "lab" && <><p>{t.testInfo}</p>{practice ? <><div className="ob-metrics"><span>{hud.fps} FPS</span><span>{hud.fps ? (1000 / hud.fps).toFixed(1) : "—"} ms</span><span>{hud.x}, {hud.y}</span></div>{checkbox("debug")}{checkbox("invincible")}{checkbox("overview")}{checkbox("reduced")}<label className="ob-range">{t.speed} <output>{settings.speed} px/s</output><input type="range" min="120" max="320" step="10" value={settings.speed} onChange={e => setting("speed", Number(e.target.value))} /></label><label className="ob-range">{t.dodge} <output>{settings.dodgeDuration.toFixed(2)} s</output><input type="range" min="0.16" max="0.4" step="0.02" value={settings.dodgeDuration} onChange={e => setting("dodgeDuration", Number(e.target.value))} /></label><p>{t.restart}</p><div className="ob-reset"><button onClick={() => reset("puzzle")}>{t.puzzle}</button><button onClick={() => reset("drone")}>{t.drone}</button><button onClick={() => reset("all")}>{t.reset}</button></div><button className="ob-button" onClick={() => openModal(null)}>{t.resume}</button><button className="ob-link" onClick={switchMode}>{t.normal}</button></> : <button className="ob-button" onClick={switchMode}>{lang === "pt" ? "Entrar no laboratório" : lang === "en" ? "Enter test lab" : "Entrar al laboratorio"}</button>}</>}
      {modal === "journal" && <><p className="ob-journal">{t.journalBody}</p><button className="ob-button" onClick={() => openModal(null)}>{t.close}</button></>}
      {modal === "complete" && <><div className="ob-complete-mark">✧</div><p>{t.completeBody}</p><button className="ob-button" onClick={() => openModal(null)}>{t.continue}</button><a className="ob-link" href={`/portfolio?lang=${lang}`}>{t.portfolio} ↗</a></>}
    </dialog>
  </main>;
}
