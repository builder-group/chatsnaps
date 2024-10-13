import { redirect, RedirectType } from 'next/navigation';
import { type TPageFC } from '@/app/types';
import { pika } from '@/environment';

import { Step } from './Step';

const Page: TPageFC = (props) => {
	const { searchParams } = props;
	const stepParam = typeof searchParams?.step === 'string' ? parseInt(searchParams.step) : null;
	const idParam = searchParams?.id;
	if (
		typeof stepParam !== 'number' ||
		typeof idParam !== 'string' ||
		!idParam.startsWith('blueprint')
	) {
		redirect(
			`/blueprint/chatstory?step=1&id=${pika.gen('blueprint') as string}`,
			RedirectType.replace
		);
	}

	return <Step step={stepParam} id={idParam} />;
};

export default Page;
