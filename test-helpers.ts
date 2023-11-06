import { Coordinates } from "./helpers.js";

export const coords: Coordinates = [12.312287, 59.512382];

/**
 *
 * @param coords
 * @returns
 */
export async function testRequestHandler(coords: Coordinates, handler: (req: Request) => Promise<Response>) {
  const url = new URL(`/?lat=${coords[1]}&lng=${coords[0]}`, 'http://localhost:8080');
  const req = new Request(url);
  const res = await handler(req);

  return res.json();
}