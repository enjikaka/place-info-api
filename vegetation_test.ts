import { assertEquals } from "https://deno.land/std@0.204.0/assert/mod.ts";
import { handler, getVegetationPeriodLength } from './vegetation.js';

import { coords, testRequestHandler } from './test-helpers.ts';

Deno.test('getVegetationPeriodLength(dygnsmaxtemp)', async () => {
  const [value, unit] = await getVegetationPeriodLength(coords);

  assertEquals(value, '180-190');
  assertEquals(unit, 'dygn');
});

Deno.test('handler', async () => {
  const json = await testRequestHandler(coords, handler);

  const expected = {
    value: '180-190',
    unit: 'dygn',
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