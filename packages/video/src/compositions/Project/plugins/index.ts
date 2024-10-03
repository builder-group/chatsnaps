import { TikTokFollowTimelineItem } from './TikTokFollow';
import { TikTokLikeTimelineItem } from './TikTokLike';

export const TIMELINE_PLUGIN_ITEM_MAP = {
	[TikTokFollowTimelineItem.id as string]: TikTokFollowTimelineItem,
	[TikTokLikeTimelineItem.id as string]: TikTokLikeTimelineItem
};
