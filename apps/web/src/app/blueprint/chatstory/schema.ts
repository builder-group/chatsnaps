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

export const SChatStoryBlueprintStep1 = v.object({
	originalStory: v.string(),
	targetAudience: v.optional(v.string())
});

export const SChatStoryBlueprintStep2 = v.object({
	script: SChatStoryScript
});

export const SChatStoryBlueprint = v.object({
	step1: v.optional(SChatStoryBlueprintStep1),
	step2: v.optional(SChatStoryBlueprintStep2)
});
