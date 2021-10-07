import fs from "fs-extra";
import os from "os";
import path from "path";
import { SurveyResponseT } from "../telemetry/survey";

const SURVEY_CONFIG_NAME = ".graphite_beta_survey";
const SURVEY_CONFIG_PATH = path.join(os.homedir(), SURVEY_CONFIG_NAME);

type TSurveyConfig = {
  responses: SurveyResponseT | undefined;
  postingResponse: boolean;
};

class SurveyConfig {
  _data: TSurveyConfig;

  constructor(data: TSurveyConfig) {
    this._data = data;
  }

  public setSurveyResponses(responses: SurveyResponseT): void {
    this._data.responses = responses;
    this.save();
  }

  public path(): string {
    return SURVEY_CONFIG_PATH;
  }

  private save(): void {
    if (this._data.responses !== undefined) {
      fs.writeFileSync(SURVEY_CONFIG_PATH, JSON.stringify(this._data));
      return;
    }

    // If we've reached this point, the survey config fields are empty - so we
    // clean up the now unnecessary file.
    SurveyConfig.delete();
  }

  static delete(): void {
    if (fs.existsSync(SURVEY_CONFIG_PATH)) {
      fs.unlinkSync(SURVEY_CONFIG_PATH);
      return;
    }
  }
}

function readSurveyConfig(): SurveyConfig {
  if (fs.existsSync(SURVEY_CONFIG_PATH)) {
    const raw = fs.readFileSync(SURVEY_CONFIG_PATH);
    try {
      const parsedConfig = JSON.parse(raw.toString().trim()) as TSurveyConfig;
      return new SurveyConfig(parsedConfig);
    } catch (e) {
      // There was some error so just silently clean up the file - hopefully
      // we'll fix the malformed survey config on the next creation/save.
      SurveyConfig.delete();
    }
  }
  return new SurveyConfig({
    responses: undefined,
    postingResponse: false,
  });
}

const surveyConfigSingleton = readSurveyConfig();
export default surveyConfigSingleton;
