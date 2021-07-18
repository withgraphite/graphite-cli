"use strict";
/**
 * This library reifies typescript types so that we can validate them at runtime.
 *
 * The idea was heavily inspired by https://gcanti.github.io/io-ts/
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.nullable = exports.optional = exports.literals = exports.intersectMany = exports.PluralIntersectionType = exports.unionMany = exports.PluralUnionType = exports.intersection = exports.IntersectionType = exports.union = exports.UnionType = exports.tuple = exports.TupleType = exports.array = exports.ArrayType = exports.shape = exports.ShapeType = exports.nulltype = exports.NullType = exports.boolean = exports.BooleanType = exports.string = exports.StringType = exports.number = exports.NumberType = exports.literal = exports.LiteralType = exports.undefinedtype = exports.UndefinedType = exports.Schema = void 0;
class Schema {
    validate(value) {
        if (this.is(value)) {
            return value;
        }
        return undefined;
    }
}
exports.Schema = Schema;
class UndefinedType extends Schema {
    is(value) {
        return typeof value === "undefined";
    }
}
exports.UndefinedType = UndefinedType;
exports.undefinedtype = new UndefinedType();
class LiteralType extends Schema {
    constructor(inner) {
        super();
        this._inner = inner;
    }
    is(value) {
        // Not entirely correct, b/c you could have a literal dict, but should work for strings, numbers (might be weird around floats), and booleans
        return JSON.stringify(this._inner) === JSON.stringify(value);
    }
}
exports.LiteralType = LiteralType;
function literal(inner) {
    return new LiteralType(inner);
}
exports.literal = literal;
// JSON Types
class NumberType extends Schema {
    is(value) {
        return typeof value === "number";
    }
}
exports.NumberType = NumberType;
exports.number = new NumberType();
class StringType extends Schema {
    is(value) {
        return typeof value === "string";
    }
}
exports.StringType = StringType;
exports.string = new StringType();
class BooleanType extends Schema {
    is(value) {
        return typeof value === "boolean";
    }
}
exports.BooleanType = BooleanType;
exports.boolean = new BooleanType();
class NullType extends Schema {
    is(value) {
        return value === null;
    }
}
exports.NullType = NullType;
exports.nulltype = new NullType();
/**
 * Note: I'm explicitly excluding dictionaries from this library.
 * I have seen very few legitimate uses of dictionaries in API design
 * and more common than not, the use case is better served by a shape
 * or an array.
 */
class ShapeType extends Schema {
    constructor(schema) {
        super();
        this._schema = schema;
    }
    is(value) {
        // This explicitly allows additional keys so that the validated object
        // can be intersected with other shape types (i.e. value is a superset of schema)
        return (typeof value === "object" &&
            value !== null && // one of my fave JS-isms: typeof null === "object"
            Object.keys(this._schema).every((key) => {
                return (this._schema[key] &&
                    this._schema[key].is(value[key]));
            }));
    }
}
exports.ShapeType = ShapeType;
function shape(inner) {
    return new ShapeType(inner);
}
exports.shape = shape;
class ArrayType extends Schema {
    constructor(member) {
        super();
        this._member = member;
    }
    is(value) {
        return (Array.isArray(value) &&
            value.every((v) => {
                return this._member.is(v);
            }));
    }
}
exports.ArrayType = ArrayType;
function array(inner) {
    return new ArrayType(inner);
}
exports.array = array;
// Not technically called out in JSON, but we can use JSON for this
class TupleType extends Schema {
    constructor(schema) {
        super();
        this._schema = schema;
    }
    is(value) {
        return (Array.isArray(value) &&
            value.length === this._schema.length &&
            value.every((v, idx) => {
                return this._schema[idx].is(v);
            }));
    }
}
exports.TupleType = TupleType;
function tuple(inner) {
    return new TupleType(inner);
}
exports.tuple = tuple;
// Typescript Nonsense
class UnionType extends Schema {
    constructor(left, right) {
        super();
        this._left = left;
        this._right = right;
    }
    is(value) {
        return this._left.is(value) || this._right.is(value);
    }
}
exports.UnionType = UnionType;
function union(left, right) {
    return new UnionType(left, right);
}
exports.union = union;
class IntersectionType extends Schema {
    constructor(left, right) {
        super();
        this._left = left;
        this._right = right;
    }
    is(value) {
        return this._left.is(value) && this._right.is(value);
    }
}
exports.IntersectionType = IntersectionType;
function intersection(left, right) {
    return new IntersectionType(left, right);
}
exports.intersection = intersection;
class PluralUnionType extends Schema {
    constructor(inner) {
        super();
        this._inner = inner;
    }
    is(value) {
        return this._inner.some((schema) => {
            return schema.is(value);
        });
    }
}
exports.PluralUnionType = PluralUnionType;
function unionMany(inner) {
    return new PluralUnionType(inner);
}
exports.unionMany = unionMany;
class PluralIntersectionType extends Schema {
    constructor(inner) {
        super();
        this._inner = inner;
    }
    is(value) {
        return this._inner.every((schema) => {
            return schema.is(value);
        });
    }
}
exports.PluralIntersectionType = PluralIntersectionType;
function intersectMany(inner) {
    return new PluralIntersectionType(inner);
}
exports.intersectMany = intersectMany;
// Helpers
function literals(
// See below for why we exclude booleans here
inners) {
    return unionMany(inners.map((value) => {
        // Note: we intentionally don't use literal(). The reason is that would
        // break literals([true, false] as const)
        //
        // This is because when we call literal() we need to know what type it's being
        // called with (b/c there is only one lambda in the map), and so logically that
        // type is inferred as the union of all members of the array. When we pass this function
        // an array that contains both true and false, the type of literal is infered as
        // literal<true|false>(value: NonGeneric<true|false>), our mistake catching code in
        // NonGeneric detects that boolean extends true|false and flags it (assuming you simply
        // called literal() without as const, e.g. literal(false) errors b/c it gets infered to
        // literal<boolean>(false))
        return new LiteralType(value);
    }));
}
exports.literals = literals;
function optional(inner) {
    return union(inner, exports.undefinedtype);
}
exports.optional = optional;
function nullable(inner) {
    return union(inner, exports.nulltype);
}
exports.nullable = nullable;
//# sourceMappingURL=index.js.map