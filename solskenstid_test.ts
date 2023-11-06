import { assertEquals } from "https://deno.land/std@0.204.0/assert/mod.ts";
import { handler, getSunshineHours } from './solskenstid.js';

import { coords, testRequestHandler } from './test-helpers.ts';

Deno.test('getSunshineHours(april)', async () => {
  const result = await getSunshineHours(coords, 'apr');

  const expected = {
    "--04": "160-180",
  };

  assertEquals(result, expected);
});

Deno.test('getSunshineHours(year)', async () => {
  const result = await getSunshineHours(coords, 'year');

  const expected = {
    "year": "1600-1800",
  };

  assertEquals(result, expected);
});

Deno.test('handler', async () => {
  const json = await testRequestHandler(coords, handler);

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