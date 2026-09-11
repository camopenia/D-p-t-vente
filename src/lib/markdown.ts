import { marked } from "marked";

marked.setOptions({ gfm: true, breaks: false });

/** Rendu Markdown → HTML pour les contenus rédigés par l'équipe (guides, pages statiques). */
export function renderMarkdown(md: string): string {
  return marked.parse(md.trim(), { async: false }) as string;
}
