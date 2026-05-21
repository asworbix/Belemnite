export type MarkovOptions = {
    order?: number;
};
export type GenerateOptions = {
    words: number;
    seed?: number;
};
export declare class MarkovChain {
    readonly order: number;
    private chain;
    private starters;
    constructor(options?: MarkovOptions);
    train(text: string): void;
    generate(options: GenerateOptions): string;
    generateParagraphs(count: number, wordsPer: number, seed?: number): string[];
}
export declare function seedFromString(input: string): number;
