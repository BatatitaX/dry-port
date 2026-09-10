import { memories, type Lang } from "./portfolio";
export const projectSlug = (name: string) => ({ PREVER: "prever", "SMDN Visualizer": "visualizer", "R-Universe": "runiverse", "Mente Inabalável": "mente" }[name] ?? "dry");
export function projectSummary(name: string, lang: Lang): string {
  const id = projectSlug(name);
  if (id === "visualizer") return { pt: "Site de apresentação do ecossistema PREVER. Flutter, PostGIS e Vertex AI pertencem ao contexto do ecossistema, não à stack desta interface.", en: "Showcase website for the PREVER ecosystem. Flutter, PostGIS and Vertex AI describe the broader ecosystem, not this interface’s stack.", es: "Sitio de presentación del ecosistema PREVER. Flutter, PostGIS y Vertex AI describen el ecosistema, no la stack de esta interfaz." }[lang];
  return memories.find(memory => memory.id === id)?.body[lang] ?? "";
}
