import * as v from 'valibot';

const SChatStoryScriptEvent = v.union([
	v.object({
		type: v.literal('Message'),
		content: v.string(),
		spokenContent: v.optional(v.string()),
		participantId: v.number()
	}),
	v.object({
		type: v.literal('Pause'),
		durationMs: v.number()
	})
]);

const SChatStoryScriptParticipant = v.object({
	id: v.number(),
	displayName: v.string(),
	isSelf: v.boolean(),
	voice: v.optional(v.string())
});

export const SChatStoryScript = v.object({
	participants: v.array(SChatStoryScriptParticipant),
	events: v.array(SChatStoryScriptEvent)
});

const SChatStoryBlueprintStep1 = v.object({
	step: v.literal(1),
	originalStory: v.string(),
	targetAudience: v.optional(v.string())
});
export type TChatStoryBlueprintStep1 = v.InferInput<typeof SChatStoryBlueprintStep1>;

const SChatStoryBlueprintStep2 = v.object({
	step: v.literal(2),
	script: SChatStoryScript
});
export type TChatStoryBlueprintStep2 = v.InferInput<typeof SChatStoryBlueprintStep2>;

const SChatStoryBlueprintStep = v.union([SChatStoryBlueprintStep1, SChatStoryBlueprintStep2]);
export type TChatStoryBlueprintStep = v.InferInput<typeof SChatStoryBlueprintStep>;

export const SChatStoryBlueprint = v.object({
	id: v.pipe(v.string(), v.startsWith('blueprint')),
	steps: v.array(SChatStoryBlueprintStep)
});
export type TChatStoryBlueprint = v.InferInput<typeof SChatStoryBlueprint>;

export function isChatStoryBlueprint(
	value: unknown
): value is v.InferInput<typeof SChatStoryBlueprint> {
	return v.safeParse(SChatStoryBlueprint, value).success;
}
