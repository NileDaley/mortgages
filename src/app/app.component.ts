import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { Option } from './Option';
import { User } from './User';
import { Loan } from './Loan';
import { HttpClient } from '@angular/common/http';
import { Filter } from './Filter';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {

  showDevButtons = false;

  mortgageForm: FormGroup;
  interestRate: any = 0.03;

  user: User;
  loan: Loan;
  options: Array<Option>;
  availableOptions: Array<Option>;

  terms = [10, 20, 30];
  tableHeadings = ['', 'Interest Rate', 'Mortgage Length', 'Loan Amount', 'Amount Repayable', 'Monthly Repayment', '' ];

  constructor(private fb: FormBuilder, private currencyPipe: CurrencyPipe, private http: HttpClient) {

    // Get the interest rate from Quandl API, assign the interest rate and then create options //
    http.get(this.interestRateURL())
      .subscribe(res => {
        if (res['dataset'].data.length > 0) {
          this.interestRate = res['dataset'].data[0][1] / 100;
        } else {
          alert('Unfortunately it was not possible to get the current interest rate, it will now be set to the previous value of 3%');
        }
        this.options = this.createOptions();
      });

    this.user = new User;
    this.loan = new Loan;
    this.createForm();
    this.createGetters();
  }

  interestRateURL(): string {
    const API_KEY = 'W4nq5nDFEKpkwzvRBEuk';
    return `https://www.quandl.com/api/v3/datasets/BOE/IUDBEDR.json?rows=1&api_key=${API_KEY}`;
  }

  // Define the controls of the form
  createForm(): void {
    // Either +447000700200 or 07000700200, also allows dashes
    const phoneRE = '^[+]((?:[0-9]-?){12})$|^(?:[0-9]-?){11}$';
    // Allows numbers followed by optional 2 decimal places
    const numericRE = '^[0-9]+([\.][0-9]{1,2})?$';
    // Allows dashes in surnames
    const alphaRE = '^([A-z]+[\' -]?[A-z]+)+$';
    // Ensures emails end in . followed by letter, as angular email validator allows example@example which isnt a valid email
    const emailRE = '.+[\.][A-z]+$';

    this.mortgageForm = this.fb.group({
      surname: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.pattern(alphaRE)
        ]
      ],
      email: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.pattern(emailRE)
        ]
      ],
      phone: [
        '',
        [
          Validators.required,
          Validators.pattern(phoneRE)
        ]
      ],
      salary: [
        '',
        [
          Validators.required,
          Validators.minLength(1),
          Validators.min(0),
          Validators.pattern(numericRE)
        ]
      ],
      deposit: [
        '',
        [
          Validators.required,
          Validators.minLength(1),
          Validators.min(0),
          Validators.pattern(numericRE)
        ]
      ],
      term: [
        '',
        Validators.required
      ],
      loanAmount: [
        '',
        [
          Validators.required,
          Validators.min(0),
          Validators.pattern(numericRE)
        ]
      ],
      hasAccount: [
        '',
        Validators.required
      ]
    });
  }

  // Create the array of Options
  createOptions(): Array<Option> {
    return [
      new Option('A', this.interestRate, 0.008, [10, 20], 0, false, 4 * this.user.salary),
      new Option('B', this.interestRate, 0.007, [10, 20], 0, true, 4.1 * this.user.salary),
      new Option('C', this.interestRate, 0.006, [20], 10000, false, 5 * (this.user.salary + this.loan.deposit)),
      new Option('D', this.interestRate, 0.004, [10, 30], 20000, false, 6 * (this.user.salary + this.loan.deposit)),
      new Option('E', this.interestRate, 0.002, [10, 20], 40000, true, 7 * (this.user.salary + this.loan.deposit))
    ];
  }

  // Create a getter for each form control so we can reference is using control() rather than mortgageForm.get('control')
  createGetters(): void {
    Object.keys(this.mortgageForm.controls).forEach(key => {
      this[key] = () => {
        return this.mortgageForm.get(key);
      };
    });
  }

  fillForm(): void {
    this.mortgageForm.setValue({
      surname: 'Daley',
      email: 'niledaley@outlook.com',
      phone: '07393201588',
      salary: '40000',
      deposit: '0',
      term: 10,
      loanAmount: '100000',
      hasAccount: 'false'
    });

  }

  resetForm(): void {
    this.mortgageForm.reset();
  }

  // Calculate the total amount payable in currency format
  totalPayable(interest): string {
    const calc = this.loan.amount * (1 + interest);
    return this.currencyPipe.transform(calc, 'GBP' , true, '3.2-2');
  }

  // Calculate the monthly repayment in currency format
  monthlyRepayment(total, term): string {
    total = total.replace(/[£,]/g, '');
    const calc = total / (term * 12);
    return this.currencyPipe.transform(calc, 'GBP' , true, '1.2-2');
  }

  // Check if the whole form is completed and valid
  completedForm(): Boolean {
    return this.mortgageForm.status === 'VALID';
  }

  // Check if the given control is valid, if it has been changed and is not disabled
  validControl(name: string): Boolean {
    const control = this.mortgageForm.get(name);
    if (control.pristine || control.disabled) {
      return null;
    }
    return control.status === 'VALID';
  }

  /*
    disable all other inputs if the current input's value is invalid
    update the maxAmount for each option based on form value
    filter the options
  */
  checkControls(event): void {

    const current = event.target.attributes['formControlName'].value;
    const status = this.mortgageForm.get(current).status;
    const forbidden = ['term', 'hasAccount'];

    if (!forbidden.includes(current)) {
      Object.keys(this.mortgageForm.controls).forEach(key => {
        if (key !== current) {
          status === 'INVALID' ? this.mortgageForm.get(key).disable() : this.mortgageForm.get(key).enable();
        }
      });
    }

    this.updateOptions();
    this.filterOptions();

  }

  // Update the maxAmount for each option based on the curreny salary and deposit
  updateOptions(): void {
    const sal = this.user.salary;
    const deposit = this.loan.deposit;

    this.options.forEach(opt => {
      opt.updateMaxAmount(sal, deposit);
      opt.totalPayable = this.totalPayable(opt.interestRate);
      opt.monthlyRepayment = this.monthlyRepayment(opt.totalPayable, this.loan.term);
    });

  }

  // Filter the available options based on the criteria, then sort the options
  filterOptions(): void {
    const f = new Filter(this.options);
    this.availableOptions = f.filter(this.user, this.loan);
  }

}
