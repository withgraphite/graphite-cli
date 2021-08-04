import { ExitFailedError } from "../errors";

export function firstSemverIsNewer(
  firstSemver: string,
  secondSemver: string
): boolean {
  const firstComps = firstSemver.split(".").map(parseInt);
  const secondComps = firstSemver.split(".").map(parseInt);
  if (firstComps.length !== 3 || secondComps.length !== 3) {
    throw new ExitFailedError(
      `Malformed semvers: ${firstSemver}, ${secondSemver}`
    );
  }
  return (
    firstComps[0] > secondComps[0] ||
    (firstComps[0] === secondComps[0] && firstComps[1] > secondComps[1]) ||
    (firstComps[0] === secondComps[0] &&
      firstComps[1] === secondComps[1] &&
      firstComps[2] > secondComps[2])
  );
}
