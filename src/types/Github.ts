import { Context, Data, Effect, Option } from 'effect';
import { Octokit as OctokitClient } from '@octokit/core';
import { RequestError as OctokitRequestError } from '@octokit/request-error';
import { Schema as S } from '@effect/schema';
import { UnknownException } from 'effect/Cause';

const headers = { 'X-GitHub-Api-Version': '2022-11-28' };

export class RequestError {
	_tag = 'RequestError';
	constructor(public original: OctokitRequestError) {}

	get status() {
		return this.original.status;
	}
}

export class Octokit extends Context.Tag('Octokit')<Octokit, OctokitClient>() {}

export class RepoRef extends Data.Class<{ owner: string; repo: string }> {}

export class Release extends S.Class<Release>('Release')({
	id: S.Number,
	html_url: S.String,
}) {}

export const repo = (owner: string, repo: string) => new RepoRef({ owner, repo });

export const releaseByTagName = (repo: RepoRef, tag: string) =>
	Octokit.pipe(
		Effect.flatMap((octokit) =>
			Effect.tryPromise({
				try: (signal) =>
					octokit.request('GET /repos/{owner}/{repo}/releases/tags/{tag}', {
						...repo,
						tag,
						headers,
						request: { signal },
					}),
				catch: (error) =>
					error instanceof OctokitRequestError
						? new RequestError(error)
						: new UnknownException(error),
			})
		),
		Effect.map((response) => response.data),
		Effect.flatMap(S.decode(Release)),
		Effect.asSome,
		Effect.catchIf(
			(error) => error instanceof RequestError && error.status === 404,
			() => Effect.succeed(Option.none())
		)
	);

export const createRelease = (repo: RepoRef, tag: string, name: string, body: string) =>
	Octokit.pipe(
		Effect.flatMap((octokit) =>
			Effect.tryPromise({
				try: (signal) =>
					octokit.request('POST /repos/{owner}/{repo}/releases', {
						...repo,
						tag_name: tag,
						name,
						body,
						headers,
						request: { signal },
					}),
				catch: (error) =>
					error instanceof OctokitRequestError
						? new RequestError(error)
						: new UnknownException(error),
			})
		),
		Effect.map((response) => response.data),
		Effect.flatMap(S.decode(Release))
	);
