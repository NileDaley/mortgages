export class Option {

  baseInterest: number;
  name: String;
  interestRate: number;
  terms: Array<number>;
  maxAmount: number;
  depositRequired = 0;
  accountNeeded: Boolean = false;
  totalPayable: any;
  monthlyRepayment: any;

  constructor(name: String, base_interest = 0.03, interest, terms: Array<number>, deposit, account: Boolean, maximum?) {
    this.name = name;
    this.baseInterest = base_interest;
    this.interestRate = this.baseInterest + interest;
    this.terms = terms;
    this.maxAmount = maximum;
    this.depositRequired = deposit;
    this.accountNeeded = account;
  }

  updateMaxAmount(salary: number, deposit: number): void {
    switch (this.name) {
      case 'A':
        this.maxAmount = salary * 4;
        break;
      case 'B':
        this.maxAmount = salary * 4.1;
        break;
      case 'C':
        this.maxAmount = (salary + deposit) * 5;
        break;
      case 'D':
        this.maxAmount = (salary + deposit) * 6;
        break;
      case 'E':
        this.maxAmount = (salary + deposit) * 7;
        break;
    }
  }

}
