import { assertEquals } from "https://deno.land/std@0.204.0/assert/mod.ts";
import { handler, getFirstAutumnFrostDate, getLastSpringFrostDate } from './frost.js';

import { coords, coords_jämtland, testRequestHandler } from './test-helpers.ts';

Deno.test('getFirstAutumnFrostDate', async () => {
  const autumnFrostDate = await getFirstAutumnFrostDate(coords);

  assertEquals(autumnFrostDate, '--10-01');
});

Deno.test('getLastSpringFrostDate', async () => {
  const springFrostDate = await getLastSpringFrostDate(coords);

  assertEquals(springFrostDate, '--05-01/--05-15');
});

Deno.test('[coords_jämtland] handler', async () => {
  const json = await testRequestHandler(coords_jämtland, handler);

  const expected = {
    value: {
      första: "--09-15",
      sista: "--05-15/--06-01"
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

Deno.test('handler', async () => {
  const json = await testRequestHandler(coords, handler);

  const expected = {
    value: {
      första: "--10-01",
      sista: "--05-01/--05-15"
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