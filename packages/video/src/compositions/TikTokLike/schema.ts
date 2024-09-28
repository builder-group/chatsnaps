import * as z from 'zod';

export const STikTokLikeCompProps = z.object({
	className: z.string().optional()
});

export type TTikTokLikeCompProps = z.infer<typeof STikTokLikeCompProps>;
