import { assertEquals } from "https://deno.land/std@0.204.0/assert/mod.ts";
import { handler, getGlobalRadiation } from './globalstralning.js';
import type { Coordinates } from './helpers.js';

const barlingshultCoords: Coordinates = [12.312287, 59.512382];

Deno.test('getGlobalRadiation(april)', async () => {
  const result = await getGlobalRadiation(barlingshultCoords, 'apr');

  const expected = {
    "--04": "100-110",
  };

  assertEquals(result, expected);
});

Deno.test('getGlobalRadiation(year)', async () => {
  const result = await getGlobalRadiation(barlingshultCoords, 'year');

  const expected = {
    "year": "750-800",
  };

  assertEquals(result, expected);
});

Deno.test('handler', async () => {
  const url = new URL('/?lat=59.512382&lng=12.312287', 'http://localhost:8080');
  const req = new Request(url);
  const res = await handler(req);

  const json = await res.json();

  const expected = {
    value: {
      "--02": "20-30",
      "--04": "100-110",
      "--06": "170-180",
      "--08": "120-130",
      "--10": "30-40",
      "--12": "0-10",
      "year": "750-800"
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