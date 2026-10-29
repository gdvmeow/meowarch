// Estimate natural image heights in the widest 7:5 catalog grid. The split is
// stable across languages and resizes, so cards never jump between rails.
const shellWidth = 1320;
const columnGap = 32;
const railGap = 64;
const rightOffset = 32;
const captionHeight = 85; // Image-to-title gap, one title line, category gap and caption.
const leftWidth = (shellWidth - columnGap) * 7 / 12;
const rightWidth = (shellWidth - columnGap) * 5 / 12;

function cardHeight(project, width) {
  const image = project.cover ?? project.images[0];
  return width * image.height / image.width + captionHeight;
}

export function balancedRailBreak(projects) {
  if (projects.length < 2) return projects.length;
  let leftHeight = 0;
  let rightHeight = projects.reduce((height, project) => height + cardHeight(project, rightWidth), 0);
  let bestBreak = 1;
  let smallestDifference = Infinity;

  for (let boundary = 1; boundary < projects.length; boundary++) {
    const project = projects[boundary - 1];
    leftHeight += cardHeight(project, leftWidth);
    rightHeight -= cardHeight(project, rightWidth);
    const leftTotal = leftHeight + railGap * (boundary - 1);
    const rightTotal = rightHeight + railGap * (projects.length - boundary - 1) + rightOffset;
    const difference = Math.abs(leftTotal - rightTotal);
    if (difference < smallestDifference) {
      smallestDifference = difference;
      bestBreak = boundary;
    }
  }
  return bestBreak;
}
