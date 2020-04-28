<h1 align="center">
  <img alt="Fastfeet" title="Fastfeet" src=".github/logo.png" width="300px" />
</h1>

<p align="center">Project developed during Rocketseat GoStack Bootcamp - Challenge</p>

<p align="center">
  <a href="https://github.com/frassaolucas">
    <img alt="Made By" src="https://img.shields.io/badge/made%20by-frassaolucas-%2304D361">
  </a>
  <img alt="License" src="https://img.shields.io/badge/license-MIT-%2304D361">
</p>

## :rocket: Technologies Used

<ul>
  <li>
    <a href="https://nodejs.org/en/">
      Node.js
    </a>
  </li>
  <li>
    <a href="https://www.docker.com/">
      Docker
    </a>
  </li>
  <li>
    <a href="https://docs.docker.com/compose/">
      Postgres
    </a>
  </li>
  <li>
    <a href="https://www.mongodb.com/">
      MongoDB
    </a>
  </li>
  <li>
    <a href="https://github.com/expressjs/express">
      Express
    </a>
  </li>
  <li>
    <a href="https://redis.io/">
      Redis
    </a>
  </li>
  <li>
    <a href="https://github.com/bee-queue/bee-queue">
      Bee-Queue
    </a>
  </li>
</ul>

## :fire: Configuring

Create Docker containers:

```
# Instale uma imagem do Redis
docker run --name redisfastfeet -p 6379:6379 -d -t redis:alpine

# Instale uma imagem do Postgres
docker run --name fastfeet -e POSTGRES_PASSWORD=fastfeet -p 5432:5432 -d postgres
(Neste caso, seu login e senha será: fastfeet)
```

### :open_file_folder: Backend

On your terminal, access the project folder and run the following commands:

```
#install all dependencies
yarn
```

Configure the .env file with your access credindials in order to access the database.

Also, run the following commands

```
# running the migrations
yarn sequelize db:migrate

# creating admin user
yarn sequelize db:seed:all

# starting the application
yarn dev

# starting queue
yarn queue
```
