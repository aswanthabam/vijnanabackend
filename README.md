# TechFest Backend

This is the backend code for Vijnana, Tech fest of my college Government College Thalassery. This API do the follwing tasks:

- User Account Creation (By Email / Google)
- Event CRUD operations (Admin Only)
- User Event Registration
- Dashboard and Status of event and user

## Running the server localy

You can run the server localy using the following steps

- Clone the repo
- Run `npm install`
- Setup enviornment variables
- Start the mongodb database server
- Run the project using the command

  ```bash
  npm run dev
  ```

## Endpoints

Here i list the main endpoints of the API

### User Related

- `/api/v2/users/createAccount` `POST`
- `/api/v2/users/createAccount/google` `POST`
- `/api/v2/users/createAccount/complete` `POST`
- `/api/v2/users/login` `POST`
- `/api/v2/users/details` POST
