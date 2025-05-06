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
