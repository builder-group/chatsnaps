import * as z from 'zod';
import { SVisualMedia } from '@/components';

export const STikTokFollowCompProps = z.object({
	media: SVisualMedia,
	text: z.string().optional(),
	className: z.string().optional()
});

export type TTikTokFollowCompProps = z.infer<typeof STikTokFollowCompProps>;
