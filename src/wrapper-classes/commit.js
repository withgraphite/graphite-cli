"use strict";
exports.__esModule = true;
var child_process_1 = require("child_process");
var utils_1 = require("../lib/utils");
var Commit = /** @class */ (function () {
    function Commit(sha) {
        if (sha.length != 40) {
            throw new Error("Commit sha must be 40 characters long. Attempted sha = \"" + sha + "\"");
        }
        this.sha = sha;
    }
    Commit.prototype.parents = function () {
        try {
            return child_process_1.execSync("git rev-parse " + this.sha)
                .toString()
                .trim()
                .split('\n')
                .map(function (parentSha) { return new Commit(parentSha); });
        }
        catch (e) {
            return [];
        }
    };
    Commit.prototype.messageImpl = function (format) {
        var message = utils_1.gpExecSync({
            command: "git log --format=%" + format + " -n 1 " + this.sha + " --"
        }, function (_) {
            // just soft-fail if we can't find the commits
            return Buffer.alloc(0);
        })
            .toString()
            .trim();
        return message;
    };
    Commit.prototype.messageRaw = function () {
        return this.messageImpl('B');
    };
    Commit.prototype.messageSubject = function () {
        return this.messageImpl('s');
    };
    Commit.prototype.messageBody = function () {
        return this.messageImpl('b');
    };
    return Commit;
}());
exports["default"] = Commit;
