import { prettyPrint, validateSearchQuery, getWMSLayerFeatureInfo } from './helpers.js';

export async function handler (request) {
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

  return new Response(JSON.stringify(responseData, null, prettyPrint(request) ? 4 : undefined), {
    status: 200,
    headers: new Headers({
      'content-type': 'application/json'
    })
  });
}
