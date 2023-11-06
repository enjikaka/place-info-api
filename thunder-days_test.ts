import { assertEquals } from "https://deno.land/std@0.204.0/assert/mod.ts";
import { handler, getThunderDays } from './thunder-days.js';

import { coords, testRequestHandler } from './test-helpers.ts';

Deno.test('getThunderDays', async () => {
  const result = await getThunderDays(coords);

  assertEquals(result.value, '12–16');
  assertEquals(result.unit, 'd');
});

Deno.test('handler', async () => {
  const json = await testRequestHandler(coords, handler);

  const expected = {
    value: '12–16',
    unit: 'd',
    metadata: {
      description: "<redacted>",
      source: "SMHI",
      extent: { area: "Sverige", timePeriod: "1961-01-01/1990-12-31" }
    }
  };

  assertEquals(json.value, expected.value);
  assertEquals(json.unit, expected.unit);
  assertEquals(json.metadata.source, expected.metadata.source);
});