declare module 'electron-builder/out/appInfo' {
  import { DevMetadata, AppMetadata } from "electron-builder/out/metadata"

  export class AppInfo {
    metadata: AppMetadata
    readonly description: string
    readonly version: string
    readonly buildNumber: string
    readonly buildVersion: string
    readonly productName: string
    readonly productFilename: string
    constructor(metadata: AppMetadata, devMetadata: DevMetadata, buildVersion?: string | null)
    readonly companyName: string
    readonly id: string
    readonly name: string
    readonly category: any
    readonly copyright: string
    computePackageUrl(): Promise<string | null>
  }
}

declare module 'electron-builder/out/asarUtil' {
  /// <reference types="node" />
  import { AsarOptions } from "asar-electron-builder"
  import { Stats } from "fs-extra-p"
  import { Promise as BluebirdPromise } from "bluebird"
  import { Filter } from "electron-builder/out/util/filter"

  export function walk(dirPath: string, consumer?: (file: string, stat: Stats) => void, filter?: Filter, addRootToResult?: boolean): BluebirdPromise<Array<string>>

  export function createAsarArchive(src: string, resourcesPath: string, options: AsarOptions, filter: Filter): Promise<any>

  export function checkFileInArchive(asarFile: string, relativeFile: string, messagePrefix: string): Promise<void>
}

declare module 'electron-builder/out/builder' {
  import { Packager } from "electron-builder/out/packager"
  import { PackagerOptions } from "electron-builder/out/platformPackager"
  import { PublishOptions, Publisher } from "electron-builder/out/publish/publisher"
  import { Platform, Arch } from "electron-builder/out/metadata"

  export interface BuildOptions extends PackagerOptions, PublishOptions {
  }

  export interface CliOptions extends PackagerOptions, PublishOptions {
    mac?: Array<string>
    linux?: Array<string>
    win?: Array<string>
    arch?: string
    x64?: boolean
    ia32?: boolean
    dir?: boolean
    platform?: string
  }

  export function normalizeOptions(args: CliOptions): BuildOptions

  export function createTargets(platforms: Array<Platform>, type?: string | null, arch?: string | null): Map<Platform, Map<Arch, Array<string>>>

  export function build(rawOptions?: CliOptions): Promise<void>

  export function createPublisher(packager: Packager, options: PublishOptions, publisherName: string, isPublishOptionGuessed?: boolean): Promise<Publisher | null>
}

declare module 'electron-builder/out/cliOptions' {
  
  export function createYargs(): any
}

declare module 'electron-builder/out/codeSign' {
  import { Promise as BluebirdPromise } from "bluebird"
  import { TmpDir } from "electron-builder/out/util/tmp"
  export type CertType = "Developer ID Application" | "3rd Party Mac Developer Application" | "Developer ID Installer" | "3rd Party Mac Developer Installer"

  export interface CodeSigningInfo {
    keychainName?: string | null
  }

  export function downloadCertificate(urlOrBase64: string, tmpDir: TmpDir): BluebirdPromise<string>

  export function createKeychain(tmpDir: TmpDir, cscLink: string, cscKeyPassword: string, cscILink?: string | null, cscIKeyPassword?: string | null): Promise<CodeSigningInfo>

  export function sign(path: string, name: string, keychain: string): BluebirdPromise<any>
  export let findIdentityRawResult: Promise<Array<string>> | null

  export function findIdentity(certType: CertType, qualifier?: string | null, keychain?: string | null): Promise<string | null>
}

declare module 'electron-builder/out/errorMessages' {
  export const buildIsMissed: string
  export const authorEmailIsMissed: string
  export const buildInAppSpecified: string
  export const nameInBuildSpecified: string
}

declare module 'electron-builder/out/fileMatcher' {
  import { Filter } from "electron-builder/out/util/filter"
  import { Minimatch } from "minimatch"

  export interface FilePattern {
    from?: string
    to?: string
    filter?: Array<string> | string
  }

  export interface FileMatchOptions {
    arch: string
    os: string
  }

  export class FileMatcher {
    readonly from: string
    readonly to: string
    readonly patterns: Array<string>
    constructor(from: string, to: string, options: FileMatchOptions, patterns?: Array<string> | string | n)
    addPattern(pattern: string): void
    isEmpty(): boolean
    getParsedPatterns(fromDir?: string): Array<Minimatch>
    createFilter(ignoreFiles?: Set<string>, rawFilter?: (file: string) => boolean, excludePatterns?: Array<Minimatch> | n): Filter
  }

  export function deprecatedUserIgnoreFilter(ignore: any, appDir: string): (file: string) => any
}

declare module 'electron-builder' {
  export { Packager } from "electron-builder/out/packager"
  export { PackagerOptions, ArtifactCreated, BuildInfo } from "electron-builder/out/platformPackager"
  export { DIR_TARGET, DEFAULT_TARGET } from "electron-builder/out/targets/targetFactory"
  export { BuildOptions, build, CliOptions, createTargets } from "electron-builder/out/builder"
  export { PublishOptions, Publisher } from "electron-builder/out/publish/publisher"
  export { AppMetadata, DevMetadata, Platform, Arch, archFromString, BuildMetadata, MacOptions, WinBuildOptions, LinuxBuildOptions, CompressionLevel } from "electron-builder/out/metadata"
}

declare module 'electron-builder/out/linuxPackager' {
  import { PlatformPackager, BuildInfo, Target } from "electron-builder/out/platformPackager"
  import { Platform, LinuxBuildOptions, Arch } from "electron-builder/out/metadata"

  export class LinuxPackager extends PlatformPackager<LinuxBuildOptions> {
    constructor(info: BuildInfo)
    normalizePlatformSpecificBuildOptions(options: LinuxBuildOptions | n): LinuxBuildOptions
    createTargets(targets: Array<string>, mapper: (name: string, factory: (outDir: string) => Target) => void, cleanupTasks: Array<() => Promise<any>>): void
    readonly platform: Platform
    pack(outDir: string, arch: Arch, targets: Array<Target>, postAsyncTasks: Array<Promise<any>>): Promise<any>
    protected postInitApp(appOutDir: string): Promise<any>
    protected packageInDistributableFormat(outDir: string, appOutDir: string, arch: Arch, targets: Array<Target>): Promise<any>
  }
}

declare module 'electron-builder/out/macPackager' {
  import { PlatformPackager, BuildInfo, Target } from "electron-builder/out/platformPackager"
  import { Platform, Arch, MacOptions } from "electron-builder/out/metadata"
  import { CodeSigningInfo } from "electron-builder/out/codeSign"
  import { SignOptions, FlatOptions } from "electron-osx-sign"
  import { AppInfo } from "electron-builder/out/appInfo"

  export default class MacPackager extends PlatformPackager<MacOptions> {
    codeSigningInfo: Promise<CodeSigningInfo>
    constructor(info: BuildInfo)
    protected prepareAppInfo(appInfo: AppInfo): AppInfo
    getIconPath(): Promise<string | null>
    normalizePlatformSpecificBuildOptions(options: MacOptions | n): MacOptions
    createTargets(targets: Array<string>, mapper: (name: string, factory: () => Target) => void, cleanupTasks: Array<() => Promise<any>>): void
    readonly platform: Platform
    pack(outDir: string, arch: Arch, targets: Array<Target>, postAsyncTasks: Array<Promise<any>>): Promise<any>
    protected doSign(opts: SignOptions): Promise<any>
    protected doFlat(opts: FlatOptions): Promise<any>
    protected packageInDistributableFormat(appOutDir: string, targets: Array<Target>, promises: Array<Promise<any>>): void
  }
}

declare module 'electron-builder/out/metadata' {
  import { AsarOptions } from "asar-electron-builder"
  import { ElectronPackagerOptions } from "electron-builder/out/packager/dirPackager"

  export interface Metadata {
    readonly repository?: string | RepositoryInfo | null
    dependencies?: {
      [key: string]: string
    }
  }

  export interface AppMetadata extends Metadata {
    readonly version?: string
    readonly name: string
    readonly productName?: string | null
    readonly description?: string
    readonly main?: string | null
    readonly author?: AuthorMetadata
    readonly homepage?: string | null
    readonly license?: string | null
  }

  export interface DevMetadata extends Metadata {
    readonly build: BuildMetadata
    readonly homepage?: string | null
    readonly license?: string | null
    readonly directories?: MetadataDirectories | null
  }

  export interface RepositoryInfo {
    readonly url: string
  }

  export interface AuthorMetadata {
    readonly name: string
    readonly email?: string
  }
  export type CompressionLevel = "store" | "normal" | "maximum"

  export interface BuildMetadata {
    readonly appId?: string | null
    readonly category?: string | null
    readonly copyright?: string | null
    readonly asar?: AsarOptions | boolean | null
    readonly iconUrl?: string | null
    readonly productName?: string | null
    /**
     A [glob patterns](https://www.npmjs.com/package/glob#glob-primer) relative to the [app directory](#MetadataDirectories-app), which specifies which files to include when copying files to create the package.
  
     See [File Patterns](#multiple-glob-patterns).
     */
    readonly files?: Array<string> | string | null
    /**
     A [glob patterns](https://www.npmjs.com/package/glob#glob-primer) relative to the project directory, when specified, copy the file or directory with matching names directly into the app's resources directory (`Contents/Resources` for MacOS, `resources` for Linux/Windows).
  
     Glob rules the same as for [files](#multiple-glob-patterns).
     */
    readonly extraResources?: Array<string> | string | null
    /**
     The same as [extraResources](#BuildMetadata-extraResources) but copy into the app's content directory (`Contents` for MacOS, root directory for Linux/Windows).
     */
    readonly extraFiles?: Array<string> | string | null
    readonly fileAssociations?: Array<FileAssociation> | FileAssociation
    readonly protocols?: Array<Protocol> | Protocol
    readonly mac?: MacOptions | null
    readonly dmg?: DmgOptions | null
    readonly osx?: MacOptions | null
    readonly mas?: MasBuildOptions | null
    /**
     See [.build.win](#WinBuildOptions).
     */
    readonly win?: WinBuildOptions | null
    /**
     See [.build.nsis](#NsisOptions).
     */
    readonly nsis?: NsisOptions | null
    readonly linux?: LinuxBuildOptions | null
    readonly deb?: LinuxBuildOptions | null
    readonly compression?: CompressionLevel | null
    readonly afterPack?: (context: AfterPackContext) => Promise<any> | null
    readonly npmRebuild?: boolean
    readonly nodeGypRebuild?: boolean
    readonly icon?: string | null
    readonly "app-bundle-id"?: string | null
    readonly dereference?: boolean
    readonly publish?: string | Array<string> | null
  }

  export interface AfterPackContext {
    readonly appOutDir: string
    readonly options: ElectronPackagerOptions
  }

  export interface MacOptions extends PlatformSpecificBuildOptions {
    readonly target?: Array<string> | null
    readonly identity?: string | null
    readonly icon?: string | null
    readonly entitlements?: string | null
    readonly entitlementsInherit?: string | null
    readonly bundleVersion?: string | null
  }

  export interface DmgOptions {
    readonly icon?: string | null
    readonly background?: string | null
  }

  export interface MasBuildOptions extends MacOptions {
    readonly entitlements?: string | null
    readonly entitlementsInherit?: string | null
  }

  export interface WinBuildOptions extends PlatformSpecificBuildOptions {
    readonly target?: Array<string> | null
    readonly iconUrl?: string | null
    readonly loadingGif?: string | null
    readonly msi?: boolean
    readonly remoteReleases?: string | boolean | null
    readonly remoteToken?: string | null
    readonly signingHashAlgorithms?: Array<string> | null
    readonly icon?: string | null
    readonly legalTrademarks?: string | null
    readonly certificateFile?: string
    readonly certificatePassword?: string
    readonly certificateSubjectName?: string
    readonly rfc3161TimeStampServer?: string
  }

  export interface NsisOptions {
    readonly oneClick?: boolean | null
    readonly perMachine?: boolean | null
    readonly allowElevation?: boolean | null
    readonly runAfterFinish?: boolean | null
    readonly guid?: string | null
    readonly installerHeader?: string | null
    readonly installerHeaderIcon?: string | null
    readonly include?: string | null
    readonly script?: string | null
    readonly language?: string | null
  }

  export interface LinuxBuildOptions extends PlatformSpecificBuildOptions {
    readonly description?: string | null
    readonly target?: Array<string> | null
    readonly synopsis?: string | null
    readonly maintainer?: string | null
    readonly vendor?: string | null
    readonly fpm?: Array<string> | null
    readonly desktop?: string | null
    readonly afterInstall?: string | null
    readonly afterRemove?: string | null
    readonly compression?: string | null
    readonly depends?: string[] | null
  }

  export interface FileAssociation {
    readonly ext: string | Array<string>
    readonly name: string
    readonly description?: string
    readonly icon?: string
    readonly role?: string
  }

  export interface Protocol {
    readonly name: string
    readonly schemes: Array<string>
  }

  export interface MetadataDirectories {
    readonly buildResources?: string | null
    readonly output?: string | null
    readonly app?: string | null
  }

  export interface PlatformSpecificBuildOptions {
    readonly files?: Array<string> | null
    readonly extraFiles?: Array<string> | null
    readonly extraResources?: Array<string> | null
    readonly asar?: AsarOptions | boolean
    readonly target?: Array<string> | null
    readonly icon?: string | null
    readonly fileAssociations?: Array<FileAssociation> | FileAssociation
    readonly publish?: string | Array<string> | null
  }

  export class Platform {
    name: string
    buildConfigurationKey: string
    nodeName: string
    static MAC: Platform
    static LINUX: Platform
    static WINDOWS: Platform
    static OSX: Platform
    constructor(name: string, buildConfigurationKey: string, nodeName: string)
    toString(): string
    toJSON(): string
    createTarget(type?: string | Array<string> | null, ...archs: Array<Arch>): Map<Platform, Map<Arch, Array<string>>>
    static current(): Platform
    static fromString(name: string): Platform
  }
  export enum Arch {
    ia32 = 0,
    x64 = 1,
  }

  export function archFromString(name: string): Arch
}

declare module 'electron-builder/out/packager' {
  /// <reference types="node" />
  import { EventEmitter } from "events"
  import { AppMetadata, DevMetadata, Platform } from "electron-builder/out/metadata"
  import { BuildInfo, ArtifactCreated, Target } from "electron-builder/out/platformPackager"
  import { AppInfo } from "electron-builder/out/appInfo"
  import { TmpDir } from "electron-builder/out/util/tmp"
  import { BuildOptions } from "electron-builder/out/builder"

  export class Packager implements BuildInfo {
    options: BuildOptions
    readonly projectDir: string
    appDir: string
    metadata: AppMetadata
    devMetadata: DevMetadata
    isTwoPackageJsonProjectLayoutUsed: boolean
    electronVersion: string
    readonly eventEmitter: EventEmitter
    appInfo: AppInfo
    readonly tempDirManager: TmpDir
    constructor(options: BuildOptions)
    artifactCreated(handler: (event: ArtifactCreated) => void): Packager
    readonly devPackageFile: string
    build(): Promise<Map<Platform, Map<String, Target>>>
  }

  export function normalizePlatforms(rawPlatforms: Array<string | Platform> | string | Platform | n): Array<Platform>
}

declare module 'electron-builder/out/packager/dirPackager' {
  import { AppInfo } from "electron-builder/out/appInfo"
  import { PlatformPackager } from "electron-builder/out/platformPackager"

  export interface ElectronPackagerOptions {
    "extend-info"?: string
    appInfo: AppInfo
    platformPackager: PlatformPackager<any>
    "helper-bundle-id"?: string | null
    ignore?: any
  }

  export function pack(opts: ElectronPackagerOptions, out: string, platform: string, arch: string, electronVersion: string, initializeApp: () => Promise<any>): Promise<void>
}

declare module 'electron-builder/out/packager/mac' {
  import { ElectronPackagerOptions } from "electron-builder/out/packager/dirPackager"

  export function createApp(opts: ElectronPackagerOptions, appOutDir: string, initializeApp: () => Promise<any>): Promise<void>
}

declare module 'electron-builder/out/platformPackager' {
  /// <reference types="node" />
  import { AppMetadata, DevMetadata, Platform, PlatformSpecificBuildOptions, Arch, FileAssociation } from "electron-builder/out/metadata"
  import EventEmitter = NodeJS.EventEmitter
  import { Packager } from "electron-builder/out/packager"
  import { AppInfo } from "electron-builder/out/appInfo"
  import { ElectronPackagerOptions } from "electron-builder/out/packager/dirPackager"
  import { TmpDir } from "electron-builder/out/util/tmp"
  import { BuildOptions } from "electron-builder/out/builder"

  export interface PackagerOptions {
    targets?: Map<Platform, Map<Arch, string[]>>
    projectDir?: string | null
    cscLink?: string | null
    cscKeyPassword?: string | null
    cscInstallerLink?: string | null
    cscInstallerKeyPassword?: string | null
    platformPackagerFactory?: ((packager: Packager, platform: Platform, cleanupTasks: Array<() => Promise<any>>) => PlatformPackager<any>) | null
    /**
     * The same as [development package.json](https://github.com/electron-userland/electron-builder/wiki/Options#development-packagejson).
     *
     * Development `package.json` will be still read, but options specified in this object will override.
     */
    readonly devMetadata?: DevMetadata
    /**
     * The same as [application package.json](https://github.com/electron-userland/electron-builder/wiki/Options#AppMetadata).
     *
     * Application `package.json` will be still read, but options specified in this object will override.
     */
    readonly appMetadata?: AppMetadata
    readonly effectiveOptionComputed?: (options: any) => boolean
    readonly extraMetadata?: any
  }

  export interface BuildInfo {
    options: BuildOptions
    devMetadata: DevMetadata
    projectDir: string
    appDir: string
    electronVersion: string
    eventEmitter: EventEmitter
    isTwoPackageJsonProjectLayoutUsed: boolean
    appInfo: AppInfo
    readonly tempDirManager: TmpDir
  }

  export class Target {
    name: string
    constructor(name: string)
    finishBuild(): Promise<any>
  }

  export abstract class TargetEx extends Target {
    abstract build(appOutDir: string, arch: Arch): Promise<any>
  }

  export abstract class PlatformPackager<DC extends PlatformSpecificBuildOptions> {
    info: BuildInfo
    readonly options: PackagerOptions
    readonly projectDir: string
    readonly buildResourcesDir: string
    readonly devMetadata: DevMetadata
    readonly platformSpecificBuildOptions: DC
    readonly resourceList: Promise<Array<string>>
    readonly abstract platform: Platform
    readonly appInfo: AppInfo
    constructor(info: BuildInfo)
    protected prepareAppInfo(appInfo: AppInfo): AppInfo
    normalizePlatformSpecificBuildOptions(options: DC | n): DC
    abstract createTargets(targets: Array<string>, mapper: (name: string, factory: (outDir: string) => Target) => void, cleanupTasks: Array<() => Promise<any>>): void
    protected getCscPassword(): string
    readonly relativeBuildResourcesDirname: string
    protected computeAppOutDir(outDir: string, arch: Arch): string
    dispatchArtifactCreated(file: string, artifactName?: string): void
    abstract pack(outDir: string, arch: Arch, targets: Array<Target>, postAsyncTasks: Array<Promise<any>>): Promise<any>
    protected doPack(options: ElectronPackagerOptions, outDir: string, appOutDir: string, platformName: string, arch: Arch, platformSpecificBuildOptions: DC): Promise<void>
    protected postInitApp(executableFile: string): Promise<any>
    protected computePackOptions(): Promise<ElectronPackagerOptions>
    getIconPath(): Promise<string | null>
    protected archiveApp(format: string, appOutDir: string, outFile: string): Promise<any>
    generateName(ext: string | null, arch: Arch, deployment: boolean, classifier?: string | null): string
    generateName2(ext: string | null, classifier: string | n, deployment: boolean): string
    getDefaultIcon(ext: string): Promise<string | null>
    getTempFile(suffix: string): Promise<string>
    getFileAssociations(): Array<FileAssociation>
    getResource(custom: string | n, name: string): Promise<string | null>
  }

  export function getArchSuffix(arch: Arch): string

  export interface ArtifactCreated {
    readonly packager: PlatformPackager<any>
    readonly file: string
    readonly artifactName?: string
    readonly platform: Platform
  }

  export function smarten(s: string): string

  export function normalizeExt(ext: string): string
}

declare module 'electron-builder/out/publish/bintray' {
  
  export interface Version {
    readonly name: string
    readonly package: string
  }

  export class BintrayClient {
    user: string
    packageName: string
    repo: string
    readonly auth: string | null
    constructor(user: string, packageName: string, repo?: string, apiKey?: string | null)
    getVersion(version: string): Promise<Version>
    createVersion(version: string): Promise<any>
    deleteVersion(version: string): Promise<any>
  }
}

declare module 'electron-builder/out/publish/BintrayPublisher' {
  import { Publisher, PublishOptions } from "electron-builder/out/publish/publisher"

  export interface BintrayConfiguration {
    readonly user: string
    readonly packageName: string
    readonly repo?: string
  }

  export class BintrayPublisher implements Publisher {
    constructor(info: BintrayConfiguration, version: string, options: PublishOptions)
    upload(file: string, artifactName?: string): Promise<any>
    deleteRelease(): Promise<any>
  }
}

declare module 'electron-builder/out/publish/gitHubPublisher' {
  import { PublishOptions, Publisher } from "electron-builder/out/publish/publisher"

  export interface Release {
    id: number
    tag_name: string
    draft: boolean
    upload_url: string
  }

  export class GitHubPublisher implements Publisher {
    readonly releasePromise: Promise<Release | null>
    constructor(owner: string, repo: string, version: string, options: PublishOptions, isPublishOptionGuessed?: boolean)
    upload(file: string, artifactName?: string): Promise<void>
    getRelease(): Promise<any>
    deleteRelease(): Promise<any>
  }
}

declare module 'electron-builder/out/publish/publisher' {
  export type PublishPolicy = "onTag" | "onTagOrDraft" | "always" | "never"

  export interface PublishOptions {
    publish?: PublishPolicy | null
    githubToken?: string | null
    bintrayToken?: string | null
    draft?: boolean
    prerelease?: boolean
  }

  export interface Publisher {
    upload(file: string, artifactName?: string): Promise<any>
  }
}

declare module 'electron-builder/out/publish/restApiRequest' {
  /// <reference types="node" />
  import { RequestOptions } from "https"
  import { IncomingMessage, ClientRequest } from "http"
  import { Promise as BluebirdPromise } from "bluebird"

  export function githubRequest<T>(path: string, token: string | null, data?: {
    [name: string]: any
  } | null, method?: string): BluebirdPromise<T>

  export function bintrayRequest<T>(path: string, auth: string | null, data?: {
    [name: string]: any
  } | null, method?: string): BluebirdPromise<T>

  export function doApiRequest<T>(options: RequestOptions, token: string | null, requestProcessor: (request: ClientRequest, reject: (error: Error) => void) => void): BluebirdPromise<T>

  export class HttpError extends Error {
    response: IncomingMessage
    description: any
    constructor(response: IncomingMessage, description?: any)
  }
}

declare module 'electron-builder/out/publish/uploader' {
  /// <reference types="node" />
  import { Stats } from "fs-extra-p"
  import { ClientRequest } from "http"

  export function uploadFile(file: string, fileStat: Stats, fileName: string, request: ClientRequest, reject: (error: Error) => void): void
}

declare module 'electron-builder/out/repositoryInfo' {
  import { Info } from "hosted-git-info"
  import { AppMetadata, Metadata } from "electron-builder/out/metadata"

  export interface RepositorySlug {
    user: string
    project: string
  }

  export function getRepositoryInfo(metadata?: AppMetadata, devMetadata?: Metadata): Promise<Info | null>
}

declare module 'electron-builder/out/targets/appImage' {
  import { PlatformPackager, TargetEx } from "electron-builder/out/platformPackager"
  import { LinuxBuildOptions, Arch } from "electron-builder/out/metadata"
  import { LinuxTargetHelper } from "electron-builder/out/targets/LinuxTargetHelper"

  export default class AppImageTarget extends TargetEx {
    constructor(packager: PlatformPackager<LinuxBuildOptions>, helper: LinuxTargetHelper, outDir: string)
    build(appOutDir: string, arch: Arch): Promise<any>
  }
}

declare module 'electron-builder/out/targets/archive' {
  import { CompressionLevel } from "electron-builder/out/metadata"

  export function archiveApp(compression: CompressionLevel | n, format: string, outFile: string, dirToArchive: string, withoutDir?: boolean): Promise<string>
}

declare module 'electron-builder/out/targets/dmg' {
  import { Target, PlatformPackager } from "electron-builder/out/platformPackager"
  import { MacOptions } from "electron-builder/out/metadata"

  export class DmgTarget extends Target {
    constructor(packager: PlatformPackager<MacOptions>)
    build(appOutDir: string): Promise<void>
    computeDmgOptions(appOutDir: string): Promise<appdmg.Specification>
  }
}

declare module 'electron-builder/out/targets/fpm' {
  import { LinuxBuildOptions, Arch } from "electron-builder/out/metadata"
  import { PlatformPackager, TargetEx } from "electron-builder/out/platformPackager"
  import { LinuxTargetHelper } from "electron-builder/out/targets/LinuxTargetHelper"

  export default class FpmTarget extends TargetEx {
    constructor(name: string, packager: PlatformPackager<LinuxBuildOptions>, helper: LinuxTargetHelper, outDir: string)
    build(appOutDir: string, arch: Arch): Promise<any>
  }
}

declare module 'electron-builder/out/targets/LinuxTargetHelper' {
  import { PlatformPackager } from "electron-builder/out/platformPackager"
  import { LinuxBuildOptions } from "electron-builder/out/metadata"
  export const installPrefix: string

  export class LinuxTargetHelper {
    readonly icons: Promise<Array<Array<string>>>
    maxIconPath: string | null
    constructor(packager: PlatformPackager<LinuxBuildOptions>)
    computeDesktopEntry(exec?: string, extra?: string): Promise<string>
  }
}

declare module 'electron-builder/out/targets/nsis' {
  import { WinPackager } from "electron-builder/out/winPackager"
  import { Arch } from "electron-builder/out/metadata"
  import { Target } from "electron-builder/out/platformPackager"

  export default class NsisTarget extends Target {
    constructor(packager: WinPackager, outDir: string)
    build(arch: Arch, appOutDir: string): Promise<void>
    finishBuild(): Promise<any>
  }
}

declare module 'electron-builder/out/targets/squirrelPack' {
  import { WinPackager } from "electron-builder/out/winPackager"

  export function convertVersion(version: string): string

  export interface SquirrelOptions {
    vendorPath: string
    remoteReleases?: string
    remoteToken?: string
    loadingGif?: string
    productName?: string
    name: string
    packageCompressionLevel?: number
    version: string
    msi?: any
    owners?: string
    description?: string
    iconUrl?: string
    authors?: string
    extraMetadataSpecs?: string
    copyright?: string
  }

  export function buildInstaller(options: SquirrelOptions, outputDirectory: string, setupExe: string, packager: WinPackager, appOutDir: string): Promise<void>
}

declare module 'electron-builder/out/targets/squirrelWindows' {
  import { WinPackager } from "electron-builder/out/winPackager"
  import { Target } from "electron-builder/out/platformPackager"
  import { Arch } from "electron-builder/out/metadata"
  import { SquirrelOptions } from "electron-builder/out/targets/squirrelPack"

  export default class SquirrelWindowsTarget extends Target {
    constructor(packager: WinPackager)
    build(arch: Arch, appOutDir: string): Promise<void>
    computeEffectiveDistOptions(): Promise<SquirrelOptions>
  }
}

declare module 'electron-builder/out/targets/targetFactory' {
  import { PlatformPackager, Target } from "electron-builder/out/platformPackager"
  export const commonTargets: string[]
  export const DEFAULT_TARGET: string
  export const DIR_TARGET: string

  export function createTargets(nameToTarget: Map<String, Target>, rawList: Array<string> | n, outDir: string, packager: PlatformPackager<any>, cleanupTasks: Array<() => Promise<any>>): Array<Target>

  export function createCommonTarget(target: string): Target
}

declare module 'electron-builder/out/util/awaiter' {
   var _default: (thisArg: any, _arguments: any, ignored: any, generator: Function) => any
  export = _default
}

declare module 'electron-builder/out/util/binDownload' {
  
  export function downloadFpm(version: string, osAndArch: string): Promise<string>

  export function getBinFromBintray(name: string, version: string, sha2?: string): Promise<string>

  export function getBin(name: string, dirName: string, url: string, sha2?: string): Promise<string>
}

declare module 'electron-builder/out/util/deepAssign' {
  
  export function deepAssign(target: any, ...objects: Array<any>): any
}

declare module 'electron-builder/out/util/filter' {
  /// <reference types="node" />
  import { Stats } from "fs-extra-p"
  import { Minimatch } from "minimatch"

  export function copyFiltered(src: string, destination: string, filter: Filter, dereference: boolean): Promise<any>

  export function hasMagic(pattern: Minimatch): boolean
  export type Filter = (file: string, stat: Stats) => boolean

  export function createFilter(src: string, patterns: Array<Minimatch>, ignoreFiles?: Set<string>, rawFilter?: (file: string) => boolean, excludePatterns?: Array<Minimatch> | null): Filter

  export function devDependencies(dir: string): Promise<Array<string>>
}

declare module 'electron-builder/out/util/httpRequest' {
  /// <reference types="node" />
  import { ClientRequest } from "http"
  import { Promise as BluebirdPromise } from "bluebird"

  export interface DownloadOptions {
    skipDirCreation?: boolean
    sha2?: string
  }
  export const download: (url: string, destination: string, options?: DownloadOptions | undefined) => BluebirdPromise<any>

  export function addTimeOutHandler(request: ClientRequest, callback: (error: Error) => void): void
}

declare module 'electron-builder/out/util/log' {
  import { Promise as BluebirdPromise } from "bluebird"

  export function warn(message: string): void

  export function log(message: string): void

  export function subTask(title: string, promise: BluebirdPromise<any> | Promise<any>): BluebirdPromise<any>

  export function task(title: string, promise: BluebirdPromise<any> | Promise<any>): BluebirdPromise<any>
}

declare module 'electron-builder/out/util/promise' {
  import { Promise as BluebirdPromise } from "bluebird"

  export function printErrorAndExit(error: Error): void

  export function executeFinally<T>(promise: Promise<T>, task: (errorOccurred: boolean) => Promise<any>): Promise<T>

  export class NestedError extends Error {
    constructor(errors: Array<Error>, message?: string)
  }

  export function all(promises: Array<Promise<any>>): BluebirdPromise<any>
}

declare module 'electron-builder/out/util/readPackageJson' {
  
  export function readPackageJson(file: string): Promise<any>
}

declare module 'electron-builder/out/util/tmp' {
  import { Promise as BluebirdPromise } from "bluebird"

  export class TmpDir {
    getTempFile(suffix: string): BluebirdPromise<string>
    cleanup(): Promise<any>
  }
}

declare module 'electron-builder/out/util/util' {
  /// <reference types="debug" />
  /// <reference types="node" />
  import { ChildProcess, SpawnOptions } from "child_process"
  import { Promise as BluebirdPromise } from "bluebird"
  import { Stats } from "fs-extra-p"
  import debugFactory = require("debug")
  export const debug: debugFactory.IDebugger
  export const debug7z: debugFactory.IDebugger

  export function installDependencies(appDir: string, electronVersion: string, arch?: string, command?: string): BluebirdPromise<any>

  export function getGypEnv(electronVersion: string, arch: string): any

  export function spawnNpmProduction(command: string, appDir: string, env?: any): BluebirdPromise<any>

  export interface BaseExecOptions {
    cwd?: string
    env?: any
    stdio?: any
  }

  export interface ExecOptions extends BaseExecOptions {
    customFds?: any
    encoding?: string
    timeout?: number
    maxBuffer?: number
    killSignal?: string
  }

  export function removePassword(input: string): string

  export function exec(file: string, args?: Array<string> | null, options?: ExecOptions): BluebirdPromise<string>

  export function doSpawn(command: string, args: Array<string>, options?: SpawnOptions, pipeInput?: Boolean): ChildProcess

  export function spawn(command: string, args?: Array<string> | null, options?: SpawnOptions): BluebirdPromise<any>

  export function handleProcess(event: string, childProcess: ChildProcess, command: string, resolve: ((value?: any) => void) | null, reject: (reason?: any) => void): void

  export function getElectronVersion(packageData: any, packageJsonPath: string): Promise<string>

  export function statOrNull(file: string): Promise<Stats | null>

  export function computeDefaultAppDirectory(projectDir: string, userAppDir: string | null | undefined): Promise<string>

  export function use<T, R>(value: T | null, task: (it: T) => R): R | null

  export function debug7zArgs(command: "a" | "x"): Array<string>

  export function getTempName(prefix?: string | n): string

  export function isEmptyOrSpaces(s: string | n): boolean

  export function unlinkIfExists(file: string): BluebirdPromise<string>

  export function asArray<T>(v: n | T | Array<T>): Array<T>

  export function isCi(): boolean
}

declare module 'electron-builder/out/windowsCodeSign' {
  
  export function getSignVendorPath(): Promise<string>

  export interface SignOptions {
    readonly path: string
    readonly cert?: string | null
    readonly subjectName?: string | null
    readonly name?: string | null
    readonly password?: string | null
    readonly site?: string | null
    readonly hash?: Array<string> | null
    readonly tr?: string | null
  }

  export function sign(options: SignOptions): Promise<void>
}

declare module 'electron-builder/out/winPackager' {
  import { PlatformPackager, BuildInfo, Target } from "electron-builder/out/platformPackager"
  import { Platform, WinBuildOptions, Arch } from "electron-builder/out/metadata"
  import { SignOptions } from "electron-builder/out/windowsCodeSign"

  export interface FileCodeSigningInfo {
    readonly file?: string | null
    readonly password?: string | null
    readonly subjectName?: string | null
  }

  export class WinPackager extends PlatformPackager<WinBuildOptions> {
    readonly cscInfo: Promise<FileCodeSigningInfo | null> | null
    constructor(info: BuildInfo)
    createTargets(targets: Array<string>, mapper: (name: string, factory: (outDir: string) => Target) => void, cleanupTasks: Array<() => Promise<any>>): void
    readonly platform: Platform
    getIconPath(): Promise<string>
    pack(outDir: string, arch: Arch, targets: Array<Target>, postAsyncTasks: Array<Promise<any>>): Promise<any>
    protected computeAppOutDir(outDir: string, arch: Arch): string
    sign(file: string): Promise<void>
    protected doSign(options: SignOptions): Promise<any>
    signAndEditResources(file: string): Promise<void>
    protected postInitApp(appOutDir: string): Promise<void>
    protected packageInDistributableFormat(outDir: string, appOutDir: string, arch: Arch, targets: Array<Target>, promises: Array<Promise<any>>): void
  }
}

