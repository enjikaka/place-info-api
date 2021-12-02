import { prettyPrint, validateSearchQuery, getWMSLayerFeatureInfo } from './helpers.js';

export async function handler (request) {
    const url = new URL(request.url);
    const { lng, lat } = validateSearchQuery(url);

    const data = await getWMSLayerFeatureInfo([lng, lat], {
        wms: 'https://opendata-view.smhi.se/klim-stat_is/forsta_hostfrost/wms',
        layer: 'klim-stat_is:forsta_hostfrost_yta'
    });

    const symbol = data.features[0].properties['SYMBOL'];

    let value;
    let attribution;

    switch (symbol) {
       default:
        case 1:
          value = '--08-01';
          break;
        case 2:
          value = '--08-15';
          break;
        case 3:
          value = '--09-01';
          break;
        case 4:
          value = '--09-15';
          break;
        case 5:
          value = '--10-01';
          break;
        case 6:
          value = '--10-15';
          break;
        case 7:
          value = '--11-01';
          break;
        case 8:
          value = '--11-15';
          break;
        case 9:
          value = '--12-01';
          break;
    }

    const body = JSON.stringify({ value }, null, prettyPrint(request) ? 4 : undefined);

    return new Response(body, {
        status: 200,
        headers: new Headers({
            'content-type': 'application/json'
        })
    });
}
