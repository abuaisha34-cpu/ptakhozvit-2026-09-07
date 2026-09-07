import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { activeWithdrawals, withdrawalDaysFor } from "./treatments.ts";

describe("withdrawalDaysFor", () => {
  it("holds antibiotics and coccidiostats", () => {
    assert.equal(withdrawalDaysFor("enro", "antibiotic"), 7);
    assert.equal(withdrawalDaysFor("toltraz", "coccidiostat"), 5);
    assert.equal(withdrawalDaysFor("ad3e", "vitamin"), 0);
  });
});

describe("activeWithdrawals", () => {
  it("keeps hold until last dose plus days", () => {
    const holds = activeWithdrawals(
      [
        {
          date: "2026-08-20",
          meds: [{ prepId: "enro", group: "antibiotic", name: "Енрофлоксацин", conc: 80, unit: "ml" }],
        },
        {
          date: "2026-08-22",
          meds: [{ prepId: "enro", group: "antibiotic", name: "Енрофлоксацин", conc: 80, unit: "ml" }],
        },
      ],
      "2026-08-26",
    );
    assert.equal(holds.length, 1);
    assert.equal(holds[0].until, "2026-08-29");
    assert.equal(holds[0].daysLeft, 3);
  });
});
