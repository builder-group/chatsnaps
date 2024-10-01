import { router } from '../../router';
import { CheckEnergyLabelHealthRoute } from './schema';

router.openapi(CheckEnergyLabelHealthRoute, (c) => {
	return c.json({
		message: 'App is up and running',
		status: 'Up' as const
	});
});
