# eyeofsauron

eyeofsauron is a command-line tool designed to generate the necessary files that makes it super easy to interact with the Sauron API. It completely abstracts away the complexity of authentication and interacting with the GraphQL APIs.

## Features

- Generate necessary files required for interacting with the Sauron API
- Automatically install required dependencies

## Installation

### Prerequisites

- [NodeJS](https://nodejs.org/) - version 18.x or higher

### Installing eyeofsauron

```bash

npm install -g @gandalf-network/eyeofsauron

```

## Usage

```bash

eyeofsauron generate

```

### Flags

- -f, --folder [folder]: Set the destination folder for the generated files

- -esm, --esModules : Generate JavaScript files as ESModules, utilizing `import` statements for module imports.

- -c, --commonJS : Generate JavaScript files as CommonJS modules, using `require` statements for module imports.

- -ts, --typescript : Generate TypeScript files.

### Using the Generated Files

Once you have successfully generated the necessary files and installed the required dependencies using eyeofsauron, you can proceed to use these files to interact with the API.

#### Initialization

```typescript
// Typescript

// Change eyeofsauron to whatever name you specified for the file generation
import Eye, { Source } from './eyeofsauron';

const privateKey = process.env.PRIVATE_KEY
const eye = new Eye({ privateKey })
```

```javascript
// ESModules

// Change eyeofsauron to whatever name you specified for the file generation
import Eye, { Source } from './eyeofsauron/index.js'

const privateKey = process.env.PRIVATE_KEY
const eye = new Eye({ privateKey })
```

```javascript
// CommonJS

// Change eyeofsauron to whatever name you specified for the file generation
const Eye = require('./eyeofsauron').default
const { Source } = require('./eyeofsauron')

const privateKey = process.env.PRIVATE_KEY
const eye = new Eye({ privateKey })
```

#### Get Activity

```typescript
// index.ts

try {
    const { data } = await eye.getActivity({
        dataKey: "MY_DATA_KEY",
        source: Source.Netflix,
        limit: 10,
        page: 1,
    })

    console.log(data)
    /*
    Returns
    {
        limit: 10,
        total: 3409,
        page: 1,
        __typename: "ActivityResponse",
        data: [
            {
                id: 'ACTIVITY_ID',
                metadata: {
                    title: "Judge Dee's Mystery: Season 1: Episode 3",
                    subject: [
                        { value: 'tt31473598', identifierType: 'IMDB' },
                        { value: '10296096', identifierType: 'TVDB'}
                    ],
                    lastPlayedAt: '01/01/2024',
                    __typename: 'NetflixActivityMetadata'
                },
                __typename: 'Activity'
            }
            ...,
        ]
    }
    */

} catch (error: any) {
    console.log(error)
}
```

#### Lookup Activity

```typescript
// index.ts

try {
    const { data: activity } = await eye.lookupActivity({
        dataKey: "MY_DATA_KEY",
        activityId: "ACTIVITY_ID",
    })

    console.log(activity)
    /*
    Returns
        {
            id: 'ACTIVITY_ID',
            metadata: {
                title: "Judge Dee's Mystery: Season 1: Episode 3",
                subject: [
                    { value: 'tt31473598', identifierType: 'IMDB' },
                    { value: '10296096', identifierType: 'TVDB'}
                ],
                lastPlayedAt: '01/01/2024',
                __typename: 'NetflixActivityMetadata'
            },
            __typename: 'Activity'
        }
    */

} catch (error: any) {
    console.log(error)
}
```

#### Get Traits

```typescript
// index.ts

try {
    const { data: traits } = await eye.getTraits({
        dataKey: "MY_DATA_KEY",
        source: Source.UBEREATS,
        labels: [TraitLabel.RATING, TraitLabel.TRIP_COUNT],
    })

    console.log(trait)
    /*
    Returns
        [
            {
                id: 'TRAIT_ID',
                source: 'UBER',
                label: 'RATING',
                value: '4.8',
                timestamp: '2024-06-11T11:41:00.552647Z',
                __typename: 'Trait'
            },
            {
                id: 'TRAIT_ID',
                source: 'UBER',
                label: 'TRIP_COUNT',
                value: '76',
                timestamp: '2024-06-11T11:41:00.552647Z',
                __typename: 'Trait'
            },
        ]
    */
} catch (error: any) {
    console.log(error)
}
```

#### Lookup Traits

```typescript
// index.ts

try {
    const { data: trait } = await eye.lookupTrait({
        dataKey: "MY_DATA_KEY",
        traitId: "TRAIT_ID",
    })

    console.log(trait)
    /*
    Returns
        {
            id: 'TRAIT_ID',
            source: 'UBER',
            label: 'RATING',
            value: '4.8',
            timestamp: '2024-06-11T11:41:00.552647Z',
            __typename: 'Trait'
        },
    */
} catch (error: any) {
    console.log(error)
}
```

## Contributing

Contributions are welcome, whether they're feature requests, bug fixes, or documentation improvements.
