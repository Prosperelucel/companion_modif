# companion-module-bmd-atem

## Getting started

Executing a `yarn` command should perform all necessary steps to develop the module, if it does not then follow the steps below.

This project is written in typescript. As companion core does not currently provide typescript definitions, we need to 'inject' them to satisfy the requirements set out by the compiler. This can be done manually with `yarn fix-types`. These types will need updating if the interfaces in companion change, or when adding anything that was previously missed. Hopefully these can soon be merged upstream, and looked after as part of the core project.

The module can be built once with `yarn build`. This should be enough to get the module to be loadable by companion.

While developing the module, by using `yarn build:watch` the compiler will be run in watch mode to recompile the files on change.

## Changes

### v2.4.1

- Revert connection library change

### v2.4.0

- More stable connection library
- Variables for media pool
- Variables for media players

### v2.3.0

- Add definitions for Mini
- Add tally feedback

### v2.2.0

- Set fade to black rate
- Execute fade to/from black
- Variables for current aux source
- Add definitions for TVS Pro models

### v2.1.0

- Change transition selection
- Set SuperSource box On Air
- Change SuperSource geometry properties
- Change media player source

### v2.0.0

- Update atem-connection to support v8 firmware.
- Add support for ATEM Constellation.
- Rewrite in Typescript with some linting and formatting rules.
- Fix changing supersource box resetting other properties
- Fix keyer toggles sometimes getting stuck
- Add support for setting transition type and rate

### v1.1.0

- Module in ES6 format (no self and use of =>)
- this.states[] use abstracted to getXX(...) and updateXX(...) calls
- Model parameters moved to 'CONFIG_MODEL' array
