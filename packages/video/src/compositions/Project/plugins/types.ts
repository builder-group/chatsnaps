import React from 'react';

import { TTimelinePluginItem } from '../schema';

export type TTimelinePluginItemFC<GTimelinePluginItem extends TTimelinePluginItem> = React.FC<{
	item: GTimelinePluginItem;
}> & {
	id: string;
	isPlugin: (item: unknown) => item is GTimelinePluginItem;
};
