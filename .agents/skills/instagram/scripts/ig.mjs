#!/usr/bin/env node
// Client minimal de l'API Instagram (Graph API) pour le compte Cavalons.
// Aucune dépendance : Node 18+ (fetch natif).
//
// Variables d'environnement :
//   IG_ACCESS_TOKEN  jeton d'accès longue durée (obligatoire)
//   IG_USER_ID       identifiant du compte Instagram professionnel (obligatoire pour media, publish)
//   IG_GRAPH_HOST    graph.facebook.com (défaut, connexion via Facebook) ou graph.instagram.com
//   IG_API_VERSION   v21.0 par défaut
//
// Usage : node ig.mjs <commande> [options]   (voir `node ig.mjs help`)

const HOST = process.env.IG_GRAPH_HOST || "graph.facebook.com";
const VERSION = process.env.IG_API_VERSION || "v21.0";
const TOKEN = process.env.IG_ACCESS_TOKEN;
const USER_ID = process.env.IG_USER_ID;

const HELP = `Commandes :
  me                                   Vérifie le jeton et affiche le compte
  media [--limit 10]                   Derniers posts (id, date, légende, nb de commentaires)
  comments <media_id> [--limit 50]     Commentaires d'un post, avec leurs réponses
  comment <media_id> --message "..."   Commente un post du compte
  reply <comment_id> --message "..."   Répond à un commentaire
  hide <comment_id> [--unhide]         Masque (ou réaffiche) un commentaire
  delete-comment <comment_id>          Supprime un commentaire
  mentions [--limit 25]                Posts où le compte est identifié (tags)
  publish --image <url> --caption "..." Publie une photo tout de suite

Les commandes d'écriture (comment, reply, hide, delete-comment, publish)
ne s'exécutent qu'avec --yes ; sans --yes elles affichent ce qui serait envoyé.`;

function parseArgs(argv) {
  const positional = [];
  const flags = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith("--")) flags[key] = true;
      else flags[key] = argv[++i];
    } else positional.push(a);
  }
  return { positional, flags };
}

function fail(msg) {
  console.error(`Erreur : ${msg}`);
  process.exit(1);
}

async function api(method, path, params = {}) {
  if (!TOKEN) fail("IG_ACCESS_TOKEN n'est pas défini.");
  const url = new URL(`https://${HOST}/${VERSION}/${path}`);
  const body = new URLSearchParams();
  const target = method === "GET" ? url.searchParams : body;
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) target.set(k, String(v));
  }
  url.searchParams.set("access_token", TOKEN);
  const res = await fetch(url, {
    method,
    body: method === "GET" ? undefined : body,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.error) {
    const e = data.error || {};
    fail(`${res.status} ${e.type || ""} ${e.message || res.statusText}`.trim());
  }
  return data;
}

function requireUser() {
  if (!USER_ID) fail("IG_USER_ID n'est pas défini.");
  return USER_ID;
}

function requireArg(value, name) {
  if (!value || value === true) fail(`argument manquant : ${name}`);
  return value;
}

function guardWrite(flags, description, payload) {
  if (flags.yes) return true;
  console.log(JSON.stringify({ dry_run: true, action: description, payload }, null, 2));
  console.log("Rien n'a été envoyé. Relancez avec --yes pour exécuter.");
  return false;
}

const out = (data) => console.log(JSON.stringify(data, null, 2));

async function main() {
  const { positional, flags } = parseArgs(process.argv.slice(2));
  const [cmd, id] = positional;

  switch (cmd) {
    case "me":
      return out(
        await api("GET", requireUser(), {
          fields: "id,username,name,followers_count,media_count",
        }),
      );

    case "media":
      return out(
        await api("GET", `${requireUser()}/media`, {
          fields: "id,caption,media_type,timestamp,permalink,comments_count,like_count",
          limit: flags.limit || 10,
        }),
      );

    case "comments":
      return out(
        await api("GET", `${requireArg(id, "media_id")}/comments`, {
          fields: "id,text,username,timestamp,like_count,hidden,replies{id,text,username,timestamp}",
          limit: flags.limit || 50,
        }),
      );

    case "comment": {
      const mediaId = requireArg(id, "media_id");
      const message = requireArg(flags.message, "--message");
      if (!guardWrite(flags, "comment", { media_id: mediaId, message })) return;
      return out(await api("POST", `${mediaId}/comments`, { message }));
    }

    case "reply": {
      const commentId = requireArg(id, "comment_id");
      const message = requireArg(flags.message, "--message");
      if (!guardWrite(flags, "reply", { comment_id: commentId, message })) return;
      return out(await api("POST", `${commentId}/replies`, { message }));
    }

    case "hide": {
      const commentId = requireArg(id, "comment_id");
      const hide = !flags.unhide;
      if (!guardWrite(flags, hide ? "hide" : "unhide", { comment_id: commentId })) return;
      return out(await api("POST", commentId, { hide }));
    }

    case "delete-comment": {
      const commentId = requireArg(id, "comment_id");
      if (!guardWrite(flags, "delete-comment", { comment_id: commentId })) return;
      return out(await api("DELETE", commentId));
    }

    case "mentions":
      return out(
        await api("GET", `${requireUser()}/tags`, {
          fields: "id,caption,username,timestamp,permalink,comments_count",
          limit: flags.limit || 25,
        }),
      );

    case "publish": {
      const image_url = requireArg(flags.image, "--image");
      const caption = typeof flags.caption === "string" ? flags.caption : "";
      if (!guardWrite(flags, "publish", { image_url, caption })) return;
      const user = requireUser();
      const container = await api("POST", `${user}/media`, { image_url, caption });
      return out(await api("POST", `${user}/media_publish`, { creation_id: container.id }));
    }

    case undefined:
    case "help":
    case "--help":
      return console.log(HELP);

    default:
      fail(`commande inconnue « ${cmd} ».\n\n${HELP}`);
  }
}

main();
