export class User {
  surname: String;
  email: String;
  phone: String;
  salary: any;
  hasAccount: Boolean;

  constructor() {
    this.surname = '';
    this.email = '';
    this.phone = '';
    this.salary = null;
    this.hasAccount = false;
  }
}
