const buttonsAndModals = [
  { button: "info-button", modal: "info-modal" },
  { button: "stats-button", modal: "stats-modal" },
  { button: "settings-button", modal: "settings-modal" },
];

buttonsAndModals.forEach((pair) => {
  const button = document.getElementById(pair.button) as HTMLButtonElement;
  const modal = document.getElementById(pair.modal) as HTMLDialogElement;
  button.addEventListener("click", () => {
    if (modal.style.display === "flex") modal.style.display = "none";
    else modal.style.display = "flex";
  });

  modal.addEventListener("click", (event) => {
    const target = event.target;
    if (target === modal) modal.style.display = "none";
  });

  document.addEventListener("keydown", (event: KeyboardEvent) => {
    const key = event.key;
    if (key === "Escape") modal.style.display = "none";
  });
});
