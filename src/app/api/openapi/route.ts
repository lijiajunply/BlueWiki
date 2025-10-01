import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

async function parsePrismaModels(prismaPath: string) {
  try {
    const text = await fs.readFile(prismaPath, 'utf-8');
    const modelRe = /model\s+(\w+)\s+\{([\s\S]*?)\n\}/g;
    const enumRe = /enum\s+(\w+)\s+\{([\s\S]*?)\n\}/g;
    const enums: Record<string, string[]> = {};
    let em: RegExpExecArray | null;
    while ((em = enumRe.exec(text))) {
      const name = em[1];
      const body = em[2];
      const values = body.split(/\n/).map(l => l.trim()).filter(Boolean).map(l => l.replace(/,$/, ''));
      enums[name] = values;
    }
  const models: Record<string, Record<string, unknown>> = {};
    let m: RegExpExecArray | null;
    while ((m = modelRe.exec(text))) {
      const name = m[1];
      const body = m[2];
      const lines = body.split(/\n/).map(l => l.trim()).filter(Boolean);
  const props: Record<string, Record<string, unknown>> = {};
      for (const line of lines) {
        // skip comments
        if (line.startsWith('//')) continue;
        const parts = line.split(/\s+/);
        const field = parts[0];
        const type = parts[1];
        if (!field || !type) continue;
  let schema: Record<string, unknown> = { type: 'string' };
  if (/^Int$/.test(type)) schema = { type: 'integer' };
        else if (/^String$/.test(type)) schema = { type: 'string' };
        else if (/^DateTime$/.test(type)) schema = { type: 'string', format: 'date-time' };
        else if (/^Boolean$/.test(type)) schema = { type: 'boolean' };
        else if (/^Float$/.test(type)) schema = { type: 'number' };
        else if (/^Json$/.test(type)) schema = { type: 'object' };
        else if (/^[A-Z]/.test(type)) {
          // could be enum or relation to another model
          if (enums[type]) {
            schema = { type: 'string', enum: enums[type] };
          } else if (/Id$/.test(field)) {
            schema = { type: 'integer' };
          } else {
            schema = { type: 'object' };
          }
        }
        props[field] = schema;
      }
        models[name] = { type: 'object', properties: props };
    }
      // include enums as separate schemas
      for (const en in enums) {
        models[en] = { type: 'string', enum: enums[en] } as Record<string, unknown>;
      }
      return models;
  } catch (err) {
    console.error('Failed to parse prisma schema:', err);
    return {};
  }
}

async function scanApiRoutes(apiDir: string) {
  const paths: Record<string, Record<string, unknown>> = {};

  async function walk(dir: string) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) await walk(full);
      else if (e.isFile() && e.name === 'route.ts') {
        // build API path from directory relative to src/app
        const rel = path.relative(path.join(process.cwd(), 'src', 'app'), full);
        // rel looks like api/users/route.ts or api/pages/[...path]/route.ts
        const dirParts = path.dirname(rel).split(path.sep);
        const apiParts = dirParts.slice(1); // drop leading 'api'
        const urlPath = '/' + apiParts.map(p => p.replace(/\[\.\.\.?(\w+)\]/, (s, g) => `{${g}}`).replace(/\[(\w+)\]/, (s, g) => `{${g}}`)).join('/');

        // read file and detect exported methods
        const content = await fs.readFile(full, 'utf-8');
        const methods = Array.from(content.matchAll(/export\s+async\s+function\s+(GET|POST|PUT|DELETE|PATCH)\s*\(/g)).map(r => r[1]);
        if (methods.length === 0) continue;

        paths[urlPath] = paths[urlPath] || {};
        for (const method of methods) {
          const lower = method.toLowerCase();
          // infer path parameters from {param} placeholders
          const params: Array<Record<string, unknown>> = [];
          const paramMatches = urlPath.matchAll(/\{(\w+)\}/g);
          for (const pm of paramMatches) {
            params.push({ name: pm[1], in: 'path', required: true, schema: { type: 'string' } });
          }
          paths[urlPath] = paths[urlPath] || {};
          (paths[urlPath] as Record<string, unknown>)[lower] = {
            summary: `${method} ${urlPath}`,
            parameters: params,
            responses: { '200': { description: 'OK' } },
          };
        }
      }
    }
  }

  try {
    await walk(apiDir);
  } catch (err) {
    console.error('Failed to scan api routes:', err);
  }

  return paths as Record<string, unknown>;
}

export async function GET() {
  // build spec dynamically
  const prismaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
  const apiDir = path.join(process.cwd(), 'src', 'app', 'api');

  const schemas = await parsePrismaModels(prismaPath);
  const paths = await scanApiRoutes(apiDir);

  const spec = {
    openapi: '3.0.1',
    info: { title: 'BlueWiki API (auto-generated)', version: '1.0.0' },
    servers: [{ url: '/' }],
    components: { schemas },
    paths,
  };

  return NextResponse.json(spec);
}

