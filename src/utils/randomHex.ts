export const randomHexColour = (): string =>
  `#${Math.round(Math.random() * Math.pow(2, 24))
    .toString(16)
    .padStart(6, "0")}`;
