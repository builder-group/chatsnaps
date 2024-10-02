import * as z from 'zod';
import { SVisualMedia } from '@/components';

import { STimelinePluginItem } from '../../schema';

export const STikTokFollowTimelineItem = STimelinePluginItem.extend({
	pluginId: z.literal('tiktok-follow'),
	props: z.object({
		media: SVisualMedia,
		text: z.string().optional()
	})
});

export type TTikTokFollowTimelineItem = z.infer<typeof STikTokFollowTimelineItem>;

export function isTikTokFollowPlugin(
	item: unknown
): item is z.infer<typeof STikTokFollowTimelineItem> {
	return STikTokFollowTimelineItem.safeParse(item).success;
}
