import prompts from 'prompts';

// eventually we should wrap the whole prompts library in an abstraction
// for now let's move common logic here

export const suggest = (
  input: string,
  choices: prompts.Choice[]
): prompts.Choice[] =>
  choices.filter((c: prompts.Choice) =>
    c.value.toLocaleLowerCase().includes(input.toLocaleLowerCase())
  );
