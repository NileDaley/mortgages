import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { Option } from './Option';
import { User } from './User';
import { Loan } from './Loan';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {

  mortgageForm: FormGroup;
  interestRate: any = 0.03;

  user: User;
  loan: Loan;
  options: Array<Option>;
  availableOptions: Array<Option>;

  terms: Array<number> = [10, 20, 30];
  tableHeadings: Array<string> = ['', 'Interest Rate', 'Mortgage Length', 'Loan Amount', 'Amount Repayable', 'Monthly Repayment', '' ];

  constructor(private fb: FormBuilder, private currencyPipe: CurrencyPipe, private http: Http) {

    http.get(this.interestRateURL())
      .map(res => res.json())
      .subscribe((res) => {
        this.interestRate = res.dataset.data[0][1] / 100;
        this.options = this.createOptions();
      }, (err) => {
        alert('Unfortunately, we were unable to get the current interest rate. The interest rate will be set to the previous value of 3');
        this.options = this.createOptions();
      });

      this.user = new User;
      this.loan = new Loan;
      this.createForm();
  }

  interestRateURL() {
    const date = new Date();
    const base_url = 'https://www.quandl.com/api/v3/datasets/BOE/IUDBEDR.json?';
    const API_KEY = 'W4nq5nDFEKpkwzvRBEuk';

    const to = {
      day: date.getDate(),
      month: date.getMonth() + 1,
      year: date.getFullYear()
    };

    date.setDate( date.getDate() - 1 );

    const from = {
      day: date.getDate(),
      month: date.getMonth() + 1,
      year: date.getFullYear()
    };

    return `${base_url}start_date=${from.year}-${from.month}-${from.day}&end_date=${to.year}-${to.month}-${to.day}&api_key=${API_KEY}
    `;
  }

  createForm() {
    // Either +447000700200 or 07000700200
    const phoneRE = '(^[+]([0-9]{2})[0-9]{10}$)|(^[0-9]{11}$)';
    const numericRE = '^[0-9]+$';
    const alphaRE = '[A-z]+';

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
          Validators.email
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
          Validators.minLength(3),
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
          Validators.minLength(3),
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

  createOptions() {
    return [
      new Option('A', this.interestRate, 0.008, [10, 20], 4 * this.user.salary, 0, false),
      new Option('B', this.interestRate, 0.007, [10, 20], 4.1 * this.user.salary, 0, true),
      new Option('C', this.interestRate, 0.006, [20], 5 * (this.user.salary + this.loan.deposit), 10000, false),
      new Option('D', this.interestRate, 0.004, [10, 30], 6 * (this.user.salary + this.loan.deposit), 20000, false),
      new Option('E', this.interestRate, 0.002, [10, 20], 7 * (this.user.salary + this.loan.deposit), 40000, true)
    ];
  }

  fillForm() {
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

  resetForm() {
    this.mortgageForm.reset();
  }

  totalPayable(interest) {
    const calc = this.loan.amount * (1 + interest);
    return this.currencyPipe.transform(calc, 'GBP' , true, '4.0-0');
  }

  monthlyRepayment(total, term) {
    total = total.replace(/[£,]/g, '');
    const calc = total / (term * 12);
    return this.currencyPipe.transform(calc, 'GBP' , true, '3.2-2');
  }

  completedForm() {
    return this.mortgageForm.status === 'VALID';
  }

  validControl(name: string) {
    const control = this.mortgageForm.get(name);
    if (control.pristine || control.disabled) {
      return null;
    }
    return control.status === 'VALID';
  }

  checkControls($event) {

    const current = $event.target.attributes['formControlName'].value;
    const status = this.mortgageForm.get(current).status;
    const forbidden = ['term', 'hasAccount'];

    // Enable other controls is current control value is invalid
    if (!forbidden.includes(current)) {
      Object.keys(this.mortgageForm.controls).forEach((key) => {
        if (key !== current) {
          if (status === 'INVALID') {
            this.mortgageForm.get(key).disable();
          } else {
            this.mortgageForm.get(key).enable();
          }
        }
      });
    }

    this.updateOptionAmounts();

    // Filter available options
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
      opt.totalPayable = this.totalPayable(opt.interestRate);
      opt.monthlyRepayment = this.monthlyRepayment(opt.totalPayable, this.loan.term);
    });

  }

  filterOptions() {
    this.availableOptions = this.options;
    this.filterAccountNeeded();
    this.filterDeposit();
    this.filterTerm();
    this.filterLoanAmount();
    this.sortOptions();
  }

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

  sortOptions() {
    this.availableOptions = this.availableOptions.sort((opt, other) => {
      const opt_amount: number = Number(opt.monthlyRepayment.replace(/[£,]/g, ''));
      const other_amount: number = Number(other.monthlyRepayment.replace(/[£,]/g, ''));

      /*
        returns:
          negative if opt < other
          0 if opt === other
          positive if opt > other
      */
      return opt_amount - other_amount;
    });
  }

}
