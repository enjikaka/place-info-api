import { assertEquals } from "https://deno.land/std@0.204.0/assert/mod.ts";
import { handler, getLithology } from './lithology.js';

import { coords, coords_jämtland, testRequestHandler } from './test-helpers.ts';

Deno.test('getLithology', async () => {
  const result = await getLithology(coords);

  assertEquals(result.type, 'bergart');
});

Deno.test('[coords_jämtland] handler', async () => {
  const json = await testRequestHandler(coords_jämtland, handler);

  assertEquals(json.value.type, 'bergart');
});

Deno.test('handler', async () => {
  const json = await testRequestHandler(coords, handler);

  assertEquals(json.value.type, 'bergart');
});