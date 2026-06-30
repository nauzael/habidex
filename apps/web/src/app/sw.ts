import { defaultCache } from "@serwist/next/worker";
import { Serwist, type PrecacheEntry } from "serwist";

const serwist = new Serwist({
  precacheEntries: (self as unknown as { __SW_MANIFEST: (string | PrecacheEntry)[] }).__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});

serwist.addEventListeners();
