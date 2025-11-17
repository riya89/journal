import { uploadBadge } from "./src/services/uploadBadges.js";

const badges = [
  "badge1.png",
  "badge2.png",
  "badge3.png",
  "badge4.png",
  "badge5.png",
  "badge6.png",
  "badge7.png",
  "badge8.png",
];


async function main() {
  for (const file of badges) {
    console.log("Uploading:", file);
    await uploadBadge(file, file);
    console.log("✔ Uploaded:", file);
  }
}

main();
