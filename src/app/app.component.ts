import { Component, Inject } from '@angular/core';
import { Option } from './Option';
import { User } from './User';
import { Loan } from './Loan';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {

  user: User;
  options: Array<Option>;
  loan: Loan;

  constructor() {
    this.user = new User;
    this.loan = new Loan;
    this.options = [
      new Option('A', 0.008, [10, 20], 4 * this.user.salary, 0, false),
      new Option('B', 0.007, [10, 20], 4.1 * this.user.salary, 0, true),
      new Option('C', 0.006, [20], 5 * (this.user.salary + this.loan.deposit), 10000, false),
      new Option('D', 0.004, [10, 30], 6 * (this.user.salary + this.loan.deposit), 20000, false),
      new Option('E', 0.002, [10, 20], 7 * (this.user.salary + this.loan.deposit), 40000, true)
    ];
  }

  termOptions: Array<Number> = [10, 20, 30];

  availableOptions: Array<any>;

  validSurname: Boolean = false;
  validPhone: Boolean = false;
  validDeposit: Boolean = false;
  validSalary: Boolean = false;
  validLoanAmount: Boolean = false;

  totalPayable(interest) {
    return (this.loan.amount * (1 + interest)).toFixed(2);
  }

  validateSurname(val: any) {
    val = this.strip(val);
    this.user.surname = val;

    const surnameRegex = new RegExp(/^[A-z]+$/g);
    this.validSurname = (val.length >= 3) && surnameRegex.test(val) === true;
  }

  validatePhone(val: any) {

    val = this.strip(val);

    // Set update the model to be the stripped value
    this.user.phone = val;

    // example: +447400701200 OR +4407400701200
    const phoneCodeRE = new RegExp(/^([+]([0-9]{2}))([0-9]{10,11})$/g);
    // example: 07400701200
    const phoneRE = new RegExp(/^[0-9]{11}$/g);

    // Does phone match either international code or normal phone number?
    this.validPhone = phoneRE.test(val) || phoneCodeRE.test(val);
  }

  validateDeposit(val: any) {
    val = this.strip(val);
    this.loan.deposit = val;
    this.validDeposit = this.isValidAmount(val);
    this.filterOptions();
  }

  validateSalary(val: any) {
    val = this.strip(val);
    this.user.salary = val;
    this.validSalary = this.isValidAmount(val);
    this.updateOptionAmounts();
    this.filterOptions();
  }

  validateLoanAmount(val: any) {
    val = this.strip(val);
    this.loan.amount = val;
    this.validLoanAmount = this.isValidAmount(val);
    this.filterOptions();
  }

  updateOptionAmounts() {
    const sal = this.user.salary;
    const deposit = this.loan.deposit;

    this.options.forEach((opt) => {
      switch (opt.name) {
        case 'A':
          opt.maxAmount = sal * 4;
          break;
        case 'B':
          opt.maxAmount = sal * 4.1;
          break;
        case 'C':
          opt.maxAmount = (sal + deposit) * 5;
          break;
        case 'D':
          opt.maxAmount = (sal + deposit) * 6;
          break;
        case 'E':
          opt.maxAmount = (sal + deposit) * 7;
          break;
      }
    });
  }

  filterOptions() {
    console.log('Filtering...');
    this.availableOptions = this.options;
    this.filterAccountNeeded();
    this.filterDeposit();
    this.filterTerm();
    this.filterLoanAmount();
  }

  /*
    Filter the results if user does not have account,
    but no need to filter if user has an account,
    as they can still get mortgages that don't require an account
  */
  filterAccountNeeded() {
    const hasAccount = String(this.user.hasAccount);
    if (hasAccount === 'false') {
      this.availableOptions = this.availableOptions.filter((opt) => {
        // Cast the boolean to string to do comparison
        return opt.accountNeeded === false;
      });
    }
  }

  filterDeposit() {
    const deposit = this.loan.deposit;
    this.availableOptions = this.availableOptions.filter((opt) => {
      return opt.depositRequired <= deposit;
    });
  }

  filterTerm() {
    const term = Number(this.loan.term);
    this.availableOptions = this.availableOptions.filter((opt) => {
      return opt.terms.includes(term);
    });
  }

  filterLoanAmount() {
    const requestAmount = Number(this.loan.amount);
    this.availableOptions = this.availableOptions.filter((opt) => {
      return requestAmount < opt.maxAmount;
    });
  }

  // Remove spaces and replace commas from string
  private strip(val: any) {
    return val.trim().replace(/[, ]/g, '');
  }

  // Make sure the amount is a positive number
  private isValidAmount(val: any) {
    return isNaN(val) === false && val >= 0 ;
  }

}
