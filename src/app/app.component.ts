import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Option } from './Option';
import { User } from './User';
import { Loan } from './Loan';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {

  mortgageForm: FormGroup;
  terms: Array<number> = [10, 20, 30];

  constructor(private fb: FormBuilder) {
    this.createForm();
  }

  createForm() {
    this.mortgageForm = this.fb.group({
      surname: [
        '',
        [Validators.required, Validators.minLength(2)]
      ],
      email: [
        '',
        [Validators.required, Validators.email]
      ],
      phone: [
        '',
        [Validators.required, Validators.minLength(2), Validators.pattern(/^[0-9]+$/g)]
      ],
      salary: [
        '',
        [Validators.required, Validators.min(0)]
      ],
      deposit: [
        '',
        [Validators.required, Validators.min(0)]
      ],
      term: [
        '',
        Validators.required
      ],
      loanAmount: [
        '',
        [Validators.required, Validators.min(0)]
      ],
      hasAccount: [
        '',
        Validators.required
      ]
    });
  }

  /*  validateSurname(val: any) {
      val = this.strip(val);
      this.user.surname = val;

      const surnameRegex = new RegExp(/^[A-z]+$/g);
      this.validSurname = (val.length >= 3) && surnameRegex.test(val) === true;
    }
  */

  /*
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
  */


  // Remove spaces and replace commas from string
  private strip(val: any) {
    return val.trim().replace(/[, ]/g, '');
  }

  // Make sure the amount is a positive number
  private isValidAmount(val: any) {
    return isNaN(val) === false && val >= 0;
  }

}
