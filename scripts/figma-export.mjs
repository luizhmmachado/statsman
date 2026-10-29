#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const token = process.env.FIGMA_TOKEN;
const fileKey = process.env.FIGMA_FILE_KEY || process.argv[2];
const outputDir = process.env.FIGMA_OUT || "docs/design";
const framePrefix = process.env.FIGMA_FRAME_PREFIX || "";

if (!token || !fileKey) {
  console.error("Uso: FIGMA_TOKEN=... FIGMA_FILE_KEY=... node scripts/figma-export.mjs");
  console.error("Ou:  FIGMA_TOKEN=... node scripts/figma-export.mjs <fileKey>");
  process.exit(1);
}

const apiBase = "https://api.figma.com/v1";

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function figmaFetch(url) {
  const response = await fetch(url, {
    headers: { "X-Figma-Token": token },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Figma API ${response.status}: ${body.slice(0, 300)}`);
  }

  return response.json();
}

function collectFrames(node, frames, pageName) {
  if (!node) return;

  if (node.type === "FRAME" || node.type === "COMPONENT") {
    if (!framePrefix || node.name.startsWith(framePrefix)) {
      frames.push({
        id: node.id,
        name: node.name,
        page: pageName,
        width: node.absoluteBoundingBox?.width ?? null,
        height: node.absoluteBoundingBox?.height ?? null,
      });
    }
    return;
  }

  for (const child of node.children ?? []) {
    collectFrames(child, frames, pageName);
  }
}

async function main() {
  await mkdir(path.join(outputDir, "screens"), { recursive: true });

  console.log(`Buscando arquivo ${fileKey}...`);
  const file = await figmaFetch(`${apiBase}/files/${encodeURIComponent(fileKey)}?depth=4`);
  await writeFile(path.join(outputDir, "figma-file.json"), JSON.stringify(file, null, 2));

  const pages = file.document?.children ?? [];
  const frames = [];
  for (const page of pages) {
    for (const child of page.children ?? []) {
      collectFrames(child, frames, page.name);
    }
  }

  if (frames.length === 0) {
    console.error("Nenhum frame encontrado. Verifique se o arquivo tem frames e se o token tem acesso.");
    process.exit(2);
  }

  const manifest = {
    fileKey,
    fileName: file.name,
    exportedAt: new Date().toISOString(),
    frames,
  };
  await writeFile(path.join(outputDir, "manifest.json"), JSON.stringify(manifest, null, 2));
  console.log(`${frames.length} frame(s) encontrado(s).`);

  const batchSize = 40;
  const images = {};

  for (let index = 0; index < frames.length; index += batchSize) {
    const batch = frames.slice(index, index + batchSize);
    const ids = batch.map((frame) => frame.id).join(",");
    const url = `${apiBase}/images/${encodeURIComponent(fileKey)}?ids=${encodeURIComponent(ids)}&format=png&scale=2`;
    console.log(`Solicitando imagens ${index + 1}-${index + batch.length}...`);
    const result = await figmaFetch(url);
    Object.assign(images, result.images ?? {});
    if (result.err) console.error(`Aviso do Figma: ${result.err}`);
  }

  let downloaded = 0;
  for (const frame of frames) {
    const imageUrl = images[frame.id];
    if (!imageUrl) {
      console.error(`Sem imagem para ${frame.name} (${frame.id})`);
      continue;
    }

    const response = await fetch(imageUrl);
    if (!response.ok) {
      console.error(`Falha ao baixar ${frame.name}: HTTP ${response.status}`);
      continue;
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const fileName = `${slugify(frame.name)}.png`;
    await writeFile(path.join(outputDir, "screens", fileName), buffer);
    downloaded += 1;
    console.log(`  ${fileName}`);
  }

  console.log(`Concluido: ${downloaded} imagem(ns) em ${outputDir}/screens`);
  console.log(`Manifesto: ${outputDir}/manifest.json`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
