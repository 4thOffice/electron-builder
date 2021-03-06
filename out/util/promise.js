"use strict";

const bluebird_1 = require("bluebird");
const chalk_1 = require("chalk");
//noinspection JSUnusedLocalSymbols
const __awaiter = require("./awaiter");
function printErrorAndExit(error) {
    console.error(chalk_1.red((error.stack || error).toString()));
    process.exit(-1);
}
exports.printErrorAndExit = printErrorAndExit;
// you don't need to handle error in your task - it is passed only indicate status of promise
function executeFinally(promise, task) {
    return __awaiter(this, void 0, void 0, function* () {
        let result = null;
        try {
            result = yield promise;
        } catch (originalError) {
            try {
                yield task(true);
            } catch (taskError) {
                throw new NestedError([originalError, taskError]);
            }
            throw originalError;
        }
        try {
            yield task(false);
        } catch (taskError) {
            throw taskError;
        }
        return result;
    });
}
exports.executeFinally = executeFinally;
class NestedError extends Error {
    constructor(errors) {
        let message = arguments.length <= 1 || arguments[1] === undefined ? "Compound error: " : arguments[1];

        let m = message;
        let i = 1;
        for (let error of errors) {
            const prefix = "Error #" + i++ + " ";
            m += "\n\n" + prefix + "-".repeat(80) + "\n" + error.stack;
        }
        super(m);
    }
}
exports.NestedError = NestedError;
function all(promises) {
    const errors = [];
    return bluebird_1.Promise.all(promises.map(it => it.catch(it => errors.push(it)))).then(() => {
        if (errors.length === 1) {
            throw errors[0];
        } else if (errors.length > 1) {
            throw new NestedError(errors, "Cannot cleanup: ");
        }
    });
}
exports.all = all;
//# sourceMappingURL=promise.js.map