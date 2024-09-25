import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import type { TableColumnsType, TabsProps } from "antd";
import { Button, DatePicker, Statistic, Table, Tabs } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { uniq } from "lodash";
import { useState } from "react";
import { initialQueryOptions } from "../queryOptions";
import { summarize, summarize2 } from "../utils";

const { Column } = Table;

const columns: TableColumnsType<{
    ReportingUnit: string;
    FacilityCode: string;
    ProductCode: number | undefined;
    DataPoint: number;
    CurrentReportingPeriod: string;
    Value: string | number;
}> = [
    {
        key: "ReportingUnit",
        title: "ReportingUnit",
        dataIndex: "ReportingUnit",
    },
    {
        key: "FacilityCode",
        title: "FacilityCode",
        dataIndex: "FacilityCode",
    },
    {
        key: "ProductCode",
        title: "ProductCode",
        dataIndex: "ProductCode",
        align: "center",
        render: (text) => <div className="text-right">{text}</div>,
    },
    {
        key: "DataPoint",
        title: "DataPoint",
        dataIndex: "DataPoint",
        align: "center",
        render: (text) => <div className="text-right">{text}</div>,
    },
    {
        key: "CurrentReportingPeriod",
        title: "CurrentReportingPeriod",
        dataIndex: "CurrentReportingPeriod",
        align: "center",
        render: (text) => <div className="text-right">{text}</div>,
    },
    {
        key: "Value",
        title: "Value",
        dataIndex: "Value",
        align: "center",
        render: (text) => <div className="text-right">{text}</div>,
    },
];

const columns2: TableColumnsType<{
    FacilityCode: string;
    FacilityLevel: string;
    FacilityName: string;
    FacilityOwnerShipType: string;
    GeographyIdentifier1: string;
    GeographyIdentifier2: string;
    FacilityType: string;
    FacilityOperationalStatus: string;
}> = [
    {
        key: "FacilityCode",
        title: "FacilityCode",
        dataIndex: "FacilityCode",
    },
    {
        key: "FacilityLevel",
        title: "FacilityLevel",
        dataIndex: "FacilityLevel",
    },
    {
        key: "FacilityName",
        title: "FacilityName",
        dataIndex: "FacilityName",
    },
    {
        key: "FacilityOwnerShipType",
        title: "FacilityOwnerShipType",
        dataIndex: "FacilityOwnerShipType",
    },
    {
        key: "GeographyIdentifier1",
        title: "GeographyIdentifier1",
        dataIndex: "GeographyIdentifier1",
    },
    {
        key: "GeographyIdentifier2",
        title: "GeographyIdentifier2",
        dataIndex: "GeographyIdentifier2",
    },
    {
        key: "FacilityType",
        title: "FacilityType",
        dataIndex: "FacilityType",
    },
    {
        key: "FacilityOperationalStatus",
        title: "FacilityOperationalStatus",
        dataIndex: "FacilityOperationalStatus",
    },
];

export const Route = createFileRoute("/")({
    component: Component,
});

const uploadToAzure = async (
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
    period: Dayjs,
) => {
    if (data) {
        const csvContent = [
            [
                "ReportingUnit",
                "FacilityCode",
                "ProductCode",
                "DataPoint",
                "CurrentReportingPeriod",
                "Value",
            ].join(","),
            ...data.map((row) =>
                [
                    row.ReportingUnit,
                    row.FacilityCode,
                    row.ProductCode,
                    row.DataPoint,
                    row.CurrentReportingPeriod,
                    row.Value,
                ].join(","),
            ),
        ].join("\n");
        const blob = new Blob([csvContent], {
            type: "text/csv;charset=utf-8;",
        });

        const file = new File(
            [blob],
            `Uganda_OSA_${period.format("YYYY[Q]Q")}.csv`,
            {
                type: "text/csv",
            },
        );
        const formData = new FormData();
        formData.append("file", file);
        const response = await fetch("http://localhost:3001", {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            throw new Error("Upload failed");
        }
        const result = await response.json();
        console.log(result);
    }
};

function Component() {
    const [period, setPeriod] = useState(dayjs().subtract(1, "quarter"));
    const { data, isLoading } = useQuery(initialQueryOptions(period));
    const onChange = (date: Dayjs) => {
        setPeriod(() => date);
    };
    const items: TabsProps["items"] = [
        {
            key: "1",
            label: "OSA",
            children: (
                <div className="flex flex-col gap-4">
                    <div className="flex flex-row gap-2 items-center justify-end">
                        <div>Quarter</div>
                        <DatePicker
                            onChange={onChange}
                            picker="quarter"
                            value={period}
                            format={"YYYY[Q]Q"}
                        />
                    </div>

                    <Tabs
                        defaultActiveKey="1"
                        items={[
                            {
                                key: "1",
                                label: "Summary",
                                children: (
                                    <div className="flex flex-col gap-4">
                                        <div className="flex flex-row gap-10">
                                            <Statistic
                                                title="Total Facilities"
                                                value={data?.facilities}
                                            />
                                            <Statistic
                                                title="Facilities Reporting"
                                                value={
                                                    uniq(
                                                        data?.processed.map(
                                                            (d) =>
                                                                d.FacilityCode,
                                                        ),
                                                    ).length || 0
                                                }
                                            />

                                            <Statistic
                                                title="Reporting Rates"
                                                suffix="%"
                                                precision={2}
                                                value={
                                                    (100 *
                                                        (uniq(
                                                            data?.processed.map(
                                                                (d) =>
                                                                    d.FacilityCode,
                                                            ),
                                                        ).length || 0)) /
                                                    Number(
                                                        data
                                                            ? data.facilities
                                                            : 1,
                                                    )
                                                }
                                            />
                                        </div>

                                        <div className="flex flex-row gap-10">
                                            <Table<{
                                                dataPoint: string;
                                                count: number;
                                            }>
                                                dataSource={summarize(
                                                    "ProductCode",
                                                    data?.processed,
                                                )}
                                                title={() =>
                                                    "Reporting Summary by Product Code"
                                                }
                                                pagination={false}
                                                style={{ width: "100%" }}
                                            >
                                                <Column
                                                    title="Product Code"
                                                    dataIndex="dataPoint"
                                                    key="dataPoint"
                                                />
                                                <Column
                                                    title="Facilities Reporting"
                                                    dataIndex="count"
                                                    key="count"
                                                />
                                                <Column
                                                    title="Rate"
                                                    key="count"
                                                    render={(_, row) =>
                                                        `${(
                                                            (100 * row.count) /
                                                            Number(
                                                                data
                                                                    ? data.facilities
                                                                    : 1,
                                                            )
                                                        ).toFixed(2)}%`
                                                    }
                                                />
                                            </Table>

                                            <Table<{
                                                dataPoint: string;
                                                den: number;
                                                num: number;
                                            }>
                                                dataSource={summarize2(
                                                    "ProductCode",
                                                    data?.processed,
                                                )}
                                                title={() =>
                                                    "Summary by Product Code"
                                                }
                                                pagination={false}
                                                style={{ width: "100%" }}
                                            >
                                                <Column
                                                    title="Country Name"
                                                    key="dataPoint"
                                                    render={() => "UGA"}
                                                />
                                                <Column
                                                    title="Product Code"
                                                    dataIndex="dataPoint"
                                                    key="dataPoint"
                                                />
                                                <Column
                                                    title="Num"
                                                    dataIndex="num"
                                                    key="num"
                                                />
                                                <Column
                                                    title="Den"
                                                    dataIndex="den"
                                                    key="den"
                                                />
                                                <Column
                                                    title="Rate"
                                                    key="count"
                                                    render={(_, row) =>
                                                        `${(
                                                            (100 * row.num) /
                                                            row.den
                                                        ).toFixed(2)}%`
                                                    }
                                                />
                                            </Table>
                                        </div>

                                        <div className="flex flex-row gap-10">
                                            <Table<{
                                                dataPoint: string;
                                                count: number;
                                            }>
                                                dataSource={summarize(
                                                    "DataPoint",
                                                    data?.processed,
                                                )}
                                                title={() =>
                                                    "Reporting Summary by Data Points"
                                                }
                                                pagination={false}
                                                style={{ width: "100%" }}
                                            >
                                                <Column
                                                    title="Data Point"
                                                    dataIndex="dataPoint"
                                                    key="dataPoint"
                                                />
                                                <Column
                                                    title="Facilities Reporting"
                                                    dataIndex="count"
                                                    key="count"
                                                />
                                                <Column
                                                    title="Rate"
                                                    key="count"
                                                    render={(_, row) =>
                                                        `${(
                                                            (100 * row.count) /
                                                            Number(
                                                                data
                                                                    ? data.facilities
                                                                    : 1,
                                                            )
                                                        ).toFixed(2)}%`
                                                    }
                                                />
                                            </Table>

                                            <Table<{
                                                dataPoint: string;
                                                den: number;
                                                num: number;
                                            }>
                                                dataSource={summarize2(
                                                    "DataPoint",
                                                    data?.processed,
                                                )}
                                                title={() =>
                                                    "Summary by Data Points"
                                                }
                                                pagination={false}
                                                style={{ width: "100%" }}
                                            >
                                                <Column
                                                    title="Country Name"
                                                    key="dataPoint"
                                                    render={() => "UGA"}
                                                />
                                                <Column
                                                    title="Data Point"
                                                    dataIndex="dataPoint"
                                                    key="dataPoint"
                                                />
                                                <Column
                                                    title="Num"
                                                    dataIndex="num"
                                                    key="num"
                                                />
                                                <Column
                                                    title="Den"
                                                    dataIndex="den"
                                                    key="den"
                                                />
                                                <Column
                                                    title="Rate"
                                                    key="count"
                                                    render={(_, row) =>
                                                        `${(
                                                            (100 * row.num) /
                                                            row.den
                                                        ).toFixed(2)}%`
                                                    }
                                                />
                                            </Table>
                                        </div>
                                    </div>
                                ),
                            },
                            {
                                key: "2",
                                label: "Data",
                                children: (
                                    <Table
                                        columns={columns}
                                        dataSource={data?.processed}
                                        loading={isLoading}
                                        pagination={{ pageSize: 18 }}
                                        virtual
                                        bordered
                                        rowKey={(record) =>
                                            `${record.FacilityCode}-${record.ProductCode}-${record.CurrentReportingPeriod}-${record.DataPoint}`
                                        }
                                        scroll={{ x: "max-content" }}
                                    />
                                ),
                            },
                        ]}
                    />
                    <div className="flex flex-row items-center justify-end">
                        <Button
                            type="primary"
                            onClick={() =>
                                uploadToAzure(data?.processed, period)
                            }
                        >
                            Send Data to Azure
                        </Button>
                    </div>
                </div>
            ),
        },
        {
            key: "3",
            label: "Country Facility",
            children: (
                <div>
                    <Table
                        columns={columns2}
                        dataSource={data?.realFacilities}
                        loading={isLoading}
                        pagination={{ pageSize: 18 }}
                        bordered
                        rowKey={(record) => `${record.FacilityCode}`}
                        scroll={{ x: "max-content" }}
                    />
                    <div className="flex flex-row items-center justify-end">
                        <Button
                            type="primary"
                            onClick={() =>
                                uploadToAzure(data?.processed, period)
                            }
                        >
                            Send Facilities to Azure
                        </Button>
                    </div>
                </div>
            ),
        },
    ];

    if (isLoading)
        return (
            <div className="text-center w-[100vw] h-[100vh] items-center justify-center align-middle">
                Loading...
            </div>
        );

    return (
        <div className="px-4">
            <Tabs defaultActiveKey="1" items={items} />
        </div>
    );
}
