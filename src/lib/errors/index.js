"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.KilledError = exports.MultiParentError = exports.SiblingBranchError = exports.ExitCancelledError = exports.ConfigError = exports.ValidationFailedError = exports.RebaseConflictError = exports.PreconditionsFailedError = exports.ExitFailedError = exports.ExitError = void 0;
var merge_conflict_callstack_config_1 = require("../config/merge_conflict_callstack_config");
var ExitError = /** @class */ (function (_super) {
    __extends(ExitError, _super);
    function ExitError() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ExitError;
}(Error));
exports.ExitError = ExitError;
var ExitCancelledError = /** @class */ (function (_super) {
    __extends(ExitCancelledError, _super);
    function ExitCancelledError(message) {
        var _this = _super.call(this, message) || this;
        _this.name = 'ExitCancelled';
        return _this;
    }
    return ExitCancelledError;
}(ExitError));
exports.ExitCancelledError = ExitCancelledError;
var ExitFailedError = /** @class */ (function (_super) {
    __extends(ExitFailedError, _super);
    function ExitFailedError(message, err) {
        var _this = this;
        err
            ? _this = _super.call(this, [
                message,
                err
                    .toString()
                    .trim()
                    .split('\n')
                    .map(function (line) { return "> " + line; })
                    .join('\n'),
            ].join('\n')) || this : _this = _super.call(this, message) || this;
        _this.name = 'ExitFailed';
        return _this;
    }
    return ExitFailedError;
}(ExitError));
exports.ExitFailedError = ExitFailedError;
var RebaseConflictError = /** @class */ (function (_super) {
    __extends(RebaseConflictError, _super);
    function RebaseConflictError(message, callstack) {
        var _this = _super.call(this, message) || this;
        _this.name = 'RebaseConflict';
        merge_conflict_callstack_config_1.persistMergeConflictCallstack(callstack);
        return _this;
    }
    return RebaseConflictError;
}(ExitError));
exports.RebaseConflictError = RebaseConflictError;
var ValidationFailedError = /** @class */ (function (_super) {
    __extends(ValidationFailedError, _super);
    function ValidationFailedError(message) {
        var _this = _super.call(this, message) || this;
        _this.name = 'ValidationFailed';
        return _this;
    }
    return ValidationFailedError;
}(ExitError));
exports.ValidationFailedError = ValidationFailedError;
var PreconditionsFailedError = /** @class */ (function (_super) {
    __extends(PreconditionsFailedError, _super);
    function PreconditionsFailedError(message) {
        var _this = _super.call(this, message) || this;
        _this.name = 'PreconditionsFailed';
        return _this;
    }
    return PreconditionsFailedError;
}(ExitError));
exports.PreconditionsFailedError = PreconditionsFailedError;
var ConfigError = /** @class */ (function (_super) {
    __extends(ConfigError, _super);
    function ConfigError(message) {
        var _this = _super.call(this, message) || this;
        _this.name = 'Config';
        return _this;
    }
    return ConfigError;
}(ExitError));
exports.ConfigError = ConfigError;
var KilledError = /** @class */ (function (_super) {
    __extends(KilledError, _super);
    function KilledError() {
        var _this = _super.call(this, "User killed Graphite early") || this;
        _this.name = 'Killed';
        return _this;
    }
    return KilledError;
}(ExitError));
exports.KilledError = KilledError;
var SiblingBranchError = /** @class */ (function (_super) {
    __extends(SiblingBranchError, _super);
    function SiblingBranchError(branches) {
        var _this = _super.call(this, __spreadArrays([
            "Multiple branches pointing to commit " + branches[0].ref() + ".",
            "Graphite cannot infer parent-child relationships between identical branches.",
            "Please add a commit to one, or delete one to continue:"
        ], branches.map(function (b) { return "-> (" + b.name + ")"; })).join('\n')) || this;
        _this.name = "SiblingBranchError";
        return _this;
    }
    return SiblingBranchError;
}(ExitError));
exports.SiblingBranchError = SiblingBranchError;
var MultiParentError = /** @class */ (function (_super) {
    __extends(MultiParentError, _super);
    function MultiParentError(branch, parents) {
        var _this = _super.call(this, __spreadArrays([
            "Multiple git commit parents detected for " + branch.name + ".",
            "Graphite does not support multi-parent branches in stacks.",
            "Please adjust the git commit tree or delete one of the parents:"
        ], parents.map(function (b) { return "-> (" + b.name + ")"; })).join('\n')) || this;
        _this.name = "ParentBranchError";
        return _this;
    }
    return MultiParentError;
}(ExitError));
exports.MultiParentError = MultiParentError;
