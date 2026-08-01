"use client";

/**
 * Keystatic admin UI entry. Internal content-management tool for the
 * Image3DConversion marketing team — NOT a public route (noindex + disallowed
 * in robots). Renders the editor over ./content/** using keystatic.config.ts.
 */
import { makePage } from "@keystatic/next/ui/app";
import keystaticConfig from "../../../keystatic.config";

export default makePage(keystaticConfig);
