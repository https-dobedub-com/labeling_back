export interface PaginationOptions {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'ASC' | 'DESC';
}

export const convertOptions = (options?: PaginationOptions) => {
    let skip: number | undefined;
    let take: number | undefined;
    let order: Record<string, 'ASC' | 'DESC'> | undefined;

    if (options?.page && options?.limit) {
        skip = (options.page - 1) * options.limit;
        take = options.limit;
    }

    if (options?.sort && options?.order) {
        order = { [options.sort]: options.order };
    }

    return { skip, take, order };
};
