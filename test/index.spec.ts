import { assert } from 'chai';

import { Tafgeet } from '../src';

const text = new Tafgeet('1');

describe('Reading numbers from 1 - 999', () => {
  it('should read 1', () => {
    assert.equal('واحد', text.read(1));
  });
  it('should read 2', () => {
    assert.equal('ٱثنين', text.read(2));
  });
  it('should read 10', () => {
    assert.equal('عشرة', text.read(10));
  });
  it('should read 11', () => {
    assert.equal('أحد عشر', text.read(11));
  });
  it('should read 12', () => {
    assert.equal('أثني عشر', text.read(12));
  });
  it('should read 20', () => {
    assert.equal('عشرون', text.read(20));
  });
  it('should read 21', () => {
    assert.equal('واحد وعشرون', text.read(21));
  });
  it('should read 99', () => {
    assert.equal('تسعة وتسعون', text.read(99));
  });
  it('should read 100', () => {
    assert.equal('مائة', text.read(100));
  });
  it('should read 120', () => {
    assert.equal('مائة وعشرون', text.read(120));
  });
  it('should read 191', () => {
    assert.equal('مائة وواحد وتسعون', text.read(191));
  });
  it('should read 989', () => {
    assert.equal('تسعمائة وتسعة وثمانون', text.read(989));
  });
});
describe('Reading full amounts without a currecy specified', () => {
  it('should read 7,564,654', () => {
    assert.equal(
      'سبعة ملايين وخمسمائة وأربعة وستون ألف وستمائة وأربعة وخمسون فقط لا غير',
      new Tafgeet('7564654', '').parse(),
    );
  });
  it('should read 12', () => {
    assert.equal('أثني عشر فقط لا غير', new Tafgeet('12', '').parse());
  });
  it('should read 74', () => {
    assert.equal('أربعة وسبعون فقط لا غير', new Tafgeet('74', '').parse());
  });
  it('should read 234', () => {
    assert.equal('مائتين وأربعة وثلاثون فقط لا غير', new Tafgeet('234', '').parse());
  });
});
describe('Reading full amounts', () => {
  it('should read EGP 1', () => {
    assert.equal('واحد جنيه مصري فقط لا غير', new Tafgeet('1').parse());
  });
  it('should read EGP 1.20', () => {
    assert.equal('واحد جنيه مصري وعشرون قرش فقط لا غير', new Tafgeet('1.20').parse());
  });
  it('should read TND 1.200', () => {
    assert.equal('واحد دينار تونسي ومائتين مليم فقط لا غير', new Tafgeet('1.200', 'TND').parse());
  });
  it('should read SDG 1.20 even if there are three decimal places', () => {
    assert.equal('واحد جنيه سوداني وعشرون قرش فقط لا غير', new Tafgeet('1.200', 'SDG').parse());
  });
  it('should read EGP 1,000', () => {
    assert.equal('ألف جنيه مصري فقط لا غير', new Tafgeet('1000').parse());
  });
  it('should read EGP 1,345', () => {
    assert.equal('ألف وثلاثمائة وخمسة وأربعون جنيه مصري فقط لا غير', new Tafgeet('1345').parse());
  });
  it('should read EGP 2,455', () => {
    assert.equal('ألفين وأربعمائة وخمسة وخمسون جنيه مصري فقط لا غير', new Tafgeet('2455').parse());
  });
  it('should read EGP 10,000', () => {
    assert.equal('عشرة ألف جنيه مصري فقط لا غير', new Tafgeet('10000').parse());
  });
  it('should read EGP 12,444', () => {
    assert.equal('أثني عشر ألف وأربعمائة وأربعة وأربعون جنيه مصري فقط لا غير', new Tafgeet('12444').parse());
  });
  it('should read EGP 100,000', () => {
    assert.equal('مائة ألف جنيه مصري فقط لا غير', new Tafgeet('100000').parse());
  });
  it('should read EGP 101,000', () => {
    assert.equal('مائة وواحد ألف جنيه مصري فقط لا غير', new Tafgeet('101000').parse());
  });
  it('should read EGP 102,000', () => {
    assert.equal('مائة وٱثنين ألف جنيه مصري فقط لا غير', new Tafgeet('102000').parse());
  });
  it('should read EGP 1,000,000.66', () => {
    assert.equal('مليون جنيه مصري وستة وستون قرش فقط لا غير', new Tafgeet('1000000.66').parse());
  });
  it('should read TND 1,000,000.660', () => {
    assert.equal('مليون دينار تونسي وستمائة وستون مليم فقط لا غير', new Tafgeet('1000000.660', 'TND').parse());
  });
  it('should read EGP 100,000', () => {
    assert.equal('مائة ألف جنيه مصري فقط لا غير', new Tafgeet('100000').parse());
  });
  it('should read EGP 1,000,001,000', () => {
    assert.equal('مليار وألف جنيه مصري فقط لا غير', new Tafgeet('1000001000').parse());
  });
  it('should read EGP 10,010,001,000', () => {
    assert.equal('عشرة مليار وعشرة مليون وألف جنيه مصري فقط لا غير', new Tafgeet('10010001000').parse());
  });
  it('should read EGP 1,001,000,001,000', () => {
    assert.equal('ترليون ومليار وألف جنيه مصري فقط لا غير', new Tafgeet('1001000001000').parse());
  });
  it('should read EGP 1,000,000,000,001', () => {
    assert.equal('ترليون وواحد جنيه مصري فقط لا غير', new Tafgeet('1000000000001').parse());
  });
  it('should read EGP 1,000,100,000,001', () => {
    assert.equal('ترليون ومائة مليون وواحد جنيه مصري فقط لا غير', new Tafgeet('1000100000001').parse());
  });
  it('should read EGP 10,000,000', () => {
    assert.equal('عشرة مليون جنيه مصري فقط لا غير', new Tafgeet('10000000').parse());
  });
  it('should read EGP 10,000,001', () => {
    assert.equal('عشرة مليون وواحد جنيه مصري فقط لا غير', new Tafgeet('10000001').parse());
  });
  it('should read TND 1,001', () => {
    assert.equal('ألف وواحد دينار تونسي فقط لا غير', new Tafgeet('1001', 'TND').parse());
  });
  it('should read TND 556,563.999', () => {
    assert.equal(
      'خمسمائة وستة وخمسون ألف وخمسمائة وثلاثة وستون دينار تونسي وتسعمائة وتسعة وتسعون مليم فقط لا غير',
      new Tafgeet('556563.999', 'TND').parse(),
    );
  });
  it('should read EGP 10,001', () => {
    assert.equal('عشرة ألف وواحد جنيه مصري فقط لا غير', new Tafgeet('10001').parse());
  });
  it('should read EGP 556,563.20', () => {
    assert.equal(
      'خمسمائة وستة وخمسون ألف وخمسمائة وثلاثة وستون جنيه مصري وعشرون قرش فقط لا غير',
      new Tafgeet('556563.20').parse(),
    );
  });
  it('should read EGP 100,100', () => {
    assert.equal('مائة ألف ومائة جنيه مصري فقط لا غير', new Tafgeet('100100').parse());
  });
  it('should read EGP 55,000,051,000', () => {
    assert.equal('خمسة وخمسون مليار وواحد وخمسون ألف جنيه مصري فقط لا غير', new Tafgeet('55000051000').parse());
  });
  it('should read EGP 55,000,051,000.2', () => {
    assert.equal(
      'خمسة وخمسون مليار وواحد وخمسون ألف جنيه مصري وٱثنين قرش فقط لا غير',
      new Tafgeet('55000051000.2').parse(),
    );
  });
  it('should read EGP 55,000,051,000.1', () => {
    assert.equal(
      'خمسة وخمسون مليار وواحد وخمسون ألف جنيه مصري وواحد قرش فقط لا غير',
      new Tafgeet('55000051000.1').parse(),
    );
  });
});
