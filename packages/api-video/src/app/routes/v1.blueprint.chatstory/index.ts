import { logger, pika } from '@/environment';
import { renderVideoComp } from '@/lib';

import { router } from '../../router';
import { createChatStoryVideoComp } from './helper/create-chatstory-video-comp';
import { generateScriptFromStory } from './helper/generate-script-from-story';
import { resolveStory } from './helper/resolve-story';
import {
	ChatStoryBlueprintFactoryRoute,
	ChatStoryBlueprintPromptRoute,
	ChatStoryBlueprintVideoRoute
} from './schema';

router.openapi(ChatStoryBlueprintVideoRoute, async (c) => {
	const data = c.req.valid('json');
	const {
		includeVoiceover: includeVoiceoverString = 'false',
		includeBackgroundVideo: includeBackgroundVideoString = 'false',
		useCached: useCachedString = 'true'
	} = c.req.valid('query');
	const includeVoiceover = includeVoiceoverString === 'true';
	const includeBackgroundVideo = includeBackgroundVideoString === 'true';
	const useCached = useCachedString === 'true';
	const fps = 30;

	const { video, usage } = (
		await createChatStoryVideoComp({
			includeVoiceover,
			backgroundVariant: includeBackgroundVideo
				? //	? { type: 'single', categories: ['steep'] }
					{ type: 'sequence', categories: ['baking', 'cake-cutting'] }
				: { type: 'static' },
			useCached,
			fps,
			script: data
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
		originalStory: bodyOrginalStory,
		storyDirection,
		targetAudience,
		targetLength,
		availableVoices
	} = c.req.valid('json');

	const originalStory = (await resolveStory(bodyOrginalStory)).unwrap();
	const { script, usage } = (
		await generateScriptFromStory({
			originalStory,
			storyDirection,
			targetAudience,
			targetLength,
			availableVoices
		})
	).unwrap();

	return c.json({ script, usage }, 200);
});

router.openapi(ChatStoryBlueprintFactoryRoute, async (c) => {
	const { stories } = c.req.valid('json');
	const {
		includeVoiceover: includeVoiceoverString = 'false',
		includeBackgroundVideo: includeBackgroundVideoString = 'false',
		useCached: useCachedString = 'true'
	} = c.req.valid('query');
	const includeVoiceover = includeVoiceoverString === 'true';
	const includeBackgroundVideo = includeBackgroundVideoString === 'true';
	const useCached = useCachedString === 'true';
	const fps = 30;

	const videoUrls: (string | null)[] = [];
	let totalUsageUsd = 0;
	let totalTimeMs = 0;

	for (const story of stories) {
		const videoId = pika.gen('video');
		const startTimeMs = performance.now();

		logger.info(`${videoId}: Started creating ChatStory video`);

		const originalStoryResult = await resolveStory(story);
		if (originalStoryResult.isErr()) {
			logger.error(`${videoId}: Failed to resolve story`, originalStoryResult.error);
			videoUrls.push(null);
			continue;
		}

		const scriptResult = await generateScriptFromStory({
			originalStory: originalStoryResult.value
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

		const videoCompResult = await createChatStoryVideoComp({
			includeVoiceover,
			backgroundVariant: includeBackgroundVideo
				? { type: 'single', categories: ['steep'] }
				: { type: 'static' },
			useCached,
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
