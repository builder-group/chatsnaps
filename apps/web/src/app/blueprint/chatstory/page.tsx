import { redirect, RedirectType } from 'next/navigation';
import { type TPageFC } from '@/app/types';
import { decodeObjectSchema, encodeObject } from '@/lib';

import { SChatStoryBlueprint, type TChatStoryBlueprint } from './schema';
import { Step1 } from './Step1';
import { Step2 } from './Step2';

const Page: TPageFC = (props) => {
	const { searchParams } = props;
	const blueprintParam = searchParams?.blueprint;
	if (typeof blueprintParam !== 'string') {
		redirectToDefault();
		return null;
	}

	const parsedBlueprintParam = decodeObjectSchema(blueprintParam, SChatStoryBlueprint);
	if (parsedBlueprintParam == null) {
		redirectToDefault();
		return null;
	}

	const currentStep = parsedBlueprintParam.currentStep;

	switch (currentStep.type) {
		case 'Step1':
			return <Step1 step={currentStep} />;
		case 'Step2':
			return <Step2 />;
	}
};

export default Page;

function redirectToDefault(): void {
	const step1: TChatStoryBlueprint = {
		currentStep: {
			type: 'Step1',
			originalStory: '',
			targetAudience: ''
		}
	};
	redirect(`/blueprint/chatstory?blueprint=${encodeObject(step1)}`, RedirectType.replace);
}
