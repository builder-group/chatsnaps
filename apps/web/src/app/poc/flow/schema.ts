import * as v from 'valibot';

const SChatStoryScriptEvent = v.union([
	v.object({
		type: v.literal('Message'),
		content: v.string(),
		spokenContent: v.optional(v.string()),
		participantId: v.string()
	}),
	v.object({
		type: v.literal('Pause'),
		durationMs: v.number()
	})
]);
export type TChatStoryScriptEvent = v.InferInput<typeof SChatStoryScriptEvent>;

const SChatStoryScriptParticipant = v.object({
	displayName: v.string(),
	isSelf: v.boolean(),
	voice: v.optional(v.string())
});

export const SChatStoryScript = v.object({
	title: v.optional(v.string()),
	participants: v.record(v.string(), SChatStoryScriptParticipant),
	events: v.array(SChatStoryScriptEvent)
});
export type TChatStoryScript = v.InferInput<typeof SChatStoryScript>;
