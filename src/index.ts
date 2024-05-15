import { Effect } from 'effect';
import { cli } from './cli.js';
import { NodeContext, NodeRuntime } from '@effect/platform-node';

console.log(process.argv);
cli(process.argv).pipe(Effect.provide(NodeContext.layer), NodeRuntime.runMain);
