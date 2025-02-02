let nextBoxNumber = 1000; // Start unique numbers from 1000
let undoStack = []; // For undo actions
let redoStack = []; // For redo actions
let currentDrag = null; // Current box being dragged
let sourceCell = null; // The cell from which the box is dragged

function init() {
  // Set box colors when the page loads
  assignColorsToBoxes();

  // Setup drag-and-drop for boxes
  const boxes = document.querySelectorAll(".box");
  boxes.forEach((box) => {
    box.addEventListener("dragstart", handleDragStart);
    box.addEventListener("dragend", handleDragEnd);
  });

  // Setup drag-and-drop for table cells
  const cells = document.querySelectorAll("#dragDropTable td");
  cells.forEach((cell) => {
    cell.addEventListener("dragover", handleDragOver);
    cell.addEventListener("drop", handleDrop);
  });

  // Add button event listeners
  document.getElementById("addRowButton").addEventListener("click", addRow);
  document.getElementById("undoButton").addEventListener("click", undo);
  document.getElementById("redoButton").addEventListener("click", redo);
}

// Function to assign random colors to existing boxes
function assignColorsToBoxes() {
  const boxes = document.querySelectorAll(".box");
  boxes.forEach((box) => {
    box.style.backgroundColor = getRandomColor(); // Assign a random color to each existing box
  });
}

function handleDragStart(event) {
  currentDrag = event.target;
  sourceCell = currentDrag.parentElement;
  setTimeout(() => {
    currentDrag.style.opacity = "0.5"; // Fade effect
  }, 0);
}

function handleDragEnd(event) {
  event.target.style.opacity = "1"; // Reset opacity
  currentDrag = null; // Clear the current drag reference
}

function handleDragOver(event) {
  event.preventDefault(); // Necessary to allow the drop
}

function handleDrop(event) {
  event.preventDefault(); // Prevent default behavior for the drop
  const targetCell = event.target.closest("td");

  if (targetCell && targetCell !== sourceCell) {
    const targetBox = targetCell.querySelector(".box");
    undoStack.push({
      action: "swap",
      sourceId: currentDrag.id,
      targetId: targetBox ? targetBox.id : null,
    });
    redoStack = []; // Clear redo stack on new action
    swapBoxes(currentDrag, targetBox);
  }
}

function swapBoxes(draggable, target) {
  if (target) {
    // Swap boxes if the target box exists
    const tempId = draggable.id;
    const tempContent = draggable.innerHTML;
    const tempColor = draggable.style.backgroundColor;

    draggable.id = target.id;
    draggable.innerHTML = target.innerHTML;
    draggable.style.backgroundColor = target.style.backgroundColor;

    target.id = tempId;
    target.innerHTML = tempContent;
    target.style.backgroundColor = tempColor;
  } else {
    // If dropping in an empty cell, just move the box
    const targetCell = target.parentElement;
    targetCell.appendChild(draggable);
  }
}

function addRow() {
  const table = document.getElementById("dragDropTable");
  const newRow = table.insertRow();

  for (let i = 0; i < 3; i++) {
    const newCell = newRow.insertCell();
    const newBox = document.createElement("div");
    newBox.className = "box";
    newBox.id = "box" + nextBoxNumber++;
    newBox.draggable = "true";
    newBox.innerHTML = newBox.id; // Use the box id as content
    newBox.style.backgroundColor = getRandomColor(); // Assign a random color to the new box
    newCell.appendChild(newBox);

    // Attach event listeners to the new box
    newBox.addEventListener("dragstart", handleDragStart);
    newBox.addEventListener("dragend", handleDragEnd);
  }

  undoStack.push({ action: "addRow", row: newRow.rowIndex });
  redoStack = []; // Clear redo stack since a new action is performed
}

function undo() {
  const lastAction = undoStack.pop();
  if (!lastAction) return;

  if (lastAction.action === "swap") {
    const sourceBox = document.getElementById(lastAction.sourceId);
    const targetBox = lastAction.targetId
      ? document.getElementById(lastAction.targetId)
      : null;
    swapBoxes(targetBox, sourceBox);
    redoStack.push(lastAction);
  } else if (lastAction.action === "addRow") {
    const rowToRemove =
      document.getElementById("dragDropTable").rows[lastAction.row];
    rowToRemove.remove();
    redoStack.push(lastAction);
  }
}

function redo() {
  const lastAction = redoStack.pop();
  if (!lastAction) return;

  if (lastAction.action === "swap") {
    const sourceBox = document.getElementById(lastAction.sourceId);
    const targetBox = lastAction.targetId
      ? document.getElementById(lastAction.targetId)
      : null;
    swapBoxes(sourceBox, targetBox);
    undoStack.push(lastAction);
  } else if (lastAction.action === "addRow") {
    addRow();
    undoStack.push(lastAction);
  }
}

function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// Initialize the functionality
window.onload = init;
