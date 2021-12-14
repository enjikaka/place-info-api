import { prettyPrint, validateSearchQuery, getData, findValue, checksum } from './helpers.js';

function fixValue(value) {
  const [from, to] = value.split('-');
  const [fromMonth, fromDay] = from.match(/.{1,2}/g);
  const [toMonth, toDay] = to.match(/.{1,2}/g);

  return `--${fromMonth}-${fromDay}/--${toMonth}-${toDay}`;
}

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

  return fixValue(rawValue);
}

async function sistaDagSnotacke(request) {
  const url = new URL(request.url);
  const { lng, lat } = validateSearchQuery(url);

  const data = await getData([lng, lat], {
    wms: 'https://opendata-view.smhi.se/klim-stat_sno/sista_dag_med_sno/wms',
    layers: ['klim-stat_sno:sista_dag_med_sno_yta']
  });

  const rawValue = findValue(data);

  return fixValue(rawValue);
}

export async function handler(request) {
  const _forstaDag = forstaDagSnotacke(request);
  const _sistaDag = sistaDagSnotacke(request);
  const _dygn = dygnMedSnotacke(request);

  const forstaDag = await _forstaDag;
  const sistaDag = await _sistaDag;
  const dygn = await _dygn;

  const body = JSON.stringify({ forstaDag, sistaDag, dygn }, null, prettyPrint(request) ? 4 : undefined);
  const etag = await checksum(body);

  if (etag === request.headers.get('if-none-match')) {
    return new Response(null, { status: 304 });
  }

  return new Response(body, {
    status: 200,
    headers: new Headers({
      'content-type': 'application/json',
      'cache-control': 'public, max-age=3600, immutable',
      'etag': etag
    })
  });
}
