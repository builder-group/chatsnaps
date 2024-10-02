import React from 'react';
import type { CalculateMetadataFunction } from 'remotion';
import type { AnyZodObject } from 'zod';

export type TRemotionFC<GProps extends Record<string, any> = Record<string, any>> =
	React.FC<GProps> & {
		calculateMetadata?: CalculateMetadataFunction<GProps>;
		schema?: AnyZodObject; // Schema<TProps>
		id: string;
	};
