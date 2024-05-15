import * as FileSystem from '@effect/platform/FileSystem';
import { Schema as S } from '@effect/schema';
import { Brand, Effect } from 'effect';
export const Version = Brand.nominal();
const versionSchema = S.String.pipe(S.fromBrand(Version));
export class Info extends S.Class('Package.Info')({
    name: S.String,
    version: versionSchema,
}) {
}
const decodeInfo = S.decodeUnknown(Info);
export const readInfo = (path) => FileSystem.FileSystem.pipe(Effect.flatMap((fs) => fs.readFileString(path)), Effect.flatMap((s) => Effect.try(() => JSON.parse(s))), Effect.flatMap(decodeInfo));
