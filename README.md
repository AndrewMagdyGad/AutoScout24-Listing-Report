# AutoScout24 Listing Report

This is a web application that displays / outputs the listing reports.

The reports should include:

-   Average Listing Selling Price per Seller Type
-   Distribution (in percent) of available cars by Mak
-   Average price of the 30% most contacted listing
-   The Top 5 most contacted listings per Month

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

## Prerequisites

Your machine should have

-   Node (at least 10)
-   Git
-   NPM

## Installing

This project consists of two parts. The first one is the `server` which responsible to expose APIs to get used by the client user. The second one is the `client` which is a React app that shows the proper reports and call the appropiate end-points

To run this project locally we need to
do three steps:

-   clone this project.
-   run the `server` part.
-   run the `client` part.

### Run Server Part

```sh
    cd server
    npm install
    npm run start
```

after these steps the server should be up and running at `http://localhost:8080/`

**Important Note**

In the `server/package.json` file, line 12. for the `postbuild` script the command `cp` is used to copy the data source files from the `src/db` folder to the `dist/db` and it is `Ubuntu` command. So if you are running this project on windows, you may need to use an equivelent command. (or for simplicity, just copy this `db` folder manually)

### Run Client Part

```sh
    cd client
    npm install
    npm run start
```

after these steps the client should be up and running at `http://localhost:3000/`

## Built With

-   [Express.js](https://expressjs.com/)
-   [TypeScript](https://www.typescriptlang.org/)
-   [React.js](https://reactjs.org/)
