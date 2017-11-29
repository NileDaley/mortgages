export class User {
  surname: string;
  email: string;
  phone: string;
  salary: number;
  hasAccount: Boolean;

  constructor() {
    this.surname = '';
    this.email = '';
    this.phone = '';
    this.salary = null;
    this.hasAccount = false;
  }
}
