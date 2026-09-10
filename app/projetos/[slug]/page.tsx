import { notFound } from "next/navigation";
import { projects, type Lang } from "../../content/portfolio";
import { projectSlug, projectSummary } from "../../content/cases";
export function generateStaticParams() { return projects.map(project => ({ slug: projectSlug(project.name) })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projects.find(item => projectSlug(item.name) === slug);
  return { title: `${project?.name ?? "Projeto"} | Adryel Luís Rodrigues`, description: project ? projectSummary(project.name, "pt") : undefined };
}
export default async function ProjectPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ lang?: string }> }) {
  const { slug } = await params; const query = await searchParams;
  const lang: Lang = query.lang === "en" || query.lang === "es" ? query.lang : "pt";
  const project = projects.find(item => projectSlug(item.name) === slug);
  if (!project) notFound();
  const t = { pt: { back: "Voltar aos projetos", context: "Contexto e participação", stack: "Tecnologias desta aplicação", evidence: "Conheça o projeto", repository: "Ver TCC no repositório institucional", demo: "Abrir demonstração", note: "O material disponível apresenta o projeto e sua proposta. Resultados de produção e métricas de uso não foram informados.", talk: "Conversar sobre este projeto" }, en: { back: "Back to projects", context: "Context and contribution", stack: "Application technologies", evidence: "Explore the project", repository: "Read the institutional capstone", demo: "Open demo", note: "The available material presents the project and its purpose. Production outcomes and usage metrics have not been provided.", talk: "Discuss this project" }, es: { back: "Volver a proyectos", context: "Contexto y participación", stack: "Tecnologías de esta aplicación", evidence: "Conoce el proyecto", repository: "Ver proyecto final en el repositorio", demo: "Abrir demostración", note: "El material disponible presenta el proyecto y su propósito. No se han proporcionado resultados de producción ni métricas de uso.", talk: "Hablar de este proyecto" } }[lang];
  return <main className="case-page" lang={lang}><nav><a href={`/portfolio?lang=${lang}#projects`}>← {t.back}</a><div>{(["pt", "en", "es"] as const).map(code => <a key={code} href={`?lang=${code}`} aria-current={code === lang ? "page" : undefined}>{code.toUpperCase()}</a>)}</div></nav><article><p className="kicker">{project.role[lang]}</p><h1>{project.name}</h1><h2>{t.context}</h2><p>{projectSummary(project.name, lang)}</p><h2>{t.stack}</h2><p>{project.stack}</p><h2>{t.evidence}</h2><a className="primary" href={project.href} target="_blank" rel="noopener noreferrer">{slug === "mente" ? t.repository : t.demo} ↗</a><footer><a href="mailto:adryel.luis.r@gmail.com">{t.talk}</a></footer></article></main>;
}
