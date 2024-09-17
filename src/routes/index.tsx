import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import type { TableColumnsType, TabsProps } from "antd";
import { Button, Table, Tabs } from "antd";
import { initialQueryOptions } from "../queryOptions";
import dayjs from "dayjs";

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

export const Route = createFileRoute("/")({
    component: Component,
});

const uploadToAzure = async (
    data: Array<{
        ReportingUnit: string;
        FacilityCode: string;
        ProductCode: number | undefined;
        DataPoint: number;
        CurrentReportingPeriod: string;
        Value: number | string;
    }>,
) => {
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
        `Uganda_OSA_${dayjs().subtract(1, "quarter").format("YYYY[Q]Q")}.csv`,
        {
            type: "text/csv",
        },
    );
    // Create FormData and append file
    const formData = new FormData();
    formData.append("file", file);

    // Upload file
    const response = await fetch("http://localhost:3001", {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        throw new Error("Upload failed");
    }

    const result = await response.json();

    console.log(result);
};

function Component() {
    const { data, isLoading } = useSuspenseQuery(initialQueryOptions);
    const items: TabsProps["items"] = [
        {
            key: "1",
            label: "OSA",
            children: (
                <div className="flex flex-col gap-2">
                    <Table
                        columns={columns}
                        dataSource={data}
                        loading={isLoading}
                        pagination={{ pageSize: 20 }}
                        virtual
                        bordered
                        rowKey={(record) =>
                            `${record.FacilityCode}-${record.ProductCode}-${record.CurrentReportingPeriod}-${record.DataPoint}`
                        }
                        scroll={{ x: "max-content" }}
                    />
                    <div className="flex flex-row items-center justify-end">
                        <Button
                            type="primary"
                            onClick={() => uploadToAzure(data)}
                        >
                            Send to Azure
                        </Button>
                    </div>
                </div>
            ),
        },
        {
            key: "2",
            label: "SATP",
            children: "Content of Tab Pane 2",
        },
        {
            key: "3",
            label: "Country Facility",
            children: "Content of Tab Pane 3",
        },
    ];

    return (
        <div className="px-4">
            <Tabs defaultActiveKey="1" items={items} />
        </div>
    );
}
