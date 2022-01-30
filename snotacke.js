import { cachedResponse, validateSearchQuery, getData, findValue, getMetaData, fixValueDateRange } from './helpers.js';

async function dygnMedSnotacke(request) {
  const url = new URL(request.url);
  const { lng, lat } = validateSearchQuery(url);

  const data = await getData([lng, lat], {
    wms: 'https://opendata-view.smhi.se/klim-stat_sno/dygn_med_snotacke/wms',
    layers: ['klim-stat_sno:dygn_med_snotacke_yta']
  });

  const rawValue = findValue(data);

  return rawValue;
}

async function forstaDagSnotacke(request) {
  const url = new URL(request.url);
  const { lng, lat } = validateSearchQuery(url);

  const data = await getData([lng, lat], {
    wms: 'https://opendata-view.smhi.se/klim-stat_sno/forsta_dag_med_snotacke/wms',
    layers: ['klim-stat_sno:forsta_dag_med_snotacke_yta']
  });

  const rawValue = findValue(data);

  return fixValueDateRange(rawValue);
}

async function sistaDagSnotacke(request) {
  const url = new URL(request.url);
  const { lng, lat } = validateSearchQuery(url);

  const data = await getData([lng, lat], {
    wms: 'https://opendata-view.smhi.se/klim-stat_sno/sista_dag_med_sno/wms',
    layers: ['klim-stat_sno:sista_dag_med_sno_yta']
  });

  const rawValue = findValue(data);

  return fixValueDateRange(rawValue);
}

/**
 * @param {Request} request
 * @returns {Promise<Response>}
 */
export async function handler(request) {
  const _forstaDag = forstaDagSnotacke(request);
  const _sistaDag = sistaDagSnotacke(request);
  const _dygn = dygnMedSnotacke(request);

  const forstaDag = await _forstaDag;
  const sistaDag = await _sistaDag;
  const dygn = await _dygn;

  const responseData = { forstaDag, sistaDag, dygn };

  responseData.metadata = await getMetaData('https://opendata-view.smhi.se/klim-stat_sno/sista_dag_med_sno/wms');

  return cachedResponse(responseData, request);
}
