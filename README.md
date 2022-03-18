[![CircleCI](https://circleci.com/gh/qlik-oss/sn-table.svg?style=shield)](https://circleci.com/gh/qlik-oss/sn-table)
[![Maintainability](https://api.codeclimate.com/v1/badges/cffe9ecd336c16de6dc2/maintainability)](https://codeclimate.com/github/qlik-oss/sn-table/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/cffe9ecd336c16de6dc2/test_coverage)](https://codeclimate.com/github/qlik-oss/sn-table/test_coverage)

# sn-table

Table supernova for [nebula.js]

More specifics and information about the sn-table can be found in [the Qlik developer portal](https://qlik.dev/libraries-and-tools/visualizations/table).

## Mashup Usage

### Installing

If you use npm:

`npm install @nebula.js/sn-table`

```js
import { embed } from '@nebula.js/stardust';
import table from '@nebula.js/sn-table';

// 'app' is an enigma app model
const nuked = embed(app, {
  types: [{ // register the table object
    name: 'table',
    load: () => Promise.resolve(table);
  }]
});

nuked.render({
  element,
  type: 'table',
});
```

Look into [Build a simple mashup using nebula.js](https://qlik.dev/tutorials/build-a-simple-mashup-using-nebulajs) and [Embed a visualization](https://qlik.dev/libraries-and-tools/nebulajs/rendering) to learn more.

[Check full examples](./mashup-example) of the mashup usage.

## Visualization Extension Usage

### Building and adding the sn-table extension to Qlik Sense

Install all dependencies:

```sh
yarn
```

Build a nebula.js visualization as a Qlik Sense extension:

```sh
yarn build
```

Compress the generated 'dist' folder into the 'application/zip' file format and rename it to 'sn-table-ext'.

|                          [Saas Edition of Qlik Sense]                           |                     [Qlik Sense Enterprise]                      |                            [Qlik Sense Desktop]                            |
| :-----------------------------------------------------------------------------: | :--------------------------------------------------------------: | :------------------------------------------------------------------------: |
| Copy sn-table-ext into https://your-tenant.us.qlikcloud.com/console/extensions/ | Copy sn-table-ext into Qlik Management Console (QMC)->Extensions | Copy sn-table-ext into ..\Users\<UserName>\Documents\Qlik\Sense\Extensions |

## API

The API can also be found in [the Qlik developer portal](https://qlik.dev/apis/javascript/nebula-table)

## Contribution

To learn how to run a sn-table extension using nebula development server and develop, see our [contributing guide](./.github/CONTRIBUTION.md).

## Package

| name       | status                             | description                   |
| ---------- | ---------------------------------- | ----------------------------- |
| [sn-table] | [![sn-table-status]][sn-table-npm] | table supernova for nebula.js |

## License

`@nebula.js/sn-table` is [MIT licensed](./LICENSE).

[nebula.js]: https://qlik.dev/libraries-and-tools/nebulajs
[sn-table]: https://github.com/qlik-oss/sn-table
[sn-table-status]: https://img.shields.io/npm/v/@nebula.js/sn-table.svg
[sn-table-npm]: https://www.npmjs.com/package/@nebula.js/sn-table
[saas edition of qlik sense]: https://help.qlik.com/en-US/cloud-services/Subsystems/Hub/Content/Sense_Hub/Admin/mc-extensions.htm
[qlik sense enterprise]: https://help.qlik.com/en-US/sense-developer/May2021/Subsystems/Extensions/Content/Sense_Extensions/Howtos/deploy-extensions.htm
[qlik sense desktop]: https://help.qlik.com/en-US/sense-developer/May2021/Subsystems/Extensions/Content/Sense_Extensions/Howtos/deploy-extensions.htm
