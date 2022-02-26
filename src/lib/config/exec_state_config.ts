type ExecStateConfigT = {
  outputDebugLogs?: boolean;
  quiet?: boolean;
  noVerify?: boolean;
  interactive?: boolean;
};

/**
 * An in-memory object that configures global settings for the current
 * invocation of the Graphite CLI.
 */
class ExecStateConfig {
  _data: ExecStateConfigT;

  constructor() {
    this._data = {};
  }

  setOutputDebugLogs(outputDebugLogs: boolean): this {
    this._data.outputDebugLogs = outputDebugLogs;
    return this;
  }

  outputDebugLogs(): boolean {
    return this._data.outputDebugLogs ?? false;
  }

  setQuiet(quiet: boolean): this {
    this._data.quiet = quiet;
    return this;
  }

  quiet(): boolean {
    return this._data.quiet ?? false;
  }

  setNoVerify(noVerify: boolean): this {
    this._data.noVerify = noVerify;
    return this;
  }

  noVerify(): boolean {
    return this._data.noVerify ?? false;
  }

  setInteractive(interactive: boolean): this {
    this._data.interactive = interactive;
    return this;
  }

  interactive(): boolean {
    return this._data.interactive ?? true;
  }
}

export const execStateConfig = new ExecStateConfig();
