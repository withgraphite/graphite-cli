/**
 * This library reifies typescript types so that we can validate them at runtime.
 *
 * The idea was heavily inspired by https://gcanti.github.io/io-ts/
 */
export declare abstract class Schema<TInner> {
    readonly _TInner: TInner;
    abstract is(value: unknown): value is TInner;
    validate(value: unknown): TInner | undefined;
}
export declare type TypeOf<A extends Schema<unknown>> = A["_TInner"];
export declare type UnwrapSchemaMap<TSchemaMap> = keyof TSchemaMap extends never ? {
    [K in any]: undefined;
} : {
    [SchemaMapIndex in keyof TSchemaMap]: TSchemaMap[SchemaMapIndex] extends Schema<unknown> ? TypeOf<TSchemaMap[SchemaMapIndex]> : never;
};
export declare class UndefinedType extends Schema<undefined> {
    is(value: unknown): value is undefined;
}
export declare const undefinedtype: UndefinedType;
declare type Extends<A, B> = [A] extends [B] ? true : false;
declare type NonGenericExceptBooleans<A> = true extends Extends<string, A> | Extends<number, A> ? never : A;
declare type NonGeneric<A> = true extends Extends<boolean, A> ? never : NonGenericExceptBooleans<A>;
export declare class LiteralType<TInner> extends Schema<TInner> {
    _inner: TInner;
    constructor(inner: TInner);
    is(value: unknown): value is TInner;
}
export declare function literal<TInner>(inner: NonGeneric<TInner>): LiteralType<NonGeneric<TInner>>;
export declare class NumberType extends Schema<number> {
    is(value: unknown): value is number;
}
export declare const number: NumberType;
export declare class StringType extends Schema<string> {
    is(value: unknown): value is string;
}
export declare const string: StringType;
export declare class BooleanType extends Schema<boolean> {
    is(value: unknown): value is boolean;
}
export declare const boolean: BooleanType;
export declare class NullType extends Schema<null> {
    is(value: unknown): value is null;
}
export declare const nulltype: NullType;
/**
 * Note: I'm explicitly excluding dictionaries from this library.
 * I have seen very few legitimate uses of dictionaries in API design
 * and more common than not, the use case is better served by a shape
 * or an array.
 */
export declare class ShapeType<TDefnSchema extends {
    [key: string]: Schema<unknown>;
}, TDefn extends {
    [DefnIndex in keyof TDefnSchema]: TypeOf<TDefnSchema[DefnIndex]>;
}> extends Schema<TDefn> {
    _schema: TDefnSchema;
    constructor(schema: TDefnSchema);
    is(value: unknown): value is TDefn;
}
export declare function shape<TInner extends {
    [key: string]: Schema<unknown>;
}>(inner: TInner): ShapeType<TInner, { [DefnIndex in keyof TInner]: TypeOf<TInner[DefnIndex]>; }>;
export declare class ArrayType<TMember> extends Schema<TMember[]> {
    _member: Schema<TMember>;
    constructor(member: Schema<TMember>);
    is(value: unknown): value is TMember[];
}
export declare function array<TInner>(inner: Schema<TInner>): ArrayType<TInner>;
export declare class TupleType<TDefnSchema extends readonly Schema<unknown>[], TDefn extends {
    [DefnIndex in keyof TDefnSchema]: TDefnSchema[DefnIndex] extends Schema<unknown> ? TypeOf<TDefnSchema[DefnIndex]> : never;
} & {
    length: TDefnSchema["length"];
}> extends Schema<TDefn> {
    _schema: TDefnSchema;
    constructor(schema: TDefnSchema);
    is(value: unknown): value is TDefn;
}
export declare function tuple<TInner extends readonly Schema<unknown>[]>(inner: TInner): TupleType<TInner, { [DefnIndex in keyof TInner]: TInner[DefnIndex] extends Schema<unknown> ? TypeOf<TInner[DefnIndex]> : never; } & {
    length: TInner["length"];
}>;
export declare class UnionType<TLeft, TRight> extends Schema<TLeft | TRight> {
    _left: Schema<TLeft>;
    _right: Schema<TRight>;
    constructor(left: Schema<TLeft>, right: Schema<TRight>);
    is(value: unknown): value is TLeft | TRight;
}
export declare function union<TLeft, TRight>(left: Schema<TLeft>, right: Schema<TRight>): UnionType<TLeft, TRight>;
export declare class IntersectionType<TLeft, TRight> extends Schema<TLeft & TRight> {
    _left: Schema<TLeft>;
    _right: Schema<TRight>;
    constructor(left: Schema<TLeft>, right: Schema<TRight>);
    is(value: unknown): value is TLeft & TRight;
}
export declare function intersection<TLeft, TRight>(left: Schema<TLeft>, right: Schema<TRight>): IntersectionType<TLeft, TRight>;
export declare class PluralUnionType<TSchema extends Schema<unknown>, TInnerSchemaType extends TypeOf<TSchema>> extends Schema<TInnerSchemaType> {
    _inner: TSchema[];
    constructor(inner: TSchema[]);
    is(value: unknown): value is TInnerSchemaType;
}
export declare function unionMany<TSchema extends Schema<unknown>>(inner: TSchema[]): PluralUnionType<TSchema, TypeOf<TSchema>>;
declare type TPluralIntersectionType<T> = (T extends Schema<infer U> ? (k: U) => void : never) extends (k: infer I) => void ? I : never;
export declare class PluralIntersectionType<TSchema extends Schema<unknown>, TInnerSchemaType extends TPluralIntersectionType<TSchema>> extends Schema<TInnerSchemaType> {
    _inner: TSchema[];
    constructor(inner: TSchema[]);
    is(value: unknown): value is TInnerSchemaType;
}
export declare function intersectMany<TSchema extends Schema<unknown>>(inner: TSchema[]): PluralIntersectionType<TSchema, TPluralIntersectionType<TSchema>>;
export declare function literals<TLiterals>(inners: readonly NonGenericExceptBooleans<TLiterals>[]): PluralUnionType<LiteralType<NonGenericExceptBooleans<TLiterals>>, NonGenericExceptBooleans<TLiterals>>;
export declare function optional<TInner>(inner: Schema<TInner>): UnionType<TInner, undefined>;
export declare function nullable<TInner>(inner: Schema<TInner>): UnionType<TInner, null>;
export {};
