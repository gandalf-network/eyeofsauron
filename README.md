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

    const activities = data.data

    for (const activity of activities) {
        console.log(activity?.id)

        const activityMetadata = activity?.metadata

        if (activityMetadata?.__typename === "NetflixActivityMetadata") {
            console.log(activityMetadata.title)
            console.log(activityMetadata.date)
            console.log(activityMetadata.subject)
        }
    }

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

    console.log(activity.id)

    if (activity.metadata.__typename === "NetflixActivityMetadata") {
        console.log(activity.metadata.date)
        console.log(activity.metadata.title)
        console.log(activity.metadata.subject)
    }
} catch (error: any) {
    console.log(error)
}
```

#### Get Traits

```typescript
// index.ts

try {
    const { data: activity } = await eye.getTraits({
        dataKey: "MY_DATA_KEY",
        source: Source.UBER,
        labels: [TraitLabel.RATING, TraitLabel.TRIP_COUNT, TraitLabel.ACCOUNT_CREATED_ON],
    })

    console.log(activity)
} catch (error: any) {
    console.log(error)
}
```

#### Lookup Traits

```typescript
// index.ts

try {
    const { data: activity } = await eye.lookupTrait({
        dataKey: "MY_DATA_KEY",
        traitId: "TRAIT_ID",
    })

    console.log(activity)
} catch (error: any) {
    console.log(error)
}
```

## Contributing

Contributions are welcome, whether they're feature requests, bug fixes, or documentation improvements.
