# eyeofsauron

eyeofsauron is a command-line tool designed to generate the necessary files that makes it super easy to interact with the Sauron API. It completely abstracts away the complexity of authentication and interacting with the GraphQL APIs.

## Features

- Generate necessary files required for interacting with the Sauron API
- Automatically install required dependencies

## Installation

### Prerequisites

- [NodeJS](https://nodejs.org/) - version 16.x or higher

### Installing eyeofsauron

```bash

npm install -g @gandalf-network/eyeofsauron

```

## Usage

```bash

eyeofsauron generate

```

### Flags

- -f, --file [filename]: Specify the filename of the file to be generated
- -j, --javascript : Specify if the generated files should be compiled to Javascript.

### Using the Generated Files

Once you have successfully generated the necessary files and installed the required dependencies using eyeofsauron, you can proceed to use these files to interact with the API.

#### Initialization

```typescript
// index.ts

// Change eyeofsauron to whatever name you specified for the file generation
import Eye, { Source } from './eyeofsauron';

const privateKey = process.env.PRIVATE_KEY
const eye = new Eye({ privateKey })
```

#### Get Activity

```typescript
// index.ts

async function getActivity() {
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
}
```

#### Lookup Activity

```typescript
// index.ts

async function lookupActivity() {
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
}
```

## Contributing

Contributions are welcome, whether they're feature requests, bug fixes, or documentation improvements.
