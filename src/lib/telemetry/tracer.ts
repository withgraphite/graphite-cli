// https://docs.datadoghq.com/api/latest/tracing/
import { request } from '@screenplaydev/retyped-routes';
import graphiteCLIRoutes from 'graphite-cli-routes';
import { version } from '../../../package.json';
import { API_SERVER } from '../api';

type spanNameT = 'function' | 'execSync' | 'command';

type spanT = {
  duration: number;
  error: number;
  meta?: Record<string, string>;
  metrics: Record<string, number>;
  name: spanNameT;
  parent_id?: number;
  resource: string;
  service: 'graphite-cli';
  span_id: number;
  start: number;
  trace_id: number;
  type: 'custom';
};

const traceId = generateId();

function generateId(): number {
  return Math.ceil(Math.random() * 1000000000);
}

function notUndefined<TValue>(
  value: TValue | null | undefined
): value is TValue {
  return value !== null && value !== undefined;
}

function currentNanoSeconds(): number {
  const hrTime = process.hrtime();
  return hrTime[0] * 1000000000 + hrTime[1];
}

export class Span {
  name: spanNameT;
  parentId?: number;
  resource: string;
  spanId: number;
  start: number;
  meta?: Record<string, string>;

  endedSpan: spanT | undefined;

  constructor(opts: {
    resource: string;
    name: spanNameT;
    parentId?: number;
    meta?: Record<string, string>;
  }) {
    this.name = opts.name;
    this.parentId = opts.parentId;
    this.resource = opts.resource;
    this.meta = opts.meta;
    this.spanId = generateId();
    this.start = currentNanoSeconds();
  }

  end(err?: Error): void {
    this.endedSpan = {
      error: err ? 1 : 0,
      meta: err
        ? {
            'error.msg': err.message,
            'error.type': err.constructor.name,
            ...(err.stack ? { 'error.stack': err.stack } : {}),
            ...this.meta,
          }
        : this.meta,
      metrics: {},
      name: this.name,
      resource: this.resource,
      service: 'graphite-cli',
      span_id: this.spanId,
      start: Math.round(this.start),
      trace_id: traceId,
      type: 'custom',
      duration: Math.round(currentNanoSeconds() - this.start),
      ...(this.parentId ? { parent_id: this.parentId } : { parent_id: 0 }),
    };
  }
}

class Tracer {
  currentSpanId: number | undefined;
  allSpans: Span[] = [];

  public startSpan(opts: {
    resource: string;
    name: spanNameT;
    meta?: Record<string, string>;
  }) {
    const span = new Span({
      ...opts,
      ...(this.currentSpanId ? { parentId: this.currentSpanId } : {}),
    });
    this.allSpans.push(span);
    return span;
  }

  public spanSync<T>(
    opts: {
      resource: string;
      name: spanNameT;
      meta?: Record<string, string>;
    },
    handler: () => T
  ) {
    const span = this.startSpan(opts);
    this.currentSpanId = span.spanId;
    let result;
    try {
      result = handler();
    } catch (err: any) {
      span.end(err);
      throw err;
    }
    span.end();
    this.currentSpanId = span.parentId;
    return result;
  }

  public async span<T>(
    opts: {
      resource: string;
      name: spanNameT;
      meta?: Record<string, string>;
    },
    handler: () => Promise<T>
  ) {
    const span = this.startSpan(opts);
    this.currentSpanId = span.spanId;
    let result;
    try {
      result = await handler();
    } catch (err: any) {
      span.end(err);
      throw err;
    }
    span.end();
    this.currentSpanId = span.parentId;
    return result;
  }

  public flushJson(): string {
    let trace: spanT[] = this.allSpans
      .map((s) => s.endedSpan)
      .filter(notUndefined);

    // Set the parent id to the command if any are unset
    const rootSpanId = trace.find((span) => span.name == 'command');
    if (rootSpanId) {
      trace = trace.map((s) => {
        return {
          ...s,
          ...(s.parent_id != undefined
            ? { parent_id: s.parent_id }
            : { parent_id: rootSpanId.span_id }),
        };
      });
    }

    const traces = [trace];
    this.allSpans = this.allSpans.filter((s) => !s.endedSpan);
    return JSON.stringify(traces);
  }

  public async flush(): Promise<void> {
    if (process.env.NODE_ENV !== 'development') {
      await request.requestWithArgs(API_SERVER, graphiteCLIRoutes.traces, {
        cliVersion: version,
        jsonTraces: this.flushJson(),
      });
    }
  }
}

const globalTracer = new Tracer();

export default globalTracer;
