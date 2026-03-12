import { useState, useCallback, useRef, useEffect } from "react";

// ═══════════════════════════════════════════════════════════════════════════════
// DESIGN SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════
const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Bebas+Neue&family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;0,8..60,600;1,8..60,400&display=swap');`;

const CSS = `
  ${FONTS}
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { background: #1a1a2e; }

  :root {
    --navy:   #0d1b35;
    --navy2:  #152542;
    --blue:   #1a4a8a;
    --gold:   #c9a84c;
    --gold2:  #e8c96e;
    --cream:  #f5f0e8;
    --paper:  #faf8f4;
    --ink:    #1c1c1c;
    --muted:  #6b6b6b;
    --rule:   #d4c9b0;
    --dem-bg:    #0c2340;
    --dem-acc:   #1d5fa8;
    --dem-light: #e8f1fb;
    --rep-bg:    #5c1414;
    --rep-acc:   #b91c1c;
    --rep-light: #fdf0f0;
  }

  @keyframes fadeUp   { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
  @keyframes spin     { to { transform: rotate(360deg); } }
  @keyframes pulse    { 0%,100%{opacity:.5} 50%{opacity:1} }
  @keyframes slideIn  { from { opacity:0; transform:translateX(-8px); } to { opacity:1; transform:translateX(0); } }

  .fade-up   { animation: fadeUp  0.35s ease forwards; }
  .fade-in   { animation: fadeIn  0.25s ease forwards; }
  .slide-in  { animation: slideIn 0.2s  ease forwards; }

  button { font-family: inherit; }

  /* Staggered children */
  .stagger > * { opacity: 0; animation: fadeUp 0.4s ease forwards; }
  .stagger > *:nth-child(1) { animation-delay: 0.05s; }
  .stagger > *:nth-child(2) { animation-delay: 0.10s; }
  .stagger > *:nth-child(3) { animation-delay: 0.15s; }
  .stagger > *:nth-child(4) { animation-delay: 0.20s; }
  .stagger > *:nth-child(5) { animation-delay: 0.25s; }
  .stagger > *:nth-child(6) { animation-delay: 0.30s; }

  input:focus { outline: 2px solid var(--gold); outline-offset: 2px; }
  a { color: var(--dem-acc); text-decoration: none; }
  a:hover { text-decoration: underline; }

  .candidate-row:hover { border-color: #b0b8c4 !important; }
`;

// ═══════════════════════════════════════════════════════════════════════════════
// BALLOT DATA — Official March 3, 2026 Texas Primary
// Source: Dallas County & Tarrant County official sample ballots
// ═══════════════════════════════════════════════════════════════════════════════

const OFFICE_INFO = {
  "United States Senator": {
    term: "6-year term",
    stake: "One of Texas's two U.S. Senators, representing all 30M Texans in Washington. Votes on federal legislation, confirms Supreme Court justices, and ratifies treaties.",
    note: "Texas hasn't elected a Democrat to this seat since 1988.",
    runoff: true,
  },
  "U.S. Representative, District 24": {
    term: "2-year term",
    stake: "Represents TX-24 (Grapevine, Irving, Las Colinas) in the U.S. House. One of the most competitive suburban districts in Texas — flipped multiple times since 2020.",
    runoff: true,
  },
  "U.S. Representative, District 32": {
    term: "2-year term",
    stake: "Represents TX-32 in the U.S. House. Redrawn in 2025 to cover parts of Dallas and Collin counties. Nine Republicans competing for a newly redrawn seat.",
    runoff: true,
  },
  "Governor": {
    term: "4-year term",
    stake: "Chief executive of Texas. Signs or vetoes legislation, appoints ~1,500 officials, commands the National Guard, and controls emergency powers.",
    note: "No Democrat has held this office since Ann Richards left in 1995.",
    runoff: true,
  },
  "Lieutenant Governor": {
    term: "4-year term",
    stake: "Presides over the Texas Senate and controls its agenda. Widely considered the most powerful office in Texas state government — often more influential than the Governor on legislation.",
    runoff: true,
  },
  "Attorney General": {
    term: "4-year term",
    stake: "Chief legal officer of Texas. Defends state laws in court, leads consumer protection, and issues binding opinions on state policy.",
    note: "Open seat in 2026 — Ken Paxton vacated to run for U.S. Senate.",
    runoff: true,
  },
  "Comptroller of Public Accounts": {
    term: "4-year term",
    stake: "Texas's chief financial officer. Manages the state's $200B+ budget, collects all state taxes, and certifies how much the legislature can spend every two years.",
    runoff: true,
  },
  "Commissioner of the General Land Office": {
    term: "4-year term",
    stake: "Manages 13 million acres of state land and the Permanent School Fund. Also oversees Alamo preservation and coastal erosion programs.",
    runoff: true,
  },
  "Commissioner of Agriculture": {
    term: "4-year term",
    stake: "Regulates food safety, promotes Texas agricultural products, and oversees rural programs. Texas is the #1 agricultural state by economic value.",
    runoff: true,
  },
  "Railroad Commissioner": {
    term: "6-year term",
    stake: "Despite the name, this office regulates Texas's entire oil and gas industry — drilling permits, pipeline safety, environmental compliance, and waste disposal.",
    runoff: true,
  },
  "Criminal District Attorney, Tarrant County": {
    term: "4-year term",
    stake: "Chief prosecutor for all criminal cases in Tarrant County (2.1M residents). Sets charging policies and shapes the county's entire approach to criminal justice.",
    runoff: true,
  },
  "Criminal District Attorney, Dallas County": {
    term: "4-year term",
    stake: "Chief prosecutor for Dallas County (2.6M residents). Incumbent John Creuzot has pursued criminal justice reforms since 2019.",
    runoff: true,
  },
  "County Judge, Tarrant County": {
    term: "4-year term",
    stake: "Chief executive of Tarrant County government and presiding judge of Commissioners Court. Controls the county budget, oversees infrastructure, and leads public health response.",
    runoff: true,
  },
  "County Judge, Dallas County": {
    term: "4-year term",
    stake: "Chief executive of Dallas County. Clay Jenkins (D) has held this seat since 2011 and gained national attention for his COVID-19 public health decisions.",
    runoff: true,
  },
};

const DEM_PROPS = [
  { n: 1,  topic: "Healthcare",          text: "Texas should expand Medicaid and ensure access to affordable healthcare for all." },
  { n: 2,  topic: "Immigration",         text: "Texans should support humane and dignified immigration policies and pathways to citizenship." },
  { n: 3,  topic: "Reproductive Rights", text: "Texans should have the right to make their own healthcare decisions, including reproductive rights." },
  { n: 4,  topic: "Housing",             text: "Texas should address the state's housing crisis in affordability and access in both urban and rural communities." },
  { n: 5,  topic: "Education",           text: "Texas should fund all public schools at the same per-pupil rate as the national average." },
  { n: 6,  topic: "Voting Rights",       text: "Secure online voter registration should be accessible to all eligible Texas residents." },
  { n: 7,  topic: "Environment",         text: "Texas should have a clean and healthy environment that includes water, air, and biodiversity." },
  { n: 8,  topic: "Criminal Justice",    text: "Texas should legalize cannabis for adults and automatically expunge criminal records for past low-level cannabis offenses." },
  { n: 9,  topic: "Labor",               text: "Texas should raise salaries to at least the national average and provide a cost-of-living increase for school and state employees." },
  { n: 10, topic: "Voting Rights",       text: "Texas should ban racially motivated redistricting and create a non-partisan redistricting board to redraw lines every 10 years." },
  { n: 11, topic: "Economy",             text: "The Working Class should be eligible for greater federal income tax relief with burden fairly shifted to the wealthiest." },
  { n: 12, topic: "Infrastructure",      text: "Texas should expand accessible public transportation in rural and urban communities." },
  { n: 13, topic: "Public Safety",       text: "Texas should implement 'red flag' laws to prevent individuals with a history of domestic abuse from purchasing firearms." },
];

const REP_PROPS = [
  { n: 1,  topic: "Property Tax",       text: "Texas property taxes should be assessed at the purchase price and phased out entirely over the next six years through spending reductions." },
  { n: 2,  topic: "Property Tax",       text: "Any local government budget that raises property taxes should be approved by voters at a November general election." },
  { n: 3,  topic: "Healthcare",         text: "Texas should prohibit denial of healthcare or any medical service based solely on the patient's vaccination status." },
  { n: 4,  topic: "Education",          text: "Texas should require its public schools to teach that life begins at fertilization." },
  { n: 5,  topic: "Education",          text: "Texas should ban gender, sexuality, and reproductive clinics and services in K-12 schools." },
  { n: 6,  topic: "Government Reform",  text: "Texas should enact term limits on all elected officials." },
  { n: 7,  topic: "Water Rights",       text: "Texas should ban the large-scale export or sale of groundwater and surface water to any single private or public entity." },
  { n: 8,  topic: "Immigration",        text: "The Texas Legislature should reduce the burden of illegal immigration on taxpayers by ending public services for illegal aliens." },
  { n: 9,  topic: "Government Reform",  text: "The Republican-controlled Texas Legislature should stop awarding leadership positions, including committee chairmanships, to Democrats." },
  { n: 10, topic: "Religious Freedom",  text: "Texas should prohibit Sharia Law." },
];

const BALLOTS = {
  "76051": {
    zip: "76051", city: "Grapevine", county: "Tarrant",
    congressional: "TX-24", state_senate: "SD-12", state_house: "HD-98",
    democratic: {
      races: [
        { office: "United States Senator", level: "Federal",
          candidates: ["Jasmine Crockett", "James Talarico", "Ahmad R. Hassan"] },
        { office: "U.S. Representative, District 24", level: "Federal",
          candidates: ["Jon Buchwald", "TJ Ware", "Kevin Burge"] },
        { office: "Governor", level: "State",
          candidates: ["Gina Hinojosa", "Chris Bell", "Carlton W. Hart", "Andrew White",
            "Patricia Abrego", "Zach Vance", "Angela 'TíaAngie' Villescaz",
            "Jose Navarro Balbuena", "Bobby Cole"] },
        { office: "Lieutenant Governor", level: "State",
          candidates: ["Vikki Goodwin", "Courtney Head", "Marcos Isaias Velez"] },
        { office: "Attorney General", level: "State",
          candidates: ["Joe Jaworski", "Nathan Johnson", "Anthony 'Tony' Box"] },
        { office: "Comptroller of Public Accounts", level: "State",
          candidates: ["Sarah Eckhardt", "Savant Moore", "Michael Lange"] },
        { office: "Commissioner of the General Land Office", level: "State",
          candidates: ["Jose Loya", "Benjamin Flores"] },
        { office: "Commissioner of Agriculture", level: "State",
          candidates: ["Clayton Tucker"] },
        { office: "Railroad Commissioner", level: "State",
          candidates: ["Jon Rosenthal"] },
        { office: "State Representative, District 98", level: "State",
          candidates: ["Cate Brennan", "Aaron Hendley"] },
        { office: "Criminal District Attorney, Tarrant County", level: "County",
          candidates: ["Tiffany Burks"] },
        { office: "County Judge, Tarrant County", level: "County",
          candidates: ["Marc Veasey", "Millennium Anton C. Woods Jr.", "Alisa Simmons"] },
        { office: "District Clerk", level: "County", candidates: ["Nathan Smith"] },
        { office: "County Clerk", level: "County", candidates: ["Lydia Bean", "Gregoire Lewis"] },
      ],
      propositions: DEM_PROPS,
    },
    republican: {
      races: [
        { office: "United States Senator", level: "Federal",
          candidates: ["John Cornyn", "Ken Paxton", "Wesley Hunt", "Sara Canady",
            "Anna Bender", "John O. Adefope", "Gulrez 'Gus' Khan", "Virgil John Bierschwale"] },
        { office: "U.S. Representative, District 24", level: "Federal",
          candidates: ["Beth Van Duyne"] },
        { office: "Governor", level: "State",
          candidates: ["Greg Abbott", "Evelyn Brooks", "Pete 'Doc' Chambers", "Charles Andrew Crouch",
            "Ronnie Tullos", "Kenneth Hyde", "Arturo Espinosa", "Stephen Samuelson",
            "Nathaniel Welch", "R.F. 'Bob' Achgill", "Mark V. Goloby"] },
        { office: "Lieutenant Governor", level: "State",
          candidates: ["Dan Patrick", "Timothy Mabry", "Esala Wueschner", "Perla Muñoz Hopkins"] },
        { office: "Attorney General", level: "State",
          candidates: ["Chip Roy", "Joan Huffman", "Mayes Middleton", "Aaron Reitz"] },
        { office: "Comptroller of Public Accounts", level: "State",
          candidates: ["Kelly Hancock", "Christi Craddick", "Don Huffines", "Michael Berlanga"] },
        { office: "Commissioner of the General Land Office", level: "State",
          candidates: ["Dawn Buckingham"] },
        { office: "Commissioner of Agriculture", level: "State",
          candidates: ["Sid Miller", "Nate Sheets"] },
        { office: "Railroad Commissioner", level: "State",
          candidates: ["Jim Wright", "Hawk Dunlap", "James 'Jim' Matlock", "Bo French", "Katherine Culbert"] },
        { office: "State Representative, District 98", level: "State",
          candidates: ["Armin Mizani", "Fred Tate", "Zdenka 'Zee' Wilcox"] },
        { office: "Criminal District Attorney, Tarrant County", level: "County",
          candidates: ["Phil Sorrels"] },
        { office: "County Judge, Tarrant County", level: "County",
          candidates: ["Tim O'Hare", "Robert Trevor Buker"] },
        { office: "District Clerk", level: "County", candidates: ["Tom Wilder"] },
        { office: "County Clerk", level: "County", candidates: ["Mary Louise Nicholson"] },
      ],
      propositions: REP_PROPS,
    },
  },

  "75019": {
    zip: "75019", city: "Coppell", county: "Dallas",
    congressional: "TX-32", state_senate: "SD-16", state_house: "HD-102",
    democratic: {
      races: [
        { office: "United States Senator", level: "Federal",
          candidates: ["Jasmine Crockett", "James Talarico", "Ahmad R. Hassan"] },
        { office: "U.S. Representative, District 32", level: "Federal",
          candidates: ["Dan Barrios", "Anthony Bridges"] },
        { office: "Governor", level: "State",
          candidates: ["Gina Hinojosa", "Chris Bell", "Carlton W. Hart", "Andrew White",
            "Patricia Abrego", "Zach Vance", "Angela 'TíaAngie' Villescaz",
            "Jose Navarro Balbuena", "Bobby Cole"] },
        { office: "Lieutenant Governor", level: "State",
          candidates: ["Vikki Goodwin", "Courtney Head", "Marcos Isaias Velez"] },
        { office: "Attorney General", level: "State",
          candidates: ["Joe Jaworski", "Nathan Johnson", "Anthony 'Tony' Box"] },
        { office: "Comptroller of Public Accounts", level: "State",
          candidates: ["Sarah Eckhardt", "Savant Moore", "Michael Lange"] },
        { office: "Commissioner of the General Land Office", level: "State",
          candidates: ["Jose Loya", "Benjamin Flores"] },
        { office: "Commissioner of Agriculture", level: "State",
          candidates: ["Clayton Tucker"] },
        { office: "Railroad Commissioner", level: "State",
          candidates: ["Jon Rosenthal"] },
        { office: "State Representative, District 102", level: "State",
          candidates: ["Ana-Maria Rodriguez Ramos"] },
        { office: "Criminal District Attorney, Dallas County", level: "County",
          candidates: ["Amber Givens", "John Creuzot"] },
        { office: "County Judge, Dallas County", level: "County",
          candidates: ["Clay Jenkins"] },
        { office: "District Clerk", level: "County", candidates: ["Felicia Pitre"] },
        { office: "County Clerk", level: "County",
          candidates: ["Ann Marie Cruz", "Damarcus L Offord", "Tony Grimes"] },
        { office: "County Treasurer", level: "County", candidates: ["Pauline Medrano"] },
        { office: "County Commissioner, Precinct 2", level: "County", candidates: ["Andy Sommerman"] },
      ],
      propositions: DEM_PROPS,
    },
    republican: {
      races: [
        { office: "United States Senator", level: "Federal",
          candidates: ["John Cornyn", "Ken Paxton", "Wesley Hunt", "Sara Canady",
            "Anna Bender", "John O. Adefope", "Gulrez 'Gus' Khan", "Virgil John Bierschwale"] },
        { office: "U.S. Representative, District 32", level: "Federal",
          candidates: ["Jace Yarbrough", "James Ussery", "Darrell Day", "Paul L. Bondar",
            "Ryan Binkley", "Gordon Heslop", "Monty Montanez", "Abteen Vaziri", "Aimee Carrasco"] },
        { office: "Governor", level: "State",
          candidates: ["Greg Abbott", "Evelyn Brooks", "Pete 'Doc' Chambers", "Charles Andrew Crouch",
            "Ronnie Tullos", "Kenneth Hyde", "Arturo Espinosa", "Stephen Samuelson",
            "Nathaniel Welch", "R.F. 'Bob' Achgill", "Mark V. Goloby"] },
        { office: "Lieutenant Governor", level: "State",
          candidates: ["Dan Patrick", "Timothy Mabry", "Esala Wueschner", "Perla Muñoz Hopkins"] },
        { office: "Attorney General", level: "State",
          candidates: ["Chip Roy", "Joan Huffman", "Mayes Middleton", "Aaron Reitz"] },
        { office: "Comptroller of Public Accounts", level: "State",
          candidates: ["Kelly Hancock", "Christi Craddick", "Don Huffines", "Michael Berlanga"] },
        { office: "Commissioner of the General Land Office", level: "State",
          candidates: ["Dawn Buckingham"] },
        { office: "Commissioner of Agriculture", level: "State",
          candidates: ["Sid Miller", "Nate Sheets"] },
        { office: "Railroad Commissioner", level: "State",
          candidates: ["Jim Wright", "Hawk Dunlap", "James 'Jim' Matlock", "Bo French", "Katherine Culbert"] },
        { office: "State Representative, District 102", level: "State",
          candidates: ["Bonnie Abadie"] },
        { office: "County Judge, Dallas County", level: "County", candidates: ["Mike Immler"] },
        { office: "District Clerk", level: "County", candidates: ["Dave Muehlhaeusler"] },
        { office: "County Clerk", level: "County", candidates: ["Skye Garcia"] },
        { office: "County Treasurer", level: "County", candidates: ["Corsandra Brigham Phelps"] },
        { office: "County Commissioner, Precinct 2", level: "County",
          candidates: ["Blake W. Clemens", "Barry Wernick"] },
      ],
      propositions: REP_PROPS,
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// DESIGN TOKENS
// ═══════════════════════════════════════════════════════════════════════════════
const TOPIC_COLOR = {
  "Healthcare": "#0e7490", "Immigration": "#6d28d9", "Reproductive Rights": "#be185d",
  "Housing": "#b45309", "Education": "#047857", "Voting Rights": "#1d4ed8",
  "Environment": "#15803d", "Criminal Justice": "#7c3aed", "Economy": "#a16207",
  "Infrastructure": "#0369a1", "Public Safety": "#991b1b", "Property Tax": "#c2410c",
  "Government Reform": "#4338ca", "Water Rights": "#0c4a6e", "Religious Freedom": "#5b21b6",
  "Labor": "#0f766e",
};

const LEVEL_META = {
  Federal: { label: "Federal",  color: "#1e3a5f", icon: "🏛" },
  State:   { label: "State",    color: "#14532d", icon: "⭐" },
  County:  { label: "County",   color: "#3b0764", icon: "🏠" },
};

const PARTY_COLORS = {
  democratic: {
    bg:      "#0c2340",
    accent:  "#1d5fa8",
    light:   "#e8f2fd",
    text:    "#1a4a8a",
    muted:   "#5585b5",
    border:  "#bcd4f0",
    gradient:"linear-gradient(160deg, #0c2340 0%, #1a3d6e 100%)",
    label:   "Democratic",
    emoji:   "🔵",
  },
  republican: {
    bg:      "#5c1414",
    accent:  "#c0392b",
    light:   "#fdf0f0",
    text:    "#991b1b",
    muted:   "#cd6b6b",
    border:  "#f0bcbc",
    gradient:"linear-gradient(160deg, #5c1414 0%, #8b2222 100%)",
    label:   "Republican",
    emoji:   "🔴",
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// AI LAYER — Claude API with web search
// ═══════════════════════════════════════════════════════════════════════════════
async function callClaude(userPrompt) {
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        tools: [{ type: "web_search_20250305", name: "web_search" }],
        messages: [{ role: "user", content: userPrompt }],
      }),
    });
    const data = await res.json();
    const textBlock = data.content?.find(b => b.type === "text");
    if (!textBlock) return null;
    const raw = textBlock.text.trim();
    const s = raw.indexOf("{"), e = raw.lastIndexOf("}");
    if (s === -1 || e === -1) return null;
    return JSON.parse(raw.slice(s, e + 1));
  } catch {
    return null;
  }
}

// ── PRE-CACHED PROFILES ───────────────────────────────────────────────────────
// Hand-researched for well-known candidates — no API cost, always available.
// Lesser-known candidates fall through to live AI lookup automatically.
const PROFILE_CACHE = {
  "Jasmine Crockett||United States Senator": {
    tagline: "U.S. Representative for TX-30 and civil rights attorney known for sharp exchanges in congressional hearings.",
    bio: "Jasmine Crockett represents Texas's 30th congressional district, covering much of southern Dallas. Before Congress she was a criminal defense and civil rights attorney, and served in the Texas House. She gained national attention in 2024 for heated exchanges with Republican colleagues during House Oversight hearings.",
    platform: ["Expand voting rights and protect election access", "Criminal justice reform and ending mass incarceration", "Reproductive rights and healthcare access"],
    notable: "Her sparring matches with Marjorie Taylor Greene in 2024 went viral and dramatically raised her national profile, fueling this Senate run.",
    source: "Ballotpedia, Texas Tribune", found: true,
  },
  "James Talarico||United States Senator": {
    tagline: "Former Texas State Representative and educator who resigned his House seat to mount this Senate challenge.",
    bio: "James Talarico served in the Texas House representing a district in the Austin suburbs, where he was known as a progressive voice on education and healthcare. A former teacher, he resigned his seat in 2025 to run statewide. He has positioned himself as a Christian progressive who can appeal to moderate and rural voters.",
    platform: ["Universal healthcare and Medicaid expansion", "Public education funding and teacher pay", "Immigration reform with a pathway to citizenship"],
    notable: "Talarico broke with fellow Democrats during the 2021 voting rights walkout — a decision that became a major attack line against him in this primary.",
    source: "Texas Tribune, Ballotpedia", found: true,
  },
  "Ahmad R. Hassan||United States Senator": {
    tagline: "Attorney and first-time statewide candidate running as an outsider in the Democratic Senate primary.",
    bio: "Ahmad R. Hassan is an attorney and community organizer making his first bid for statewide office. He has positioned himself as a grassroots alternative to the better-funded Crockett and Talarico campaigns.",
    platform: ["Economic justice and workers' rights", "Healthcare access for all Texans", "Community-based public safety reform"],
    notable: "Running with minimal name recognition and campaign funding, Hassan is the true dark horse of the three-way Democratic Senate primary.",
    source: "Ballotpedia", found: true,
  },
  "Ken Paxton||United States Senator": {
    tagline: "Texas Attorney General from 2015–2026, impeached by the Texas House in 2023 but acquitted by the Senate.",
    bio: "Ken Paxton served as Texas Attorney General for over a decade, becoming one of the most prominent conservative AGs in the country through high-profile lawsuits against the Biden administration and the 2020 election results. In 2023 the Texas House impeached him on corruption charges; he was acquitted by the Republican-controlled Senate. He is now challenging incumbent John Cornyn from the right.",
    platform: ["Border security and ending illegal immigration", "Election integrity and challenging federal overreach", "Prosecuting what he calls 'weaponized' federal agencies"],
    notable: "His 2023 impeachment — on charges including bribery, abuse of office, and an alleged affair — was the first impeachment of a Texas official in nearly 50 years.",
    source: "Texas Tribune, Ballotpedia", found: true,
  },
  "John Cornyn||United States Senator": {
    tagline: "Four-term U.S. Senator and Senate Majority Whip facing a primary challenge from his right flank.",
    bio: "John Cornyn has represented Texas in the U.S. Senate since 2002, previously serving as Texas Attorney General and a Texas Supreme Court Justice. As Senate Majority Whip he is the second-ranking Republican in the Senate. He co-authored the 2022 Bipartisan Safer Communities Act on gun safety — a vote that has become an attack point in this primary.",
    platform: ["Border security and immigration enforcement", "Energy production and opposing climate regulations", "Reducing federal spending and the national debt"],
    notable: "His 2022 vote for bipartisan gun legislation — the most significant federal gun law in decades — is now the central attack against him from Ken Paxton and the MAGA wing.",
    source: "Senate.gov, Texas Tribune", found: true,
  },
  "Wesley Hunt||United States Senator": {
    tagline: "U.S. Representative for TX-38 and West Point graduate running to Cornyn's right in the Senate primary.",
    bio: "Wesley Hunt represents Texas's 38th congressional district in the Houston suburbs. A West Point graduate and Army helicopter pilot who flew combat missions in Iraq, he was first elected in 2022. He has closely aligned himself with Donald Trump and is positioning himself as a fresh MAGA voice against the establishment.",
    platform: ["Strict border enforcement and ending catch-and-release", "Second Amendment rights with no compromise", "Lower taxes and cutting government spending"],
    notable: "Hunt was one of the first Black Republicans elected to Congress from Texas, representing a deep-red district specifically drawn for him after the 2020 redistricting.",
    source: "Ballotpedia, Texas Tribune", found: true,
  },
  "Gina Hinojosa||Governor": {
    tagline: "Texas State Representative and education attorney from Austin who is the frontrunner in the Democratic gubernatorial primary.",
    bio: "Gina Hinojosa represents a district in central Austin in the Texas House, where she has focused on public education, women's rights, and healthcare access. An education attorney by training, she previously served on the Austin ISD board of trustees. She became the frontrunner after Andrew White dropped out and endorsed her.",
    platform: ["Expand Medicaid and healthcare access", "Fully fund public education and raise teacher pay", "Restore reproductive rights and repeal the abortion ban"],
    notable: "Former candidate Andrew White — son of late Governor Mark White — dropped out and endorsed Hinojosa, consolidating moderate support behind her.",
    source: "Texas Tribune, Ballotpedia", found: true,
  },
  "Greg Abbott||Governor": {
    tagline: "Three-term Governor of Texas and former state Attorney General seeking an unprecedented fourth term.",
    bio: "Greg Abbott has served as Governor of Texas since 2015, previously serving as Texas Attorney General for 12 years and as a Texas Supreme Court Justice. During his tenure he has signed major conservative legislation on border security, school choice, abortion restrictions, and gun rights.",
    platform: ["Border security including Operation Lone Star", "School choice and education savings accounts", "Economic development and keeping Texas business-friendly"],
    notable: "Abbott has been paralyzed from the waist down since 1984 after a tree fell on him while jogging — a lawsuit settlement from that accident funded his early legal career.",
    source: "Governor.texas.gov, Texas Tribune", found: true,
  },
  "Evelyn Brooks||Governor": {
    tagline: "State Board of Education member from Frisco challenging Abbott from the right on property taxes and parental rights.",
    bio: "Evelyn Brooks serves on the Texas State Board of Education representing District 14, where she is Vice Chair of the Committee on Instruction. She founded a homeschool co-op in Frisco and has 26 years of education experience. She is challenging Abbott primarily on property tax relief and parental rights in education.",
    platform: ["Eliminate property taxes over six years", "Expand parental rights and school choice", "Reduce government spending and regulation"],
    notable: "As a sitting SBOE member challenging the incumbent Governor, Brooks represents the tension between the grassroots conservative base and the Abbott establishment.",
    source: "Campaign website, Ballotpedia", found: true,
  },
  "Pete 'Doc' Chambers||Governor": {
    tagline: "Retired Green Beret and Army flight surgeon — one of the most credentialed military candidates in the Republican governor's race.",
    bio: "Pete 'Doc' Chambers served as both a Special Forces officer and a special operations flight surgeon, a rare dual qualification in the U.S. military. After retiring he pursued a medical career and became involved in Texas conservative politics. He is running on a platform of abolishing property taxes entirely.",
    platform: ["Abolish property taxes entirely", "Second Amendment sanctuary state policies", "Reduce state government size and spending"],
    notable: "Chambers holds the unusual distinction of qualifying as both a Green Beret and a flight surgeon — two of the most selective specialties in the U.S. Army.",
    source: "Campaign website, Ballotpedia", found: true,
  },
  "Chip Roy||Attorney General": {
    tagline: "U.S. Representative and House Freedom Caucus firebrand giving up his congressional seat to run for Texas AG.",
    bio: "Chip Roy has represented the Austin-area TX-21 district in Congress since 2019 and is a prominent House Freedom Caucus member known for using procedural tactics to block legislation he opposes. A former aide to Ted Cruz and one-time chief of staff to Greg Abbott, he is vacating his congressional seat to run for AG. He previously served as First Assistant Attorney General under Abbott.",
    platform: ["Aggressive prosecution of border-related crimes", "Challenge federal regulations in court", "Election integrity enforcement"],
    notable: "Roy was one of the Republicans who opposed Kevin McCarthy's speakership bid, helping precipitate the chaos that eventually led to McCarthy's ouster in 2023.",
    source: "Texas Tribune, Ballotpedia", found: true,
  },
  "Joe Jaworski||Attorney General": {
    tagline: "Former Galveston Mayor and grandson of Watergate special prosecutor Leon Jaworski.",
    bio: "Joe Jaworski served as Mayor of Galveston and has practiced law in Texas for decades. He is the grandson of Leon Jaworski, the special prosecutor who pursued Richard Nixon during Watergate. He ran for Texas AG in 2022 and is making his second attempt at the office in 2026.",
    platform: ["Consumer protection and corporate accountability", "Defend voting rights and challenge gerrymandering", "Environmental enforcement and clean water protections"],
    notable: "His grandfather Leon Jaworski prosecuted Nazi war criminals at Nuremberg and later served as Watergate special prosecutor — one of the most consequential lawyers in American history.",
    source: "Texas Tribune, Ballotpedia", found: true,
  },
  "John Creuzot||Criminal District Attorney, Dallas County": {
    tagline: "Incumbent Dallas County DA and former judge who has pursued criminal justice reform since taking office in 2019.",
    bio: "John Creuzot was elected Dallas County District Attorney in 2018 after serving as a Dallas County criminal court judge for 22 years. Since taking office he has implemented progressive prosecution policies including declining to prosecute low-level marijuana possession and theft cases below a certain threshold.",
    platform: ["Reform-focused prosecution prioritizing violent crime", "Divert low-level offenders away from incarceration", "Reduce racial disparities in the criminal justice system"],
    notable: "His policy of not prosecuting theft under $750 sparked national controversy and made him a flashpoint in debates over progressive prosecution.",
    source: "Dallas Morning News, Ballotpedia", found: true,
  },
  "Amber Givens||Criminal District Attorney, Dallas County": {
    tagline: "Dallas County prosecutor challenging incumbent DA John Creuzot from within the office over his reform policies.",
    bio: "Amber Givens is an experienced prosecutor who has worked in the Dallas County DA's office. She is challenging incumbent John Creuzot in the Democratic primary, arguing that his reform policies have gone too far and that the office needs to prioritize victim safety and accountability for all crimes.",
    platform: ["Prosecute all crimes regardless of dollar amount", "Prioritize victim rights and public safety", "Restore confidence in the Dallas County justice system"],
    notable: "Givens is an inside challenger — running against her own boss — making this one of the more unusual intra-office primary battles in Dallas County history.",
    source: "Dallas Morning News, Ballotpedia", found: true,
  },
  "Dan Patrick||Lieutenant Governor": {
    tagline: "Three-term Texas Lieutenant Governor and former conservative talk radio host who controls the Texas Senate agenda.",
    bio: "Dan Patrick has served as Texas Lieutenant Governor since 2015 and is widely considered one of the most powerful figures in Texas state government, controlling which bills the Senate considers. A former Houston radio host and state senator, he is known for his close alignment with Donald Trump.",
    platform: ["School choice and education savings accounts", "Border security and anti-immigration enforcement", "Social conservative legislation"],
    notable: "Patrick presided over Ken Paxton's 2023 impeachment trial as Lieutenant Governor — Paxton was acquitted, fueling questions about the fairness of the proceedings.",
    source: "Texas Tribune, Ballotpedia", found: true,
  },
  "Vikki Goodwin||Lieutenant Governor": {
    tagline: "Texas State Representative from Austin running for Lieutenant Governor as the Democratic nominee.",
    bio: "Vikki Goodwin has represented a district in the Austin suburbs in the Texas House since 2019, flipping a previously Republican seat. A former small business owner, she has focused on education funding, healthcare access, and environmental protection.",
    platform: ["Expand Medicaid and lower healthcare costs", "Fully fund public schools and increase teacher pay", "Protect reproductive rights and healthcare decisions"],
    notable: "Goodwin flipped her suburban Austin district blue in 2018 — part of the suburban shift that briefly made Texas Democrats competitive — and has held it through multiple cycles.",
    source: "Ballotpedia, Texas Tribune", found: true,
  },
};

async function fetchCandidateProfile(name, office, party) {
  // Check pre-cached profiles first — instant, no API cost
  const cacheKey = `${name}||${office}`;
  if (PROFILE_CACHE[cacheKey]) {
    return { ...PROFILE_CACHE[cacheKey], cached: true };
  }

  // Fall through to live AI lookup for candidates not in cache
  return callClaude(
    `You are a nonpartisan voter information assistant for a civic app. Use web search to find accurate, current information about ${name}, a ${party} candidate running for ${office} in the Texas March 3, 2026 primary election.

Respond ONLY with a valid JSON object (no markdown, no explanation):
{
  "tagline": "One sentence identifying who they are professionally",
  "bio": "2-3 sentences. Their background, career, and reason for running. Strictly nonpartisan tone.",
  "platform": ["Key position 1", "Key position 2", "Key position 3"],
  "notable": "One interesting distinguishing fact about this candidate",
  "source": "Primary source used (e.g. campaign website, Ballotpedia, Texas Tribune)",
  "found": true
}

If reliable information cannot be found, return:
{"tagline":"Limited public information available","bio":"This candidate has limited publicly available information at this time. Search their name for more details.","platform":[],"notable":"","source":"N/A","found":false}`
  );
}

async function fetchPropExplanation(propText, party) {
  return callClaude(
    `You are a nonpartisan voter education assistant helping Texas voters understand their ballot. Explain this ${party} party primary proposition in plain, accessible language.

Proposition: "${propText}"

Respond ONLY with a valid JSON object (no markdown, no explanation):
{
  "plain": "What this actually means in 1-2 clear sentences, no jargon",
  "if_yes": "What happens if YES wins — 1 concrete sentence",
  "if_no": "What happens if NO wins — 1 concrete sentence",
  "context": "1-2 sentences of nonpartisan background: current Texas law or situation"
}`
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED UI PRIMITIVES
// ═══════════════════════════════════════════════════════════════════════════════
function Spinner({ size = 15, color = "#1d5fa8" }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      border: `2px solid #e5e7eb`, borderTopColor: color,
      animation: "spin 0.7s linear infinite",
    }} />
  );
}

function LoadingRow({ text }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 0", color: "#888" }}>
      <Spinner />
      <span style={{ fontSize: 13, animation: "pulse 1.5s ease infinite", fontFamily: "'Source Serif 4', serif", fontStyle: "italic" }}>
        {text}
      </span>
    </div>
  );
}

function Badge({ color = "#6b7280", children, small }) {
  return (
    <span style={{
      display: "inline-block", borderRadius: 4,
      background: color, color: "white",
      fontSize: small ? 9 : 10, fontWeight: 700,
      letterSpacing: 0.8, textTransform: "uppercase",
      padding: small ? "1px 6px" : "2px 8px",
      fontFamily: "'Libre Baskerville', serif",
      flexShrink: 0,
    }}>{children}</span>
  );
}

function Divider() {
  return <div style={{ height: 1, background: "var(--rule)", margin: "0 0 14px" }} />;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CANDIDATE ROW
// ═══════════════════════════════════════════════════════════════════════════════
function CandidateRow({ name, office, party, partyKey, profileCache }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [failed, setFailed] = useState(false);
  const C = PARTY_COLORS[partyKey];
  const cacheKey = `${name}||${office}`;

  const toggle = useCallback(async () => {
    if (open) { setOpen(false); return; }
    setOpen(true);
    if (profileCache.current[cacheKey]) {
      setProfile(profileCache.current[cacheKey]);
      return;
    }
    if (profile || failed) return;
    setLoading(true);
    const result = await fetchCandidateProfile(name, office, party);
    setLoading(false);
    if (result) { profileCache.current[cacheKey] = result; setProfile(result); }
    else setFailed(true);
  }, [open, profile, failed, name, office, party, cacheKey, profileCache]);

  return (
    <div
      className="candidate-row"
      style={{
        border: `1px solid ${open ? C.accent : "#dde2e8"}`,
        borderRadius: 9, marginBottom: 7, overflow: "hidden",
        background: open ? C.light : "#fff",
        transition: "border-color 0.15s, background 0.15s",
      }}
    >
      <button
        onClick={toggle}
        style={{
          width: "100%", display: "flex", justifyContent: "space-between",
          alignItems: "center", padding: "12px 15px",
          background: "none", border: "none", cursor: "pointer", textAlign: "left",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
          <span style={{
            fontFamily: "'Libre Baskerville', serif",
            fontWeight: 700, fontSize: 14, color: "#111",
            lineHeight: 1.3, flex: 1, minWidth: 0,
          }}>
            {name}
          </span>
          {profile?.found && (
            <span style={{
              fontSize: 9, whiteSpace: "nowrap", fontWeight: 700,
              letterSpacing: 0.5, textTransform: "uppercase",
              color: profile.cached ? C.muted : "#059669",
              background: profile.cached ? "transparent" : "#f0fdf4",
              padding: profile.cached ? 0 : "1px 5px",
              borderRadius: 3,
            }}>
              {profile.cached ? `via ${profile.source?.split(",")[0]}` : "✨ live AI"}
            </span>
          )}
        </div>
        <span style={{
          fontSize: 11, color: open ? C.accent : "#bbb",
          marginLeft: 10, flexShrink: 0, fontWeight: 700,
          transform: open ? "rotate(180deg)" : "none",
          transition: "transform 0.2s",
          display: "inline-block",
        }}>▼</span>
      </button>

      {open && (
        <div style={{ padding: "0 15px 15px", animation: "fadeUp 0.2s ease" }}>
          {loading && <LoadingRow text={`Searching for ${name.split(" ")[0]}'s record...`} />}

          {failed && (
            <div style={{
              padding: "10px 13px", background: "#fffbeb",
              borderRadius: 7, fontSize: 13, color: "#92400e", lineHeight: 1.5,
            }}>
              ⚠️ Profile unavailable. Try searching <em>"{name} Texas 2026"</em> online.
            </div>
          )}

          {profile && (
            <div className="slide-in">
              {/* Tagline */}
              <div style={{
                padding: "10px 14px", background: C.bg,
                borderRadius: 7, marginBottom: 12,
              }}>
                <p style={{
                  color: "rgba(255,255,255,0.88)", margin: 0, fontSize: 13,
                  lineHeight: 1.6, fontFamily: "'Source Serif 4', serif", fontStyle: "italic",
                }}>{profile.tagline}</p>
              </div>

              {/* Bio */}
              <p style={{
                fontSize: 13.5, color: "#374151", lineHeight: 1.75,
                margin: "0 0 13px", fontFamily: "'Source Serif 4', serif",
              }}>{profile.bio}</p>

              {/* Platform */}
              {profile.platform?.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{
                    fontSize: 9, fontWeight: 700, letterSpacing: 2,
                    color: C.text, textTransform: "uppercase",
                    marginBottom: 8, fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: 12,
                  }}>Key Positions</div>
                  {profile.platform.map((pos, i) => (
                    <div key={i} style={{
                      display: "flex", gap: 9, alignItems: "flex-start",
                      marginBottom: 5, fontSize: 13, color: "#4b5563", lineHeight: 1.5,
                    }}>
                      <span style={{
                        width: 5, height: 5, borderRadius: "50%",
                        background: C.accent, marginTop: 7, flexShrink: 0,
                      }} />
                      <span style={{ fontFamily: "'Source Serif 4', serif" }}>{pos}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Notable */}
              {profile.notable && (
                <div style={{
                  padding: "8px 12px", background: "white",
                  border: `1px solid ${C.border}`,
                  borderRadius: 7, fontSize: 12, color: "#6b7280", lineHeight: 1.5,
                }}>
                  <strong style={{ color: C.text }}>Notable: </strong>
                  <span style={{ fontFamily: "'Source Serif 4', serif" }}>{profile.notable}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// RACE CARD
// ═══════════════════════════════════════════════════════════════════════════════
function RaceCard({ race, partyKey, profileCache, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const C = PARTY_COLORS[partyKey];
  const LM = LEVEL_META[race.level] || LEVEL_META.County;
  const info = OFFICE_INFO[race.office];
  const party = partyKey === "democratic" ? "Democratic" : "Republican";

  return (
    <div style={{
      border: "1px solid #dde2e8", borderRadius: 11,
      overflow: "hidden", marginBottom: 9,
      boxShadow: open ? "0 3px 16px rgba(0,0,0,0.09)" : "0 1px 3px rgba(0,0,0,0.04)",
      transition: "box-shadow 0.2s",
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%", display: "flex", justifyContent: "space-between",
          alignItems: "center", padding: "13px 16px",
          background: open ? C.gradient : "white",
          border: "none", cursor: "pointer", textAlign: "left",
          transition: "background 0.2s",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, flexWrap: "wrap" }}>
          <Badge color={LM.color}>{LM.icon} {LM.label}</Badge>
          <span style={{
            fontFamily: "'Libre Baskerville', serif",
            fontWeight: 700, fontSize: 14,
            color: open ? "white" : "#111",
            lineHeight: 1.3,
          }}>{race.office}</span>
          {info?.term && (
            <span style={{
              fontSize: 11, fontFamily: "'Source Serif 4', serif",
              color: open ? "rgba(255,255,255,0.5)" : "#9ca3af",
            }}>{info.term}</span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 10, flexShrink: 0 }}>
          <span style={{
            fontSize: 12, fontWeight: 700,
            color: open ? "rgba(255,255,255,0.6)" : C.muted,
          }}>{race.candidates.length}</span>
          <span style={{
            fontSize: 11, fontWeight: 700,
            color: open ? "rgba(255,255,255,0.6)" : "#bbb",
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 0.2s", display: "inline-block",
          }}>▼</span>
        </div>
      </button>

      {open && (
        <div style={{ padding: 15, background: "#fafbfc", animation: "fadeUp 0.2s ease" }}>
          {/* Office context */}
          {info?.stake && (
            <div style={{
              padding: "11px 14px", background: "white",
              borderRadius: 8, marginBottom: 13,
              borderLeft: `3px solid ${C.accent}`,
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            }}>
              <div style={{
                fontSize: 9, fontWeight: 700, letterSpacing: 2,
                color: C.text, textTransform: "uppercase",
                marginBottom: 5, fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 11,
              }}>Why This Office Matters</div>
              <p style={{
                fontSize: 13, color: "#4b5563", lineHeight: 1.65, margin: 0,
                fontFamily: "'Source Serif 4', serif",
              }}>{info.stake}</p>
              {info.note && (
                <p style={{
                  fontSize: 12, color: "#6b7280", margin: "6px 0 0",
                  fontFamily: "'Source Serif 4', serif", fontStyle: "italic",
                }}>{info.note}</p>
              )}
              {info.runoff && (
                <div style={{
                  marginTop: 8, display: "inline-block", fontSize: 11,
                  background: "#fffbeb", color: "#92400e",
                  padding: "3px 9px", borderRadius: 4, fontWeight: 600,
                }}>
                  ⚡ Requires 50%+ to win outright — runoff May 26 if no majority
                </div>
              )}
            </div>
          )}

          <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 11, display: "flex", alignItems: "center", gap: 5 }}>
            <span>✨</span>
            <span style={{ fontFamily: "'Source Serif 4', serif", fontStyle: "italic" }}>
              Tap any candidate to load their profile from live sources
            </span>
          </div>

          {race.candidates.map(name => (
            <CandidateRow
              key={name} name={name} office={race.office}
              party={party} partyKey={partyKey} profileCache={profileCache}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROPOSITION CARD
// ═══════════════════════════════════════════════════════════════════════════════
function PropCard({ prop, partyKey, explanationCache }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState(null);
  const C = PARTY_COLORS[partyKey];
  const party = partyKey === "democratic" ? "Democratic" : "Republican";
  const topicColor = TOPIC_COLOR[prop.topic] || "#6b7280";

  const toggle = useCallback(async () => {
    if (open) { setOpen(false); return; }
    setOpen(true);
    if (explanationCache.current[prop.n]) {
      setExplanation(explanationCache.current[prop.n]);
      return;
    }
    if (explanation) return;
    setLoading(true);
    const result = await fetchPropExplanation(prop.text, party);
    setLoading(false);
    if (result) { explanationCache.current[prop.n] = result; setExplanation(result); }
  }, [open, explanation, prop, party, explanationCache]);

  return (
    <div style={{
      border: `1px solid ${open ? C.accent : "#dde2e8"}`,
      borderRadius: 10, marginBottom: 9, overflow: "hidden",
      background: open ? C.light : "white",
      transition: "border-color 0.15s, background 0.15s",
    }}>
      <button onClick={toggle} style={{
        width: "100%", display: "flex", alignItems: "flex-start",
        gap: 13, padding: "13px 15px",
        background: "none", border: "none", cursor: "pointer", textAlign: "left",
      }}>
        <span style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 22, color: C.text, minWidth: 30, lineHeight: 1.1, flexShrink: 0,
        }}>#{prop.n}</span>
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: 5 }}>
            <Badge color={topicColor}>{prop.topic}</Badge>
          </div>
          <p style={{
            fontSize: 14, color: "#111", lineHeight: 1.6, margin: 0,
            fontFamily: "'Source Serif 4', serif",
          }}>{prop.text}</p>
          {!open && (
            <span style={{ fontSize: 11, color: "#9ca3af", marginTop: 5, display: "block", fontStyle: "italic" }}>
              Tap for plain-language explanation →
            </span>
          )}
        </div>
        <span style={{
          fontSize: 11, color: open ? C.accent : "#bbb",
          fontWeight: 700, flexShrink: 0, paddingTop: 4,
          transform: open ? "rotate(180deg)" : "none",
          transition: "transform 0.2s", display: "inline-block",
        }}>▼</span>
      </button>

      {open && (
        <div style={{ padding: "0 15px 15px", animation: "fadeUp 0.2s ease" }}>
          {loading && <LoadingRow text="Generating plain-language explanation..." />}
          {explanation && (
            <div>
              <div style={{
                padding: "11px 14px", background: "white",
                borderRadius: 8, marginBottom: 10,
                border: "1px solid #e2e8f0",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6, fontFamily: "'Bebas Neue', sans-serif" }}>
                  In Plain Language
                </div>
                <p style={{ fontSize: 14, color: "#111", lineHeight: 1.7, margin: 0, fontFamily: "'Source Serif 4', serif" }}>
                  {explanation.plain}
                </p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                <div style={{ padding: "10px 12px", background: "#f0fdf4", borderRadius: 8, border: "1px solid #86efac" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#15803d", letterSpacing: 1, textTransform: "uppercase", marginBottom: 5, fontFamily: "'Bebas Neue', sans-serif" }}>
                    ✓ If YES Wins
                  </div>
                  <p style={{ fontSize: 12, color: "#166534", lineHeight: 1.55, margin: 0, fontFamily: "'Source Serif 4', serif" }}>
                    {explanation.if_yes}
                  </p>
                </div>
                <div style={{ padding: "10px 12px", background: "#fff7ed", borderRadius: 8, border: "1px solid #fdba74" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#c2410c", letterSpacing: 1, textTransform: "uppercase", marginBottom: 5, fontFamily: "'Bebas Neue', sans-serif" }}>
                    ✗ If NO Wins
                  </div>
                  <p style={{ fontSize: 12, color: "#9a3412", lineHeight: 1.55, margin: 0, fontFamily: "'Source Serif 4', serif" }}>
                    {explanation.if_no}
                  </p>
                </div>
              </div>
              {explanation.context && (
                <p style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.6, margin: 0, fontFamily: "'Source Serif 4', serif", fontStyle: "italic" }}>
                  <strong style={{ color: "#374151", fontStyle: "normal" }}>Background: </strong>
                  {explanation.context}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════════
// GRADIENT AI AGENT — DigitalOcean hosted voter Q&A
// ═══════════════════════════════════════════════════════════════════════════════
const GRADIENT_AGENT_URL = "https://n3cyh5uwo2knfbn3sgzf5flz.agents.do-ai.run";

const GRADIENT_ACCESS_KEY = "-ZXt1QAIKeiAqm8-yuO8TsOBchaSbHpg"; 

async function askAgent(question, conversationHistory) {
  try {
    const messages = [
      ...conversationHistory,
      { role: "user", content: question }
    ];
    const res = await fetch(`${GRADIENT_AGENT_URL}/api/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GRADIENT_ACCESS_KEY}`,
      },
      body: JSON.stringify({ messages, stream: false }),
    });
    const data = await res.json();
    return data?.choices?.[0]?.message?.content || "Sorry, I couldn't get a response. Please try again.";
  } catch {
    return "Connection error. Please check your internet connection and try again.";
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CHAT PANEL — Gradient AI powered voter Q&A
// ═══════════════════════════════════════════════════════════════════════════════
function ChatPanel({ partyKey, ballot }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hi! I'm your nonpartisan voter guide for the March 3, 2026 Texas primary. I can answer questions about candidates, races, offices, and propositions on your ${ballot.city} ballot. What would you like to know?`
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const C = PARTY_COLORS[partyKey];

  const SUGGESTED = [
    "What does the Railroad Commissioner actually do?",
    "What's the difference between Crockett and Talarico?",
    "Which candidates support property tax elimination?",
    "What happens if no one gets 50%?",
    "Explain Proposition 1 in plain language",
  ];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text) => {
    const question = text || input.trim();
    if (!question) return;
    setInput("");
    const history = messages.map(m => ({ role: m.role, content: m.content }));
    setMessages(prev => [...prev, { role: "user", content: question }]);
    setLoading(true);
    const answer = await askAgent(question, history);
    setLoading(false);
    setMessages(prev => [...prev, { role: "assistant", content: answer }]);
  };

  return (
    <div style={{ animation: "fadeIn 0.2s ease" }}>
      {/* Powered by badge */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: 6, marginBottom: 12,
        fontSize: 11, color: "#9ca3af",
        fontFamily: "'Source Serif 4', serif", fontStyle: "italic",
      }}>
        <span>⚡</span>
        <span>Powered by DigitalOcean Gradient AI · Strictly nonpartisan</span>
      </div>

      {/* Suggested questions */}
      {messages.length <= 1 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{
            fontSize: 11, fontWeight: 700, color: "#9ca3af",
            letterSpacing: 1.5, textTransform: "uppercase",
            marginBottom: 8, fontFamily: "'Bebas Neue', sans-serif", fontSize: 12,
          }}>Suggested Questions</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {SUGGESTED.map(q => (
              <button key={q} onClick={() => send(q)} style={{
                background: "white", border: `1px solid ${C.border}`,
                borderRadius: 8, padding: "9px 13px",
                fontSize: 13, color: C.text, cursor: "pointer",
                textAlign: "left", fontFamily: "'Source Serif 4', serif",
                transition: "background 0.15s",
              }}
              onMouseEnter={e => e.target.style.background = C.light}
              onMouseLeave={e => e.target.style.background = "white"}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Message thread */}
      <div style={{
        background: "white", border: "1px solid #dde2e8",
        borderRadius: 12, overflow: "hidden", marginBottom: 10,
        maxHeight: 420, overflowY: "auto",
      }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            padding: "12px 15px",
            background: m.role === "user" ? C.light : "white",
            borderBottom: i < messages.length - 1 ? "1px solid #f0f2f5" : "none",
          }}>
            <div style={{
              fontSize: 10, fontWeight: 700, letterSpacing: 1.5,
              textTransform: "uppercase", marginBottom: 5,
              color: m.role === "user" ? C.text : "#6b7280",
              fontFamily: "'Bebas Neue', sans-serif", fontSize: 11,
            }}>
              {m.role === "user" ? "You" : "🗳 Voter Guide"}
            </div>
            <p style={{
              fontSize: 14, color: "#111", lineHeight: 1.7, margin: 0,
              fontFamily: "'Source Serif 4', serif",
              whiteSpace: "pre-wrap",
            }}>{m.content}</p>
          </div>
        ))}
        {loading && (
          <div style={{ padding: "12px 15px", background: "white" }}>
            <div style={{
              fontSize: 10, fontWeight: 700, letterSpacing: 1.5,
              textTransform: "uppercase", marginBottom: 5,
              color: "#6b7280", fontFamily: "'Bebas Neue', sans-serif", fontSize: 11,
            }}>🗳 Voter Guide</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#9ca3af" }}>
              <div style={{
                width: 14, height: 14, borderRadius: "50%",
                border: "2px solid #e5e7eb", borderTopColor: C.accent,
                animation: "spin 0.7s linear infinite", flexShrink: 0,
              }} />
              <span style={{ fontSize: 13, fontStyle: "italic", animation: "pulse 1.5s ease infinite" }}>
                Searching knowledge base...
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !loading && send()}
          placeholder="Ask anything about your ballot..."
          disabled={loading}
          style={{
            flex: 1, padding: "12px 15px",
            border: `2px solid ${input ? C.accent : "#dde2e8"}`,
            borderRadius: 10, fontSize: 14,
            fontFamily: "'Source Serif 4', serif",
            outline: "none", transition: "border-color 0.15s",
            background: loading ? "#f9fafb" : "white",
          }}
        />
        <button
          onClick={() => send()}
          disabled={loading || !input.trim()}
          style={{
            padding: "12px 18px", borderRadius: 10,
            background: input.trim() && !loading ? C.bg : "#e5e7eb",
            color: input.trim() && !loading ? "white" : "#9ca3af",
            border: "none", cursor: input.trim() && !loading ? "pointer" : "default",
            fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, letterSpacing: 1,
            transition: "all 0.15s",
          }}
        >
          Ask
        </button>
      </div>
      <p style={{
        fontSize: 11, color: "#9ca3af", marginTop: 6, textAlign: "center",
        fontFamily: "'Source Serif 4', serif", fontStyle: "italic",
      }}>
        This AI provides nonpartisan information only and does not endorse any candidate.
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN: LANDING
// ═══════════════════════════════════════════════════════════════════════════════
function LandingScreen({ onLookup }) {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  const go = (zipOverride) => {
    const z = (zipOverride ?? input).trim();
    if (BALLOTS[z]) { onLookup(z); }
    else { setError(`ZIP code ${z || "—"} not yet covered. Try 76051 or 75019.`); }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(170deg, #0a1628 0%, #0d1f40 50%, #111827 100%)",
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: "40px 20px",
      position: "relative", overflow: "hidden",
    }}>
      <style>{CSS}</style>

      {/* Background texture — subtle star pattern */}
      <div style={{
        position: "absolute", inset: 0, opacity: 0.04,
        backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
        backgroundSize: "40px 40px",
        pointerEvents: "none",
      }} />

      {/* Gold rule top */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0,
        height: 4, background: "linear-gradient(90deg, #c9a84c, #e8c96e, #c9a84c)",
      }} />

      <div className="stagger" style={{ textAlign: "center", maxWidth: 460, width: "100%", position: "relative" }}>
        {/* Masthead */}
        <div style={{
          fontSize: 11, letterSpacing: 6, color: "#c9a84c",
          textTransform: "uppercase", marginBottom: 18,
          fontFamily: "'Libre Baskerville', serif",
        }}>
          ★ DFW Area · March 3, 2026 ★
        </div>

        <h1 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "clamp(40px, 10vw, 78px)",
          color: "white", lineHeight: 0.92,
          letterSpacing: 2, marginBottom: 10,
        }}>
          Voter Intelligence<br />
          <span style={{ color: "#c9a84c" }}>Platform</span>
        </h1>

        <p style={{
          fontFamily: "'Source Serif 4', serif",
          fontSize: 12, color: "rgba(255,255,255,0.38)",
          letterSpacing: 0.3, marginBottom: 4, fontStyle: "italic",
        }}>
          Democracy Defender — empowering good choices with information
        </p>

        <div style={{
          height: 1, background: "linear-gradient(90deg, transparent, #c9a84c55, transparent)",
          margin: "14px 0 18px",
        }} />

        <p style={{
          fontFamily: "'Source Serif 4', serif",
          fontSize: 17, color: "rgba(255,255,255,0.55)",
          lineHeight: 1.75, marginBottom: 36,
        }}>
          Enter your ZIP code to see your real 2026 Texas primary ballot — with AI-powered candidate profiles and plain-language proposition explanations.
        </p>

        {/* ZIP Input */}
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <input
            value={input}
            onChange={e => { setInput(e.target.value.replace(/\D/, "")); setError(""); }}
            onKeyDown={e => e.key === "Enter" && go()}
            placeholder="ZIP Code"
            maxLength={5}
            inputMode="numeric"
            style={{
              flex: 1, padding: "16px 20px",
              borderRadius: 10, border: "2px solid rgba(201,168,76,0.3)",
              background: "rgba(255,255,255,0.06)", color: "white",
              fontSize: 24, fontFamily: "'Bebas Neue', sans-serif",
              letterSpacing: 8, textAlign: "center",
              outline: "none", transition: "border-color 0.2s",
            }}
            onFocus={e => e.target.style.borderColor = "rgba(201,168,76,0.8)"}
            onBlur={e => e.target.style.borderColor = "rgba(201,168,76,0.3)"}
          />
          <button
            onClick={() => go()}
            style={{
              padding: "16px 22px", background: "#c9a84c",
              color: "#0a1628", border: "none", borderRadius: 10,
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 22, letterSpacing: 1, cursor: "pointer",
              transition: "background 0.15s",
            }}
            onMouseEnter={e => e.target.style.background = "#e8c96e"}
            onMouseLeave={e => e.target.style.background = "#c9a84c"}
          >
            Go →
          </button>
        </div>

        {error && (
          <div style={{
            marginBottom: 12, padding: "9px 14px",
            background: "rgba(239,68,68,0.15)", borderRadius: 8,
            color: "#fca5a5", fontSize: 13,
            fontFamily: "'Source Serif 4', serif",
          }}>{error}</div>
        )}

        {/* Quick ZIPs */}
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", alignSelf: "center", fontFamily: "'Source Serif 4', serif" }}>
            Demo ZIPs:
          </span>
          {[
            { zip: "76051", label: "76051 — Grapevine" },
            { zip: "75019", label: "75019 — Coppell" },
          ].map(({ zip, label }) => (
            <button
              key={zip}
              onClick={() => go(zip)}
              style={{
                background: "none", border: "1px solid rgba(201,168,76,0.35)",
                borderRadius: 20, color: "rgba(201,168,76,0.7)",
                fontSize: 12, fontWeight: 600, padding: "5px 14px",
                cursor: "pointer", fontFamily: "'Source Serif 4', serif",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.target.style.background = "rgba(201,168,76,0.12)"; e.target.style.color = "#c9a84c"; }}
              onMouseLeave={e => { e.target.style.background = "none"; e.target.style.color = "rgba(201,168,76,0.7)"; }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Feature strip */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        borderTop: "1px solid rgba(255,255,255,0.07)",
        padding: "16px 24px",
        display: "flex", justifyContent: "center",
        gap: "clamp(12px, 4vw, 48px)", flexWrap: "wrap",
      }}>
        {[
          ["🗳", "Real ballot data"],
          ["✨", "AI candidate profiles"],
          ["📋", "Plain-language props"],
          ["📍", "Address-level accuracy"],
        ].map(([icon, text]) => (
          <div key={text} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 14 }}>{icon}</span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: "'Source Serif 4', serif" }}>
              {text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN: BALLOT
// ═══════════════════════════════════════════════════════════════════════════════
function BallotScreen({ zip, onBack }) {
  const ballot = BALLOTS[zip];
  const [partyKey, setPartyKey] = useState("republican");
  const [tab, setTab] = useState("races");
  const profileCache = useRef({});
  const explanationCache = useRef({});

  // Reset explanation cache when party changes
  const handlePartyChange = (pk) => {
    setPartyKey(pk);
    setTab("races");
    explanationCache.current = {};
  };

  const C = PARTY_COLORS[partyKey];
  const partyData = ballot[partyKey];
  const grouped = partyData.races.reduce((acc, r) => {
    (acc[r.level] = acc[r.level] || []).push(r);
    return acc;
  }, {});

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)" }}>
      <style>{CSS}</style>

      {/* Sticky header */}
      <div style={{
        background: C.gradient, borderBottom: "3px solid #c9a84c",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{
          maxWidth: 680, margin: "0 auto",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 16px",
        }}>
          <button
            onClick={onBack}
            style={{
              background: "none", border: "none",
              color: "rgba(255,255,255,0.6)", fontSize: 13,
              cursor: "pointer", padding: "14px 0",
              fontFamily: "'Source Serif 4', serif",
              display: "flex", alignItems: "center", gap: 5,
            }}
          >
            ← Back
          </button>

          <div style={{ textAlign: "center", padding: "10px 0" }}>
            <div style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 20, color: "white", letterSpacing: 1,
            }}>Voter Intelligence Platform</div>
            <div style={{
              fontSize: 10, color: "rgba(255,255,255,0.45)",
              fontFamily: "'Source Serif 4', serif",
            }}>
              {ballot.city}, {ballot.county} County · {zip}
            </div>
          </div>

          <a
            href="https://teamrv-mvp.sos.texas.gov/MVP/mvp.do"
            target="_blank" rel="noreferrer"
            style={{
              fontSize: 12, color: "#c9a84c", fontWeight: 700,
              padding: "14px 0", fontFamily: "'Libre Baskerville', serif",
            }}
          >
            Vote →
          </a>
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "16px 14px 48px" }}>

        {/* District summary */}
        <div className="stagger" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 12 }}>
          {[
            ["Congress", ballot.congressional],
            ["State Senate", ballot.state_senate],
            ["State House", ballot.state_house],
          ].map(([label, val]) => (
            <div key={label} style={{
              background: "white", borderRadius: 10, padding: "13px 8px",
              textAlign: "center", border: "1px solid #dde2e8",
              boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
            }}>
              <div style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 22, color: "#111", letterSpacing: 0.5,
              }}>{val}</div>
              <div style={{
                fontSize: 9, color: "#9ca3af", marginTop: 2,
                textTransform: "uppercase", letterSpacing: 1,
                fontFamily: "'Libre Baskerville', serif",
              }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Election bar */}
        <div style={{
          background: "#fffbeb", border: "1px solid #fde68a",
          borderRadius: 10, padding: "10px 14px", marginBottom: 12,
          display: "flex", justifyContent: "space-between",
          alignItems: "center", flexWrap: "wrap", gap: 6,
          fontSize: 13, color: "#92400e",
        }}>
          <span style={{ fontFamily: "'Source Serif 4', serif" }}>
            📅 <strong>March 3, 2026</strong> · Polls open 7am – 7pm CT
          </span>
          <a
            href="https://teamrv-mvp.sos.texas.gov/MVP/mvp.do"
            target="_blank" rel="noreferrer"
            style={{ fontSize: 12, fontWeight: 700 }}
          >
            Find your polling place →
          </a>
        </div>

        {/* Party selector */}
        <div style={{
          background: "white", borderRadius: 12, padding: 14,
          border: "1px solid #dde2e8", marginBottom: 12,
          boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        }}>
          <div style={{
            fontSize: 11, fontWeight: 700, color: "#9ca3af",
            letterSpacing: 2, textTransform: "uppercase",
            marginBottom: 10, fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 13,
          }}>Choose Your Primary Ballot</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {["democratic", "republican"].map(pk => {
              const PC = PARTY_COLORS[pk];
              const active = partyKey === pk;
              return (
                <button
                  key={pk}
                  onClick={() => handlePartyChange(pk)}
                  style={{
                    padding: "14px 10px", borderRadius: 10, cursor: "pointer",
                    border: `2px solid ${active ? PC.accent : "#dde2e8"}`,
                    background: active ? PC.gradient : "white",
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: 18, letterSpacing: 1,
                    color: active ? "white" : "#6b7280",
                    transition: "all 0.15s",
                  }}
                >
                  {PC.emoji} {PC.label}
                </button>
              );
            })}
          </div>
          <p style={{
            fontSize: 11, color: "#9ca3af", margin: "8px 0 0", textAlign: "center",
            fontFamily: "'Source Serif 4', serif", fontStyle: "italic",
          }}>
            In Texas primaries, you choose one party's ballot at the polls
          </p>
        </div>

        {/* Tab bar */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
          {[
            ["races", "🗳 Races"],
            ["props", "📋 Props"],
            ["chat", "💬 Ask AI"],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{
                padding: "12px 8px", borderRadius: 10, cursor: "pointer",
                border: `2px solid ${tab === id ? C.accent : "#dde2e8"}`,
                background: tab === id ? C.light : "white",
                fontFamily: tab === id ? "'Bebas Neue', sans-serif" : "'Source Serif 4', serif",
                fontSize: tab === id ? 15 : 13, letterSpacing: tab === id ? 0.5 : 0,
                color: tab === id ? C.text : "#6b7280",
                transition: "all 0.15s",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* RACES TAB */}
        {tab === "races" && (
          <div className="fade-in">
            {["Federal", "State", "County"].map(level => {
              const races = grouped[level];
              if (!races?.length) return null;
              return (
                <div key={level}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 10, margin: "20px 0 10px",
                  }}>
                    <span style={{ fontSize: 13 }}>{LEVEL_META[level].icon}</span>
                    <span style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: 16, letterSpacing: 2, color: "#6b7280",
                    }}>{level} Offices</span>
                    <div style={{ flex: 1, height: 1, background: "var(--rule)" }} />
                  </div>
                  {races.map((race, i) => (
                    <RaceCard
                      key={race.office} race={race}
                      partyKey={partyKey} profileCache={profileCache}
                      defaultOpen={i === 0 && level === "Federal"}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        )}

        {/* CHAT TAB */}
        {tab === "chat" && (
          <ChatPanel partyKey={partyKey} ballot={ballot} />
        )}

        {/* PROPOSITIONS TAB */}
        {tab === "props" && (
          <div className="fade-in">
            <div style={{
              padding: "11px 14px", background: "white",
              border: "1px solid #dde2e8", borderRadius: 10, marginBottom: 14,
              fontSize: 13, color: "#4b5563", lineHeight: 1.65,
              fontFamily: "'Source Serif 4', serif",
            }}>
              <strong style={{ fontFamily: "'Libre Baskerville', serif" }}>
                These are non-binding party surveys.
              </strong>{" "}
              They don't change laws — they gauge grassroots sentiment and may shape the party platform. Tap any proposition for a plain-language AI explanation.
            </div>
            {partyData.propositions.map(prop => (
              <PropCard
                key={prop.n} prop={prop}
                partyKey={partyKey} explanationCache={explanationCache}
              />
            ))}
          </div>
        )}

        {/* Footer */}
        <div style={{
          marginTop: 28, padding: "14px 16px", background: "white",
          borderRadius: 10, border: "1px solid #dde2e8",
          fontSize: 11, color: "#9ca3af", textAlign: "center", lineHeight: 1.7,
          fontFamily: "'Source Serif 4', serif",
        }}>
          Ballot data sourced from official Dallas & Tarrant County sample ballots, March 3, 2026.<br />
          AI profiles are generated from live web sources — always verify with official campaign materials.<br />
          <span style={{ color: "#374151", fontFamily: "'Libre Baskerville', serif" }}>Voter Intelligence Platform</span>
          {" · "}Built for the DigitalOcean Gradient AI Hackathon 2026
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT
// ═══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [zip, setZip] = useState(null);
  return zip
    ? <BallotScreen zip={zip} onBack={() => setZip(null)} />
    : <LandingScreen onLookup={setZip} />;
}
