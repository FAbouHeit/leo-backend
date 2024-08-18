/*
* check if email is valid. self-explanatory
*/
export const emailRegex = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}
 
/*
* Rules: 
* At least 8 characters long.
* Contains both lowercase and uppercase letters.
* Includes at least one number.
* Has at least one special character.
*/
  export const passwordRegex = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  }

/*
* Rules:
* name contains at least one letter
* name is at least 2 characters long.
*/
  export const nameRegex = (name) => {
    const regex = /^(?=.*[a-zA-Z]).{2,}$/;
    return regex.test(name);
  }