export const attachCheckboxFuncs = (
  id: string,
  onChecked: () => void,
  onUnchecked: () => void
) => {
  const checkbox = document.getElementById(id) as HTMLInputElement;
  checkbox.addEventListener("change", () => {
    if (checkbox.checked) onChecked();
    else onUnchecked();
  });
};
