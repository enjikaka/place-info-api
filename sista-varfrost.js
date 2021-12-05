import { prettyPrint, validateSearchQuery, getData, findValue, shortMonthToNum } from './helpers.js';

function fixValue(value) {
  const [fromDay, toDay] = value.split('-').map(n => parseInt(n, 10));

  const [, monthString] = value.split(' ');
  const monthNumber = shortMonthToNum(monthString);

  return `--${monthNumber}-${fromDay}/--${monthNumber}-${toDay}`;
}

export async function handler(request) {
  const url = new URL(request.url);
  const { lng, lat } = validateSearchQuery(url);

  const data = await getData([lng, lat], {
    wms: 'https://opendata-view.smhi.se/klim-stat_is/sista_varfrost/wms',
    layers: ['klim-stat_is:sista_varfrost_yta']
  });

  const rawValue = findValue(data);
  const value = fixValue(rawValue);

  const body = JSON.stringify({ value }, null, prettyPrint(request) ? 4 : undefined);

  return new Response(body, {
    status: 200,
    headers: new Headers({
      'content-type': 'application/json',
      'last-modified': new Date('2020-09-25').toGMTString()
    })
  });
}
