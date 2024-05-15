export const randomCountries = (countries: string[]): string[] => {
  for (let i = countries.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [countries[i], countries[j]] = [countries[j], countries[i]];
  }

  return [countries[0], countries[1]];
};
