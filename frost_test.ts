import { assertEquals } from "https://deno.land/std@0.204.0/assert/mod.ts";
import { handler, getFirstAutumnFrostDate, getLastSpringFrostDate } from './frost.js';
import type { Coordinates } from './helpers.js';

const barlingshultCoords: Coordinates = [12.312287, 59.512382];

Deno.test('getFirstAutumnFrostDate', async () => {
  const autumnFrostDate = await getFirstAutumnFrostDate(barlingshultCoords);

  assertEquals(autumnFrostDate, '--10-1');
});

Deno.test('getLastSpringFrostDate', async () => {
  const springFrostDate = await getLastSpringFrostDate(barlingshultCoords);

  assertEquals(springFrostDate, '--05-1/--05-15');
});

Deno.test('handler', async () => {
  const url = new URL('/?lat=59.512382&lng=12.312287', 'http://localhost:8080');
  const req = new Request(url);
  const res = await handler(req);

  const json = await res.json();

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