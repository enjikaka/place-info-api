import { cachedResponse, getMetaData, getCoordsFromRequest, getData, findValue, fixValueDateRange } from './helpers.js';

const wms = 'https://opendata-view.smhi.se/klim-stat_arstidstart/wms';

/**
 *
 * @param {import('./helpers.js').Coordinates} coords
 * @param {'vinter'|'var'|'sommar'|'host'} season
 */
export async function getStartOfSeason(coords, season) {
  const data = await getData(coords, {
    wms,
    layers: [`klim-stat_arstidstart:arstidstart_${season}_yta`]
  });

  return fixValueDateRange(findValue(data));
}

/**
 * @param {Request} request
 * @returns {Promise<Response>}
 */
export async function handler(request) {
  const coords = getCoordsFromRequest(request);

  const [vår, sommar, höst, vinter, metadata] = await Promise.all([
    getStartOfSeason(coords, 'var'),
    getStartOfSeason(coords, 'sommar'),
    getStartOfSeason(coords, 'host'),
    getStartOfSeason(coords, 'vinter'),
    getMetaData(wms)
  ]);

  return cachedResponse({
    value: {
      vår,
      sommar,
      höst,
      vinter
    },
    metadata
  }, request);
}
