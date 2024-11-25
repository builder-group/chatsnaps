import { logger, pika } from '@/environment';
import { renderVideoComp } from '@/lib';

import { router } from '../../router';
import { createChatStoryVideoComp } from './helper/create-chatstory-video-comp';
import { generateScriptFromStory } from './helper/generate-script-from-story';
import { resolveStory } from './helper/resolve-story';
import {
	ChatStoryBlueprintFactoryRoute,
	ChatStoryBlueprintPromptRoute,
	ChatStoryBlueprintVideoRoute,
	SChatStoryBlueprintTextRoute
} from './schema';

router.openapi(ChatStoryBlueprintVideoRoute, async (c) => {
	const {
		script,
		background = { type: 'Static' },
		voiceover = { isEnabled: true },
		fps = 30
	} = c.req.valid('json');

	const { video, usage } = (
		await createChatStoryVideoComp({
			background,
			voiceover,
			fps,
			script
		})
	).unwrap();

	return c.json(
		{
			video,
			usage
		},
		200
	);
});

router.openapi(ChatStoryBlueprintPromptRoute, async (c) => {
	const {
		storyConcept: bodyStoryConcept,
		storyDirection,
		targetAudience,
		targetLength,
		availableVoices
	} = c.req.valid('json');

	const storyConcept = (await resolveStory(bodyStoryConcept)).unwrap();
	logger.info('Resolved story concept', { storyConcept });
	const { script, usage } = (
		await generateScriptFromStory({
			storyConcept,
			storyDirection,
			targetAudience,
			targetLength,
			availableVoices
		})
	).unwrap();

	return c.json({ script, usage }, 200);
});

router.openapi(ChatStoryBlueprintFactoryRoute, async (c) => {
	const {
		stories,
		background = { type: 'Static' },
		voiceover = { isEnabled: true },
		fps = 30
	} = c.req.valid('json');

	const videoUrls: (string | null)[] = [];
	let totalUsageUsd = 0;
	let totalTimeMs = 0;

	for (const storyConcept of stories) {
		const videoId = pika.gen('video');
		const startTimeMs = performance.now();

		logger.info(`${videoId}: Started creating ChatStory video`);

		const storyConceptResult = await resolveStory(storyConcept);
		if (storyConceptResult.isErr()) {
			logger.error(`${videoId}: Failed to resolve story`, storyConceptResult.error);
			videoUrls.push(null);
			continue;
		}

		const scriptResult = await generateScriptFromStory({
			storyConcept: storyConceptResult.value
		});
		if (scriptResult.isErr()) {
			logger.error(
				`${videoId}: Failed to generate Chat Story script from story`,
				scriptResult.error
			);
			videoUrls.push(null);
			continue;
		}
		const { script, usage: scriptUsage } = scriptResult.value;

		logger.info('Generated script: ', { script, usage: scriptUsage });

		const videoCompResult = await createChatStoryVideoComp({
			background,
			voiceover,
			fps,
			script
		});
		if (videoCompResult.isErr()) {
			logger.error(
				`${videoId}: Failed to generate Chat Story video composition`,
				videoCompResult.error
			);
			videoUrls.push(null);
			continue;
		}
		const { video, usage: videoCompUsage } = videoCompResult.value;

		logger.info('Generated video: ', { usage: videoCompUsage });

		const videoResult = await renderVideoComp(video, videoId);
		if (videoResult.isErr()) {
			logger.error(`${videoId}: Failed to render video`, videoResult.error);
			videoUrls.push(null);
			continue;
		}
		const videoUrl = videoResult.value;

		videoUrls.push(videoUrl);

		const usageUsd = scriptUsage.usd + videoCompUsage.usd;
		totalUsageUsd += usageUsd;

		const endTimeMs = performance.now();
		const timeMs = endTimeMs - startTimeMs;
		totalTimeMs += timeMs;

		logger.info(`${videoId}: Completed creating ChatStory video 🎉`, {
			usageUsd,
			timeMs,
			url: videoUrl
		});
	}

	return c.json({ urls: videoUrls, usageUsd: totalUsageUsd, timeMs: totalTimeMs }, 200);
});

router.openapi(SChatStoryBlueprintTextRoute, (c) => {
	const { script, separator = '\n' } = c.req.valid('json');

	const messages: string[] = [];
	for (const event of script.events) {
		if (event.type !== 'Message') {
			continue;
		}

		const participant = script.participants[event.participantId];
		if (participant == null) {
			continue;
		}

		let content: string | null = null;
		if (typeof event.content === 'string') {
			content = event.content;
		} else if ('text' in event.content) {
			content = event.content.text;
		}

		if (content == null) {
			continue;
		}

		messages.push(`${participant.displayName as string}: ${content}`);
	}

	return c.json(
		{
			text: messages.join(separator)
		},
		200
	);
});
