import * as z from 'zod';

export const STikTokLikeCompProps = z.object({
	text: z.string().optional(),
	className: z.string().optional()
});

export type TTikTokLikeCompProps = z.infer<typeof STikTokLikeCompProps>;
