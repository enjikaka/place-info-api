import { prettyPrint, validateSearchQuery, getWMSLayerLegendGraphic, getWMSLayerFeatureInfo } from './helpers.js';

const shortMonthToNum = s => {
  const shortMonth = [
    'jan',
    'feb',
    'mar',
    'apr',
    'maj',
    'jun',
    'jul',
    'aug',
    'sept',
    'okt',
    'nov',
    'dec'
  ];

  const num = shortMonth.indexOf(s) + 1;

  console.log(s, num < 10 ? '0' + num : num + '');

  return num < 10 ? '0' + num : num + '';
};

function findValue(curr) {
  const props = curr.featureInfo.features[0].properties;
  const matchFor = Object.keys(props).map(key => `[${key} = '${props[key]}']`);
  const value = curr.legendGraphic.Legend[0].rules.filter(r => matchFor.includes(r.filter))[0].title;

  return value.includes(' ') ? value.split(' ')[0] : value;
}

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
  ].map(async layer => {
    const fi = getWMSLayerFeatureInfo([lng, lat], {
      wms,
      layers: [layer]
    });

    const lg = getWMSLayerLegendGraphic({
      wms,
      layers: [layer]
    });

    const featureInfo = await fi;
    const legendGraphic = await lg;

    return { featureInfo, legendGraphic };
  }));

  const data = responses.reduce((acc, curr, i) => ({
    ...acc,
    [i === 0 ? 'year' : '--' + shortMonthToNum(curr.legendGraphic.Legend[0].layerName.split('_')[1])]: findValue(curr)
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
