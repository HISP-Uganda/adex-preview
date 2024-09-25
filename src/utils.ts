import dayjs, { Dayjs } from "dayjs";
import quarterOfYear from "dayjs/plugin/quarterOfYear";
import { groupBy, uniq } from "lodash";

dayjs.extend(quarterOfYear);

export function getCurrentQuarterMonths(): string[] {
    const lastQuarterStart = dayjs().startOf("quarter");
    return [1, 2, 3].map((month) =>
        lastQuarterStart.add(month - 1, "month").format("YYYYMM"),
    );
}

export function getLastQuarterMonths(date: Dayjs): string[] {
    const lastQuarterStart = dayjs(date).startOf("quarter");
    return [1, 2, 3].map((month) =>
        lastQuarterStart.add(month - 1, "month").format("YYYYMM"),
    );
}

export function monthNumberToName(monthNumber: number): string {
    return dayjs()
        .month(monthNumber - 1)
        .format("YYYYMM");
}

export const osa: Record<
    string,
    Partial<{
        code: number;
        dataPoint: string;
        description: string;
        dataPointCode: number;
    }>
> = {
    E6bQbrXhKgU: {
        code: 10286,
        dataPoint: "Quantity used",
        description:
            "HIV 1+2 - Determine Complete HIV Kit - accessories included - 100 tests - 7D2343SET",
    },
    RQ1tlXaPcar: {
        code: 10286,
        dataPoint: "Stock on hand",
        dataPointCode: 1061,
        description:
            "HIV 1+2 - Determine Complete HIV Kit - accessories included - 100 tests - 7D2343SET",
    },

    VkjK3NWHyJR: {
        code: 10867,
        dataPoint: "Quantity used",
        description:
            "Dolutegravir/Lamivudine/Tenofovir 50/300/300mg tablet, container of 90 tablets - no carton",
    },
    L2exKCG9ZxY: {
        code: 10867,
        dataPoint: "Stock on hand",
        dataPointCode: 1061,
        description:
            "Dolutegravir/Lamivudine/Tenofovir 50/300/300mg tablet, container of 90 tablets - no carton",
    },

    oCtCwUE7utd: {
        code: 10309,
        dataPoint: "Quantity used",
        description: "Malaria Rapid Diagnostic Test Kit - Pf only - 25 Tests",
    },
    HhhkiZDx1vo: {
        code: 10309,
        dataPoint: "Stock on hand",
        dataPointCode: 1061,
        description: "Malaria Rapid Diagnostic Test Kit - Pf only - 25 Tests",
    },

    RIBMopGoWHl: {
        code: 10005,
        dataPoint: "Quantity used",
        description:
            "Artemether/Lumefantrine 20/120mg 24 tablet, pack of 30 blisters",
    },

    fy34HLoHa0x: {
        code: 10005,
        dataPoint: "Stock on hand",
        dataPointCode: 1061,
        description:
            "Artemether/Lumefantrine 20/120mg 24 tablet, pack of 30 blisters",
    },

    LwQS4dn6CNo: {
        code: 17213,
        dataPoint: "Quantity used",
        description: "Xpert MTB/RIF ULTRA Cartridge 50",
    },

    tZhzAESh4sL: {
        code: 17213,
        dataPoint: "Stock on hand",
        dataPointCode: 1061,
        description: "Xpert MTB/RIF ULTRA Cartridge 50",
    },

    tViJTDJyvRx: {
        code: 15231,
        dataPoint: "Quantity used",
        description:
            "Ethambutol/Isoniazid/Pyrazinamide/Rifampicin 275/75/400/150mg 28 tablet, pack of 24 blisters (672)",
    },

    LIyDtNQVsGo: {
        code: 15231,
        dataPoint: "Stock on hand",
        dataPointCode: 1061,
        description:
            "Ethambutol/Isoniazid/Pyrazinamide/Rifampicin 275/75/400/150mg 28 tablet, pack of 24 blisters (672)",
    },

    FNT0AWnEok7: {
        code: 10100,
        dataPoint: "Quantity used",
        description:
            "Artesunate 60mg powder for solution for injection, 1 vial",
    },

    O3hT4aIhzLi: {
        code: 10100,
        dataPoint: "Stock on hand",
        dataPointCode: 1061,
        description:
            "Artesunate 60mg powder for solution for injection, 1 vial",
    },
};

export const summarize = (
    column: string,
    data:
        | Array<{
              ReportingUnit: string;
              FacilityCode: string;
              ProductCode: number | undefined;
              DataPoint: number;
              CurrentReportingPeriod: string;
              Value: number | string;
          }>
        | undefined,
) => {
    const values = Object.entries(groupBy(data, column)).reduce<
        Record<string, number>
    >((acc, [k, v]) => {
        acc[k] = uniq(v.map((a) => a.FacilityCode)).length;
        return acc;
    }, {});

    return Object.entries(values).map(([k, v]) => ({ dataPoint: k, count: v }));
};

export const summarize2 = (
    column: string,
    data:
        | Array<{
              ReportingUnit: string;
              FacilityCode: string;
              ProductCode: number | undefined;
              DataPoint: number;
              CurrentReportingPeriod: string;
              Value: number | string;
          }>
        | undefined,
) => {
    const values = Object.entries(groupBy(data, column)).reduce<
        Record<string, { den: number; num: number }>
    >((acc, [k, v]) => {
        acc[k] = {
            den: v.length,
            num: v.filter((a) => String(a.Value) !== "0").length,
        };
        return acc;
    }, {});

    return Object.entries(values).map(([k, v]) => ({ dataPoint: k, ...v }));
};
