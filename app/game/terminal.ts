import type { GameLang } from "./data";
export const terminalCopy = {
  pt: { welcome: "Digite help para listar os comandos.", files: "poemas/  projetos/", locked: "Biblioteca musical bloqueada: encontre Jão.", success: "Python executado com sucesso. Nenhum erro encontrado.", error: "SyntaxError: o caminho precisa ser depurado.", unknown: "comando não encontrado" },
  en: { welcome: "Type help to list commands.", files: "poems/  projects/", locked: "Music library locked: find Jão.", success: "Python ran successfully. No errors found.", error: "SyntaxError: the path needs debugging.", unknown: "command not found" },
  es: { welcome: "Escribe help para ver los comandos.", files: "poemas/  proyectos/", locked: "Biblioteca musical bloqueada: encuentra a Jão.", success: "Python se ejecutó correctamente. No se encontraron errores.", error: "SyntaxError: hay que depurar el camino.", unknown: "comando no encontrado" },
} satisfies Record<GameLang, Record<string, string>>;
export function terminalResponse(command: string, lang: GameLang, jaoUnlocked: boolean, bossDefeated: boolean): string {
  const t = terminalCopy[lang];
  if (command === "help") return "help · whoami · ls · music · python · clear";
  if (command === "whoami") return "Adryel Luís Rodrigues // ADS // Full Stack";
  if (command === "ls") return `${t.files}  ${jaoUnlocked ? "jao/  " : ""}README.md`;
  if (command === "music") return jaoUnlocked ? "Jão — Lobos · Anti-Herói · Pirata · Super · Supernova · Memórias Póstumas" : t.locked;
  if (command === "python") return bossDefeated ? t.success : t.error;
  return `${t.unknown}: ${command}`;
}
