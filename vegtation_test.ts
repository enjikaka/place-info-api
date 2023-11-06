import { assertEquals } from "https://deno.land/std@0.204.0/assert/mod.ts";
import { handler, getVegetationPeriodLength } from './vegetation.js';
import type { Coordinates } from './helpers.js';

const barlingshultCoords: Coordinates = [12.312287, 59.512382];

Deno.test('getVegetationPeriodLength(dygnsmaxtemp)', async () => {
  const [value, unit] = await getVegetationPeriodLength(barlingshultCoords);

  assertEquals(value, '180-190');
  assertEquals(unit, 'dygn');
});

Deno.test('handler', async () => {
  const url = new URL('/?lat=59.512382&lng=12.312287', 'http://localhost:8080');
  const req = new Request(url);
  const res = await handler(req);

  const json = await res.json();

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