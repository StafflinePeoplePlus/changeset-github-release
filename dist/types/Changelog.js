import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import { toString as mdastToString } from 'mdast-util-to-string';
import { Data, Effect, Option } from 'effect';
import * as FileSystem from '@effect/platform/FileSystem';
export class Changelog extends Data.Class {
}
export class Entry extends Data.Class {
}
const parseChangelog = (changelog) => Effect.try(() => unified().use(remarkParse).parse(changelog));
export const read = (path) => FileSystem.FileSystem.pipe(Effect.flatMap((fs) => fs.readFileString(path)), Effect.flatMap(parseChangelog), Effect.map((ast) => new Changelog({ ast })));
// Heavily modified from https://github.com/changesets/action/blob/c62ef9792fd0502c89479ed856efe28575010472/src/utils.ts#L37
export const findEntry = (changelog, version) => {
    let headingStartInfo = Option.none();
    let endIndex = Option.none();
    for (const [index, node] of changelog.ast.children.entries()) {
        if (node.type === 'heading') {
            const stringified = mdastToString(node);
            if (Option.isNone(headingStartInfo) && stringified === version) {
                headingStartInfo = Option.some({
                    index,
                    depth: node.depth,
                });
                continue;
            }
            if (Option.filter(headingStartInfo, (info) => info.depth === node.depth).pipe(Option.isSome)) {
                endIndex = Option.some(index);
                break;
            }
        }
    }
    return Option.map(headingStartInfo, (headingStartInfo) => new Entry({
        version,
        changes: unified()
            .use(remarkStringify)
            .stringify({
            ...changelog.ast,
            children: changelog.ast.children.slice(headingStartInfo.index + 1, Option.getOrUndefined(endIndex)),
        }),
    }));
};
