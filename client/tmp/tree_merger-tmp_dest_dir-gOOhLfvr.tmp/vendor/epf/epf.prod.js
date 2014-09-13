/*!
 * @overview  Epf - ECMAScript Persistence Framework
 * @copyright Copyright 2014 Gordon L. Hempton and contributors
 * @license   Licensed under MIT license
 *            See https://raw.github.com/getoutreach/epf/master/LICENSE
 * @version   0.3.5
 */
(function() {
(function() {
Ember.String.pluralize = function(word) {
  return Ember.Inflector.inflector.pluralize(word);
};

Ember.String.singularize = function(word) {
  return Ember.Inflector.inflector.singularize(word);
};

})();



(function() {
var BLANK_REGEX = /^\s*$/;

function loadUncountable(rules, uncountable) {
  for (var i = 0, length = uncountable.length; i < length; i++) {
    rules.uncountable[uncountable[i]] = true;
  }
}

function loadIrregular(rules, irregularPairs) {
  var pair;

  for (var i = 0, length = irregularPairs.length; i < length; i++) {
    pair = irregularPairs[i];

    rules.irregular[pair[0]] = pair[1];
    rules.irregularInverse[pair[1]] = pair[0];
  }
}

/**
  Inflector.Ember provides a mechanism for supplying inflection rules for your
  application. Ember includes a default set of inflection rules, and provides an
  API for providing additional rules.

  Examples:

  Creating an inflector with no rules.

  ```js
  var inflector = new Ember.Inflector();
  ```

  Creating an inflector with the default ember ruleset.

  ```js
  var inflector = new Ember.Inflector(Ember.Inflector.defaultRules);

  inflector.pluralize('cow') //=> 'kine'
  inflector.singularize('kine') //=> 'cow'
  ```

  Creating an inflector and adding rules later.

  ```javascript
  var inflector = Ember.Inflector.inflector;

  inflector.pluralize('advice') // => 'advices'
  inflector.uncountable('advice');
  inflector.pluralize('advice') // => 'advice'

  inflector.pluralize('formula') // => 'formulas'
  inflector.irregular('formula', 'formulae');
  inflector.pluralize('formula') // => 'formulae'

  // you would not need to add these as they are the default rules
  inflector.plural(/$/, 's');
  inflector.singular(/s$/i, '');
  ```

  Creating an inflector with a nondefault ruleset.

  ```javascript
  var rules = {
    plurals:  [ /$/, 's' ],
    singular: [ /\s$/, '' ],
    irregularPairs: [
      [ 'cow', 'kine' ]
    ],
    uncountable: [ 'fish' ]
  };

  var inflector = new Ember.Inflector(rules);
  ```

  @class Inflector
  @namespace Ember
*/
function Inflector(ruleSet) {
  ruleSet = ruleSet || {};
  ruleSet.uncountable = ruleSet.uncountable || {};
  ruleSet.irregularPairs= ruleSet.irregularPairs|| {};

  var rules = this.rules = {
    plurals:  ruleSet.plurals || [],
    singular: ruleSet.singular || [],
    irregular: {},
    irregularInverse: {},
    uncountable: {}
  };

  loadUncountable(rules, ruleSet.uncountable);
  loadIrregular(rules, ruleSet.irregularPairs);
}

Inflector.prototype = {
  /**
    @method plural
    @param {RegExp} regex
    @param {String} string
  */
  plural: function(regex, string) {
    this.rules.plurals.push([regex, string]);
  },

  /**
    @method singular
    @param {RegExp} regex
    @param {String} string
  */
  singular: function(regex, string) {
    this.rules.singular.push([regex, string]);
  },

  /**
    @method uncountable
    @param {String} regex
  */
  uncountable: function(string) {
    loadUncountable(this.rules, [string]);
  },

  /**
    @method irregular
    @param {String} singular
    @param {String} plural
  */
  irregular: function (singular, plural) {
    loadIrregular(this.rules, [[singular, plural]]);
  },

  /**
    @method pluralize
    @param {String} word
  */
  pluralize: function(word) {
    return this.inflect(word, this.rules.plurals);
  },

  /**
    @method singularize
    @param {String} word
  */
  singularize: function(word) {
    return this.inflect(word, this.rules.singular);
  },

  /**
    @method inflect
    @param {String} word
    @param {Object} typeRules
  */
  inflect: function(word, typeRules) {
    var inflection, substitution, result, lowercase, isBlank,
    isUncountable, isIrregular, isIrregularInverse, rule;

    isBlank = BLANK_REGEX.test(word);

    if (isBlank) {
      return word;
    }

    lowercase = word.toLowerCase();

    isUncountable = this.rules.uncountable[lowercase];

    if (isUncountable) {
      return word;
    }

    isIrregular = this.rules.irregular[lowercase];

    if (isIrregular) {
      return isIrregular;
    }

    isIrregularInverse = this.rules.irregularInverse[lowercase];

    if (isIrregularInverse) {
      return isIrregularInverse;
    }

    for (var i = typeRules.length, min = 0; i > min; i--) {
       inflection = typeRules[i-1];
       rule = inflection[0];

      if (rule.test(word)) {
        break;
      }
    }

    inflection = inflection || [];

    rule = inflection[0];
    substitution = inflection[1];

    result = word.replace(rule, substitution);

    return result;
  }
};

Ember.Inflector = Inflector;

})();



(function() {
Ember.Inflector.defaultRules = {
  plurals: [
    [/$/, 's'],
    [/s$/i, 's'],
    [/^(ax|test)is$/i, '$1es'],
    [/(octop|vir)us$/i, '$1i'],
    [/(octop|vir)i$/i, '$1i'],
    [/(alias|status)$/i, '$1es'],
    [/(bu)s$/i, '$1ses'],
    [/(buffal|tomat)o$/i, '$1oes'],
    [/([ti])um$/i, '$1a'],
    [/([ti])a$/i, '$1a'],
    [/sis$/i, 'ses'],
    [/(?:([^f])fe|([lr])f)$/i, '$1$2ves'],
    [/(hive)$/i, '$1s'],
    [/([^aeiouy]|qu)y$/i, '$1ies'],
    [/(x|ch|ss|sh)$/i, '$1es'],
    [/(matr|vert|ind)(?:ix|ex)$/i, '$1ices'],
    [/^(m|l)ouse$/i, '$1ice'],
    [/^(m|l)ice$/i, '$1ice'],
    [/^(ox)$/i, '$1en'],
    [/^(oxen)$/i, '$1'],
    [/(quiz)$/i, '$1zes']
  ],

  singular: [
    [/s$/i, ''],
    [/(ss)$/i, '$1'],
    [/(n)ews$/i, '$1ews'],
    [/([ti])a$/i, '$1um'],
    [/((a)naly|(b)a|(d)iagno|(p)arenthe|(p)rogno|(s)ynop|(t)he)(sis|ses)$/i, '$1sis'],
    [/(^analy)(sis|ses)$/i, '$1sis'],
    [/([^f])ves$/i, '$1fe'],
    [/(hive)s$/i, '$1'],
    [/(tive)s$/i, '$1'],
    [/([lr])ves$/i, '$1f'],
    [/([^aeiouy]|qu)ies$/i, '$1y'],
    [/(s)eries$/i, '$1eries'],
    [/(m)ovies$/i, '$1ovie'],
    [/(x|ch|ss|sh)es$/i, '$1'],
    [/^(m|l)ice$/i, '$1ouse'],
    [/(bus)(es)?$/i, '$1'],
    [/(o)es$/i, '$1'],
    [/(shoe)s$/i, '$1'],
    [/(cris|test)(is|es)$/i, '$1is'],
    [/^(a)x[ie]s$/i, '$1xis'],
    [/(octop|vir)(us|i)$/i, '$1us'],
    [/(alias|status)(es)?$/i, '$1'],
    [/^(ox)en/i, '$1'],
    [/(vert|ind)ices$/i, '$1ex'],
    [/(matr)ices$/i, '$1ix'],
    [/(quiz)zes$/i, '$1'],
    [/(database)s$/i, '$1']
  ],

  irregularPairs: [
    ['person', 'people'],
    ['man', 'men'],
    ['child', 'children'],
    ['sex', 'sexes'],
    ['move', 'moves'],
    ['cow', 'kine'],
    ['zombie', 'zombies']
  ],

  uncountable: [
    'equipment',
    'information',
    'rice',
    'money',
    'species',
    'series',
    'fish',
    'sheep',
    'jeans',
    'police'
  ]
};

})();



(function() {
if (Ember.EXTEND_PROTOTYPES) {
  /**
    See {{#crossLink "Ember.String/pluralize"}}{{/crossLink}}

    @method pluralize
    @for String
  */
  String.prototype.pluralize = function() {
    return Ember.String.pluralize(this);
  };

  /**
    See {{#crossLink "Ember.String/singularize"}}{{/crossLink}}

    @method singularize
    @for String
  */
  String.prototype.singularize = function() {
    return Ember.String.singularize(this);
  };
}

})();



(function() {
Ember.Inflector.inflector = new Ember.Inflector(Ember.Inflector.defaultRules);

})();



(function() {

})();


!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.jsondiffpatch=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],2:[function(_dereq_,module,exports){

var Pipe = _dereq_('../pipe').Pipe;

var Context = function Context(){
};

Context.prototype.setResult = function(result) {
	this.result = result;
	this.hasResult = true;
	return this;
};

Context.prototype.exit = function() {
	this.exiting = true;
	return this;
};

Context.prototype.switchTo = function(next, pipe) {
	if (typeof next === 'string' || next instanceof Pipe) {
		this.nextPipe = next;
	} else {
		this.next = next;
		if (pipe) {
			this.nextPipe = pipe;
		}
	}
	return this;
};

Context.prototype.push = function(child, name) {
	child.parent = this;
	if (typeof name !== 'undefined') {
		child.childName = name;
	}
	child.root = this.root || this;
	child.options = child.options || this.options;
	if (!this.children) {
		this.children = [child];
		this.nextAfterChildren = this.next || null;
		this.next = child;
	} else {
		this.children[this.children.length - 1].next = child;
		this.children.push(child);
	}
	child.next = this;
	return this;
};

exports.Context = Context;
},{"../pipe":15}],3:[function(_dereq_,module,exports){

var Context = _dereq_('./context').Context;

var DiffContext = function DiffContext(left, right){
    this.left = left;
    this.right = right;
    this.pipe = 'diff';
};

DiffContext.prototype = new Context();

exports.DiffContext = DiffContext;
},{"./context":2}],4:[function(_dereq_,module,exports){

var Context = _dereq_('./context').Context;

var PatchContext = function PatchContext(left, delta){
    this.left = left;
    this.delta = delta;
    this.pipe = 'patch';
};

PatchContext.prototype = new Context();

exports.PatchContext = PatchContext;
},{"./context":2}],5:[function(_dereq_,module,exports){

var Context = _dereq_('./context').Context;

var ReverseContext = function ReverseContext(delta){
    this.delta = delta;
    this.pipe = 'reverse';
};

ReverseContext.prototype = new Context();

exports.ReverseContext = ReverseContext;
},{"./context":2}],6:[function(_dereq_,module,exports){

// use as 2nd parameter for JSON.parse to revive Date instances
module.exports = function dateReviver(key, value) {
    var parts;
    if (typeof value === 'string') {
        parts = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d*))?(Z|([+\-])(\d{2}):(\d{2}))$/.exec(value);
        if (parts) {
            return new Date(Date.UTC(+parts[1], +parts[2] - 1, +parts[3],
              +parts[4], +parts[5], +parts[6], +(parts[7] || 0)));
        }
    }
    return value;
};

},{}],7:[function(_dereq_,module,exports){

var Processor = _dereq_('./processor').Processor;
var Pipe = _dereq_('./pipe').Pipe;
var DiffContext = _dereq_('./contexts/diff').DiffContext;
var PatchContext = _dereq_('./contexts/patch').PatchContext;
var ReverseContext = _dereq_('./contexts/reverse').ReverseContext;

var trivial = _dereq_('./filters/trivial');
var nested = _dereq_('./filters/nested');
var arrays = _dereq_('./filters/arrays');
var dates = _dereq_('./filters/dates');
var texts = _dereq_('./filters/texts');

var DiffPatcher = function DiffPatcher(options){
    this.processor = new Processor(options);
    this.processor.pipe(new Pipe('diff').append(
        nested.collectChildrenDiffFilter,
        trivial.diffFilter,
        dates.diffFilter,
        texts.diffFilter,
        nested.objectsDiffFilter,
        arrays.diffFilter
        ).shouldHaveResult());
    this.processor.pipe(new Pipe('patch').append(
        nested.collectChildrenPatchFilter,
        arrays.collectChildrenPatchFilter,
        trivial.patchFilter,
        texts.patchFilter,
        nested.patchFilter,
        arrays.patchFilter
        ).shouldHaveResult());
    this.processor.pipe(new Pipe('reverse').append(
        nested.collectChildrenReverseFilter,
        arrays.collectChildrenReverseFilter,
        trivial.reverseFilter,
        texts.reverseFilter,
        nested.reverseFilter,
        arrays.reverseFilter
        ).shouldHaveResult());
};

DiffPatcher.prototype.options = function() {
    return this.processor.options.apply(this.processor, arguments);
};

DiffPatcher.prototype.diff = function(left, right) {
    return this.processor.process(new DiffContext(left, right));
};

DiffPatcher.prototype.patch = function(left, delta) {
    return this.processor.process(new PatchContext(left, delta));
};

DiffPatcher.prototype.reverse = function(delta) {
    return this.processor.process(new ReverseContext(delta));
};

DiffPatcher.prototype.unpatch = function(right, delta) {
    return this.patch(right, this.reverse(delta));
};

exports.DiffPatcher = DiffPatcher;

},{"./contexts/diff":3,"./contexts/patch":4,"./contexts/reverse":5,"./filters/arrays":9,"./filters/dates":10,"./filters/nested":12,"./filters/texts":13,"./filters/trivial":14,"./pipe":15,"./processor":16}],8:[function(_dereq_,module,exports){
(function (process){

var DiffPatcher = _dereq_('./diffpatcher').DiffPatcher;
exports.DiffPatcher = DiffPatcher;

exports.create = function(options){
	return new DiffPatcher(options);
};

exports.dateReviver = _dereq_('./date-reviver');

var defaultInstance;

exports.diff = function() {
	if (!defaultInstance) {
		defaultInstance = new DiffPatcher();
	}
	return defaultInstance.diff.apply(defaultInstance, arguments);
};

exports.patch = function() {
	if (!defaultInstance) {
		defaultInstance = new DiffPatcher();
	}
	return defaultInstance.patch.apply(defaultInstance, arguments);
};

exports.unpatch = function() {
	if (!defaultInstance) {
		defaultInstance = new DiffPatcher();
	}
	return defaultInstance.unpatch.apply(defaultInstance, arguments);
};

exports.reverse = function() {
	if (!defaultInstance) {
		defaultInstance = new DiffPatcher();
	}
	return defaultInstance.reverse.apply(defaultInstance, arguments);
};

var inNode = typeof process !== 'undefined' && typeof process.execPath === 'string';
if (inNode) {
	var formatters = _dereq_('./formatters' + '/index');
	exports.formatters = formatters;
	// shortcut for console
	exports.console = formatters.console;
} else {
	exports.homepage = 'https://github.com/benjamine/jsondiffpatch';
	exports.version = '0.1.8';
}

}).call(this,_dereq_("1YiZ5S"))
},{"./date-reviver":6,"./diffpatcher":7,"1YiZ5S":1}],9:[function(_dereq_,module,exports){

var DiffContext = _dereq_('../contexts/diff').DiffContext;
var PatchContext = _dereq_('../contexts/patch').PatchContext;
var ReverseContext = _dereq_('../contexts/reverse').ReverseContext;

var lcs = _dereq_('./lcs');

var ARRAY_MOVE = 3;

var isArray = (typeof Array.isArray === 'function') ?
    // use native function
    Array.isArray :
    // use instanceof operator
    function(a) {
        return a instanceof Array;
    };

var arrayIndexOf = typeof Array.prototype.indexOf === 'function' ?
    function(array, item) {
        return array.indexOf(item);
    } : function(array, item) {
        var length = array.length;
        for (var i = 0; i < length; i++) {
            if (array[i] === item) {
                return i;
            }
        }
        return -1;
    };

var diffFilter = function arraysDiffFilter(context){
    if (!context.leftIsArray) { return; }

    var objectHash = context.options && context.options.objectHash;

    var match = function(array1, array2, index1, index2, context) {
        var value1 = array1[index1];
        var value2 = array2[index2];
        if (value1 === value2) {
            return true;
        }
        if (typeof value1 !== 'object' || typeof value2 !== 'object') {
            return false;
        }
        if (!objectHash) { return false; }
        var hash1, hash2;
        if (typeof index1 === 'number') {
            context.hashCache1 = context.hashCache1 || [];
            hash1 = context.hashCache1[index1];
            if (typeof hash1 === 'undefined') {
                context.hashCache1[index1] = hash1 = objectHash(value1, index1);
            }
        } else {
            hash1 = objectHash(value1);
        }
        if (typeof hash1 === 'undefined') {
            return false;
        }
        if (typeof index2 === 'number') {
            context.hashCache2 = context.hashCache2 || [];
            hash2 = context.hashCache2[index2];
            if (typeof hash2 === 'undefined') {
                context.hashCache2[index2] = hash2 = objectHash(value2, index2);
            }
        } else {
            hash2 = objectHash(value2);
        }
        if (typeof hash2 === 'undefined') {
            return false;
        }
        return hash1 === hash2;
    };

    var matchContext = {};
    var commonHead = 0, commonTail = 0, index, index1, index2;
    var array1 = context.left;
    var array2 = context.right;
    var len1 = array1.length;
    var len2 = array2.length;

    var child;

    // separate common head
    while (commonHead < len1 && commonHead < len2 &&
        match(array1, array2, commonHead, commonHead, matchContext)) {
        index = commonHead;
        child = new DiffContext(context.left[index], context.right[index]);
        context.push(child, index);
        commonHead++;
    }
    // separate common tail
    while (commonTail + commonHead < len1 && commonTail + commonHead < len2 &&
        match(array1, array2, len1 - 1 - commonTail, len2 - 1 - commonTail, matchContext)) {
        index1 = len1 - 1 - commonTail;
        index2 = len2 - 1 - commonTail;
        child = new DiffContext(context.left[index1], context.right[index2]);
        context.push(child, index2);
        commonTail++;
    }
    var result;
    if (commonHead + commonTail === len1) {
        if (len1 === len2) {
            // arrays are identical
            context.setResult(undefined).exit();
            return;
        }
        // trivial case, a block (1 or more consecutive items) was added
        result = result || { _t: 'a' };
        for (index = commonHead; index < len2 - commonTail; index++) {
            result[index] = [array2[index]];
        }
        context.setResult(result).exit();
        return;
    }
    if (commonHead + commonTail === len2) {
        // trivial case, a block (1 or more consecutive items) was removed
        result = result || { _t: 'a' };
        for (index = commonHead; index < len1 - commonTail; index++) {
            result['_'+index] = [array1[index], 0, 0];
        }
        context.setResult(result).exit();
        return;
    }
    // reset hash cache
    matchContext = {};
    // diff is not trivial, find the LCS (Longest Common Subsequence)
    var trimmed1 = array1.slice(commonHead, len1 - commonTail);
    var trimmed2 = array2.slice(commonHead, len2 - commonTail);
    var seq = lcs.get(
        trimmed1, trimmed2,
        match,
        matchContext
    );
    var removedItems = [];
    result = result || { _t: 'a' };
    for (index = commonHead; index < len1 - commonTail; index++) {
        if (arrayIndexOf(seq.indices1, index - commonHead) < 0) {
            // removed
            result['_'+index] = [array1[index], 0, 0];
            removedItems.push(index);
        }
    }

    var detectMove = true;
    if (context.options && context.options.arrays && context.options.arrays.detectMove === false) {
        detectMove = false;
    }
    var includeValueOnMove = false;
    if (context.options && context.options.arrays && context.options.arrays.includeValueOnMove) {
        includeValueOnMove = true;
    }

    var removedItemsLength = removedItems.length;
    for (index = commonHead; index < len2 - commonTail; index++) {
        var indexOnArray2 = arrayIndexOf(seq.indices2, index - commonHead);
        if (indexOnArray2 < 0) {
            // added, try to match with a removed item and register as position move
            var isMove = false;
            if (detectMove && removedItemsLength > 0) {
                for (var removeItemIndex1 = 0; removeItemIndex1 < removedItemsLength; removeItemIndex1++) {
                    index1 = removedItems[removeItemIndex1];
                    if (match(trimmed1, trimmed2, index1 - commonHead,
                        index - commonHead, matchContext)) {
                        // store position move as: [originalValue, newPosition, ARRAY_MOVE]
                        result['_' + index1].splice(1, 2, index, ARRAY_MOVE);
                        if (!includeValueOnMove) {
                            // don't include moved value on diff, to save bytes
                            result['_' + index1][0] = '';
                        }

                        index2 = index;
                        child = new DiffContext(context.left[index1], context.right[index2]);
                        context.push(child, index2);
                        removedItems.splice(removeItemIndex1, 1);
                        isMove = true;
                        break;
                    }
                }
            }
            if (!isMove) {
                // added
                result[index] = [array2[index]];
            }
        } else {
            // match, do inner diff
            index1 = seq.indices1[indexOnArray2] + commonHead;
            index2 = seq.indices2[indexOnArray2] + commonHead;
            child = new DiffContext(context.left[index1], context.right[index2]);
            context.push(child, index2);
        }
    }

    context.setResult(result).exit();

};
diffFilter.filterName = 'arrays';

var compare = {
    numerically: function(a, b) {
        return a - b;
    },
    numericallyBy: function(name) {
        return function(a, b) {
            return a[name] - b[name];
        };
    }
};

var patchFilter = function nestedPatchFilter(context) {
    if (!context.nested) { return; }
    if (context.delta._t !== 'a') { return; }
    var index, index1;

    var delta = context.delta;
    var array = context.left;

    // first, separate removals, insertions and modifications
    var toRemove = [];
    var toInsert = [];
    var toModify = [];
    for (index in delta) {
        if (index !== '_t') {
            if (index[0] === '_') {
                // removed item from original array
                if (delta[index][2] === 0 || delta[index][2] === ARRAY_MOVE) {
                    toRemove.push(parseInt(index.slice(1), 10));
                } else {
                    throw new Error('only removal or move can be applied at original array indices' +
                        ', invalid diff type: ' + delta[index][2]);
                }
            } else {
                if (delta[index].length === 1) {
                    // added item at new array
                    toInsert.push({
                        index: parseInt(index, 10),
                        value: delta[index][0]
                    });
                } else {
                    // modified item at new array
                    toModify.push({
                        index: parseInt(index, 10),
                        delta: delta[index]
                    });
                }
            }
        }
    }

    // remove items, in reverse order to avoid sawing our own floor
    toRemove = toRemove.sort(compare.numerically);
    for (index = toRemove.length - 1; index >= 0; index--) {
        index1 = toRemove[index];
        var indexDiff = delta['_' + index1];
        var removedValue = array.splice(index1, 1)[0];
        if (indexDiff[2] === ARRAY_MOVE) {
            // reinsert later
            toInsert.push({
                index: indexDiff[1],
                value: removedValue
            });
        }
    }

    // insert items, in reverse order to avoid moving our own floor
    toInsert = toInsert.sort(compare.numericallyBy('index'));
    var toInsertLength = toInsert.length;
    for (index = 0; index < toInsertLength; index++) {
        var insertion = toInsert[index];
        array.splice(insertion.index, 0, insertion.value);
    }

    // apply modifications
    var toModifyLength = toModify.length;
    var child;
    if (toModifyLength > 0) {
        for (index = 0; index < toModifyLength; index++) {
            var modification = toModify[index];
            child = new PatchContext(context.left[modification.index], modification.delta);
            context.push(child, modification.index);
        }
    }

    if (!context.children) {
        context.setResult(context.left).exit();
        return;
    }
    context.exit();
};
patchFilter.filterName = 'arrays';

var collectChildrenPatchFilter = function collectChildrenPatchFilter(context) {
    if (!context || !context.children) { return; }
    if (context.delta._t !== 'a') { return; }
    var length = context.children.length;
    var child;
    for (var index = 0; index < length; index++) {
        child = context.children[index];
        context.left[child.childName] = child.result;
    }
    context.setResult(context.left).exit();
};
collectChildrenPatchFilter.filterName = 'arraysCollectChildren';

var reverseFilter = function arraysReverseFilter(context) {
    if (!context.nested) {
        if (context.delta[2] === ARRAY_MOVE) {
            context.newName = '_' + context.delta[1];
            context.setResult([context.delta[0], parseInt(context.childName.substr(1), 10), ARRAY_MOVE]).exit();
        }
        return;
    }
    if (context.delta._t !== 'a') { return; }
    var name, child;
    for (name in context.delta) {
        if (name === '_t') { continue; }
        child = new ReverseContext(context.delta[name]);
        context.push(child, name);
    }
    context.exit();
};
reverseFilter.filterName = 'arrays';

var reverseArrayDeltaIndex = function(delta, index, itemDelta) {
    var newIndex = index;
    if (typeof index === 'string' && index[0] === '_') {
        newIndex = parseInt(index.substr(1), 10);
    } else {
        var uindex = '_' + index;
        if (isArray(itemDelta) && itemDelta[2] === 0) {
            newIndex = uindex;
        } else {
            for (var index2 in delta) {
                var itemDelta2 = delta[index2];
                if (isArray(itemDelta2) && itemDelta2[2] === ARRAY_MOVE && itemDelta2[1].toString() === index) {
                    newIndex = index2.substr(1);
                }
            }
        }
    }
    return newIndex;
};

var collectChildrenReverseFilter = function collectChildrenReverseFilter(context) {
    if (!context || !context.children) { return; }
    if (context.delta._t !== 'a') { return; }
    var length = context.children.length;
    var child;
    var delta = { _t: 'a' };
    for (var index = 0; index < length; index++) {
        child = context.children[index];
        var name = child.newName;
        if (typeof name === 'undefined') {
            name = reverseArrayDeltaIndex(context.delta, child.childName, child.result);
        }
        if (delta[name] !== child.result) {
            delta[name] = child.result;
        }
    }
    context.setResult(delta).exit();
};
collectChildrenReverseFilter.filterName = 'arraysCollectChildren';

exports.diffFilter = diffFilter;
exports.patchFilter = patchFilter;
exports.collectChildrenPatchFilter = collectChildrenPatchFilter;
exports.reverseFilter = reverseFilter;
exports.collectChildrenReverseFilter = collectChildrenReverseFilter;

},{"../contexts/diff":3,"../contexts/patch":4,"../contexts/reverse":5,"./lcs":11}],10:[function(_dereq_,module,exports){
var diffFilter = function datesDiffFilter(context) {
    if (context.left instanceof Date) {
        if (context.right instanceof Date) {
            if (context.left.getTime() !== context.right.getTime()) {
                context.setResult([context.left, context.right]);
            } else {
                context.setResult(undefined);
            }
        } else {
            context.setResult([context.left, context.right]);
        }
        context.exit();
    } else if (context.right instanceof Date) {
        context.setResult([context.left, context.right]).exit();
    }
};
diffFilter.filterName = 'dates';

exports.diffFilter = diffFilter;
},{}],11:[function(_dereq_,module,exports){
/*

LCS implementation that supports arrays or strings

reference: http://en.wikipedia.org/wiki/Longest_common_subsequence_problem

*/

var defaultMatch = function(array1, array2, index1, index2) {
    return array1[index1] === array2[index2];
};

var lengthMatrix = function(array1, array2, match, context) {
    var len1 = array1.length;
    var len2 = array2.length;
    var x, y;

    // initialize empty matrix of len1+1 x len2+1
    var matrix = [len1 + 1];
    for (x = 0; x < len1 + 1; x++) {
        matrix[x] = [len2 + 1];
        for (y = 0; y < len2 + 1; y++) {
            matrix[x][y] = 0;
        }
    }
    matrix.match = match;
    // save sequence lengths for each coordinate
    for (x = 1; x < len1 + 1; x++) {
        for (y = 1; y < len2 + 1; y++) {
            if (match(array1, array2, x - 1, y - 1, context)) {
                matrix[x][y] = matrix[x - 1][y - 1] + 1;
            } else {
                matrix[x][y] = Math.max(matrix[x - 1][y], matrix[x][y - 1]);
            }
        }
    }
    return matrix;
};

var backtrack = function(matrix, array1, array2, index1, index2, context) {
    if (index1 === 0 || index2 === 0) {
        return {
            sequence: [],
            indices1: [],
            indices2: []
        };
    }

    if (matrix.match(array1, array2, index1 - 1, index2 - 1, context)) {
        var subsequence = backtrack(matrix, array1, array2, index1 - 1, index2 - 1, context);
        subsequence.sequence.push(array1[index1 - 1]);
        subsequence.indices1.push(index1 - 1);
        subsequence.indices2.push(index2 - 1);
        return subsequence;
    }

    if (matrix[index1][index2 - 1] > matrix[index1 - 1][index2]) {
        return backtrack(matrix, array1, array2, index1, index2 - 1, context);
    } else {
        return backtrack(matrix, array1, array2, index1 - 1, index2, context);
    }
};

var get = function(array1, array2, match, context) {
    context = context || {};
    var matrix = lengthMatrix(array1, array2, match || defaultMatch, context);
    var result = backtrack(matrix, array1, array2, array1.length, array2.length, context);
    if (typeof array1 === 'string' && typeof array2 === 'string') {
        result.sequence = result.sequence.join('');
    }
    return result;
};

exports.get = get;

},{}],12:[function(_dereq_,module,exports){

var DiffContext = _dereq_('../contexts/diff').DiffContext;
var PatchContext = _dereq_('../contexts/patch').PatchContext;
var ReverseContext = _dereq_('../contexts/reverse').ReverseContext;

var collectChildrenDiffFilter = function collectChildrenDiffFilter(context) {
    if (!context || !context.children) { return; }
    var length = context.children.length;
    var child;
    var result = context.result;
    for (var index = 0; index < length; index++) {
        child = context.children[index];
        if (typeof child.result === 'undefined') {
            continue;
        }
        result = result || {};
        result[child.childName] = child.result;
    }
    if (result && context.leftIsArray) {
        result._t = 'a';
    }
    context.setResult(result).exit();
};
collectChildrenDiffFilter.filterName = 'collectChildren';

var objectsDiffFilter = function objectsDiffFilter(context) {
    if (context.leftIsArray || context.leftType !== 'object') { return; }

    var name, child;
    for (name in context.left) {
        child = new DiffContext(context.left[name], context.right[name]);
        context.push(child, name);
    }
    for (name in context.right) {
        if (typeof context.left[name] === 'undefined') {
            child = new DiffContext(undefined, context.right[name]);
            context.push(child, name);
        }
    }

    if (!context.children || context.children.length === 0) {
        context.setResult(undefined).exit();
        return;
    }
    context.exit();
};
objectsDiffFilter.filterName = 'objects';

var patchFilter = function nestedPatchFilter(context) {
    if (!context.nested) { return; }
    if (context.delta._t) { return; }
    var name, child;
    for (name in context.delta) {
        child = new PatchContext(context.left[name], context.delta[name]);
        context.push(child, name);
    }
    context.exit();
};
patchFilter.filterName = 'objects';

var collectChildrenPatchFilter = function collectChildrenPatchFilter(context) {
    if (!context || !context.children) { return; }
    if (context.delta._t) { return; }
    var length = context.children.length;
    var child;
    for (var index = 0; index < length; index++) {
        child = context.children[index];
        if (context.left[child.childName] !== child.result) {
            context.left[child.childName] = child.result;
        }
    }
    context.setResult(context.left).exit();
};
collectChildrenPatchFilter.filterName = 'collectChildren';

var reverseFilter = function nestedReverseFilter(context) {
    if (!context.nested) { return; }
    if (context.delta._t) { return; }
    var name, child;
    for (name in context.delta) {
        child = new ReverseContext(context.delta[name]);
        context.push(child, name);
    }
    context.exit();
};
reverseFilter.filterName = 'objects';

var collectChildrenReverseFilter = function collectChildrenReverseFilter(context) {
    if (!context || !context.children) { return; }
    if (context.delta._t) { return; }
    var length = context.children.length;
    var child;
    var delta = {};
    for (var index = 0; index < length; index++) {
        child = context.children[index];
        if (delta[child.childName] !== child.result) {
            delta[child.childName] = child.result;
        }
    }
    context.setResult(delta).exit();
};
collectChildrenReverseFilter.filterName = 'collectChildren';

exports.collectChildrenDiffFilter = collectChildrenDiffFilter;
exports.objectsDiffFilter = objectsDiffFilter;
exports.patchFilter = patchFilter;
exports.collectChildrenPatchFilter = collectChildrenPatchFilter;
exports.reverseFilter = reverseFilter;
exports.collectChildrenReverseFilter = collectChildrenReverseFilter;
},{"../contexts/diff":3,"../contexts/patch":4,"../contexts/reverse":5}],13:[function(_dereq_,module,exports){
/* global diff_match_patch */
var TEXT_DIFF = 2;
var DEFAULT_MIN_LENGTH = 60;
var cachedDiffPatch = null;

var getDiffMatchPatch = function(){
    /*jshint camelcase: false */

    if (!cachedDiffPatch) {
        var instance;
        if (typeof diff_match_patch !== 'undefined') {
            // already loaded, probably a browser
            instance = new diff_match_patch();
        } else if (typeof _dereq_ === 'function') {
            var dmp = _dereq_('../../external/diff_match_patch_uncompressed');
            instance = new dmp.diff_match_patch();
        }
        if (!instance) {
            var error = new Error('text diff_match_patch library not found');
            error.diff_match_patch_not_found = true;
            throw error;
        }
        cachedDiffPatch = {
            diff: function(txt1, txt2){
                return instance.patch_toText(instance.patch_make(txt1, txt2));
            },
            patch: function(txt1, patch){
                var results = instance.patch_apply(instance.patch_fromText(patch), txt1);
                for (var i = 0; i < results[1].length; i++) {
                    if (!results[1][i]) {
                        var error = new Error('text patch failed');
                        error.textPatchFailed = true;
                    }
                }
                return results[0];
            }
        };
    }
    return cachedDiffPatch;
};

var diffFilter = function textsDiffFilter(context) {
    if (context.leftType !== 'string') { return; }
    var minLength = (context.options && context.options.textDiff &&
        context.options.textDiff.minLength) || DEFAULT_MIN_LENGTH;
    if (context.left.length < minLength ||
        context.right.length < minLength) {
        context.setResult([context.left, context.right]).exit();
        return;
    }
    // large text, use a text-diff algorithm
    var diff = getDiffMatchPatch().diff;
    context.setResult([diff(context.left, context.right), 0, TEXT_DIFF]).exit();
};
diffFilter.filterName = 'texts';

var patchFilter = function textsPatchFilter(context) {
    if (context.nested) { return; }
    if (context.delta[2] !== TEXT_DIFF) { return; }

    // text-diff, use a text-patch algorithm
    var patch = getDiffMatchPatch().patch;
    context.setResult(patch(context.left, context.delta[0])).exit();
};
patchFilter.filterName = 'texts';

var textDeltaReverse = function(delta){
    var i, l, lines, line, lineTmp, header = null,
    headerRegex = /^@@ +\-(\d+),(\d+) +\+(\d+),(\d+) +@@$/,
    lineHeader, lineAdd, lineRemove;
    lines = delta.split('\n');
    for (i = 0, l = lines.length; i<l; i++) {
        line = lines[i];
        var lineStart = line.slice(0,1);
        if (lineStart==='@'){
            header = headerRegex.exec(line);
            lineHeader = i;
            lineAdd = null;
            lineRemove = null;

            // fix header
            lines[lineHeader] = '@@ -' + header[3] + ',' + header[4] + ' +' + header[1] + ',' + header[2] + ' @@';
        } else if (lineStart === '+'){
            lineAdd = i;
            lines[i] = '-' + lines[i].slice(1);
            if (lines[i-1].slice(0,1)==='+') {
                // swap lines to keep default order (-+)
                lineTmp = lines[i];
                lines[i] = lines[i-1];
                lines[i-1] = lineTmp;
            }
        } else if (lineStart === '-'){
            lineRemove = i;
            lines[i] = '+' + lines[i].slice(1);
        }
    }
    return lines.join('\n');
};

var reverseFilter = function textsReverseFilter(context) {
    if (context.nested) { return; }
    if (context.delta[2] !== TEXT_DIFF) { return; }

    // text-diff, use a text-diff algorithm
    context.setResult([textDeltaReverse(context.delta[0]), 0, TEXT_DIFF]).exit();
};
reverseFilter.filterName = 'texts';

exports.diffFilter = diffFilter;
exports.patchFilter = patchFilter;
exports.reverseFilter = reverseFilter;
},{}],14:[function(_dereq_,module,exports){

var isArray = (typeof Array.isArray === 'function') ?
    // use native function
    Array.isArray :
    // use instanceof operator
    function(a) {
        return a instanceof Array;
    };

var diffFilter = function trivialMatchesDiffFilter(context) {
    if (context.left === context.right) {
        context.setResult(undefined).exit();
        return;
    }
    if (typeof context.left === 'undefined') {
        if (typeof context.right === 'function') {
            throw new Error('functions are not supported');
        }
        context.setResult([context.right]).exit();
        return;
    }
    if (typeof context.right === 'undefined') {
        context.setResult([context.left, 0, 0]).exit();
        return;
    }
    if (typeof context.left === 'function' || typeof context.right === 'function' ) {
        throw new Error('functions are not supported');
    }
    context.leftType = context.left === null ? 'null' : typeof context.left;
    context.rightType = context.right === null ? 'null' : typeof context.right;
    if (context.leftType !== context.rightType) {
        context.setResult([context.left, context.right]).exit();
        return;
    }
    if (context.leftType === 'boolean' || context.leftType === 'number') {
        context.setResult([context.left, context.right]).exit();
        return;
    }
    if (context.leftType === 'object') {
        context.leftIsArray = isArray(context.left);
    }
    if (context.rightType === 'object') {
        context.rightIsArray = isArray(context.right);
    }
    if (context.leftIsArray !== context.rightIsArray) {
        context.setResult([context.left, context.right]).exit();
        return;
    }
};
diffFilter.filterName = 'trivial';

var patchFilter = function trivialMatchesPatchFilter(context) {
    if (typeof context.delta === 'undefined') {
        context.setResult(context.left).exit();
        return;
    }
    context.nested = !isArray(context.delta);
    if (context.nested) { return; }
    if (context.delta.length === 1) {
        context.setResult(context.delta[0]).exit();
        return;
    }
    if (context.delta.length === 2) {
        context.setResult(context.delta[1]).exit();
        return;
    }
    if (context.delta.length === 3 && context.delta[2] === 0) {
        context.setResult(undefined).exit();
        return;
    }
};
patchFilter.filterName = 'trivial';

var reverseFilter = function trivialReferseFilter(context) {
    if (typeof context.delta === 'undefined') {
        context.setResult(context.delta).exit();
        return;
    }
    context.nested = !isArray(context.delta);
    if (context.nested) { return; }
    if (context.delta.length === 1) {
        context.setResult([context.delta[0], 0, 0]).exit();
        return;
    }
    if (context.delta.length === 2) {
        context.setResult([context.delta[1], context.delta[0]]).exit();
        return;
    }
    if (context.delta.length === 3 && context.delta[2] === 0) {
        context.setResult([context.delta[0]]).exit();
        return;
    }
};
reverseFilter.filterName = 'trivial';

exports.diffFilter = diffFilter;
exports.patchFilter = patchFilter;
exports.reverseFilter = reverseFilter;

},{}],15:[function(_dereq_,module,exports){

var Pipe = function Pipe(name){
    this.name = name;
    this.filters = [];
};

Pipe.prototype.process = function(input) {
    if (!this.processor) {
        throw new Error('add this pipe to a processor before using it');
    }
    var debug = this.debug;
    var length = this.filters.length;
    var context = input;
    for (var index = 0; index < length; index++) {
        var filter = this.filters[index];
        if (debug) {
            this.log('filter: ' + filter.filterName);
        }
        filter(context);
        if (typeof context === 'object' && context.exiting) {
            context.exiting = false;
            break;
        }
    }
    if (!context.next && this.resultCheck) {
        this.resultCheck(context);
    }
};

Pipe.prototype.log = function(msg) {
    console.log('[jsondiffpatch] ' + this.name + ' pipe, ' + msg);
};

Pipe.prototype.append = function() {
    this.filters.push.apply(this.filters, arguments);
    return this;
};

Pipe.prototype.prepend = function() {
    this.filters.unshift.apply(this.filters, arguments);
    return this;
};

Pipe.prototype.indexOf = function(filterName) {
    if (!filterName) {
        throw new Error('a filter name is required');
    }
    for (var index = 0; index < this.filters.length; index++) {
        var filter = this.filters[index];
        if (filter.filterName === filterName) {
            return index;
        }
    }
    throw new Error('filter not found: ' + filterName);
};

Pipe.prototype.list = function() {
    var names = [];
    for (var index = 0; index < this.filters.length; index++) {
        var filter = this.filters[index];
        names.push(filter.filterName);
    }
    return names;
};

Pipe.prototype.after = function(filterName) {
    var index = this.indexOf(filterName);
    var params = Array.prototype.slice.call(arguments, 1);
    if (!params.length) {
        throw new Error('a filter is required');
    }
    params.unshift(index + 1, 0);
    Array.prototype.splice.apply(this.filters, params);
    return this;
};

Pipe.prototype.before = function(filterName) {
    var index = this.indexOf(filterName);
    var params = Array.prototype.slice.call(arguments, 1);
    if (!params.length) {
        throw new Error('a filter is required');
    }
    params.unshift(index, 0);
    Array.prototype.splice.apply(this.filters, params);
    return this;
};

Pipe.prototype.clear = function() {
    this.filters.length = 0;
    return this;
};

Pipe.prototype.shouldHaveResult = function(should) {
    if (should === false) {
        this.resultCheck = null;
        return;
    }
    if (this.resultCheck) { return; }
    var pipe = this;
    this.resultCheck = function(context) {
        if (!context.hasResult) {
            console.log(context);
            var error = new Error(pipe.name + ' failed');
            error.noResult = true;
            throw error;
        }
    };
    return this;
};

exports.Pipe = Pipe;
},{}],16:[function(_dereq_,module,exports){

var Processor = function Processor(options){
	this.selfOptions = options;
	this.pipes = {};
};

Processor.prototype.options = function(options) {
	if (options) {
		this.selfOptions = options;
	}
	return this.selfOptions;
};

Processor.prototype.pipe = function(name, pipe) {
	if (typeof name === 'string') {
		if (typeof pipe === 'undefined') {
			return this.pipes[name];
		} else {
			this.pipes[name] = pipe;
		}
	}
	if (name && name.name) {
		pipe = name;
		if (pipe.processor === this) { return pipe; }
		this.pipes[pipe.name] = pipe;
	}
	pipe.processor = this;
	return pipe;
};

Processor.prototype.process = function(input, pipe) {
	var context = input;
	context.options = this.options();
	var nextPipe = pipe || input.pipe || 'default';
	var lastPipe, lastContext;
	while (nextPipe) {
		if (typeof context.nextAfterChildren !== 'undefined') {
			// children processed and coming back to parent
			context.next = context.nextAfterChildren;
			context.nextAfterChildren = null;
		}

		if (typeof nextPipe === 'string') {
			nextPipe = this.pipe(nextPipe);
		}
		nextPipe.process(context);
		lastContext = context;
		lastPipe = nextPipe;
		nextPipe = null;
		if (context) {
			if (context.next) {
				context = context.next;
				nextPipe = lastContext.nextPipe || context.pipe || lastPipe;
			}
		}
	}
	return context.hasResult ? context.result : undefined;
};

exports.Processor = Processor;

},{}]},{},[8])
(8)
});
var define, requireModule, require, requirejs;

(function() {
  var registry = {}, seen = {}, state = {};
  var FAILED = false;

  define = function(name, deps, callback) {
    registry[name] = {
      deps: deps,
      callback: callback
    };
  };

  function reify(deps, name, seen) {
    var length = deps.length;
    var reified = new Array(length);
    var dep;
    var exports;

    for (var i = 0, l = length; i < l; i++) {
      dep = deps[i];
      if (dep === 'exports') {
        exports = reified[i] = seen;
      } else {
        reified[i] = require(resolve(dep, name));
      }
    }

    return {
      deps: reified,
      exports: exports
    };
  }

  requirejs = require = requireModule = function(name) {
    if (state[name] !== FAILED &&
        seen.hasOwnProperty(name)) {
      return seen[name];
    }

    if (!registry[name]) {
      throw new Error('Could not find module ' + name);
    }

    var mod = registry[name];
    var reified;
    var module;
    var loaded = false;

    seen[name] = { }; // placeholder for run-time cycles

    try {
      reified = reify(mod.deps, name, seen[name]);
      module = mod.callback.apply(this, reified.deps);
      loaded = true;
    } finally {
      if (!loaded) {
        state[name] = FAILED;
      }
    }

    return reified.exports ? seen[name] : (seen[name] = module);
  };

  function resolve(child, name) {
    if (child.charAt(0) !== '.') { return child; }

    var parts = child.split('/');
    var nameParts = name.split('/');
    var parentBase;

    if (nameParts.length === 1) {
      parentBase = nameParts;
    } else {
      parentBase = nameParts.slice(0, -1);
    }

    for (var i = 0, l = parts.length; i < l; i++) {
      var part = parts[i];

      if (part === '..') { parentBase.pop(); }
      else if (part === '.') { continue; }
      else { parentBase.push(part); }
    }

    return parentBase.join('/');
  }

  requirejs.entries = requirejs._eak_seen = registry;
  requirejs.clear = function(){
    requirejs.entries = requirejs._eak_seen = registry = {};
    seen = state = {};
  };
})();

define("epf",
  ["./ext/date","./namespace","./adapter","./id_manager","./initializers","./setup_container","./collections/model_array","./collections/model_set","./local/local_adapter","./merge_strategies/base","./merge_strategies/per_field","./model/attribute","./model/model","./model/diff","./model/errors","./model/promise","./relationships/belongs_to","./relationships/ext","./relationships/has_many","./rest/serializers/errors","./rest/serializers/payload","./rest/embedded_helpers_mixin","./rest/embedded_manager","./rest/operation","./rest/operation_graph","./rest/payload","./rest/rest_adapter","./rest/rest_errors","./active_model/active_model_adapter","./active_model/serializers/model","./serializers/base","./serializers/belongs_to","./serializers/boolean","./serializers/date","./serializers/has_many","./serializers/id","./serializers/number","./serializers/model","./serializers/revision","./serializers/string","./session/child_session","./session/collection_manager","./session/inverse_manager","./session/merge","./session/session","./utils/isEqual","./debug/debug_adapter","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__, __dependency6__, __dependency7__, __dependency8__, __dependency9__, __dependency10__, __dependency11__, __dependency12__, __dependency13__, __dependency14__, __dependency15__, __dependency16__, __dependency17__, __dependency18__, __dependency19__, __dependency20__, __dependency21__, __dependency22__, __dependency23__, __dependency24__, __dependency25__, __dependency26__, __dependency27__, __dependency28__, __dependency29__, __dependency30__, __dependency31__, __dependency32__, __dependency33__, __dependency34__, __dependency35__, __dependency36__, __dependency37__, __dependency38__, __dependency39__, __dependency40__, __dependency41__, __dependency42__, __dependency43__, __dependency44__, __dependency45__, __dependency46__, __dependency47__, __exports__) {
    "use strict";

    var Ep = __dependency2__["default"];

    var Adapter = __dependency3__["default"];
    var IdManager = __dependency4__["default"];
    var setupContainer = __dependency6__["default"];

    var ModelArray = __dependency7__["default"];
    var ModelSet = __dependency8__["default"];

    var LocalAdapter = __dependency9__["default"];

    var MergeStrategy = __dependency10__["default"];
    var PerField = __dependency11__["default"];

    var attr = __dependency12__["default"];
    var Model = __dependency13__["default"];
    var Errors = __dependency15__["default"];
    var ModelPromise = __dependency16__["default"];

    var belongsTo = __dependency17__["default"];
    var hasMany = __dependency19__["default"];
    var HasManyArray = __dependency19__.HasManyArray;

    var RestErrorsSerializer = __dependency20__["default"];
    var PayloadSerializer = __dependency21__["default"];
    var EmbeddedHelpersMixin = __dependency22__["default"];
    var EmbeddedManager = __dependency23__["default"];
    var Operation = __dependency24__["default"];
    var OperationGraph = __dependency25__["default"];
    var Payload = __dependency26__["default"];
    var RestAdapter = __dependency27__["default"];
    var RestErrors = __dependency28__["default"];

    var ActiveModelAdapter = __dependency29__["default"];
    var ActiveModelSerializer = __dependency30__["default"];

    var Serializer = __dependency31__["default"];
    var BelongsToSerializer = __dependency32__["default"];
    var BooleanSerializer = __dependency33__["default"];
    var DateSerializer = __dependency34__["default"];
    var HasManySerializer = __dependency35__["default"];
    var IdSerializer = __dependency36__["default"];
    var NumberSerializer = __dependency37__["default"];
    var ModelSerializer = __dependency38__["default"];
    var RevisionSerializer = __dependency39__["default"];
    var StringSerializer = __dependency40__["default"];

    var ChildSession = __dependency41__["default"];
    var CollectionManager = __dependency42__["default"];
    var InverseManager = __dependency43__["default"];
    var Session = __dependency45__["default"];

    var isEqual = __dependency46__["default"];

    var DebugAdapter = __dependency47__["default"];

    Ep.Adapter = Adapter;
    Ep.IdManager = IdManager;
    Ep.setupContainer = setupContainer;

    Ep.ModelArray = ModelArray;
    Ep.ModelSet = ModelSet;

    Ep.LocalAdapter = LocalAdapter;

    Ep.MergeStrategy = MergeStrategy;
    Ep.PerField = PerField;

    Ep.belongsTo = belongsTo;
    Ep.hasMany = hasMany;
    Ep.attr = attr;
    Ep.Model = Model;
    Ep.Errors = Errors;

    Ep.ModelPromise = ModelPromise;

    Ep.RestErrorsSerializer = RestErrorsSerializer;
    Ep.PayloadSerializer = PayloadSerializer;
    Ep.EmbeddedHelpersMixin = EmbeddedHelpersMixin;
    Ep.EmbeddedManager = EmbeddedManager;
    Ep.Operation = Operation;
    Ep.OperationGraph = OperationGraph;
    Ep.Payload = Payload;
    Ep.RestAdapter = RestAdapter;
    Ep.RestErrors = RestErrors;

    Ep.ActiveModelAdapter = ActiveModelAdapter;
    Ep.ActiveModelSerializer = ActiveModelSerializer;

    Ep.Serializer = Serializer;
    Ep.BelongsToSerializer = BelongsToSerializer;
    Ep.BooleanSerializer = BooleanSerializer;
    Ep.DateSerializer = DateSerializer;
    Ep.HasManySerializer = HasManySerializer;
    Ep.IdSerializer = IdSerializer;
    Ep.NumberSerializer = NumberSerializer;
    Ep.ModelSerializer = ModelSerializer;
    Ep.RevisionSerializer = RevisionSerializer;
    Ep.StringSerializer = StringSerializer;

    Ep.ChildSession = ChildSession;
    Ep.CollectionManager = CollectionManager;
    Ep.InverseManager = InverseManager;
    Ep.Session = Session;

    Ep.isEqual = isEqual;

    Ep.DebugAdapter = DebugAdapter;

    __exports__["default"] = Ep;
  });
define("epf/active_model/active_model_adapter",
  ["../rest/rest_adapter","./serializers/model","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    /*global jQuery*/

    var RestAdapter = __dependency1__["default"];
    var ActiveModelSerializer = __dependency2__["default"];

    var decamelize = Ember.String.decamelize,
        underscore = Ember.String.underscore,
        pluralize = Ember.String.pluralize;

    /**
      The ActiveModelAdapter is a subclass of the RestAdapter designed to integrate
      with a JSON API that uses an underscored naming convention instead of camelcasing.
      It has been designed to work out of the box with the
      [active_model_serializers](http://github.com/rails-api/active_model_serializers)
      Ruby gem.

      This adapter extends the Ep.RestAdapter by making consistent use of the camelization,
      decamelization and pluralization methods to normalize the serialized JSON into a
      format that is compatible with a conventional Rails backend.

      ## JSON Structure

      The ActiveModelAdapter expects the JSON returned from your server to follow
      the REST adapter conventions substituting underscored keys for camelcased ones.

      ### Conventional Names

      Attribute names in your JSON payload should be the underscored versions of
      the attributes in your Ember.js models.

      For example, if you have a `Person` model:

      ```js
      App.FamousPerson = Ep.Model.extend({
        firstName: Ep.attr('string'),
        lastName: Ep.attr('string'),
        occupation: Ep.attr('string')
      });
      ```

      The JSON returned should look like this:

      ```js
      {
        "famous_person": {
          "first_name": "Barack",
          "last_name": "Obama",
          "occupation": "President"
        }
      }
      ```

      @class ActiveModelAdapter
      @constructor
      @namespace Ep
      @extends RestAdapter
    **/
    __exports__["default"] = RestAdapter.extend({
      defaultSerializer: 'payload',

      setupContainer: function(parent) {
        var container = this._super(parent);
        container.register('serializer:model', ActiveModelSerializer);
        return container;
      },

      pathForType: function(type) {
        var decamelized = decamelize(type);
        var underscored = underscore(decamelized);
        return pluralize(underscored);
      }

    });
  });
define("epf/active_model/serializers/model",
  ["../../serializers/model","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var ModelSerializer = __dependency1__["default"];

    __exports__["default"] = ModelSerializer.extend({

      keyForType: function(name, type, opts) {
        var key = this._super(name, type);
        if(!opts || !opts.embedded) {
          if(type === 'belongs-to') {
            return key + '_id';
          } else if(type === 'has-many') {
            return Ember.String.singularize(key) + '_ids';
          }
        }
        return key;
      },

    });
  });
define("epf/adapter",
  ["./serializers/serializer_for_mixin","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var get = Ember.get, set = Ember.set, merge = Ember.merge;

    function mustImplement(name) {
      return function() {
        throw new Ember.Error("Your adapter " + this.toString() + " does not implement the required method " + name);
      };
    }

    var SerializerForMixin = __dependency1__["default"];

    __exports__["default"] = Ember.Object.extend(SerializerForMixin, {
      mergedProperties: ['configs'],

      init: function() {
        this._super.apply(this, arguments);
        this.configs = {};
        this.container = this.setupContainer(this.container);
      },

      setupContainer: function(container) {
        return container;
      },

      configFor: function(type) {
        var configs = get(this, 'configs'),
            typeKey = get(type, 'typeKey');

        return configs[typeKey] || {};
      },

      newSession: function() {
        var Session = this.container.lookupFactory('session:base');
        return Session.create({
          adapter: this
        });
      },

      load: mustImplement("load"),

      query: mustImplement("find"),

      refresh: mustImplement("refresh"),

      flush: mustImplement("flush"),

      remoteCall: mustImplement("remoteCall"),

      serialize: function(model, opts) {
        return this.serializerForModel(model).serialize(model, opts);
      },

      deserialize: function(typeKey, data, opts) {
        return this.serializerFor(typeKey).deserialize(data, opts);
      },

      merge: function(model, session) {
        if(!session) {
          session = this.container.lookup('session:main');
        }
        return session.merge(model);
      },

      mergeData: function(data, typeKey, session) {
        if(!typeKey) {
          typeKey = this.defaultSerializer;
        }

        var serializer = this.serializerFor(typeKey),
            deserialized = serializer.deserialize(data);

        if(get(deserialized, 'isModel')) {
          return this.merge(deserialized, session);
        } else {
          return Ember.EnumerableUtils.map(deserialized, function(model) {
            return this.merge(model, session);
          }, this);
        }
      },

      mergeError: Ember.aliasMethod('mergeData'),

      willMergeModel: Ember.K,

      didMergeModel: Ember.K,

      // This can be overridden in the adapter sub-classes
      isDirtyFromRelationships: function(model, cached, relDiff) {
        return relDiff.length > 0;
      },

      shouldSave: function(model) {
        return true;
      },

      reifyClientId: function(model) {
        this.idManager.reifyClientId(model);
      }

    });
  });
define("epf/collections/model_array",
  ["./model_set","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var get = Ember.get, set = Ember.set, Copyable = Ember.Copyable;

    var ModelSet = __dependency1__["default"];

    __exports__["default"] = Ember.ArrayProxy.extend(Copyable, {

      session: null,
      meta: null,

      arrayContentWillChange: function(index, removed, added) {
        for (var i=index; i<index+removed; i++) {
          var model = this.objectAt(i);
          var session = get(this, 'session');

          if(session) {
            session.collectionManager.unregister(this, model);
          }
        }

        this._super.apply(this, arguments);
      },

      arrayContentDidChange: function(index, removed, added) {
        this._super.apply(this, arguments);

        for (var i=index; i<index+added; i++) {
          var model = this.objectAt(i);
          var session = get(this, 'session');

          if(session) {
            session.collectionManager.register(this, model);
          }
        }
      },

      removeObject: function(obj) {
        var loc = get(this, 'length') || 0;
        while(--loc >= 0) {
          var curObject = this.objectAt(loc) ;
          if (curObject.isEqual(obj)) this.removeAt(loc) ;
        }
        return this ;
      },

      contains: function(obj){
        for(var i = 0; i < get(this, 'length') ; i++) {
          var m = this.objectAt(i);
          if(obj.isEqual(m)) return true;
        }
        return false;
      },

      copy: function() {
        return this.content.copy();
      },

      /**
        Ensure that dest has the same content as this array.

        @method copyTo
        @param dest the other model collection to copy to
        @return dest
      */
      copyTo: function(dest) {
        var existing = ModelSet.create();
        existing.addObjects(dest);

        this.forEach(function(model) {
          if(existing.contains(model)) {
            existing.remove(model);
          } else {
            dest.pushObject(model);
          }
        });

        dest.removeObjects(existing);
      },

      diff: function(arr) {
        var diff = Ember.A();

        this.forEach(function(model) {
          if(!arr.contains(model)) {
            diff.push(model);
          }
        }, this);

        arr.forEach(function(model) {
          if(!this.contains(model)) {
            diff.push(model);
          }
        }, this);

        return diff;
      },

      isEqual: function(arr) {
        return this.diff(arr).length === 0;
      },

      load: function() {
        var array = this;
        return Ember.RSVP.all(this.map(function(model) {
          return model.load();
        })).then(function() {
          return array;
        });
      }

    });
  });
define("epf/collections/model_set",
  ["exports"],
  function(__exports__) {
    "use strict";
    /**
    @module ember
    @submodule ember-runtime
    */

    var get = Ember.get, set = Ember.set, isNone = Ember.isNone, fmt = Ember.String.fmt;

    function guidFor(model) {
      return get(model, 'clientId');
    }

    /**
      An unordered collection of objects.

      A Set works a bit like an array except that its items are not ordered. You
      can create a set to efficiently test for membership for an object. You can
      also iterate through a set just like an array, even accessing objects by
      index, however there is no guarantee as to their order.

      All Sets are observable via the Enumerable Observer API - which works
      on any enumerable object including both Sets and Arrays.

      ## Creating a Set

      You can create a set like you would most objects using
      `new Ember.Set()`. Most new sets you create will be empty, but you can
      also initialize the set with some content by passing an array or other
      enumerable of objects to the constructor.

      Finally, you can pass in an existing set and the set will be copied. You
      can also create a copy of a set by calling `Ember.Set#copy()`.

      ```javascript
      // creates a new empty set
      var foundNames = new Ember.Set();

      // creates a set with four names in it.
      var names = new Ember.Set(["Charles", "Tom", "Juan", "Alex"]); // :P

      // creates a copy of the names set.
      var namesCopy = new Ember.Set(names);

      // same as above.
      var anotherNamesCopy = names.copy();
      ```

      ## Adding/Removing Objects

      You generally add or remove objects from a set using `add()` or
      `remove()`. You can add any type of object including primitives such as
      numbers, strings, and booleans.

      Unlike arrays, objects can only exist one time in a set. If you call `add()`
      on a set with the same object multiple times, the object will only be added
      once. Likewise, calling `remove()` with the same object multiple times will
      remove the object the first time and have no effect on future calls until
      you add the object to the set again.

      NOTE: You cannot add/remove `null` or `undefined` to a set. Any attempt to do
      so will be ignored.

      In addition to add/remove you can also call `push()`/`pop()`. Push behaves
      just like `add()` but `pop()`, unlike `remove()` will pick an arbitrary
      object, remove it and return it. This is a good way to use a set as a job
      queue when you don't care which order the jobs are executed in.

      ## Testing for an Object

      To test for an object's presence in a set you simply call
      `Ember.Set#contains()`.

      ## Observing changes

      When using `Ember.Set`, you can observe the `"[]"` property to be
      alerted whenever the content changes. You can also add an enumerable
      observer to the set to be notified of specific objects that are added and
      removed from the set. See `Ember.Enumerable` for more information on
      enumerables.

      This is often unhelpful. If you are filtering sets of objects, for instance,
      it is very inefficient to re-filter all of the items each time the set
      changes. It would be better if you could just adjust the filtered set based
      on what was changed on the original set. The same issue applies to merging
      sets, as well.

      ## Other Methods

      `Ember.Set` primary implements other mixin APIs. For a complete reference
      on the methods you will use with `Ember.Set`, please consult these mixins.
      The most useful ones will be `Ember.Enumerable` and
      `Ember.MutableEnumerable` which implement most of the common iterator
      methods you are used to on Array.

      Note that you can also use the `Ember.Copyable` and `Ember.Freezable`
      APIs on `Ember.Set` as well. Once a set is frozen it can no longer be
      modified. The benefit of this is that when you call `frozenCopy()` on it,
      Ember will avoid making copies of the set. This allows you to write
      code that can know with certainty when the underlying set data will or
      will not be modified.

      @class Set
      @namespace Ember
      @extends Ember.CoreObject
      @uses Ember.MutableEnumerable
      @uses Ember.Copyable
      @uses Ember.Freezable
      @since Ember 0.9
    */
    var ModelSet = Ember.CoreObject.extend(Ember.MutableEnumerable, Ember.Copyable, Ember.Freezable,
      /** @scope Ember.Set.prototype */ {

      // ..........................................................
      // IMPLEMENT ENUMERABLE APIS
      //

      /**
        This property will change as the number of objects in the set changes.

        @property length
        @type number
        @default 0
      */
      length: 0,

      /**
        Clears the set. This is useful if you want to reuse an existing set
        without having to recreate it.

        ```javascript
        var colors = new Ember.Set(["red", "green", "blue"]);
        colors.length;  // 3
        colors.clear();
        colors.length;  // 0
        ```

        @method clear
        @return {Ember.Set} An empty Set
      */
      clear: function() {
        if (this.isFrozen) { throw new Error(Ember.FROZEN_ERROR); }

        var len = get(this, 'length');
        if (len === 0) { return this; }

        var guid;

        this.enumerableContentWillChange(len, 0);
        Ember.propertyWillChange(this, 'firstObject');
        Ember.propertyWillChange(this, 'lastObject');

        for (var i=0; i < len; i++){
          guid = guidFor(this[i]);
          delete this[guid];
          delete this[i];
        }

        set(this, 'length', 0);

        Ember.propertyDidChange(this, 'firstObject');
        Ember.propertyDidChange(this, 'lastObject');
        this.enumerableContentDidChange(len, 0);

        return this;
      },

      /**
        Returns true if the passed object is also an enumerable that contains the
        same objects as the receiver.

        ```javascript
        var colors = ["red", "green", "blue"],
            same_colors = new Ember.Set(colors);

        same_colors.isEqual(colors);               // true
        same_colors.isEqual(["purple", "brown"]);  // false
        ```

        @method isEqual
        @param {Ember.Set} obj the other object.
        @return {Boolean}
      */
      isEqual: function(obj) {
        // fail fast
        if (!Ember.Enumerable.detect(obj)) return false;

        var loc = get(this, 'length');
        if (get(obj, 'length') !== loc) return false;

        while(--loc >= 0) {
          if (!obj.contains(this[loc])) return false;
        }

        return true;
      },

      /**
        Adds an object to the set. Only non-`null` objects can be added to a set
        and those can only be added once. If the object is already in the set or
        the passed value is null this method will have no effect.

        This is an alias for `Ember.MutableEnumerable.addObject()`.

        ```javascript
        var colors = new Ember.Set();
        colors.add("blue");     // ["blue"]
        colors.add("blue");     // ["blue"]
        colors.add("red");      // ["blue", "red"]
        colors.add(null);       // ["blue", "red"]
        colors.add(undefined);  // ["blue", "red"]
        ```

        @method add
        @param {Object} obj The object to add.
        @return {Ember.Set} The set itself.
      */
      add: Ember.aliasMethod('addObject'),

      /**
        Removes the object from the set if it is found. If you pass a `null` value
        or an object that is already not in the set, this method will have no
        effect. This is an alias for `Ember.MutableEnumerable.removeObject()`.

        ```javascript
        var colors = new Ember.Set(["red", "green", "blue"]);
        colors.remove("red");     // ["blue", "green"]
        colors.remove("purple");  // ["blue", "green"]
        colors.remove(null);      // ["blue", "green"]
        ```

        @method remove
        @param {Object} obj The object to remove
        @return {Ember.Set} The set itself.
      */
      remove: Ember.aliasMethod('removeObject'),

      /**
        Removes the last element from the set and returns it, or `null` if it's empty.

        ```javascript
        var colors = new Ember.Set(["green", "blue"]);
        colors.pop();  // "blue"
        colors.pop();  // "green"
        colors.pop();  // null
        ```

        @method pop
        @return {Object} The removed object from the set or null.
      */
      pop: function() {
        if (get(this, 'isFrozen')) throw new Error(Ember.FROZEN_ERROR);
        var obj = this.length > 0 ? this[this.length-1] : null;
        this.remove(obj);
        return obj;
      },

      /**
        Inserts the given object on to the end of the set. It returns
        the set itself.

        This is an alias for `Ember.MutableEnumerable.addObject()`.

        ```javascript
        var colors = new Ember.Set();
        colors.push("red");   // ["red"]
        colors.push("green"); // ["red", "green"]
        colors.push("blue");  // ["red", "green", "blue"]
        ```

        @method push
        @return {Ember.Set} The set itself.
      */
      push: Ember.aliasMethod('addObject'),

      /**
        Removes the last element from the set and returns it, or `null` if it's empty.

        This is an alias for `Ember.Set.pop()`.

        ```javascript
        var colors = new Ember.Set(["green", "blue"]);
        colors.shift();  // "blue"
        colors.shift();  // "green"
        colors.shift();  // null
        ```

        @method shift
        @return {Object} The removed object from the set or null.
      */
      shift: Ember.aliasMethod('pop'),

      /**
        Inserts the given object on to the end of the set. It returns
        the set itself.

        This is an alias of `Ember.Set.push()`

        ```javascript
        var colors = new Ember.Set();
        colors.unshift("red");    // ["red"]
        colors.unshift("green");  // ["red", "green"]
        colors.unshift("blue");   // ["red", "green", "blue"]
        ```

        @method unshift
        @return {Ember.Set} The set itself.
      */
      unshift: Ember.aliasMethod('push'),

      /**
        Adds each object in the passed enumerable to the set.

        This is an alias of `Ember.MutableEnumerable.addObjects()`

        ```javascript
        var colors = new Ember.Set();
        colors.addEach(["red", "green", "blue"]);  // ["red", "green", "blue"]
        ```

        @method addEach
        @param {Ember.Enumerable} objects the objects to add.
        @return {Ember.Set} The set itself.
      */
      addEach: Ember.aliasMethod('addObjects'),

      /**
        Removes each object in the passed enumerable to the set.

        This is an alias of `Ember.MutableEnumerable.removeObjects()`

        ```javascript
        var colors = new Ember.Set(["red", "green", "blue"]);
        colors.removeEach(["red", "blue"]);  //  ["green"]
        ```

        @method removeEach
        @param {Ember.Enumerable} objects the objects to remove.
        @return {Ember.Set} The set itself.
      */
      removeEach: Ember.aliasMethod('removeObjects'),

      // ..........................................................
      // PRIVATE ENUMERABLE SUPPORT
      //

      init: function(items) {
        this._super();
        if (items) this.addObjects(items);
      },

      // implement Ember.Enumerable
      nextObject: function(idx) {
        return this[idx];
      },

      // more optimized version
      firstObject: Ember.computed(function() {
        return this.length > 0 ? this[0] : undefined;
      }),

      // more optimized version
      lastObject: Ember.computed(function() {
        return this.length > 0 ? this[this.length-1] : undefined;
      }),

      // implements Ember.MutableEnumerable
      addObject: function(obj) {
        if (get(this, 'isFrozen')) throw new Error(Ember.FROZEN_ERROR);
        if (isNone(obj)) return this; // nothing to do

        var guid = guidFor(obj),
            idx  = this[guid],
            len  = get(this, 'length'),
            added ;

        if (idx>=0 && idx<len && (this[idx] && this[idx].isEqual(obj))) {
          // overwrite the existing version
          if(this[idx] !== obj) {
            this[idx] = obj;
          }
          return this; // added
        }

        added = [obj];

        this.enumerableContentWillChange(null, added);
        Ember.propertyWillChange(this, 'lastObject');

        len = get(this, 'length');
        this[guid] = len;
        this[len] = obj;
        set(this, 'length', len+1);

        Ember.propertyDidChange(this, 'lastObject');
        this.enumerableContentDidChange(null, added);

        return this;
      },

      // implements Ember.MutableEnumerable
      removeObject: function(obj) {
        if (get(this, 'isFrozen')) throw new Error(Ember.FROZEN_ERROR);
        if (isNone(obj)) return this; // nothing to do

        var guid = guidFor(obj),
            idx  = this[guid],
            len = get(this, 'length'),
            isFirst = idx === 0,
            isLast = idx === len-1,
            last, removed;


        if (idx>=0 && idx<len && (this[idx] && this[idx].isEqual(obj))) {
          removed = [obj];

          this.enumerableContentWillChange(removed, null);
          if (isFirst) { Ember.propertyWillChange(this, 'firstObject'); }
          if (isLast)  { Ember.propertyWillChange(this, 'lastObject'); }

          // swap items - basically move the item to the end so it can be removed
          if (idx < len-1) {
            last = this[len-1];
            this[idx] = last;
            this[guidFor(last)] = idx;
          }

          delete this[guid];
          delete this[len-1];
          set(this, 'length', len-1);

          if (isFirst) { Ember.propertyDidChange(this, 'firstObject'); }
          if (isLast)  { Ember.propertyDidChange(this, 'lastObject'); }
          this.enumerableContentDidChange(removed, null);
        }

        return this;
      },

      // optimized version
      contains: function(obj) {
        return this[guidFor(obj)]>=0;
      },

      copy: function(deep) {
        var C = this.constructor, ret = new C(), loc = get(this, 'length');
        set(ret, 'length', loc);
        while(--loc>=0) {
          ret[loc] = deep ? this[loc].copy() : this[loc];
          ret[guidFor(this[loc])] = loc;
        }
        return ret;
      },

      toString: function() {
        var len = this.length, idx, array = [];
        for(idx = 0; idx < len; idx++) {
          array[idx] = this[idx];
        }
        return fmt("Ep.ModelSet<%@>", [array.join(',')]);
      },

      getModel: function(model) {
        var idx = this[guidFor(model)];
        if(idx === undefined) return;
        return this[idx];
      },

      getForClientId: function(clientId) {
        var idx = this[clientId];
        if(idx === undefined) return;
        return this[idx];
      },

      /**
        Adds the model to the set or overwrites the existing
        model.
      */
      addData: function(model) {
        var existing = this.getModel(model);
        var dest;
        if(existing) {
          dest = existing.copy();
          model.copyTo(dest);
        } else {
          // copy since the dest could be the model in the session
          dest = model.copy();
        }
        this.add(dest);
        return dest;
      }

    });


    ModelSet.reopenClass({

      fromArray: function(models) {
        var res = this.create();
        res.addObjects(models);
        return res;
      }

    });

    __exports__["default"] = ModelSet;
  });
define("epf/debug/debug_adapter",
  ["../model/model","./debug_info","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    /**
      @module ember-data
    */
    var get = Ember.get, capitalize = Ember.String.capitalize, underscore = Ember.String.underscore;

    var Model = __dependency1__["default"];

    /**
      Extend `Ember.DataAdapter` with Epf specific code.

      @class DebugAdapter
      @namespace Ep
      @extends Ember.DataAdapter
      @private
    */

    var PromiseArray = Ember.ArrayProxy.extend(Ember.PromiseProxyMixin);

    __exports__["default"] = Ember.DataAdapter.extend({
      getFilters: function() {
        return [
          { name: 'isNew', desc: 'New' },
          { name: 'isModified', desc: 'Modified' },
          { name: 'isClean', desc: 'Clean' }
        ];
      },

      detect: function(klass) {
        return klass !== Model && Model.detect(klass);
      },

      columnsForType: function(type) {
        var columns = [
          { name: 'id', desc: 'Id' },
          { name: 'clientId', desc: 'Client Id'},
          { name: 'rev', desc: 'Revision'},
          { name: 'clientRev', desc: 'Client Revision'}
        ], count = 0, self = this;
        Ember.A(get(type, 'attributes')).forEach(function(name, meta) {
            if (count++ > self.attributeLimit) { return false; }
            var desc = capitalize(underscore(name).replace('_', ' '));
            columns.push({ name: name, desc: desc });
        });
        return columns;
      },

      getRecords: function(type) {
        return PromiseArray.create({promise: this.get('session').query(type)});
      },

      getRecordColumnValues: function(record) {
        var self = this, count = 0,
            columnValues = { id: get(record, 'id') };

        record.eachAttribute(function(key) {
          if (count++ > self.attributeLimit) {
            return false;
          }
          var value = get(record, key);
          columnValues[key] = value;
        });
        return columnValues;
      },

      getRecordKeywords: function(record) {
        var keywords = [], keys = Ember.A(['id']);
        record.eachAttribute(function(key) {
          keys.push(key);
        });
        keys.forEach(function(key) {
          keywords.push(get(record, key));
        });
        return keywords;
      },

      getRecordFilterValues: function(record) {
        return {
          isNew: record.get('isNew'),
          isModified: record.get('isDirty') && !record.get('isNew'),
          isClean: !record.get('isDirty')
        };
      },

      getRecordColor: function(record) {
        var color = 'black';
        if (record.get('isNew')) {
          color = 'green';
        } else if (record.get('isDirty')) {
          color = 'blue';
        }
        return color;
      },

      observeRecord: function(record, recordUpdated) {
        var releaseMethods = Ember.A(), self = this,
            keysToObserve = Ember.A(['id', 'clientId', 'rev', 'clientRev', 'isNew', 'isDirty', 'isDeleted']);

        record.eachAttribute(function(key) {
          keysToObserve.push(key);
        });

        keysToObserve.forEach(function(key) {
          var handler = function() {
            recordUpdated(self.wrapRecord(record));
          };
          Ember.addObserver(record, key, handler);
          releaseMethods.push(function() {
            Ember.removeObserver(record, key, handler);
          });
        });

        var release = function() {
          releaseMethods.forEach(function(fn) { fn(); } );
        };

        return release;
      }

    });
  });
define("epf/debug/debug_info",
  ["../model/model"],
  function(__dependency1__) {
    "use strict";
    var Model = __dependency1__["default"];

    Model.reopen({

      /**
        Provides info about the model for debugging purposes
        by grouping the properties into more semantic groups.

        Meant to be used by debugging tools such as the Chrome Ember Extension.

        - Groups all attributes in "Attributes" group.
        - Groups all belongsTo relationships in "Belongs To" group.
        - Groups all hasMany relationships in "Has Many" group.
        - Groups all flags in "Flags" group.
        - Flags relationship CPs as expensive properties.

        @method _debugInfo
        @for Ep.Model
        @private
      */
      _debugInfo: function() {
        var attributes = ['id'],
            relationships = { belongsTo: [], hasMany: [] },
            expensiveProperties = [];

        this.eachAttribute(function(name, meta) {
          attributes.push(name);
        }, this);

        this.eachRelationship(function(name, relationship) {
          relationships[relationship.kind].push(name);
          expensiveProperties.push(name);
        });

        var groups = [
          {
            name: 'Attributes',
            properties: attributes,
            expand: true,
          },
          {
            name: 'Belongs To',
            properties: relationships.belongsTo,
            expand: true
          },
          {
            name: 'Has Many',
            properties: relationships.hasMany,
            expand: true
          },
          {
            name: 'Flags',
            properties: ['isDirty', 'isDeleted', 'hasErrors']
          }
        ];

        return {
          propertyInfo: {
            // include all other mixins / properties (not just the grouped ones)
            includeOtherProperties: true,
            groups: groups,
            // don't pre-calculate unless cached
            expensiveProperties: expensiveProperties
          }
        };
      }

    });
  });
define("epf/ext/date",
  [],
  function() {
    "use strict";
    /**
     * Date.parse with progressive enhancement for ISO 8601 <https://github.com/csnover/js-iso8601>
     * © 2011 Colin Snover <http://zetafleet.com>
     * Released under MIT license.
     */

    Ember.Date = Ember.Date || {};

    var origParse = Date.parse, numericKeys = [ 1, 4, 5, 6, 7, 10, 11 ];
    Ember.Date.parse = function (date) {
        var timestamp, struct, minutesOffset = 0;

        // ES5 §15.9.4.2 states that the string should attempt to be parsed as a Date Time String Format string
        // before falling back to any implementation-specific date parsing, so that’s what we do, even if native
        // implementations could be faster
        //              1 YYYY                2 MM       3 DD           4 HH    5 mm       6 ss        7 msec        8 Z 9 ±    10 tzHH    11 tzmm
        if ((struct = /^(\d{4}|[+\-]\d{6})(?:-(\d{2})(?:-(\d{2}))?)?(?:T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{3}))?)?(?:(Z)|([+\-])(\d{2})(?::(\d{2}))?)?)?$/.exec(date))) {
            // avoid NaN timestamps caused by “undefined” values being passed to Date.UTC
            for (var i = 0, k; (k = numericKeys[i]); ++i) {
                struct[k] = +struct[k] || 0;
            }

            // allow undefined days and months
            struct[2] = (+struct[2] || 1) - 1;
            struct[3] = +struct[3] || 1;

            if (struct[8] !== 'Z' && struct[9] !== undefined) {
                minutesOffset = struct[10] * 60 + struct[11];

                if (struct[9] === '+') {
                    minutesOffset = 0 - minutesOffset;
                }
            }

            timestamp = Date.UTC(struct[1], struct[2], struct[3], struct[4], struct[5] + minutesOffset, struct[6], struct[7]);
        }
        else {
            timestamp = origParse ? origParse(date) : NaN;
        }

        return timestamp;
    };

    if (Ember.EXTEND_PROTOTYPES === true || Ember.EXTEND_PROTOTYPES.Date) {
      Date.parse = Ember.Date.parse;
    }
  });
define("epf/id_manager",
  ["exports"],
  function(__exports__) {
    "use strict";
    var get = Ember.get, set = Ember.set, merge = Ember.merge;

    var uuid = 1;

    __exports__["default"] = Ember.Object.extend({
      init: function() {
        this._super.apply(this, arguments);
        this.idMaps = Ember.MapWithDefault.create({
          defaultValue: function(typeKey) {
            return Ember.Map.create();
          }
        });
      },

      /**
        Three possible cases:

        1. The model already has a clientId and an id.
           Make sure the clientId maps to the id.

        2. The model has no id or clientId. The model must be a new
           record. Generate a clientId and set on the model.

        3. The model has and id but no clientId. Generate a new clientId,
           update the mapping, and assign it to the model.
      */
      reifyClientId: function(model) {
        var id = get(model, 'id'),
            clientId = get(model, 'clientId'),
            typeKey = get(model, 'typeKey'),
            idMap = this.idMaps.get(typeKey);

        if(id) {
          id = id + '';
        }

        if(id && clientId) {
          var existingClientId = idMap.get(id);
                    if(!existingClientId) {
            idMap.set(id, clientId);
          }
        } else if(!clientId) {
          if(id) {
            clientId = idMap.get(id);
          }
          if(!clientId) {
            clientId = this._generateClientId(typeKey);
          }
          set(model, 'clientId', clientId);
          idMap.set(id, clientId);
        } // else NO-OP, nothing to do if they already have a clientId and no id
        return clientId;
      },

      getClientId: function(typeKey, id) {
        var idMap = this.idMaps.get(typeKey);
        return idMap.get(id + '');
      },

      _generateClientId: function(typeKey) {
        return typeKey + (uuid++);
      }

    });
  });
define("epf/initializers",
  ["./setup_container"],
  function(__dependency1__) {
    "use strict";
    var set = Ember.set;

    var setupContainer = __dependency1__["default"];

    /**
      Create the default injections.
    */
    Ember.onLoad('Ember.Application', function(Application) {
      Application.initializer({
        name: "epf.container",

        initialize: function(container, application) {
          // Set the container to allow for static `find` methods on model classes
          Ep.__container__ = container;
          setupContainer(container, application);
        }
      });

    });
  });
define("epf/local/index",
  [],
  function() {
    "use strict";
    require('./local_adapter');
  });
define("epf/local/local_adapter",
  ["../adapter","../serializers/base","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var Adapter = __dependency1__["default"];
    var Serializer = __dependency2__["default"];

    var get = Ember.get, set = Ember.set;

    __exports__["default"] = Adapter.extend({

      // Dummy serializer for now since mapping logic assumes existence
      serializer: Serializer.create(),

      load: function(type, id) {
        return Ember.RSVP.resolve(null);
      },

      // TODO: find

      refresh: function(model) {
        return Ember.RSVP.resolve(model.copy()); 
      },

      flush: function(session) {
        // TODO: do actual diffs here
        var models = get(session, 'dirtyModels');
        return Ember.RSVP.resolve(models.copy(true)).then(function(models) {
          models.forEach(function(model) {
            session.merge(model);
          });
        });
      }


      // TODO: remoteApply

    });
  });
define("epf/merge_strategies/base",
  ["exports"],
  function(__exports__) {
    "use strict";
    __exports__["default"] = Ember.Object.extend({

      merge: Ember.required()

    });
  });
define("epf/merge_strategies/per_field",
  ["./base","../collections/model_set","../utils/isEqual","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __exports__) {
    "use strict";
    var get = Ember.get, set = Ember.set, copy = Ember.copy;

    var MergeStrategy = __dependency1__["default"];
    var ModelSet = __dependency2__["default"];
    var isEqual = __dependency3__["default"];

    /**
      Merge strategy that merges on a per-field basis.

      Fields which have been editted by both parties will
      default to "ours".
    */
    __exports__["default"] = MergeStrategy.extend({

      merge: function(ours, ancestor, theirs) {
        ours.beginPropertyChanges();
        this.mergeAttributes(ours, ancestor, theirs);
        this.mergeRelationships(ours, ancestor, theirs);
        ours.endPropertyChanges();
        return ours;
      },

      mergeAttributes: function(ours, ancestor, theirs) {
        ours.eachAttribute(function(name, meta) {
          this.mergeProperty(ours, ancestor, theirs, name);
        }, this);
      },

      mergeRelationships: function(ours, ancestor, theirs) {
        var session = get(this, 'session');
        ours.eachRelationship(function(name, relationship) {
          if(relationship.kind === 'belongsTo') {
            this.mergeBelongsTo(ours, ancestor, theirs, name);
          } else if(relationship.kind === 'hasMany') {
            this.mergeHasMany(ours, ancestor, theirs, name);
          }
        }, this);
      },

      mergeBelongsTo: function(ours, ancestor, theirs, name) {
        this.mergeProperty(ours, ancestor, theirs, name);
      },

      mergeHasMany: function(ours, ancestor, theirs, name) {
        this.mergeProperty(ours, ancestor, theirs, name);
      },

      mergeProperty: function(ours, ancestor, theirs, name) {
        var oursValue = get(ours, name),
            ancestorValue = get(ancestor, name),
            theirsValue = get(theirs, name);

        if(!ours.isPropertyLoaded(name)) {
          if(theirs.isPropertyLoaded(name)) {
            set(ours, name, copy(theirsValue));
          }
          return;
        }
        if(!theirs.isPropertyLoaded(name) || isEqual(oursValue, theirsValue)) {
          return;
        }
        // if the ancestor does not have the property loaded we are
        // performing a two-way merge and we just pick theirs
        if(!ancestor.isPropertyLoaded(name) || isEqual(oursValue, ancestorValue)) {
          set(ours, name, copy(theirsValue));
        } else {
          // NO-OP
        }
      }

    });
  });
define("epf/model/attribute",
  ["./model","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var get = Ember.get, set = Ember.set;

    var Model = __dependency1__["default"];

    Model.reopenClass({
      attributes: Ember.computed(function() {
        var map = Ember.Map.create();

        this.eachComputedProperty(function(name, meta) {
          if (meta.isAttribute) {
            
            meta.name = name;
            map.set(name, meta);
          }
        });

        return map;
      })
    });

    Model.reopen({
      eachAttribute: function(callback, binding) {
        get(this.constructor, 'attributes').forEach(function(name, meta) {
          callback.call(binding, name, meta);
        }, binding);
      },

      eachLoadedAttribute: function(callback, binding) {
        this.eachAttribute(function(name, meta) {
          if(this.isPropertyLoaded(name)) {
            callback.apply(binding, arguments);
          }
        }, this);
      }
    });

    __exports__["default"] = function(type, options) {
      options = options || {};

      var meta = {
        type: type,
        isAttribute: true,
        options: options
      };

      return Ember.computed(function(key, value) {
        var session = get(this, 'session');

        if (arguments.length > 1) {
                  } else {
          return;
        }

        if(session) {
          session.modelWillBecomeDirty(this);
        }

        return value;
      }).meta(meta);
    };
  });
define("epf/model/diff",
  ["./model","../collections/model_set"],
  function(__dependency1__, __dependency2__) {
    "use strict";
    var get = Ember.get, set = Ember.set;

    var Model = __dependency1__["default"];
    var ModelSet = __dependency2__["default"];

    Model.reopen({

      // TODO: revamp this to use jsondiffpatch on all attributes and relationships
      diff: function(model) {
        var diffs = [];

        this.eachLoadedAttribute(function(name, meta) {
          var left = get(this, name);
          var right = get(model, name);

          if(left && typeof left.diff === 'function' && right && typeof right.diff === 'function') {
            if(left.diff(right).length > 0) {
              diffs.push({type: 'attr', name: name});
            }
            return;
          }

          // Use jsondiffpatch for raw objects
          if(left && right
            && typeof left === 'object'
            && typeof right === 'object') {
            var delta = jsondiffpatch.diff(left, right);
            if(delta) {
              diffs.push({type: 'attr', name: name});
            }
            return;
          }

          if(left instanceof Date && right instanceof Date) {
            left = left.getTime();
            right = right.getTime();
          }
          if(left !== right) {
            // eventually we will have an actual diff
            diffs.push({type: 'attr', name: name});
          }
        }, this);

        this.eachLoadedRelationship(function(name, relationship) {
          var left = get(this, name);
          var right = get(model, name);
          if(relationship.kind === 'belongsTo') {
            if(left && right) {
              if(!left.isEqual(right)) {
                diffs.push({type: 'belongsTo', name: name, relationship: relationship, oldValue: right});
              }
            } else if(left || right) {
              diffs.push({type: 'belongsTo', name: name, relationship: relationship, oldValue: right});
            }
          } else if(relationship.kind === 'hasMany') {
            var dirty = false;
            var cache = ModelSet.create();
            left.forEach(function(model) {
              cache.add(model);
            });
            right.forEach(function(model) {
              if(dirty) return;
              if(!cache.contains(model)) {
                dirty = true;
              } else {
                cache.remove(model);
              }
            });
            if(dirty || get(cache, 'length') > 0) {
              diffs.push({type: 'hasMany', name: name, relationship: relationship});
            }
          }
        }, this);

        return diffs;
      }

    });
  });
define("epf/model/errors",
  ["exports"],
  function(__exports__) {
    "use strict";
    var get = Ember.get, set = Ember.set, copy = Ember.copy;

    var Errors = Ember.ObjectProxy.extend(Ember.Copyable, {

      init: function() {
        this._super.apply(this, arguments);
        if(!get(this, 'content')) set(this, 'content', {});
      },

      /**
        Iterate over all the fields and their corresponding errors.
        Calls the function once for each key, passing in the key and error message.

        @method forEach
        @param {Function} callback
        @param {*} self if passed, the `this` value inside the
          callback. By default, `this` is the map.
      */
      forEach: function(callback, self) {
        var keys = Ember.keys(this.content);

        keys.forEach(function(key) {
          var value = get(this.content, key);
          callback.call(self, key, value);
        }, this);
      },

      copy: function() {
        return Errors.create({
          content: copy(this.content)
        });
      }

    });

    __exports__["default"] = Errors;
  });
define("epf/model/model",
  ["../collections/model_set","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var get = Ember.get, set = Ember.set, Copyable = Ember.Copyable, computed = Ember.computed,
        cacheFor = Ember.cacheFor,
        cacheGet = cacheFor.get,
        metaFor = Ember.meta;

    var ModelSet = __dependency1__["default"];

    var Model = Ember.Object.extend(Copyable, {

      id: null,
      clientId: null,
      rev: null,
      clientRev: 0,
      session: null,
      errors: null,
      isModel: true,
      isDeleted: false,

      _loadPromise: null,

      /**
        Two models are "equal" when they correspond to the same
        key. This does not mean they necessarily have the same data.
      */
      isEqual: function(model) {
        if(!model) return false;
        var clientId = get(this, 'clientId');
        var otherClientId = get(model, 'clientId');
        if(clientId && otherClientId) {
          return clientId === otherClientId;
        }
        // in most cases clientIds will always be set, however
        // during serialization this might not be the case
        var id = get(this, 'id');
        var otherId = get(model, 'id');
        return this.isSameType(model) && id === otherId
      },

      isSameType: function(model) {
        return this.hasType(get(model, 'type'));
      },

      /**
        Model promises are just proxies and do not have the
        literal type of their contents.
      */
      hasType: function(type) {
        return get(this, 'type').detect(type);
      },

      type: computed(function(key, value) {
        return value || this.constructor;
      }),

      typeKey: computed(function() {
        return get(this, 'type.typeKey');
      }),

      toStringExtension: function() {
        return "[" + get(this, 'id') + ", " + get(this, 'clientId') + "]";
      },

      lazyCopy: function() {
        var type = get(this, 'type');
        return type.create({
          id: get(this, 'id'),
          clientId: get(this, 'clientId'),
          isDeleted: get(this, 'isDeleted'),
          errors: get(this, 'errors')
        });
      },

      // these properties are volatile so they don't trigger lazy loads
      // on promises by calling `willWatchProperty` on their dependencies
      hasErrors: computed(function() {
        return !!get(this, 'errors');
      }).volatile(),

      isDetached: computed(function() {
        return !get(this, 'session');
      }).volatile(),

      isManaged: computed(function() {
        return !!get(this, 'session');
      }).volatile(),

      isNew: computed(function() {
        return !get(this, 'id');
      }).property('id'),

      /**
        Whether the model is dirty or not.

        Logically, this corresponds to whether any properties of the
        model have been set since the last flush.
        @property isDirty
      */
      isDirty: computed(function() {
        var session = get(this, 'session');
        if(!session) return false;
        return get(session, 'dirtyModels').contains(this);
      }).property('session.dirtyModels.[]'),

      // creates a shallow copy with lazy children
      // TODO: we should not lazily copy detached children
      copy: function() {
        var dest = this.constructor.create();
        this.copyTo(dest);
        return dest;
      },

      copyTo: function(dest) {
        dest.beginPropertyChanges();
        this.copyAttributes(dest);
        this.copyMeta(dest);
        this.eachLoadedRelationship(function(name, relationship) {
          if(relationship.kind === 'belongsTo') {
            var child = get(this, name);
            set(dest, name, child && child.lazyCopy());
          } else if(relationship.kind === 'hasMany') {
            var children = get(this, name);
            var destChildren = [];
            children.forEach(function(child) {
              destChildren.pushObject(child.lazyCopy());
            });
            set(dest, name, destChildren);
          }
        }, this);
        dest.endPropertyChanges();
        return dest;
      },

      copyAttributes: function(dest) {
        dest.beginPropertyChanges();
        
        this.eachLoadedAttribute(function(name, meta) {
          var left = get(this, name);
          var right = get(dest, name);
          var copy;
          // Ember.copy does not support Date
          if(left instanceof Date) {
            copy = new Date(left.getTime());
          } else {
            copy = Ember.copy(left, true);
          }
          set(dest, name, copy);
        }, this);
        dest.endPropertyChanges();
      },

      copyMeta: function(dest) {
        set(dest, 'id', get(this, 'id'));
        set(dest, 'clientId', get(this, 'clientId'));
        set(dest, 'rev', get(this, 'rev'));
        set(dest, 'clientRev', get(this, 'clientRev'));
        set(dest, 'errors', Ember.copy(get(this, 'errors')));
        set(dest, 'isDeleted', get(this, 'isDeleted'));
      },

      willWatchProperty: function(key) {
        if(get(this, 'isManaged') && this.shouldTriggerLoad(key)) {
          Ember.run.scheduleOnce('actions', this, this.load);
        }
      },

      shouldTriggerLoad: function(key) {
        return this.isAttributeOrRelationship(key) && !this.isPropertyLoaded(key);
      },

      isAttributeOrRelationship: function(key) {
        var proto = this.constructor.proto(),
            descs = Ember.meta(proto).descs,
            desc = descs[key],
            meta = desc && desc._meta;

        return meta && (meta.isAttribute || meta.isRelationship);
      },

      isPropertyLoaded: function(key) {
        if(get(this, 'isNew')) {
          return true;
        }

        var proto = this.constructor.proto(),
            descs = Ember.meta(proto).descs,
            desc = descs[key],
            meta = desc && desc._meta;

        if(meta.isRelationship && meta.kind === 'belongsTo') {
          return typeof this['__' + key] !== 'undefined';
        }

        var meta = metaFor(this),
            cache = meta.cache,
            cached = cacheGet(cache, key);

        return typeof cached !== 'undefined';
      },

      anyPropertiesLoaded: function() { 
        var result = false;
        get(this, 'type.fields').forEach(function(name, meta) {
          result = result || this.isPropertyLoaded(name);
        }, this);
        return result;
      },

      load: sessionAlias('loadModel'),
      refresh: sessionAlias('refresh'),
      deleteModel: sessionAlias('deleteModel'),
      remoteCall: sessionAlias('remoteCall'),
      markClean: sessionAlias('markClean'),
      invalidate: sessionAlias('invalidate'),
      touch: sessionAlias('touch')

    });

    Model.reopenClass({

      /**
        This is the only static method implemented in order to play nicely
        with Ember's default model conventions in the router. It is preferred
        to explicitly call `load` on a session.

        In order to use this method, you must set the Ep.__container__ property. E.g.

        ```
          Ep.__container__ = App.__container__;
        ```
      */
      find: function(id) {
        if(!Ep.__container__) {
          throw new Ember.Error("The Ep.__container__ property must be set in order to use static find methods.");
        }
        var container = Ep.__container__;
        var session = container.lookup('session:main');
        return session.find(this, id);
      },

      typeKey: computed(function() {
        return Ember.String.underscore(this.toString().split(/[:.]/)[1]);
      })

    });

    function sessionAlias(name) {
      return function () {
        var session = get(this, 'session');
                var args = [].splice.call(arguments,0);
        args.unshift(this);
        return session[name].apply(session, args);
      };
    }

    __exports__["default"] = Model;
  });
define("epf/model/promise",
  ["exports"],
  function(__exports__) {
    "use strict";
    /**
      A `ModelPromise` is an object that acts like both an `Ember.Object`
      and a promise. When the promise is resolved the the resulting value
      will be set to the `ModelPromise`'s `content` property. This makes
      it easy to create data bindings with the `ModelPromise` that will
      be updated when the promise resolves.

      For more information see the [Ember.PromiseProxyMixin
      documentation](/api/classes/Ember.PromiseProxyMixin.html).

      Example

      ```javascript
      var promiseObject = DS.ModelPromise.create({
        promise: $.getJSON('/some/remote/data.json')
      });

      promiseObject.get('name'); // null

      promiseObject.then(function() {
        promiseObject.get('name'); // 'Tomster'
      });
      ```

      @class ModelPromise
      @namespace DS
      @extends Ember.ObjectProxy
      @uses Ember.PromiseProxyMixin
    */
    var ModelPromise = Ember.ObjectProxy.extend(Ember.PromiseProxyMixin, {

      load: passThroughMethod('load')

    });

    function passThroughMethod(name, defaultReturn) {
      return function() {
        var content = get(this, 'content');
        if(!content) return defaultReturn;
        return content[name].apply(content, arguments);
      }
    }

    __exports__["default"] = ModelPromise;
  });
define("epf/namespace",
  ["exports"],
  function(__exports__) {
    "use strict";
    /**
      @module epf
    */

    /**
      All Ember Data methods and functions are defined inside of this namespace.

      @class Ep
      @static
    */

    var Ep;
    if ('undefined' === typeof Ep) {
      /**
        @property VERSION
        @type String
        @default '<%= versionStamp %>'
        @static
      */
      Ep = Ember.Namespace.create({
        VERSION: '0.3.5'
      });

      if (Ember.libraries) {
        Ember.libraries.registerCoreLibrary('EPF', Ep.VERSION);
      }
    }

    __exports__["default"] = Ep;
  });
define("epf/relationships/belongs_to",
  ["../model/model","../utils/isEqual","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var get = Ember.get, set = Ember.set,
        cacheFor = Ember.cacheFor,
        cacheGet = cacheFor.get,
        cacheSet = cacheFor.set,
        metaFor = Ember.meta;

    var Model = __dependency1__["default"];
    var isEqual = __dependency2__["default"];

    __exports__["default"] = function(typeKey, options) {
            options = options || {};

      var meta = { isRelationship: true, options: options, kind: 'belongsTo' };

      if(typeof typeKey === 'string') {
        meta.typeKey = typeKey;
      } else {
                meta.type = typeKey;
      }

      return Ember.computed(function(key, value) {
        var session = get(this, 'session');
        var prop = "__" + key;
        var oldValue = this[prop];
        if(arguments.length === 1) {
          value = oldValue;
        }
        var changed = !isEqual(value, oldValue);
        if(changed) {
          this.belongsToWillChange(this, key);
          if(session) {
            session.modelWillBecomeDirty(this);
          }
        }
        if(session && value) {
          value = session.add(value);
        }
        if(arguments.length > 1) {
          this[prop] = value;
          if(changed) {
            this.belongsToDidChange(this, key);
          }
        }
        return value;
      }).volatile().meta(meta);
    };

    /**
      These observers observe all `belongsTo` relationships on the model. See
      `relationships/ext` to see how these observers get their dependencies.
    */
    Model.reopen({

      init: function() {
        this._super();
        // manually trigger change events to updated inverses
        this.eachLoadedRelationship(function(name, relationship) {
          if(relationship.kind === 'belongsTo') {
            this.belongsToDidChange(this, name);
          }
        }, this);
      },

      /** @private */
      belongsToWillChange: Ember.beforeObserver(function(model, name) {
        if(this._suspendedRelationships) {
          return;
        }
        var inverseModel = get(model, name);
        var session = get(model, 'session');
        if(session) {
          if(inverseModel) {
            session.inverseManager.unregisterRelationship(model, name, inverseModel);
          }
        }
      }),

      /** @private */
      belongsToDidChange: Ember.immediateObserver(function(model, name) {
        if(this._suspendedRelationships) {
          return;
        }
        var inverseModel = get(model, name);
        var session = get(model, 'session');
        if(session && inverseModel) {
          session.inverseManager.registerRelationship(model, name, inverseModel);
        }
      })
    });
  });
define("epf/relationships/ext",
  ["../model/model"],
  function(__dependency1__) {
    "use strict";
    var get = Ember.get, set = Ember.set;

    var Model = __dependency1__["default"];

    /**
      @private

      This file defines several extensions to the base `Ep.Model` class that
      add support for one-to-many relationships.
    */

    Model.reopen({
      // This Ember.js hook allows an object to be notified when a property
      // is defined.
      //
      // In this case, we use it to be notified when an Ember Data user defines a
      // belongs-to relationship. In that case, we need to set up observers for
      // each one, allowing us to track relationship changes and automatically
      // reflect changes in the inverse has-many array.
      //
      // This hook passes the class being set up, as well as the key and value
      // being defined. So, for example, when the user does this:
      //
      //   Ep.Model.extend({
      //     parent: Ep.belongsTo('user')
      //   });
      //
      // This hook would be called with "parent" as the key and the computed
      // property returned by `Ep.belongsTo` as the value.
      didDefineProperty: function(proto, key, value) {
        // Check if the value being set is a computed property.
        if (value instanceof Ember.Descriptor) {

          // If it is, get the metadata for the relationship. This is
          // populated by the `Ep.belongsTo` helper when it is creating
          // the computed property.
          var meta = value.meta();

          // if (meta.isRelationship && meta.kind === 'belongsTo') {
          //   Ember.addObserver(proto, key, null, 'belongsToDidChange');
          //   Ember.addBeforeObserver(proto, key, null, 'belongsToWillChange');
          // }

          meta.parentType = proto.constructor;
        }
      },

      _suspendedRelationships: false,

      /**
        @private

        The goal of this method is to temporarily disable specific observers
        that take action in response to application changes.

        This allows the system to make changes (such as materialization and
        rollback) that should not trigger secondary behavior (such as setting an
        inverse relationship or marking records as dirty).

        The specific implementation will likely change as Ember proper provides
        better infrastructure for suspending groups of observers, and if Array
        observation becomes more unified with regular observers.
      */
      suspendRelationshipObservers: function(callback, binding) {
        var observers = get(this.constructor, 'relationshipNames').belongsTo;
        var self = this;

        // could be nested
        if(this._suspendedRelationships) {
          return callback.call(binding || self);
        }

        try {
          this._suspendedRelationships = true;
          // Ember._suspendObservers(self, observers, null, 'belongsToDidChange', function() {
          //   Ember._suspendBeforeObservers(self, observers, null, 'belongsToWillChange', function() {
              callback.call(binding || self);
          //   });
          // });
        } finally {
          this._suspendedRelationships = false;
        }
      }

    });

    /**
      These Ep.Model extensions add class methods that provide relationship
      introspection abilities about relationships.

      A note about the computed properties contained here:

      **These properties are effectively sealed once called for the first time.**
      To avoid repeatedly doing expensive iteration over a model's fields, these
      values are computed once and then cached for the remainder of the runtime of
      your application.

      If your application needs to modify a class after its initial definition
      (for example, using `reopen()` to add additional attributes), make sure you
      do it before using your model with the store, which uses these properties
      extensively.
    */

    Model.reopenClass({
      /**
        For a given relationship name, returns the model type of the relationship.

        For example, if you define a model like this:

            App.Post = Ep.Model.extend({
              comments: Ep.hasMany(App.Comment)
            });

        Calling `App.Post.typeForRelationship('comments')` will return `App.Comment`.

        @param {String} name the name of the relationship
        @return {subclass of Ep.Model} the type of the relationship, or undefined
      */
      typeForRelationship: function(name) {
        var relationship = get(this, 'relationshipsByName').get(name);
        return relationship && relationship.type;
      },

      inverseFor: function(name) {
        var inverseType = this.typeForRelationship(name);

        if (!inverseType) { return null; }

        var options = this.metaForProperty(name).options;
        var inverseName, inverseKind;

        if (options.inverse) {
          inverseName = options.inverse;
          inverseKind = Ember.get(inverseType, 'relationshipsByName').get(inverseName).kind;
        } else {
          var possibleRelationships = findPossibleInverses(this, inverseType);

          if (possibleRelationships.length === 0) { return null; }

          
          inverseName = possibleRelationships[0].name;
          inverseKind = possibleRelationships[0].kind;
        }

        function findPossibleInverses(type, inverseType, possibleRelationships) {
          possibleRelationships = possibleRelationships || [];

          var relationshipMap = get(inverseType, 'relationships');
          if (!relationshipMap) { return; }

          var relationships = relationshipMap.get(type);
          var typeKey = Ember.get(type, 'typeKey');
          if (relationships.length > 0 && typeKey) {
            // Match inverse based on name
            var propertyName = Ember.String.camelize(typeKey);
            var inverse = relationships.findProperty('name', propertyName) || relationships.findProperty('name', Ember.String.pluralize(propertyName));
            if(inverse) {
              possibleRelationships.push.apply(possibleRelationships, [inverse]);
            }
          }
          if (type.superclass) {
            findPossibleInverses(type.superclass, inverseType, possibleRelationships);
          }
          return possibleRelationships;
        }

        return {
          type: inverseType,
          name: inverseName,
          kind: inverseKind
        };
      },

      /**
        The model's relationships as a map, keyed on the type of the
        relationship. The value of each entry is an array containing a descriptor
        for each relationship with that type, describing the name of the relationship
        as well as the type.

        For example, given the following model definition:

            App.Blog = Ep.Model.extend({
              users: Ep.hasMany(App.User),
              owner: Ep.belongsTo(App.User),
              posts: Ep.hasMany(App.Post)
            });

        This computed property would return a map describing these
        relationships, like this:

            var relationships = Ember.get(App.Blog, 'relationships');
            relationships.get(App.User);
            //=> [ { name: 'users', kind: 'hasMany' },
            //     { name: 'owner', kind: 'belongsTo' } ]
            relationships.get(App.Post);
            //=> [ { name: 'posts', kind: 'hasMany' } ]

        @type Ember.Map
        @readOnly
      */
      relationships: Ember.computed(function() {
        var map = new Ember.MapWithDefault({
          defaultValue: function() { return []; }
        });

        // Loop through each computed property on the class
        this.eachComputedProperty(function(name, meta) {

          // If the computed property is a relationship, add
          // it to the map.
          if (meta.isRelationship) {
            reifyRelationshipType(meta);

            var relationshipsForType = map.get(meta.type);

            relationshipsForType.push({ name: name, kind: meta.kind });
          }
        });

        return map;
      }),

      /**
        A hash containing lists of the model's relationships, grouped
        by the relationship kind. For example, given a model with this
        definition:

            App.Blog = Ep.Model.extend({
              users: Ep.hasMany(App.User),
              owner: Ep.belongsTo(App.User),

              posts: Ep.hasMany(App.Post)
            });

        This property would contain the following:

           var relationshipNames = Ember.get(App.Blog, 'relationshipNames');
           relationshipNames.hasMany;
           //=> ['users', 'posts']
           relationshipNames.belongsTo;
           //=> ['owner']

        @type Object
        @readOnly
      */
      relationshipNames: Ember.computed(function() {
        var names = { hasMany: [], belongsTo: [] };

        this.eachComputedProperty(function(name, meta) {
          if (meta.isRelationship) {
            names[meta.kind].push(name);
          }
        });

        return names;
      }),

      /**
        An array of types directly related to a model. Each type will be
        included once, regardless of the number of relationships it has with
        the model.

        For example, given a model with this definition:

            App.Blog = Ep.Model.extend({
              users: Ep.hasMany(App.User),
              owner: Ep.belongsTo(App.User),
              posts: Ep.hasMany(App.Post)
            });

        This property would contain the following:

           var relatedTypes = Ember.get(App.Blog, 'relatedTypes');
           //=> [ App.User, App.Post ]

        @type Ember.Array
        @readOnly
      */
      relatedTypes: Ember.computed(function() {
        var type,
            types = Ember.A([]);

        // Loop through each computed property on the class,
        // and create an array of the unique types involved
        // in relationships
        this.eachComputedProperty(function(name, meta) {
          if (meta.isRelationship) {
            reifyRelationshipType(meta);
            type = meta.type;
            
            if (!types.contains(type)) {
                            types.push(type);
            }
          }
        });

        return types;
      }),

      /**
        A map whose keys are the relationships of a model and whose values are
        relationship descriptors.

        For example, given a model with this
        definition:

            App.Blog = Ep.Model.extend({
              users: Ep.hasMany(App.User),
              owner: Ep.belongsTo(App.User),

              posts: Ep.hasMany(App.Post)
            });

        This property would contain the following:

           var relationshipsByName = Ember.get(App.Blog, 'relationshipsByName');
           relationshipsByName.get('users');
           //=> { key: 'users', kind: 'hasMany', type: App.User }
           relationshipsByName.get('owner');
           //=> { key: 'owner', kind: 'belongsTo', type: App.User }

        @type Ember.Map
        @readOnly
      */
      relationshipsByName: Ember.computed(function() {
        var map = Ember.Map.create(), type;

        this.eachComputedProperty(function(name, meta) {
          if (meta.isRelationship) {
            reifyRelationshipType(meta);
            meta.key = name;
            type = meta.type;

            map.set(name, meta);
          }
        });

        return map;
      }),

      /**
        A map whose keys are the fields of the model and whose values are strings
        describing the kind of the field. A model's fields are the union of all of its
        attributes and relationships.

        For example:

            App.Blog = Ep.Model.extend({
              users: Ep.hasMany(App.User),
              owner: Ep.belongsTo(App.User),

              posts: Ep.hasMany(App.Post),

              title: Ep.attr('string')
            });

            var fields = Ember.get(App.Blog, 'fields');
            fields.forEach(function(field, kind) {
              console.log(field, kind);
            });

            // prints:
            // users, hasMany
            // owner, belongsTo
            // posts, hasMany
            // title, attribute

        @type Ember.Map
        @readOnly
      */
      fields: Ember.computed(function() {
        var map = Ember.Map.create();

        this.eachComputedProperty(function(name, meta) {
          if (meta.isRelationship) {
            map.set(name, meta.kind);
          } else if (meta.isAttribute) {
            map.set(name, 'attribute');
          }
        });

        return map;
      }),

      /**
        Given a callback, iterates over each of the relationships in the model,
        invoking the callback with the name of each relationship and its relationship
        descriptor.

        @param {Function} callback the callback to invoke
        @param {any} binding the value to which the callback's `this` should be bound
      */
      eachRelationship: function(callback, binding) {
        get(this, 'relationshipsByName').forEach(function(name, relationship) {
          callback.call(binding, name, relationship);
        });
      },

      /**
        Given a callback, iterates over each of the types related to a model,
        invoking the callback with the related type's class. Each type will be
        returned just once, regardless of how many different relationships it has
        with a model.

        @param {Function} callback the callback to invoke
        @param {any} binding the value to which the callback's `this` should be bound
      */
      eachRelatedType: function(callback, binding) {
        get(this, 'relatedTypes').forEach(function(type) {
          callback.call(binding, type);
        });
      }
    });

    Model.reopen({
      /**
        Given a callback, iterates over each of the relationships in the model,
        invoking the callback with the name of each relationship and its relationship
        descriptor.

        @param {Function} callback the callback to invoke
        @param {any} binding the value to which the callback's `this` should be bound
      */
      eachRelationship: function(callback, binding) {
        this.constructor.eachRelationship(callback, binding);
      },

      eachLoadedRelationship: function(callback, binding) {
        this.eachRelationship(function(name, relationship) {
          if(this.isPropertyLoaded(name)) {
            callback.apply(binding, arguments);
          }
        }, this);
      },

      /**
        Traverses the object graph rooted at this model, invoking the callback.
      */
      eachRelatedModel: function(callback, binding, cache) {
        if(!cache) cache = Ember.Set.create();
        if(cache.contains(this)) return;
        cache.add(this);
        callback.call(binding || this, this);

        this.eachLoadedRelationship(function(name, relationship) {
          if(relationship.kind === 'belongsTo') {
            var child = get(this, name);
            if(!child) return;
            this.eachRelatedModel.call(child, callback, binding, cache);
          } else if(relationship.kind === 'hasMany') {
            var children = get(this, name);
            children.forEach(function(child) {
              this.eachRelatedModel.call(child, callback, binding, cache);
            }, this);
          }
        }, this);
      },

      /**
        Given a callback, iterates over each child (1-level deep relation).

        @param {Function} callback the callback to invoke
        @param {any} binding the value to which the callback's `this` should be bound
      */
      eachChild: function(callback, binding) {
        this.eachLoadedRelationship(function(name, relationship) {
          if(relationship.kind === 'belongsTo') {
            var child = get(this, name);
            if(child) {
              callback.call(binding, child);
            }
          } else if(relationship.kind === 'hasMany') {
            var children = get(this, name);
            children.forEach(function(child) {
              callback.call(binding, child);
            }, this);
          }
        }, this);
      }

    });

    function reifyRelationshipType(relationship) {
      if(!relationship.type) {
        relationship.type = Ep.__container__.lookupFactory('model:' + relationship.typeKey);
      }
      if(!relationship.typeKey) {
        relationship.typeKey = get(relationship.type, 'typeKey');
      }
    }
  });
define("epf/relationships/has_many",
  ["../model/model","../collections/model_array","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var get = Ember.get, set = Ember.set, forEach = Ember.ArrayPolyfills.forEach;

    var Model = __dependency1__["default"];
    var ModelArray = __dependency2__["default"];

    __exports__["default"] = function(typeKey, options) {
            options = options || {};

      var meta = { isRelationship: true, options: options, kind: 'hasMany' };

      if(typeof typeKey === 'string') {
        meta.typeKey = typeKey;
      } else {
                meta.type = typeKey;
      }

      return Ember.computed(function(key, value, oldValue) {
        var content;
        if(arguments.length === 1) {
          if(!get(this, 'isNew')) {
            return;
          }
          content = [];
        } else {
          content = value;
        }
        // reuse the existing array
        // must check if an array here since Ember passes in UNDEFINED() instead of undefined
        if(oldValue && (oldValue instanceof HasManyArray)) {
          set(oldValue, 'content', content);
          return oldValue;
        } else {
          return HasManyArray.create({
            owner: this,
            name: key,
            content: content
          });
        }
      }).property().meta(meta);
    };

    var HasManyArray = ModelArray.extend({

      name: null,
      owner: null,
      session: Ember.computed.alias('owner.session'),


      objectAtContent: function(index) {
        var content = get(this, 'content'),
            model = content.objectAt(index),
            session = get(this, 'session');

        if (session && model) {
          // This will replace proxies with their actual models
          // if they are loaded
          return session.add(model);
        }
        return model;
      },

      arrayContentWillChange: function(index, removed, added) {
        var model = get(this, 'owner'),
            name = get(this, 'name'),
            session = get(this, 'session');

        if(session) {
          session.modelWillBecomeDirty(model);
          if (!model._suspendedRelationships) {
            for (var i=index; i<index+removed; i++) {
              var inverseModel = this.objectAt(i);
              session.inverseManager.unregisterRelationship(model, name, inverseModel);
            }
          }
        }

        return this._super.apply(this, arguments);
      },

      arrayContentDidChange: function(index, removed, added) {
        this._super.apply(this, arguments);

        var model = get(this, 'owner'),
            name = get(this, 'name'),
            session = get(this, 'session');

        if (session && !model._suspendedRelationships) {
          for (var i=index; i<index+added; i++) {
            var inverseModel = this.objectAt(i);
            session.inverseManager.registerRelationship(model, name, inverseModel);
          }
        }
      },

    });

    __exports__.HasManyArray = HasManyArray;
  });
define("epf/rest/embedded_helpers_mixin",
  ["../serializers/serializer_for_mixin","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var get = Ember.get, set = Ember.set;

    var SerializerForMixin = __dependency1__["default"];

    __exports__["default"] = Ember.Mixin.create(SerializerForMixin, {

      embeddedType: function(type, name) {
        var serializer = this.serializerForType(type);
        if(this === serializer) {
          var config = this.configFor(name);
          return config.embedded;
        }
        return serializer.embeddedType(type, name);
      },

      eachEmbeddedRecord: function(model, callback, binding) {
        this.eachEmbeddedBelongsToRecord(model, callback, binding);
        this.eachEmbeddedHasManyRecord(model, callback, binding);
      },

      eachEmbeddedBelongsToRecord: function(model, callback, binding) {
        this.eachEmbeddedBelongsTo(get(model, 'type'), function(name, relationship, embeddedType) {
          if(!model.isPropertyLoaded(name)) {
            return;
          }
          var embeddedRecord = get(model, name);
          if (embeddedRecord) { callback.call(binding, embeddedRecord, embeddedType); }
        });
      },

      eachEmbeddedHasManyRecord: function(model, callback, binding) {
        this.eachEmbeddedHasMany(get(model, 'type'), function(name, relationship, embeddedType) {
          if(!model.isPropertyLoaded(name)) {
            return;
          }
          var array = get(model, name);
          for (var i=0, l=get(array, 'length'); i<l; i++) {
            callback.call(binding, array.objectAt(i), embeddedType);
          }
        });
      },

      eachEmbeddedHasMany: function(type, callback, binding) {
        this.eachEmbeddedRelationship(type, 'hasMany', callback, binding);
      },

      eachEmbeddedBelongsTo: function(type, callback, binding) {
        this.eachEmbeddedRelationship(type, 'belongsTo', callback, binding);
      },

      eachEmbeddedRelationship: function(type, kind, callback, binding) {
        type.eachRelationship(function(name, relationship) {
          var embeddedType = this.embeddedType(type, name);

          if (embeddedType) {
            if (relationship.kind === kind) {
              callback.call(binding, name, relationship, embeddedType);
            }
          }
        }, this);
      }

    });
  });
define("epf/rest/embedded_manager",
  ["./embedded_helpers_mixin","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var get = Ember.get, set = Ember.set;

    var EmbdeddedHelpersMixin = __dependency1__["default"];

    __exports__["default"] = Ember.Object.extend(EmbdeddedHelpersMixin, {

      // needs to be set for embedded helpers
      // TODO: extract out the embedded helpers
      adapter: null,

      init: function() {
        this._super.apply(this, arguments);

        // bookkeep all the parents of embedded records
        this._parentMap = {};

        this._cachedIsEmbedded = Ember.Map.create();
      },

      updateParents: function(model) {
        var type = get(model, 'type'),
            adapter = get(this, 'adapter'),
            typeKey = get(type, 'typeKey'),
            serializer = adapter.serializerFor(typeKey);

        this.eachEmbeddedRecord(model, function(embedded, kind) {
          this._parentMap[get(embedded, 'clientId')] = model;
        }, this);
      },

      findParent: function(model) {
        var parent = this._parentMap[get(model, 'clientId')];
        return parent;
      },

      isEmbedded: function(model) {
        var type = get(model, 'type'),
            result = this._cachedIsEmbedded.get(type);

        if(result !== undefined) return result;

        var adapter = get(this, 'adapter'),
            result = false;

        type.eachRelationship(function(name, relationship) {
          var serializer = adapter.serializerFor(relationship.typeKey),
              inverse = type.inverseFor(relationship.key);
          
          // TODO: this currently won't support embedded relationships
          // that don't have an inverse
          if(!inverse) return;

          var config = serializer.configFor(inverse.name);

          result = result || config.embedded === 'always';
        }, this);

        this._cachedIsEmbedded.set(type, result);
        return result;
      }

    });
  });
define("epf/rest/operation",
  ["exports"],
  function(__exports__) {
    "use strict";
    var get = Ember.get, set = Ember.set;

    __exports__["default"] = Ember.Object.extend(Ember.DeferredMixin, {

      model: null,
      shadow: null,
      adapter: null,
      // forces the operation to be performed
      force: false,

      init: function() {
        this.children = Ember.Set.create();
        this.parents = Ember.Set.create();
      },

      // determine which relationships are affected by this operation
      // TODO: we should unify this with dirty checking
      dirtyRelationships: Ember.computed(function() {
        var adapter = get(this, 'adapter'),
            model = get(this, 'model'),
            rels = [],
            shadow = get(this, 'shadow');

        if(get(model, 'isNew')) {
          // if the model is new, all relationships are considered dirty
          model.eachRelationship(function(name, relationship) {
            if(adapter.isRelationshipOwner(relationship)) {
              rels.push({name: name, type: relationship.kind, relationship: relationship, oldValue: null});
            }
          }, this);
        } else {
          // otherwise we check the diff to see if the relationship has changed,
          // in the case of a delete this won't really matter since it will
          // definitely be dirty
          var diff = model.diff(shadow);
          for(var i = 0; i < diff.length; i++) {
            var d = diff[i];
            if(d.relationship && adapter.isRelationshipOwner(d.relationship)) {
              rels.push(d);
            }
          }
        }

        return rels;
      }),

      isDirty: Ember.computed(function() {
        return !!get(this, 'dirtyType');
      }),

      isDirtyFromUpdates: Ember.computed(function() {
        var model = get(this, 'model'),
            shadow = get(this, 'shadow'),
            adapter = get(this, 'adapter');

        var diff = model.diff(shadow);
        var dirty = false;
        var relDiff = [];
        for(var i = 0; i < diff.length; i++) {
          var d = diff[i];
          if(d.type == 'attr') {
            dirty = true;
          } else {
            relDiff.push(d);
          }
        }
        return dirty || adapter.isDirtyFromRelationships(model, shadow, relDiff);
      }),

      dirtyType: Ember.computed(function() {
        var model = get(this, 'model');
        if(get(model, 'isNew')) {
          return "created";
        } else if(get(model, 'isDeleted')) {
          return "deleted";
        } else if(get(this, 'isDirtyFromUpdates') || get(this, 'force')) {
          return "updated";
        }
      }).property('force'),

      perform: function() {
        var adapter = get(this, 'adapter'),
            session = get(this, 'session'),
            dirtyType = get(this, 'dirtyType'),
            model = get(this, 'model'),
            shadow = get(this, 'shadow'),
            promise;

        if(!dirtyType || !adapter.shouldSave(model)) {
          if(adapter.isEmbedded(model)) {
            // if embedded we want to extract the model from the result
            // of the parent operation
            promise = this._promiseFromEmbeddedParent();
          } else {
            // return an "identity" promise if we don't want to do anything
            promise = Ember.RSVP.resolve();
          }
        } else if(dirtyType === "created") {
          promise = adapter._contextualizePromise(adapter._create(model), model);
        } else if(dirtyType === "updated") {
          promise = adapter._contextualizePromise(adapter._update(model), model);
        } else if(dirtyType === "deleted") {
          promise = adapter._contextualizePromise(adapter._deleteModel(model), model);
        }

        promise = promise.then(function(serverModel) {
          // in the case of new records we need to assign the id
          // of the model so dependent operations can use it
          if(!get(model, 'id')) {
            set(model, 'id', get(serverModel, 'id'));
          }
          if(!serverModel) {
            // if no data returned, assume that the server data
            // is the same as the model
            serverModel = model;
          } else {
            if(get(serverModel, 'meta') && Ember.keys(serverModel).length == 1 ){
              model.meta = serverModel.meta;
              serverModel = model;
            }
            if(!get(serverModel, 'clientRev')) {
              // ensure the clientRev is set on the returned model
              // 0 is the default value
              set(serverModel, 'clientRev', get(model, 'clientRev'));
            }
          }
          return serverModel;
        }, function(serverModel) {
          // if the adapter returns errors we replace the
          // model with the shadow if no other model returned
          // TODO: could be more intuitive to move this logic
          // into adapter._contextualizePromise

          // there won't be a shadow if the model is new
          if(shadow && serverModel === model) {
            shadow.set('errors', serverModel.get('errors'));
            throw shadow;
          }
          throw serverModel;
        });
        this.resolve(promise);
        return this;
      },

      _embeddedParent: Ember.computed(function() {
        var model = get(this, 'model'),
            parentModel = get(this, 'adapter')._embeddedManager.findParent(model),
            graph = get(this, 'graph');

        
        return graph.getOp(parentModel);
      }),

      _promiseFromEmbeddedParent: function() {
        var model = this.model,
            adapter = get(this, 'adapter'),
            serializer = adapter.serializerForModel(model);

        function findInParent(parentModel) {
          var res = null;
          serializer.eachEmbeddedRecord(parentModel, function(child, embeddedType) {
            if(res) return;
            if(child.isEqual(model)) res = child;
          });
          return res;
        }

        return get(this, '_embeddedParent').then(function(parent) {
          return findInParent(parent);
        }, function(parent) {
          throw findInParent(parent);
        });
      },

      toStringExtension: function() {
        return "( " + get(this, 'dirtyType') + " " + get(this, 'model') + " )";
      },

      addChild: function(child) {
        this.children.add(child);
        child.parents.add(this);
      }

    });
  });
define("epf/rest/operation_graph",
  ["./operation","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var get = Ember.get, set = Ember.set;

    var Operation = __dependency1__["default"];

    __exports__["default"] = Ember.Object.extend({

      models: null,
      shadows: null,
      adapter: null,

      init: function() {
        var graph = this,
            adapter = get(this, 'adapter'),
            session = get(this, 'session');
        this.ops = Ember.MapWithDefault.create({
          defaultValue: function(model) {
            return Operation.create({
              model: model,
              graph: graph,
              adapter: adapter,
              session: session
            });
          }
        });
        this.build();
      },

      perform: function() {
        var adapter = get(this, 'adapter'),
            cumulative = [];

        function createNestedPromise(op) {
          var promise;

          // perform after all parents have performed
          if(op.parents.length > 0) {
            promise = Ember.RSVP.all(op.parents.toArray()).then(function() {
              return op.perform();
            });
          } else {
            promise = op.perform();
          }

          // keep track of all models for the resolution of the entire flush
          promise = promise.then(function(model) {
            cumulative.push(model);
            return model;
          }, function(model) {
            cumulative.push(model);
            throw model;
          });

          if(op.children.length > 0) {
            promise = promise.then(function(model) {
              return Ember.RSVP.all(op.children.toArray()).then(function(models) {
                adapter.rebuildRelationships(models, model);
                return model;
              }, function(models) {
                // XXX: should we still rebuild relationships since this request succeeded?
                throw model;
              });
            });
          }
          return promise;
        }

        var promises = [];
        get(this, 'ops').forEach(function(model, op) {
          promises.push(createNestedPromise(op));
        }); 

        return Ember.RSVP.all(promises).then(function() {
          return cumulative;
        }, function(err) {
          throw cumulative;
        });
      },

      build: function() {
        var adapter = get(this, 'adapter');
        var models = get(this, 'models');
        var shadows = get(this, 'shadows');
        var ops = get(this, 'ops');

        models.forEach(function(model) {
          // skip any promises that aren't loaded
          // TODO: think through edge cases in depth
          // XXX:
          // if(!get(model, 'isLoaded')) {
          //   return;
          // }

          var shadow = shadows.getModel(model);

          
          var op = ops.get(model);
          set(op, 'shadow', shadow);

          var rels = get(op, 'dirtyRelationships');
          for(var i = 0; i < rels.length; i++) {
            var d = rels[i];
            var name = d.name;
            var parentModel = model.get(name) || shadows.getModel(d.oldValue);
            // embedded children should not be dependencies
            var serializer = adapter.serializerForModel(model);
            var isEmbeddedRel = serializer.embeddedType(get(model, 'type'), name);

            // TODO: handle hasMany's depending on adapter configuration
            if(parentModel && !isEmbeddedRel) {
              var parentOp = this.getOp(parentModel);
              parentOp.addChild(op);
            }
          }

          var isEmbedded = adapter.isEmbedded(model);

          if(get(op, 'isDirty') && isEmbedded) {
            // walk up the embedded tree and mark root as dirty
            var rootModel = adapter.findEmbeddedRoot(model, models);
            var rootOp = this.getOp(rootModel);
            set(rootOp, 'force', true);

            // ensure the embedded parent is a parent of the operation
            var parentModel = adapter._embeddedManager.findParent(model);
            var parentOp = this.getOp(parentModel);

            // if the child already has some parents, they need to become
            // the parents of the embedded root as well
            op.parents.forEach(function(parent) {
              if(parent === rootOp) return;
              if(adapter.findEmbeddedRoot(parent.model, models) === rootModel) return;
              parent.addChild(rootOp);
            });

            parentOp.addChild(op);
          }

        }, this);
      },

      getOp: function(model) {
        // ops is is a normal Ember.Map and doesn't use client
        // ids so we need to make sure that we are looking up
        // with the correct model instance
        var models = get(this, 'models');
        var materializedModel = models.getModel(model);
        // TODO: we do this check since it is possible that some
        // lazy models are not part of `models`, a more robust
        // solution needs to be figured out for dealing with operations
        // on lazy models
        if(materializedModel) model = materializedModel;
        return this.ops.get(model);
      }

    });
  });
define("epf/rest/payload",
  ["../collections/model_set","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var get = Ember.get, set = Ember.set;

    var ModelSet = __dependency1__["default"];

    var Payload = ModelSet.extend({

      isPayload: true,
      context: null,
      meta: null,

      merge: function(session) {
        var merged = this.map(function(model) {
          return session.merge(model);
        }, this);
        var context = get(this, 'context');
        if(context && Ember.isArray(context)) {
          context = context.map(function(model) {
            return session.getModel(model);
          });
        } else if(context) {
          context = session.getModel(context);
        }
        var result = Payload.fromArray(merged);
        result.context = context;
        result.meta = this.meta;
        result.errors = this.errors;
        return result;
      }

    });

    __exports__["default"] = Payload;
  });
define("epf/rest/rest_adapter",
  ["../adapter","./embedded_helpers_mixin","./embedded_manager","../collections/model_set","./operation_graph","./rest_errors","./serializers/payload","./serializers/errors","../utils/materialize_relationships","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__, __dependency6__, __dependency7__, __dependency8__, __dependency9__, __exports__) {
    "use strict";
    /*global jQuery*/
    var get = Ember.get, set  = Ember.set, forEach = Ember.ArrayPolyfills.forEach, pluralize = Ember.String.pluralize;

    var Adapter = __dependency1__["default"];
    var EmbeddedHelpersMixin = __dependency2__["default"];
    var EmbeddedManager = __dependency3__["default"];
    var ModelSet = __dependency4__["default"];
    var OperationGraph = __dependency5__["default"];
    var RestErrors = __dependency6__["default"];
    var PayloadSerializer = __dependency7__["default"];
    var RestErrorsSerializer = __dependency8__["default"];

    var materializeRelationships = __dependency9__["default"];

    /**
      The REST adapter allows your store to communicate with an HTTP server by
      transmitting JSON via XHR. Most Ember.js apps that consume a JSON API
      should use the REST adapter.

      This adapter is designed around the idea that the JSON exchanged with
      the server should be conventional.

      ## JSON Structure

      The REST adapter expects the JSON returned from your server to follow
      these conventions.

      ### Object Root

      The JSON payload should be an object that contains the record inside a
      root property. For example, in response to a `GET` request for
      `/posts/1`, the JSON should look like this:

      ```js
      {
        "post": {
          "title": "I'm Running to Reform the W3C's Tag",
          "author": "Yehuda Katz"
        }
      }
      ```

      ### Conventional Names

      Attribute names in your JSON payload should be the camelCased versions of
      the attributes in your Ember.js models.

      For example, if you have a `Person` model:

      ```js
      App.Person = Ep.Model.extend({
        firstName: Ep.attr('string'),
        lastName: Ep.attr('string'),
        occupation: Ep.attr('string')
      });
      ```

      The JSON returned should look like this:

      ```js
      {
        "person": {
          "firstName": "Barack",
          "lastName": "Obama",
          "occupation": "President"
        }
      }
      ```

      ## Customization

      ### Endpoint path customization

      Endpoint paths can be prefixed with a `namespace` by setting the namespace
      property on the adapter:

      ```js
      Ep.RestAdapter.reopen({
        namespace: 'api/1'
      });
      ```
      Requests for `App.Person` would now target `/api/1/people/1`.

      ### Host customization

      An adapter can target other hosts by setting the `host` property.

      ```js
      Ep.RestAdapter.reopen({
        host: 'https://api.example.com'
      });
      ```

      ### Headers customization

      Some APIs require HTTP headers, e.g. to provide an API key. An array of
      headers can be added to the adapter which are passed with every request:

      ```js
       Ep.RestAdapter.reopen({
        headers: {
          "API_KEY": "secret key",
          "ANOTHER_HEADER": "Some header value"
        }
      });
      ```

      @class RestAdapter
      @constructor
      @namespace Ep
      @extends Adapter
    */
    __exports__["default"] = Adapter.extend(EmbeddedHelpersMixin, {
      defaultSerializer: 'payload',

      init: function() {
        this._super.apply(this, arguments);
        this._embeddedManager = EmbeddedManager.create({adapter: this, container: this.container});
        this._pendingOps = {};
      },

      setupContainer: function(parent) {
        var container = parent.child();
        container.register('serializer:errors', RestErrorsSerializer);
        container.register('serializer:payload', PayloadSerializer);
        return container;
      },

      load: function(model, opts, session) {
        return this._mergeAndContextualizePromise(this._load(model, opts), session, model, opts);
      },
      
      _load: function(model, opts) {
        opts = Ember.merge({
          type: 'GET'
        }, opts || {});
        return this._remoteCall(model, null, null, opts);
      },

      update: function(model, opts, session) {
        return this._mergeAndContextualizePromise(this._update(model, opts), session, model, opts);
      },
      
      _update: function(model, opts) {
        opts = Ember.merge({
          type: 'PUT'
        }, opts || {});
        return this._remoteCall(model, null, model, opts);
      },
      
      create: function(model, opts, session) {
        return this._mergeAndContextualizePromise(this._create(model, opts), session, model, opts);
      },

      _create: function(model, opts) {
        return this._remoteCall(model, null, model, opts);
      },
      
      deleteModel: function(model, opts, session) {
        return this._mergeAndContextualizePromise(this._deleteModel(model, opts), session, model, opts);
      },

      _deleteModel: function(model, opts) {
        opts = Ember.merge({
          type: 'DELETE'
        }, opts || {});
        return this._remoteCall(model, null, null, opts);
      },

      query: function(typeKey, query, opts, session) {
        return this._mergeAndContextualizePromise(this._query(typeKey, query, opts), session, typeKey, opts);
      },
      
      _query: function(typeKey, query, opts) {
        opts = Ember.merge({
          type: 'GET',
          serialize: false,
          deserializer: 'payload',
        }, opts || {});
        return this._remoteCall(typeKey, null, query, opts);
      },

      /**
        Calls a custom endpoint on the remote server.

        The following options are available inside the options hash:

        * `type`: The request method. Defaults to `POST`.
        * `serialize`: Whether or not to serialize the passed in data
        * `serializer`: The name of the serializer to use on the passed in data
        * `deserialize`: Whether or not to deserialize the returned data
        * `deserializer`: The name of the serializer to use to deserialize returned data (defaults to `serializer`)
        * `serializerOptions`: Options to be passed to the serializer's `serialize`/`deserialize` methods
        * `params`: Additional raw parameters to be added to the final serialized hash sent to the server
        * `url`: A custom url to use

        @method remoteCall
        @param {any} context the model or type that is used as the context of the call
        @param String name the name of the action to be called
        @param Object [opts] an options hash
        @param Session [session] the session to merge the results into
      */
      remoteCall: function(context, name, data, opts, session) {
        var serialize = data && !!get(data, 'isModel');
        opts = Ember.merge({
          serialize: serialize,
          deserializer: 'payload'
        }, opts || {});
        return this._mergeAndContextualizePromise(this._remoteCall(context, name, data, opts), session, context, opts);
      },

      _remoteCall: function(context, name, data, opts) {
        var adapter = this,
            opts = this._normalizeOptions(opts),
            url;
        
        if(opts.url) {
          url = opts.url;
        } else {
          url = this.buildUrlFromContext(context, name);
        }

        var method = opts.type || "POST";
        
        if(opts.serialize !== false) {
          var serializer = opts.serializer,
              serializerOptions = opts.serializerOptions;
              
          if(!serializer && context) {
            serializer = this.serializerForContext(context);
          }
          
          if(serializer && data) {
            serializer = this.serializerFor(serializer);
            serializerOptions = Ember.merge({context: context}, serializerOptions || {});
            data = serializer.serialize(data, serializerOptions);
          }
        }
        
        if(opts.params) {
          data = data || {};
          data = Ember.merge(data, opts.params);
        }

        return this._deserializePromise(this.ajax(url, method, {data: data}), context, opts);
      },
      
      _normalizeOptions: function(opts) {
        opts = opts || {};
        // make sure that the context is a typeKey instead of a type
        if(opts.serializerOptions && typeof opts.serializerOptions.context === 'function') {
          opts.serializerOptions.context = get(opts.serializerOptions.context, 'typeKey');
        }
        return opts;
      },
      
      serializerForContext: function(context) {
        return get(this, 'defaultSerializer');
      },

      /**
        @private

        Deserialize the contents of a promise.
      */
      _deserializePromise: function(promise, context, opts) {
        var adapter = this;

        return promise.then(function(data){
          if(opts.deserialize !== false) {
            var serializer = opts.deserializer || opts.serializer,
                serializerOptions = opts.serializerOptions;
            
            if(!serializer && context) {
              serializer = adapter.serializerForContext(context);
            }
            
            if(serializer) {
              serializer = adapter.serializerFor(serializer);
              serializerOptions = Ember.merge({context: context}, serializerOptions || {});
            }
            
            return serializer.deserialize(data, serializerOptions);
          }
          
          return data;
        }, function(xhr) {
          if(opts.deserialize !== false) {
            var data;
            if(xhr.responseText) {
              data = JSON.parse(xhr.responseText);
            } else {
              data = {};
            }
            
            var serializer = opts.errorSerializer || opts.deserializer || opts.serializer,
                serializerOptions = opts.serializerOptions;
            
            if(!serializer && context) {
              serializer = adapter.serializerForContext(context);
            }
            
            if(serializer) {
              serializer = adapter.serializerFor(serializer);
              serializerOptions = Ember.merge({context: context, xhr: xhr}, serializerOptions || {});
            }
                
            throw serializer.deserialize(data, serializerOptions);
          }
          throw xhr;
        });
      },

      /**
        @private

        Merge the contents of the promise into the session.
      */
      _mergePromise: function(promise, session, opts) {
        if(opts && opts.deserialize === false) {
          return promise;
        }

        function merge(deserialized) {
          if(typeof deserialized.merge === 'function') {
            return deserialized.merge(session);
          } else {
            return session.merge(deserialized);
          }
        }

        return promise.then(function(deserialized) {
          return merge(deserialized);
        }, function(deserialized) {
          throw merge(deserialized);
        });
      },

      /**
        @private

        Transform the promise's resolve value to the context
        of the particular operation. E.g. a load operation may
        return a complex payload consisting of many models. In
        this case we want to just return the model that
        corresponds to the load.
      */
      _contextualizePromise: function(promise, context, opts) {
        if(opts && opts.deserializationContext !== undefined) {
          context = opts.deserializationContext;
        }

        function contextualize(merged) {
          // payloads detect their context during deserialization
          if(context && get(merged, 'isPayload')) {
            var result = get(merged, 'context');
            // the server might not return any data for the context
            // of the operation (e.g. a delete with an empty response)
            // in this case we just echo back the client's version
            if(!result) {
              result = context;
            }
            set(result, 'meta', get(merged, 'meta'));
            // TODO: we might want to merge errors here
            if(get(merged, 'errors') && (!get(result, 'errors') || result === context)) {
              set(result, 'errors', get(merged, 'errors'));
            }
            return result;
          }

          return merged;
        }

        return promise.then(function(merged) {
          return contextualize(merged);
        }, function(merged) {
          throw contextualize(merged);
        });
      },

      /**
        @private

        Composition of `_mergePromise` and `_contextualizePromise`.
      */
      _mergeAndContextualizePromise: function(promise, session, context, opts) {
        return this._contextualizePromise(this._mergePromise(promise, session, opts), context, opts);
      },

      /**
        Useful for manually merging in payload data.

        @method mergePayload
        @param Object data the raw payload data
        @param {any} [context] the context of the payload. This property will dictate the return value of this method.
        @param Session [session] the session to merge into. Defaults to the main session.
        @returns {any} The result of the merge contextualized to the context. E.g. if 'post' is the context, this will return all posts that are part of the payload.
      */
      mergePayload: function(data, context, session) {
        var payload = this.deserialize('payload', data, {context: context});
        if(!session) {
          session = this.container.lookup('session:main');
        }
        payload.merge(session);
        if(context) {
          return payload.context;
        }
        return payload;
      },

      /**
        Book-keeping for embedded models is done on the adapter.
        The logic inside this hook is for this purpose.
      */
      willMergeModel: function(model) {
        this._embeddedManager.updateParents(model);
      },

      flush: function(session) {
        // take a snapshot of the models and their shadows
        // (these will be updated by the session before the flush is complete)
        var models = this.buildDirtySet(session);
        var shadows = ModelSet.fromArray(models.map(function(model) {
          // shadows are already frozen copies so no need to re-copy
          return session.shadows.getModel(model) || model.copy();
        }));

        this.removeEmbeddedOrphans(models, shadows, session);

        // for embedded serialization purposes we need to materialize
        // all the lazy relationships in the set
        // (all of the copies have lazy models in their relationships)
        materializeRelationships(models);

        var op = OperationGraph.create({
          models: models,
          shadows: shadows,
          adapter: this,
          session: session
        });

        return this._performFlush(op, session);
      },

      _performFlush: function(op, session) {
        var models = get(op, 'models'),
            pending = Ember.Set.create();
        // check for any pending operations
        models.forEach(function(model) {
          var op = this._pendingOps[model.clientId];
          if(op) pending.add(op);
        }, this);

        var adapter = this;
        if(get(pending, 'length') > 0) {
          return Ember.RSVP.all(pending.toArray()).then(function() {
            return adapter._performFlush(op, session);
          });
        }

        var promise = op.perform();

        // if no pending operations, set this flush
        // as the pending operation for all models
        models.forEach(function(model) {
          this._pendingOps[model.clientId] = promise;
        }, this);

        return promise.then(function(res) {
          // remove all pending operations
          models.forEach(function(model) {
            delete adapter._pendingOps[model.clientId];
          });
          return res.map(function(model) {
            return session.merge(model);
          });
        }, function(err) {
          // remove all pending operations
          models.forEach(function(model) {
            delete adapter._pendingOps[model.clientId];
          });
          throw err.map(function(model) {
            return session.merge(model);
          });
        });
      },

      /**
        This callback is intendended to resolve the request ordering issue
        for parent models. For instance, when we have a Post -> Comments
        relationship, the parent post will be saved first. The request will
        return and it is likely that the returned JSON will have no comments.

        In this callback we re-evaluate the relationships after the children
        have been saved, effectively undoing the erroneous relationship results
        of the parent request.

        TODO: this should utilize the "owner" of the relationship
        TODO: move this to OperationGraph
      */
      rebuildRelationships: function(children, parent) {
        parent.suspendRelationshipObservers(function() {
          // TODO: figure out a way to preserve ordering (or screw ordering and use sets)
          for(var i = 0; i < children.length; i++) {
            var child = children[i];

            child.eachLoadedRelationship(function(name, relationship) {
              // TODO: handle hasMany's for non-relational databases...
              if(relationship.kind === 'belongsTo') {
                var value = get(child, name),
                    inverse = child.constructor.inverseFor(name);

                if(inverse) {
                  if(!(parent instanceof inverse.type)) {
                    return;
                  }
                  // if embedded then we are certain the parent has the correct data
                  if(this.embeddedType(inverse.type, inverse.name)) {
                    return;
                  }

                  if(inverse.kind === 'hasMany' && parent.isPropertyLoaded(inverse.name)) {
                    var parentCollection = get(parent, inverse.name);
                    if(child.get('isDeleted')) {
                      parentCollection.removeObject(child);
                    } else if(value && value.isEqual(parent)) {
                      // TODO: make sure it doesn't already exists (or change model arrays to sets)
                      // TODO: think about 1-1 relationships
                      parentCollection.addObject(child);
                    }
                  }

                }
              }
            }, this);
          }
        }, this);
      },

      /**
        Returns whether or not the passed in relationship
        is the "owner" of the relationship. This defaults
        to true for belongsTo and false for hasMany
      */
      isRelationshipOwner: function(relationship) {
        var config = this.configFor(relationship.parentType);
        var owner = config[relationship.key] && config[relationship.key].owner;
        // TODO: use lack of an inverse to determine this value as well
        return relationship.kind === 'belongsTo' && owner !== false ||
          relationship.kind === 'hasMany' && owner === true
      },

      isDirtyFromRelationships: function(model, cached, relDiff) {
        var serializer = this.serializerForModel(model);
        for(var i = 0; i < relDiff.length; i++) {
          var diff = relDiff[i];
          if(this.isRelationshipOwner(diff.relationship) || serializer.embeddedType(model.constructor, diff.name) === 'always') {
            return true;
          }
        }
        return false;
      },

      shouldSave: function(model) {
        return !this.isEmbedded(model);
      },

      isEmbedded: function(model) {
        return this._embeddedManager.isEmbedded(model);
      },

      /**
        @private
        Iterate over the models and remove embedded records
        that are missing their embedded parents.
      */
      removeEmbeddedOrphans: function(models, shadows, session) {
        var orphans = [];
        models.forEach(function(model) {
          if(!this.isEmbedded(model)) return;
          var root = this.findEmbeddedRoot(model, models);
          if(!root || root.isEqual(model)) {
            orphans.push(model);
          }
        }, this);
        models.removeObjects(orphans);
        shadows.removeObjects(orphans);
      },

      /**
        @private
        Build the set of dirty models that are part of the flush
      */
      buildDirtySet: function(session) {
        var result = ModelSet.create()
        get(session, 'dirtyModels').forEach(function(model) {
          result.add(model.copy());
          // ensure embedded model graphs are part of the set
          this.eachEmbeddedRelative(model, function(embeddedModel) {
            // updated adapter level tracking of embedded parents
            this._embeddedManager.updateParents(embeddedModel);

            if (result.contains(embeddedModel)) { return; }
            var copy = embeddedModel.copy();
            result.add(copy);
          }, this);
        }, this);
        return result;
      },

      findEmbeddedRoot: function(model, models) {
        var parent = model;
        while(parent) {
          model = parent;
          parent = this._embeddedManager.findParent(model);
        }
        // we want the version in the current session
        return models.getModel(model);
      },

      /**
        @private
        Traverses the entire embedded graph (including parents)
      */
      eachEmbeddedRelative: function(model, callback, binding, visited) {
        if(!visited) visited = new Ember.Set();
        if(visited.contains(model)) return;

        visited.add(model);
        callback.call(binding, model);

        this.serializerForModel(model).eachEmbeddedRecord(model, function(embeddedRecord, embeddedType) {
          this.eachEmbeddedRelative(embeddedRecord, callback, binding, visited);
        }, this);

        var parent = this._embeddedManager.findParent(model);
        if(parent) {
          this.eachEmbeddedRelative(parent, callback, binding, visited);
        }
      },

      /**
        Builds a URL from a context. A context can be one of three things:

        1. An instance of a model
        2. A string representing a type (typeKey), e.g. 'post'
        3. A hash containing both a typeKey and an id

        @method buildUrlFromContext
        @param {any} context
        @param {String} action
        @returns {String} url
      */
      buildUrlFromContext: function(context, action) {
        var typeKey, id;
        if(typeof context === 'string') {
          typeKey = context;
        } else {
          typeKey = get(context, 'typeKey');
          id = get(context, 'id');
        }
        var url = this.buildUrl(typeKey, id);
        if(action) {
          // TODO: hook to transform action name
          url = url + '/' + action;
        }
        return url;
      },

      /**
        Builds a URL for a given type and optional ID.

        By default, it pluralizes the type's name (for example, 'post'
        becomes 'posts' and 'person' becomes 'people'). To override the
        pluralization see [pathForType](#method_pathForType).

        If an ID is specified, it adds the ID to the path generated
        for the type, separated by a `/`.

        @method buildUrl
        @param {String} type
        @param {String} id
        @returns {String} url
      */
      buildUrl: function(typeKey, id) {
        var url = [],
            host = get(this, 'host'),
            prefix = this.urlPrefix();

        if (typeKey) { url.push(this.pathForType(typeKey)); }
        if (id) { url.push(id); }

        if (prefix) { url.unshift(prefix); }

        url = url.join('/');
        if (!host && url) { url = '/' + url; }

        return url;
      },

      /**
        @method urlPrefix
        @private
        @param {String} path
        @param {String} parentUrl
        @return {String} urlPrefix
      */
      urlPrefix: function(path, parentURL) {
        var host = get(this, 'host'),
            namespace = get(this, 'namespace'),
            url = [];

        if (path) {
          // Absolute path
          if (path.charAt(0) === '/') {
            if (host) {
              path = path.slice(1);
              url.push(host);
            }
          // Relative path
          } else if (!/^http(s)?:\/\//.test(path)) {
            url.push(parentURL);
          }
        } else {
          if (host) { url.push(host); }
          if (namespace) { url.push(namespace); }
        }

        if (path) {
          url.push(path);
        }

        return url.join('/');
      },

      /**
        Determines the pathname for a given type.

        By default, it pluralizes the type's name (for example,
        'post' becomes 'posts' and 'person' becomes 'people').

        ### Pathname customization

        For example if you have an object LineItem with an
        endpoint of "/line_items/".

        ```js
        Ep.RESTAdapter.reopen({
          pathForType: function(type) {
            var decamelized = Ember.String.decamelize(type);
            return Ember.String.pluralize(decamelized);
          };
        });
        ```

        @method pathForType
        @param {String} type
        @returns {String} path
      **/
      pathForType: function(type) {
        var camelized = Ember.String.camelize(type);
        return pluralize(camelized);
      },

      /**
        Takes an ajax response, and returns a relevant error.

        Returning a `Ep.InvalidError` from this method will cause the
        record to transition into the `invalid` state and make the
        `errors` object available on the record.

        ```javascript
        App.ApplicationAdapter = Ep.RESTAdapter.extend({
          ajaxError: function(jqXHR) {
            var error = this._super(jqXHR);

            if (jqXHR && jqXHR.status === 422) {
              var jsonErrors = Ember.$.parseJSON(jqXHR.responseText)["errors"];

              return new Ep.InvalidError(jsonErrors);
            } else {
              return error;
            }
          }
        });
        ```

        Note: As a correctness optimization, the default implementation of
        the `ajaxError` method strips out the `then` method from jquery's
        ajax response (jqXHR). This is important because the jqXHR's
        `then` method fulfills the promise with itself resulting in a
        circular "thenable" chain which may cause problems for some
        promise libraries.

        @method ajaxError
        @param  {Object} jqXHR
        @return {Object} jqXHR
      */
      ajaxError: function(jqXHR) {
        if (jqXHR && typeof jqXHR === 'object') {
          jqXHR.then = null;
        }

        return jqXHR;
      },

      /**
        Takes a URL, an HTTP method and a hash of data, and makes an
        HTTP request.

        When the server responds with a payload, Ember Data will call into `extractSingle`
        or `extractArray` (depending on whether the original query was for one record or
        many records).

        By default, `ajax` method has the following behavior:

        * It sets the response `dataType` to `"json"`
        * If the HTTP method is not `"GET"`, it sets the `Content-Type` to be
          `application/json; charset=utf-8`
        * If the HTTP method is not `"GET"`, it stringifies the data passed in. The
          data is the serialized record in the case of a save.
        * Registers success and failure handlers.

        @method ajax
        @private
        @param {String} url
        @param {String} type The request type GET, POST, PUT, DELETE etc.
        @param {Object} hash
        @return {Promise} promise
      */
      ajax: function(url, type, hash) {
        var adapter = this;

        return new Ember.RSVP.Promise(function(resolve, reject) {
          hash = adapter.ajaxOptions(url, type, hash);

          hash.success = function(json) {
            Ember.run(null, resolve, json);
          };

          hash.error = function(jqXHR, textStatus, errorThrown) {
            Ember.run(null, reject, adapter.ajaxError(jqXHR));
          };

          Ember.$.ajax(hash);
        }, "Ep: RestAdapter#ajax " + type + " to " + url);
      },

      /**
        @method ajaxOptions
        @private
        @param {String} url
        @param {String} type The request type GET, POST, PUT, DELETE etc.
        @param {Object} hash
        @return {Object} hash
      */
      ajaxOptions: function(url, type, hash) {
        hash = hash || {};
        hash.url = url;
        hash.type = type;
        hash.dataType = 'json';
        hash.context = this;

        if (hash.data && type !== 'GET') {
          hash.contentType = 'application/json; charset=utf-8';
          hash.data = JSON.stringify(hash.data);
        }

        var headers = get(this, 'headers');
        if (headers !== undefined) {
          hash.beforeSend = function (xhr) {
            forEach.call(Ember.keys(headers), function(key) {
              xhr.setRequestHeader(key, headers[key]);
            });
          };
        }


        return hash;
      }

    });
  });
define("epf/rest/rest_errors",
  ["../model/errors","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var get = Ember.get, set = Ember.set;

    var Errors = __dependency1__["default"];

    var RestErrors = Errors.extend({

      status: null,
      xhr: null,

      copy: function() {
        return RestErrors.create({
          content: Ember.copy(this.content),
          status: this.status,
          xhr: this.xhr
        });
      }

    });

    __exports__["default"] = RestErrors;
  });
define("epf/rest/serializers/errors",
  ["../rest_errors","../../serializers/base","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var get = Ember.get, set = Ember.set, isEmpty = Ember.isEmpty;

    var RestErrors = __dependency1__["default"];
    var Serializer = __dependency2__["default"];

    __exports__["default"] = Serializer.extend({

      deserialize: function(serialized, opts) {
        var xhr = opts && opts.xhr;
        
        if(!xhr && (isEmpty(serialized) || isEmptyObject(serialized))) return;
        
        var content = {};
        for(var key in serialized) {
          content[this.transformPropertyKey(key)] = serialized[key];
        }
        
        var res = RestErrors.create({
          content: content
        });
        
        if(xhr) {
          set(res, 'status', xhr.status);
          set(res, 'xhr', xhr);
        }
        
        return res;
      },
      
      transformPropertyKey: function(name) {
        return Ember.String.camelize(name);
      },

      serialize: function(id) {
        throw new Ember.Error("Errors are not currently serialized down to the server.");
      }

    });

    function isEmptyObject(obj) {
      return Ember.keys(obj).length === 0;
    }
  });
define("epf/rest/serializers/payload",
  ["../../utils/materialize_relationships","../../serializers/base","../payload","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __exports__) {
    "use strict";
    var get = Ember.get, set = Ember.set;

    var materializeRelationships = __dependency1__["default"];
    var Serializer = __dependency2__["default"];
    var Payload = __dependency3__["default"];__exports__["default"] = Serializer.extend({
      mergedProperties: ['aliases'],

      aliases: {},
      metaKey: 'meta',
      errorsKey: 'errors',

      singularize: function(name) {
        return Ember.String.singularize(name);
      },

      typeKeyFor: function(name) {
        var singular = this.singularize(name),
            aliases = get(this, 'aliases'),
            alias = aliases[name];
        return alias || singular;
      },

      rootForTypeKey: function(typeKey) {
        return typeKey;
      },

      /**
        Note: we serialize a model, but we deserialize
        to a payload object.
      */
      serialize: function(model) {
        var typeKey = get(model, 'typeKey'),
            root = this.rootForTypeKey(typeKey),
            res = {},
            serializer = this.serializerFor(typeKey);
        res[root] = serializer.serialize(model);
        return res;
      },

      deserialize: function(hash, opts) {
        opts = opts || {};
        var result = Payload.create(),
            metaKey = get(this, 'metaKey'),
            errorsKey = get(this, 'errorsKey'),
            context = opts.context,
            xhr = opts.xhr;

        if(context && typeof context === 'string') {
          set(result, 'context', []);
        }

        /**
          If a context for the payload has been specified
          we need to check each model to see if it is/belongs in
          the context
        */
        function checkForContext(model) {
          if(context) {
            if(typeof context === 'string' && typeKey === context) {
              // context is a typeKey (e.g. for a query)
              result.context.push(model);
            } else if(get(context, 'isModel') && context.isEqual(model)) {
              // context is a model
              result.context = model;
            }
          }
        }

        for (var prop in hash) {
          if (!hash.hasOwnProperty(prop)) {
            continue;
          }

          if(prop === metaKey) {
            result.meta = hash[prop];
            continue;
          }

          var value = hash[prop];

          if(prop === errorsKey) {
            var serializer = this.serializerFor('errors', opts),
                errors = serializer.deserialize(value, opts);
            result.errors = errors;
            continue;
          }

          var typeKey = this.typeKeyFor(prop),
              serializer = this.serializerFor(typeKey);
          if (Ember.isArray(value)) {
            for (var i=0; i < value.length; i++) {
              var model = serializer.deserialize(value[i]);
              checkForContext(model);
              result.add(model);
            }
          } else {
            var model = serializer.deserialize(value);
            checkForContext(model);
            result.add(model);
          }
        }
        
        // Ensure that an errors object exists if the request
        // failed. Right now we just check the existence of an
        // xhr object (which is only set on error).
        if(xhr) {
          var errors = get(result, 'errors');
          if(!errors) {
            var serializer = this.serializerFor('errors'),
                errors = serializer.deserialize({}, opts);
            set(result, 'errors', errors);
          }
        }

        materializeRelationships(result, get(this, 'idManager'));

        return result;
      }

    });
  });
define("epf/serializers/base",
  ["./serializer_for_mixin","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var SerializerForMixin = __dependency1__["default"];

    __exports__["default"] = Ember.Object.extend(SerializerForMixin, {

      typeKey: null,

      serialize: Ember.required(),
      
      deserialize: Ember.required()

    });
  });
define("epf/serializers/belongs_to",
  ["./base","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var get = Ember.get, set = Ember.set;

    var Serializer = __dependency1__["default"];

    __exports__["default"] = Serializer.extend({

      typeFor: function(typeName) {
        return this.container.lookupFactory('model:' + typeName);
      },

      deserialize: function(serialized, opts) {
        if(!serialized) {
          return null;
        }
        if(!opts.embedded) {
          var idSerializer = this.serializerFor('id');
          serialized = {
            id: idSerializer.deserialize(serialized)
          };
          opts.reifyClientId = false;
        }
        return this.deserializeModel(serialized, opts);
      },

      deserializeModel: function(serialized, opts) {
        var serializer = this.serializerFor(opts.typeKey);
        return serializer.deserialize(serialized, opts);
      },

      serialize: function(model, opts) {
        if(!model) {
          return null;
        }
        if(opts.embedded) {
          return this.serializeModel(model, opts);
        }
        var idSerializer = this.serializerFor('id');
        return idSerializer.serialize(get(model, 'id'));
      },

      serializeModel: function(model, opts) {
        var serializer = this.serializerFor(opts.typeKey);
        return serializer.serialize(model);
      }

    });
  });
define("epf/serializers/boolean",
  ["./base","exports"],
  function(__dependency1__, __exports__) {
    "use strict";

    var Serializer = __dependency1__["default"];

    __exports__["default"] = Serializer.extend({
      deserialize: function(serialized) {
        var type = typeof serialized;

        if (type === "boolean") {
          return serialized;
        } else if (type === "string") {
          return serialized.match(/^true$|^t$|^1$/i) !== null;
        } else if (type === "number") {
          return serialized === 1;
        } else {
          return false;
        }
      },

      serialize: function(deserialized) {
        return Boolean(deserialized);
      }
    });
  });
define("epf/serializers/date",
  ["../ext/date","./base","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var Serializer = __dependency2__["default"];

    __exports__["default"] = Serializer.extend({

      deserialize: function(serialized) {
        var type = typeof serialized;

        if (type === "string") {
          return new Date(Ember.Date.parse(serialized));
        } else if (type === "number") {
          return new Date(serialized);
        } else if (serialized === null || serialized === undefined) {
          // if the value is not present in the data,
          // return undefined, not null.
          return serialized;
        } else {
          return null;
        }
      },

      serialize: function(date) {
        if (date instanceof Date) {
          var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
          var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

          var pad = function(num) {
            return num < 10 ? "0"+num : ""+num;
          };

          var utcYear = date.getUTCFullYear(),
              utcMonth = date.getUTCMonth(),
              utcDayOfMonth = date.getUTCDate(),
              utcDay = date.getUTCDay(),
              utcHours = date.getUTCHours(),
              utcMinutes = date.getUTCMinutes(),
              utcSeconds = date.getUTCSeconds();


          var dayOfWeek = days[utcDay];
          var dayOfMonth = pad(utcDayOfMonth);
          var month = months[utcMonth];

          return dayOfWeek + ", " + dayOfMonth + " " + month + " " + utcYear + " " +
                 pad(utcHours) + ":" + pad(utcMinutes) + ":" + pad(utcSeconds) + " GMT";
        } else {
          return null;
        }
      } 

    });
  });
define("epf/serializers/has_many",
  ["./base","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var empty = Ember.isEmpty;

    var Serializer = __dependency1__["default"];

    __exports__["default"] = Serializer.extend({

      typeFor: function(typeName) {
        return this.container.lookupFactory('model:' + typeName);
      },

      deserialize: function(serialized, opts) {
        if(!serialized) return [];
        if(!opts.embedded) {
          var idSerializer = this.serializerFor('id');
          serialized = serialized.map(function(id) {
            return {
              id: id
            };
          }, this);
          opts.reifyClientId = false;
        }
        return this.deserializeModels(serialized, opts);
      },

      deserializeModels: function(serialized, opts) {
        var serializer = this.serializerFor(opts.typeKey);
        return serialized.map(function(hash) {
          return serializer.deserialize(hash, opts);
        });
      },

      serialize: function(models, opts) {
        if(opts.embedded) {
          return this.serializeModels(models, opts);
        }
        return undefined;
      },

      serializeModels: function(models, opts) {
        var serializer = this.serializerFor(opts.typeKey);
        return models.map(function(model) {
          return serializer.serialize(model);
        });
      }
      
    });
  });
define("epf/serializers/id",
  ["./base","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Serializer = __dependency1__["default"];

    __exports__["default"] = Serializer.extend({

      deserialize: function(serialized) {
        if(serialized === undefined || serialized === null) return;
        return serialized+'';
      },

      serialize: function(id) {
        if (isNaN(id) || id === null) { return id; }
        return +id;
      }

    });
  });
define("epf/serializers/model",
  ["../rest/embedded_helpers_mixin","./base","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var get = Ember.get, set = Ember.set;

    var EmbeddedHelpersMixin = __dependency1__["default"];

    var Serializer = __dependency2__["default"];

    __exports__["default"] = Serializer.extend(EmbeddedHelpersMixin, {
      mergedProperties: ['properties'],

      /**
        Specifies configurations for individual properties.

        For example:

        ```
        App.PostSerializer = Epf.JsonSerializer.extend({
          properties: {
            title: {
              key: 'TITLE1'
            }
          }
        });
        ```

        @property properties
      */
      properties: {},

      /**
        @private
        Used to cache key to property mappings
      */
      _keyCache: null,

      /**
        @private
        Used to cache property name to key mappings
      */
      _nameCache: null,

      init: function() {
        this._super();
        this._keyCache = {};
        this._nameCache = {};
      },

      /**
        @private

        Looks up the property name corresponding to the
        given key.
      */
      nameFor: function(key) {
        var name;
        if(name = this._nameCache[key]) {
          return name;
        }
        var configs = get(this, 'properties');
        for(var currentName in configs) {
          var current = configs[name];
          var keyName = current.key;
          if(keyName && key === keyName) {
            name = currentName;
          }
        }
        name = name || Ember.String.camelize(key);
        this._nameCache[key] = name;
        return name;
      },

      configFor: function(name) {
        return this.properties[name] || {};
      },

      keyFor: function(name, type, opts) {
        var key;
        if(key = this._keyCache[name]) {
          return key;
        }

        var config = this.configFor(name);
        key = config.key || this.keyForType(name, type, opts);
        this._keyCache[name] = key;
        return key;
      },

      keyForType: function(name, type, opts) {
        return Ember.String.underscore(name);
      },

      /**
        @private

        Determines the singular root name for a particular type.

        This is an underscored, lowercase version of the model name.
        For example, the type `App.UserGroup` will have the root
        `user_group`.

        @param {Ep.Model subclass} type
        @returns {String} name of the root element
      */
      rootForType: function(type) {
        return get(type, 'typeKey');
      },

      serialize: function(model) {
        var serialized = {};

        this.addMeta(serialized, model);
        this.addAttributes(serialized, model);
        this.addRelationships(serialized, model);

        return serialized;
      },

      addMeta: function(serialized, model) {
        this.addProperty(serialized, model, 'id', 'id');
        this.addProperty(serialized, model, 'clientId', 'string');
        this.addProperty(serialized, model, 'rev', 'revision');
        this.addProperty(serialized, model, 'clientRev', 'revision');
      },

      addAttributes: function(serialized, model) {
        model.eachLoadedAttribute(function(name, attribute) {
          // do not include transient properties
          if(attribute.options.transient) return;
          this.addProperty(serialized, model, name, attribute.type);
        }, this);
      },

      addRelationships: function(serialized, model) {
        model.eachLoadedRelationship(function(name, relationship) {
          var config = this.configFor(name),
              opts = {typeKey: relationship.typeKey, embedded: config.embedded},
              // we dasherize the kind for lookups for consistency
              kindKey = Ember.String.dasherize(relationship.kind);
          this.addProperty(serialized, model, name, kindKey, opts);
        }, this);
      },

      addProperty: function(serialized, model, name, type, opts) {
        var key = this.keyFor(name, type, opts),
            value = get(model, name),
            serializer;

        if(type) {
          serializer = this.serializerFor(type);
        }
        if(serializer) {
          value = serializer.serialize(value, opts);
        }
        if(value !== undefined) {
          serialized[key] = value;
        }
      },

      deserialize: function(hash, opts) {
        var model = this.createModel();

        this.extractMeta(model, hash, opts);
        this.extractAttributes(model, hash);
        this.extractRelationships(model, hash);

        return model;
      },

      extractMeta: function(model, hash, opts) {
        this.extractProperty(model, hash, 'id', 'id');
        this.extractProperty(model, hash, 'clientId', 'string');
        this.extractProperty(model, hash, 'rev', 'revision');
        this.extractProperty(model, hash, 'clientRev', 'revision');
        this.extractProperty(model, hash, 'errors', 'errors');
        if(!opts || opts.reifyClientId !== false) {
          this.idManager.reifyClientId(model);
        }
      },

      extractAttributes: function(model, hash) {
        model.eachAttribute(function(name, attribute) {
          this.extractProperty(model, hash, name, attribute.type);
        }, this);
      },

      extractRelationships: function(model, hash) {
        model.eachRelationship(function(name, relationship) {
          var config = this.configFor(name),
              opts = {typeKey: relationship.typeKey, embedded: config.embedded},
              // we dasherize the kind for lookups for consistency
              kindKey = Ember.String.dasherize(relationship.kind);
          this.extractProperty(model, hash, name, kindKey, opts);
        }, this);
      },

      extractProperty: function(model, hash, name, type, opts) {
        var key = this.keyFor(name, type, opts),
            value = hash[key],
            serializer;
        if(typeof value === 'undefined') {
          return;
        }
        if(type) {
          serializer = this.serializerFor(type);
        }
        if(serializer) {
          value = serializer.deserialize(value, opts);
        }
        if(typeof value !== 'undefined') {
          set(model, name, value);
        }
      },

      createModel: function() {
        return this.typeFor(this.typeKey).create();
      },

      typeFor: function(typeKey) {
        return this.container.lookupFactory('model:' + typeKey);
      }

    });
  });
define("epf/serializers/number",
  ["./base","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var empty = Ember.isEmpty;

    var Serializer = __dependency1__["default"];

    __exports__["default"] = Serializer.extend({

      deserialize: function(serialized) {
        return empty(serialized) ? null : Number(serialized);
      },

      serialize: function(deserialized) {
        return empty(deserialized) ? null : Number(deserialized);
      }
    });
  });
define("epf/serializers/revision",
  ["./base","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var empty = Ember.isEmpty;

    var Serializer = __dependency1__["default"];

    __exports__["default"] = Serializer.extend({

      deserialize: function(serialized) {
        return serialized ? serialized : undefined;
      },

      serialize: function(deserialized) {
        return deserialized ? deserialized : undefined;
      }
    });
  });
define("epf/serializers/serializer_for_mixin",
  ["exports"],
  function(__exports__) {
    "use strict";
    var get = Ember.get, set = Ember.set;

    __exports__["default"] = Ember.Mixin.create({

      serializerFor: function(typeKey) {
                var serializer = this.container.lookup('serializer:' + typeKey);
        // if no serializer exists and this typeKey corresponds to a model
        // then create a default serializer
        if(!serializer) {
          var modelExists = !!this.container.lookupFactory('model:' + typeKey);
          if(!modelExists) return;
          var Serializer = this.container.lookupFactory('serializer:model');
          this.container.register('serializer:' + typeKey, Serializer);
          serializer = this.container.lookup('serializer:' + typeKey);
        }

        if (!serializer.typeKey) {
          serializer.typeKey = typeKey;
        }

        return serializer;
      },

      serializerForType: function(type) {
        return this.serializerFor(get(type, 'typeKey'));
      },

      serializerForModel: function(model) {
        var type = get(model, 'type');
        return this.serializerForType(type);
      }

    });
  });
define("epf/serializers/string",
  ["./base","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var none = Ember.isNone, empty = Ember.isEmpty;

    var Serializer = __dependency1__["default"];

    __exports__["default"] = Serializer.extend({

      deserialize: function(serialized) {
        return none(serialized) ? null : String(serialized);
      },

      serialize: function(deserialized) {
        return none(deserialized) ? null : String(deserialized);
      }

    });
  });
define("epf/session/cache",
  ["exports"],
  function(__exports__) {
    "use strict";
    var get = Ember.get, set = Ember.set;

    /**
      Maintains a cache of model-related promises
    */
    __exports__["default"] = Ember.Object.extend({

      _data: null,

      init: function() {
        this._data = {};
      },

      addModel: function(model) {
        // for now we only add the model if some attributes are loaded,
        // eventually this will be on a per-attribute basis
        if(model.anyPropertiesLoaded()) {
          this.addPromise(model, Ember.RSVP.resolve());
        }
      },

      removeModel: function(model) {
        delete this._data[get(model, 'clientId')];
      },

      addPromise: function(model, promise) {
        this._data[get(model, 'clientId')] = promise;
      },

      getPromise: function(model) {
                return this._data[get(model, 'clientId')];
      }

    });
  });
define("epf/session/child_session",
  ["./session","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var get = Ember.get, set = Ember.set;

    var Session = __dependency1__["default"];


    /**
      Child sessions are useful to keep changes isolated
      from parent sessions until flush time.
    */
    __exports__["default"] = Session.extend({

      merge: function(model, visited) {
        var parentModel = this.parent.merge(model, visited);
        return this._super(parentModel, visited);
      },

      /**
        @private

        Child sessions dynamically copy down data from parent.
      */
      getModel: function(model) {
        var res = this._super(model);
        if(!res) {
          res = get(this, 'parent').getModel(model);
          if(res) {
            res = this.adopt(res.copy());
            // TODO: is there a better place for this?
            this.updateCache(res);
          }
        }
        return res;
      },

      /**
        @private

        Child sessions dynamically copy down data from parent.
      */
      getForClientId: function(clientId) {
        var res = this._super(clientId);
        if(!res) {
          res = get(this, 'parent').getForClientId(clientId);
          if(res) {
            res = this.adopt(res.copy());
            // TODO: is there a better place for this?
            this.updateCache(res);
          }
        }
        return res;
      },

      /**
        Update the parent session with all changes local
        to this child session.
      */
      updateParent: function() {
        // flush all local updates to the parent session
        var dirty = get(this, 'dirtyModels'),
            parent = get(this, 'parent');
        
        dirty.forEach(function(model) {
          // XXX: we want to do this, but we need to think about
          // revision numbers. The parent's clientRev needs to tbe
          // the childs normal rev.

          // "rebase" against parent version
          // var parentModel = parent.getModel(model);
          // if(parentModel) {
          //   this.merge(parentModel);
          // }
          
          // update the values of a corresponding model in the parent session
          // if a corresponding model doesn't exist, its added to the parent session
          parent.update(model); 
        }, this);
      },

      /**
        Similar to `flush()` with the additional effect that the models will
        be immediately updated in the parent session. This is useful when
        you want to optimistically assume success.
      */
      flushIntoParent: function() {
        this.updateParent();
        return this.flush();
      }


    });
  });
define("epf/session/collection_manager",
  ["exports"],
  function(__exports__) {
    "use strict";
    var get = Ember.get, set = Ember.set;

    __exports__["default"] = Ember.Object.extend({

      init: function() {
        this.modelMap = Ember.MapWithDefault.create({
          defaultValue: function() { return Ember.A([]); }
        });
      },

      register: function(array, model) {
        var arrays = this.modelMap.get(get(model, 'clientId'));
        if(arrays.contains(array)) return;
        arrays.pushObject(array);
      },

      unregister: function(array, model) {
        var arrays = this.modelMap.get(get(model, 'clientId'));
        arrays.removeObject(array);
        if(arrays.length === 0) {
          this.modelMap.remove(get(model, 'clientId'));
        }
      },

      modelWasDeleted: function(model) {
        // copy since the observers will mutate
        var arrays = this.modelMap.get(get(model, 'clientId')).copy();
        arrays.forEach(function(array) {
          array.removeObject(model);
        });
      }

    });
  });
define("epf/session/inverse_manager",
  ["../collections/model_set","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var get = Ember.get, set = Ember.set;

    var ModelSet = __dependency1__["default"];

    __exports__["default"] = Ember.Object.extend({
      
      session: null,

      init: function() {
        this.map = Ember.MapWithDefault.create({
          defaultValue: function() {
            return Ember.MapWithDefault.create({
              defaultValue: function() { return ModelSet.create(); }
            });
          }
        });
      },
      
      register: function(model) {
        var clientId = get(model, 'clientId');
        var session = get(this, 'session');
        
        model.eachLoadedRelationship(function(name, relationship) {
          // this is a copy that we mutate
          var existingInverses = this.map.get(clientId).get(name),
              inversesToClear = existingInverses.copy();
              
          function checkInverse(inverseModel) {
            session.reifyClientId(inverseModel);
            if(existingInverses.contains(inverseModel)) {
              // nothing to do, already registered
            } else {
              this.registerRelationship(model, name, inverseModel);
            }
            inversesToClear.remove(inverseModel);
          }    
          
          if(relationship.kind === 'belongsTo') {
            var inverseModel = get(model, name);
            if(inverseModel) {
              checkInverse.call(this, inverseModel);
            }
          } else if(relationship.kind === 'hasMany') {
            var inverseModels = get(model, name);
            inverseModels.forEach(function(inverseModel) {
              checkInverse.call(this, inverseModel);
            }, this);
          }
          
          inversesToClear.forEach(function (inverseModel) {
            this.unregisterRelationship(model, name, inverseModel);
          }, this);
        }, this);
      },
      
      unregister: function (model) {
        var clientId = get(model, 'clientId'), inverses = this.map.get(clientId);
        inverses.forEach(function (name, inverseModels) {
          var copiedInverseModels = Ember.copy(inverseModels);
          copiedInverseModels.forEach(function (inverseModel) {
            this.unregisterRelationship(model, name, inverseModel);
          }, this);
        }, this);
        this.map.remove(clientId);
      },
      
      registerRelationship: function(model, name, inverseModel) {
        var inverse = get(model, 'type').inverseFor(name);
        
        this.map.get(get(model, 'clientId')).get(name).addObject(inverseModel);
        if(inverse) {
          this.map.get(get(inverseModel, 'clientId')).get(inverse.name).addObject(model);
          this._addToInverse(inverseModel, inverse, model);
        }
      },
      
      unregisterRelationship: function(model, name, inverseModel) {
        var inverse =  get(model, 'type').inverseFor(name);
        
        this.map.get(get(model, 'clientId')).get(name).removeObject(inverseModel);
        if(inverse) {
          this.map.get(get(inverseModel, 'clientId')).get(inverse.name).removeObject(model);
          this._removeFromInverse(inverseModel, inverse, model);
        }
      },

      _addToInverse: function(model, inverse, inverseModel) {
        model = this.session.models.getModel(model);
        // make sure the inverse is loaded
        if(!model || !model.isPropertyLoaded(inverse.name)) return;
        model.suspendRelationshipObservers(function() {
          if(inverse.kind === 'hasMany') {
            get(model, inverse.name).addObject(inverseModel)
          } else if(inverse.kind === 'belongsTo') {
            set(model, inverse.name, inverseModel);
          }
        }, this);
      },
      
      _removeFromInverse: function(model, inverse, inverseModel) {
        model = this.session.models.getModel(model);
        // make sure the inverse is loaded
        if(!model || !model.isPropertyLoaded(inverse.name)) return;
        model.suspendRelationshipObservers(function() {
          if(inverse.kind === 'hasMany') {
            get(model, inverse.name).removeObject(inverseModel)
          } else if(inverse.kind === 'belongsTo') {
            set(model, inverse.name, null);
          }
        }, this);
      },

    });
  });
define("epf/session/merge",
  ["../collections/model_array","./session"],
  function(__dependency1__, __dependency2__) {
    "use strict";
    var get = Ember.get, set = Ember.set;

    var ModelArray = __dependency1__["default"];
    var Session = __dependency2__["default"];

    Session.reopen({

      mergeStrategyFor: function(typeKey) {
                var mergeStrategy = this.container.lookup('merge-strategy:' + typeKey);
        // if none exists, create and register a default
        if(!mergeStrategy) {
          var Strategy = this.container.lookupFactory('merge-strategy:default');
          this.container.register('merge-strategy:' + typeKey, Strategy);
          mergeStrategy = this.container.lookup('merge-strategy:' + typeKey);
        }
        mergeStrategy.typeKey = typeKey;
        return mergeStrategy;
      },

      /**
        Merges new data for a model into this session.

        If the corresponding model inside the session is "dirty"
        and has not been successfully flushed, the local changes
        will be merged against these changes.

        By default, if no server versioning information is specified,
        this data is assumed to be more current than what is in
        the session. If no client versioning information is specified,
        this data is assumed to have not seen the latest client changes.

        @method merge
        @param {Ep.Model} model The model to merge
        @param {Ember.Set} [visited] Cache used to break recursion. This is required for non-version-aware backends.
      */
      merge: function(model, visited) {
        this.reifyClientId(model);

        if(!visited) visited = new Ember.Set();

        if(visited.contains(model)) {
          return this.getModel(model);
        }
        visited.add(model);

        var adapter = get(this, 'adapter');
        adapter.willMergeModel(model);

        this.updateCache(model);

        var detachedChildren = [];
        // Since we re-use objects during merge if they are detached,
        // we need to precompute all detached children
        model.eachChild(function(child) {
          if(get(child, 'isDetached')) {
            detachedChildren.push(child);
          }
        }, this);

        var merged;

        if(get(model, 'hasErrors')) {
          merged = this._mergeError(model);
        } else {
          merged = this._mergeSuccess(model);
        }

        if(model.meta){
          merged.meta = model.meta;
        }
        
        for(var i = 0; i < detachedChildren.length; i++) {
          var child = detachedChildren[i];
          this.merge(child, visited);
        }

        adapter.didMergeModel(model);
        return merged;
      },

      mergeModels: function(models) {
        var merged = ModelArray.create({session: this, content: []});
        merged.meta = models.meta;
        var session = this;
        models.forEach(function(model) {
          merged.pushObject(session.merge(model));
        });
        return merged;
      },

      _mergeSuccess: function(model) {
        var models = get(this, 'models'),
            shadows = get(this, 'shadows'),
            newModels = get(this, 'newModels'),
            originals = get(this, 'originals'),
            merged,
            ancestor,
            existing = models.getModel(model);

        if(existing && this._containsRev(existing, model)) {
          return existing;
        }

        var hasClientChanges = !existing || this._containsClientRev(model, existing);

        if(hasClientChanges) {
          // If has latest client rev, merge against the shadow
          ancestor = shadows.getModel(model);
        } else {
          // If doesn't have the latest client rev, merge against original
          ancestor = originals.getModel(model);
        }

        this.suspendDirtyChecking(function() {
          merged = this._mergeModel(existing, ancestor, model);
        }, this);

        if(hasClientChanges) {
          // after merging, if the record is deleted, we remove
          // it entirely from the session
          if(get(merged, 'isDeleted')) {
            this.remove(merged);
          } else {
            // After a successful merge we update the shadow to the
            // last known value from the server. As an optimization,
            // we only create shadows if the model has been dirtied.
            if(shadows.contains(model)) {
              // TODO: should remove unless client has unflushed changes
              shadows.addData(model);
            }

            // Once the server has seen our local changes, the original
            // is no longer needed
            originals.remove(model);

            if(!get(merged, 'isNew')) {
              newModels.remove(merged);
            }
          }
        } else {
          // TODO: what should we do with the shadow if the merging ancestor
          // is the original? In order to update, it would require knowledge
          // of how the server handles merging (if at all)
        }
        
        // clear the errors on the merged model
        // TODO: we need to do a proper merge here
        set(merged, 'errors', null);
        
        return merged;
      },

      _mergeError: function(model) {
        var models = get(this, 'models'),
            shadows = get(this, 'shadows'),
            newModels = get(this, 'newModels'),
            originals = get(this, 'originals'),
            merged,
            ancestor,
            existing = models.getModel(model);

        if(!existing) {
          // Two cases where this would happen:
          // 1. Load errors
          // 2. Error during create inside child session
          return model;
        }

        var hasClientChanges = this._containsClientRev(model, existing);
        if(hasClientChanges) {
          // If has latest client rev, merge against the shadow.

          // If a shadow does not exist this could be an error during
          // a create operation. In this case, if the server has seen
          // the client's changes we should merge using the new model
          // as the ancestor. This case could happen if the server manipulates
          // the response to return valid values without saving.
          ancestor = shadows.getModel(model) || existing;
        } else {
          // If doesn't have the latest client rev, merge against original
          ancestor = originals.getModel(model);
        }

        // only merge if we haven't already seen this version
        if(ancestor && !this._containsRev(existing, model)) {
          this.suspendDirtyChecking(function() {
            merged = this._mergeModel(existing, ancestor, model);
          }, this);
        } else {
          merged = existing;
        }

        // set the errors on the merged model
        // TODO: we need to do a proper merge here
        set(merged, 'errors', Ember.copy(get(model, 'errors')));
     
        if(!get(model, 'isNew')) {
          // "rollback" the shadow to have what was returned by the server
          shadows.addData(model);

          // the shadow is now the server version, so no reason to
          // keep the original around
          originals.remove(model);
        }

        return merged;
      },

      _mergeModel: function(dest, ancestor, model) {
        //Ember.assert("Cannot merge a model into it's own session", dest !== model);

        // if the model does not exist, no "merging"
        // is required
        if(!dest) {
          if(get(model, 'isDetached')) {
            dest = model;
          } else {
            dest = model.copy();
          }

          this.adopt(dest);
          return dest;
        }

        // set id for new records
        set(dest, 'id', get(model, 'id'));
        set(dest, 'clientId', get(model, 'clientId'));
        // copy the server revision
        set(dest, 'rev', get(model, 'rev'));
        set(dest, 'isDeleted', get(model, 'isDeleted'));

        //XXX: why do we need this? at this point shouldn't the dest always be in
        // the session?
        this.adopt(dest);

        // as an optimization we might not have created a shadow
        if(!ancestor) {
          ancestor = dest;
        }
        
        // Reify child client ids before merging. This isn't semantically
        // required, but many data structures that might be used in the merging
        // process use client ids.
        model.eachChild(function(child) {
          this.reifyClientId(child);
        }, this);

        var strategy = this.mergeStrategyFor(get(model, 'type.typeKey'));
        strategy.merge(dest, ancestor, model);

        return dest;
      },

      _containsRev: function(modelA, modelB) {
        if(!get(modelA, 'rev')) return false;
        if(!get(modelB, 'rev')) return false;
        return get(modelA, 'rev') >= get(modelB, 'rev');
      },

      _containsClientRev: function(modelA, modelB) {
        return get(modelA, 'clientRev') >= get(modelB, 'clientRev');
      }

    });
  });
define("epf/session/session",
  ["../collections/model_array","../collections/model_set","./collection_manager","./inverse_manager","../model/model","../model/promise","./cache","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__, __dependency6__, __dependency7__, __exports__) {
    "use strict";
    var ModelArray = __dependency1__["default"];
    var ModelSet = __dependency2__["default"];
    var CollectionManager = __dependency3__["default"];
    var InverseManager = __dependency4__["default"];
    var Model = __dependency5__["default"];
    var ModelPromise = __dependency6__["default"];
    var Cache = __dependency7__["default"];

    var get = Ember.get, set = Ember.set;

    var PromiseArray = Ember.ArrayProxy.extend(Ember.PromiseProxyMixin);

    __exports__["default"] = Ember.Object.extend({
      _dirtyCheckingSuspended: false,

      init: function() {
        this._super.apply(this, arguments);
        this.models = ModelSet.create();
        this.collectionManager = CollectionManager.create();
        this.inverseManager = InverseManager.create({session: this});
        this.shadows = ModelSet.create();
        this.originals = ModelSet.create();
        this.newModels = ModelSet.create();
        this.cache = Cache.create();
      },

      /**
        Instantiates a model but does *not* add it to the session. This is equivalent
        to calling `create` on the model's class itself.
        
        @method create
        @param {String} type the typeKey of the model
        @param {Object} hash the initial attributes of the model
        @return {Model} the instantiated model
      */
      build: function(type, hash) {
        type = this.typeFor(type);
        var model = type.create(hash || {});
        return model;
      },

      /**
        Creates a model within the session.
        
        @method create
        @param {String} type the typeKey of the model
        @param {Object} hash the initial attributes of the model
        @return {Model} the created model
      */
      create: function(type, hash) {
        var model = this.build(type, hash);
        return this.add(model);
      },

      adopt: function(model) {
        this.reifyClientId(model);
                
        if(get(model, 'isNew')) {
          this.newModels.add(model);
        }
        // Only loaded models are stored on the session
        if(!get(model, 'session')) {
          this.models.add(model);
          // Need to register with the inverse manager before being added to the
          // session. Otherwise, in a child session, the entire graph will be
          // materialized.
          this.inverseManager.register(model);
        }
        set(model, 'session', this);
        return model;
      },

      /**
        Adds a model to this session. Some cases below:

        If the model is detached (meaning not currently associated with a session),
        then the model will be re-used in this session. The entire graph of detached
        objects will be traversed and added to the session.

        If the model is already associated with this session in *loaded form* (not necessarily
        the same instance that is passed in), this method is a NO-OP.

        If the model is already associated with a *different* session then the model
        will be copied to this session. In order to prevent large graphs from being
        copied, all relations will be copied in lazily.

        TODO: when adding *non-new* models we should think through the semantics.
        For now we assume this only works with new models or models from a parent session.

        @method add
        @param {Ep.Model} model The model to add to the session
      */
      add: function(model) {
        this.reifyClientId(model);

        var dest = this.getModel(model);
        if(dest) return dest;
        
        if(get(model, 'session') === this) return model;

        // If new and detached we can re-use. If the model is
        // detached but *not* new we have undefined semantics
        // so for the time being we just create a lazy copy.
        if(get(model, 'isNew') && get(model, 'isDetached')) {
          dest = model;
        } else if(get(model, 'isNew')) {
          dest = model.copy();
          // TODO: we need to recurse here for new children, otherwise
          // they will become lazy
        } else {
          // TODO: model copy creates lazy copies for the
          // relationships. How do we update the inverse here?
          dest = model.lazyCopy();
        }
        return this.adopt(dest);
      },

      /**
        Removes the model from the session.

        This does not mean that the model has been necessarily deleted,
        just that the session should no longer keep track of it.

        @method remove
        @param {Ep.Model} model The model to remove from the session
      */
      remove: function(model) {
        // TODO: think through relationships that still reference the model
        get(this, 'models').remove(model);
        get(this, 'shadows').remove(model);
        get(this, 'originals').remove(model);
      },

      /**
        Updates a model in this session using the passed in model as a reference.

        If the passed in model is not already associated with this session, this
        is equivalent to adding the model to the session.

        If the model already is associated with this session, then the existing
        model will be updated.

        @method update
        @param {Ep.Model} model A model containing updated properties
      */
      update: function(model) {
        this.reifyClientId(model);
        var dest = this.getModel(model);

        if(get(model, 'isNew') && !dest) {
          dest = get(model, 'type').create();
          // need to set the clientId for adoption
          set(dest, 'clientId', get(model, 'clientId'));
          this.adopt(dest);
        }

        // if the model is detached or does not exist
        // in the target session, updating is semantically
        // equivalent to adding
        if(get(model, 'isDetached') || !dest) {
          return this.add(model);
        }

        // handle deletion
        if(get(model, 'isDeleted')) {
          // no-op if already deleted
          if(!get(dest, 'isDeleted')) {
            this.deleteModel(dest);
          }
          return dest;
        }

        model.copyAttributes(dest);
        model.copyMeta(dest);

        model.eachLoadedRelationship(function(name, relationship) {
          if(relationship.kind === 'belongsTo') {
            var child = get(model, name);
            if(child) {
              set(dest, name, child);
            }
          } else if(relationship.kind === 'hasMany') {
            var children = get(model, name);
            var destChildren = get(dest, name);
            children.copyTo(destChildren);
          }
        }, this);

        return dest;
      },

      deleteModel: function(model) {
        // if the model is new, deleting should essentially just
        // remove the object from the session
        if(get(model, 'isNew')) {
          var newModels = get(this, 'newModels');
          newModels.remove(model);
        } else {
          this.modelWillBecomeDirty(model);
        }
        set(model, 'isDeleted', true);
        this.collectionManager.modelWasDeleted(model);
        this.inverseManager.unregister(model);
      },

      /**
        Returns the model corresponding to the given typeKey and id
        or instantiates a new model if one does not exist.

        @returns {Model}
      */
      fetch: function(type, id) {
        type = this.typeFor(type);
        var typeKey = get(type, 'typeKey');
        // Always coerce to string
        id = id+'';

        var model = this.getForId(typeKey, id);
        // XXX: add isLoaded flag to model
        if(!model) {
          model = this.build(typeKey, {id: id});
          this.adopt(model);
        }

        return model;
      },

      /**
        Loads the model corresponding to the given typeKey and id.

        @returns {Promise}
      */
      load: function(type, id, opts) {
        var model = this.fetch(type, id);
        return this.loadModel(model, opts);
      },

      /**
        Ensures data is loaded for a model.

        @returns {Promise}
      */
      loadModel: function(model, opts) {
                // TODO: this should be done on a per-attribute bases
        var promise = this.cache.getPromise(model);

        if(promise) {
          // the cache's promise is not guaranteed to return anything
          promise = promise.then(function() {
            return model;
          });
        } else {
          // XXX: refactor adapter api to use model
          promise = this.adapter.load(model, opts, this);
          this.cache.addPromise(model, promise);
        }

        promise = ModelPromise.create({
          content: model,
          promise: promise
        });

        return promise;
      },

      find: function(type, query, opts) {
        if (Ember.typeOf(query) === 'object') {
          return this.query(type, query, opts);
        }
        return this.load(type, query, opts);
      },

      query: function(type, query, opts) {
        type = this.typeFor(type);
        var typeKey = get(type, 'typeKey');
        // TODO: return a model array immediately here
        // and also take into account errors
        var prom = this.adapter.query(typeKey, query, opts, this);
        return PromiseArray.create({promise:prom});
      },

      refresh: function(model, opts) {
        var session = this;
        return this.adapter.load(model, opts, this);
      },

      flush: function() {
        var session = this,
            dirtyModels = get(this, 'dirtyModels'),
            newModels = get(this, 'newModels'),
            shadows = get(this, 'shadows');

        // increment client revisions for all models
        // that could potentially be flushed
        dirtyModels.forEach(function(model) {
          model.incrementProperty('clientRev');
        }, this);
        
        // the adapter will return a list of models regardless
        // of whether the flush succeeded. it is in the merge
        // logic that the errors property of the model is consumed
        var promise = this.adapter.flush(this);

        // Optimistically assume updates will be
        // successful. Copy shadow models into
        // originals and remove the shadow.
        dirtyModels.forEach(function(model) {
          // track original to merge against new data that
          // hasn't seen client updates
          var original = this.originals.getModel(model);
          var shadow = this.shadows.getModel(model);
          if(shadow && (!original || original.get('rev') < shadow.get('rev'))) {
            this.originals.add(shadow);
          }
          this.markClean(model);
        }, this);
        newModels.clear();

        return promise;
      },

      getModel: function(model) {
        return this.models.getModel(model);
      },

      getForId: function(typeKey, id) {
        var clientId = this.idManager.getClientId(typeKey, id);
        return this.getForClientId(clientId);
      },

      getForClientId: function(clientId) {
        return this.models.getForClientId(clientId);
      },

      reifyClientId: function(model) {
        this.idManager.reifyClientId(model);
      },

      remoteCall: function(context, name, params, opts) {
        var session = this;

        if(opts && opts.deserializationContext && typeof opts.deserializationContext !== 'string') {
          opts.deserializationContext = get(opts.deserializationContext, 'typeKey');
        }

        return this.adapter.remoteCall(context, name, params, opts, this);
      },

      modelWillBecomeDirty: function(model) {
        if(this._dirtyCheckingSuspended) {
          return;
        }
        this.touch(model);
      },

      destroy: function() {
        this._super();
        this.models.forEach(function(model) {
          model.destroy();
        });
        this.models.destroy();
        this.collectionManager.destroy();
        this.inverseManager.destroy();
        this.shadows.destroy();
        this.originals.destroy();
        this.newModels.destroy();
      },

      dirtyModels: Ember.computed(function() {
        var models = ModelSet.fromArray(this.shadows.map(function(model) {
          return this.models.getModel(model);
        }, this));

        get(this, 'newModels').forEach(function(model) {
          models.add(model);
        });

        return models;
      }).property('shadows.[]', 'newModels.[]'),

      suspendDirtyChecking: function(callback, binding) {
        var self = this;

        // could be nested
        if(this._dirtyCheckingSuspended) {
          return callback.call(binding || self);
        }

        try {
          this._dirtyCheckingSuspended = true;
          return callback.call(binding || self);
        } finally {
          this._dirtyCheckingSuspended = false;
        }
      },

      newSession: function() {
        var Child = this.container.lookupFactory('session:child');
        var child = Child.create({
          parent: this,
          adapter: this.adapter
        });
        return child;
      },

      /**
        Returns a model class for a particular key. Used by
        methods that take a type key (like `create`, `load`,
        etc.)

        @method typeFor
        @param {String} key
        @returns {subclass of DS.Model}
      */
      typeFor: function(key) {
        if (typeof key !== 'string') {
          return key;
        }

        var factory = this.container.lookupFactory('model:'+key);

        
        factory.session = this;
        factory.typeKey = key;

        return factory;
      },

      getShadow: function(model) {
        var shadows = get(this, 'shadows');
        var models = get(this, 'models');
        // shadows are only created when the model is dirtied,
        // if no model exists in the `shadows` property then
        // it is safe to assume the model has not been modified
        return shadows.getModel(model) || models.getModel(model);
      },

      /**
        @private

        Updates the promise cache
      */
      updateCache: function(model) {
        this.cache.addModel(model);
      },

      /**
        Invalidate the cache for a particular model. This has the
        effect of making the next `load` call hit the server.

        @method invalidate
        @param {Ep.Model} model
      */
      invalidate: function(model) {
        this.cache.removeModel(model);
      },

      /**
        Mark a model as clean. This will prevent future
        `flush` calls from persisting this model's state to
        the server until the model is marked dirty again.

        @method markClean
        @param {Ep.Model} model
      */
      markClean: function(model) {
        // as an optimization, model's without shadows
        // are assumed to be clean
        this.shadows.remove(model);
      },

      /**
        Mark a model as dirty. This will cause this model
        to be sent to the adapter during a flush.

        @method touch
        @param {Ep.Model} model
      */
      touch: function(model) {
        if(!get(model, 'isNew')) {
          var shadow = this.shadows.getModel(model);
          if(!shadow) {
            this.shadows.addObject(model.copy())
          }
        }
      },


      /**
        Whether or not the session is dirty.

        @property isDirty
      */
      isDirty: Ember.computed(function() {
        return get(this, 'dirtyModels.length') > 0;
      }).property('dirtyModels.length'),


      /**
        Merge in raw serialized data into this session
        for the corresponding type.

        @method mergeData
        @param {Object} data the raw unserialized data
        @param String [typeKey] the name of the type that the data corresponds to
        @returns {any} the deserialized models that were merged in
      */
      mergeData: function(data, typeKey) {
        return this.adapter.mergeData(data, typeKey, this);
      }

    });
  });
define("epf/setup_container",
  ["./session/session","./session/child_session","./id_manager","./serializers/belongs_to","./serializers/boolean","./serializers/date","./serializers/has_many","./serializers/id","./serializers/number","./serializers/model","./serializers/revision","./serializers/string","./merge_strategies/per_field","./debug/debug_adapter","./rest/rest_adapter","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__, __dependency6__, __dependency7__, __dependency8__, __dependency9__, __dependency10__, __dependency11__, __dependency12__, __dependency13__, __dependency14__, __dependency15__, __exports__) {
    "use strict";
    var Session = __dependency1__["default"];
    var ChildSession = __dependency2__["default"];

    var IdManager = __dependency3__["default"];

    var BelongsToSerializer = __dependency4__["default"];
    var BooleanSerializer = __dependency5__["default"];
    var DateSerializer = __dependency6__["default"];
    var HasManySerializer = __dependency7__["default"];
    var IdSerializer = __dependency8__["default"];
    var NumberSerializer = __dependency9__["default"];
    var ModelSerializer = __dependency10__["default"];
    var RevisionSerializer = __dependency11__["default"];
    var StringSerializer = __dependency12__["default"];

    var PerField = __dependency13__["default"];
    var DebugAdapter = __dependency14__["default"];

    var RestAdapter = __dependency15__["default"];

    __exports__["default"] = function(container, application) {
      setupSession(container, application);
      setupInjections(container, application);
      setupSerializers(container, application);
      setupMergeStrategies(container, application);
      if(Ember.DataAdapter) {
        setupDataAdapter(container, application);
      }
    };

    function setupSession(container, application) {
      container.register('adapter:main', container.lookupFactory('adapter:application') || application && application.Adapter || RestAdapter);
      container.register('session:base',  Session);
      container.register('session:child', ChildSession);
      container.register('session:main', container.lookupFactory('session:application') || application && application.Session || Session);
      container.register('id-manager:main', IdManager);
    }

    function setupInjections(container, application) {
      container.typeInjection('session', 'adapter', 'adapter:main');
      container.typeInjection('serializer', 'idManager', 'id-manager:main');
      container.typeInjection('session', 'idManager', 'id-manager:main');
      container.typeInjection('adapter', 'idManager', 'id-manager:main');

      container.typeInjection('controller', 'adapter', 'adapter:main');
      container.typeInjection('controller', 'session', 'session:main');
      container.typeInjection('route', 'adapter', 'adapter:main');
      container.typeInjection('route', 'session', 'session:main');
      container.typeInjection('data-adapter', 'session', 'session:main');
    };

    function setupSerializers(container, application) {
      container.register('serializer:belongs-to', BelongsToSerializer);
      container.register('serializer:boolean', BooleanSerializer);
      container.register('serializer:date', DateSerializer);
      container.register('serializer:has-many', HasManySerializer);
      container.register('serializer:id', IdSerializer);
      container.register('serializer:number', NumberSerializer);
      container.register('serializer:model', ModelSerializer);
      container.register('serializer:revision', RevisionSerializer);
      container.register('serializer:string', StringSerializer);
    };


    function setupMergeStrategies(container, application) {
      container.register('merge-strategy:per-field', PerField);
      container.register('merge-strategy:default', PerField);
    };

    function setupDataAdapter(container, application) {
      container.register('data-adapter:main', DebugAdapter);
    };
  });
define("epf/utils/isEqual",
  ["exports"],
  function(__exports__) {
    "use strict";
    /**
      Same as Ember.isEqual but supports dates
    */
    __exports__["default"] = function(a, b) {
      if (a && 'function'===typeof a.isEqual) return a.isEqual(b);
      if (a instanceof Date && b instanceof Date) {
        return a.getTime() === b.getTime();
      } 
      return a === b;
    }
  });
define("epf/utils/materialize_relationships",
  ["../collections/model_set","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var get = Ember.get, set = Ember.set;

    var ModelSet = __dependency1__["default"];

    /**
      Given a collection of models, make sure all lazy
      models/relations are replaced with their materialized counterparts
      if they exist within the collection.
    */
    __exports__["default"] = function(models, idManager) {

      if(!(models instanceof ModelSet)) {
        models = ModelSet.fromArray(models);
      }

      models.forEach(function(model) {

        // TODO: does this overwrite non-lazy embedded children?
        model.eachLoadedRelationship(function(name, relationship) {
          if(relationship.kind === 'belongsTo') {
            var child = get(model, name);
            if(child) {
              if(idManager) idManager.reifyClientId(child);
              child = models.getModel(child) || child;
              set(model, name, child);
            }
          } else if(relationship.kind === 'hasMany') {
            // TODO: merge could be per item
            var children = get(model, name);
            var lazyChildren = ModelSet.create();
            lazyChildren.addObjects(children);
            children.clear();
            lazyChildren.forEach(function(child) {
              if(idManager) idManager.reifyClientId(child);
              child = models.getModel(child) || child;
              children.addObject(child);
            });
          }
        }, this);

      }, this);

    }
  });
this.Ep = requireModule("epf")["default"];

})();