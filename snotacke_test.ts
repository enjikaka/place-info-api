import { assertEquals } from "https://deno.land/std@0.204.0/assert/mod.ts";
import { handler, getSnowCoverDayCount, getFirstDayWithSnowCover, getLastDayWithSnowCover } from './snotacke.js';
import type { Coordinates } from "./helpers.js";

const barlingshultCoords: Coordinates = [12.312287, 59.512382];

Deno.test('getSnowCoverDayCount', async () => {
  const result = await getSnowCoverDayCount(barlingshultCoords);

  assertEquals(result, '100-125');
});

Deno.test('getFirstDayWithSnowCover', async () => {
  const result = await getFirstDayWithSnowCover(barlingshultCoords);

  assertEquals(result, '--10-01/--11-01');
});


Deno.test('getLastDayWithSnowCover', async () => {
  const result = await getLastDayWithSnowCover(barlingshultCoords);

  assertEquals(result, '--04-01/--05-01');
});

Deno.test('handler', async () => {
  const url = new URL('/?lat=59.512382&lng=12.312287', 'http://localhost:8080');
  const req = new Request(url);
  const res = await handler(req);

  const json = await res.json();

  const expected = {
    value: {
      förstaDag: "--10-01/--11-01",
      sistaDag: "--04-01/--05-01",
      dygn: "100-125",
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