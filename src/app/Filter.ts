import { Option } from './Option';
import { Loan } from './Loan';
import { User } from './User';

export class Filter {
  private availableOptions: Array<Option>;

  constructor(options) {
    this.availableOptions = options;
  }

  filter(user: User, loan: Loan): Array<Option> {
    this.filterAccountNeeded(user.hasAccount);
    this.filterDeposit(loan.deposit);
    this.filterTerm(loan.term);
    this.filterLoanAmount(loan.amount);
    return this.availableOptions.sort(this.sort);
  }

  /* Filter the options based on whether an account is needed */
  private filterAccountNeeded(hasAccount) {
    hasAccount = String(hasAccount);
    if (hasAccount === 'false') {
      this.availableOptions = this.availableOptions.filter((opt) => {
        // Cast the boolean to string to do comparison
        return opt.accountNeeded === false;
      });
    }
  }

  /* Filter the options based on deposit value*/
  private filterDeposit(deposit) {
    this.availableOptions = this.availableOptions.filter((opt) => {
      return opt.depositRequired <= deposit;
    });
  }

  /* Filter the options based on the term selected */
  private filterTerm(term) {
    term = Number(term);
    this.availableOptions = this.availableOptions.filter((opt) => {
      return opt.terms.includes(term);
    });
  }

  /* Filter the options based on the loan value */
  private filterLoanAmount(amount) {
    amount = Number(amount);
    this.availableOptions = this.availableOptions.filter((opt) => {
      return amount < opt.maxAmount;
    });
  }

  private sort(opt, other) {
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
