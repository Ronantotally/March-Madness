/**
 * Mapping of team names (as used in teams.json) to ESPN numeric team IDs.
 * Logos are served at: https://a.espncdn.com/i/teamlogos/ncaa/500/{id}.png
 */
const ESPN_TEAM_IDS: Record<string, number> = {
  // 1-seeds
  Duke: 150,
  Florida: 57,
  Michigan: 130,
  Arizona: 12,

  // 2-seeds
  "Iowa St.": 66,
  Houston: 248,
  UConn: 41,
  Purdue: 2509,

  // 3-seeds
  "Michigan St.": 127,
  Illinois: 356,
  Virginia: 258,
  Gonzaga: 2250,

  // 4-seeds
  Kansas: 2305,
  Nebraska: 158,
  Alabama: 333,
  Arkansas: 8,

  // 5-seeds
  "St. John's": 2599,
  Vanderbilt: 238,
  "Texas Tech": 2641,
  Wisconsin: 275,

  // 6-seeds
  Louisville: 97,
  "North Carolina": 153,
  Tennessee: 2633,
  BYU: 252,

  // 7-seeds
  UCLA: 26,
  "Saint Mary's": 2608,
  Kentucky: 96,
  "Miami FL": 2390,

  // 8-seeds
  "Ohio St.": 194,
  Clemson: 228,
  Georgia: 61,
  Villanova: 222,

  // 9-seeds
  TCU: 2628,
  Iowa: 2294,
  "Saint Louis": 139,
  "Utah St.": 328,

  // 10-seeds
  UCF: 2116,
  "Texas A&M": 245,
  "Santa Clara": 2541,
  Missouri: 142,

  // 11-seeds
  "South Florida": 58,
  VCU: 2670,
  SMU: 2567,
  "N.C. State": 152,
  "Miami OH": 193,
  Texas: 251,

  // 12-seeds
  "Northern Iowa": 2460,
  McNeese: 2377,
  Akron: 2006,
  "High Point": 2272,

  // 13-seeds
  "Cal Baptist": 2856,
  Troy: 2653,
  Hofstra: 2275,
  Hawaii: 62,

  // 14-seeds
  "N. Dakota St.": 2449,
  Penn: 219,
  "Wright St.": 2750,
  "Kennesaw St.": 338,

  // 15-seeds
  Furman: 231,
  Idaho: 70,
  "Tennessee St.": 2634,
  Queens: 2511,

  // 16-seeds
  Siena: 2561,
  Lehigh: 2329,
  "Prairie View A&M": 2504,
  UMBC: 2378,
  Howard: 47,
  LIU: 112358,
};

export function getLogoUrl(teamName: string): string | null {
  const id = ESPN_TEAM_IDS[teamName];
  if (!id) return null;
  return `https://a.espncdn.com/i/teamlogos/ncaa/500/${id}.png`;
}

export function getEspnId(teamName: string): number | null {
  return ESPN_TEAM_IDS[teamName] ?? null;
}

/**
 * Get a short abbreviation for fallback display when logo fails to load.
 */
export function getTeamAbbrev(teamName: string): string {
  const ABBREVS: Record<string, string> = {
    Duke: "DUK",
    Florida: "FLA",
    Michigan: "MICH",
    Arizona: "ARIZ",
    "Iowa St.": "ISU",
    Houston: "HOU",
    UConn: "UCON",
    Purdue: "PUR",
    "Michigan St.": "MSU",
    Illinois: "ILL",
    Virginia: "UVA",
    Gonzaga: "GONZ",
    Kansas: "KU",
    Nebraska: "NEB",
    Alabama: "BAMA",
    Arkansas: "ARK",
    "St. John's": "SJU",
    Vanderbilt: "VAND",
    "Texas Tech": "TTU",
    Wisconsin: "WISC",
    Louisville: "LOU",
    "North Carolina": "UNC",
    Tennessee: "TENN",
    BYU: "BYU",
    UCLA: "UCLA",
    "Saint Mary's": "SMC",
    Kentucky: "UK",
    "Miami FL": "MIA",
    "Ohio St.": "OSU",
    Clemson: "CLEM",
    Georgia: "UGA",
    Villanova: "NOVA",
    TCU: "TCU",
    Iowa: "IOWA",
    "Saint Louis": "SLU",
    "Utah St.": "USU",
    UCF: "UCF",
    "Texas A&M": "TAMU",
    "Santa Clara": "SCU",
    Missouri: "MIZZ",
    "South Florida": "USF",
    VCU: "VCU",
    SMU: "SMU",
    "N.C. State": "NCST",
    "Miami OH": "M-OH",
    Texas: "TEX",
    "Northern Iowa": "UNI",
    McNeese: "MCN",
    Akron: "AKR",
    "High Point": "HPU",
    "Cal Baptist": "CBU",
    Troy: "TROY",
    Hofstra: "HOF",
    Hawaii: "HAW",
    "N. Dakota St.": "NDSU",
    Penn: "PENN",
    "Wright St.": "WSU",
    "Kennesaw St.": "KSU",
    Furman: "FUR",
    Idaho: "IDHO",
    "Tennessee St.": "TSU",
    Queens: "QU",
    Siena: "SIEN",
    Lehigh: "LEH",
    "Prairie View A&M": "PVAM",
    UMBC: "UMBC",
    Howard: "HOW",
    LIU: "LIU",
  };
  return ABBREVS[teamName] ?? teamName.slice(0, 3).toUpperCase();
}
