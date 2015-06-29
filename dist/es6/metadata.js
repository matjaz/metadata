const theGlobal = (function() {
  // Workers don’t have `window`, only `self`
  if (typeof self !== 'undefined') {
    return self;
  }

  if (typeof global !== 'undefined') {
    return global;
  }

  // Not all environments allow eval and Function
  // Use only as a last resort:
  return new Function('return this')();
})();

const emptyMetadata = Object.freeze({});
const metadataContainerKey = '__metadata__';

if(typeof theGlobal.System === 'undefined'){
  theGlobal.System = {};
}

if(typeof System.forEachModule === 'undefined'){
  System.forEachModule = function(){};
}

if(typeof theGlobal.Reflect === 'undefined'){
  theGlobal.Reflect = {};
}

if(typeof Reflect.getOwnMetadata === 'undefined'){
  Reflect.getOwnMetadata = function(metadataKey, target, targetKey){
    return ((target[metadataContainerKey] || emptyMetadata)[targetKey] || emptyMetadata)[metadataKey];
  };
}

if(typeof Reflect.defineMetadata === 'undefined'){
  Reflect.defineMetadata = function(metadataKey, metadataValue, target, targetKey){
    var metadataContainer = target[metadataContainerKey] || (target[metadataContainerKey] = {});
    var targetContainer = metadataContainer[targetKey] || (metadataContainer[targetKey] = {});
    targetContainer[metadataKey] = metadataValue;
  };
}

if(typeof Reflect.metadata === 'undefined'){
  Reflect.metadata = function(metadataKey, metadataValue){
    return function(target, targetKey){
      Reflect.defineMetadata(metadataKey, metadataValue, target, targetKey);
    };
  };
}

function ensureDecorators(target){
  var applicator;

  if(typeof target.decorators === 'function'){
    applicator = target.decorators();
  }else{
    applicator = target.decorators;
  }

  if(typeof applicator._decorate === 'function'){
    delete target.decorators;
    applicator._decorate(target);
  }else{
    throw new Error('The return value of your decorator\'s method was not valid.');
  }
}

/**
* Provides helpers for working with metadata.
*
* @class Metadata
* @static
*/
export var Metadata = {
  global: theGlobal,
  resource:'aurelia:resource',
  paramTypes:'design:paramtypes',
  properties:'design:properties',
  get(metadataKey, target, targetKey){
    if(!target){
      return undefined;
    }

    let result = Metadata.getOwn(metadataKey, target, targetKey);
    return result === undefined ? Metadata.get(metadataKey, Object.getPrototypeOf(target), targetKey) : result;
  },
  getOwn(metadataKey, target, targetKey){
    if(!target){
      return undefined;
    }

    if(target.hasOwnProperty('decorators')){
      ensureDecorators(target);
    }

    return Reflect.getOwnMetadata(metadataKey, target, targetKey);
  },
  define(metadataKey, metadataValue, target, targetKey){
    Reflect.defineMetadata(metadataKey, metadataValue, target, targetKey);
  },
  getOrCreateOwn(metadataKey, Type, target, targetKey){
    let result = Metadata.getOwn(metadataKey, target, targetKey);

    if(result === undefined){
      result = new Type();
      Reflect.defineMetadata(metadataKey, result, target, targetKey);
    }

    return result;
  }
}
