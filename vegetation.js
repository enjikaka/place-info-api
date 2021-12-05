import { prettyPrint, validateSearchQuery, getData, findValue } from './helpers.js';

export async function handler(request) {
  const url = new URL(request.url);
  const { lng, lat } = validateSearchQuery(url);

  const data = await getData([lng, lat], {
    wms: 'https://opendata-view.smhi.se/klim-stat_vegatation/vegetationsperiodens_langd/wms',
    layers: ['vegetationsperiodens_langd_yta']
  });

  const rawValue = findValue(data);
  const [value, unit] = rawValue.split(' ');

  const body = JSON.stringify({ value, unit }, null, prettyPrint(request) ? 4 : undefined);

  return new Response(body, {
    status: 200,
    headers: new Headers({
      'content-type': 'application/json',
      'last-modified': new Date('2020-10-28').toGMTString()
    })
  });
}
