import * as z from 'zod';
import { SVisualMedia } from '@/components';

export const STikTokFollowCompProps = z.object({
	media: SVisualMedia,
	initialScale: z.number().min(0).max(2).optional(),
	className: z.string().optional()
});

export type TTikTokFollowCompProps = z.infer<typeof STikTokFollowCompProps>;
