import { prettyPrint, validateSearchQuery, getWMSLayerFeatureInfo } from './helpers.js';

export async function handler (request) {
    const url = new URL(request.url);
    const { lng, lat } = validateSearchQuery(url);

    const wms = 'https://opendata-view.smhi.se/klim-stat_nederbord/wms';
    const responses = await Promise.all([
      'arsnederbord',
      'nederbord_jan',
      'nederbord_feb',
      'nederbord_mar',
      'nederbord_apr',
      'nederbord_maj',
      'nederbord_jun',
      'nederbord_jul',
      'nederbord_aug',
      'nederbord_sep',
      'nederbord_okt',
      'nederbord_nov',
      'nederbord_dec'
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
