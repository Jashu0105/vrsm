import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import type { CreateCustomerInput, CreateRentalInput, CreateVehicleInput, Customer, DashboardStats, HealthStatus, ListCustomersParams, ListRentalsParams, ListVehiclesParams, RentalWithDetails, UpdateCustomerInput, UpdateRentalInput, UpdateVehicleInput, Vehicle } from "./api.schemas";
import { customFetch } from "../custom-fetch";
import type { ErrorType, BodyType } from "../custom-fetch";
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
/**
 * Returns server health status
 * @summary Health check
 */
export declare const getHealthCheckUrl: () => string;
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary List all vehicles
 */
export declare const getListVehiclesUrl: (params?: ListVehiclesParams) => string;
export declare const listVehicles: (params?: ListVehiclesParams, options?: RequestInit) => Promise<Vehicle[]>;
export declare const getListVehiclesQueryKey: (params?: ListVehiclesParams) => readonly ["/api/vehicles", ...ListVehiclesParams[]];
export declare const getListVehiclesQueryOptions: <TData = Awaited<ReturnType<typeof listVehicles>>, TError = ErrorType<unknown>>(params?: ListVehiclesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listVehicles>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listVehicles>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListVehiclesQueryResult = NonNullable<Awaited<ReturnType<typeof listVehicles>>>;
export type ListVehiclesQueryError = ErrorType<unknown>;
/**
 * @summary List all vehicles
 */
export declare function useListVehicles<TData = Awaited<ReturnType<typeof listVehicles>>, TError = ErrorType<unknown>>(params?: ListVehiclesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listVehicles>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Add a new vehicle
 */
export declare const getCreateVehicleUrl: () => string;
export declare const createVehicle: (createVehicleInput: CreateVehicleInput, options?: RequestInit) => Promise<Vehicle>;
export declare const getCreateVehicleMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createVehicle>>, TError, {
        data: BodyType<CreateVehicleInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createVehicle>>, TError, {
    data: BodyType<CreateVehicleInput>;
}, TContext>;
export type CreateVehicleMutationResult = NonNullable<Awaited<ReturnType<typeof createVehicle>>>;
export type CreateVehicleMutationBody = BodyType<CreateVehicleInput>;
export type CreateVehicleMutationError = ErrorType<unknown>;
/**
 * @summary Add a new vehicle
 */
export declare const useCreateVehicle: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createVehicle>>, TError, {
        data: BodyType<CreateVehicleInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createVehicle>>, TError, {
    data: BodyType<CreateVehicleInput>;
}, TContext>;
/**
 * @summary Get vehicle by ID
 */
export declare const getGetVehicleUrl: (id: number) => string;
export declare const getVehicle: (id: number, options?: RequestInit) => Promise<Vehicle>;
export declare const getGetVehicleQueryKey: (id: number) => readonly [`/api/vehicles/${number}`];
export declare const getGetVehicleQueryOptions: <TData = Awaited<ReturnType<typeof getVehicle>>, TError = ErrorType<void>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getVehicle>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getVehicle>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetVehicleQueryResult = NonNullable<Awaited<ReturnType<typeof getVehicle>>>;
export type GetVehicleQueryError = ErrorType<void>;
/**
 * @summary Get vehicle by ID
 */
export declare function useGetVehicle<TData = Awaited<ReturnType<typeof getVehicle>>, TError = ErrorType<void>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getVehicle>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update vehicle
 */
export declare const getUpdateVehicleUrl: (id: number) => string;
export declare const updateVehicle: (id: number, updateVehicleInput: UpdateVehicleInput, options?: RequestInit) => Promise<Vehicle>;
export declare const getUpdateVehicleMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateVehicle>>, TError, {
        id: number;
        data: BodyType<UpdateVehicleInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateVehicle>>, TError, {
    id: number;
    data: BodyType<UpdateVehicleInput>;
}, TContext>;
export type UpdateVehicleMutationResult = NonNullable<Awaited<ReturnType<typeof updateVehicle>>>;
export type UpdateVehicleMutationBody = BodyType<UpdateVehicleInput>;
export type UpdateVehicleMutationError = ErrorType<unknown>;
/**
 * @summary Update vehicle
 */
export declare const useUpdateVehicle: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateVehicle>>, TError, {
        id: number;
        data: BodyType<UpdateVehicleInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateVehicle>>, TError, {
    id: number;
    data: BodyType<UpdateVehicleInput>;
}, TContext>;
/**
 * @summary Delete vehicle
 */
export declare const getDeleteVehicleUrl: (id: number) => string;
export declare const deleteVehicle: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteVehicleMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteVehicle>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteVehicle>>, TError, {
    id: number;
}, TContext>;
export type DeleteVehicleMutationResult = NonNullable<Awaited<ReturnType<typeof deleteVehicle>>>;
export type DeleteVehicleMutationError = ErrorType<unknown>;
/**
 * @summary Delete vehicle
 */
export declare const useDeleteVehicle: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteVehicle>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteVehicle>>, TError, {
    id: number;
}, TContext>;
/**
 * @summary List all customers
 */
export declare const getListCustomersUrl: (params?: ListCustomersParams) => string;
export declare const listCustomers: (params?: ListCustomersParams, options?: RequestInit) => Promise<Customer[]>;
export declare const getListCustomersQueryKey: (params?: ListCustomersParams) => readonly ["/api/customers", ...ListCustomersParams[]];
export declare const getListCustomersQueryOptions: <TData = Awaited<ReturnType<typeof listCustomers>>, TError = ErrorType<unknown>>(params?: ListCustomersParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listCustomers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listCustomers>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListCustomersQueryResult = NonNullable<Awaited<ReturnType<typeof listCustomers>>>;
export type ListCustomersQueryError = ErrorType<unknown>;
/**
 * @summary List all customers
 */
export declare function useListCustomers<TData = Awaited<ReturnType<typeof listCustomers>>, TError = ErrorType<unknown>>(params?: ListCustomersParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listCustomers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Create a new customer
 */
export declare const getCreateCustomerUrl: () => string;
export declare const createCustomer: (createCustomerInput: CreateCustomerInput, options?: RequestInit) => Promise<Customer>;
export declare const getCreateCustomerMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createCustomer>>, TError, {
        data: BodyType<CreateCustomerInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createCustomer>>, TError, {
    data: BodyType<CreateCustomerInput>;
}, TContext>;
export type CreateCustomerMutationResult = NonNullable<Awaited<ReturnType<typeof createCustomer>>>;
export type CreateCustomerMutationBody = BodyType<CreateCustomerInput>;
export type CreateCustomerMutationError = ErrorType<unknown>;
/**
 * @summary Create a new customer
 */
export declare const useCreateCustomer: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createCustomer>>, TError, {
        data: BodyType<CreateCustomerInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createCustomer>>, TError, {
    data: BodyType<CreateCustomerInput>;
}, TContext>;
/**
 * @summary Get customer by ID
 */
export declare const getGetCustomerUrl: (id: number) => string;
export declare const getCustomer: (id: number, options?: RequestInit) => Promise<Customer>;
export declare const getGetCustomerQueryKey: (id: number) => readonly [`/api/customers/${number}`];
export declare const getGetCustomerQueryOptions: <TData = Awaited<ReturnType<typeof getCustomer>>, TError = ErrorType<void>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCustomer>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getCustomer>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetCustomerQueryResult = NonNullable<Awaited<ReturnType<typeof getCustomer>>>;
export type GetCustomerQueryError = ErrorType<void>;
/**
 * @summary Get customer by ID
 */
export declare function useGetCustomer<TData = Awaited<ReturnType<typeof getCustomer>>, TError = ErrorType<void>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCustomer>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update customer
 */
export declare const getUpdateCustomerUrl: (id: number) => string;
export declare const updateCustomer: (id: number, updateCustomerInput: UpdateCustomerInput, options?: RequestInit) => Promise<Customer>;
export declare const getUpdateCustomerMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateCustomer>>, TError, {
        id: number;
        data: BodyType<UpdateCustomerInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateCustomer>>, TError, {
    id: number;
    data: BodyType<UpdateCustomerInput>;
}, TContext>;
export type UpdateCustomerMutationResult = NonNullable<Awaited<ReturnType<typeof updateCustomer>>>;
export type UpdateCustomerMutationBody = BodyType<UpdateCustomerInput>;
export type UpdateCustomerMutationError = ErrorType<unknown>;
/**
 * @summary Update customer
 */
export declare const useUpdateCustomer: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateCustomer>>, TError, {
        id: number;
        data: BodyType<UpdateCustomerInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateCustomer>>, TError, {
    id: number;
    data: BodyType<UpdateCustomerInput>;
}, TContext>;
/**
 * @summary Delete customer
 */
export declare const getDeleteCustomerUrl: (id: number) => string;
export declare const deleteCustomer: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteCustomerMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteCustomer>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteCustomer>>, TError, {
    id: number;
}, TContext>;
export type DeleteCustomerMutationResult = NonNullable<Awaited<ReturnType<typeof deleteCustomer>>>;
export type DeleteCustomerMutationError = ErrorType<unknown>;
/**
 * @summary Delete customer
 */
export declare const useDeleteCustomer: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteCustomer>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteCustomer>>, TError, {
    id: number;
}, TContext>;
/**
 * @summary List all rentals
 */
export declare const getListRentalsUrl: (params?: ListRentalsParams) => string;
export declare const listRentals: (params?: ListRentalsParams, options?: RequestInit) => Promise<RentalWithDetails[]>;
export declare const getListRentalsQueryKey: (params?: ListRentalsParams) => readonly ["/api/rentals", ...ListRentalsParams[]];
export declare const getListRentalsQueryOptions: <TData = Awaited<ReturnType<typeof listRentals>>, TError = ErrorType<unknown>>(params?: ListRentalsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listRentals>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listRentals>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListRentalsQueryResult = NonNullable<Awaited<ReturnType<typeof listRentals>>>;
export type ListRentalsQueryError = ErrorType<unknown>;
/**
 * @summary List all rentals
 */
export declare function useListRentals<TData = Awaited<ReturnType<typeof listRentals>>, TError = ErrorType<unknown>>(params?: ListRentalsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listRentals>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Create a new rental
 */
export declare const getCreateRentalUrl: () => string;
export declare const createRental: (createRentalInput: CreateRentalInput, options?: RequestInit) => Promise<RentalWithDetails>;
export declare const getCreateRentalMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createRental>>, TError, {
        data: BodyType<CreateRentalInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createRental>>, TError, {
    data: BodyType<CreateRentalInput>;
}, TContext>;
export type CreateRentalMutationResult = NonNullable<Awaited<ReturnType<typeof createRental>>>;
export type CreateRentalMutationBody = BodyType<CreateRentalInput>;
export type CreateRentalMutationError = ErrorType<unknown>;
/**
 * @summary Create a new rental
 */
export declare const useCreateRental: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createRental>>, TError, {
        data: BodyType<CreateRentalInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createRental>>, TError, {
    data: BodyType<CreateRentalInput>;
}, TContext>;
/**
 * @summary Get rental by ID
 */
export declare const getGetRentalUrl: (id: number) => string;
export declare const getRental: (id: number, options?: RequestInit) => Promise<RentalWithDetails>;
export declare const getGetRentalQueryKey: (id: number) => readonly [`/api/rentals/${number}`];
export declare const getGetRentalQueryOptions: <TData = Awaited<ReturnType<typeof getRental>>, TError = ErrorType<void>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getRental>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getRental>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetRentalQueryResult = NonNullable<Awaited<ReturnType<typeof getRental>>>;
export type GetRentalQueryError = ErrorType<void>;
/**
 * @summary Get rental by ID
 */
export declare function useGetRental<TData = Awaited<ReturnType<typeof getRental>>, TError = ErrorType<void>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getRental>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update rental (e.g. return vehicle)
 */
export declare const getUpdateRentalUrl: (id: number) => string;
export declare const updateRental: (id: number, updateRentalInput: UpdateRentalInput, options?: RequestInit) => Promise<RentalWithDetails>;
export declare const getUpdateRentalMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateRental>>, TError, {
        id: number;
        data: BodyType<UpdateRentalInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateRental>>, TError, {
    id: number;
    data: BodyType<UpdateRentalInput>;
}, TContext>;
export type UpdateRentalMutationResult = NonNullable<Awaited<ReturnType<typeof updateRental>>>;
export type UpdateRentalMutationBody = BodyType<UpdateRentalInput>;
export type UpdateRentalMutationError = ErrorType<unknown>;
/**
 * @summary Update rental (e.g. return vehicle)
 */
export declare const useUpdateRental: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateRental>>, TError, {
        id: number;
        data: BodyType<UpdateRentalInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateRental>>, TError, {
    id: number;
    data: BodyType<UpdateRentalInput>;
}, TContext>;
/**
 * @summary Get dashboard statistics
 */
export declare const getGetDashboardStatsUrl: () => string;
export declare const getDashboardStats: (options?: RequestInit) => Promise<DashboardStats>;
export declare const getGetDashboardStatsQueryKey: () => readonly ["/api/dashboard/stats"];
export declare const getGetDashboardStatsQueryOptions: <TData = Awaited<ReturnType<typeof getDashboardStats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDashboardStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getDashboardStats>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetDashboardStatsQueryResult = NonNullable<Awaited<ReturnType<typeof getDashboardStats>>>;
export type GetDashboardStatsQueryError = ErrorType<unknown>;
/**
 * @summary Get dashboard statistics
 */
export declare function useGetDashboardStats<TData = Awaited<ReturnType<typeof getDashboardStats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDashboardStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export {};
//# sourceMappingURL=api.d.ts.map