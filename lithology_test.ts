import { assertEquals } from "https://deno.land/std@0.204.0/assert/mod.ts";
import { handler, getLithology } from './lithology.js';
import type { Coordinates } from './helpers.js';

const barlingshultCoords: Coordinates = [12.312287, 59.512382];

Deno.test('getLithology', async () => {
  const result = await getLithology(barlingshultCoords);

  assertEquals(result.type, 'bergart');
});

Deno.test('handler', async () => {
  const url = new URL('/?lat=59.512382&lng=12.312287', 'http://localhost:8080');
  const req = new Request(url);
  const res = await handler(req);

  const json = await res.json();

  assertEquals(json.value.type, 'bergart');
});