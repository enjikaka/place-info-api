import { assertEquals } from "https://deno.land/std@0.204.0/assert/mod.ts";
import { handler, getTempData } from './temperatur.js';

import { coords, testRequestHandler } from './test-helpers.ts';

Deno.test('getTemp(dygnsmaxtemp)', async () => {
  const data = await getTempData(coords, 'dygnsmaxtemp');

  assertEquals(data, {
    "--1": "-2-0",
    "--10": "8-10",
    "--11": "2-4",
    "--12": "-2-0",
    "--2": "-2-0",
    "--3": "0-2",
    "--4": "8-10",
    "--5": "14-16",
    "--6": "20-22",
    "--7": "20-22",
    "--8": "18-20",
    "--9": "14-16",
  });
});

Deno.test('getTemp(dygnsmintemp)', async () => {
  const data = await getTempData(coords, 'dygnsmintemp');

  assertEquals(data, {
    "--1": "-8--6",
    "--10": "2-4",
    "--11": "-2-0",
    "--12": "-8--6",
    "--2": "-10--8",
    "--3": "-6--4",
    "--4": "-2-0",
    "--5": "4-6",
    "--6": "8-10",
    "--7": "10-12",
    "--8": "8-10",
    "--9": "6-8",
  });
});

Deno.test('getTemp(medeltemp)', async () => {
  const data = await getTempData(coords, 'medeltemp');

  assertEquals(data, {
    "--1": "-8--6",
    "--10": "4-6",
    "--11": "-2-0",
    "--12": "N/A",
    "--2": "-6--4",
    "--3": "-2-0",
    "--4": "2-4",
    "--5": "8-10",
    "--6": "14-16",
    "--7": "14-16",
    "--8": "14-16",
    "--9": "10-12"
  });
});

Deno.test('handler', async () => {
  const json = await testRequestHandler(coords, handler);

  const expected = {
    value: {
      medelmax: {
        "--1": "-2-0",
        "--10": "8-10",
        "--11": "2-4",
        "--12": "-2-0",
        "--2": "-2-0",
        "--3": "0-2",
        "--4": "8-10",
        "--5": "14-16",
        "--6": "20-22",
        "--7": "20-22",
        "--8": "18-20",
        "--9": "14-16",
      },
      medelmin: {
        "--1": "-8--6",
        "--10": "2-4",
        "--11": "-2-0",
        "--12": "-8--6",
        "--2": "-10--8",
        "--3": "-6--4",
        "--4": "-2-0",
        "--5": "4-6",
        "--6": "8-10",
        "--7": "10-12",
        "--8": "8-10",
        "--9": "6-8",
      },
      medeltemp: {
        "--1": "-8--6",
        "--10": "4-6",
        "--11": "-2-0",
        "--12": "N/A",
        "--2": "-6--4",
        "--3": "-2-0",
        "--4": "2-4",
        "--5": "8-10",
        "--6": "14-16",
        "--7": "14-16",
        "--8": "14-16",
        "--9": "10-12"
      }
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