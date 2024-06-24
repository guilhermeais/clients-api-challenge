export abstract class HttpClient {
  abstract get<T>(url: URL, options?: GetOptions): Promise<HttpResponse<T>>;
}

export type GetOptions = {
  headers?: Record<string, string>;
};

export type HttpResponse<T> = {
  status: number;
  body: T;
};
