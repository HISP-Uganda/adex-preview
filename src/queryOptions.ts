import { queryOptions } from "@tanstack/react-query";
import { getDHIS2Resource } from "./dhis2";
import { getLastQuarterMonths, osa } from "./utils";
import { Analytics } from "./interfaces";

export const initialQueryOptions = queryOptions({
    queryKey: ["initial"],
    queryFn: async () => {
        const currentDate = new Date();
        const periods = getLastQuarterMonths();
        const dx = Object.keys(osa).join(";");
        const pe = periods.join(";");
        const params = new URLSearchParams();
        params.append("dimension", `dx:${dx}`);
        params.append("dimension", `ou:LEVEL-5`);
        params.append("dimension", `pe:${pe}`);

        const stockOnHandDataElements = Object.entries(osa).flatMap(
            ([de, val]) => {
                if (val.dataPoint === "Stock on hand") {
                    return de;
                }
                return [];
            },
        );

        const quantityUsedDataElements = Object.entries(osa)
            .flatMap(([de, val]) => {
                if (val.dataPoint === "Quantity used") {
                    return de;
                }
                return [];
            })
            .join(";");

        const data = await getDHIS2Resource<Analytics>({
            resource: `analytics.json?${params.toString()}`,
            includeApi: false,
        });
        const processed = data.rows.flatMap((row) => {
            if (
                stockOnHandDataElements.includes(row[0]) &&
                row[2] === periods[2]
            ) {
                return [
                    {
                        ReportingUnit: "UGA",
                        FacilityCode: row[1],
                        ProductCode: osa[row[0]].code,
                        DataPoint: 1061,
                        CurrentReportingPeriod: row[2],
                        Value: Number(row[3]),
                    },
                    {
                        ReportingUnit: "UGA",
                        FacilityCode: row[1],
                        ProductCode: osa[row[0]].code,
                        DataPoint: 1064,
                        CurrentReportingPeriod: row[2],
                        Value: "DHIS2",
                    },
                    {
                        ReportingUnit: "UGA",
                        FacilityCode: row[1],
                        ProductCode: osa[row[0]].code,
                        DataPoint: 1066,
                        CurrentReportingPeriod: row[2],
                        Value: Number(
                            `${currentDate.getFullYear()}${String(currentDate.getMonth() + 1).padStart(2, "0")}${String(currentDate.getDate()).padStart(2, "0")}`,
                        ),
                    },
                ];
            }
            if (quantityUsedDataElements.includes(row[0])) {
                if (row[2] === periods[0]) {
                    return {
                        ReportingUnit: "UGA",
                        FacilityCode: row[1],
                        ProductCode: osa[row[0]].code,
                        DataPoint: 11,
                        CurrentReportingPeriod: periods[2],
                        Value: Number(row[3]),
                    };
                }

                if (row[2] === periods[1]) {
                    return {
                        ReportingUnit: "UGA",
                        FacilityCode: row[1],
                        ProductCode: osa[row[0]].code,
                        DataPoint: 12,
                        CurrentReportingPeriod: periods[2],
                        Value: Number(row[3]),
                    };
                }

                if (row[2] === periods[2]) {
                    return {
                        ReportingUnit: "UGA",
                        FacilityCode: row[1],
                        ProductCode: osa[row[0]].code,
                        DataPoint: 13,
                        CurrentReportingPeriod: periods[2],
                        Value: Number(row[3]),
                    };
                }

                return [];
            }

            return [];
        });

        return processed;
    },
});
