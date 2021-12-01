import { prettyPrint, validateSearchQuery, getWMSLayerFeatureInfo } from './helpers.js';

export async function handler (request) {
    const url = new URL(request.url);
    const { lng, lat } = validateSearchQuery(url);

    const data = await getWMSLayerFeatureInfo([lng, lat], {
        wms: 'https://opendata-view.smhi.se/klim-stat_is/sista_varfrost/wms',
        layer: 'klim-stat_is:sista_varfrost_yta'
    });
    const symbol = data.features[0].properties['SYMBOL'];

    let range;

    switch (symbol) {
        case 1:
            range = {
                from: '--04-01',
                to: '--04-15'
            };
            break;
        case 2:
            range = {
                from: '--04-15',
                to: '--05-01'
            };
            break;
        case 3:
            range = {
                from: '--05-01',
                to: '--05-15'
            };
            break;
        case 4:
            range = {
                from: '--05-15',
                to: '--06-01'
            };
            break;
        case 5:
            range = {
                from: '--06-01',
                to: '--06-15'
            };
            break;
        case 6:
        default:
            range = {
                from: '--06-15',
                to: null
            };
            break;
    }

    return new Response(JSON.stringify({ range }, null, prettyPrint(request) ? 4 : undefined), {
        status: 200,
        headers: new Headers({
            'content-type': 'application/json'
        })
    });
}
