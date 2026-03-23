export interface PaginationOptions {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'ASC' | 'DESC';
}

export const convertOptions = (options?: PaginationOptions) => {
    let skip: number | undefined;
    let take: number | undefined;

    if (options?.page && options?.limit) {
        skip = (options.page - 1) * options.limit;
        take = options.limit;
    }

    return { skip, take };
};
