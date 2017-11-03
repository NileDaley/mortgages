export class Option {

  baseInterest: number;
  name: String;
  interestRate: Number;
  terms: Array<Number>;
  maxAmount: number;
  depositRequired = 0;
  accountNeeded: Boolean = false;
  totalPayable: any;
  monthlyRepayment: any;

  constructor(name: String, base_interest = 0.03, interest, terms: Array<Number>, maximum, deposit, account: Boolean) {
    this.name = name;
    this.baseInterest = base_interest;
    this.interestRate = this.baseInterest + interest;
    this.terms = terms;
    this.maxAmount = maximum;
    this.depositRequired = deposit;
    this.accountNeeded = account;
  }

}
