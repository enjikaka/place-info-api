import { prettyPrint, validateSearchQuery, getData, findValue, shortMonthToNum } from './helpers.js';

export async function handler(request) {
  const url = new URL(request.url);
  const { lng, lat } = validateSearchQuery(url);

  const wms = 'https://opendata-view.smhi.se/klim-stat_solskenstid/wms';
  const responses = await Promise.all([
    'solskenstid',
    'solskenstid_feb',
    'solskenstid_apr',
    'solskenstid_jun',
    'solskenstid_aug',
    'solskenstid_okt',
    'solskenstid_dec'
  ].map(layer => getData([lng, lat], {
    wms,
    layers: [layer]
  })));

  const cleanValue = v => v.includes(' ') ? v.split(' ')[0] : v;

  const data = responses.reduce((acc, curr, i) => ({
    ...acc,
    value: {
      ...acc.value,
      [i === 0 ? 'year' : '--' + shortMonthToNum(curr.legendGraphic.Legend[0].layerName.split('_')[1])]: cleanValue(findValue(curr))
    }
  }), { unit: 'timmar', value: {} });

  const body = JSON.stringify(data, null, prettyPrint(request) ? 4 : undefined);

  return new Response(body, {
    status: 200,
    headers: new Headers({
      'content-type': 'application/json',
      'last-modified': new Date('2020-10-26').toGMTString()
    })
  });
}
