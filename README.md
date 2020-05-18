# ocs-express-api
This repository has been created with Express and JEST
### Example of stack:
- Node version: 12.13.0
- NPM version: 6.12.0
## How to run
This project follows Express structure:
### Install
```
npm install
```
### Test
```
npm run test
```
### Start
```
npm run start
```
It can be loaded as well with *nodemon*
## API Interface
```
/ 
```
Root endpoint, It should retrieves JSON with message "OK" in order to check that API is properly working.
```
/api/athletes
{
  params: {
    page_number: [default = 1],
    page_size: [default = 10]
  }
}
```
**GET API** endpoint that retrieves array of games descendingly sorted by year, where should be found information about each *GAME*,
including array of athletes descendingly sorted by score in current game.
```
/api/athletes/{id}
```
**GET API** endpoint that retrieves an athlete object with detailed information.
```
{any other endpoint not defined}
```
Any other endpoint not defined should return *404 HTTP error*.
## Example
There has been deployed to Heroku a prod example for this app, that could be checked here:
[API on Heroku](https://ocs-express-api.herokuapp.com)
