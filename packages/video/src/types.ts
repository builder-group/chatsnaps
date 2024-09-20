import React from 'react';
import type { CalculateMetadataFunction } from 'remotion';
import type { AnyZodObject } from 'zod';

export type TRemotionFC<TProps extends Record<string, any>> = React.FC<TProps> & {
	calculateMetadata: CalculateMetadataFunction<TProps>;
	schema: AnyZodObject; // Schema<TProps>
	id: string;
};
