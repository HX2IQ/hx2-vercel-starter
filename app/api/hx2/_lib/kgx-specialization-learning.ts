type KgxSpecializationMatch = {
  node: string;
  confidence: number;
  reason: string;
};

const DOMAIN_RULES = [
  {
    keywords: ["travel","flight","hotel","cruise","vacation","trip"],
    node: "TravelOI"
  },
  {
    keywords: ["health","supplement","vitamin","diet","medical"],
    node: "AH2"
  },
  {
    keywords: ["parent","child","school","reading","homework"],
    node: "PA2"
  },
  {
    keywords: ["legal","contract","trademark","patent","compliance"],
    node: "L2"
  },
  {
    keywords: ["marketing","seo","sales","advertising","campaign"],
    node: "K2"
  },
  {
    keywords: ["crypto","market","stock","investment","xrp"],
    node: "X2"
  }
];

export async function buildKgxSpecializationLearning(
  userRequest: string
) {
  const lower = userRequest.toLowerCase();

  const matches: KgxSpecializationMatch[] = [];

  for (const rule of DOMAIN_RULES) {
    const hit = rule.keywords.some(
      k => lower.includes(k)
    );

    if (hit) {
      matches.push({
        node: rule.node,
        confidence: 1,
        reason: "domain specialization match"
      });
    }
  }

  return {
    specialization_learning_active: true,
    matches
  };
}
