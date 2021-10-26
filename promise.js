var MyPromise = function(callback) {
  var PENDING = "pending";
  var RESOLVED = "resolved";
  var REJECTED = "rejected";

  this.status = PENDING;
  this.value = undefined;

  var successFunctions = [];
  var errorFunction;

  var errorMessage = "Status already changed";

  var resolve = function(value) {
    if (this.status === PENDING) {
      this.status = RESOLVED;
      this.value = value;
    } else {
      throw new Error(errorMessage);
    }
    var _this = this;
    if (successFunctions.length) {
      var val;
      successFunctions.forEach(function(func) {
        if (val) {
          val = func(val);
        } else {
          val = func(_this.value)
        }
      });
    }
  };
  var reject = function(error) {
    if (this.status === PENDING) {
      this.status = REJECTED;
      this.value = error;
    } else {
      throw new Error(errorMessage);
    }
    if (errorFunction) {
      errorFunction(this.value);
    }
  };

  callback(resolve.bind(this), reject.bind(this));

  this.then = function(onFulfilled) {
    console.log("Then from MyPromise");
    if (this.status === RESOLVED) {
      onFulfilled(this.value);
    } else {
      successFunctions.push(onFulfilled);
    }
    return this;
  };
  this.catch = function(onError) {
    if (this.status === REJECTED) {
      onError(this.value);
    } else {
      errorFunction = onError;
    }
    return this;
  };
};

MyPromise.all = function(promises) {
  return new MyPromise(function(resolve, reject) {
    var results = [];
    var resolveCounter = 0;
    promises.forEach(function(promise, i) {
      promise
        .then(function(result) {
          results[i] = result;
          resolveCounter++;
          if (resolveCounter === promises.length) {
            resolve(results);
          }
        })
        .catch(function(error) {
          reject(error);
        });
    });
  });
};

if (!window.Promise) {
  window.Promise = MyPromise;
}
