# sf-sql-mirror
Data import from salesforce into a mysql database using the bulk load API.

### Dependencies
- Node

### Run
- Extract data from salesforce: `mkdir -p tmp/ && npm run extract`
- Load extracted files from tmp/ to mysql: `npm run load`

### Setup

#### Create database schema from salesforce (optional)

You can recreate the tables managed in your config.json by infering data types and constraints from salesforce describe.
Mostly useful for development.
```
npm run setup
```

#### config.json
Create a config.json file of the exports, look at config.json.sample.

#### Environment Variables
A few envrionment variables are required to be setup to connect to salesforce and your database, you can have a look
at .env.sample.

### Development

You can use `bin/start-db.sh` and `bin/connect-db.sh` (requires docker) to run a local ephemeral MySQL server and play with this.

