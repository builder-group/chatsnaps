import React from 'react';
import { ZodType } from 'zod';

import { TTimelinePluginItem } from '../schema';

export type TTimelinePluginItemFC<
	GTimelinePluginItem extends TTimelinePluginItem,
	GPluginId extends string
> = React.FC<{
	item: GTimelinePluginItem;
}> & {
	id: GPluginId;
	schema: ZodType<Omit<GTimelinePluginItem, 'pluginId'> & { pluginId: GPluginId }>;
};
