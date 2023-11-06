import { assertEquals } from "https://deno.land/std@0.204.0/assert/mod.ts";
import { handler, getClearDays } from './clear-days.js';
import type { Coordinates } from './helpers.js';

const barlingshultCoords: Coordinates = [12.312287, 59.512382];

Deno.test('getClearDays', async () => {
  const result = await getClearDays(barlingshultCoords);

  assertEquals(result.value, '50–60');
  assertEquals(result.unit, 'd');
});

Deno.test('handler', async () => {
  const url = new URL('/?lat=59.512382&lng=12.312287', 'http://localhost:8080');
  const req = new Request(url);
  const res = await handler(req);

  const json = await res.json();

  const expected = {
    value: '50–60',
    unit: 'd',
    metadata: {
      description: "<redacted>",
      source: "SMHI",
      extent: { area: "Sverige", timePeriod: "1961-01-01/1990-12-31" }
    }
  };

  assertEquals(json.value, expected.value);
  assertEquals(json.metadata.source, expected.metadata.source);
});