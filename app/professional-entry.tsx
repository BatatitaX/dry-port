"use client";
import { useState, useEffect } from "react";
import { QuickPortfolio } from "./quick-portfolio";
import { ui, type Lang } from "./content/portfolio";
export default function ProfessionalEntry() {
  const [lang, setLang] = useState<Lang>("pt");
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    const frame = requestAnimationFrame(() => { update();
      const language = new URLSearchParams(location.search).get("lang");
      if (language === "en" || language === "es") setLang(language);
    });
    media.addEventListener("change", update);
    return () => { cancelAnimationFrame(frame); media.removeEventListener("change", update); };
  }, []);
  useEffect(() => { document.documentElement.lang = lang === "pt" ? "pt-BR" : lang; }, [lang]);
  return <QuickPortfolio lang={lang} setLang={next => { setLang(next); const url = new URL(location.href); url.searchParams.set("lang", next); history.replaceState(null, "", url); }} onJourney={() => location.assign(`/jornada?lang=${lang}`)} t={ui[lang]} jaoUnlocked={false} reducedMotion={reduced} />;
}
