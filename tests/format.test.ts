import { describe, expect, it } from "vitest";
import { format, plural } from "@/i18n/format";
import { en } from "@/i18n/dictionaries/en";
import { th } from "@/i18n/dictionaries/th";

describe("format / plural", () => {
  it("fills placeholders", () => {
    expect(format("Hi {name}", { name: "Pat" })).toBe("Hi Pat");
  });

  it("uses singular only for exactly 1", () => {
    const a = en.followers.actions;
    expect(plural(1, a.removeSelectedOne, a.removeSelected, { count: "1" })).toBe("Remove 1 follower");
    expect(plural(5, a.removeSelectedOne, a.removeSelected, { count: "5" })).toBe("Remove 5 followers");
    expect(plural(0, a.removeSelectedOne, a.removeSelected, { count: "0" })).toBe("Remove 0 followers");
  });

  it("Thai uses นำออก wording", () => {
    const a = th.followers.actions;
    expect(plural(3, a.removeSelectedOne, a.removeSelected, { count: "3" })).toBe("นำผู้ติดตามออก 3 บัญชี");
    expect(plural(1, th.remove.dialogTitleOne, th.remove.dialogTitle, { count: "1" })).toBe("นำผู้ติดตามออก 1 บัญชี?");
  });
});
