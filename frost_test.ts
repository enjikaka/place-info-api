import { assertEquals } from "https://deno.land/std@0.204.0/assert/mod.ts";
import { handler, getFirstAutumnFrostDate, getLastSpringFrostDate } from './frost.js';

import { coords, coords2, testRequestHandler } from './test-helpers.ts';

Deno.test('getFirstAutumnFrostDate', async () => {
  const autumnFrostDate = await getFirstAutumnFrostDate(coords);

  assertEquals(autumnFrostDate, '--10-01');
});

Deno.test('getLastSpringFrostDate - coords', async () => {
  const springFrostDate = await getLastSpringFrostDate(coords);

  assertEquals(springFrostDate, '--05-01/--05-15');
});

Deno.test('getLastSpringFrostDate - coords2', async () => {
  const springFrostDate = await getLastSpringFrostDate(coords2);

  assertEquals(springFrostDate, '--05-15/--06-01');
});

Deno.test('handler', async () => {
  const json = await testRequestHandler(coords, handler);

  const expected = {
    value: {
      höstfrost: "--10-01",
      vårfrost: "--05-01/--05-15"
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