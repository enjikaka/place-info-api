import { assertEquals } from "https://deno.land/std@0.204.0/assert/mod.ts";
import { handler, getSunshineHours } from './solskenstid.js';
import type { Coordinates } from './helpers.js';

const barlingshultCoords: Coordinates = [12.312287, 59.512382];

Deno.test('getSunshineHours(april)', async () => {
  const result = await getSunshineHours(barlingshultCoords, 'apr');

  const expected = {
    "--04": "160-180",
  };

  assertEquals(result, expected);
});

Deno.test('getSunshineHours(year)', async () => {
  const result = await getSunshineHours(barlingshultCoords, 'year');

  const expected = {
    "year": "1600-1800",
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
      "--02": "80-100",
      "--04": "160-180",
      "--06": "240-260",
      "--08": "200-220",
      "--10": "100-120",
      "--12": "40-60",
      "year": "1600-1800"
    },
    unit: 'h',
    metadata: {
      description: "<redacted>",
      source: "SMHI",
      extent: { area: "Sverige", timePeriod: "1961-01-01/1990-12-31" }
    }
  };

  assertEquals(json.unit, expected.unit);
  assertEquals(json.value, expected.value);
  assertEquals(json.metadata.source, expected.metadata.source);
});