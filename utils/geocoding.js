const ExpressError = require("./expressError");

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const REQUEST_INTERVAL_MS = 1000;
let requestQueue = Promise.resolve();
let lastRequestStartedAt = 0;

function scheduleRequest(request) {
  const scheduled = requestQueue.then(async () => {
    const waitTime = Math.max(
      0,
      REQUEST_INTERVAL_MS - (Date.now() - lastRequestStartedAt)
    );
    if (waitTime) {
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
    lastRequestStartedAt = Date.now();
    return request();
  });

  requestQueue = scheduled.catch(() => undefined);
  return scheduled;
}

async function geocodeLocation(location) {
  const query = String(location || "").trim();
  if (!query) {
    throw new ExpressError("Please provide a location to place on the map.", 400);
  }

  const url = new URL(NOMINATIM_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "1");

  return scheduleRequest(async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
          "Accept-Language": "en",
          "User-Agent":
            "CampgroundListingSystem/1.0 (+https://github.com/ksl2003/Campground-Listing-System)",
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new ExpressError(
          "The location service is temporarily unavailable. Please try again.",
          502
        );
      }

      const results = await response.json();
      if (!Array.isArray(results) || results.length === 0) {
        throw new ExpressError(
          `We could not find "${query}". Please enter a more specific location.`,
          400
        );
      }

      const longitude = Number(results[0].lon);
      const latitude = Number(results[0].lat);
      if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
        throw new ExpressError("The location service returned invalid coordinates.", 502);
      }

      return { type: "Point", coordinates: [longitude, latitude] };
    } catch (error) {
      if (error instanceof ExpressError) throw error;
      throw new ExpressError(
        "The location service could not be reached. Please try again.",
        502
      );
    } finally {
      clearTimeout(timeout);
    }
  });
}

module.exports = { geocodeLocation };
