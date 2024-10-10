import { assertValue } from '@blgc/utils';

export const appConfig = {
	url: assertValue(process.env.NEXT_PUBLIC_URL, 'NEXT_PUBLIC_URL not set!'),
	meta: {
		title: {
			default: 'Shortify | App Platform',
			template: (title: string) => `${title} | dyn.art`
		},
		description: 'Short-Form Content made easy'
	}
};
