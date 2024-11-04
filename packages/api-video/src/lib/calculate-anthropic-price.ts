// https://www.anthropic.com/pricing#anthropic-api
const ANTHROPIC_PRICING = {
	baseInputPrice: 3, // $3 per 1 million tokens (MTok) for input tokens
	baseOutputPrice: 3.75 // $3.75 per MTok for output tokens
};

export function calculateAnthropicPrice({
	inputTokens,
	outputTokens
}: TAnthropicConfigOptions): number {
	const inputPrice = (inputTokens / 1_000_000) * ANTHROPIC_PRICING.baseInputPrice;
	const outputPrice = (outputTokens / 1_000_000) * ANTHROPIC_PRICING.baseOutputPrice;

	return inputPrice + outputPrice;
}

interface TAnthropicConfigOptions {
	inputTokens: number;
	outputTokens: number;
}
