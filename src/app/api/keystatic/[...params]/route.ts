import { makeRouteHandler } from "@keystatic/next/route-handler";
import keystaticConfig from "../../../../../keystatic.config";

// Keystatic API route (reads/writes ./content/** for the local git storage).
export const { POST, GET } = makeRouteHandler({ config: keystaticConfig });
