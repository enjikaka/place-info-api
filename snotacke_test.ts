import { assertEquals } from "https://deno.land/std@0.204.0/assert/mod.ts";
import { handler, dygnMedSnotacke, forstaDagSnotacke, sistaDagSnotacke } from './snotacke.js';

Deno.test('dygnMedSnotacke', async () => {
  const url = new URL('/?lat=59.512382&lng=12.312287', 'http://localhost:8080');
  const req = new Request(url);
  const result = await dygnMedSnotacke(req);

  assertEquals(result, '100-125');
});

Deno.test('forstaDagSnotacke', async () => {
  const url = new URL('/?lat=59.512382&lng=12.312287', 'http://localhost:8080');
  const req = new Request(url);
  const result = await forstaDagSnotacke(req);

  assertEquals(result, '--10-01/--11-01');
});


Deno.test('sistaDagSnotacke', async () => {
  const url = new URL('/?lat=59.512382&lng=12.312287', 'http://localhost:8080');
  const req = new Request(url);
  const result = await sistaDagSnotacke(req);

  assertEquals(result, '--04-01/--05-01');
});

Deno.test('handler', async () => {
  const url = new URL('/?lat=59.512382&lng=12.312287', 'http://localhost:8080');
  const req = new Request(url);
  const res = await handler(req);

  const json = await res.json();

  const expected = {
    forstaDag: "--10-01/--11-01",
    sistaDag: "--04-01/--05-01",
    dygn: "100-125",
    metadata: {
      description: "<redacted",
      source: "SMHI",
      extent: { area: "Sverige", timePeriod: "1961-01-01/1990-12-31" }
    }
  };

  assertEquals(json.forstaDag, expected.forstaDag);
  assertEquals(json.sistaDag, expected.sistaDag);
  assertEquals(json.dygn, expected.dygn);
  assertEquals(json.metadata.source, expected.metadata.source);
});