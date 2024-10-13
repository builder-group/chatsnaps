'use client';

import { withLocalStorage } from 'feature-react/state';
import { createState } from 'feature-state';
import { useRouter } from 'next/navigation';
import React from 'react';
import { SpinnerIcon } from '@/components';

import { Step1 } from './_Step1';
import { Step2 } from './_Step2';
import { getPath } from './get-path';
import { type TChatStoryBlueprint } from './schema';

export const Step: React.FC<TProps> = (props) => {
	const { id, step } = props;
	const [isLoadingStorage, setIsLoadingStorage] = React.useState(true);
	const { replace } = useRouter();

	const $blueprint = React.useMemo(
		() =>
			withLocalStorage(
				createState<TChatStoryBlueprint>({
					id,
					steps: [
						{
							step: 1,
							originalStory: '',
							targetAudience: ''
						}
					]
				}),
				id
			),
		[id]
	);

	React.useEffect(() => {
		void $blueprint.persist();
		setIsLoadingStorage(false);
	}, [$blueprint]);

	if (isLoadingStorage) {
		return (
			<div className="flex h-screen w-full flex-col items-center justify-center">
				<SpinnerIcon className="h-8 w-8 animate-spin" />
				<p className="mt-2">Loading Data</p>
			</div>
		);
	}

	if ($blueprint._value.steps.length < step) {
		replace(getPath(id, $blueprint._value.steps.length));
		return null;
	}

	switch (step) {
		case 1: {
			const stepData = $blueprint._value.steps[step - 1];
			if (stepData?.step === 1) {
				return <Step1 step={stepData} $blueprint={$blueprint} />;
			}
			break;
		}
		case 2: {
			const stepData = $blueprint._value.steps[step - 1];
			if (stepData?.step === 2) {
				return <Step2 step={stepData} />;
			}
		}
	}

	return <p>TODO Error with reload option</p>;
};

interface TProps {
	id: string;
	step: number;
}
