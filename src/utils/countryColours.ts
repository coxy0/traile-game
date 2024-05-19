export const getPolygonCapColor = (feature: {
  properties: { ISO_A3: string };
}): string => {
  switch (feature.properties.ISO_A3) {
    case "USA":
      return "rgba(0, 0, 255, 0.6)";
    case "CAN":
      return "rgba(255, 0, 0, 0.6)";
    case "MEX":
      return "rgba(0, 255, 0, 0.6)";
    default:
      return "rgba(255, 255, 255, 0.6)";
  }
};
