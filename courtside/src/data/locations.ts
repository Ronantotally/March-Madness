/**
 * 2026 NCAA Tournament – team home locations, venue sites, and distance helpers.
 *
 * First/second round pod assignments sourced from the official 2026 bracket.
 * Team coordinates are approximate campus locations.
 */

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface LatLng {
  lat: number;
  lng: number;
}

export interface Venue {
  city: string;
  arena: string;
  coords: LatLng;
}

/* ------------------------------------------------------------------ */
/*  Haversine distance (miles)                                         */
/* ------------------------------------------------------------------ */

export function haversineMiles(a: LatLng, b: LatLng): number {
  const R = 3958.8; // Earth radius in miles
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h =
    sinLat * sinLat +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinLng * sinLng;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

/* ------------------------------------------------------------------ */
/*  Team home campus coordinates                                       */
/* ------------------------------------------------------------------ */

export const TEAM_LOCATIONS: Record<string, { city: string; coords: LatLng }> = {
  // --- East Region ---
  Duke:           { city: "Durham, NC",        coords: { lat: 36.001, lng: -78.938 } },
  Siena:          { city: "Loudonville, NY",   coords: { lat: 42.718, lng: -73.762 } },
  "Ohio St.":     { city: "Columbus, OH",      coords: { lat: 40.007, lng: -83.030 } },
  TCU:            { city: "Fort Worth, TX",     coords: { lat: 32.710, lng: -97.363 } },
  "St. John's":   { city: "Queens, NY",        coords: { lat: 40.724, lng: -73.795 } },
  "Northern Iowa":{ city: "Cedar Falls, IA",   coords: { lat: 42.514, lng: -92.461 } },
  Kansas:         { city: "Lawrence, KS",       coords: { lat: 38.954, lng: -95.253 } },
  "Cal Baptist":  { city: "Riverside, CA",     coords: { lat: 33.929, lng: -117.426 } },
  Louisville:     { city: "Louisville, KY",     coords: { lat: 38.213, lng: -85.758 } },
  "South Florida":{ city: "Tampa, FL",         coords: { lat: 28.064, lng: -82.413 } },
  "Michigan St.": { city: "East Lansing, MI",  coords: { lat: 42.701, lng: -84.482 } },
  "N. Dakota St.":{ city: "Fargo, ND",         coords: { lat: 46.897, lng: -96.800 } },
  UCLA:           { city: "Los Angeles, CA",    coords: { lat: 34.069, lng: -118.445 } },
  UCF:            { city: "Orlando, FL",        coords: { lat: 28.602, lng: -81.200 } },
  UConn:          { city: "Storrs, CT",         coords: { lat: 41.808, lng: -72.254 } },
  Furman:         { city: "Greenville, SC",     coords: { lat: 34.925, lng: -82.440 } },

  // --- South Region ---
  Florida:        { city: "Gainesville, FL",    coords: { lat: 29.650, lng: -82.349 } },
  Lehigh:         { city: "Bethlehem, PA",      coords: { lat: 40.607, lng: -75.378 } },
  "Prairie View A&M": { city: "Prairie View, TX", coords: { lat: 30.088, lng: -95.987 } },
  Clemson:        { city: "Clemson, SC",        coords: { lat: 34.683, lng: -82.837 } },
  Iowa:           { city: "Iowa City, IA",      coords: { lat: 41.661, lng: -91.535 } },
  Vanderbilt:     { city: "Nashville, TN",      coords: { lat: 36.144, lng: -86.803 } },
  McNeese:        { city: "Lake Charles, LA",   coords: { lat: 30.208, lng: -93.208 } },
  Nebraska:       { city: "Lincoln, NE",        coords: { lat: 40.820, lng: -96.700 } },
  Troy:           { city: "Troy, AL",           coords: { lat: 31.800, lng: -85.971 } },
  "North Carolina":{ city: "Chapel Hill, NC",  coords: { lat: 35.905, lng: -79.047 } },
  VCU:            { city: "Richmond, VA",       coords: { lat: 37.549, lng: -77.451 } },
  Illinois:       { city: "Champaign, IL",      coords: { lat: 40.102, lng: -88.227 } },
  Penn:           { city: "Philadelphia, PA",   coords: { lat: 39.952, lng: -75.193 } },
  "Saint Mary's": { city: "Moraga, CA",        coords: { lat: 37.835, lng: -122.113 } },
  "Texas A&M":    { city: "College Station, TX",coords: { lat: 30.616, lng: -96.340 } },
  Houston:        { city: "Houston, TX",        coords: { lat: 29.720, lng: -95.339 } },
  Idaho:          { city: "Moscow, ID",         coords: { lat: 46.732, lng: -117.000 } },

  // --- Midwest Region ---
  Michigan:       { city: "Ann Arbor, MI",      coords: { lat: 42.278, lng: -83.738 } },
  UMBC:           { city: "Baltimore, MD",      coords: { lat: 39.255, lng: -76.714 } },
  Howard:         { city: "Washington, DC",     coords: { lat: 38.922, lng: -77.020 } },
  Georgia:        { city: "Athens, GA",         coords: { lat: 33.948, lng: -83.373 } },
  "Saint Louis":  { city: "St. Louis, MO",     coords: { lat: 38.637, lng: -90.234 } },
  "Texas Tech":   { city: "Lubbock, TX",        coords: { lat: 33.585, lng: -101.846 } },
  Akron:          { city: "Akron, OH",          coords: { lat: 41.076, lng: -81.511 } },
  Alabama:        { city: "Tuscaloosa, AL",     coords: { lat: 33.214, lng: -87.539 } },
  Hofstra:        { city: "Hempstead, NY",      coords: { lat: 40.714, lng: -73.600 } },
  Tennessee:      { city: "Knoxville, TN",      coords: { lat: 35.955, lng: -83.930 } },
  SMU:            { city: "Dallas, TX",         coords: { lat: 32.842, lng: -96.783 } },
  "Miami OH":     { city: "Oxford, OH",         coords: { lat: 39.507, lng: -84.745 } },
  Virginia:       { city: "Charlottesville, VA",coords: { lat: 38.034, lng: -78.508 } },
  "Wright St.":   { city: "Dayton, OH",        coords: { lat: 39.782, lng: -84.063 } },
  Kentucky:       { city: "Lexington, KY",      coords: { lat: 38.030, lng: -84.504 } },
  "Santa Clara":  { city: "Santa Clara, CA",   coords: { lat: 37.349, lng: -121.938 } },
  "Iowa St.":     { city: "Ames, IA",          coords: { lat: 42.026, lng: -93.648 } },
  "Tennessee St.":{ city: "Nashville, TN",     coords: { lat: 36.167, lng: -86.832 } },

  // --- West Region ---
  Arizona:        { city: "Tucson, AZ",         coords: { lat: 32.231, lng: -110.950 } },
  LIU:            { city: "Brooklyn, NY",       coords: { lat: 40.689, lng: -73.987 } },
  Villanova:      { city: "Villanova, PA",      coords: { lat: 40.037, lng: -75.348 } },
  "Utah St.":     { city: "Logan, UT",         coords: { lat: 41.745, lng: -111.810 } },
  Wisconsin:      { city: "Madison, WI",        coords: { lat: 43.076, lng: -89.412 } },
  "High Point":   { city: "High Point, NC",    coords: { lat: 35.956, lng: -80.005 } },
  Arkansas:       { city: "Fayetteville, AR",   coords: { lat: 36.068, lng: -94.175 } },
  Hawaii:         { city: "Honolulu, HI",       coords: { lat: 21.297, lng: -157.817 } },
  BYU:            { city: "Provo, UT",          coords: { lat: 40.252, lng: -111.649 } },
  "N.C. State":   { city: "Raleigh, NC",       coords: { lat: 35.787, lng: -78.670 } },
  Texas:          { city: "Austin, TX",         coords: { lat: 30.284, lng: -97.733 } },
  Gonzaga:        { city: "Spokane, WA",        coords: { lat: 47.667, lng: -117.402 } },
  "Kennesaw St.": { city: "Kennesaw, GA",      coords: { lat: 34.024, lng: -84.581 } },
  "Miami FL":     { city: "Coral Gables, FL",  coords: { lat: 25.712, lng: -80.278 } },
  Missouri:       { city: "Columbia, MO",       coords: { lat: 38.946, lng: -92.328 } },
  Purdue:         { city: "West Lafayette, IN", coords: { lat: 40.424, lng: -86.922 } },
  Queens:         { city: "Charlotte, NC",      coords: { lat: 35.227, lng: -80.843 } },
};

/* ------------------------------------------------------------------ */
/*  2026 First & Second Round Venues                                   */
/* ------------------------------------------------------------------ */

const VENUES: Record<string, Venue> = {
  buffalo:       { city: "Buffalo, NY",       arena: "KeyBank Center",                coords: { lat: 42.875, lng: -78.876 } },
  greenville:    { city: "Greenville, SC",    arena: "Bon Secours Wellness Arena",    coords: { lat: 34.852, lng: -82.399 } },
  oklahoma_city: { city: "Oklahoma City, OK", arena: "Paycom Center",                 coords: { lat: 35.463, lng: -97.515 } },
  portland:      { city: "Portland, OR",      arena: "Moda Center",                   coords: { lat: 45.532, lng: -122.667 } },
  tampa:         { city: "Tampa, FL",         arena: "Amalie Arena",                  coords: { lat: 27.943, lng: -82.452 } },
  philadelphia:  { city: "Philadelphia, PA",  arena: "Wells Fargo Center",            coords: { lat: 39.901, lng: -75.172 } },
  san_diego:     { city: "San Diego, CA",     arena: "Viejas Arena",                  coords: { lat: 32.775, lng: -117.070 } },
  st_louis:      { city: "St. Louis, MO",     arena: "Enterprise Center",             coords: { lat: 38.627, lng: -90.200 } },
  // Later rounds
  indianapolis:  { city: "Indianapolis, IN",  arena: "Lucas Oil Stadium",             coords: { lat: 39.760, lng: -86.164 } },
};

/* ------------------------------------------------------------------ */
/*  Pod assignments – which teams play at which venue                   */
/*  Source: official 2026 NCAA bracket tip-time announcements           */
/* ------------------------------------------------------------------ */

const TEAM_VENUE_MAP: Record<string, string> = {
  // Buffalo – Thu Mar 19
  "South Florida": "buffalo",
  Louisville:      "buffalo",
  "N. Dakota St.": "buffalo",
  "Michigan St.":  "buffalo",
  Michigan:        "buffalo",
  UMBC:            "buffalo",
  Howard:          "buffalo",
  "Saint Louis":   "buffalo",
  Georgia:         "buffalo",

  // Greenville – Thu Mar 19
  TCU:             "greenville",
  "Ohio St.":      "greenville",
  Siena:           "greenville",
  Duke:            "greenville",
  VCU:             "greenville",
  "North Carolina":"greenville",
  Penn:            "greenville",
  Illinois:        "greenville",

  // Oklahoma City – Thu Mar 19
  Troy:            "oklahoma_city",
  Nebraska:        "oklahoma_city",
  McNeese:         "oklahoma_city",
  Vanderbilt:      "oklahoma_city",
  "Texas A&M":     "oklahoma_city",
  "Saint Mary's":  "oklahoma_city",
  Idaho:           "oklahoma_city",
  Houston:         "oklahoma_city",

  // Portland – Thu Mar 19
  Wisconsin:       "portland",
  "High Point":    "portland",
  Arkansas:        "portland",
  Hawaii:          "portland",
  BYU:             "portland",
  "N.C. State":    "portland",
  Texas:           "portland",
  Gonzaga:         "portland",
  "Kennesaw St.":  "portland",

  // Tampa – Fri Mar 20
  "Texas Tech":    "tampa",
  Akron:           "tampa",
  Alabama:         "tampa",
  Hofstra:         "tampa",
  Clemson:         "tampa",
  Iowa:            "tampa",
  Florida:         "tampa",
  Lehigh:          "tampa",
  "Prairie View A&M": "tampa",

  // Philadelphia – Fri Mar 20
  Virginia:        "philadelphia",
  "Wright St.":    "philadelphia",
  Tennessee:       "philadelphia",
  SMU:             "philadelphia",
  "Miami OH":      "philadelphia",
  UCLA:            "philadelphia",
  UCF:             "philadelphia",
  UConn:           "philadelphia",
  Furman:          "philadelphia",

  // San Diego – Fri Mar 20
  Arizona:         "san_diego",
  LIU:             "san_diego",
  Villanova:       "san_diego",
  "Utah St.":      "san_diego",
  "St. John's":    "san_diego",
  "Northern Iowa": "san_diego",
  Kansas:          "san_diego",
  "Cal Baptist":   "san_diego",

  // St. Louis – Fri Mar 20
  Kentucky:        "st_louis",
  "Santa Clara":   "st_louis",
  "Iowa St.":      "st_louis",
  "Tennessee St.": "st_louis",
  Purdue:          "st_louis",
  Queens:          "st_louis",
  "Miami FL":      "st_louis",
  Missouri:        "st_louis",
};

/* ------------------------------------------------------------------ */
/*  Public helpers                                                     */
/* ------------------------------------------------------------------ */

/** Get the first-round venue for a team. */
export function getTeamVenue(teamName: string): Venue | null {
  const key = TEAM_VENUE_MAP[teamName];
  return key ? VENUES[key] : null;
}

/** Get the Final Four venue. */
export function getFinalFourVenue(): Venue {
  return VENUES.indianapolis;
}

/** Compute miles from a team's campus to their first-round venue. */
export function getTeamTravelMiles(teamName: string): number | null {
  const team = TEAM_LOCATIONS[teamName];
  const venue = getTeamVenue(teamName);
  if (!team || !venue) return null;
  return Math.round(haversineMiles(team.coords, venue.coords));
}

/** Full travel info for a team. */
export function getTeamTravelInfo(teamName: string): {
  teamCity: string;
  venueCity: string;
  venueArena: string;
  miles: number;
} | null {
  const team = TEAM_LOCATIONS[teamName];
  const venue = getTeamVenue(teamName);
  if (!team || !venue) return null;
  return {
    teamCity: team.city,
    venueCity: venue.city,
    venueArena: venue.arena,
    miles: Math.round(haversineMiles(team.coords, venue.coords)),
  };
}
