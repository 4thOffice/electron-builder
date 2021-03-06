"use strict";

const packager_1 = require("./packager");
const gitHubPublisher_1 = require("./publish/gitHubPublisher");
const promise_1 = require("./util/promise");
const bluebird_1 = require("bluebird");
const util_1 = require("./util/util");
const log_1 = require("./util/log");
const metadata_1 = require("./metadata");
const repositoryInfo_1 = require("./repositoryInfo");
const targetFactory_1 = require("./targets/targetFactory");
const BintrayPublisher_1 = require("./publish/BintrayPublisher");
//noinspection JSUnusedLocalSymbols
const __awaiter = require("./util/awaiter");
function addValue(map, key, value) {
    const list = map.get(key);
    if (list == null) {
        map.set(key, [value]);
    } else {
        list.push(value);
    }
}
function normalizeOptions(args) {
    if (args.targets != null) {
        return args;
    }
    let targets = new Map();
    function processTargets(platform, types) {
        if (args.platform != null) {
            throw new Error(`--platform cannot be used if --${ platform.buildConfigurationKey } is passed`);
        }
        if (args.arch != null) {
            throw new Error(`--arch cannot be used if --${ platform.buildConfigurationKey } is passed`);
        }
        function commonArch() {
            if (args.ia32 && args.x64) {
                return [metadata_1.Arch.x64, metadata_1.Arch.ia32];
            } else if (args.ia32) {
                return [metadata_1.Arch.ia32];
            } else if (args.x64) {
                return [metadata_1.Arch.x64];
            } else {
                return [metadata_1.archFromString(process.arch)];
            }
        }
        let archToType = targets.get(platform);
        if (archToType == null) {
            archToType = new Map();
            targets.set(platform, archToType);
        }
        if (types.length === 0) {
            const defaultTargetValue = args.dir ? [targetFactory_1.DIR_TARGET] : [];
            if (platform === metadata_1.Platform.MAC) {
                archToType.set(metadata_1.Arch.x64, defaultTargetValue);
            } else {
                for (let arch of commonArch()) {
                    archToType.set(arch, defaultTargetValue);
                }
            }
            return;
        }
        for (let type of types) {
            let arch;
            if (platform === metadata_1.Platform.MAC) {
                arch = "x64";
                addValue(archToType, metadata_1.Arch.x64, type);
            } else {
                const suffixPos = type.lastIndexOf(":");
                if (suffixPos > 0) {
                    addValue(archToType, metadata_1.archFromString(type.substring(suffixPos + 1)), type.substring(0, suffixPos));
                } else {
                    for (let arch of commonArch()) {
                        addValue(archToType, arch, type);
                    }
                }
            }
        }
    }
    if (args.mac != null) {
        processTargets(metadata_1.Platform.MAC, args.mac);
    }
    if (args.linux != null) {
        processTargets(metadata_1.Platform.LINUX, args.linux);
    }
    if (args.win != null) {
        processTargets(metadata_1.Platform.WINDOWS, args.win);
    }
    if (targets.size === 0) {
        if (args.platform == null && args.arch == null) {
            processTargets(metadata_1.Platform.current(), []);
        } else {
            targets = createTargets(packager_1.normalizePlatforms(args.platform), args.dir ? targetFactory_1.DIR_TARGET : null, args.arch);
        }
    }
    const result = Object.assign({}, args);
    result.targets = targets;
    delete result.dir;
    delete result.mac;
    delete result.linux;
    delete result.win;
    delete result.platform;
    delete result.arch;
    const r = result;
    delete r.em;
    delete r.m;
    delete r.o;
    delete r.l;
    delete r.w;
    delete r.windows;
    delete r.osx;
    delete r.macos;
    delete r.$0;
    delete r._;
    delete r.version;
    delete r.help;
    delete result.ia32;
    delete result.x64;
    return result;
}
exports.normalizeOptions = normalizeOptions;
function createTargets(platforms, type, arch) {
    const targets = new Map();
    for (let platform of platforms) {
        const archs = platform === metadata_1.Platform.MAC ? [metadata_1.Arch.x64] : arch === "all" ? [metadata_1.Arch.x64, metadata_1.Arch.ia32] : [metadata_1.archFromString(arch == null ? process.arch : arch)];
        const archToType = new Map();
        targets.set(platform, archToType);
        for (let arch of archs) {
            archToType.set(arch, type == null ? [] : [type]);
        }
    }
    return targets;
}
exports.createTargets = createTargets;
function build(rawOptions) {
    return __awaiter(this, void 0, void 0, function* () {
        const options = normalizeOptions(rawOptions || {});
        if (options.cscLink === undefined && !util_1.isEmptyOrSpaces(process.env.CSC_LINK)) {
            options.cscLink = process.env.CSC_LINK;
        }
        if (options.cscInstallerLink === undefined && !util_1.isEmptyOrSpaces(process.env.CSC_INSTALLER_LINK)) {
            options.cscInstallerLink = process.env.CSC_INSTALLER_LINK;
        }
        if (options.cscKeyPassword === undefined && !util_1.isEmptyOrSpaces(process.env.CSC_KEY_PASSWORD)) {
            options.cscKeyPassword = process.env.CSC_KEY_PASSWORD;
        }
        if (options.cscInstallerKeyPassword === undefined && !util_1.isEmptyOrSpaces(process.env.CSC_INSTALLER_KEY_PASSWORD)) {
            options.cscInstallerKeyPassword = process.env.CSC_INSTALLER_KEY_PASSWORD;
        }
        if (options.githubToken === undefined && !util_1.isEmptyOrSpaces(process.env.GH_TOKEN)) {
            options.githubToken = process.env.GH_TOKEN;
        }
        if (options.bintrayToken === undefined && !util_1.isEmptyOrSpaces(process.env.BT_TOKEN)) {
            options.bintrayToken = process.env.BT_TOKEN;
        }
        if (options.draft === undefined && !util_1.isEmptyOrSpaces(process.env.EP_DRAFT)) {
            options.draft = process.env.EP_DRAFT.toLowerCase() === "true";
        }
        if (options.prerelease === undefined && !util_1.isEmptyOrSpaces(process.env.EP_PRELEASE)) {
            options.prerelease = process.env.EP_PRELEASE.toLowerCase() === "true";
        }
        let isPublishOptionGuessed = false;
        if (options.publish === undefined) {
            if (process.env.npm_lifecycle_event === "release") {
                options.publish = "always";
            } else if (options.githubToken != null) {
                const tag = process.env.TRAVIS_TAG || process.env.APPVEYOR_REPO_TAG_NAME || process.env.CIRCLE_TAG;
                if (!util_1.isEmptyOrSpaces(tag)) {
                    log_1.log(`Tag ${ tag } is defined, so artifacts will be published`);
                    options.publish = "onTag";
                    isPublishOptionGuessed = true;
                } else if (util_1.isCi()) {
                    log_1.log("CI detected, so artifacts will be published if draft release exists");
                    options.publish = "onTagOrDraft";
                    isPublishOptionGuessed = true;
                }
            }
        }
        const packager = new packager_1.Packager(options);
        const publishTasks = [];
        if (options.publish != null && options.publish !== "never") {
            if (options.githubToken != null || options.bintrayToken != null) {
                publishManager(packager, publishTasks, options, isPublishOptionGuessed);
            } else if (util_1.isCi()) {
                log_1.log(`CI detected, publish is set to ${ options.publish }, but neither GH_TOKEN nor BT_TOKEN is not set, so artifacts will be not published`);
            }
        }
        yield promise_1.executeFinally(packager.build(), errorOccurred => {
            if (errorOccurred) {
                for (let task of publishTasks) {
                    task.cancel();
                }
                return bluebird_1.Promise.resolve(null);
            } else {
                return bluebird_1.Promise.all(publishTasks);
            }
        });
    });
}
exports.build = build;
function publishManager(packager, publishTasks, options, isPublishOptionGuessed) {
    const nameToPublisher = new Map();
    packager.artifactCreated(event => {
        let publishers = event.packager.platformSpecificBuildOptions.publish;
        // if explicitly set to null - do not publish
        if (publishers === null) {
            util_1.debug(`${ event.file } is not published: publish set to null`);
            return;
        }
        if (publishers == null) {
            publishers = event.packager.info.devMetadata.build.publish;
            if (publishers === null) {
                util_1.debug(`${ event.file } is not published: publish set to null in the "build"`);
                return;
            }
            if (publishers == null && options.githubToken != null) {
                publishers = ["github"];
            }
            // if both tokens are set — still publish to github (because default publisher is github)
            if (publishers == null && options.bintrayToken != null) {
                publishers = ["bintray"];
            }
        }
        for (let publisherName of util_1.asArray(publishers)) {
            let publisher = nameToPublisher.get(publisherName);
            if (publisher == null) {
                publisher = createPublisher(packager, options, publisherName, isPublishOptionGuessed);
                nameToPublisher.set(publisherName, publisher);
            }
            if (publisher != null) {
                publisher.then(it => it == null ? null : publishTasks.push(it.upload(event.file, event.artifactName)));
            }
        }
    });
}
function createPublisher(packager, options, publisherName) {
    let isPublishOptionGuessed = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];

    return __awaiter(this, void 0, void 0, function* () {
        const info = yield repositoryInfo_1.getRepositoryInfo(packager.metadata, packager.devMetadata);
        if (info == null) {
            if (isPublishOptionGuessed) {
                return null;
            }
            log_1.warn("Cannot detect repository by .git/config");
            throw new Error(`Please specify 'repository' in the dev package.json ('${ packager.devPackageFile }')`);
        }
        if (publisherName === "github") {
            const version = packager.metadata.version;
            log_1.log(`Creating Github Publisher — user: ${ info.user }, project: ${ info.project }, version: ${ version }`);
            return new gitHubPublisher_1.GitHubPublisher(info.user, info.project, version, options, isPublishOptionGuessed);
        }
        if (publisherName === "bintray") {
            const version = packager.metadata.version;
            const bintrayInfo = { user: info.user, packageName: info.project, repo: "generic" };
            log_1.log(`Creating Bintray Publisher — user: ${ bintrayInfo.user }, package: ${ bintrayInfo.packageName }, repository: ${ bintrayInfo.repo }, version: ${ version }`);
            return new BintrayPublisher_1.BintrayPublisher(bintrayInfo, version, options);
        }
        return null;
    });
}
exports.createPublisher = createPublisher;
//# sourceMappingURL=builder.js.map