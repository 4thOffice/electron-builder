"use strict";

const os_1 = require("os");
const fs_extra_p_1 = require("fs-extra-p");
const path = require("path");
const util_1 = require("./util");
const bluebird_1 = require("bluebird");
const log_1 = require("./log");
//noinspection JSUnusedLocalSymbols
const __awaiter = require("./awaiter");
const mkdtemp = util_1.use(require("fs").mkdtemp, it => bluebird_1.Promise.promisify(it));
class TmpDir {
    constructor() {
        this.tmpFileCounter = 0;
    }
    getTempFile(suffix) {
        if (this.tempDirectoryPromise == null) {
            let promise;
            if (mkdtemp == null) {
                const dir = path.join(os_1.tmpdir(), util_1.getTempName("electron-builder"));
                promise = fs_extra_p_1.mkdirs(dir, { mode: 448 }).thenReturn(dir);
            } else {
                promise = mkdtemp(`${ path.join(os_1.tmpdir(), "electron-builder") }-`);
            }
            this.tempDirectoryPromise = promise.then(dir => {
                this.dir = dir;
                process.on("SIGINT", () => {
                    if (this.dir == null) {
                        return;
                    }
                    this.dir = null;
                    try {
                        fs_extra_p_1.removeSync(dir);
                    } catch (e) {
                        if (e.code !== "EPERM") {
                            log_1.warn(`Cannot delete temporary dir "${ dir }": ${ (e.stack || e).toString() }`);
                        }
                    }
                });
                return dir;
            });
        }
        return this.tempDirectoryPromise.then(it => path.join(it, `temp-${ (this.tmpFileCounter++).toString(16) }${ suffix.startsWith(".") ? suffix : `-${ suffix }` }`));
    }
    cleanup() {
        if (this.dir == null) {
            return bluebird_1.Promise.resolve();
        }
        return fs_extra_p_1.remove(this.dir).then(() => {
            this.dir = null;
        }).catch(e => {
            if (e.code !== "EPERM") {
                log_1.warn(`Cannot delete temporary dir "${ this.dir }": ${ (e.stack || e).toString() }`);
            }
        });
    }
}
exports.TmpDir = TmpDir;
//# sourceMappingURL=tmp.js.map