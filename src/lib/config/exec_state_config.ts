type ExecStateConfigT = {
  outputDebugLogs?: boolean;
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

  setOutputDebugLogs(outputDebugLogs: boolean): void {
    this._data.outputDebugLogs = outputDebugLogs;
  }

  outputDebugLogs(): boolean {
    return this._data.outputDebugLogs ?? false;
  }
}

const execStateConfig = new ExecStateConfig();
export default execStateConfig;
