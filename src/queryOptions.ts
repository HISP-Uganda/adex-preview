import { queryOptions } from "@tanstack/react-query";
import { getDHIS2Resource } from "./dhis2";
import { getLastQuarterMonths, osa } from "./utils";
import { Analytics } from "./interfaces";
import { Dayjs } from "dayjs";

export const ouQueryOptions = queryOptions({
    queryKey: ["ou"],
    queryFn: async () => {
        const {
            listGrid: { headers, rows },
        } = await getDHIS2Resource<{
            listGrid: {
                headers: Array<Record<string, string>>;
                rows: string[][];
            };
        }>({
            resource: "sqlViews/qS5ka4GEiN7/data",
            includeApi: false,
            params: { paging: "false" },
        });

        const facilityCodeIndex = headers.findIndex(
            ({ name }: Record<string, string>) => name === "uid",
        );
        const facilityLevelIndex = headers.findIndex(
            ({ name }: Record<string, string>) => name === "hflevel",
        );
        const facilityNameIndex = headers.findIndex(
            ({ name }: Record<string, string>) => name === "name",
        );
        const facilityOwnerShipTypeIndex = headers.findIndex(
            ({ name }: Record<string, string>) => name === "ownership",
        );
        const geographyIdentifier1Index = headers.findIndex(
            ({ name }: Record<string, string>) => name === "region",
        );
        const geographyIdentifier2Index = headers.findIndex(
            ({ name }: Record<string, string>) => name === "district",
        );
        const facilityOperationalStatusIndex = headers.findIndex(
            ({ name }: Record<string, string>) => name === "status",
        );

        return rows.map((row) => {
            return {
                FacilityCode: row[facilityCodeIndex],
                FacilityLevel: row[facilityLevelIndex],
                FacilityName: row[facilityNameIndex],
                FacilityOwnerShipType: row[facilityOwnerShipTypeIndex],
                GeographyIdentifier1: row[geographyIdentifier1Index],
                GeographyIdentifier2: row[geographyIdentifier2Index],
                FacilityType: "Health Facility",
                FacilityOperationalStatus: row[facilityOperationalStatusIndex],
            };
        });
    },
});

export const initialQueryOptions = (date: Dayjs) =>
    queryOptions({
        queryKey: ["initial", date.format("YYYYMMDD")],
        queryFn: async () => {
            const currentDate = new Date();
            const periods = getLastQuarterMonths(date);
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
                            DataPoint: 1062,
                            CurrentReportingPeriod: periods[2],
                            Value: Number(row[3]),
                        };
                    }

                    if (row[2] === periods[1]) {
                        return {
                            ReportingUnit: "UGA",
                            FacilityCode: row[1],
                            ProductCode: osa[row[0]].code,
                            DataPoint: 1086,
                            CurrentReportingPeriod: periods[2],
                            Value: Number(row[3]),
                        };
                    }

                    if (row[2] === periods[2]) {
                        return {
                            ReportingUnit: "UGA",
                            FacilityCode: row[1],
                            ProductCode: osa[row[0]].code,
                            DataPoint: 1087,
                            CurrentReportingPeriod: periods[2],
                            Value: Number(row[3]),
                        };
                    }
                    return [];
                }

                return [];
            });

            const {
                listGrid: { headers, rows },
            } = await getDHIS2Resource<{
                listGrid: {
                    headers: Array<Record<string, string>>;
                    rows: string[][];
                };
            }>({
                resource: "sqlViews/qS5ka4GEiN7/data",
                includeApi: false,
                params: { paging: "false" },
            });

            const facilityCodeIndex = headers.findIndex(
                ({ name }: Record<string, string>) => name === "uid",
            );
            const facilityLevelIndex = headers.findIndex(
                ({ name }: Record<string, string>) => name === "hflevel",
            );
            const facilityNameIndex = headers.findIndex(
                ({ name }: Record<string, string>) => name === "name",
            );
            const facilityOwnerShipTypeIndex = headers.findIndex(
                ({ name }: Record<string, string>) => name === "ownership",
            );
            const geographyIdentifier1Index = headers.findIndex(
                ({ name }: Record<string, string>) => name === "region",
            );
            const geographyIdentifier2Index = headers.findIndex(
                ({ name }: Record<string, string>) => name === "district",
            );
            const facilityOperationalStatusIndex = headers.findIndex(
                ({ name }: Record<string, string>) => name === "status",
            );

            const realFacilities = rows.map((row) => {
                return {
                    FacilityCode: row[facilityCodeIndex],
                    FacilityLevel: row[facilityLevelIndex],
                    FacilityName: row[facilityNameIndex],
                    FacilityOwnerShipType: row[facilityOwnerShipTypeIndex],
                    GeographyIdentifier1: row[geographyIdentifier1Index],
                    GeographyIdentifier2: row[geographyIdentifier2Index],
                    FacilityType: "Health Facility",
                    FacilityOperationalStatus:
                        row[facilityOperationalStatusIndex],
                };
            });

            return {
                processed,
                facilities: data.metaData.dimensions.ou.length,
                realFacilities,
            };
        },
    });
