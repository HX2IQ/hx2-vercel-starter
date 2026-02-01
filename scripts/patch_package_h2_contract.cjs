const fs = require("fs");

const p = "package.json";
const j = JSON.parse(fs.readFileSync(p, "utf8"));

j.scripts = j.scripts || {};
j.scripts["h2:contract"] = "node scripts/h2_contract_test.mjs";

fs.writeFileSync(p, JSON.stringify(j, null, 2) + "\n");
console.log("Updated package.json scripts.h2:contract");
