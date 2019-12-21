# sf-sql-mirror
Data import from salesforce into a mysql database using the bulk load API.

### Dependencies
- docker & docker-compose

### Build
- A few envrionment variables are required to connect to properly build the database, see .env.sample.
- docker-compose build

### Setup

- Create a config.json file of the exports schema, look at config.json.sample.
- Start the database with `docker-compose up -d db`
- Setup the database schema with `docker-compose run loader npm run setup`

### Run
- Extract data from salesforce: `docker-compose run loader npm run extract`
- Load extracted data: `docker-compose run loader npm run extract`
