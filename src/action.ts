import { Effect } from 'effect';
import { cli } from './cli.js';
import { NodeContext, NodeRuntime } from '@effect/platform-node';
import core from '@actions/core';
import github from '@actions/github';
import { existsSync } from 'node:fs';

const main = () => {
	const owner = core.getInput('owner') || github.context.repo.owner;
	const repo = core.getInput('repo') || github.context.repo.repo;
	const packageJSON = core.getInput('package-json', { required: true });
	const changelog = core.getInput('changelog', { required: true });

	if (!existsSync(changelog)) {
		core.warning(`Changelog file not found at ${changelog}, skipping`);
		return;
	}

	if (!owner) {
		throw new Error('owner is required');
	}
	if (!repo) {
		throw new Error('repo is required');
	}

	cli([
		'',
		'',
		'release',
		'--skip-on-existing',
		'--owner',
		owner,
		'--repo',
		repo,
		'--package-json',
		packageJSON,
		'--changelog',
		changelog,
	]).pipe(Effect.provide(NodeContext.layer), NodeRuntime.runMain);
};

try {
	main();
} catch (error) {
	core.setFailed(error as Error);
}
