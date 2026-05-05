export type FitmentMeta = {
  series: string;
  startYear: number;
  endYear: number;
};

export const BMW_CHASSIS_FITMENT: Record<string, FitmentMeta> = {
  E39: { series: "5 Series", startYear: 1995, endYear: 2003 },
  E46: { series: "3 Series", startYear: 1998, endYear: 2006 },
  E70: { series: "X5", startYear: 2006, endYear: 2013 },
  E81: { series: "1 Series", startYear: 2007, endYear: 2012 },
  E84: { series: "X1", startYear: 2009, endYear: 2015 },
  E87: { series: "1 Series", startYear: 2004, endYear: 2011 },
  E90: { series: "3 Series", startYear: 2005, endYear: 2012 },
  E91: { series: "3 Series", startYear: 2005, endYear: 2012 },
  E92: { series: "3 Series", startYear: 2006, endYear: 2013 },
  E93: { series: "3 Series", startYear: 2007, endYear: 2013 },
  F10: { series: "5 Series", startYear: 2010, endYear: 2017 },
  F11: { series: "5 Series", startYear: 2010, endYear: 2017 },
  F15: { series: "X5", startYear: 2013, endYear: 2018 },
  F16: { series: "X6", startYear: 2014, endYear: 2019 },
  F20: { series: "1 Series", startYear: 2011, endYear: 2019 },
  F21: { series: "1 Series", startYear: 2011, endYear: 2019 },
  F22: { series: "2 Series", startYear: 2013, endYear: 2021 },
  F23: { series: "2 Series", startYear: 2014, endYear: 2021 },
  F30: { series: "3 Series", startYear: 2011, endYear: 2019 },
  F31: { series: "3 Series", startYear: 2012, endYear: 2019 },
  F32: { series: "4 Series", startYear: 2013, endYear: 2020 },
  F33: { series: "4 Series", startYear: 2013, endYear: 2020 },
  F34: { series: "3 Series", startYear: 2013, endYear: 2020 },
  F36: { series: "4 Series", startYear: 2014, endYear: 2020 },
  F48: { series: "X1", startYear: 2015, endYear: 2022 },
  G01: { series: "X3", startYear: 2017, endYear: 2024 },
  G02: { series: "X4", startYear: 2018, endYear: 2024 },
  G05: { series: "X5", startYear: 2018, endYear: 2024 },
  G06: { series: "X6", startYear: 2019, endYear: 2024 },
  G20: { series: "3 Series", startYear: 2018, endYear: 2024 },
  G30: { series: "5 Series", startYear: 2017, endYear: 2024 },
  G31: { series: "5 Series", startYear: 2017, endYear: 2024 },
};

const CHASSIS_PATTERN = /\b(?:[EFG]\d{2})\b/gi;

export function extractChassisCodes(text: string): string[] {
  const matches = text.match(CHASSIS_PATTERN) ?? [];
  const unique = new Set<string>();

  for (const rawCode of matches) {
    const code = rawCode.toUpperCase();
    if (BMW_CHASSIS_FITMENT[code]) {
      unique.add(code);
    }
  }

  return [...unique];
}

export type FitmentOption = {
  series: string;
  chassis: string;
  startYear: number;
  endYear: number;
};

export function buildFitmentOptions(
  products: Array<{ name: string; description?: string | null }>,
): FitmentOption[] {
  const keySet = new Set<string>();
  const options: FitmentOption[] = [];

  for (const product of products) {
    const source = `${product.name} ${product.description ?? ""}`;
    const chassisCodes = extractChassisCodes(source);

    for (const code of chassisCodes) {
      const meta = BMW_CHASSIS_FITMENT[code];
      if (!meta) continue;

      const uniqueKey = `${meta.series}-${code}`;
      if (keySet.has(uniqueKey)) continue;

      keySet.add(uniqueKey);
      options.push({
        series: meta.series,
        chassis: code,
        startYear: meta.startYear,
        endYear: meta.endYear,
      });
    }
  }

  return options.sort((a, b) => {
    if (a.series !== b.series) return a.series.localeCompare(b.series);
    return a.chassis.localeCompare(b.chassis);
  });
}
