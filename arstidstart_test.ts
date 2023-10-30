import { assertEquals } from "https://deno.land/std@0.204.0/assert/mod.ts";
import { handler } from './arstidstart.js';


Deno.test('handler', async () => {
  const url = new URL('/?lat=59.512382&lng=12.312287', 'http://localhost:8080');
  const req = new Request(url);
  const res = await handler(req);

  const json = await res.json();

  const expected = {
    value: {
      vinter: "--11-01/--11-30",
      var: "--03-01/--03-31",
      sommar: "--05-05/--05-31",
      host: "--09-01/--09-30"
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