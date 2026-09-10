"use client";
import { useEffect, useRef, useState, type MutableRefObject } from "react";
import type { GameBridge } from "./bridge";

export default function PhaserView({ bridge }: { bridge: MutableRefObject<GameBridge | null> }) {
  const parent = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let cancelled = false;
    let dispose: (() => void) | undefined;
    import("./world-scene").then(({ createWorldGame }) => {
      if (!cancelled && parent.current) dispose = createWorldGame(parent.current, bridge, () => setFailed(true), () => setReady(true));
    }).catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; dispose?.(); };
  }, [bridge]);
  return <>
    <div className="phaser-world" ref={parent} aria-busy={!ready && !failed} role="img" aria-label="DRY — mundo 2D / 2D world / mundo 2D" />
    {!ready && !failed && <p className="game-loading" role="status">Carregando / Loading / Cargando…</p>}
    {failed && <div className="game-load-error" role="alert"><p>Não foi possível carregar o jogo. / Could not load the game. / No se pudo cargar el juego.</p><button onClick={() => location.reload()}>Tentar novamente / Retry / Reintentar</button><a href="/portfolio">Portfólio / Portfolio</a></div>}
  </>;
}
