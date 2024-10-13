'use client';

import { withLocalStorage } from 'feature-react/state';
import { createState } from 'feature-state';
import React from 'react';
import { SpinnerIcon } from '@/components';

import { type TChatStoryBlueprint } from './schema';
import { Step1 } from './Step1';
import { Step2 } from './Step2';

export const Step: React.FC<TProps> = (props) => {
	const { id, step } = props;
	const [isLoadingStorage, setIsLoadingStorage] = React.useState(true);

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
			<div className="flex h-screen w-full items-center justify-center">
				<SpinnerIcon className="h-8 w-8 animate-spin" />
			</div>
		);
	}

	switch (step) {
		case 1: {
			const stepData = $blueprint._value.steps[step - 1];
			if (stepData?.step === 1) {
				return <Step1 step={stepData} />;
			}
			break;
		}
		case 2:
			return <Step2 />;
	}

	return <p>TODO Error with reload option</p>;
};

interface TProps {
	id: string;
	step: number;
}
