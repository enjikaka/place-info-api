import { prettyPrint, validateSearchQuery, getWMSLayerFeatureInfo } from './helpers.js';

export async function handler(request) {
  const url = new URL(request.url);
  const { lng, lat } = validateSearchQuery(url);

  const wms = 'https://opendata-view.smhi.se/klim-stat_solskenstid/wms';
  const responses = await Promise.all([
    'solskenstid',
    'solskenstid_jan',
    'solskenstid_feb',
    'solskenstid_mar',
    'solskenstid_apr',
    'solskenstid_maj',
    'solskenstid_jun',
    'solskenstid_jul',
    'solskenstid_aug',
    'solskenstid_sep',
    'solskenstid_okt',
    'solskenstid_nov',
    'solskenstid_dec'
  ].map(layer => getWMSLayerFeatureInfo([lng, lat], {
    wms,
    layers: [layer]
  })));

  const data = responses.reduce((acc, curr, i) => ({
    ...acc,
    [i === 0 ? 'year' : i < 10 ? '--0' + i : '--' + i]: curr.features[0].properties['INTERVALL'].split('-').map(x => x.trim()).join('-')
  }), {});

  const body = JSON.stringify(data, null, prettyPrint(request) ? 4 : undefined);

  return new Response(body, {
    status: 200,
    headers: new Headers({
      'content-type': 'application/json',
      'last-modified': new Date('2020-10-26').toGMTString()
    })
  });
}
