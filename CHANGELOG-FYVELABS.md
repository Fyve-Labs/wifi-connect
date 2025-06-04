## [5.0.5](https://github.com/Fyve-Labs/wifi-connect/compare/v5.0.4...v5.0.5) (2025-06-04)


### Bug Fixes

* **fix-wifi-conenct:** fixing connect timeout issues to restart connection if failed ([7002f2d](https://github.com/Fyve-Labs/wifi-connect/commit/7002f2d5e7d4c3c079df383e7548a13707aebd4e))

## [5.0.4](https://github.com/Fyve-Labs/wifi-connect/compare/v5.0.3...v5.0.4) (2025-05-10)


### Bug Fixes

* **check-data:** update check interval variable for script ([04a016b](https://github.com/Fyve-Labs/wifi-connect/commit/04a016b6e69f9dbb1534ea2b6084874eb9c74acf))

## [5.0.3](https://github.com/Fyve-Labs/wifi-connect/compare/v5.0.2...v5.0.3) (2025-05-08)


### Bug Fixes

* **add-env-setting:** add new env setting for connectivity ping and check interval ([7aa7eaa](https://github.com/Fyve-Labs/wifi-connect/commit/7aa7eaadab9ad3c926f871d3a4e0e641c2597f6f))

## [5.0.2](https://github.com/Fyve-Labs/wifi-connect/compare/v5.0.1...v5.0.2) (2025-05-07)


### Bug Fixes

* **emulators:** don't sweat the slow build on mismatched platforms, for now build on hardware through balena ([888036b](https://github.com/Fyve-Labs/wifi-connect/commit/888036b58de92d3538ad99f48102dfdc54409758))
* **pr-build:** refactor for test build on pull requests, semantic bump on merge/push ([639702f](https://github.com/Fyve-Labs/wifi-connect/commit/639702f78863e83071f928a82285c5613624aaa0))

## [5.0.1](https://github.com/Fyve-Labs/wifi-connect/compare/v5.0.0...v5.0.1) (2025-05-07)


### Bug Fixes

* **qemu-builds:** attempt to move to emulated build on docker ([9603bfd](https://github.com/Fyve-Labs/wifi-connect/commit/9603bfd41fed289386a35e3bf002b3d35f2c4355))

## [1.1.3](https://github.com/Fyve-Labs/wifi-connect/compare/v1.1.2...v1.1.3) (2025-05-07)

### Features

* use dynamic versioning in semantic-release ([684e27d](https://github.com/Fyve-Labs/wifi-connect/commit/684e27d2c2ad9a8f805320ceb9a620eeae677e7f))

### Bug Fixes
* **build:** fix naming and logos, bump builds for automation, and deploy with balena for device type ([dd9ccae](https://github.com/Fyve-Labs/wifi-connect/commit/dd9ccae176ce664bb553fb826df7239487fe4750), [7a25783](https://github.com/Fyve-Labs/wifi-connect/commit/7a257833b73faf2d1e03462e187a0434071901a8), [43cc3de](https://github.com/Fyve-Labs/wifi-connect/commit/43cc3de5b2a7f981381cc612cda55cce2b90ff53), [6a5d1c4](https://github.com/Fyve-Labs/wifi-connect/commit/6a5d1c4c9f1cf13289d400995dd579116bc236cb))
* **semantic-version:** update fix for semantic version and macOS compatibility ([6dd570a](https://github.com/Fyve-Labs/wifi-connect/commit/6dd570a4a4754ebae7a67b502bb498f79fed5896), [93f68cd](https://github.com/Fyve-Labs/wifi-connect/commit/93f68cd138b13b91aca969343faa93f4a41690f2))
* **builds:** semantic version bumping and integration for balena deploy, add device type instead of arch for build emulation ([6a5d1c4](https://github.com/Fyve-Labs/wifi-connect/commit/6a5d1c4c9f1cf13289d400995dd579116bc236cb), [a1240d9](https://github.com/Fyve-Labs/wifi-connect/commit/a1240d918e7bae656c6a165e67a924764ef1479d))


## [1.0.1](https://github.com/Fyve-Labs/wifi-connect/compare/v1.0.0...v1.0.1) (2025-05-06)


### Bug Fixes

* **build:** add device type instead of arch for build emulation ([a1240d9](https://github.com/Fyve-Labs/wifi-connect/commit/a1240d918e7bae656c6a165e67a924764ef1479d))

# 1.0.0 (2025-05-06)


### Bug Fixes

* **backend-clean:** refactor backend connection, add another cursor file, confirm build ([11d3865](https://github.com/Fyve-Labs/wifi-connect/commit/11d386565b4cef9a24c5554c03be6aa0be851fa5))
* **backend:** confirm functionality working with next, updated rust, etc (good checkpoint here) ([501cf4c](https://github.com/Fyve-Labs/wifi-connect/commit/501cf4c538ac0479921012c02c588c7f462cb7ce))
* **backend:** fix backend redirection, publish server on available ports, fix serve of exported UI ([9d900b9](https://github.com/Fyve-Labs/wifi-connect/commit/9d900b979e67ef94e702986dad290c12d40b20d1))
* **backend:** upgrade backend rust to 2021 edition code; minor tweaks for ports and launch ([2e7c85d](https://github.com/Fyve-Labs/wifi-connect/commit/2e7c85dd94a86cfcfde5f74b905cb136fcb9c056))
* **backend:** work on backend and build script updates (WIP), including active monitor ([e12572b](https://github.com/Fyve-Labs/wifi-connect/commit/e12572bca026932e74df6ec1c9d400ce3b6f970d))
* **brand-connect:** tweak connection ui for brand message and reconnect sessions ([9e8aa91](https://github.com/Fyve-Labs/wifi-connect/commit/9e8aa91801e671249253bb819fc02c3695f3ddae))
* **compose:** fix docker compose errors ([f8b3b06](https://github.com/Fyve-Labs/wifi-connect/commit/f8b3b06721b160b50840a59c2d49f8f9b328dc0f))
* **linting-ui:** fix the ui for linting in new nextjs framework, some attempted call (WIP); husky ci commit hook disabled ([0ce8b35](https://github.com/Fyve-Labs/wifi-connect/commit/0ce8b353b20826fdb35763d8cea75d614604f8d6))
* **network-scan:** fix scan, ui interaction ([4081527](https://github.com/Fyve-Labs/wifi-connect/commit/4081527e5b9c376d81994a32d0db388a42010610))
* **network:** tweak network reset and retrieval ; timing as daemon ([a630516](https://github.com/Fyve-Labs/wifi-connect/commit/a630516dbc28387f1990f93e8d729bf80ab21bca))
* **reconnect:** add reconnect interval, update readme, warning fix ([ccf3f5f](https://github.com/Fyve-Labs/wifi-connect/commit/ccf3f5fb967b3454342f5cb0035ba9070cf53adc))
* **ui:** finish refactor for nextjs and npm/node updates (WIP, not functional yet) ([9fc417d](https://github.com/Fyve-Labs/wifi-connect/commit/9fc417dfcfeaa9df9062f0fb680ec0d20408553c))
* **wifi-connect:** partial fix for wifi connect from portal click ([48a9d6e](https://github.com/Fyve-Labs/wifi-connect/commit/48a9d6e074f0b767201e04c74b7b421e4aeeceed))


### Features

* **build:** build push for new fyve wifi version ([cbcb293](https://github.com/Fyve-Labs/wifi-connect/commit/cbcb293af346aafcaca9a38978695e424794b689))
* **cursor-rules:** adding cursor rules for faster project iteration ([246d67c](https://github.com/Fyve-Labs/wifi-connect/commit/246d67c393022dc2d25b9b912a7762ec21298abc))
* **self-build:** local build prep for wifi tool, make it generic for os to auto start ([9493499](https://github.com/Fyve-Labs/wifi-connect/commit/94934994b27f957749b98252b17d78335552e009))

# Change Log - FyveLabs Fork

All notable changes to the FyveLabs fork of this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

# v5.0.0
## (2025-04-30)

* Initial fork from balena-io/wifi-connect
* Created separate changelog for FyveLabs-specific changes
