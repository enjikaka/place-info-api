import { assertEquals } from "https://deno.land/std@0.204.0/assert/mod.ts";
import { handler, getSnowCoverDayCount, getFirstDayWithSnowCover, getLastDayWithSnowCover } from './snotacke.js';

import { coords, coords_jämtland, testRequestHandler } from './test-helpers.ts';

Deno.test('getSnowCoverDayCount', async () => {
  const result = await getSnowCoverDayCount(coords);

  assertEquals(result, '100-125');
});

Deno.test('getFirstDayWithSnowCover', async () => {
  const result = await getFirstDayWithSnowCover(coords);

  assertEquals(result, '--10-01/--11-01');
});


Deno.test('getLastDayWithSnowCover', async () => {
  const result = await getLastDayWithSnowCover(coords);

  assertEquals(result, '--04-01/--05-01');
});

Deno.test('[coords_jämtland] handler', async () => {
  const json = await testRequestHandler(coords_jämtland, handler);

  const expected = {
    value: {
      förstaDag: "--11-01/--12-01",
      sistaDag: "--05-01/--06-01",
      dygn: "150-175",
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