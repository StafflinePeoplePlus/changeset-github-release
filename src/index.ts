import { Config, Console, Effect, Option } from 'effect';
import { NodeFileSystem, NodeRuntime } from '@effect/platform-node';
import { Changelog, Github, Package } from './types/index.js';
import { Octokit } from '@octokit/core';

Effect.gen(function* () {
	const changelog = yield* Changelog.read('tests/example-changelog.md');
	const packageInfo = yield* Package.readInfo('tests/example-package.json');
	const entry = yield* Changelog.findEntry(changelog, packageInfo.version);
	yield* Effect.log(`Latest version is ${entry.version}.`);

	const repo = Github.repo('StafflinePeoplePlus', 'changeset-github-release');
	const tag = 'v' + entry.version;
	const release = yield* Github.releaseByTagName(repo, tag);
	if (Option.isSome(release)) {
		yield* Effect.log(`Release for ${tag} already exists at ${release.value.html_url}, skipping.`);
	} else {
		yield* Effect.log(`Creating release for ${tag}...`);
		const newRelease = yield* Github.createRelease(repo, tag, tag, entry.changes);
		yield* Effect.log(`Release for ${tag} created. View it at ${newRelease.html_url}`);
	}
}).pipe(
	Effect.provide(NodeFileSystem.layer),
	Effect.provideServiceEffect(
		Github.Octokit,
		Config.string('GITHUB_TOKEN').pipe(Effect.map((auth) => new Octokit({ auth })))
	),
	NodeRuntime.runMain
);
