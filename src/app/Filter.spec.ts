import { Filter } from './Filter';
import { User } from './User';
import { Loan } from './Loan';
import { Option } from './Option';

describe('Filter', () => {
  let filter: Filter;
  let user: User;
  let loan: Loan;
  let options: Array<Option>;
  const interest = 0.005;

  beforeEach(() => {

    user = new User();
    loan = new Loan();
    options = [
      new Option('A', interest, 0.008, [10, 20], 0, false),
      new Option('B', interest, 0.007, [10, 20], 0, true),
      new Option('C', interest, 0.006, [20], 10000, false),
      new Option('D', interest, 0.004, [10, 30], 20000, false),
      new Option('E', interest, 0.002, [10, 20], 40000, true)
    ];

  });

  it('should return options A, C and D if user doesnt have account', () => {

    user.hasAccount = false;

    filter = new Filter(options);
    const result = filter.filterAccountNeeded(user.hasAccount);

    const expected = options.filter(opt => opt.accountNeeded === false);

    expected.forEach(el => {
      expect(result).toContain(el);
    });

  });

  it('should return all options if user has account', () => {

    user.hasAccount = true;

    filter = new Filter(options);
    const result = filter.filterAccountNeeded(user.hasAccount);

    expect(result).toEqual(options);
  });

  it('should return options A, B, D and E if term is 10 years', () => {

    loan.term = 10;

    filter = new Filter(options);
    const result = filter.filterTerm(loan.term);

    const expected = options.filter(opt => opt.terms.includes(10));

    expected.forEach(el => {
      expect(result).toContain(el);
    });
  });

  it('should return options A, B, C and E if term is 20 years', () => {

    loan.term = 20;

    filter = new Filter(options);
    const result = filter.filterTerm(loan.term);

    const expected = options.filter(opt => opt.terms.includes(20));

    expected.forEach(el => {
      expect(result).toContain(el);
    });

  });

  it('should return option D if term is 30 years', () => {

    loan.term = 30;

    filter = new Filter(options);
    const result = filter.filterTerm(loan.term);

    const expected = options.filter(opt => opt.terms.includes(30));

    expected.forEach(el => {
      expect(result).toContain(el);
    });

  });

  it('should return correct options where loan amount is less than max amount', () => {

    user.salary = 40000;
    loan.deposit = 10000;
    loan.amount = 100000;

    options.forEach(opt => {
      opt.updateMaxAmount(user.salary, loan.deposit);
    });
    const maxAmounts = {
      'A': 160000,
      'B': 164000,
      'C': 250000,
      'D': 300000,
      'E': 350000
    };

    filter = new Filter(options);

    // For each of the max amounts, filter the results and check only options to be returned where maxAmount > loanAmount
    for (const opt of Object.keys(maxAmounts)) {
      const max = maxAmounts[opt];
      const result = filter.filterLoanAmount(max);
      const expected = options.filter(o => o.maxAmount >= max);
      expect(result).toEqual(expected);
    }

  });

});
