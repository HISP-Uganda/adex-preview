import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import type { TableColumnsType, TabsProps } from "antd";
import { Button, DatePicker, Statistic, Table, Tabs, notification } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { uniq } from "lodash";
import { useState } from "react";
import { initialQueryOptions } from "../queryOptions";
import { dataPoints, osa, summarize, summarize2 } from "../utils";

const { Column } = Table;

const formatter = new Intl.NumberFormat("en-US");

const productCodes = Object.entries(osa).reduce<Record<string, string>>(
    (a, [, v]) => {
        if (v.code && v.description) {
            a[v.code] = v.description;
        }
        return a;
    },
    {},
);

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
        const response = await fetch("https://gfl-adex.hispuganda.org", {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            throw new Error("Upload failed");
        }
        await response.json();
    }
};

function Component() {
    const [api, contextHolder] = notification.useNotification();

    const [period, setPeriod] = useState(dayjs().subtract(1, "quarter"));
    const { data, isLoading } = useQuery(initialQueryOptions(period));

    const onChange = (date: Dayjs) => {
        setPeriod(() => date);
    };

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
            render: (text) => <div>{data?.items[text]?.name || text}</div>,
        },
        {
            key: "ProductCode",
            title: "ProductCode",
            dataIndex: "ProductCode",
            render: (text) => <div>{productCodes[String(text)] || text}</div>,
        },
        {
            key: "DataPoint",
            title: "DataPoint",
            dataIndex: "DataPoint",
            render: (text) => <div>{dataPoints[String(text) || text]}</div>,
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

    const uploading = async () => {
        setLoading(() => true);
        await uploadToAzure(data?.processed, period);
        setLoading(() => false);
        api.open({
            message: "Data uploaded successfully",
            description: `Data for ${period.format("YYYY[Q]Q")} uploaded successfully`,
            showProgress: true,
            pauseOnHover: true,
        });
    };

    const [loading, setLoading] = useState<boolean>(false);
    const items: TabsProps["items"] = [
        {
            key: "1",
            label: "OSA",
            children: (
                <div className="flex flex-col gap-0">
                    <div className="flex flex-row gap items-center justify-end">
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
                                                rowKey="dataPoint"
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
                                                    render={(text) => (
                                                        <div>
                                                            {productCodes[
                                                                String(text)
                                                            ] || text}
                                                        </div>
                                                    )}
                                                />
                                                <Column
                                                    title="#Facilities"
                                                    dataIndex="count"
                                                    key="count"
                                                    render={(_, row) =>
                                                        formatter.format(
                                                            row.count,
                                                        )
                                                    }
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
                                                rowKey="dataPoint"
                                                title={() =>
                                                    "Summary by Product Code"
                                                }
                                                pagination={false}
                                                style={{ width: "100%" }}
                                            >
                                                <Column
                                                    title="Country"
                                                    key="dataPoint"
                                                    render={() => "UGA"}
                                                />
                                                <Column
                                                    title="Product Code"
                                                    dataIndex="dataPoint"
                                                    key="dataPoint"
                                                    render={(text) => (
                                                        <div>
                                                            {productCodes[
                                                                String(text)
                                                            ] || text}
                                                        </div>
                                                    )}
                                                />
                                                <Column
                                                    title="Num"
                                                    dataIndex="num"
                                                    key="num"
                                                    render={(_, row) =>
                                                        formatter.format(
                                                            row.num,
                                                        )
                                                    }
                                                />
                                                <Column
                                                    title="Den"
                                                    dataIndex="den"
                                                    key="den"
                                                    render={(_, row) =>
                                                        formatter.format(
                                                            row.den,
                                                        )
                                                    }
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
                                                rowKey="dataPoint"
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
                                                    render={(text) => (
                                                        <div>
                                                            {dataPoints[
                                                                String(text)
                                                            ] || text}
                                                        </div>
                                                    )}
                                                />
                                                <Column
                                                    title="#Facilities"
                                                    dataIndex="count"
                                                    key="count"
                                                    render={(_, row) =>
                                                        formatter.format(
                                                            row.count,
                                                        )
                                                    }
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
                                                rowKey="dataPoint"
                                                title={() =>
                                                    "Summary by Data Points"
                                                }
                                                pagination={false}
                                                style={{ width: "100%" }}
                                            >
                                                <Column
                                                    title="Country"
                                                    key="dataPoint"
                                                    render={() => "UGA"}
                                                />
                                                <Column
                                                    title="Data Point"
                                                    dataIndex="dataPoint"
                                                    key="dataPoint"
                                                    render={(text) => (
                                                        <div>
                                                            {dataPoints[
                                                                String(text)
                                                            ] || text}
                                                        </div>
                                                    )}
                                                />
                                                <Column
                                                    title="Num"
                                                    dataIndex="num"
                                                    key="num"
                                                    render={(_, row) =>
                                                        formatter.format(
                                                            row.num,
                                                        )
                                                    }
                                                />
                                                <Column
                                                    title="Den"
                                                    dataIndex="den"
                                                    key="den"
                                                    render={(_, row) =>
                                                        formatter.format(
                                                            row.den,
                                                        )
                                                    }
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
                                    <div>
                                        <Table
                                            columns={columns}
                                            dataSource={data?.processed}
                                            loading={isLoading}
                                            pagination={{ pageSize: 15 }}
                                            bordered
                                            rowKey={(record) =>
                                                `${record.FacilityCode}-${record.ProductCode}-${record.CurrentReportingPeriod}-${record.DataPoint}`
                                            }
                                            scroll={{ x: "max-content" }}
                                        />
                                    </div>
                                ),
                            },
                        ]}
                    />
                    <div className="flex flex-row items-center justify-end">
                        <Button
                            type="primary"
                            onClick={() => uploading()}
                            loading={loading}
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
                            loading={loading}
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
        <div className="px-2">
            {contextHolder}
            <Tabs defaultActiveKey="1" items={items} />
        </div>
    );
}
