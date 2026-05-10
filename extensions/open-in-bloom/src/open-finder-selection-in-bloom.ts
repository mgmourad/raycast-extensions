import { getSelectedFinderItems, showToast, Toast, showHUD } from "@raycast/api";
import { openInBloom } from "./utils";
import path from "path";

export default async function OpenFinderSelectionInBloom() {
  let selectedItems;

  try {
    selectedItems = await getSelectedFinderItems();
  } catch {
    await showToast({
      style: Toast.Style.Failure,
      title: "Finder is not in the foreground",
      message:
        "Click on a Finder window first, select your files, then run this command. " +
        "Or use 'Open Clipboard Path in Bloom' instead.",
    });
    return;
  }

  if (!selectedItems || selectedItems.length === 0) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Nothing selected",
      message: "Select one or more files in Finder, then run this command.",
    });
    return;
  }

  let successCount = 0;
  for (const item of selectedItems) {
    const success = await openInBloom(item.path);
    if (success) successCount++;
  }

  if (successCount > 0) {
    const label =
      successCount === 1
        ? `"${path.basename(selectedItems[0].path)}"`
        : `${successCount} items`;
    await showHUD(`Opened ${label} in Bloom`);
  }
}
