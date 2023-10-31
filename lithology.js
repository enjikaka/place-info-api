import { getWMSLayerFeatureInfo, getMetaData, cachedResponse, getCoordinates } from './helpers.js';

const wms = 'https://maps3.sgu.se/geoserver/inspire/ows';

/**
 * @param {import("./helpers.js").Coordinates} coords
 */
export async function getLithology(coords) {
  const data = await getWMSLayerFeatureInfo(coords, {
    wms,
    layers: [
      'GE.GeologicUnit.SGU.SurficialGeology_25K-100K.Lithology.Polygon'
    ]
  });

  const feature = data.features[0];

  const lithologyURI = feature.properties.representativeLithology_uri || feature.properties.representative_lithology_uri;
  const lithologySlug = lithologyURI.split('/').pop();

  const response = await fetch(`https://inspire.ec.europa.eu/codelist/LithologyValue/${lithologySlug}/${lithologySlug}.sv.json`);
  const typeData = await response.json();

  return {
    type: typeData.value.label.text,
    description: typeData.value.definition.text
  };
}

/**
 * @param {Request} request
 * @returns {Promise<Response>}
 */
export async function handler(request) {
  const coords = getCoordinates(request);

  const [value, metadata] = await Promise.all([
    getLithology(coords),
    getMetaData(wms)
  ]);

  return cachedResponse({
    value,
    metadata
  }, request);
}
