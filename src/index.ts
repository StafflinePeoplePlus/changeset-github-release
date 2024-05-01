import { Console, Effect } from 'effect';
import { NodeFileSystem, NodeRuntime } from '@effect/platform-node';
import { Changelog, Package } from './types/index.js';

Effect.gen(function* () {
	const changelog = yield* Changelog.read('tests/example-changelog.md');
	const packageInfo = yield* Package.readInfo('tests/example-package.json');
	const entry = Changelog.findEntry(changelog, packageInfo.version);
	yield* Console.log(changelog, entry, packageInfo);
}).pipe(Effect.provide(NodeFileSystem.layer), NodeRuntime.runMain);
