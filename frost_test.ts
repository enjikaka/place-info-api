import { assertEquals } from "https://deno.land/std@0.204.0/assert/mod.ts";
import { handler, getFirstAutumnFrostDate, getLastSpringFrostDate } from './frost.js';

import { coords, testRequestHandler } from './test-helpers.ts';

Deno.test('getFirstAutumnFrostDate', async () => {
  const autumnFrostDate = await getFirstAutumnFrostDate(coords);

  assertEquals(autumnFrostDate, '--10-1');
});

Deno.test('getLastSpringFrostDate', async () => {
  const springFrostDate = await getLastSpringFrostDate(coords);

  assertEquals(springFrostDate, '--05-1/--05-15');
});

Deno.test('handler', async () => {
  const json = await testRequestHandler(coords, handler);

  const expected = {
    value: {
      höstfrost: "--10-1",
      vårfrost: "--05-1/--05-15"
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