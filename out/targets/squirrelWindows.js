"use strict";

const platformPackager_1 = require("../platformPackager");
const metadata_1 = require("../metadata");
const path = require("path");
const log_1 = require("../util/log");
const repositoryInfo_1 = require("../repositoryInfo");
const binDownload_1 = require("../util/binDownload");
const squirrelPack_1 = require("./squirrelPack");
//noinspection JSUnusedLocalSymbols
const __awaiter = require("../util/awaiter");
const SW_VERSION = "1.4.4";
//noinspection SpellCheckingInspection
const SW_SHA2 = "98e1d81c80d7afc1bcfb37f3b224dc4f761088506b9c28ccd72d1cf8752853ba";
class SquirrelWindowsTarget extends platformPackager_1.Target {
    constructor(packager) {
        super("squirrel");
        this.packager = packager;
    }
    build(arch, appOutDir) {
        return __awaiter(this, void 0, void 0, function* () {
            if (arch === metadata_1.Arch.ia32) {
                log_1.warn("For windows consider only distributing 64-bit, see https://github.com/electron-userland/electron-builder/issues/359#issuecomment-214851130");
            }
            const appInfo = this.packager.appInfo;
            const version = appInfo.version;
            const archSuffix = platformPackager_1.getArchSuffix(arch);
            const setupFileName = `${ appInfo.productFilename } Setup ${ version }${ archSuffix }.exe`;
            const installerOutDir = path.join(appOutDir, "..", `win${ platformPackager_1.getArchSuffix(arch) }`);
            const distOptions = yield this.computeEffectiveDistOptions();
            yield squirrelPack_1.buildInstaller(distOptions, installerOutDir, setupFileName, this.packager, appOutDir);
            this.packager.dispatchArtifactCreated(path.join(installerOutDir, setupFileName), `${ appInfo.name }-Setup-${ version }${ archSuffix }.exe`);
            const packagePrefix = `${ appInfo.name }-${ squirrelPack_1.convertVersion(version) }-`;
            this.packager.dispatchArtifactCreated(path.join(installerOutDir, `${ packagePrefix }full.nupkg`));
            if (distOptions.remoteReleases != null) {
                this.packager.dispatchArtifactCreated(path.join(installerOutDir, `${ packagePrefix }delta.nupkg`));
            }
            this.packager.dispatchArtifactCreated(path.join(installerOutDir, "RELEASES"));
        });
    }
    computeEffectiveDistOptions() {
        return __awaiter(this, void 0, void 0, function* () {
            const packager = this.packager;
            let iconUrl = packager.platformSpecificBuildOptions.iconUrl || packager.devMetadata.build.iconUrl;
            if (iconUrl == null) {
                const info = yield repositoryInfo_1.getRepositoryInfo(packager.appInfo.metadata, packager.devMetadata);
                if (info != null) {
                    iconUrl = `https://github.com/${ info.user }/${ info.project }/blob/master/${ packager.relativeBuildResourcesDirname }/icon.ico?raw=true`;
                }
                if (iconUrl == null) {
                    throw new Error("iconUrl is not specified, please see https://github.com/electron-userland/electron-builder/wiki/Options#WinBuildOptions-iconUrl");
                }
            }
            checkConflictingOptions(packager.platformSpecificBuildOptions);
            const appInfo = packager.appInfo;
            const projectUrl = yield appInfo.computePackageUrl();
            const options = Object.assign({
                name: appInfo.name,
                productName: appInfo.productName,
                version: appInfo.version,
                description: appInfo.description,
                authors: appInfo.companyName,
                iconUrl: iconUrl,
                extraMetadataSpecs: projectUrl == null ? null : `\n    <projectUrl>${ projectUrl }</projectUrl>`,
                copyright: appInfo.copyright,
                packageCompressionLevel: packager.devMetadata.build.compression === "store" ? 0 : 9,
                vendorPath: yield binDownload_1.getBinFromBintray("Squirrel.Windows", SW_VERSION, SW_SHA2)
            }, packager.platformSpecificBuildOptions);
            if (options.remoteToken == null) {
                options.remoteToken = packager.info.options.githubToken;
            }
            if (!("loadingGif" in options)) {
                const resourceList = yield packager.resourceList;
                if (resourceList.indexOf("install-spinner.gif") !== -1) {
                    options.loadingGif = path.join(packager.buildResourcesDir, "install-spinner.gif");
                }
            }
            if (options.remoteReleases === true) {
                const info = yield repositoryInfo_1.getRepositoryInfo(packager.appInfo.metadata, packager.devMetadata);
                if (info == null) {
                    log_1.warn("remoteReleases set to true, but cannot get repository info");
                } else {
                    options.remoteReleases = `https://github.com/${ info.user }/${ info.project }`;
                    log_1.log(`remoteReleases is set to ${ options.remoteReleases }`);
                }
            }
            return options;
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SquirrelWindowsTarget;
function checkConflictingOptions(options) {
    for (let name of ["outputDirectory", "appDirectory", "exe", "fixUpPaths", "usePackageJson", "extraFileSpecs", "extraMetadataSpecs", "skipUpdateIcon", "setupExe"]) {
        if (name in options) {
            throw new Error(`Option ${ name } is ignored, do not specify it.`);
        }
    }
    if ("noMsi" in options) {
        log_1.warn(`noMsi is deprecated, please specify as "msi": true if you want to create an MSI installer`);
        options.msi = !options.noMsi;
    }
    const msi = options.msi;
    if (msi != null && typeof msi !== "boolean") {
        throw new Error(`msi expected to be boolean value, but string '"${ msi }"' was specified`);
    }
}
//# sourceMappingURL=squirrelWindows.js.map