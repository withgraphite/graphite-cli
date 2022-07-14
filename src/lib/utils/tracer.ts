// https://docs.datadoghq.com/api/latest/tracing/
import { cuteString } from './cute_string';

// feel free to add to either of these if necessary
type spanNameT = 'execSync' | 'command';
type spanReturnT = string | Record<string, string> | undefined;

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

class Span {
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

  end(result?: spanReturnT, err?: Error): void {
    this.endedSpan = {
      error: err ? 1 : 0,
      meta: {
        ...(typeof result === 'string' ? { result } : { ...result }),
        ...(err
          ? {
              'error.msg': err.message,
              'error.type': err.constructor.name,
              ...(err.stack ? { 'error.stack': err.stack } : {}),
            }
          : {}),
        ...this.meta,
      },
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

  public spanSync<T extends spanReturnT>(
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
    } catch (err) {
      span.end(result, err);
      throw err;
    }
    span.end(result);
    this.currentSpanId = span.parentId;
    return result;
  }

  public async span<T extends spanReturnT>(
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
    } catch (err) {
      span.end(result, err);
      throw err;
    }
    span.end(result);
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
    return cuteString(traces);
  }
}

export const tracer = new Tracer();
