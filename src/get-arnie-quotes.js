"use strict";
const { httpGet } = require("./mock-http-interface");

/** @typedef {( { "Arnie Quote": string } | { FAILURE: string } )} ArnieQuote */

/**
 * Parses a JSON string and extracts the `message` property.
 * @param {string} json The JSON string to parse. Must contain a `message` property as a non-empty string.
 * @returns {string} The `message` string from the parsed JSON.
 * @throws {Error} When unable to extract message.
 */
const extractMessage = (json) => {
  if (!json) throw new Error("Input JSON is undefined or empty");
  const data = JSON.parse(json);
  if (typeof data.message !== "string" || !data.message.trim())
    throw new Error("Invalid message format or empty message");
  return data.message;
};

/**
 * Fetches and formats the result for a single URL.
 * **Warning:** This function does not implement any retry logic. If a network error or transient failure occurs, it will return a FAILURE response immediately. Use p-retry/got/retry-axios or similar to implement retry logic if needed.
 * @param {string} url The URL to request.
 * @returns {Promise<ArnieQuote>} A promise resolving to a formatted quote or failure object.
 */
const fetchQuote = async (url) => {
  try {
    const { status, body } = await httpGet(url);
    const message = extractMessage(body);
    return { [status === 200 ? "Arnie Quote" : "FAILURE"]: message };
  } catch (error) {
    console.warn(`Failed to retrieve quote from ${url}:`, error);
    return { FAILURE: "Failed to retrieve quote, unexpected error" };
  }
};

/**
 * Fetches quotes in parallel from given URLs.
 * **Warning:** This function does not limit concurrency and may overwhelm the network or API if too many URLs are provided at once. Use (p-limit or similar) to control concurrency if needed.
 * @param {string[]} urls Array of URLs to fetch.
 * @returns {Promise<ArnieQuote[]>} A promise resolving to an array of quotes.
 */
const getArnieQuotes = async (urls) => Promise.all(urls.map(fetchQuote));

module.exports = { getArnieQuotes };
