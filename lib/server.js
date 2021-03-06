// Generated by CoffeeScript 1.7.1
(function() {
  var SRP, Server, transform;

  transform = require('./transform');

  SRP = require('./srp');

  Server = (function() {
    function Server() {}

    Server.prototype.init = function(options, callback) {
      var length;
      this.vBuf = new Buffer(options.verifier, 'hex');
      this.saltBuf = new Buffer(options.salt, 'hex');
      length = options.length || 4096;
      this.srp = new SRP(length);
      return this.srp.b((function(_this) {
        return function(err, b) {
          _this.bInt = b;
          _this.BBuf = _this.srp.B({
            b: _this.bInt,
            v: transform.buffer.toBigInteger(_this.vBuf)
          });
          return callback();
        };
      })(this));
    };

    Server.prototype.debugInit = function(options, callback) {
      var length;
      this.vBuf = new Buffer(options.verifier, 'hex');
      this.saltBuf = new Buffer(options.salt, 'hex');
      length = options.length || 4096;
      this.srp = new SRP(length);
      this.bInt = transform.buffer.toBigInteger(options.b);
      this.BBuf = this.srp.B({
        b: this.bInt,
        v: transform.buffer.toBigInteger(this.vBuf)
      });
      return callback();
    };

    Server.prototype.getPublicKey = function() {
      return this.BBuf.toString('hex');
    };

    Server.prototype.getSalt = function() {
      return this.saltBuf.toString('hex');
    };

    Server.prototype.setClientPublicKey = function(hexA) {
      var ABigInt;
      this.ABuf = new Buffer(hexA, 'hex');
      ABigInt = transform.buffer.toBigInteger(this.ABuf);
      if (this.srp.isZeroWhenModN(ABigInt)) {
        throw Error('Invalid A value, abort');
      }
      this.uInt = this.srp.u({
        A: this.ABuf,
        B: this.BBuf
      });
      this.SBuf = this.srp.serverS({
        A: transform.buffer.toBigInteger(this.ABuf),
        v: transform.buffer.toBigInteger(this.vBuf),
        u: this.uInt,
        b: this.bInt
      });
      this.KBuf = this.srp.K({
        S: this.SBuf
      });
      return this.KBuf;
    };

    Server.prototype.getSharedKey = function() {
      return this.KBuf.toString('hex');
    };

    Server.prototype.checkClientProof = function(M1hex, username) {
      var clientM1Buf, result;
      clientM1Buf = new Buffer(M1hex, 'hex');
      this.M1Buf = this.srp.M1({
        A: this.ABuf,
        B: this.BBuf,
        K: this.KBuf,
        S: this.saltBuf,
        I: username && new Buffer(username)
      });
      result = this.M1Buf.toString('hex') === clientM1Buf.toString('hex');
      return result;
    };

    Server.prototype.getProof = function() {
      var result;
      this.M2Buf = this.srp.M2({
        A: this.ABuf,
        M: this.M1Buf,
        K: this.KBuf
      });
      result = this.M2Buf.toString('hex');
      return result;
    };

    return Server;

  })();

  module.exports = Server;

}).call(this);
