export type RenderOptions = {
    path: string;
    corpus?: string;
    honeypotPathPrefix: string;
    byteCap: number;
};
export declare function renderPoisonPage(options: RenderOptions): string;
