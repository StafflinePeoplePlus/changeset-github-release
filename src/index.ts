import { Config, Console, Effect, Either, Option } from 'effect';
import { NodeContext, NodeFileSystem, NodeRuntime } from '@effect/platform-node';
import { Changelog, Github, Package } from './types/index.js';
import { Octokit } from '@octokit/core';
import { Command, Options } from '@effect/cli';

const resolveVersion = Either.match({
	onLeft: (packageJSONPath: string) =>
		Package.readInfo(packageJSONPath).pipe(Effect.map((info) => info.version)),
	onRight: (version: string) => Effect.succeed(Package.Version(version)),
});
const provideOctokit = Effect.provideServiceEffect(
	Github.Octokit,
	Config.string('GITHUB_TOKEN').pipe(Effect.map((auth) => new Octokit({ auth })))
);

const changelog = Options.file('changelog', { exists: 'yes' }).pipe(Options.withAlias('c'));
const packageJSON = Options.file('package-json', { exists: 'yes' }).pipe(Options.withAlias('p'));
const version = Options.text('package-version').pipe(Options.withAlias('V'));
const extract = Command.make(
	'extract',
	{ changelog, versionOrPackageJSON: Options.orElseEither(packageJSON, version) },
	({ changelog: changelogPath, versionOrPackageJSON }) =>
		Effect.gen(function* () {
			const changelog = yield* Changelog.read(changelogPath);
			const version = yield* resolveVersion(versionOrPackageJSON);
			const entry = yield* Changelog.findEntry(changelog, version);
			yield* Console.log(`## v${entry.version}\n`);
			yield* Console.log(`${entry.changes}`);
		})
);

const owner = Options.text('owner');
const repo = Options.text('repo');
const checkRelease = Command.make(
	'check-release',
	{ owner, repo, versionOrPackageJSON: Options.orElseEither(packageJSON, version) },
	({ owner, repo: repoName, versionOrPackageJSON }) =>
		Effect.gen(function* () {
			const version = yield* resolveVersion(versionOrPackageJSON);
			const tag = 'v' + version;
			const repo = Github.repo(owner, repoName);
			const release = yield* Github.releaseByTagName(repo, tag);
			if (Option.isSome(release)) {
				yield* Console.log(`Release for ${tag} already exists at ${release.value.html_url}`);
			} else {
				yield* Console.log(`Release for ${tag} does not yet exist.`);
			}
		}).pipe(provideOctokit)
);

const skipOnExisting = Options.boolean('skip-on-existing').pipe(
	Options.withAlias('s'),
	Options.withDefault(false)
);
const release = Command.make(
	'release',
	{
		owner,
		repo,
		changelog,
		versionOrPackageJSON: Options.orElseEither(packageJSON, version),
		skipOnExisting,
	},
	({ owner, repo: repoName, changelog: changelogPath, versionOrPackageJSON, skipOnExisting }) =>
		Effect.gen(function* () {
			const changelog = yield* Changelog.read(changelogPath);
			const version = yield* resolveVersion(versionOrPackageJSON);
			const entry = yield* Changelog.findEntry(changelog, version).pipe(
				Either.fromOption(() => `Changelog entry not found for version v${version}.`)
			);

			const tag = 'v' + version;
			const repo = Github.repo(owner, repoName);
			const release = yield* Github.releaseByTagName(repo, tag);
			if (Option.isSome(release)) {
				yield* Console.log(`Release for ${tag} already exists at ${release.value.html_url}`);
				if (skipOnExisting) {
					return;
				}
				return yield* Effect.fail('Release already exists');
			}

			yield* Console.log(`Release for ${tag} does not yet exist, creating...`);
			const newRelease = yield* Github.createRelease(repo, tag, tag, entry.changes);
			yield* Console.log(`Release for ${tag} created. View it at ${newRelease.html_url}`);
		}).pipe(provideOctokit)
);

const command = Command.make('changeset-github-release').pipe(
	Command.withSubcommands([extract, checkRelease, release])
);
const cli = Command.run(command, { name: 'Changeset Github Release', version: 'v1.0.0' });

Effect.suspend(() => cli(process.argv)).pipe(
	Effect.provide(NodeContext.layer),
	NodeRuntime.runMain
);
