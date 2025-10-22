import { JSDOM } from "jsdom";
import "fake-indexeddb/auto";

// Create a global window and document (for SDK code that checks `window`)
const dom = new JSDOM(`<!DOCTYPE html><body></body>`);
(global as any).window = dom.window;
(global as any).document = dom.window.document;
(global as any).navigator = dom.window.navigator;
