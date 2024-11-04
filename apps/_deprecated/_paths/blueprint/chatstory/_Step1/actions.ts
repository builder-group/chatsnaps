'use server';

import {
	type TChatStoryBlueprintStep1,
	type TChatStoryBlueprintStep2,
	type TChatStoryScript
} from '../schema';

const dummyScript: TChatStoryScript = {
	title: "Soccer Star's Risky Play",
	participants: {
		1: {
			displayName: 'Unknown',
			voice: 'Adam',
			isSelf: false
		},
		2: {
			displayName: 'Elli',
			voice: 'Elli',
			isSelf: true
		}
	},
	events: [
		{
			type: 'Message',
			content: 'I just signed with Manchester United! 🎉⚽',
			participantId: '1'
		},
		{
			type: 'Pause',
			durationMs: 100
		},
		{
			type: 'Message',
			content: 'What?!',
			participantId: '2'
		},
		{
			type: 'Message',
			content: 'Crazy, right?',
			participantId: '1'
		},
		{
			type: 'Message',
			content: "That's insane!",
			participantId: '2'
		},
		{
			type: 'Message',
			content: 'But...',
			participantId: '1'
		},
		{
			type: 'Message',
			content: "There's a catch",
			participantId: '1'
		},
		{
			type: 'Message',
			content: 'What catch?',
			participantId: '2'
		},
		{
			type: 'Message',
			content: 'Will you...',
			participantId: '1'
		},
		{
			type: 'Message',
			content: 'be my keeper?',
			participantId: '1'
		},
		{
			type: 'Message',
			content: 'Your keeper? 😳',
			participantId: '2'
		},
		{
			type: 'Message',
			content: "Because you're",
			participantId: '1'
		},
		{
			type: 'Message',
			content: 'a real catch 😉',
			participantId: '1'
		},
		{
			type: 'Message',
			content: 'Smooth! But...',
			participantId: '2'
		},
		{
			type: 'Message',
			content: "I don't know",
			participantId: '2'
		},
		{
			type: 'Message',
			content: 'Come on!',
			participantId: '1'
		},
		{
			type: 'Message',
			content: "We'd be perfect",
			participantId: '1'
		},
		{
			type: 'Message',
			content: 'How so?',
			participantId: '2'
		},
		{
			type: 'Message',
			content: "You're the ball",
			participantId: '1'
		},
		{
			type: 'Message',
			content: "I'm the goal",
			participantId: '1'
		},
		{
			type: 'Message',
			content: 'Together we score',
			participantId: '1'
		},
		{
			type: 'Message',
			content: 'OMG 🙈',
			participantId: '2'
		},
		{
			type: 'Message',
			content: 'But seriously',
			participantId: '2'
		},
		{
			type: 'Message',
			content: "It's risky",
			participantId: '2'
		},
		{
			type: 'Message',
			content: "I'll make it",
			participantId: '1'
		},
		{
			type: 'Message',
			content: 'worth your while',
			participantId: '1'
		},
		{
			type: 'Message',
			content: 'How?',
			participantId: '2'
		},
		{
			type: 'Message',
			content: "I'll teach you",
			participantId: '1'
		},
		{
			type: 'Message',
			content: 'my best moves',
			participantId: '1'
		},
		{
			type: 'Message',
			content: 'On or off',
			participantId: '2'
		},
		{
			type: 'Message',
			content: 'the field? 😏',
			participantId: '2'
		},
		{
			type: 'Message',
			content: 'Both 😘',
			participantId: '1'
		},
		{
			type: 'Message',
			content: 'Wow, bold!',
			participantId: '2'
		},
		{
			type: 'Message',
			content: "I'm a striker",
			participantId: '1'
		},
		{
			type: 'Message',
			content: 'I go for',
			participantId: '1'
		},
		{
			type: 'Message',
			content: 'what I want',
			participantId: '1'
		},
		{
			type: 'Message',
			content: 'And that is?',
			participantId: '2'
		},
		{
			type: 'Message',
			content: 'You, obviously',
			participantId: '1'
		},
		{
			type: 'Message',
			content: 'Flattered, but...',
			participantId: '2'
		},
		{
			type: 'Message',
			content: 'Still unsure',
			participantId: '2'
		},
		{
			type: 'Message',
			content: 'What if...',
			participantId: '1'
		},
		{
			type: 'Message',
			content: 'I told you',
			participantId: '1'
		},
		{
			type: 'Message',
			content: 'a secret?',
			participantId: '1'
		},
		{
			type: 'Message',
			content: "I'm listening",
			participantId: '2'
		},
		{
			type: 'Message',
			content: 'I turned down',
			participantId: '1'
		},
		{
			type: 'Message',
			content: 'Real Madrid',
			participantId: '1'
		},
		{
			type: 'Message',
			content: 'WHAT?! WHY?',
			participantId: '2'
		},
		{
			type: 'Message',
			content: 'To be closer',
			participantId: '1'
		},
		{
			type: 'Message',
			content: 'to you',
			participantId: '1'
		},
		{
			type: 'Message',
			content: "What would you've chosen? Comment below 👇",
			participantId: '1'
		}
	]
};

export async function moveToStep2(
	step: TChatStoryBlueprintStep1
): Promise<TChatStoryBlueprintStep2> {
	// TODO

	console.log({ step });

	return {
		step: 2,
		script: dummyScript
	};
}
