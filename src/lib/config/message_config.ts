import chalk from "chalk";
import fs from "fs-extra";
import os from "os";
import path from "path";

const CONFIG_NAME = ".graphite_upgrade_message";
const MESSAGE_CONFIG_PATH = path.join(os.homedir(), CONFIG_NAME);

type TMessageConfig = {
  message?: TMessage;
};

type TMessage = { contents: string; cliVersion: string };

class MessageConfig {
  _data: TMessageConfig;

  constructor(data: TMessageConfig) {
    this._data = data;
  }
  public setMessage(message: TMessage | undefined): void {
    console.log(`Setting the message to: ${message}`);
    this._data.message = message;
    this.save();
  }

  public getMessage(): TMessage | undefined {
    return this._data.message;
  }

  public path(): string {
    return MESSAGE_CONFIG_PATH;
  }

  private save(): void {
    if (this._data.message !== undefined) {
      fs.writeFileSync(MESSAGE_CONFIG_PATH, JSON.stringify(this._data));
      return;
    }

    if (fs.existsSync(MESSAGE_CONFIG_PATH)) {
      fs.unlinkSync(MESSAGE_CONFIG_PATH);
      return;
    }
  }
}

function readMessageConfig(): MessageConfig {
  if (fs.existsSync(MESSAGE_CONFIG_PATH)) {
    const raw = fs.readFileSync(MESSAGE_CONFIG_PATH);
    try {
      const parsedConfig = JSON.parse(raw.toString().trim()) as TMessageConfig;
      return new MessageConfig(parsedConfig);
    } catch (e) {
      console.log(chalk.yellow(`Warning: Malformed ${MESSAGE_CONFIG_PATH}`));
    }
  }
  return new MessageConfig({});
}

export function readMessageConfigForTestingOnly(): MessageConfig {
  return readMessageConfig();
}

const messageConfigSingleton = readMessageConfig();
export default messageConfigSingleton;
