export type SynthHandler = (ctx: any) => {
  answer: string;
  synth_version: string;
};

function codingSynth(ctx: any) {
  return {
    answer: [
      "## DEV2 Build Intelligence",
      "",
      "HX2 classified this as a coding/build request.",
      "",
      "Recommended flow:",
      "- isolate feature",
      "- validate independently",
      "- integrate after smoke passes",
      "",
      "Focus on stable architecture before UI expansion."
    ].join("\n"),
    synth_version: "v2_registry_coding"
  };
}

function researchSynth(ctx: any) {
  return {
    answer: [
      "## Research Intelligence",
      "",
      "HX2 routed this request through the research layer.",
      "",
      "Source-backed synthesis completed."
    ].join("\n"),
    synth_version: "v2_registry_research"
  };
}

function businessSynth(ctx: any) {
  return {
    answer: [
      "## Business Intelligence",
      "",
      "HX2 routed this through business/operator synthesis.",
      "",
      "Focus on leverage, logistics, margin, and scalability."
    ].join("\n"),
    synth_version: "v2_registry_business"
  };
}

function imageSynth(ctx: any) {
  return {
    answer: [
      "## Design Intelligence",
      "",
      "HX2 routed this through image/creative synthesis.",
      "",
      "Define brand, audience, format, and CTA first."
    ].join("\n"),
    synth_version: "v2_registry_image"
  };
}

function conversationSynth(ctx: any) {
  return {
    answer: [
      "## O2 Strategic Advisory",
      "",
      "HX2 routed this through strategic conversation mode."
    ].join("\n"),
    synth_version: "v2_registry_conversation"
  };
}

export const synthRegistry: Record<string, SynthHandler> = {
  coding: codingSynth,
  research: researchSynth,
  business: businessSynth,
  image: imageSynth,
  conversation: conversationSynth
};
