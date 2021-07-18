import yargs from "yargs";
export default abstract class AbstractCommand<T extends {
    [key: string]: yargs.Options;
}> {
    abstract _execute(argv: Omit<yargs.Arguments<yargs.InferredOptionTypes<T>>, "$0" | "_">): Promise<void>;
    execute(argv: yargs.Arguments<yargs.InferredOptionTypes<T>>): Promise<void>;
    executeUnprofiled(argv: Omit<yargs.Arguments<yargs.InferredOptionTypes<T>>, "$0" | "_">): Promise<void>;
}
