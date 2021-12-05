import { prettyPrint, validateSearchQuery, getWMSLayerFeatureInfo, checksum } from './helpers.js';

export async function handler(request) {
  const url = new URL(request.url);
  const { lng, lat } = validateSearchQuery(url);

  const data = await getWMSLayerFeatureInfo([lng, lat], {
    wms: 'https://maps3.sgu.se/geoserver/inspire/ows',
    layers: ['GE.GeologicUnit.SGU.SurficialGeology_25K-100K.Lithology.Polygon']
  });
  const feature = data.features[0];

  const lithologyURI = feature.properties.representativeLithology_uri || feature.properties.representative_lithology_uri;
  const lithologySlug = lithologyURI.split('/').pop();

  const response = await fetch(`https://inspire.ec.europa.eu/codelist/LithologyValue/${lithologySlug}/${lithologySlug}.sv.json`);
  const typeData = await response.json();

  const responseData = {
    type: typeData.value.label.text,
    description: typeData.value.definition.text
  };

  const body = JSON.stringify(responseData, null, prettyPrint(request) ? 4 : undefined);
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
