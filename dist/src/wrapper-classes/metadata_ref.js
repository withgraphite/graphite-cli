"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const config_1 = require("../lib/config");
const errors_1 = require("../lib/errors");
class MetadataRef {
    constructor(branchName) {
        this._branchName = branchName;
    }
    static branchMetadataDirPath() {
        return path_1.default.join(config_1.getRepoRootPath(), `refs/branch-metadata/`);
    }
    static pathForBranchName(branchName) {
        return path_1.default.join(MetadataRef.branchMetadataDirPath(), branchName);
    }
    static getMeta(branchName) {
        return new MetadataRef(branchName).read();
    }
    static updateOrCreate(branchName, meta) {
        const metaSha = child_process_1.execSync(`git hash-object -w --stdin`, {
            input: JSON.stringify(meta),
        }).toString();
        child_process_1.execSync(`git update-ref refs/branch-metadata/${branchName} ${metaSha}`, {
            stdio: "ignore",
        });
    }
    getPath() {
        return MetadataRef.pathForBranchName(this._branchName);
    }
    rename(newBranchName) {
        if (!fs_extra_1.default.existsSync(this.getPath())) {
            throw new errors_1.ExitFailedError(`No Graphite metadata ref found at ${this.getPath()}`);
        }
        fs_extra_1.default.moveSync(path_1.default.join(this.getPath()), path_1.default.join(path_1.default.dirname(this.getPath()), newBranchName));
        this._branchName = newBranchName;
    }
    read() {
        try {
            const metaString = child_process_1.execSync(`git cat-file -p refs/branch-metadata/${this._branchName} 2> /dev/null`)
                .toString()
                .trim();
            if (metaString.length == 0) {
                return undefined;
            }
            // TODO: Better account for malformed desc; possibly validate with retype
            const meta = JSON.parse(metaString);
            return meta;
        }
        catch (_a) {
            return undefined;
        }
    }
    delete() {
        fs_extra_1.default.removeSync(this.getPath());
    }
    static allMetadataRefs() {
        if (!fs_extra_1.default.existsSync(MetadataRef.branchMetadataDirPath())) {
            return [];
        }
        return fs_extra_1.default
            .readdirSync(MetadataRef.branchMetadataDirPath())
            .map((dirent) => new MetadataRef(dirent));
    }
}
exports.default = MetadataRef;
//# sourceMappingURL=metadata_ref.js.map