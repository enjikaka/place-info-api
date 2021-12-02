import { prettyPrint, validateSearchQuery, getWMSLayerFeatureInfo } from './helpers.js';

export async function handler (request) {
    const url = new URL(request.url);
    const { lng, lat } = validateSearchQuery(url);

    const data = await getWMSLayerFeatureInfo([lng, lat], {
        wms: 'https://opendata-view.smhi.se/klim-stat_is/sista_varfrost/wms',
        layers: ['klim-stat_is:sista_varfrost_yta']
    });
    const symbol = data.features[0].properties['SYMBOL'];

    let value;

    switch (symbol) {
        case 1:
            value = '--04-01/--04-15';
            break;
        case 2:
            value = '--04-15/--05-01';
            break;
        case 3:
            value = '--05-01/--05-15';
            break;
        case 4:
            value = '--05-15/--06-01';
            break;
        case 5:
            value = '--06-01/--06-15';
            break;
        case 6:
        default:
            value = '--06-15';
            break;
    }

    return new Response(JSON.stringify({ value }, null, prettyPrint(request) ? 4 : undefined), {
        status: 200,
        headers: new Headers({
            'content-type': 'application/json'
        })
    });
}
