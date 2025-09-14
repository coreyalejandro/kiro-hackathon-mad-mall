export declare function postImportPexels(body: {
    query: string;
    category: string;
    count?: number;
}): Promise<any[]>;
export declare function postImportUnsplash(body: {
    query: string;
    category: string;
    count?: number;
}): Promise<any[]>;
export declare function getPending(): Promise<any>;
export declare function getFlagged(): Promise<any>;
export declare function postValidate(body: {
    imageId: string;
}): Promise<any>;
export declare function getSelect(query: {
    context: string;
}): Promise<any>;
