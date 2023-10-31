import { cachedResponse, getCoordinates, getData, findValue, getMetaData, fixValueDateRange } from './helpers.js';

/**
 * @param {Coordinates} coords
 * @returns
 */
export async function getSnowCoverDayCount(coords) {
  const data = await getData(coords, {
    wms: 'https://opendata-view.smhi.se/klim-stat_sno/dygn_med_snotacke/wms',
    layers: ['dygn_med_snotacke_yta']
  });

  return findValue(data);
}

/**
 * @param {Coordinates} coords
 * @returns
 */
export async function getFirstDayWithSnowCover(coords) {
  const data = await getData(coords, {
    wms: 'https://opendata-view.smhi.se/klim-stat_sno/forsta_dag_med_snotacke/wms',
    layers: ['forsta_dag_med_snotacke_yta']
  });

  return fixValueDateRange(findValue(data));
}

/**
 * @param {Coordinates} coords
 * @returns
 */
export async function getLastDayWithSnowCover(coords) {
  const data = await getData(coords, {
    wms: 'https://opendata-view.smhi.se/klim-stat_sno/sista_dag_med_sno/wms',
    layers: ['sista_dag_med_sno_yta']
  });

  return fixValueDateRange(findValue(data));
}

/**
 * @param {Request} request
 * @returns {Promise<Response>}
 */
export async function handler(request) {
  const coords = getCoordinates(request);

  const [förstaDag, sistaDag, dygn, metadata] = await Promise.all([
    getFirstDayWithSnowCover(coords),
    getLastDayWithSnowCover(coords),
    getSnowCoverDayCount(coords),
    getMetaData('https://opendata-view.smhi.se/klim-stat_sno/sista_dag_med_sno/wms')
  ]);

  return cachedResponse({
    value: { förstaDag, sistaDag, dygn },
    metadata
  }, request);
}
