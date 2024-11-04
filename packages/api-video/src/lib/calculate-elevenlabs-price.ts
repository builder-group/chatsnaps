// https://elevenlabs.io/pricing
const ELEVENLABS_PRICING = {
	Starter: {
		monthlyCost: 5, // $5 per month
		includedCredits: 30_000 // 30k credits
	},
	Creator: {
		monthlyCost: 22, // $22 per month
		includedCredits: 100_000 // 100k credits
	},
	Pro: {
		monthlyCost: 99, // $99 per month
		includedCredits: 500_000 // 500k credits
	}
};

export function calculateElevenLabsPrice({ plan, credits }: TElevenLabsPricingConfig): number {
	const pricing = ELEVENLABS_PRICING[plan];
	const creditCost = pricing.monthlyCost / pricing.includedCredits;
	return creditCost * credits;
}

interface TElevenLabsPricingConfig {
	plan: 'Starter' | 'Creator' | 'Pro';
	credits: number;
}
