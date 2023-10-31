import { assertEquals } from "https://deno.land/std@0.204.0/assert/mod.ts";
import { getStartOfSeason, handler } from './arstidstart.js';
import type { Coordinates } from "./helpers.js";

const barlingshultCoords: Coordinates = [12.312287, 59.512382];

Deno.test('getStartOfSeason(vinter)', async () => {
  const vinterStart = await getStartOfSeason(barlingshultCoords, 'vinter');

  assertEquals(vinterStart, '--11-01/--11-30');
});

Deno.test('getStartOfSeason(var)', async () => {
  const vinterStart = await getStartOfSeason(barlingshultCoords, 'var');

  assertEquals(vinterStart, '--03-01/--03-31');
});

Deno.test('getStartOfSeason(sommar)', async () => {
  const vinterStart = await getStartOfSeason(barlingshultCoords, 'sommar');

  assertEquals(vinterStart, '--05-05/--05-31');
});

Deno.test('getStartOfSeason(host)', async () => {
  const vinterStart = await getStartOfSeason(barlingshultCoords, 'host');

  assertEquals(vinterStart, '--09-01/--09-30');
});

Deno.test('handler', async () => {
  const url = new URL('/?lat=59.512382&lng=12.312287', 'http://localhost:8080');
  const req = new Request(url);
  const res = await handler(req);

  const json = await res.json();

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