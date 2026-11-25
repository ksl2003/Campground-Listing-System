const ExpressError = require("./expressError");

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const REQUEST_INTERVAL_MS = 1000;
let requestQueue = Promise.resolve();
let lastRequestStartedAt = 0;

function scheduleRequest(request) {
  const scheduled = requestQueue.then(async () => {
    const waitTime = Math.max(
      0,
      REQUEST_INTERVAL_MS - (Date.now() - lastRequestStartedAt),
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
    throw new ExpressError("Please provide a complete location.", 400);
  }

  const url = new URL(NOMINATIM_URL);

  url.searchParams.set("q", query);

  url.searchParams.set("format", "jsonv2");

  url.searchParams.set("limit", "5");

  url.searchParams.set("addressdetails", "1");

  url.searchParams.set("accept-language", "en");

  url.searchParams.set("dedupe", "1");

  return scheduleRequest(async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

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
          "Location service is temporarily unavailable.",
          502,
        );
      }

      const results = await response.json();
      if (!Array.isArray(results) || results.length === 0) {
        throw new ExpressError(
          `No matching location found for "${query}". Please enter a more specific address.`,
          400,
        );
      }

      const bestResult =
        results.find(
          (result) =>
            result.address &&
            (result.address.road ||
              result.address.house_number ||
              result.address.amenity ||
              result.address.building),
        ) || results[0];

      const longitude = Number(bestResult.lon);
      const latitude = Number(bestResult.lat);
      if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
        throw new ExpressError(
          "Invalid coordinates returned by location service.",
          502,
        );
      }

      console.log("Matched location:", bestResult.display_name);
      console.log("Coordinates:", latitude, longitude);

      return { type: "Point", coordinates: [longitude, latitude] };
    } catch (error) {
      if (error instanceof ExpressError) throw error;
      throw new ExpressError("Unable to retrieve location coordinates.", 502);
    } finally {
      clearTimeout(timeout);
    }
  });
}

module.exports = { geocodeLocation };
