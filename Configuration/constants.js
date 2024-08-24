/*
* MongoDB Configuration
*/
export const DB_CONNECTION_ATTEMPTS = 3
export const DB_ATTEMPT_DELAY = 15000

/*
* Max limit to Activate Account.
*/
export const ACCOUNT_ACTIVATION_TIME_LIMIT = 15 * 60 * 1000 //15 minutes


/*
* Time limit to enter a two-factor authorization code.
*/
export const TWO_FACTOR_AUTH_TIME_LIMIT = 10 * 60 * 6000