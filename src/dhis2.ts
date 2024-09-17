import axios, { CreateAxiosDefaults } from "axios";

let config: CreateAxiosDefaults = {
    baseURL: process.env.DHIS2_API_URL,
};

if (process.env.NODE_ENV === "development") {
    config = {
        ...config,
        auth: {
            username: process.env.DHIS2_USERNAME!,
            password: process.env.DHIS2_PASSWORD!,
        },
    };
}

export const api = axios.create(config);

export const getDHIS2Resource = async <T>({
    resource,
    params = {},
    includeApi = true,
}: {
    resource: string;
    params?: { [key: string]: string | number };
    includeApi?: boolean;
}) => {
    const actualResource = includeApi ? `api/${resource}` : resource;
    const { data } = await api.get<T>(actualResource, {
        params,
    });
    return data;
};
