/*
	Add extra assertions to chai for sinon and export the modified version of chai.
*/
var chai = require('chai'),
    Assertion = chai.Assertion;

Assertion.addMethod('calledOnce', function() {
  var obj = this._obj;
  new Assertion(obj.calledOnce).to.exist;
  this.assert(
    obj.calledOnce,
    'expected #{this} to be called once',
    'expected #{this} not to be called once'
  );
});

Assertion.addMethod('calledWithMatch', function() {
  var obj = this._obj;
  new Assertion(obj.calledWithMatch).to.exist;
  this.assert(
    obj.calledWithMatch.apply(obj, arguments),
    'expected #{this} to be called with arguments matching #{exp}, but got #{act}',
    'expected #{this} not to be called with arguments matching #{exp}, but got #{act}',
    arguments,
    obj.args
  );
})

module.exports = chai;