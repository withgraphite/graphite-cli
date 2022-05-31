"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetadataRef = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const errors_1 = require("../lib/errors");
const preconditions_1 = require("../lib/preconditions");
const exec_sync_1 = require("../lib/utils/exec_sync");
class MetadataRef {
    constructor(branchName) {
        this._branchName = branchName;
    }
    static branchMetadataDirPath() {
        return path_1.default.join(preconditions_1.getRepoRootPathPrecondition(), `refs/branch-metadata/`);
    }
    static pathForBranchName(branchName) {
        return path_1.default.join(MetadataRef.branchMetadataDirPath(), branchName);
    }
    static getMeta(branchName, opts) {
        return new MetadataRef(branchName).read(opts);
    }
    static updateOrCreate(branchName, meta, opts) {
        const metaSha = exec_sync_1.gpExecSync({
            command: `git ${opts ? `-C "${opts.dir}"` : ''} hash-object -w --stdin`,
            options: {
                input: JSON.stringify(meta),
            },
        });
        exec_sync_1.gpExecSync({
            command: `git update-ref refs/branch-metadata/${branchName} ${metaSha}`,
            options: {
                stdio: 'ignore',
            },
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
    read(opts) {
        return MetadataRef.readImpl(`refs/branch-metadata/${this._branchName}`, opts);
    }
    static readImpl(ref, opts) {
        const metaString = exec_sync_1.gpExecSync({
            command: `git ${opts ? `-C "${opts.dir}"` : ''}cat-file -p ${ref} 2> /dev/null`,
        });
        if (metaString.length == 0) {
            return undefined;
        }
        // TODO: Better account for malformed desc; possibly validate with retype
        const meta = JSON.parse(metaString);
        return meta;
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
exports.MetadataRef = MetadataRef;
//# sourceMappingURL=metadata_ref.js.map