import { assertEquals } from "https://deno.land/std@0.204.0/assert/mod.ts";
import { handler, getClearDays } from './clear-days.js';

import { coords, testRequestHandler } from './test-helpers.ts';

Deno.test('getClearDays', async () => {
  const result = await getClearDays(coords);

  assertEquals(result.value, '50–60');
  assertEquals(result.unit, 'd');
});

Deno.test('handler', async () => {
  const json = await testRequestHandler(coords, handler);

  const expected = {
    value: '50–60',
    unit: 'd',
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