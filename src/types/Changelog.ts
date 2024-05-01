import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import { toString as mdastToString } from 'mdast-util-to-string';
import { Brand, Data, Effect, Option } from 'effect';
import { FileSystem } from '@effect/platform';
import { Package } from './index.js';

export class Changelog extends Data.Class<{ ast: AST }> {}
export class Entry extends Data.Class<{ version: Package.Version; changes: string }> {}

type AST = ReturnType<typeof parseChangelog> extends Effect.Effect<infer A, any, any> ? A : never;
const parseChangelog = (changelog: string) =>
	Effect.try(() => unified().use(remarkParse).parse(changelog));

export const read = (path: string) =>
	FileSystem.FileSystem.pipe(
		Effect.flatMap((fs) => fs.readFileString(path)),
		Effect.flatMap((changelog) => Effect.try(() => unified().use(remarkParse).parse(changelog))),
		Effect.map((ast) => new Changelog({ ast }))
	);

// Heavily modified from https://github.com/changesets/action/blob/c62ef9792fd0502c89479ed856efe28575010472/src/utils.ts#L37
export function findEntry(changelog: Changelog, version: Package.Version) {
	let headingStartInfo = Option.none<{
		index: number;
		depth: number;
	}>();
	let endIndex = Option.none<number>();

	for (const [index, node] of changelog.ast.children.entries()) {
		if (node.type === 'heading') {
			const stringified: string = mdastToString(node);
			if (Option.isNone(headingStartInfo) && stringified === version) {
				headingStartInfo = Option.some({
					index,
					depth: node.depth,
				});
				continue;
			}
			if (
				Option.filter(headingStartInfo, (info) => info.depth === node.depth).pipe(Option.isSome)
			) {
				endIndex = Option.some(index);
				break;
			}
		}
	}

	return Option.map(
		headingStartInfo,
		(headingStartInfo) =>
			new Entry({
				version,
				changes: unified()
					.use(remarkStringify)
					.stringify({
						...changelog.ast,
						children: changelog.ast.children.slice(
							headingStartInfo.index + 1,
							Option.getOrUndefined(endIndex)
						),
					}),
			})
	);
}
