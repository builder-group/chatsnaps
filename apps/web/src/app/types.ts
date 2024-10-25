import type React from 'react';

export type TPageParams = Record<string, string | string[] | undefined>;
export interface TPageProps {
	params?: TPageParams;
	searchParams?: TPageParams;
}

export type TPageFC<GProps extends Record<string, unknown> = {}> = React.FC<GProps & TPageProps>;
