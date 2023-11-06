/**
 * @typedef Feature
 * @prop {string} type
 * @prop {string} id
 * @prop {object} geometry
 * @prop {string} geometry.type
 * @prop {number[]} geometry.coordinates
 * @prop {string} geometry_name
 * @prop {object} properties
 */

/**
 * @typedef WMSGetFeatureInfoResponse
 * @prop {string} type
 * @prop {Feature[]} features
 * @prop {string} totalFeatures
 * @prop {number} numberReturned
 * @prop {string} timeStamp
 * @prop {object} crs
 * @prop {string} crs.type
 * @prop {object} crs.properties
 * @prop {string} crs.properties.name
 */

import { parse } from "https://deno.land/x/xml/mod.ts";

export class NotFoundError extends Error {
  constructor() {
    super();
  }
}

export const cleanValue = v => v.includes(' ') ? v.split(' ')[0] : v;

/**
 * @param {Request} request
 * @returns {Coordinates}
 */
export function getCoordinates(request) {
  const url = new URL(request.url);
  const { lng, lat } = validateSearchQuery(url);

  return [lng, lat];
}

export function offset([long, lat], dn = 10, de = 10) {
  // Earth’s radius, sphere.
  const R = 6378137

  // Coordinate offsets in radians
  const dLat = dn / R
  const dLon = de / (R * Math.cos(Math.PI * lat / 180))

  // OffsetPosition, decimal degrees
  const latO = lat + dLat * 180 / Math.PI;
  const lonO = long + dLon * 180 / Math.PI;

  return [lonO, latO];
}

/**
 *
 * @param {string} msg
 * @param {number} status
 * @returns
 */
export function errorResponse(msg, status = 400) {
  return new Response(msg, {
    status,
  });
}

export function validateSearchQuery(url) {
  const lat = parseFloat(url.searchParams.get('lat'));

  if (Number.isNaN(lat)) {
    throw new ReferenceError('You did not provide a latitude value in the "lat" search parameter.');
  }

  const lng = parseFloat(url.searchParams.get('lng'));

  if (Number.isNaN(lng)) {
    throw new ReferenceError('You did not provide a longitude value in the "lat" search parameter.');
  }

  return { lng, lat };
}

export const prettyPrint = request => request?.headers.get('origin') === null ?? true;

/**
 * @typedef {[number, number]} Coordinates
 * @description longitude, latitude
 */


/**
 * @typedef MetaData
 * @prop {string} source
 * @prop {string} description
 * @prop {{ area: string, timePeriod: string }} extent
 */

/**
 *
 * @param {string} wms - URL to WMS server
 * @returns {MetaData}
 */
export async function getMetaData(wms) {
  const url = new URL(wms);

  url.searchParams.set('service', 'WMS');
  url.searchParams.set('version', '1.3.0');
  url.searchParams.set('request', 'GetCapabilities');

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error('Could not fetch data');
  }

  const text = await response.text();

  const document = parse(text);

  const capabilityLayer = document.WMS_Capabilities.Capability.Layer.Layer;

  const layer = Array.isArray(capabilityLayer) ? capabilityLayer[0] : capabilityLayer;
  let metaDataURL = layer.MetadataURL.OnlineResource['@xlink:href'];

  if (metaDataURL.includes('opendata-catalog-utv.smhi.se')) {
    const murl = new URL(metaDataURL);
    murl.hostname = 'opendata-catalog.smhi.se';
    metaDataURL = murl.toString();
  }


  const metaDataResponse = await fetch(metaDataURL);
  const metaDataText = await metaDataResponse.text();
  const metaDataDocument = parse(metaDataText);

  const dataInfo = metaDataDocument['csw:GetRecordByIdResponse']['gmd:MD_Metadata']['gmd:identificationInfo']['gmd:MD_DataIdentification'];
  const description = dataInfo['gmd:abstract']['gco:CharacterString'];
  const source = dataInfo['gmd:pointOfContact']['gmd:CI_ResponsibleParty']['gmd:organisationName']['gco:CharacterString'];

  const exExtent = dataInfo['gmd:extent']['gmd:EX_Extent'];
  const area = exExtent?.['gmd:description']?.['gco:CharacterString'] ?? 'N/A';
  const gmlTimePeriod = exExtent?.['gmd:temporalElement']?.['gmd:EX_TemporalExtent']?.['gmd:extent']?.['gml:TimePeriod'] ?? 'N/A';
  const startTime = gmlTimePeriod['gml:beginPosition'];
  const endTime = gmlTimePeriod['gml:endPosition'];
  const timePeriod = `${startTime}/${endTime}`; // ISO Date range

  const extent = {
    area,
    timePeriod
  }

  return { description, source, extent };
}

/**
 * @typedef WMSSettings
 * @prop {string} wms - Link to WMS server
 * @prop {string[]} layers
 */

/**
 * @param {WMSSettings} param1
 * @returns
 */
export async function getWMSLayerLegendGraphic({ wms, layers }) {
  const url = new URL(wms);

  url.searchParams.set('service', 'WMS');
  url.searchParams.set('version', '1.3.0');
  url.searchParams.set('request', 'GetLegendGraphic');

  url.searchParams.set('layer', layers.join(','));
  url.searchParams.set('format', 'application/json');

  url.searchParams.set('width', 20);
  url.searchParams.set('height', 20);

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error('Could not fetch data');
  }

  let json = undefined;

  try {
    json = await response.json();
  } catch (e) {
    console.error('Could not parse JSON from response', layers, url.searchParams.get('request'), url.toString());
  }

  return json;
}

/**
 * @param {Coordinates} param0
 * @param {WMSSettings} param1
 * @returns {WMSGetFeatureInfoResponse}
 */
export async function getWMSLayerFeatureInfo([lng, lat], { wms, layers }) {
  const url = new URL(wms);

  const rad = 50;

  const [lngSW, latSW] = offset([lng, lat], -(rad), -(rad));
  const [lngNE, latNE] = offset([lng, lat], rad, rad);

  const bbox = [lngSW, latSW, lngNE, latNE].join(',');

  url.searchParams.set('BBOX', bbox);

  const width = 10;
  const height = 10;
  const x = 5;
  const y = 5;

  url.searchParams.set('service', 'WMS');
  url.searchParams.set('version', '1.3.0');
  url.searchParams.set('request', 'GetFeatureInfo');

  url.searchParams.set('layers', layers.join(','));
  url.searchParams.set('query_layers', layers.join(','));
  url.searchParams.set('info_format', 'application/json');

  url.searchParams.set('transparent', true);
  url.searchParams.set('crs', 'CRS:84');
  url.searchParams.set('width', width);
  url.searchParams.set('height', height);
  url.searchParams.set('x', x);
  url.searchParams.set('y', y);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Could not fetch data');
  }

  /** @type {WMSGetFeatureInfoResponse|undefined} */
  let json = undefined;

  try {
    json = await response.json();
  } catch (e) {
    console.error('Could not parse JSON from response', layers);
  }

  return json;
}

/**
 *
 * @param {Coordinates} coords
 * @param {WMSSettings} settings
 * @returns
 */
export async function getData(coords, settings) {
  const featureInfoFetch = getWMSLayerFeatureInfo(coords, settings);
  const legendGraphicFetch = getWMSLayerLegendGraphic(settings);

  const featureInfo = await featureInfoFetch;
  const legendGraphic = await legendGraphicFetch;

  return {
    featureInfo,
    legendGraphic
  };
}

/**
 * @param {string} data
 * @returns
 */
export async function checksum(data) {
  const te = new TextEncoder();
  const buff = te.encode(data);
  const hashBuffer = await crypto.subtle.digest('sha-1', buff);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return hashHex;
}

export function findValue(curr) {
  const props = curr.featureInfo.features
    .map(f => f.properties)
    .reduce((acc, props) => ({
      ...acc,
      ...props
    }), {});
  const matchFor = Object.keys(props).map(key => `[${key} = '${props[key]}']`);
  const matches = curr.legendGraphic.Legend
    .filter(legend => !legend.layerName.includes('_iso'))
    .map(legend => legend.rules.filter(r => matchFor.includes(r.filter)))
    .reduce((acc, curr) => {
      acc.push(...curr);
      return acc;
    }, []);

  const value = matches[0]?.title ?? 'N/A';

  if (value === 'N/A') {
    console.warn('Could not find value:');
    // console.log(JSON.stringify(curr, null, 4));
  }

  return value;
}

export const shortMonthToNum = s => {
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

  return num < 10 ? '0' + num : num + '';
};

// MMDD-MMDD -> ISO 8601 range
export function fixValueDateRange(value) {
  const [from, to] = value.split('-');
  const [fromMonth, fromDay] = from.match(/.{1,2}/g);
  const [toMonth, toDay] = to.match(/.{1,2}/g);

  return `--${fromMonth}-${fromDay}/--${toMonth}-${toDay}`;
}

/**
 *
 * @param {Object} data
 * @param {Request} request
 * @returns
 */
export async function cachedResponse(data, request) {
  const body = JSON.stringify(data, null, prettyPrint(request) ? 4 : undefined);
  const etag = await checksum(body);

  if (request.headers && etag === request.headers.get('if-none-match')) {
    return new Response(null, { status: 304 });
  }

  return new Response(body, {
    status: 200,
    headers: new Headers({
      'content-type': 'application/json',
      'cache-control': 'public, immutable'
    })
  });
}