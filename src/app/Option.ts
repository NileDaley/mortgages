export class Option {

  private baseInterest = 0.03;
  name: String;
  interestRate: Number;
  terms: Array<Number>;
  maxAmount: number;
  depositRequired = 0;
  accountNeeded: Boolean = false;

  constructor(name: String, interest, terms: Array<Number>, maximum, deposit, account: Boolean) {
    this.name = name;
    this.interestRate = this.baseInterest + interest;
    this.terms = terms;
    this.maxAmount = maximum;
    this.depositRequired = deposit;
    this.accountNeeded = account;
  }

}
