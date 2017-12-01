import { Option } from './Option';
import { Loan } from './Loan';
import { User } from './User';

export class Filter {
  availableOptions: Array<Option>;

  constructor(options) {
    this.availableOptions = options;
  }

  filter(user: User, loan: Loan): Array<Option> {
    this.availableOptions = this.filterAccountNeeded(user.hasAccount);
    this.availableOptions = this.filterDeposit(loan.deposit, loan.amount);
    this.availableOptions = this.filterTerm(loan.term);
    this.availableOptions = this.filterLoanAmount(loan.amount);
    this.availableOptions = this.availableOptions.sort(this.sort);
    return this.availableOptions;
  }

  // Filter the options based on whether an account is needed
  filterAccountNeeded(hasAccount): Array<Option> {
    hasAccount = String(hasAccount);
    if (hasAccount === 'false') {
      return this.availableOptions.filter(opt => {
        // Cast the boolean to string to do comparison
        return opt.accountNeeded === false;
      });
    } else {
      return this.availableOptions;
    }
  }

  // Filter the options based on deposit value
  filterDeposit(deposit: number, loanAmount: number): Array<Option> {
    deposit = Number(deposit);
    loanAmount = Number(loanAmount);
    if (loanAmount > deposit) {
      return this.availableOptions.filter(opt => {
        return opt.depositRequired <= deposit;
      });
    } else {
      return [];
    }
  }

  // Filter the options based on the term selected
  filterTerm(term): Array<Option> {
    term = Number(term);
    return this.availableOptions.filter(opt => {
      return opt.terms.includes(term);
    });
  }

  // Filter the options based on the loan value
  filterLoanAmount(amount): Array<Option> {
    amount = Number(amount);
    if (amount > 0) {
      return this.availableOptions.filter(opt => {
        return amount <= opt.maxAmount;
      });
    } else {
      return [];
    }
  }

  sort(opt, other): number {
    const opt_amount: number = Number(opt.monthlyRepayment.replace(/[£,]/g, ''));
    const other_amount: number = Number(other.monthlyRepayment.replace(/[£,]/g, ''));

      /*
        returns:
          negative if opt < other
          0 if opt === other
          positive if opt > other
      */
      return opt_amount - other_amount;
  }
}
