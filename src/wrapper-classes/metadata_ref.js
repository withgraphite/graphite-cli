"use strict";
exports.__esModule = true;
var child_process_1 = require("child_process");
var fs_extra_1 = require("fs-extra");
var path_1 = require("path");
var config_1 = require("../lib/config");
var errors_1 = require("../lib/errors");
var MetadataRef = /** @class */ (function () {
    function MetadataRef(branchName) {
        this._branchName = branchName;
    }
    MetadataRef.branchMetadataDirPath = function () {
        return path_1["default"].join(config_1.getRepoRootPath(), "refs/branch-metadata/");
    };
    MetadataRef.pathForBranchName = function (branchName) {
        return path_1["default"].join(MetadataRef.branchMetadataDirPath(), branchName);
    };
    MetadataRef.getMeta = function (branchName) {
        return new MetadataRef(branchName).read();
    };
    MetadataRef.updateOrCreate = function (branchName, meta) {
        var metaSha = child_process_1.execSync("git hash-object -w --stdin", {
            input: JSON.stringify(meta)
        }).toString();
        child_process_1.execSync("git update-ref refs/branch-metadata/" + branchName + " " + metaSha, {
            stdio: 'ignore'
        });
    };
    MetadataRef.prototype.getPath = function () {
        return MetadataRef.pathForBranchName(this._branchName);
    };
    MetadataRef.prototype.rename = function (newBranchName) {
        if (!fs_extra_1["default"].existsSync(this.getPath())) {
            throw new errors_1.ExitFailedError("No Graphite metadata ref found at " + this.getPath());
        }
        fs_extra_1["default"].moveSync(path_1["default"].join(this.getPath()), path_1["default"].join(path_1["default"].dirname(this.getPath()), newBranchName));
        this._branchName = newBranchName;
    };
    MetadataRef.prototype.read = function () {
        try {
            var metaString = child_process_1.execSync("git cat-file -p refs/branch-metadata/" + this._branchName + " 2> /dev/null")
                .toString()
                .trim();
            if (metaString.length == 0) {
                return undefined;
            }
            // TODO: Better account for malformed desc; possibly validate with retype
            var meta = JSON.parse(metaString);
            return meta;
        }
        catch (_a) {
            return undefined;
        }
    };
    MetadataRef.prototype["delete"] = function () {
        fs_extra_1["default"].removeSync(this.getPath());
    };
    MetadataRef.allMetadataRefs = function () {
        if (!fs_extra_1["default"].existsSync(MetadataRef.branchMetadataDirPath())) {
            return [];
        }
        return fs_extra_1["default"]
            .readdirSync(MetadataRef.branchMetadataDirPath())
            .map(function (dirent) { return new MetadataRef(dirent); });
    };
    return MetadataRef;
}());
exports["default"] = MetadataRef;
