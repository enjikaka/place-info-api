import { assertEquals } from "https://deno.land/std@0.204.0/assert/mod.ts";
import { getStartOfSeason, handler } from './arstidstart.js';

import { coords, coords_jämtland, testRequestHandler } from './test-helpers.ts';

Deno.test('getStartOfSeason(vinter)', async () => {
  const vinterStart = await getStartOfSeason(coords, 'vinter');

  assertEquals(vinterStart, '--11-01/--11-30');
});

Deno.test('getStartOfSeason(var)', async () => {
  const vinterStart = await getStartOfSeason(coords, 'var');

  assertEquals(vinterStart, '--03-01/--03-31');
});

Deno.test('getStartOfSeason(sommar)', async () => {
  const vinterStart = await getStartOfSeason(coords, 'sommar');

  assertEquals(vinterStart, '--05-05/--05-31');
});

Deno.test('getStartOfSeason(host)', async () => {
  const vinterStart = await getStartOfSeason(coords, 'host');

  assertEquals(vinterStart, '--09-01/--09-30');
});

Deno.test('handler - coords', async () => {
  const json = await testRequestHandler(coords, handler);

  const expected = {
    value: {
      vinter: "--11-01/--11-30",
      vår: "--03-01/--03-31",
      sommar: "--05-05/--05-31",
      höst: "--09-01/--09-30"
    },
    metadata: {
      description: "<redacted>",
      source: "SMHI",
      extent: { area: "Sverige", timePeriod: "1961-01-01/1990-12-31" }
    }
  };

  assertEquals(json.value, expected.value);
  assertEquals(json.metadata.source, expected.metadata.source);
});

Deno.test('[coords_jämtland] handler', async () => {
  const json = await testRequestHandler(coords_jämtland, handler);

  const expected = {
    value: {
      vinter: "--11-01/--11-30",
      vår: "--04-01/--04-31",
      sommar: "--06-01/--06-30",
      höst: "--09-01/--09-30"
    },
    metadata: {
      description: "<redacted>",
      source: "SMHI",
      extent: { area: "Sverige", timePeriod: "1961-01-01/1990-12-31" }
    }
  };

  assertEquals(json.value, expected.value);
  assertEquals(json.metadata.source, expected.metadata.source);
});