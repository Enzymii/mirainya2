declare const httpRequest: <T>(url: string, method: "GET" | "POST" | undefined, data: Record<string, any>) => Promise<void | T>;
export { httpRequest };
