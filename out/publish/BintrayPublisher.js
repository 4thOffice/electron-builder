"use strict";

const bluebird_1 = require("bluebird");
const restApiRequest_1 = require("./restApiRequest");
const uploader_1 = require("./uploader");
const log_1 = require("../util/log");
const util_1 = require("../util/util");
const path_1 = require("path");
const fs_extra_p_1 = require("fs-extra-p");
const bintray_1 = require("./bintray");
//noinspection JSUnusedLocalSymbols
const __awaiter = require("../util/awaiter");
class BintrayPublisher {
    constructor(info, version, options) {
        this.info = info;
        this.version = version;
        this.options = options;
        this.client = new bintray_1.BintrayClient(info.user, info.packageName, info.repo || "generic", options.bintrayToken);
        this._versionPromise = this.init();
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.client.getVersion(this.version);
            } catch (e) {
                if (e instanceof restApiRequest_1.HttpError && e.response.statusCode === 404) {
                    if (this.options.publish !== "onTagOrDraft") {
                        log_1.log(`Version ${ this.version } doesn't exist, creating one`);
                        return this.client.createVersion(this.version);
                    } else {
                        log_1.log(`Version ${ this.version } doesn't exist, artifacts will be not published`);
                    }
                }
                throw e;
            }
        });
    }
    upload(file, artifactName) {
        return __awaiter(this, void 0, void 0, function* () {
            const fileName = artifactName || path_1.basename(file);
            const version = yield this._versionPromise;
            if (version == null) {
                util_1.debug(`Version ${ this.version } doesn't exist and is not created, artifact ${ fileName } is not published`);
                return;
            }
            const fileStat = yield fs_extra_p_1.stat(file);
            let badGatewayCount = 0;
            for (let i = 0; i < 3; i++) {
                try {
                    return yield restApiRequest_1.doApiRequest({
                        hostname: "api.bintray.com",
                        path: `/content/${ this.client.user }/${ this.client.repo }/${ this.client.packageName }/${ version.name }/${ fileName }`,
                        method: "PUT",
                        headers: {
                            "User-Agent": "electron-builder",
                            "Content-Length": fileStat.size,
                            "X-Bintray-Override": "1",
                            "X-Bintray-Publish": "1"
                        }
                    }, this.client.auth, uploader_1.uploadFile.bind(this, file, fileStat, fileName));
                } catch (e) {
                    if (e instanceof restApiRequest_1.HttpError && e.response.statusCode === 502 && badGatewayCount++ < 3) {
                        continue;
                    }
                    throw e;
                }
            }
        });
    }
    //noinspection JSUnusedGlobalSymbols
    deleteRelease() {
        if (!this._versionPromise.isFulfilled()) {
            return bluebird_1.Promise.resolve();
        }
        const version = this._versionPromise.value();
        return version == null ? bluebird_1.Promise.resolve() : this.client.deleteVersion(version.name);
    }
}
exports.BintrayPublisher = BintrayPublisher;
//# sourceMappingURL=BintrayPublisher.js.map