import { FileSystem } from '@effect/platform';
import { Schema as S } from '@effect/schema';
import { Brand, Effect } from 'effect';

export type Version = string & Brand.Brand<'Package.Version'>;
export const Version = Brand.nominal<Version>();
const versionSchema = S.String.pipe(S.fromBrand(Version));

export class Info extends S.Class<Info>('Package.Info')({
	name: S.String,
	version: versionSchema,
}) {}

const decodeInfo = S.decodeUnknown(Info);

export const readInfo = (path: string) =>
	FileSystem.FileSystem.pipe(
		Effect.flatMap((fs) => fs.readFileString(path)),
		Effect.flatMap((s) => Effect.try(() => JSON.parse(s))),
		Effect.flatMap(decodeInfo)
	);
